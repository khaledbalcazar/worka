import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { emailEnabled, emailLayout, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";

// Recordatorio a quien fue invitado y no arrancó.
//
// La mayoría de la gente abre el mail, se distrae y no vuelve nunca. Un solo
// recordatorio a las 48 h levanta bastante la cantidad que termina. Es UNO
// solo por persona a propósito: insistir más es spam y hace que marquen el
// remitente, lo que rompe el envío para todos los demás.
export const dynamic = "force-dynamic";

const HORAS = 48;

export async function GET(request: Request) {
  // Vercel Cron manda este header; sin el secreto, cualquiera podría disparar
  // una tanda de emails desde afuera.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({
      ok: false,
      reason: "Falta SUPABASE_SERVICE_ROLE_KEY",
    });
  }
  if (!emailEnabled()) {
    return NextResponse.json({ ok: false, reason: "Falta RESEND_API_KEY" });
  }

  const corte = new Date(Date.now() - HORAS * 3600_000).toISOString();

  // Solo quien sigue en 'invitado' (nunca abrió), tiene email, todavía no
  // recibió recordatorio y pertenece a un proceso activo.
  const { data, error } = await admin
    .from("evaluar_participants")
    .select(
      "id, token, full_name, email, process:evaluar_processes(title, status, deadline_at, company_id)"
    )
    .eq("status", "invitado")
    .is("reminded_at", null)
    .not("email", "is", null)
    .lt("created_at", corte)
    .limit(200);

  if (error) {
    console.error("evaluar-recordatorios:", error);
    return NextResponse.json({ error: "Error al consultar" }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    token: string;
    full_name: string;
    email: string;
    process: {
      title: string;
      status: string;
      deadline_at: string | null;
      company_id: string;
    } | null;
  }[];

  const base = SITE_URL.replace(/\/$/, "").replace("://", "://evaluar.");
  const ahora = Date.now();
  let enviados = 0;

  for (const r of rows) {
    const proceso = r.process;
    // Proceso cerrado o plazo vencido: recordar sería mandarlo a una puerta
    // que ya no abre.
    if (!proceso || proceso.status !== "activo") continue;
    if (proceso.deadline_at && new Date(proceso.deadline_at).getTime() < ahora)
      continue;

    const { data: empresa } = await admin
      .from("companies")
      .select("trade_name")
      .eq("id", proceso.company_id)
      .maybeSingle();
    const nombreEmpresa =
      (empresa as { trade_name?: string } | null)?.trade_name ?? "La empresa";

    const url = `${base}/e/${r.token}`;
    const cierre = proceso.deadline_at
      ? `<p>Tenés tiempo hasta el <strong>${new Date(
          proceso.deadline_at
        ).toLocaleDateString("es-PY", {
          day: "numeric",
          month: "long",
        })}</strong>.</p>`
      : "";

    const ok = await sendEmail({
      to: r.email,
      subject: `Te queda pendiente la evaluación de ${nombreEmpresa}`,
      html: emailLayout(`
        <p>Hola${r.full_name ? ` ${r.full_name}` : ""},</p>
        <p>Te habíamos invitado a la evaluación de
        <strong>${proceso.title}</strong> en ${nombreEmpresa} y todavía no la
        empezaste.</p>
        ${cierre}
        <p style="margin:24px 0">
          <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">
            Empezar ahora
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">Se guarda cada respuesta, así
        que podés cortar y seguir después. Este es el único recordatorio que
        te vamos a mandar.</p>
      `),
    });

    // Se marca aunque el envío falle: reintentar todos los días contra una
    // dirección inválida solo ensucia la reputación del remitente.
    await admin
      .from("evaluar_participants")
      .update({ reminded_at: new Date().toISOString() })
      .eq("id", r.id);

    if (ok) enviados++;
  }

  return NextResponse.json({ ok: true, revisados: rows.length, enviados });
}
