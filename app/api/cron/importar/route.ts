import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchSource } from "@/lib/external/importer";
import type { JobSource } from "@/lib/types";

// Importación automática de todas las fuentes activas.
// La dispara Vercel Cron (ver vercel.json). No usa la sesión del usuario:
// corre con la service role key, así que exige el secreto para entrar.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Falta CRON_SECRET en las variables de entorno." },
      { status: 500 }
    );
  }

  // Vercel Cron manda "Authorization: Bearer <CRON_SECRET>".
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Faltan las credenciales de Supabase." },
      { status: 500 }
    );
  }
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Si el interruptor general está apagado, no importamos nada.
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "external_jobs_enabled")
    .maybeSingle();
  if (setting?.value !== "true") {
    return NextResponse.json({ ok: true, skipped: "Agregador apagado" });
  }

  // 1. Ocultar las vacantes que ya vencieron.
  const nowIso = new Date().toISOString();
  const { count: expired } = await supabase
    .from("external_jobs")
    .update({ status: "oculta" }, { count: "exact" })
    .eq("status", "activa")
    .lt("expires_at", nowIso);

  // 2. Correr cada fuente activa.
  const { data: sources } = await supabase
    .from("job_sources")
    .select("*")
    .eq("enabled", true);

  const results: { source: string; count: number; method?: string; error?: string }[] =
    [];

  for (const source of (sources ?? []) as JobSource[]) {
    try {
      const parsed = await fetchSource(source);
      if (parsed.jobs.length === 0) {
        await supabase
          .from("job_sources")
          .update({
            last_run_at: nowIso,
            last_result: "Sin avisos",
            last_method: parsed.method,
            last_count: 0,
          })
          .eq("id", source.id);
        results.push({ source: source.name, count: 0, method: parsed.method });
        continue;
      }

      const days = source.expire_days ?? 30;
      const expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toISOString();

      const rows = parsed.jobs.map((j) => ({
        source_id: source.id,
        external_key: j.external_key,
        title: j.title,
        company_name: j.company_name,
        description: j.description,
        city: j.city,
        industry: j.industry,
        salary_range: j.salary_range,
        apply_email: j.apply_email,
        apply_url: j.apply_url,
        source_name: source.name,
        source_url: j.source_url,
        status: "activa",
        imported_at: nowIso,
        expires_at: expiresAt,
      }));

      await supabase
        .from("external_jobs")
        .upsert(rows, { onConflict: "source_id,external_key" });

      await supabase
        .from("job_sources")
        .update({
          last_run_at: nowIso,
          last_result: `OK: ${rows.length} avisos`,
          last_method: parsed.method,
          last_count: rows.length,
        })
        .eq("id", source.id);

      results.push({
        source: source.name,
        count: rows.length,
        method: parsed.method,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      await supabase
        .from("job_sources")
        .update({
          last_run_at: nowIso,
          last_result: `Error: ${message}`,
          last_count: 0,
        })
        .eq("id", source.id);
      // Una fuente rota no debe frenar a las demás.
      results.push({ source: source.name, count: 0, error: message });
    }
  }

  return NextResponse.json({ ok: true, expired: expired ?? 0, results });
}
