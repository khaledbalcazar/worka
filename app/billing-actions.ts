"use server";

import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCompanyAccess } from "@/lib/company-context";
import { getSiteSettings } from "@/lib/data";
import { SITE_URL, evaluarUrl } from "@/lib/supabase/config";
import { BOOST_PLANS } from "@/lib/types";
import { compraValida, type Compra, type DatosCompra } from "@/lib/billing/catalogo";
import { crearCheckout, leerSuscripcion } from "@/lib/billing/lemonsqueezy";
import { precioUsd } from "@/lib/billing/ofertas";

// Pago con tarjeta (Lemon Squeezy): abrir el checkout y gestionar la
// suscripción. Lo que activa el plan es el webhook
// (app/api/webhooks/lemonsqueezy), nunca esta acción: acá todavía no se pagó.

type Result = { ok: boolean; error?: string; url?: string };

const BASE = SITE_URL.replace(/\/$/, "");

/**
 * Crea el checkout de una compra y devuelve su URL. El plan, la duración y
 * el precio se validan y se calculan acá: del navegador solo llega qué
 * eligió la persona.
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

  // ¿A nombre de quién se paga? Mismas reglas que el cobro manual.
  let payerId = user.id;
  let nombre: string | null = null;
  let volver = `${BASE}/empresa/planes?pago=ok`;
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
    volver = `${BASE}/pro?pago=ok`;
  } else {
    // Evaluar: la cuenta es de la empresa que inició sesión (company_id = user.id).
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "company") return { ok: false, error: "Worka Evaluar es para cuentas de empresa." };
    const { data: comp } = await supabase.from("companies").select("company_name").eq("id", user.id).maybeSingle();
    nombre = comp?.company_name ?? null;
    volver = `${evaluarUrl("/app")}?pago=ok`;
  }

  // Una sola suscripción con tarjeta por producto: una segunda cobraría dos
  // veces. El cambio de plan se hace cancelando la actual.
  if (compra.product !== "boost") {
    const admin = getAdminClient();
    if (admin) {
      const { data: vigente } = await admin
        .from("billing_subscriptions")
        .select("id")
        .eq("user_id", payerId)
        .eq("product", compra.product)
        .in("status", ["active", "on_trial", "past_due"])
        .limit(1)
        .maybeSingle();
      if (vigente)
        return {
          ok: false,
          error: "Ya tenés una suscripción con tarjeta para este producto. Gestionala desde «Gestionar suscripción».",
        };
    }
  }

  // Destacado: se crea la solicitud antes del pago, y el webhook la activa.
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
    volver = `${BASE}/empresa?pago=ok`;
  }

  const settings = await getSiteSettings();
  const centavos = precioUsd(compra, settings);
  if (centavos <= 0) return { ok: false, error: "Este plan todavía no tiene precio cargado." };

  const custom: DatosCompra = {
    payer_id: payerId,
    buyer_id: user.id,
    product: compra.product,
    plan: compra.plan,
    ...(compra.months ? { months: String(compra.months) } : {}),
    ...(boostId ? { boost_id: boostId } : {}),
  };

  const r = await crearCheckout({
    compra,
    centavos,
    custom: custom as unknown as Record<string, string>,
    email: user.email ?? null,
    nombre,
    volver,
  });
  return r.ok ? { ok: true, url: r.url } : { ok: false, error: r.error };
}

/**
 * Enlace al portal de Lemon Squeezy para cambiar la tarjeta o cancelar. Se
 * pide en el momento porque los enlaces del portal vienen firmados y vencen.
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
