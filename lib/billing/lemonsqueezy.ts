import "server-only";

// Lemon Squeezy, heredado: desde el 04/11/2026 los cobros nuevos van por
// dLocal Go (dlocalgo.ts) y acá ya no se crean checkouts.
//
// Lo que queda sirve solo a las suscripciones que se contrataron antes:
// Lemon Squeezy las sigue renovando hasta que se cancelen, y su webhook
// (app/api/webhooks/lemonsqueezy) las sigue extendiendo o cortando. Con las
// variables borradas de Vercel todo esto queda apagado.
//
// Configuración (Vercel → Environment Variables):
//   LEMONSQUEEZY_API_KEY         clave de la API
//   LEMONSQUEEZY_STORE_ID        id numérico de la tienda
//   LEMONSQUEEZY_WEBHOOK_SECRET  secreto con que se firmó el webhook
// Ver docs/pagos-lemonsqueezy.md.

const API = "https://api.lemonsqueezy.com/v1";

type Config = {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
};

export function billingConfig(): Config | null {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  if (!apiKey || !storeId || !/^\d+$/.test(storeId)) return null;
  return {
    apiKey,
    storeId,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() ?? "",
  };
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
  try {
    const res = await fetch(`${API}/subscriptions/${id}`, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[worka:billing] leer suscripción ${id} ${res.status}: ${(await res.text()).slice(0, 400)}`);
      return null;
    }
    return ((await res.json()) as { data: SuscripcionLs }).data;
  } catch (e) {
    console.error(`[worka:billing] leer suscripción ${id}:`, e instanceof Error ? e.message : e);
    return null;
  }
}
