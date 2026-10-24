import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { fxPerUsd } from "@/lib/currency";
import { totalPrice } from "@/lib/plans";
import { BOOST_PLANS } from "@/lib/types";
import {
  MESES_VALIDOS,
  PLANES_COBRABLES,
  accesoHasta,
  centavosUsd,
  claveVariante,
  mesesPagados,
  type Compra,
} from "./catalogo";
import { billingConfig } from "./lemonsqueezy";

// Precio y disponibilidad del pago con tarjeta, para las pantallas y para
// el checkout. Las dos cosas salen de acá, así lo que se muestra es
// exactamente lo que se cobra.

type Settings = Record<string, string | undefined>;

function parseGs(v: string | undefined): number | null {
  const n = Number((v ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const EVALUAR_DEFAULT: Record<string, number> = { esencial: 390_000, profesional: 790_000 };

/** Precio en guaraníes de cada cobro (el anual, a precio de 10 meses). */
export function precioGs(c: Compra, settings: Settings): number {
  if (c.product === "boost") {
    return BOOST_PLANS.find((p) => p.days === Number(c.plan))?.price_gs ?? 0;
  }
  if (c.product === "evaluar") {
    const mensual = parseGs(settings[`evaluar_precio_${c.plan}`]) ?? EVALUAR_DEFAULT[c.plan] ?? 0;
    return mensual * mesesPagados(c.months ?? 1);
  }
  return totalPrice(c.product, c.plan, c.months ?? 1, settings);
}

/** Lo mismo en centavos de dólar, con el tipo de cambio del admin. */
export function precioUsd(c: Compra, settings: Settings): number {
  return centavosUsd(precioGs(c, settings), fxPerUsd("PYG", settings));
}

/**
 * Destacados con tarjeta: días → centavos de dólar, solo los que tienen
 * variante configurada. Null si el cobro con tarjeta no está configurado.
 */
export function ofertaDestacados(settings: Settings): Record<string, number> | null {
  const cfg = billingConfig();
  if (!cfg) return null;
  const out: Record<string, number> = {};
  for (const plan of PLANES_COBRABLES.boost) {
    const compra: Compra = { product: "boost", plan };
    const centavos = precioUsd(compra, settings);
    if (cfg.variants[claveVariante(compra)] && centavos > 0) out[plan] = centavos;
  }
  return Object.keys(out).length ? out : null;
}

export type SuscripcionVigente = {
  status: string;
  plan: string;
  months: number;
  /** Hasta cuándo da acceso (renovación o fin, según el estado). */
  hasta: string | null;
  /** true si se va a renovar sola; false si se canceló y termina en `hasta`. */
  renueva: boolean;
  tarjeta: string | null;
};

export type OfertaTarjeta = {
  /** "plan:meses" → hay variante configurada. */
  disponible: Record<string, boolean>;
  /** "plan:meses" → centavos de dólar por cobro. */
  usd: Record<string, number>;
  suscripcion: SuscripcionVigente | null;
};

/**
 * Qué se puede pagar con tarjeta para un producto con suscripción. Null si
 * el cobro con tarjeta no está configurado: la pantalla queda como antes,
 * solo con el cobro manual.
 */
export async function ofertaTarjeta(
  product: "enterprise" | "pro" | "evaluar",
  payerId: string | null,
  settings: Settings
): Promise<OfertaTarjeta | null> {
  const cfg = billingConfig();
  if (!cfg) return null;

  const disponible: Record<string, boolean> = {};
  const usd: Record<string, number> = {};
  for (const plan of PLANES_COBRABLES[product]) {
    for (const months of MESES_VALIDOS) {
      const compra: Compra = { product, plan, months };
      const k = `${plan}:${months}`;
      usd[k] = precioUsd(compra, settings);
      disponible[k] = !!cfg.variants[claveVariante(compra)] && usd[k] > 0;
    }
  }

  let suscripcion: SuscripcionVigente | null = null;
  const admin = getAdminClient();
  if (admin && payerId) {
    const { data } = await admin
      .from("billing_subscriptions")
      .select("status, plan, months, renews_at, ends_at, card_brand, card_last_four, updated_at")
      .eq("user_id", payerId)
      .eq("product", product)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      const hasta = accesoHasta(data.status, data.renews_at, data.ends_at);
      if (hasta) {
        suscripcion = {
          status: data.status,
          plan: data.plan,
          months: data.months,
          hasta,
          renueva: data.status !== "cancelled",
          tarjeta: data.card_last_four
            ? `${(data.card_brand ?? "Tarjeta").replace(/^\w/, (c: string) => c.toUpperCase())} •••• ${data.card_last_four}`
            : null,
        };
      }
    }
  }

  return { disponible, usd, suscripcion };
}
