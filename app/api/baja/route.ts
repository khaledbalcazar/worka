import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { verificarBaja } from "@/lib/unsubscribe";

/* Baja en un clic.
 *
 * Gmail y Yahoo exigen desde 2024 que todo correo enviado en volumen traiga
 * la cabecera List-Unsubscribe-Post: List-Unsubscribe=One-Click. Cuando la
 * persona toca "Cancelar suscripción" arriba del correo, el cliente hace un
 * POST a esta dirección por su cuenta, sin abrir el navegador y sin sesión.
 * Por eso el permiso viaja en la firma del token y no en una cookie.
 *
 * Si esto no existiera, la única salida sería marcar spam — y una marca de
 * spam no se lleva solo el correo de novedades: baja la reputación del
 * dominio y empieza a hundir también las invitaciones a entrevistas.
 */
export const dynamic = "force-dynamic";

async function darDeBaja(token: string): Promise<boolean> {
  const userId = verificarBaja(token);
  if (!userId) return false;
  const admin = getAdminClient();
  if (!admin) return false;

  // La preferencia vive en la tabla del rol. Se apaga en las dos sin
  // preguntar primero cuál es: son dos updates baratos y evitan una consulta.
  await Promise.all([
    admin
      .from("candidates")
      .update({ email_notifications: false, alerts_enabled: false })
      .eq("id", userId),
    admin
      .from("companies")
      .update({ email_notifications: false })
      .eq("id", userId),
  ]);
  return true;
}

export async function POST(request: Request) {
  // El cliente de correo manda el token en la query del enlace de la
  // cabecera; algunos además repiten el cuerpo del formulario.
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const ok = await darDeBaja(token);
  // Siempre 200: un 4xx hace que el cliente muestre "no pudimos darte de
  // baja" y la persona termine marcando spam igual.
  return NextResponse.json({ ok });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  await darDeBaja(token);
  return NextResponse.redirect(new URL(`/baja/${token}`, request.url));
}
