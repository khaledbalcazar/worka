import { getAdminClient } from "@/lib/supabase/admin";
import { billingConfig } from "@/lib/billing/lemonsqueezy";
import { claveEvento, firmaValida } from "@/lib/billing/firma";
import { procesarEvento, type Evento } from "@/lib/billing/activar";

// Webhook de Lemon Squeezy: es lo que activa el plan cuando el pago entra.
//
// Orden de las cosas, y por qué:
//   1. La firma, antes que nada. Sin firma válida no se lee el cuerpo: si
//      no, cualquiera que adivine la URL podría activarse un plan gratis.
//   2. El evento se guarda con una clave única (sha256 del cuerpo). Lemon
//      Squeezy reintenta hasta tres veces si no le respondemos 200; un
//      reintento de algo ya procesado responde 200 sin volver a activar.
//   3. Se procesa. Si falla por algo pasajero (la base no responde) se
//      contesta 500 para que Lemon Squeezy reintente; si el error es de los
//      datos, 200 y queda anotado para revisarlo a mano.
//
// POST no se cachea en Next 16 (route handlers: solo GET puede cachearse).

export async function POST(request: Request) {
  const cfg = billingConfig();
  if (!cfg || !cfg.webhookSecret) {
    return new Response("Cobro no configurado", { status: 503 });
  }

  const cuerpo = await request.text();
  if (!firmaValida(cuerpo, request.headers.get("x-signature"), cfg.webhookSecret)) {
    return new Response("Firma inválida", { status: 401 });
  }

  let ev: Evento;
  try {
    ev = JSON.parse(cuerpo) as Evento;
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  if (!ev?.meta?.event_name || !ev?.data?.id) {
    return new Response("Evento incompleto", { status: 400 });
  }

  const admin = getAdminClient();
  if (!admin) return new Response("Falta la service role", { status: 503 });

  const clave = claveEvento(cuerpo);
  const { data: previo } = await admin
    .from("billing_events")
    .select("id, processed_at")
    .eq("event_key", clave)
    .maybeSingle();
  if (previo?.processed_at) return new Response("Ya procesado", { status: 200 });

  let eventoId = previo?.id as string | undefined;
  if (!eventoId) {
    const { data: nuevo, error } = await admin
      .from("billing_events")
      .insert({
        event_key: clave,
        event_name: ev.meta.event_name,
        provider_object_id: String(ev.data.id),
        test_mode: !!ev.meta.test_mode,
        payload: ev,
      })
      .select("id")
      .single();
    if (error) {
      // Dos entregas simultáneas: la otra ya lo tomó.
      if (error.code === "23505") return new Response("En proceso", { status: 200 });
      console.error("[worka:billing] guardar evento:", error.message);
      return new Response("No pudimos guardar el evento", { status: 500 });
    }
    eventoId = nuevo.id as string;
  }

  const r = await procesarEvento(ev);

  await admin
    .from("billing_events")
    .update(
      r.ok
        ? { processed_at: new Date().toISOString(), error: r.nota ?? null }
        : { error: r.error.slice(0, 500), ...(r.reintentar ? {} : { processed_at: new Date().toISOString() }) }
    )
    .eq("id", eventoId);

  if (!r.ok) {
    console.error(`[worka:billing] ${ev.meta.event_name} ${ev.data.id}: ${r.error}`);
    return new Response("Error al procesar", { status: r.reintentar ? 500 : 200 });
  }
  return new Response("ok", { status: 200 });
}
