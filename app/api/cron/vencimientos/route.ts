import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { enterpriseLimits } from "@/lib/plans";
import { groupExpiryNotices, type ExpiryJob } from "@/lib/expiry-notices";

// Avisos de vencimiento de vacantes, una vez por día.
//
// 1. Renovación automática (Worka Enterprise Pro): las vacantes marcadas que
//    vencen en menos de un día se extienden solas por la vigencia del plan.
// 2. Aviso a la empresa: vacantes que vencen en 3 días o menos, y vacantes
//    que ya vencieron. Un solo correo por empresa con todas juntas, y cada
//    vacante se avisa una vez por etapa (expiry_warned_at /
//    expired_notified_at, que se vacían si la empresa cambia la vigencia).
//
// Antes no existía ningún aviso: la vacante vencía en silencio, seguía
// figurando "Activo" en los paneles y dejaba de aparecer en /empleos.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 86400000;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ ok: false, reason: "Falta SUPABASE_SERVICE_ROLE_KEY" });

  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // Plan de cada empresa, una consulta por empresa como máximo.
  const plans = new Map<string, string>();
  async function planOf(companyId: string): Promise<string> {
    if (!plans.has(companyId)) {
      const { data } = await admin!.rpc("fn_active_plan", { p_user: companyId, p_product: "enterprise" });
      plans.set(companyId, (data as string | null) ?? "gratis");
    }
    return plans.get(companyId)!;
  }

  // ── 1. Renovación automática ──
  let renewed = 0;
  const { data: renewable, error: renewError } = await admin
    .from("jobs")
    .select("id, company_id")
    .eq("status", "Activo")
    .eq("auto_renew", true)
    .lte("expires_at", new Date(now + DAY).toISOString())
    .gt("expires_at", new Date(now - 7 * DAY).toISOString())
    .limit(500);
  if (renewError) console.error(`[worka:vencimientos] renew query failed: ${renewError.message}`);
  for (const job of (renewable ?? []) as { id: string; company_id: string }[]) {
    const limits = enterpriseLimits(await planOf(job.company_id));
    if (!limits.autoRenew) continue;
    const { error } = await admin
      .from("jobs")
      .update({ expires_at: new Date(now + limits.jobValidityDays * DAY).toISOString() })
      .eq("id", job.id);
    if (!error) renewed++;
  }

  // ── 2. Avisos ──
  const select = "id, title, company_id, expires_at, expiry_warned_at, expired_notified_at";
  const [{ data: soon, error: soonError }, { data: expired, error: expiredError }] = await Promise.all([
    admin
      .from("jobs")
      .select(select)
      .eq("status", "Activo")
      .is("expiry_warned_at", null)
      .gt("expires_at", nowIso)
      .lte("expires_at", new Date(now + 3 * DAY).toISOString())
      .limit(1000),
    admin
      .from("jobs")
      .select(select)
      .eq("status", "Activo")
      .is("expired_notified_at", null)
      .lte("expires_at", nowIso)
      // Las vencidas hace mucho tiempo se avisan igual una vez (la primera
      // corrida pone al día a las empresas), pero no las de hace más de 90 días.
      .gt("expires_at", new Date(now - 90 * DAY).toISOString())
      .limit(1000),
  ]);
  if (soonError || expiredError) {
    const msg = (soonError ?? expiredError)!.message;
    console.error(`[worka:vencimientos] query failed: ${msg}`);
    return NextResponse.json({ ok: false, reason: msg.includes("expiry_warned_at") ? "Falta la migración 047" : msg });
  }

  const groups = groupExpiryNotices((soon ?? []) as ExpiryJob[], (expired ?? []) as ExpiryJob[], now);
  const { data: companies } = await admin
    .from("companies")
    .select("id, trade_name, company_name")
    .in("id", groups.map((g) => g.companyId));
  const names = new Map(((companies ?? []) as { id: string; trade_name: string | null; company_name: string }[]).map((c) => [c.id, c.trade_name || c.company_name]));

  let notified = 0;
  for (const g of groups) {
    await notify({
      userId: g.companyId,
      icon: g.expiredIds.length > 0 ? "⏰" : "⏳",
      title: g.title,
      body: g.detail,
      href: "/empresa",
      cta: "Renovar vacantes",
      template: {
        key: "vacantes_vencimiento",
        vars: { empresa: names.get(g.companyId) ?? "tu empresa", titulo: g.title, detalle: g.detail },
      },
    });
    const stamp = new Date().toISOString();
    if (g.soonIds.length) await admin.from("jobs").update({ expiry_warned_at: stamp }).in("id", g.soonIds);
    if (g.expiredIds.length) await admin.from("jobs").update({ expired_notified_at: stamp }).in("id", g.expiredIds);
    notified++;
  }

  return NextResponse.json({ ok: true, renewed, companiesNotified: notified });
}
