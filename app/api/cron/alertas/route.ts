/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, emailLayout, emailEnabled } from "@/lib/email";

// Evalúa las alertas de empleo activas y avisa a cada candidato de las
// vacantes nuevas (Worka + externas) que matchean. La dispara Vercel Cron.
// Corre con la service role key y exige CRON_SECRET.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Match = { title: string; company: string; href: string; source: string };

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json({ ok: false, error: "Falta CRON_SECRET." }, { status: 500 });
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`)
    return NextResponse.json({ ok: false }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey)
    return NextResponse.json({ ok: false, error: "Faltan credenciales." }, { status: 500 });
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const nowIso = now.toISOString();
  // Ventana amplia (48h) por si se saltó una corrida; luego filtramos por
  // el last_run_at de cada alerta para no repetir avisos.
  const windowIso = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  const { data: alerts } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("active", true);
  if (!alerts || alerts.length === 0)
    return NextResponse.json({ ok: true, alerts: 0 });

  // Traemos las vacantes nuevas una sola vez.
  const { data: workaJobs } = await supabase
    .from("jobs")
    .select(
      "id,title,industry,modality,address,created_at,company:companies(country,location_city,company_name,trade_name)"
    )
    .eq("status", "Activo")
    .gt("created_at", windowIso);

  const { data: extJobs } = await supabase
    .from("external_jobs")
    .select("id,title,industry,city,country,company_name,source_name,apply_url,imported_at")
    .eq("status", "activa")
    .gt("imported_at", windowIso);

  let notified = 0;
  let emailsSent = 0;

  for (const a of alerts as any[]) {
    const since = a.last_run_at ?? a.created_at;
    const kw = norm(a.keyword);
    const ind = a.industry ? norm(a.industry) : null;
    const city = a.city ? norm(a.city) : null;
    const mod = a.modality ? norm(a.modality) : null;

    const matches: Match[] = [];

    // Vacantes de Worka
    for (const j of (workaJobs ?? []) as any[]) {
      if (j.created_at <= since) continue;
      const company = j.company ?? {};
      if (norm(company.country) !== norm(a.country)) continue;
      if (ind && norm(j.industry) !== ind) continue;
      if (mod && norm(j.modality) !== mod) continue;
      if (kw && !norm(j.title).includes(kw)) continue;
      if (
        city &&
        !norm(j.address).includes(city) &&
        !norm(company.location_city).includes(city)
      )
        continue;
      matches.push({
        title: j.title,
        company: company.trade_name || company.company_name || "Empresa",
        href: `/empleo/${j.id}`,
        source: "Worka",
      });
    }

    // Vacantes externas (agregadas)
    for (const j of (extJobs ?? []) as any[]) {
      if (j.imported_at <= since) continue;
      if (norm(j.country) !== norm(a.country)) continue;
      if (ind && norm(j.industry) !== ind) continue;
      if (kw && !norm(j.title).includes(kw)) continue;
      if (city && !norm(j.city).includes(city)) continue;
      matches.push({
        title: j.title,
        company: j.company_name || "Empresa",
        href: `/empleo/externo/${j.id}`,
        source: j.source_name || "Externa",
      });
    }

    if (matches.length > 0) {
      const label = [a.keyword, a.industry, a.city]
        .filter(Boolean)
        .join(" · ") || "tu búsqueda";
      const top = matches.slice(0, 12);

      // In-app: una notificación resumen por alerta.
      if (a.inapp_enabled) {
        await supabase.from("notifications").insert({
          user_id: a.user_id,
          icon: "🔔",
          title: `${matches.length} vacante${matches.length === 1 ? "" : "s"} nueva${
            matches.length === 1 ? "" : "s"
          } para vos`,
          body: `Coinciden con tu alerta: ${label}`,
          href: "/empleos",
        });
        notified++;
      }

      // Email: digest, solo si hay proveedor y el candidato lo pidió.
      if (a.email_enabled && emailEnabled()) {
        const { data: u } = await supabase.auth.admin.getUserById(a.user_id);
        const to = u?.user?.email;
        if (to) {
          const items = top
            .map(
              (m) =>
                `<li style="margin-bottom:8px"><strong>${m.title}</strong> — ${m.company} <span style="color:#9ca3af">(${m.source})</span></li>`
            )
            .join("");
          const html = emailLayout(
            `<p>Encontramos <strong>${matches.length}</strong> vacante${
              matches.length === 1 ? "" : "s"
            } nueva${matches.length === 1 ? "" : "s"} para tu alerta <em>${label}</em>:</p>
             <ul style="padding-left:18px">${items}</ul>
             <a href="https://worka.com.py/empleos" style="display:inline-block;margin-top:12px;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600">Ver las vacantes</a>`
          );
          const ok = await sendEmail({
            to,
            subject: `${matches.length} vacante${
              matches.length === 1 ? "" : "s"
            } nueva${matches.length === 1 ? "" : "s"} en Worka`,
            html,
          });
          if (ok) emailsSent++;
        }
      }
    }

    await supabase
      .from("job_alerts")
      .update({ last_run_at: nowIso })
      .eq("id", a.id);
  }

  return NextResponse.json({
    ok: true,
    alerts: alerts.length,
    notified,
    emailsSent,
  });
}
