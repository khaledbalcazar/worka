import "server-only";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { getAdminClient } from "@/lib/supabase/admin";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { CANONICAL_URL } from "@/lib/supabase/config";
import { planDisplayName, requestMoney, type Product } from "@/lib/plans";
import { codeFromBytes, type Receipt, type ReceiptItem } from "@/lib/receipts";

// Emisión y lectura de recibos digitales (sin valor fiscal). Se emiten con
// el cliente de servicio al confirmar un pago: nadie puede crearse un recibo
// propio desde la API (la tabla no tiene política de insert).

export function verifyUrl(code: string): string {
  return `${CANONICAL_URL}/verificar/${code}`;
}

export async function receiptQrSvg(code: string): Promise<string> {
  return QRCode.toString(verifyUrl(code), { type: "svg", margin: 0, errorCorrectionLevel: "M", width: 168 });
}

function day(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Asuncion" });
}

async function customerOf(userId: string): Promise<{ name: string; doc: string | null; email: string | null }> {
  const admin = getAdminClient()!;
  const [{ data: company }, { data: candidate }, { data: auth }] = await Promise.all([
    admin.from("companies").select("company_name, ruc").eq("id", userId).maybeSingle(),
    admin.from("candidates").select("full_name").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  return {
    name: company?.company_name || candidate?.full_name || "Cliente de Worka",
    doc: company?.ruc ?? null,
    email: auth?.user?.email ?? null,
  };
}

async function insertReceipt(row: Record<string, unknown>): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = codeFromBytes(randomBytes(20));
    const { data, error } = await admin.from("receipts").insert({ ...row, code }).select("id").single();
    if (!error) return data.id as string;
    // Código repetido (muy improbable): se reintenta con otro.
    if (!/duplicate|unique/i.test(error.message)) {
      console.error(`[worka:receipts] insert failed: ${error.message}`);
      return null;
    }
  }
  return null;
}

// Recibo de un plan pagado. Devuelve el id (o el del recibo ya emitido).
export async function issuePaymentReceipt(paymentRequestId: string, period: { from: string; to: string } | null): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data: existing } = await admin.from("receipts").select("id").eq("payment_request_id", paymentRequestId).maybeSingle();
  if (existing) return existing.id as string;
  const { data: req } = await admin.from("payment_requests").select("*").eq("id", paymentRequestId).maybeSingle();
  if (!req) return null;

  const customer = await customerOf(req.user_id);
  const money = requestMoney(req);
  const months = Number(req.months);
  const item: ReceiptItem = {
    description: `${planDisplayName(req.product as Product, req.plan)} · ${months} ${months === 1 ? "mes" : "meses"}${period ? ` (del ${day(period.from)} al ${day(period.to)})` : ""}`,
    quantity: 1,
    unit_price: money.amount,
    total: money.amount,
  };
  return insertReceipt({
    user_id: req.user_id,
    payment_request_id: req.id,
    customer_name: (req.billing_name as string | null)?.trim() || customer.name,
    customer_doc: (req.billing_doc as string | null)?.trim() || customer.doc,
    customer_email: customer.email,
    items: [item],
    currency: money.currency,
    total: money.amount,
    total_gs: req.amount_gs,
    payment_reference: req.reference ?? null,
  });
}

// Recibo de un destaque pago (Potenciar).
export async function issueBoostReceipt(boostRequestId: string): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data: existing } = await admin.from("receipts").select("id").eq("boost_request_id", boostRequestId).maybeSingle();
  if (existing) return existing.id as string;
  const { data: boost } = await admin
    .from("boost_requests")
    .select("id, company_id, plan, price_gs, job:jobs(title)")
    .eq("id", boostRequestId)
    .maybeSingle();
  if (!boost) return null;
  const customer = await customerOf(boost.company_id);
  const title = (boost.job as unknown as { title?: string } | null)?.title;
  const item: ReceiptItem = {
    description: `Vacante destacada · ${boost.plan}${title ? ` · «${title}»` : ""}`,
    quantity: 1,
    unit_price: boost.price_gs,
    total: boost.price_gs,
  };
  return insertReceipt({
    user_id: boost.company_id,
    boost_request_id: boost.id,
    customer_name: customer.name,
    customer_doc: customer.doc,
    customer_email: customer.email,
    items: [item],
    currency: "PYG",
    total: boost.price_gs,
    total_gs: boost.price_gs,
  });
}

// Un recibo para verlo o imprimirlo: el dueño o el admin.
export async function getReceiptForViewer(id: string): Promise<Receipt | null> {
  const supabase = await getServerClient();
  if (!supabase) return demoReceipt(id);
  const user = await getCurrentUser();
  if (!user) return null;
  // RLS deja leer los propios; el admin ve todos.
  const { data } = await supabase.from("receipts").select("*").eq("id", id).maybeSingle();
  if (data) return normalize(data);
  // Miembro del equipo de la empresa: el recibo está a nombre de la empresa.
  const admin = getAdminClient();
  if (!admin) return null;
  const { data: row } = await admin.from("receipts").select("*").eq("id", id).maybeSingle();
  if (!row) return null;
  const { data: member } = await admin
    .from("company_members")
    .select("id")
    .eq("company_id", row.user_id)
    .eq("member_id", user.id)
    .eq("status", "activa")
    .in("role", ["administrador"])
    .maybeSingle();
  return member ? normalize(row) : null;
}

// Recibos de un usuario indexados por aviso de pago / destaque.
export async function getReceiptIdsFor(userId: string): Promise<{ byPayment: Map<string, string>; byBoost: Map<string, string> }> {
  const empty = { byPayment: new Map<string, string>(), byBoost: new Map<string, string>() };
  const db = getAdminClient() ?? (await getServerClient());
  if (!db) return empty;
  const { data, error } = await db.from("receipts").select("id, payment_request_id, boost_request_id").eq("user_id", userId).limit(200);
  if (error || !data) return empty;
  for (const r of data as { id: string; payment_request_id: string | null; boost_request_id: string | null }[]) {
    if (r.payment_request_id) empty.byPayment.set(r.payment_request_id, r.id);
    if (r.boost_request_id) empty.byBoost.set(r.boost_request_id, r.id);
  }
  return empty;
}

function normalize(row: Record<string, unknown>): Receipt {
  return {
    ...(row as unknown as Receipt),
    number: Number(row.number),
    total: Number(row.total),
    total_gs: Number(row.total_gs),
    items: (Array.isArray(row.items) ? row.items : []) as ReceiptItem[],
  };
}

function demoReceipt(id: string): Receipt {
  return {
    id,
    number: 1,
    code: "WK7Q3M9XA2BC4DEF5GHJ",
    user_id: "demo",
    customer_name: "Supermercados Guaraní S.A.",
    customer_doc: "80012345-6",
    customer_email: "rrhh@superguarani.com.py",
    items: [{ description: "Worka Enterprise Pro · Pro · 3 meses (del 13/10/2026 al 13/01/2027)", quantity: 1, unit_price: 750000, total: 750000 }],
    currency: "PYG",
    total: 750000,
    total_gs: 750000,
    payment_reference: "004512339",
    status: "emitido",
    issued_at: new Date().toISOString(),
  };
}

// Verificación pública (QR).
export async function verifyReceipt(code: string): Promise<{
  number: number;
  issued_at: string;
  customer: string;
  concept: string;
  currency: string;
  total: number;
  status: string;
} | null> {
  const supabase = await getServerClient();
  if (!supabase) {
    const d = demoReceipt("demo");
    return code.replace(/\s+/g, "").toUpperCase() === d.code
      ? { number: 1, issued_at: d.issued_at, customer: "Supermercados G.", concept: d.items[0].description, currency: "PYG", total: d.total, status: "emitido" }
      : null;
  }
  const { data } = await supabase.rpc("fn_verify_receipt", { p_code: code });
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    number: Number(row.number),
    issued_at: String(row.issued_at),
    customer: String(row.customer ?? ""),
    concept: String(row.concept ?? ""),
    currency: String(row.currency ?? "PYG"),
    total: Number(row.total),
    status: String(row.status ?? "emitido"),
  };
}

export type ReceiptSummary = { id: string; number: number; issued_at: string; currency: string; total: number; description: string; status: string };

// Recibos de un usuario (o empresa) para listarlos.
export async function listReceipts(userId: string): Promise<ReceiptSummary[]> {
  const supabase = await getServerClient();
  if (!supabase) {
    const d = demoReceipt("demo");
    return [{ id: d.id, number: d.number, issued_at: d.issued_at, currency: d.currency, total: d.total, description: d.items[0].description, status: d.status }];
  }
  const db = getAdminClient() ?? supabase;
  const { data, error } = await db
    .from("receipts")
    .select("id, number, issued_at, currency, total, items, status")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    number: Number(r.number),
    issued_at: String(r.issued_at),
    currency: String(r.currency),
    total: Number(r.total),
    description: ((r.items as ReceiptItem[] | null)?.[0]?.description ?? "Compra en Worka"),
    status: String(r.status),
  }));
}
