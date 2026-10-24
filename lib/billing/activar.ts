import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { BOOST_PLANS } from "@/lib/types";
import { planDisplayName } from "@/lib/plans";
import { accesoHasta, leerDatosCompra, type DatosCompra } from "./catalogo";
import { leerSuscripcion, type SuscripcionLs } from "./lemonsqueezy";

// Lo que hace Worka con cada evento de Lemon Squeezy.
//
// Corre desde el webhook, sin sesión: escribe con la service role. Quién
// pagó y qué compró NO sale de lo que manda el navegador sino de los datos
// ocultos del checkout (meta.custom_data), que armó el servidor de Worka al
// crear el checkout y que Lemon Squeezy devuelve firmados en el webhook.

type Admin = NonNullable<ReturnType<typeof getAdminClient>>;
type Datos = DatosCompra & { compra: { product: string; plan: string; months?: number } };

export type Evento = {
  meta: { event_name: string; test_mode?: boolean; custom_data?: unknown };
  data: { id: string; type: string; attributes: Record<string, unknown> };
};

export type Resultado = { ok: true; nota?: string } | { ok: false; error: string; reintentar: boolean };

const DIA = 86_400_000;

export async function procesarEvento(ev: Evento): Promise<Resultado> {
  const admin = getAdminClient();
  if (!admin)
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY", reintentar: true };

  const nombre = ev.meta.event_name;
  const datos = leerDatosCompra(ev.meta.custom_data) as Datos | null;

  // Un evento sin nuestros datos no lo originó un botón de Worka (por
  // ejemplo, una compra hecha desde la página pública de la tienda). Se
  // registra y no se toca nada: no hay forma segura de saber a quién activar.
  if (!datos) return { ok: true, nota: "sin datos de Worka: no se activa nada" };

  if (nombre.startsWith("subscription_payment_")) {
    // El objeto es una factura; la suscripción se relee de la API para
    // tener las fechas al día.
    const subId = String(ev.data.attributes.subscription_id ?? "");
    const sub = await leerSuscripcion(subId);
    if (!sub) return { ok: false, error: `no pudimos leer la suscripción ${subId}`, reintentar: true };
    const r = await sincronizar(admin, sub, datos);
    if (r.ok && nombre === "subscription_payment_failed") await avisarCobroFallido(datos);
    return r;
  }

  if (nombre.startsWith("subscription_") && ev.data.type === "subscriptions") {
    return sincronizar(admin, { id: ev.data.id, attributes: ev.data.attributes } as SuscripcionLs, datos, nombre === "subscription_created");
  }

  if (nombre === "order_created" && datos.product === "boost") {
    if (ev.data.attributes.status !== "paid")
      return { ok: true, nota: `pedido en estado ${String(ev.data.attributes.status)}: se espera el pago` };
    return activarDestacado(admin, datos, ev.data.id);
  }

  if (nombre === "order_refunded" && datos.product === "boost") {
    return quitarDestacado(admin, datos);
  }

  // order_created de una suscripción: lo resuelve subscription_created.
  return { ok: true, nota: "evento sin acción para Worka" };
}

// ── Suscripciones ──────────────────────────────────────────────

async function sincronizar(
  admin: Admin,
  sub: SuscripcionLs,
  datos: Datos,
  esNueva = false
): Promise<Resultado> {
  const a = sub.attributes;
  const months = datos.compra.months ?? 1;

  // Lo que teníamos antes, para saber si el acceso vigente lo dio esta
  // suscripción (y entonces se puede cortar) o vino de otro lado.
  const { data: previa } = await admin
    .from("billing_subscriptions")
    .select("status, renews_at, ends_at")
    .eq("provider_subscription_id", sub.id)
    .maybeSingle();
  const prevHasta = previa
    ? accesoHasta(previa.status, previa.renews_at, previa.ends_at, 0)
    : null;

  const { error } = await admin.from("billing_subscriptions").upsert(
    {
      provider_subscription_id: sub.id,
      provider_customer_id: a.customer_id ? String(a.customer_id) : null,
      user_id: datos.payer_id,
      product: datos.product,
      plan: datos.plan,
      months,
      status: a.status,
      renews_at: a.renews_at,
      ends_at: a.ends_at,
      card_brand: a.card_brand,
      card_last_four: a.card_last_four,
      test_mode: !!a.test_mode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_subscription_id" }
  );
  if (error) return { ok: false, error: `billing_subscriptions: ${error.message}`, reintentar: true };

  const hasta = accesoHasta(a.status, a.renews_at, a.ends_at);
  const r =
    datos.product === "evaluar"
      ? await aplicarEvaluar(admin, datos.payer_id, datos.plan, hasta, prevHasta)
      : await aplicarPlan(admin, datos.payer_id, datos.product as "enterprise" | "pro", datos.plan, hasta, prevHasta);
  if (!r.ok) return r;

  if (esNueva && hasta) {
    const href = datos.product === "evaluar" ? "/evaluar/app" : datos.product === "pro" ? "/pro" : "/empresa/planes";
    const nombre =
      datos.product === "evaluar"
        ? `Worka Evaluar ${datos.plan === "profesional" ? "Profesional" : "Esencial"}`
        : planDisplayName(datos.product as "enterprise" | "pro", datos.plan);
    await notify({
      userId: datos.buyer_id,
      icon: "✅",
      title: `${nombre} activo`,
      body: `Recibimos tu pago. El plan se renueva solo el ${new Date(hasta).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })}; lo podés cancelar cuando quieras.`,
      href,
      cta: "Ver mi plan",
    });
  }
  return { ok: true };
}

// ¿El acceso vigente es el que dio esta suscripción? Con un día de margen
// por diferencias de redondeo. Si no lo es (un alta manual, una promoción),
// cortar la suscripción no puede borrar esos días.
function loDioEstaSuscripcion(vigente: string | null | undefined, prevHasta: string | null): boolean {
  if (!vigente || !prevHasta) return false;
  return Math.abs(Date.parse(vigente) - Date.parse(prevHasta)) < DIA;
}

async function aplicarPlan(
  admin: Admin,
  payerId: string,
  product: "enterprise" | "pro",
  plan: string,
  hasta: string | null,
  prevHasta: string | null
): Promise<Resultado> {
  const ahora = new Date().toISOString();
  const { data: actual } = await admin
    .from("subscriptions")
    .select("id, plan, ends_at")
    .eq("user_id", payerId)
    .eq("product", product)
    .eq("status", "activa")
    .gt("ends_at", ahora)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!hasta) {
    // Sin acceso (impaga, pausada, vencida): se corta solo lo que dio esta
    // suscripción.
    if (actual && actual.plan === plan && loDioEstaSuscripcion(actual.ends_at, prevHasta)) {
      const { error } = await admin.from("subscriptions").update({ ends_at: ahora }).eq("id", actual.id);
      if (error) return { ok: false, error: `subscriptions: ${error.message}`, reintentar: true };
    }
    return { ok: true };
  }

  if (actual && actual.plan === plan) {
    // Nunca se acortan días: si ya tenía más (una promoción, un pago manual
    // previo), se queda con más.
    if (Date.parse(hasta) > Date.parse(actual.ends_at)) {
      const { error } = await admin.from("subscriptions").update({ ends_at: hasta }).eq("id", actual.id);
      if (error) return { ok: false, error: `subscriptions: ${error.message}`, reintentar: true };
    }
    return { ok: true };
  }

  // Primera vez o cambio de plan: el anterior se cierra y arranca el nuevo.
  if (actual) await admin.from("subscriptions").update({ status: "cancelada" }).eq("id", actual.id);
  const { error } = await admin.from("subscriptions").insert({
    user_id: payerId,
    product,
    plan,
    starts_at: ahora,
    ends_at: hasta,
  });
  if (error) return { ok: false, error: `subscriptions: ${error.message}`, reintentar: true };
  return { ok: true };
}

async function aplicarEvaluar(
  admin: Admin,
  companyId: string,
  plan: string,
  hasta: string | null,
  prevHasta: string | null
): Promise<Resultado> {
  const { data: cuenta } = await admin
    .from("evaluar_accounts")
    .select("status, plan, paid_until")
    .eq("company_id", companyId)
    .maybeSingle();

  if (!hasta) {
    if (cuenta && cuenta.status === "activa" && loDioEstaSuscripcion(cuenta.paid_until, prevHasta)) {
      const { error } = await admin
        .from("evaluar_accounts")
        .update({ status: "vencida" })
        .eq("company_id", companyId);
      if (error) return { ok: false, error: `evaluar_accounts: ${error.message}`, reintentar: true };
    }
    return { ok: true };
  }

  const pagoHasta =
    cuenta?.paid_until && Date.parse(cuenta.paid_until) > Date.parse(hasta) ? cuenta.paid_until : hasta;

  const { error } = cuenta
    ? await admin
        .from("evaluar_accounts")
        .update({ status: "activa", plan, paid_until: pagoHasta })
        .eq("company_id", companyId)
    : await admin.from("evaluar_accounts").insert({
        company_id: companyId,
        status: "activa",
        plan,
        paid_until: pagoHasta,
        trial_ends_at: new Date().toISOString(),
      });
  if (error) return { ok: false, error: `evaluar_accounts: ${error.message}`, reintentar: true };
  return { ok: true };
}

async function avisarCobroFallido(datos: Datos) {
  await notify({
    userId: datos.buyer_id,
    icon: "⚠️",
    title: "No pudimos cobrar la renovación",
    body: "La tarjeta rechazó el cobro. Vamos a reintentar en los próximos días; mientras tanto tu plan sigue activo. Podés cambiar la tarjeta desde «Gestionar suscripción».",
    href: datos.product === "evaluar" ? "/evaluar/app" : datos.product === "pro" ? "/pro" : "/empresa/planes",
    cta: "Actualizar la tarjeta",
  });
}

// ── Destacados (pago único) ────────────────────────────────────

async function activarDestacado(admin: Admin, datos: Datos, orderId: string): Promise<Resultado> {
  const { data: boost } = await admin
    .from("boost_requests")
    .select("id, job_id, company_id, plan, status")
    .eq("id", datos.boost_id!)
    .maybeSingle();
  if (!boost) return { ok: false, error: `boost ${datos.boost_id} no existe`, reintentar: false };
  if (boost.company_id !== datos.payer_id)
    return { ok: false, error: "el destacado no es de la empresa que pagó", reintentar: false };
  if (boost.status === "activo") return { ok: true, nota: "ya estaba activo" };

  const dias = BOOST_PLANS.find((p) => p.plan === boost.plan)?.days ?? Number(datos.plan);
  const { error } = await admin
    .from("boost_requests")
    .update({ status: "activo", provider_order_id: orderId })
    .eq("id", boost.id);
  if (error) return { ok: false, error: `boost_requests: ${error.message}`, reintentar: true };

  const { error: jobError } = await admin
    .from("jobs")
    .update({ featured: true, featured_until: new Date(Date.now() + dias * DIA).toISOString() })
    .eq("id", boost.job_id);
  if (jobError) return { ok: false, error: `jobs: ${jobError.message}`, reintentar: true };

  await notify({
    userId: datos.buyer_id,
    icon: "🚀",
    title: "Tu vacante ya está destacada",
    body: `Recibimos el pago. La vacante queda destacada ${dias} días.`,
    href: "/empresa",
    cta: "Ver mis vacantes",
  });
  return { ok: true };
}

async function quitarDestacado(admin: Admin, datos: Datos): Promise<Resultado> {
  const { data: boost } = await admin
    .from("boost_requests")
    .select("id, job_id, status")
    .eq("id", datos.boost_id!)
    .maybeSingle();
  if (!boost || boost.status !== "activo") return { ok: true, nota: "nada que quitar" };
  await admin.from("boost_requests").update({ status: "rechazado" }).eq("id", boost.id);
  await admin.from("jobs").update({ featured: false, featured_until: null }).eq("id", boost.job_id);
  return { ok: true, nota: "destacado quitado por reembolso" };
}
