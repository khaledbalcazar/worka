import "server-only";
import type { Moneda } from "./catalogo";

// Cliente mínimo de la API de dLocal Go (https://docs.dlocalgo.com/integration-api).
//
// Sin SDK a propósito: son dos llamadas (crear un pago y leerlo), igual que
// con Lemon Squeezy.
//
// Configuración (Vercel → Environment Variables, nunca en el código ni en el
// navegador; la API Key de dLocal Go se llama "publicable" pero acá viaja
// siempre junto a la secreta, así que tampoco sale del servidor):
//   DLOCALGO_API_KEY     API Key (Integraciones → Integración API)
//   DLOCALGO_SECRET_KEY  Secret Key, la misma pantalla
//   DLOCALGO_SANDBOX     "1" mientras se prueba (claves del panel de sandbox)
//   DLOCALGO_CURRENCY    "PYG" (por defecto) o "USD"
//   DLOCALGO_COUNTRY     "PY" por defecto; vacío deja que la persona lo elija
// Ver docs/pagos-dlocalgo.md.

type Config = {
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
  moneda: Moneda;
  /** Null: el checkout le pregunta el país a la persona. */
  pais: string | null;
  api: string;
};

export function dlocalConfig(): Config | null {
  const apiKey = process.env.DLOCALGO_API_KEY?.trim();
  const secretKey = process.env.DLOCALGO_SECRET_KEY?.trim();
  if (!apiKey || !secretKey) return null;
  const sandbox = /^(1|true|si|sí)$/i.test(process.env.DLOCALGO_SANDBOX?.trim() ?? "");
  const moneda: Moneda = process.env.DLOCALGO_CURRENCY?.trim().toUpperCase() === "USD" ? "USD" : "PYG";
  // undefined → PY; "" → que elija la persona. Cualquier otra cosa que no sea
  // un código de dos letras se ignora, para no mandar un país inventado.
  const crudo = process.env.DLOCALGO_COUNTRY;
  const pais = crudo === undefined ? "PY" : /^[a-z]{2}$/i.test(crudo.trim()) ? crudo.trim().toUpperCase() : null;
  return {
    apiKey,
    secretKey,
    sandbox,
    moneda,
    pais,
    api: sandbox ? "https://api-sbx.dlocalgo.com" : "https://api.dlocalgo.com",
  };
}

async function llamar<T>(
  cfg: Config,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<{ ok: true; data: T } | { ok: false; status: number; detalle: string }> {
  try {
    const res = await fetch(`${cfg.api}${path}`, {
      method: init.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}:${cfg.secretKey}`,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      // El cuerpo de error es la descripción del problema; se recorta para el log.
      return { ok: false, status: res.status, detalle: (await res.text()).slice(0, 400) };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, status: 0, detalle: e instanceof Error ? e.message : "sin conexión" };
  }
}

/** Estados de un pago en dLocal Go. */
export type EstadoDlocal = "PENDING" | "PAID" | "REJECTED" | "CANCELLED" | "EXPIRED";

export type PagoDlocal = {
  id: string;
  amount: number;
  currency: string;
  status: EstadoDlocal | string;
  order_id?: string | null;
  approved_date?: string | null;
  redirect_url?: string | null;
};

export type NuevoPago = {
  /** Nuestro id (billing_payments.id): vuelve como order_id. */
  orderId: string;
  monto: number;
  descripcion: string;
  email?: string | null;
  nombre?: string | null;
  /** A dónde vuelve después de pagar. */
  exito: string;
  /** A dónde vuelve si abandona el checkout. */
  volver: string;
  /** URL pública del webhook. */
  aviso: string;
};

/** Crea el pago y devuelve su id y la URL del checkout. */
export async function crearPago(
  n: NuevoPago
): Promise<{ ok: true; id: string; url: string } | { ok: false; error: string }> {
  const cfg = dlocalConfig();
  if (!cfg) return { ok: false, error: "El pago con tarjeta todavía no está configurado." };

  const r = await llamar<PagoDlocal>(cfg, "/v1/payments", {
    method: "POST",
    body: {
      amount: n.monto,
      currency: cfg.moneda,
      ...(cfg.pais ? { country: cfg.pais } : {}),
      order_id: n.orderId,
      description: n.descripcion.slice(0, 100),
      success_url: n.exito,
      back_url: n.volver,
      notification_url: n.aviso,
      // Sin estos datos el checkout los pide igual; con ellos, la persona
      // escribe menos.
      ...(n.email || n.nombre
        ? {
            payer: {
              ...(n.nombre ? { name: n.nombre.slice(0, 100) } : {}),
              ...(n.email ? { email: n.email.slice(0, 100) } : {}),
            },
          }
        : {}),
      // Un checkout armado para una persona no tiene que servir para siempre:
      // si alguien comparte el enlace, vence en un día.
      expiration_type: "DAYS",
      expiration_value: 1,
    },
  });

  if (!r.ok) {
    console.error(`[worka:billing] dLocal Go crear pago ${r.status}: ${r.detalle}`);
    return { ok: false, error: "No pudimos abrir el pago. Probá de nuevo en un rato." };
  }
  if (!r.data.id || !r.data.redirect_url) {
    console.error("[worka:billing] dLocal Go no devolvió id o redirect_url");
    return { ok: false, error: "No pudimos abrir el pago. Probá de nuevo en un rato." };
  }
  return { ok: true, id: r.data.id, url: r.data.redirect_url };
}

/**
 * Lee un pago. Es la única fuente de verdad sobre si se pagó: el aviso del
 * webhook solo trae el id, y la URL de éxito la puede abrir cualquiera.
 */
export async function leerPago(id: string): Promise<PagoDlocal | null> {
  const cfg = dlocalConfig();
  // Ids como "DP-54354": nada que pueda cambiar la ruta de la llamada.
  if (!cfg || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  const r = await llamar<PagoDlocal>(cfg, `/v1/payments/${id}`, { method: "GET" });
  if (!r.ok) {
    console.error(`[worka:billing] dLocal Go leer pago ${id} ${r.status}: ${r.detalle}`);
    return null;
  }
  return r.data;
}
