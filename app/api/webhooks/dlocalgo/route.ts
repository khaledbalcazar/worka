import { getAdminClient } from "@/lib/supabase/admin";
import { dlocalConfig } from "@/lib/billing/dlocalgo";
import { firmaDlocalValida } from "@/lib/billing/firma";
import { confirmarPago } from "@/lib/billing/pagos";

// Aviso de dLocal Go: llega cada vez que cambia el estado de un pago, y es
// lo que activa el plan.
//
// Orden de las cosas, y por qué:
//   1. La firma, antes que nada (cabecera Authorization, HMAC de la API Key
//      más el cuerpo). Sin firma válida no se lee el cuerpo.
//   2. El cuerpo solo trae {"payment_id"}: el estado se le pregunta a la API
//      dentro de confirmarPago, que además es idempotente (un pago activa
//      una sola vez aunque el aviso llegue repetido o junto con la página de
//      retorno).
//   3. Si falla por algo pasajero se contesta 500: dLocal Go reintenta cada
//      10 minutos durante 30 días. Si el error es de los datos, 200 y queda
//      anotado en billing_payments.error para revisarlo a mano.
//
// POST no se cachea en Next 16 (route handlers: solo GET puede cachearse).

export async function POST(request: Request) {
  const cfg = dlocalConfig();
  if (!cfg) return new Response("Cobro no configurado", { status: 503 });

  const cuerpo = await request.text();
  if (!firmaDlocalValida(cuerpo, request.headers.get("authorization"), cfg.apiKey, cfg.secretKey)) {
    return new Response("Firma inválida", { status: 401 });
  }

  let pagoId = "";
  try {
    pagoId = String((JSON.parse(cuerpo) as { payment_id?: unknown }).payment_id ?? "");
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  if (!pagoId) return new Response("Aviso incompleto", { status: 400 });

  const r = await confirmarPago({ pagoId });

  // Registro de cada aviso, para revisar a mano. La clave junta el pago y el
  // estado: el mismo cuerpo llega en cada cambio de estado, así que el
  // cuerpo solo no alcanza para distinguirlos. No decide nada: la
  // idempotencia la da billing_payments.activated_at.
  const admin = getAdminClient();
  if (admin) {
    await admin.from("billing_events").upsert(
      {
        event_key: `dlocalgo:${pagoId}:${r.estado ?? "?"}`,
        event_name: `dlocalgo.payment.${(r.estado ?? "unknown").toLowerCase()}`,
        provider_object_id: pagoId,
        test_mode: cfg.sandbox,
        payload: JSON.parse(cuerpo),
        processed_at: r.ok || !r.reintentar ? new Date().toISOString() : null,
        error: r.ok ? (r.nota ?? null) : r.error.slice(0, 500),
      },
      { onConflict: "event_key" }
    );
  }

  if (!r.ok) {
    console.error(`[worka:billing] dLocal Go ${pagoId}: ${r.error}`);
    return new Response("Error al procesar", { status: r.reintentar ? 500 : 200 });
  }
  return new Response("ok", { status: 200 });
}
