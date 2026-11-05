import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { dlocalConfig } from "@/lib/billing/dlocalgo";
import { confirmarPago } from "@/lib/billing/pagos";

// Red de seguridad de los pagos con tarjeta, una vez por día.
//
// Lo normal es que el plan lo active el aviso de dLocal Go en segundos, o la
// página de retorno cuando la persona vuelve. Si las dos cosas fallan (un
// aviso mal configurado, alguien que cerró la pestaña), acá se le pregunta a
// la API por cada pago de los últimos tres días que quedó sin activar.
// Los checkouts vencen en un día, así que más atrás no hay nada que esperar.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!dlocalConfig()) return NextResponse.json({ ok: true, reason: "Cobro no configurado" });
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ ok: false, reason: "Falta SUPABASE_SERVICE_ROLE_KEY" });

  const desde = new Date(Date.now() - 3 * 86_400_000).toISOString();
  const { data, error } = await admin
    .from("billing_payments")
    .select("id")
    .is("activated_at", null)
    .not("provider_payment_id", "is", null)
    .in("status", ["CREATED", "PENDING", "PAID"])
    .gte("created_at", desde)
    .limit(200);
  if (error) return NextResponse.json({ ok: false, reason: error.message });

  let activados = 0;
  const errores: string[] = [];
  for (const { id } of data ?? []) {
    const r = await confirmarPago({ id: id as string });
    if (!r.ok) errores.push(`${id}: ${r.error}`);
    else if (r.estado === "PAID" && r.nota !== "ya activado") activados++;
  }
  if (errores.length) console.error("[worka:billing] cron pagos:", errores.join(" | "));
  return NextResponse.json({ ok: true, revisados: data?.length ?? 0, activados, errores: errores.length });
}
