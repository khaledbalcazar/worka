"use server";

import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCompanyAccess } from "@/lib/company-context";
import { getSiteSettings } from "@/lib/data";
import { SITE_URL, evaluarUrl } from "@/lib/supabase/config";
import { BOOST_PLANS } from "@/lib/types";
import { planDisplayName } from "@/lib/plans";
import { compraValida, type Compra } from "@/lib/billing/catalogo";
import { crearPago, dlocalConfig } from "@/lib/billing/dlocalgo";
import { leerSuscripcion } from "@/lib/billing/lemonsqueezy";
import { confirmarPago } from "@/lib/billing/pagos";
import { precioCobro } from "@/lib/billing/ofertas";

// Pago con tarjeta (dLocal Go): abrir el checkout y confirmar el pago a la
// vuelta. Lo que activa el plan es confirmarPago, que le pregunta el estado a
// la API; desde el webhook (app/api/webhooks/dlocalgo) o desde la página de
// retorno, nunca porque el navegador diga que pagó.

type Result = { ok: boolean; error?: string; url?: string };

const BASE = SITE_URL.replace(/\/$/, "");

/**
 * A dónde vuelve la persona y a dónde manda dLocal Go el aviso.
 *
 * En producción, al sitio. En un deploy de Preview (el que se usa con las
 * claves de sandbox), a ese mismo deploy: SITE_URL apunta a producción, que
 * tiene las claves reales, y ahí el pago de prueba no se podía consultar ni
 * el aviso validar. Si el deploy tiene la protección de Vercel, el aviso
 * lleva el secreto de "Protection Bypass for Automation" para poder entrar
 * (la firma cubre solo el cuerpo, así que el parámetro no la cambia).
 */
function destinosPago(): { web: string; evaluar: (path: string) => string; aviso: string } {
  const preview = process.env.VERCEL_ENV === "preview";
  // La URL única del deploy y no la de la rama: la de main puede apuntar al
  // deploy de producción, y además un "Redeploy" como Preview no tiene rama
  // propia.
  const host = process.env.VERCEL_URL;
  if (!preview || !host) {
    return { web: BASE, evaluar: evaluarUrl, aviso: `${BASE}/api/webhooks/dlocalgo` };
  }
  const web = `https://${host}`;
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const aviso = `${web}/api/webhooks/dlocalgo`;
  return {
    web,
    // Sin subdominio evaluar. en Preview: la ruta /evaluar es la misma app.
    evaluar: (path) => `${web}/evaluar${path}`,
    aviso: bypass ? conParams(aviso, { "x-vercel-protection-bypass": bypass }) : aviso,
  };
}

/** Agrega parámetros a una URL que puede traer ya los suyos. */
function conParams(url: string, params: Record<string, string>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

function nombreCompra(c: Compra): string {
  const duracion = c.months === 12 ? "12 meses" : c.months === 3 ? "3 meses" : "1 mes";
  if (c.product === "boost") return `Worka · vacante destacada ${c.plan} días`;
  if (c.product === "evaluar")
    return `Worka Evaluar ${c.plan === "profesional" ? "Profesional" : "Esencial"} · ${duracion}`;
  return `${planDisplayName(c.product, c.plan)} · ${duracion}`;
}

/**
 * Crea el pago de una compra y devuelve la URL del checkout. El plan, la
 * duración y el precio se validan y se calculan acá: del navegador solo
 * llega qué eligió la persona.
 */
export async function startCardCheckout(input: {
  product: string;
  plan: string;
  months?: number;
  /** Solo destacados. */
  jobId?: string;
}): Promise<Result> {
  const compra: Partial<Compra> =
    input.product === "boost"
      ? { product: "boost", plan: String(input.plan) }
      : { product: input.product as Compra["product"], plan: input.plan, months: Number(input.months) };
  if (!compraValida(compra)) return { ok: false, error: "Elegí un plan válido." };

  const supabase = await getServerClient();
  if (!supabase) return { ok: false, error: "Modo demostración: el pago no está disponible." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  if (!dlocalConfig()) return { ok: false, error: "El pago con tarjeta todavía no está configurado." };
  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "No pudimos abrir el pago. Probá de nuevo en un rato." };

  // ¿A nombre de quién se paga? Mismas reglas que el cobro manual.
  const destino = destinosPago();
  let payerId = user.id;
  let nombre: string | null = null;
  let volver = `${destino.web}/empresa/planes`;
  let boostId: string | undefined;

  if (compra.product === "enterprise" || compra.product === "boost") {
    const access = await getCompanyAccess(supabase, user.id);
    if (!access) return { ok: false, error: "Tu cuenta no tiene una empresa asociada." };
    if (compra.product === "enterprise" && access.role !== "dueño" && access.role !== "administrador")
      return { ok: false, error: "Solo el dueño o un administrador del equipo puede contratar el plan." };
    if (compra.product === "boost" && access.role === "observador")
      return { ok: false, error: "No tenés permiso para destacar vacantes." };
    payerId = access.companyId;
    const { data: comp } = await supabase.from("companies").select("company_name").eq("id", payerId).maybeSingle();
    nombre = comp?.company_name ?? null;
  } else if (compra.product === "pro") {
    const { data: cand } = await supabase.from("candidates").select("full_name").eq("id", user.id).maybeSingle();
    if (!cand) return { ok: false, error: "Worka Pro es para cuentas de candidato." };
    nombre = cand.full_name ?? null;
    volver = `${destino.web}/pro`;
  } else {
    // Evaluar: la cuenta es de la empresa que inició sesión (company_id = user.id).
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "company") return { ok: false, error: "Worka Evaluar es para cuentas de empresa." };
    const { data: comp } = await supabase.from("companies").select("company_name").eq("id", user.id).maybeSingle();
    nombre = comp?.company_name ?? null;
    volver = destino.evaluar("/app/plan");
  }

  // Destacado: se crea la solicitud antes del pago, y la confirmación la activa.
  if (compra.product === "boost") {
    const opcion = BOOST_PLANS.find((p) => p.days === Number(compra.plan));
    if (!opcion || !input.jobId) return { ok: false, error: "Elegí la vacante y el plan." };
    const { data: job } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", input.jobId)
      .eq("company_id", payerId)
      .maybeSingle();
    if (!job) return { ok: false, error: "Esa vacante no es de tu empresa." };
    const { data: boost, error } = await supabase
      .from("boost_requests")
      .insert({ job_id: input.jobId, company_id: payerId, plan: opcion.plan, price_gs: opcion.price_gs })
      .select("id")
      .single();
    if (error || !boost) return { ok: false, error: "No pudimos preparar el destacado." };
    boostId = boost.id as string;
    volver = `${destino.web}/empresa`;
  }

  const settings = await getSiteSettings();
  const monto = precioCobro(compra, settings);
  if (!monto) return { ok: false, error: "Este plan todavía no tiene precio cargado." };

  // La compra queda guardada antes de ir al checkout: el pago solo lleva su
  // id (order_id), y es esta fila la que dice a quién activar y qué.
  const { data: fila, error: filaError } = await admin
    .from("billing_payments")
    .insert({
      payer_id: payerId,
      buyer_id: user.id,
      product: compra.product,
      plan: compra.plan,
      months: compra.months ?? null,
      boost_id: boostId ?? null,
      amount: monto.valor,
      currency: monto.moneda,
      status: "CREATED",
      test_mode: dlocalConfig()?.sandbox ?? false,
    })
    .select("id")
    .single();
  if (filaError || !fila) {
    console.error("[worka:billing] guardar compra:", filaError?.message);
    return { ok: false, error: "No pudimos abrir el pago. ¿Ya corriste la migración 058?" };
  }
  const ref = fila.id as string;

  const r = await crearPago({
    orderId: ref,
    monto: monto.valor,
    descripcion: nombreCompra(compra),
    email: user.email ?? null,
    nombre,
    exito: conParams(volver, { pago: "ok", ref }),
    volver: conParams(volver, { pago: "cancelado" }),
    aviso: destino.aviso,
  });
  if (!r.ok) {
    await admin.from("billing_payments").update({ status: "FAILED", error: r.error }).eq("id", ref);
    return { ok: false, error: r.error };
  }
  await admin
    .from("billing_payments")
    .update({ provider_payment_id: r.id, status: "PENDING", updated_at: new Date().toISOString() })
    .eq("id", ref);
  return { ok: true, url: r.url };
}

/**
 * A la vuelta del checkout: le pregunta a dLocal Go cómo quedó el pago y, si
 * entró, activa el plan sin esperar el aviso. Lo puede pedir solo quien
 * compró o la cuenta que paga.
 */
export async function checkCardPayment(
  ref: string
): Promise<{ ok: boolean; estado?: "pagado" | "pendiente" | "rechazado"; error?: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(ref)) return { ok: false, error: "Pago desconocido." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "No pudimos confirmar el pago." };

  const { data: fila } = await admin
    .from("billing_payments")
    .select("buyer_id, payer_id")
    .eq("id", ref)
    .maybeSingle();
  if (!fila || (fila.buyer_id !== user.id && fila.payer_id !== user.id))
    return { ok: false, error: "Pago desconocido." };

  const r = await confirmarPago({ id: ref });
  if (!r.ok && r.reintentar) return { ok: true, estado: "pendiente" };
  if (!r.ok) return { ok: false, error: "Recibimos el pago pero no coincide con la compra. Escribinos y lo revisamos." };
  if (r.estado === "PAID") return { ok: true, estado: "pagado" };
  if (r.estado === "REJECTED" || r.estado === "CANCELLED" || r.estado === "EXPIRED")
    return { ok: true, estado: "rechazado" };
  return { ok: true, estado: "pendiente" };
}

/**
 * Heredado de Lemon Squeezy: el portal para cancelar una suscripción que se
 * contrató antes de pasar a dLocal Go. Se pide en el momento porque los
 * enlaces del portal vienen firmados y vencen.
 */
export async function openBillingPortal(product: "enterprise" | "pro" | "evaluar"): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: false, error: "Modo demostración." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };

  let payerId = user.id;
  if (product === "enterprise") {
    const access = await getCompanyAccess(supabase, user.id);
    if (!access || (access.role !== "dueño" && access.role !== "administrador"))
      return { ok: false, error: "Solo el dueño o un administrador puede gestionar el plan." };
    payerId = access.companyId;
  }

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "No pudimos abrir la gestión de la suscripción." };
  const { data } = await admin
    .from("billing_subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", payerId)
    .eq("product", product)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { ok: false, error: "No encontramos una suscripción con tarjeta." };

  const sub = await leerSuscripcion(data.provider_subscription_id as string);
  const url = sub?.attributes.urls?.customer_portal;
  return url ? { ok: true, url } : { ok: false, error: "No pudimos abrir la gestión de la suscripción." };
}
