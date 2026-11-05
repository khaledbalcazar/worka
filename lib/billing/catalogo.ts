// Reglas del cobro con tarjeta que no dependen de la red ni de la base.
//
// Sin imports a propósito: las pruebas de tests/billing las corren con
// node --test directo. Lo que habla con la API vive en dlocalgo.ts y lo que
// toca la base, en pagos.ts (y activar.ts para lo heredado de Lemon Squeezy).
//
// Decisiones:
//   - El precio sale de Worka (site_settings, en guaraníes) y se manda en
//     cada pago. Así hay una sola lista de precios: la del admin.
//   - 04/11/2026, dLocal Go en lugar de Lemon Squeezy: se cobra en guaraníes
//     por defecto (DLOCALGO_CURRENCY=USD vuelve a dólares enteros con el
//     cambio del admin). Cada pago es único y cubre 1, 3 o 12 meses: las
//     suscripciones de dLocal Go son planes de monto fijo que no devuelven
//     nuestro identificador en el aviso, y no hay forma segura de saber a
//     quién activar una renovación. Para renovar se vuelve a pagar, y los
//     días se suman.
//   - El código WORKA3PRO sigue dentro de Worka, sin pasar por el cobro.

export type ProductoCobro = "enterprise" | "pro" | "evaluar" | "boost";

export type Compra = {
  product: ProductoCobro;
  plan: string;
  /** Meses de cada cobro (1, 3 o 12). Los destacados no tienen. */
  months?: number;
};

/** Planes que se pueden comprar con tarjeta, por producto. */
export const PLANES_COBRABLES: Record<ProductoCobro, readonly string[]> = {
  enterprise: ["pro", "empresa"],
  pro: ["pro"],
  // Corporativo es a medida: sigue por ventas.
  evaluar: ["esencial", "profesional"],
  boost: ["7", "15", "30"],
};

export const MESES_VALIDOS = [1, 3, 12] as const;

/** ¿La compra es una de las que existen? Nada que llegue del navegador se usa sin pasar por acá. */
export function compraValida(c: Partial<Compra> | null | undefined): c is Compra {
  if (!c || typeof c.product !== "string" || typeof c.plan !== "string") return false;
  const planes = PLANES_COBRABLES[c.product as ProductoCobro];
  if (!planes || !planes.includes(c.plan)) return false;
  if (c.product === "boost") return c.months === undefined;
  return MESES_VALIDOS.includes(c.months as 1 | 3 | 12);
}

/**
 * Guaraníes → centavos de dólar, redondeado a dólares enteros (mínimo 1).
 * fxPyg: guaraníes por dólar, el mismo que el admin carga para los precios
 * por país.
 */
export function centavosUsd(gs: number, fxPyg: number): number {
  if (!(gs > 0) || !(fxPyg > 0)) return 0;
  return Math.max(1, Math.round(gs / fxPyg)) * 100;
}

/** Meses que se pagan en cada cobro: el anual cuesta 10. */
export function mesesPagados(months: number): number {
  return months === 12 ? 10 : months;
}

export type Moneda = "PYG" | "USD";

/** Lo que se cobra: guaraníes enteros o dólares (no centavos, como pide dLocal Go). */
export type Monto = { valor: number; moneda: Moneda };

/** Guaraníes del admin → monto en la moneda del cobro. 0 si falta el precio. */
export function montoCobro(gs: number, moneda: Moneda, fxPyg: number): Monto {
  if (moneda === "USD") return { valor: centavosUsd(gs, fxPyg) / 100, moneda };
  return { valor: gs > 0 ? Math.round(gs) : 0, moneda };
}

/** "Gs. 450.000" o "USD 44". */
export function formatoMonto(m: Monto): string {
  if (m.moneda === "USD") return formatoUsd(Math.round(m.valor * 100));
  return `Gs. ${Math.round(m.valor).toLocaleString("es-PY")}`;
}

/** "USD 44" o "USD 44,50". */
export function formatoUsd(centavos: number): string {
  const d = centavos / 100;
  return `USD ${Number.isInteger(d) ? d : d.toFixed(2).replace(".", ",")}`;
}

// ── Datos ocultos del checkout ─────────────────────────────────

/**
 * Quién paga y qué compró. Con dLocal Go no viaja al proveedor: queda en
 * billing_payments y el pago solo lleva su id como order_id. Con Lemon
 * Squeezy viajaba en checkout_data.custom y volvía como meta.custom_data;
 * por eso todo es string.
 */
export type DatosCompra = {
  /** Quién paga: id de la empresa o de la persona. */
  payer_id: string;
  /** Quién apretó el botón (el dueño, un admin del equipo o la persona). */
  buyer_id: string;
  product: ProductoCobro;
  plan: string;
  months?: string;
  /** Solo destacados: la solicitud de boost_requests que se paga. */
  boost_id?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida lo que vuelve del webhook. Devuelve null si algo no cierra. */
export function leerDatosCompra(raw: unknown): (DatosCompra & { compra: Compra }) | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const payer = String(d.payer_id ?? "");
  const buyer = String(d.buyer_id ?? "");
  if (!UUID.test(payer) || !UUID.test(buyer)) return null;
  const product = String(d.product ?? "") as ProductoCobro;
  const plan = String(d.plan ?? "");
  const months = d.months === undefined || d.months === null ? undefined : Number(d.months);
  const compra: Partial<Compra> =
    product === "boost" ? { product, plan } : { product, plan, months };
  if (!compraValida(compra)) return null;
  const boost = d.boost_id === undefined ? undefined : String(d.boost_id);
  if (product === "boost" && (!boost || !UUID.test(boost))) return null;
  return {
    payer_id: payer,
    buyer_id: buyer,
    product,
    plan,
    ...(months ? { months: String(months) } : {}),
    ...(boost ? { boost_id: boost } : {}),
    compra,
  };
}

// ── Pagos de dLocal Go ─────────────────────────────────────────

/**
 * ¿Este pago, tal como lo devuelve la API, paga lo que esperábamos? Se
 * exige el estado PAID, nuestro order_id, la misma moneda y al menos el
 * monto: si alguien edita el pago o un pago de otra compra trae nuestro id,
 * no activa nada.
 */
export function pagoCubre(
  pago: { status?: unknown; order_id?: unknown; currency?: unknown; amount?: unknown } | null | undefined,
  esperado: { orderId: string; monto: Monto }
): boolean {
  if (!pago || pago.status !== "PAID") return false;
  if (String(pago.order_id ?? "") !== esperado.orderId) return false;
  if (String(pago.currency ?? "").toUpperCase() !== esperado.monto.moneda) return false;
  const pagado = Number(pago.amount);
  return Number.isFinite(pagado) && pagado + 0.005 >= esperado.monto.valor;
}

// ── Estado de la suscripción (Lemon Squeezy, heredado) ─────────

export type EstadoLs =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

/**
 * Hasta cuándo da acceso una suscripción, según su estado en Lemon Squeezy.
 *  - active / on_trial: hasta la próxima renovación.
 *  - past_due: el cobro falló y Lemon Squeezy reintenta; se mantiene hasta
 *    la fecha de renovación original para no cortar en medio del reintento.
 *  - cancelled: sigue hasta que termina lo pagado (ends_at).
 *  - paused, unpaid, expired: sin acceso desde ya.
 * Devuelve null si no da acceso.
 */
export function accesoHasta(
  status: string,
  renewsAt: string | null | undefined,
  endsAt: string | null | undefined,
  ahora = Date.now()
): string | null {
  const futuro = (iso: string | null | undefined) =>
    iso && Date.parse(iso) > ahora ? new Date(Date.parse(iso)).toISOString() : null;
  switch (status) {
    case "active":
    case "on_trial":
    case "past_due":
      return futuro(renewsAt) ?? futuro(endsAt);
    case "cancelled":
      return futuro(endsAt) ?? futuro(renewsAt);
    default:
      return null;
  }
}
