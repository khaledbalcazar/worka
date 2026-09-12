import { NextResponse } from "next/server";
import { enviarDigest } from "@/lib/digest";

/* Correo de vacantes verificadas.
 *
 * La lógica vive en lib/digest.ts porque también la usa el botón "Enviar
 * ahora" del backoffice. Acá solo queda el portero del cron.
 *
 * Corre TODOS LOS DÍAS a las 10, pero cada persona recibe uno cada siete.
 * No es un capricho: el plan gratuito de Resend da 100 correos por día y ese
 * cupo lo comparte todo lo que manda Worka. Con una sola corrida semanal el
 * correo llegaría a unas 70 personas y el resto no se enteraría nunca; con
 * una tanda por día la cola se drena sola y cada quien lo sigue recibiendo
 * una vez por semana.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ ok: false }, { status: 401 });
  }

  const r = await enviarDigest();
  return NextResponse.json(r);
}
