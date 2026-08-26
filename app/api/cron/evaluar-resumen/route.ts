import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { emailEnabled, emailLayout, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";
import { resolveAccess, type EvaluarAccount } from "@/lib/evaluar-access";

// Resumen diario para la empresa + aviso de prueba por vencer.
//
// Va todo en un solo correo por día a propósito: mandar uno por evento
// convierte a Worka en ruido y termina en la carpeta de spam, lo que rompe
// también los correos que sí importan (las invitaciones a los candidatos).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const admin = getAdminClient();
  if (!admin)
    return NextResponse.json({
      ok: false,
      reason: "Falta SUPABASE_SERVICE_ROLE_KEY",
    });
  if (!emailEnabled())
    return NextResponse.json({ ok: false, reason: "Falta RESEND_API_KEY" });

  const { data: cuentas } = await admin.from("evaluar_accounts").select("*");
  const base = SITE_URL.replace(/\/$/, "").replace("://", "://evaluar.");
  const desde = new Date(Date.now() - 86_400_000).toISOString();
  let enviados = 0;

  const filas = (cuentas ?? []) as (EvaluarAccount & {
    trial_warned_at?: string | null;
  })[];

  for (const cuenta of filas) {
    const estado = resolveAccess(cuenta);

    const { data: auth } = await admin.auth.admin.getUserById(
      cuenta.company_id
    );
    const to = auth?.user?.email;
    if (!to) continue;

    // ── Prueba por vencer: una sola vez, a 3 días o menos ──
    if (estado.inTrial && estado.daysLeft <= 3 && !cuenta.trial_warned_at) {
      await sendEmail({
        to,
        subject:
          estado.daysLeft <= 1
            ? "Tu prueba de Worka Evaluar termina hoy"
            : `Te quedan ${estado.daysLeft} días de prueba en Worka Evaluar`,
        html: emailLayout(`
          <p>Tu período de prueba está por terminar.</p>
          <p>Tus procesos, candidatos y evaluaciones <strong>no se
          borran</strong>: al activar la suscripción seguís donde estabas.</p>
          <p style="margin:24px 0">
            <a href="${base}/precios" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">
              Ver planes
            </a>
          </p>
        `),
      });
      await admin
        .from("evaluar_accounts")
        .update({ trial_warned_at: new Date().toISOString() })
        .eq("company_id", cuenta.company_id);
      enviados++;
    }

    // ── Resumen del día ──
    if (!estado.active) continue;

    const { data: procesos } = await admin
      .from("evaluar_processes")
      .select("id")
      .eq("company_id", cuenta.company_id)
      .eq("archived", false)
      .eq("status", "activo");

    const ids = ((procesos ?? []) as { id: string }[]).map((p) => p.id);
    if (ids.length === 0) continue;

    const { data: gente } = await admin
      .from("evaluar_participants")
      .select("status, started_at, completed_at")
      .in("process_id", ids);

    const lista = (gente ?? []) as {
      status: string;
      started_at: string | null;
      completed_at: string | null;
    }[];

    const arrancaron = lista.filter(
      (g) => g.started_at && g.started_at >= desde
    ).length;
    const terminaron = lista.filter(
      (g) => g.completed_at && g.completed_at >= desde
    ).length;
    const esperando = lista.filter((g) => g.status === "completado").length;

    // Día sin novedades: no se manda nada. Un correo que dice "no pasó nada"
    // enseña a ignorar al remitente.
    if (arrancaron === 0 && terminaron === 0 && esperando === 0) continue;

    const ok = await sendEmail({
      to,
      subject:
        esperando > 0
          ? `${esperando} ${esperando === 1 ? "candidato espera" : "candidatos esperan"} tu decisión`
          : "Resumen de tus procesos en Worka Evaluar",
      html: emailLayout(`
        <p>Así viene tu selección:</p>
        <ul style="line-height:1.9">
          <li><strong>${arrancaron}</strong> empezaron a rendir en las últimas 24 h.</li>
          <li><strong>${terminaron}</strong> completaron su evaluación.</li>
          <li><strong>${esperando}</strong> ${esperando === 1 ? "está esperando" : "están esperando"} tu decisión.</li>
        </ul>
        <p style="margin:24px 0">
          <a href="${base}/app" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">
            Abrir mi panel
          </a>
        </p>
      `),
    });
    if (ok) enviados++;
  }

  return NextResponse.json({ ok: true, enviados });
}
