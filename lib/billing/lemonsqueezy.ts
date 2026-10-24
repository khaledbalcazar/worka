import "server-only";
import { claveVariante, leerVariantes, type Compra } from "./catalogo";

// Cliente mínimo de la API de Lemon Squeezy (https://docs.lemonsqueezy.com/api).
//
// Sin SDK a propósito: son dos llamadas (crear checkout y leer una
// suscripción), y un paquete más es una dependencia más que actualizar.
//
// Configuración (Vercel → Environment Variables, nunca en el código):
//   LEMONSQUEEZY_API_KEY         clave de la API (la de prueba o la real)
//   LEMONSQUEEZY_STORE_ID        id numérico de la tienda
//   LEMONSQUEEZY_WEBHOOK_SECRET  secreto con que se firmó el webhook
//   LEMONSQUEEZY_VARIANTS        JSON {"enterprise:pro:1": 123456, ...}
//   LEMONSQUEEZY_TEST_MODE       "1" mientras se prueba
// Ver docs/pagos-lemonsqueezy.md.

const API = "https://api.lemonsqueezy.com/v1";

type Config = {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
  variants: Record<string, string>;
  testMode: boolean;
};

export function billingConfig(): Config | null {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  if (!apiKey || !storeId || !/^\d+$/.test(storeId)) return null;
  return {
    apiKey,
    storeId,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() ?? "",
    variants: leerVariantes(process.env.LEMONSQUEEZY_VARIANTS),
    testMode: /^(1|true|si|sí)$/i.test(process.env.LEMONSQUEEZY_TEST_MODE?.trim() ?? ""),
  };
}

/** ¿Hay checkout con tarjeta para esta compra? Sin variante, el botón no aparece. */
export function cobroDisponible(compra: Compra): boolean {
  const cfg = billingConfig();
  return !!cfg && !!cfg.variants[claveVariante(compra)];
}

async function llamar<T>(
  cfg: Config,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<{ ok: true; data: T } | { ok: false; status: number; detalle: string }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: init.method,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      // El cuerpo de error no lleva datos sensibles (es la descripción del
      // problema); se recorta para el log.
      return { ok: false, status: res.status, detalle: (await res.text()).slice(0, 400) };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, status: 0, detalle: e instanceof Error ? e.message : "sin conexión" };
  }
}

export type NuevoCheckout = {
  compra: Compra;
  /** Precio de cada cobro en centavos de dólar (se usa también al renovar). */
  centavos: number;
  /** Lo que vuelve en el webhook como meta.custom_data. */
  custom: Record<string, string>;
  email?: string | null;
  nombre?: string | null;
  /** A dónde vuelve después de pagar. */
  volver: string;
};

/** Crea un checkout de un solo uso y devuelve su URL. */
export async function crearCheckout(
  n: NuevoCheckout
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const cfg = billingConfig();
  if (!cfg) return { ok: false, error: "El pago con tarjeta todavía no está configurado." };
  const variante = cfg.variants[claveVariante(n.compra)];
  if (!variante) return { ok: false, error: "Esta opción todavía no se puede pagar con tarjeta." };

  const r = await llamar<{ data: { attributes: { url: string } } }>(cfg, "/checkouts", {
    method: "POST",
    body: {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: n.centavos,
          product_options: {
            redirect_url: n.volver,
            enabled_variants: [Number(variante)],
          },
          checkout_options: { embed: false },
          checkout_data: {
            ...(n.email ? { email: n.email } : {}),
            ...(n.nombre ? { name: n.nombre } : {}),
            custom: n.custom,
          },
          // Un checkout armado para una persona no tiene que servir para
          // siempre: si alguien comparte el enlace, vence en un día.
          expires_at: new Date(Date.now() + 86_400_000).toISOString(),
          test_mode: cfg.testMode,
        },
        relationships: {
          store: { data: { type: "stores", id: cfg.storeId } },
          variant: { data: { type: "variants", id: variante } },
        },
      },
    },
  });

  if (!r.ok) {
    console.error(`[worka:billing] crear checkout ${r.status}: ${r.detalle}`);
    return { ok: false, error: "No pudimos abrir el pago. Probá de nuevo en un rato." };
  }
  return { ok: true, url: r.data.data.attributes.url };
}

export type SuscripcionLs = {
  id: string;
  attributes: {
    status: string;
    renews_at: string | null;
    ends_at: string | null;
    customer_id: number | string;
    card_brand: string | null;
    card_last_four: string | null;
    test_mode: boolean;
    urls?: { customer_portal?: string; update_payment_method?: string };
  };
};

/** Lee una suscripción (para sincronizar o para abrir el portal del cliente). */
export async function leerSuscripcion(id: string): Promise<SuscripcionLs | null> {
  const cfg = billingConfig();
  if (!cfg || !/^\d+$/.test(id)) return null;
  const r = await llamar<{ data: SuscripcionLs }>(cfg, `/subscriptions/${id}`, { method: "GET" });
  if (!r.ok) {
    console.error(`[worka:billing] leer suscripción ${id} ${r.status}: ${r.detalle}`);
    return null;
  }
  return r.data.data;
}
