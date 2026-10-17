import "server-only";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import * as mock from "@/lib/mock-data";
import {
  enterpriseLimits,
  startOfMonth,
  WORKA_PRO,
  type EnterpriseLimits,
  type EnterprisePlanId,
  type Product,
} from "@/lib/plans";

// Lectura de planes y consumo del lado servidor. Las reglas (qué incluye
// cada plan) viven en lib/plans.ts; acá solo se consulta la base.

export type SubscriptionRow = {
  id: string;
  user_id: string;
  product: Product;
  plan: string;
  status: "activa" | "cancelada";
  starts_at: string;
  ends_at: string;
  created_at: string;
  // Código de la promoción con que se activó (migración 049).
  promo_code?: string | null;
};

export type PaymentRequestRow = {
  id: string;
  user_id: string;
  product: Product;
  plan: string;
  months: number;
  amount_gs: number;
  // Moneda y monto en la moneda del país (migración 048).
  currency?: string | null;
  amount_local?: number | null;
  billing_name?: string | null;
  billing_doc?: string | null;
  reference: string | null;
  status: "pendiente" | "aprobada" | "rechazada";
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
};

async function activePlan(userId: string, product: Product): Promise<string | null> {
  const supabase = await getServerClient();
  if (!supabase) {
    if (product === "enterprise") return mock.demoPlans.enterprise;
    return mock.demoPlans.pro ? "pro" : null;
  }
  const { data, error } = await supabase.rpc("fn_active_plan", { p_user: userId, p_product: product });
  if (error) {
    // Sin la migración 047 la función no existe: se trata como sin plan.
    console.error(`[worka:plans] fn_active_plan failed: ${error.message}`);
    return null;
  }
  return (data as string | null) ?? null;
}

export async function getEnterprisePlanId(companyId: string): Promise<EnterprisePlanId> {
  const plan = await activePlan(companyId, "enterprise");
  return plan === "pro" || plan === "empresa" ? plan : "gratis";
}

export async function getEnterpriseLimits(companyId: string): Promise<EnterpriseLimits> {
  return enterpriseLimits(await getEnterprisePlanId(companyId));
}

export async function isWorkaPro(userId: string): Promise<boolean> {
  return (await activePlan(userId, "pro")) === "pro";
}

export async function isCurrentUserPro(): Promise<boolean> {
  const supabase = await getServerClient();
  if (!supabase) return mock.demoPlans.pro;
  const user = await getCurrentUser();
  return user ? isWorkaPro(user.id) : false;
}

// Suscripción vigente (la que vence más tarde) del usuario para un producto.
export async function getCurrentSubscription(userId: string, product: Product): Promise<SubscriptionRow | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("product", product)
    .eq("status", "activa")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

// Para una empresa, la suscripción vive a nombre de la empresa (no del
// miembro del equipo que entra): RLS solo deja leerla al dueño, así que se
// usa el cliente de servicio después de saber de qué empresa es la persona.
export async function getCompanySubscription(companyId: string): Promise<SubscriptionRow | null> {
  const admin = getAdminClient();
  if (!admin) {
    // Demo: el plan de ejemplo se muestra como activado con la promoción.
    if (!(await getServerClient()) && mock.demoPlans.enterprise !== "gratis") {
      const start = new Date(Date.now() - 2 * 86400000);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 3);
      return {
        id: "demo-sub",
        user_id: companyId,
        product: "enterprise",
        plan: mock.demoPlans.enterprise,
        status: "activa",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        created_at: start.toISOString(),
        promo_code: "WORKA3PRO",
      };
    }
    return getCurrentSubscription(companyId, "enterprise");
  }
  const { data } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", companyId)
    .eq("product", "enterprise")
    .eq("status", "activa")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export async function getPaymentRequestsFor(userId: string, product: Product): Promise<PaymentRequestRow[]> {
  const admin = getAdminClient();
  const supabase = admin ?? (await getServerClient());
  if (!supabase) return [];
  const { data } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", userId)
    .eq("product", product)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as PaymentRequestRow[];
}

// Uso del mes de los beneficios con cupo (destaques y alertas urgentes).
export async function getPromotionUsage(companyId: string): Promise<{ boosts: number; urgentAlerts: number }> {
  const admin = getAdminClient();
  if (!admin) return { boosts: 0, urgentAlerts: 0 };
  const { data } = await admin
    .from("job_promotions")
    .select("kind")
    .eq("company_id", companyId)
    .gte("created_at", startOfMonth());
  const rows = (data ?? []) as { kind: string }[];
  return {
    boosts: rows.filter((r) => r.kind === "boost").length,
    urgentAlerts: rows.filter((r) => r.kind === "urgent_alert").length,
  };
}

// Vacantes publicadas ahora (activas y vigentes) de una empresa.
export async function countListedJobs(companyId: string): Promise<number> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getActiveJobs().filter((j) => j.company_id === companyId).length;
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "Activo")
    .gt("expires_at", new Date().toISOString());
  return count ?? 0;
}

// Uso de la IA de Worka Pro en el mes.
export async function getAiUsage(userId: string): Promise<{ cvReviews: number; interview: number }> {
  const admin = getAdminClient();
  if (!admin) return { cvReviews: 0, interview: 0 };
  const { data } = await admin
    .from("ai_usage")
    .select("kind")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth());
  const rows = (data ?? []) as { kind: string }[];
  return {
    cvReviews: rows.filter((r) => r.kind === "cv_review").length,
    interview: rows.filter((r) => r.kind === "interview").length,
  };
}

// Cupo mensual de llamadas a la IA del simulador: 10 entrevistas, cada una
// con una llamada para las preguntas y hasta 5 devoluciones.
export const INTERVIEW_CALLS_PER_MONTH = WORKA_PRO.limits.interviewSessionsPerMonth * 6;

// ¿Puede la empresa publicar (o reactivar) una vacante más? null = sí.
export async function listingLimitError(companyId: string, excludeJobId?: string): Promise<string | null> {
  const limits = await getEnterpriseLimits(companyId);
  if (limits.maxListedJobs === null) return null;
  const supabase = await getServerClient();
  if (!supabase) return null;
  let q = supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "Activo")
    .gt("expires_at", new Date().toISOString());
  if (excludeJobId) q = q.neq("id", excludeJobId);
  const { count } = await q;
  if ((count ?? 0) < limits.maxListedJobs) return null;
  return `Con el plan Gratis podés tener hasta ${limits.maxListedJobs} vacantes publicadas a la vez. Pausá o cerrá una, o pasate a Worka Enterprise Pro para publicar sin límite.`;
}

// Mensaje del límite cuando lo frena la base (migración 047) y no el chequeo previo.
export function planErrorMessage(message: string | undefined): string | null {
  return message && message.includes("plan Gratis") ? message : null;
}

// Admin: pagos recientes y planes vigentes.
export async function getAdminPlansData(): Promise<{ payments: PaymentRequestRow[]; subscriptions: SubscriptionRow[]; receipts: Record<string, string> }> {
  const supabase = await getServerClient();
  if (!supabase) {
    return {
      payments: [
        { id: "demo-pay", user_id: mock.companies[1]?.id ?? "c2", product: "enterprise", plan: "pro", months: 1, amount_gs: 250000, reference: "004512339", status: "pendiente", admin_note: null, created_at: new Date().toISOString(), resolved_at: null },
      ],
      subscriptions: [],
      receipts: {},
    };
  }
  const [{ data: payments }, { data: subs }] = await Promise.all([
    supabase.from("payment_requests").select("*").order("created_at", { ascending: false }).limit(60),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "activa")
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: true })
      .limit(300),
  ]);
  // Recibo emitido por cada pago confirmado (migración 048).
  const ids = ((payments ?? []) as PaymentRequestRow[]).filter((p) => p.status === "aprobada").map((p) => p.id);
  const receipts: Record<string, string> = {};
  if (ids.length) {
    const { data: rows } = await supabase.from("receipts").select("id, payment_request_id").in("payment_request_id", ids);
    for (const r of (rows ?? []) as { id: string; payment_request_id: string }[]) receipts[r.payment_request_id] = r.id;
  }
  return { payments: (payments ?? []) as PaymentRequestRow[], subscriptions: (subs ?? []) as SubscriptionRow[], receipts };
}

export type ProfileViewer = {
  company_id: string;
  company_name: string;
  logo_url: string | null;
  city: string | null;
  source: "postulacion" | "cv" | "talento" | "perfil";
  viewed_at: string;
};

// Vistas del perfil del candidato logueado: conteo para todos, detalle solo
// con Worka Pro (la política de la tabla ya lo exige).
export async function getMyProfileViews(withDetail: boolean): Promise<{ views: number; companies: number; list: ProfileViewer[] }> {
  const supabase = await getServerClient();
  if (!supabase) {
    const list: ProfileViewer[] = mock.companies.slice(0, 3).map((c, i) => ({
      company_id: c.id,
      company_name: c.trade_name,
      logo_url: c.logo_url,
      city: c.location_city,
      source: (["postulacion", "cv", "perfil"] as const)[i],
      viewed_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    }));
    return { views: 5, companies: 3, list: withDetail ? list : [] };
  }
  const { data: counts } = await supabase.rpc("fn_my_profile_view_count", { p_days: 30 });
  const row = (Array.isArray(counts) ? counts[0] : counts) as { views?: number; companies?: number } | null;
  let list: ProfileViewer[] = [];
  if (withDetail) {
    const { data } = await supabase
      .from("profile_views")
      .select("company_id, source, viewed_at, company:companies(trade_name, company_name, logo_url, location_city)")
      .order("viewed_at", { ascending: false })
      .limit(40);
    list = ((data ?? []) as unknown as {
      company_id: string;
      source: ProfileViewer["source"];
      viewed_at: string;
      company: { trade_name: string | null; company_name: string; logo_url: string | null; location_city: string | null } | null;
    }[]).map((r) => ({
      company_id: r.company_id,
      company_name: r.company?.trade_name || r.company?.company_name || "Empresa",
      logo_url: r.company?.logo_url ?? null,
      city: r.company?.location_city ?? null,
      source: r.source,
      viewed_at: r.viewed_at,
    }));
  }
  return { views: Number(row?.views ?? 0), companies: Number(row?.companies ?? 0), list };
}

export type ApplicationInsight = { job_id: string; applicants: number; company_viewed_at: string | null };

// Detalle de cada postulación propia (Worka Pro).
export async function getMyApplicationInsights(): Promise<Map<string, ApplicationInsight>> {
  const supabase = await getServerClient();
  if (!supabase) {
    return new Map(
      mock.applications
        .filter((a) => a.candidate_id === mock.currentCandidate.id)
        .map((a, i) => [a.job_id, { job_id: a.job_id, applicants: 8 + i * 5, company_viewed_at: i % 2 ? null : new Date(Date.now() - 86400000).toISOString() }])
    );
  }
  const { data, error } = await supabase.rpc("fn_my_application_insights");
  if (error) return new Map();
  return new Map(((data ?? []) as ApplicationInsight[]).map((r) => [r.job_id, { ...r, applicants: Number(r.applicants) }]));
}
