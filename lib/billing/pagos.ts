import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { extendedEnd, planDisplayName } from "@/lib/plans";
import { leerDatosCompra, pagoCubre, type Moneda } from "./catalogo";
import { leerPago } from "./dlocalgo";
import { activarDestacado, type Admin, type Datos, type Resultado } from "./activar";

// Confirmar un pago de dLocal Go y activar lo que se compró.
//
// Lo llaman tres caminos, y los tres terminan acá: el webhook (lo normal),
// la página de retorno cuando la persona vuelve del checkout (por si el
// aviso se demora) y el cron diario (por si no llegó nunca). Por eso tiene
// que poder correr varias veces, incluso a la vez, y activar una sola:
//   1. El estado se pregunta siempre a la API, nunca se cree lo que llega.
//   2. El pago se "toma" con un update condicional (activated_at is null):
//      de dos llamadas simultáneas, solo una lo consigue.
//   3. Si la activación falla, se suelta (activated_at vuelve a null) y el
//      próximo aviso o el cron lo reintentan.

type Fila = {
  id: string;
  provider_payment_id: string | null;
  payer_id: string;
  buyer_id: string;
  product: string;
  plan: string;
  months: number | null;
  boost_id: string | null;
  amount: number | string;
  currency: string;
  status: string;
  activated_at: string | null;
};

export type Confirmacion = Resultado & { estado?: string; fila?: Pick<Fila, "id" | "buyer_id" | "payer_id" | "product"> };

const COLUMNAS =
  "id, provider_payment_id, payer_id, buyer_id, product, plan, months, boost_id, amount, currency, status, activated_at";

export async function confirmarPago(ref: { id?: string; pagoId?: string }): Promise<Confirmacion> {
  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY", reintentar: true };

  const q = admin.from("billing_payments").select(COLUMNAS);
  const { data: fila, error } = await (ref.id
    ? q.eq("id", ref.id)
    : q.eq("provider_payment_id", ref.pagoId ?? "")
  ).maybeSingle<Fila>();
  if (error) return { ok: false, error: `billing_payments: ${error.message}`, reintentar: true };
  // Un pago que no armó Worka (un enlace de pago hecho a mano en el panel de
  // dLocal Go): se responde bien y no se toca nada.
  if (!fila) return { ok: true, nota: "pago sin compra de Worka: no se activa nada" };
  const resumen = { id: fila.id, buyer_id: fila.buyer_id, payer_id: fila.payer_id, product: fila.product };
  if (fila.activated_at) return { ok: true, nota: "ya activado", estado: "PAID", fila: resumen };
  if (!fila.provider_payment_id) return { ok: true, estado: fila.status, fila: resumen };

  const pago = await leerPago(fila.provider_payment_id);
  if (!pago) return { ok: false, error: `no pudimos leer el pago ${fila.provider_payment_id}`, reintentar: true };

  await admin
    .from("billing_payments")
    .update({
      status: pago.status,
      paid_at: pago.status === "PAID" ? (pago.approved_date ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fila.id);
  if (pago.status !== "PAID") return { ok: true, estado: pago.status, fila: resumen };

  const monto = { valor: Number(fila.amount), moneda: fila.currency as Moneda };
  if (!pagoCubre(pago, { orderId: fila.id, monto })) {
    const detalle = `el pago no coincide con la compra (${pago.currency} ${pago.amount}, order ${pago.order_id ?? "-"})`;
    await admin.from("billing_payments").update({ error: detalle }).eq("id", fila.id);
    return { ok: false, error: detalle, reintentar: false };
  }

  const datos = leerDatosCompra({
    payer_id: fila.payer_id,
    buyer_id: fila.buyer_id,
    product: fila.product,
    plan: fila.plan,
    months: fila.months ?? undefined,
    boost_id: fila.boost_id ?? undefined,
  }) as Datos | null;
  if (!datos) return { ok: false, error: "la compra guardada no es válida", reintentar: false };

  const { data: tomado } = await admin
    .from("billing_payments")
    .update({ activated_at: new Date().toISOString() })
    .eq("id", fila.id)
    .is("activated_at", null)
    .select("id")
    .maybeSingle();
  if (!tomado) return { ok: true, nota: "ya activado", estado: "PAID", fila: resumen };

  const r =
    datos.product === "boost"
      ? await activarDestacado(admin, datos, fila.provider_payment_id)
      : datos.product === "evaluar"
        ? await activarEvaluar(admin, datos)
        : await activarPlan(admin, datos);

  if (!r.ok) {
    await admin
      .from("billing_payments")
      .update({ activated_at: null, error: r.error.slice(0, 500) })
      .eq("id", fila.id);
    return { ...r, estado: "PAID", fila: resumen };
  }
  await admin.from("billing_payments").update({ error: null }).eq("id", fila.id);
  return { ...r, estado: "PAID", fila: resumen };
}

// ── Planes (pago único por 1, 3 o 12 meses) ────────────────────

// Mismas reglas que el alta manual (activatePlan en app/plans-actions.ts):
// el mismo plan suma los meses a lo que quedaba; otro plan cierra el
// anterior y arranca hoy.
async function activarPlan(admin: Admin, datos: Datos): Promise<Resultado> {
  const product = datos.product as "enterprise" | "pro";
  const months = datos.compra.months ?? 1;
  const ahora = new Date().toISOString();
  const { data: actual } = await admin
    .from("subscriptions")
    .select("id, plan, ends_at")
    .eq("user_id", datos.payer_id)
    .eq("product", product)
    .eq("status", "activa")
    .gt("ends_at", ahora)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let hasta: string;
  if (actual && actual.plan === datos.plan) {
    hasta = extendedEnd(actual.ends_at, months);
    const { error } = await admin.from("subscriptions").update({ ends_at: hasta }).eq("id", actual.id);
    if (error) return { ok: false, error: `subscriptions: ${error.message}`, reintentar: true };
  } else {
    if (actual) await admin.from("subscriptions").update({ status: "cancelada" }).eq("id", actual.id);
    hasta = extendedEnd(null, months);
    const { error } = await admin.from("subscriptions").insert({
      user_id: datos.payer_id,
      product,
      plan: datos.plan,
      starts_at: ahora,
      ends_at: hasta,
    });
    if (error) return { ok: false, error: `subscriptions: ${error.message}`, reintentar: true };
  }

  await avisarActivo(datos, planDisplayName(product, datos.plan), hasta);
  return { ok: true };
}

async function activarEvaluar(admin: Admin, datos: Datos): Promise<Resultado> {
  const months = datos.compra.months ?? 1;
  const { data: cuenta } = await admin
    .from("evaluar_accounts")
    .select("status, plan, paid_until")
    .eq("company_id", datos.payer_id)
    .maybeSingle();

  // Renovar el mismo plan suma los meses; cambiar de plan arranca hoy.
  const sigue = cuenta?.status === "activa" && cuenta.plan === datos.plan ? cuenta.paid_until : null;
  const hasta = extendedEnd(sigue, months);

  const { error } = cuenta
    ? await admin
        .from("evaluar_accounts")
        .update({ status: "activa", plan: datos.plan, paid_until: hasta })
        .eq("company_id", datos.payer_id)
    : await admin.from("evaluar_accounts").insert({
        company_id: datos.payer_id,
        status: "activa",
        plan: datos.plan,
        paid_until: hasta,
        trial_ends_at: new Date().toISOString(),
      });
  if (error) return { ok: false, error: `evaluar_accounts: ${error.message}`, reintentar: true };

  await avisarActivo(datos, `Worka Evaluar ${datos.plan === "profesional" ? "Profesional" : "Esencial"}`, hasta);
  return { ok: true };
}

async function avisarActivo(datos: Datos, nombre: string, hasta: string) {
  const href = datos.product === "evaluar" ? "/evaluar/app/plan" : datos.product === "pro" ? "/pro" : "/empresa/planes";
  await notify({
    userId: datos.buyer_id,
    icon: "✅",
    title: `${nombre} activo`,
    body: `Recibimos tu pago. El plan queda activo hasta el ${new Date(hasta).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })}. Si renovás antes, los días se suman.`,
    href,
    cta: "Ver mi plan",
  });
}
