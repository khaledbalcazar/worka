import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { alertMatchesJob } from "@/lib/alert-match";

// Alertas al instante (Worka Pro): al publicarse una vacante, se avisa ya a
// quienes tienen Worka Pro y una alerta que coincide. El resto la recibe en
// el resumen diario de /api/cron/alertas, que a su vez saltea las vacantes
// de Worka para las alertas de usuarios Pro (ya les llegaron acá).
export async function notifyInstantAlerts(jobId: string): Promise<number> {
  const admin = getAdminClient();
  if (!admin) return 0;
  try {
    const { data: job } = await admin
      .from("jobs")
      .select("id, title, city, industry, modality, address, status, expires_at, company:companies(trade_name, company_name, country, location_city)")
      .eq("id", jobId)
      .maybeSingle();
    if (!job || job.status !== "Activo" || (job.expires_at && Date.parse(job.expires_at) <= Date.now())) return 0;
    const company = (job.company ?? {}) as { trade_name?: string; company_name?: string; country?: string; location_city?: string };

    const { data: subs } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("product", "pro")
      .eq("status", "activa")
      .gt("ends_at", new Date().toISOString());
    const pro = [...new Set(((subs ?? []) as { user_id: string }[]).map((s) => s.user_id))];
    if (pro.length === 0) return 0;

    const { data: alerts } = await admin
      .from("job_alerts")
      .select("user_id, keyword, industry, city, country, modality, inapp_enabled, email_enabled")
      .eq("active", true)
      .in("user_id", pro);

    const notified = new Set<string>();
    for (const a of (alerts ?? []) as { user_id: string; keyword: string | null; industry: string | null; city: string | null; country: string; modality: string | null; email_enabled: boolean }[]) {
      if (notified.has(a.user_id)) continue;
      const match = alertMatchesJob(a, {
        title: job.title,
        industry: job.industry,
        modality: job.modality,
        address: job.address,
        companyCountry: company.country ?? "py",
        companyCity: (job as { city?: string | null }).city || company.location_city || null,
      });
      if (!match) continue;
      notified.add(a.user_id);
      await notify({
        userId: a.user_id,
        icon: "⚡",
        title: `Nueva vacante para vos: ${job.title}`,
        body: `${company.trade_name || company.company_name || "Una empresa"} acaba de publicarla. Sé de los primeros en postularte.`,
        href: `/empleo/${job.id}`,
        cta: a.email_enabled ? "Ver la vacante" : undefined,
      });
    }
    return notified.size;
  } catch (e) {
    console.error(`[worka:alerts] instant failed: ${e instanceof Error ? e.message : String(e)}`);
    return 0;
  }
}
