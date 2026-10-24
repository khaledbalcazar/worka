// Reglas del cobro con Lemon Squeezy que no dependen de la red ni de la base.
//
// Sin imports a propósito: las pruebas de tests/billing las corren con
// node --test directo. Lo que habla con la API vive en lemonsqueezy.ts y lo
// que toca la base, en activar.ts.
//
// Decisiones (24/10/2026):
//   - El precio sale de Worka (site_settings, en guaraníes) y se manda en
//     cada checkout como custom_price. Lemon Squeezy lo usa también en las
//     renovaciones. Así hay una sola lista de precios: la del admin.
//   - Se cobra en dólares: el precio en guaraníes se convierte con el tipo de
//     cambio del admin (fx_usd_pyg) y se redondea a dólares enteros.
//   - Los planes se renuevan solos (mensual, trimestral o anual).
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
 * Clave de la variante en la configuración. Cada combinación tiene su
 * variante en Lemon Squeezy (es lo que fija el intervalo de cobro y el
 * nombre que ve el cliente): "enterprise:pro:3", "boost:15".
 */
export function claveVariante(c: Compra): string {
  return c.product === "boost" ? `boost:${c.plan}` : `${c.product}:${c.plan}:${c.months}`;
}

/** Todas las claves que hay que configurar, en orden para la guía. */
export function todasLasClaves(): string[] {
  const out: string[] = [];
  for (const product of ["enterprise", "pro", "evaluar"] as const) {
    for (const plan of PLANES_COBRABLES[product]) {
      for (const months of MESES_VALIDOS) out.push(claveVariante({ product, plan, months }));
    }
  }
  for (const plan of PLANES_COBRABLES.boost) out.push(claveVariante({ product: "boost", plan }));
  return out;
}

/**
 * Lee LEMONSQUEEZY_VARIANTS: un JSON {"enterprise:pro:1": 123456, ...}.
 * Ignora lo que no sea un id numérico positivo, para que un error de tipeo
 * deje esa compra sin botón en vez de mandar a un checkout ajeno.
 */
export function leerVariantes(json: string | undefined | null): Record<string, string> {
  if (!json) return {};
  let crudo: unknown;
  try {
    crudo = JSON.parse(json);
  } catch {
    return {};
  }
  if (!crudo || typeof crudo !== "object" || Array.isArray(crudo)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(crudo as Record<string, unknown>)) {
    const id = String(v ?? "").trim();
    if (/^\d+$/.test(id) && Number(id) > 0) out[k] = id;
  }
  return out;
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

/** "USD 44" o "USD 44,50". */
export function formatoUsd(centavos: number): string {
  const d = centavos / 100;
  return `USD ${Number.isInteger(d) ? d : d.toFixed(2).replace(".", ",")}`;
}

// ── Datos ocultos del checkout ─────────────────────────────────

/**
 * Lo que viaja en checkout_data.custom y vuelve en el webhook como
 * meta.custom_data. Todo string: Lemon Squeezy no garantiza tipos.
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

// ── Estado de la suscripción ───────────────────────────────────

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
