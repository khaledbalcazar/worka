"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCompanyAccess } from "@/lib/company-context";
import { getSiteSettings } from "@/lib/data";
import { notify, notifyMany } from "@/lib/notify";
import { isJobListed } from "@/lib/job-visibility";
import { askJson } from "@/lib/ai-server";
import { bullets, formatPeriod, type CvData } from "@/lib/cv";
import {
  BILLING_OPTIONS,
  ENTERPRISE_BRAND,
  PRO_BRAND,
  WORKA_PRO,
  enterpriseLimits,
  enterprisePlan,
  extendedEnd,
  formatGs,
  formatMoney,
  isPaidPlan,
  localTotal,
  type Product,
} from "@/lib/plans";
import {
  INTERVIEW_CALLS_PER_MONTH,
  getAiUsage,
  getEnterprisePlanId,
  getPromotionUsage,
  isWorkaPro,
} from "@/lib/subscriptions";

// Acciones de Worka Enterprise Pro y Worka Pro. Separadas de app/actions.ts
// para que el archivo de acciones generales no siga creciendo.

type Result = { ok: boolean; error?: string; demo?: boolean };
const DEMO: Result = { ok: true, demo: true };
const SOLO_ADMIN: Result = { ok: false, error: "Solo el admin puede hacer esto." };

async function isAdmin(): Promise<boolean> {
  const supabase = await getServerClient();
  if (!supabase) return true;
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

function planLabel(product: Product, plan: string): string {
  return product === "pro" ? PRO_BRAND : `${ENTERPRISE_BRAND} · ${enterprisePlan(plan).name}`;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" });
}

// ── Cobro manual ────────────────────────────────────────────────────────

// La persona pagó con el link y avisa. Queda pendiente hasta que el admin
// confirme el pago. El monto se calcula acá, nunca llega del navegador.
export async function requestPlanPayment(input: {
  product: Product;
  plan: string;
  months: number;
  reference: string;
  billingName?: string;
  billingDoc?: string;
}): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };

  const product: Product = input.product === "pro" ? "pro" : "enterprise";
  if (!isPaidPlan(product, input.plan)) return { ok: false, error: "Elegí un plan." };
  if (!BILLING_OPTIONS.some((o) => o.months === input.months)) return { ok: false, error: "Elegí la duración." };

  // ¿A nombre de quién? La empresa paga por la empresa (el dueño o un
  // administrador del equipo); la persona, por sí misma.
  let payerId = user.id;
  let country = "py";
  let defaultName = "";
  if (product === "enterprise") {
    const access = await getCompanyAccess(supabase, user.id);
    if (!access) return { ok: false, error: "Tu cuenta no tiene una empresa asociada." };
    if (access.role !== "dueño" && access.role !== "administrador")
      return { ok: false, error: "Solo el dueño o un administrador del equipo puede contratar el plan." };
    payerId = access.companyId;
    const { data: comp } = await supabase.from("companies").select("company_name, country").eq("id", payerId).maybeSingle();
    country = comp?.country ?? "py";
    defaultName = comp?.company_name ?? "";
  } else {
    const { data: cand } = await supabase.from("candidates").select("id, full_name, country").eq("id", user.id).maybeSingle();
    if (!cand) return { ok: false, error: "Worka Pro es para cuentas de candidato." };
    country = cand.country ?? "py";
    defaultName = cand.full_name ?? "";
  }

  // Precio en la moneda del país de quien paga (y su equivalente en Gs).
  const settings = await getSiteSettings();
  const { local, gs: amount } = localTotal(product, input.plan, input.months, country, settings);
  const reference = input.reference.trim().slice(0, 120);
  const billingName = (input.billingName ?? "").trim().slice(0, 120) || defaultName;
  const billingDoc = (input.billingDoc ?? "").trim().slice(0, 30);

  const db = getAdminClient() ?? supabase;
  const { data: pending } = await db
    .from("payment_requests")
    .select("id")
    .eq("user_id", payerId)
    .eq("product", product)
    .eq("status", "pendiente")
    .limit(1);
  if (pending && pending.length > 0)
    return { ok: false, error: "Ya tenés un pago en revisión. Te avisamos apenas lo confirmemos." };

  const base = {
    user_id: payerId,
    product,
    plan: input.plan,
    months: input.months,
    amount_gs: amount,
    reference: reference || null,
  };
  let { error } = await db.from("payment_requests").insert({
    ...base,
    currency: local.currency,
    amount_local: local.amount,
    billing_name: billingName || null,
    billing_doc: billingDoc || null,
  });
  // Sin la migración 048 no existen las columnas nuevas: se guarda lo básico.
  if (error && /column/i.test(error.message)) ({ error } = await db.from("payment_requests").insert(base));
  if (error) {
    console.error(`[worka:plans] payment_request insert failed: ${error.message}`);
    return { ok: false, error: "No pudimos registrar tu aviso de pago. ¿Ya corriste la migración 047?" };
  }

  // Aviso al admin (campanita + correo).
  const admin = getAdminClient();
  if (admin) {
    const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
    await notifyMany(((admins ?? []) as { id: string }[]).map((a) => a.id), (id) => ({
      userId: id,
      icon: "💳",
      title: "Pago para confirmar",
      body: `${planLabel(product, input.plan)} · ${input.months} ${input.months === 1 ? "mes" : "meses"} · ${formatMoney(local)}${local.currency !== "PYG" ? ` (${formatGs(amount)})` : ""}${reference ? ` · Ref: ${reference}` : ""}`,
      href: "/admin#pagos",
      cta: "Revisar pago",
    }));
  }

  revalidatePath(product === "pro" ? "/pro" : "/empresa/planes");
  revalidatePath("/admin");
  return { ok: true };
}

// El admin confirma (o rechaza) un pago. Confirmar activa el plan o lo
// extiende desde su vencimiento, sin perder días.
export async function adminResolvePayment(id: string, approve: boolean, note = ""): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await isAdmin())) return SOLO_ADMIN;

  const { data: req } = await supabase.from("payment_requests").select("*").eq("id", id).maybeSingle();
  if (!req) return { ok: false, error: "No encontramos ese pago." };
  if (req.status !== "pendiente") return { ok: false, error: "Ese pago ya se resolvió." };

  let endsAt: string | null = null;
  let periodFrom: string | null = null;
  if (approve) {
    const result = await activatePlan(supabase, req.user_id, req.product, req.plan, req.months, req.id);
    if (!result.ok) return result;
    endsAt = result.endsAt;
    periodFrom = result.from;
  }

  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: approve ? "aprobada" : "rechazada",
      admin_note: note.trim().slice(0, 300) || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No pudimos actualizar el pago." };

  // Recibo digital (sin valor fiscal). Sin la migración 048 no se emite, pero
  // el plan queda activo igual.
  let receiptId: string | null = null;
  if (approve && endsAt && periodFrom) {
    const { issuePaymentReceipt } = await import("@/lib/receipts-server");
    receiptId = await issuePaymentReceipt(id, { from: periodFrom, to: endsAt });
  }

  const href = approve && receiptId ? `/recibo/${receiptId}` : req.product === "pro" ? "/pro" : "/empresa/planes";
  await notify(
    approve
      ? {
          userId: req.user_id,
          icon: "✅",
          title: `${planLabel(req.product, req.plan)} activo`,
          body: `Confirmamos tu pago. Tu plan está activo hasta el ${formatDay(endsAt!)}.${receiptId ? " Tu recibo ya está disponible." : ""}`,
          href,
          cta: receiptId ? "Ver mi recibo" : "Ver mi plan",
        }
      : {
          userId: req.user_id,
          icon: "⚠️",
          title: "No pudimos confirmar tu pago",
          body: note.trim()
            ? `Motivo: ${note.trim()}. Escribinos si tenés el comprobante.`
            : "Revisá el comprobante y volvé a avisarnos, o escribinos por soporte.",
          href,
          cta: "Ver detalle",
        }
  );

  revalidatePath("/admin");
  return { ok: true };
}

type DbClient = NonNullable<Awaited<ReturnType<typeof getServerClient>>>;

async function activatePlan(
  supabase: DbClient,
  userId: string,
  product: Product,
  plan: string,
  months: number,
  paymentRequestId: string | null
): Promise<Result & { endsAt: string; from: string }> {
  const nowIso = new Date().toISOString();
  const { data: current } = await supabase
    .from("subscriptions")
    .select("id, plan, ends_at")
    .eq("user_id", userId)
    .eq("product", product)
    .eq("status", "activa")
    .gt("ends_at", nowIso)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current && current.plan === plan) {
    const endsAt = extendedEnd(current.ends_at, months);
    const { error } = await supabase.from("subscriptions").update({ ends_at: endsAt }).eq("id", current.id);
    if (error) return { ok: false, error: "No pudimos extender el plan.", endsAt, from: current.ends_at };
    return { ok: true, endsAt, from: current.ends_at };
  }

  // Cambio de plan (o primera vez): el anterior se cierra y arranca el nuevo hoy.
  if (current) await supabase.from("subscriptions").update({ status: "cancelada" }).eq("id", current.id);
  const endsAt = extendedEnd(null, months);
  const { error } = await supabase.from("subscriptions").insert({
    user_id: userId,
    product,
    plan,
    starts_at: nowIso,
    ends_at: endsAt,
    payment_request_id: paymentRequestId,
  });
  if (error) {
    console.error(`[worka:plans] subscription insert failed: ${error.message}`);
    return { ok: false, error: "No pudimos activar el plan. ¿Ya corriste la migración 047?", endsAt, from: nowIso };
  }
  return { ok: true, endsAt, from: nowIso };
}

// Alta manual (cortesía, período de gracia, pago fuera del link).
export async function adminGrantPlan(input: { userId: string; product: Product; plan: string; months: number }): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await isAdmin())) return SOLO_ADMIN;
  const product: Product = input.product === "pro" ? "pro" : "enterprise";
  if (!isPaidPlan(product, input.plan)) return { ok: false, error: "Elegí un plan." };
  const months = Math.min(24, Math.max(1, Math.round(input.months)));
  const result = await activatePlan(supabase, input.userId, product, input.plan, months, null);
  if (!result.ok) return result;
  await notify({
    userId: input.userId,
    icon: "🎁",
    title: `${planLabel(product, input.plan)} activo`,
    body: `Worka te activó el plan hasta el ${formatDay(result.endsAt)}.`,
    href: product === "pro" ? "/pro" : "/empresa/planes",
    cta: "Ver mi plan",
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminCancelSubscription(id: string): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await isAdmin())) return SOLO_ADMIN;
  const { error } = await supabase.from("subscriptions").update({ status: "cancelada" }).eq("id", id);
  if (error) return { ok: false, error: "No pudimos cancelar el plan." };
  revalidatePath("/admin");
  return { ok: true };
}

// ── Worka Enterprise Pro ────────────────────────────────────────────────

async function companyForJob(jobId: string): Promise<
  | { ok: true; companyId: string; job: { id: string; title: string; industry: string; status: string; expires_at: string; company_id: string } }
  | { ok: false; error: string }
> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: false, error: "demo" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const access = await getCompanyAccess(supabase, user.id);
  if (!access || access.role === "observador") return { ok: false, error: "No tenés permiso para hacer esto." };
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, industry, status, expires_at, company_id")
    .eq("id", jobId)
    .eq("company_id", access.companyId)
    .maybeSingle();
  if (!job) return { ok: false, error: "Esa vacante no es de tu empresa." };
  return { ok: true, companyId: access.companyId, job };
}

// Destaque incluido en el plan: se activa al instante, sin pago aparte.
export async function applyIncludedBoost(jobId: string): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const ctx = await companyForJob(jobId);
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!isJobListed(ctx.job)) return { ok: false, error: "La vacante tiene que estar publicada para destacarla." };

  const limits = enterpriseLimits(await getEnterprisePlanId(ctx.companyId));
  if (limits.boostsPerMonth === 0)
    return { ok: false, error: `Los destaques incluidos son de ${ENTERPRISE_BRAND}.` };
  const usage = await getPromotionUsage(ctx.companyId);
  if (usage.boosts >= limits.boostsPerMonth)
    return { ok: false, error: `Ya usaste los ${limits.boostsPerMonth} destaques de este mes.` };

  // El destaque lo protege la base (migración 045): lo pone el servicio.
  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY." };
  const until = new Date(Date.now() + limits.boostDays * 86400000).toISOString();
  const { error } = await admin.from("jobs").update({ featured: true, featured_until: until }).eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos destacar la vacante." };
  await admin.from("job_promotions").insert({ company_id: ctx.companyId, job_id: jobId, kind: "boost" });

  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

// Alerta urgente: avisa ya (campanita + correo) a candidatos compatibles por
// rubro o ciudad que tengan las alertas encendidas.
export async function sendUrgentAlert(jobId: string): Promise<Result & { recipients?: number }> {
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, recipients: 24 };
  const ctx = await companyForJob(jobId);
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!isJobListed(ctx.job)) return { ok: false, error: "La vacante tiene que estar publicada." };

  const limits = enterpriseLimits(await getEnterprisePlanId(ctx.companyId));
  if (limits.urgentAlertsPerMonth === 0)
    return { ok: false, error: `Las alertas urgentes son de ${ENTERPRISE_BRAND}.` };
  const usage = await getPromotionUsage(ctx.companyId);
  if (usage.urgentAlerts >= limits.urgentAlertsPerMonth)
    return { ok: false, error: `Ya usaste las ${limits.urgentAlertsPerMonth} alertas urgentes de este mes.` };

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY." };
  const { data: company } = await admin
    .from("companies")
    .select("trade_name, company_name, location_city, country")
    .eq("id", ctx.companyId)
    .maybeSingle();
  const city = (company?.location_city ?? "").trim();
  const country = company?.country ?? "py";

  const { data: people } = await admin
    .from("candidates")
    .select("id, location_city, preferences_industry, open_to_other_cities")
    .eq("country", country)
    .eq("alerts_enabled", true)
    .limit(2000);

  const norm = (v: string | null | undefined) => (v ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
  const target = ((people ?? []) as { id: string; location_city: string | null; preferences_industry: string[] | null; open_to_other_cities: boolean | null }[])
    .filter((p) => {
      const sameIndustry = (p.preferences_industry ?? []).some((i) => norm(i) === norm(ctx.job.industry));
      const sameCity = !!city && norm(p.location_city) === norm(city);
      return sameIndustry && (!city || sameCity || !!p.open_to_other_cities);
    })
    .slice(0, 300)
    .map((p) => p.id);

  if (target.length === 0)
    return { ok: false, error: "No encontramos candidatos compatibles con alertas activas para esta vacante." };

  const companyName = company?.trade_name || company?.company_name || "Una empresa";
  await admin.from("job_promotions").insert({ company_id: ctx.companyId, job_id: jobId, kind: "urgent_alert", recipients: target.length });
  await notifyMany(target, (id) => ({
    userId: id,
    icon: "⚡",
    title: `Contratación urgente: ${ctx.job.title}`,
    body: `${companyName} busca ${ctx.job.title}${city ? ` en ${city}` : ""} y quiere contratar ya. Postulate antes que nadie.`,
    href: `/empleo/${jobId}`,
    cta: "Ver la vacante",
  }));
  return { ok: true, recipients: target.length };
}

export async function setJobAutoRenew(jobId: string, on: boolean): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const ctx = await companyForJob(jobId);
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const limits = enterpriseLimits(await getEnterprisePlanId(ctx.companyId));
  if (on && !limits.autoRenew)
    return { ok: false, error: `La renovación automática es de ${ENTERPRISE_BRAND}.` };
  const { error } = await supabase.from("jobs").update({ auto_renew: on }).eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos guardar el cambio." };
  revalidatePath("/empresa");
  return { ok: true };
}

const HEX = /^#[0-9a-f]{6}$/i;

function safeVideoUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  try {
    const url = new URL(v);
    const host = url.hostname.replace(/^www\./, "");
    return url.protocol === "https:" && ["youtube.com", "youtu.be", "vimeo.com", "m.youtube.com"].includes(host) ? url.href : null;
  } catch {
    return null;
  }
}

// Página de empresa con marca (plan Empresa).
export async function saveCompanyBranding(input: {
  brand_color: string;
  culture: string;
  perks: string[];
  video_url: string;
}): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const access = await getCompanyAccess(supabase, user.id);
  if (!access || (access.role !== "dueño" && access.role !== "administrador"))
    return { ok: false, error: "Solo el dueño o un administrador puede editar la página." };
  if (!enterpriseLimits(await getEnterprisePlanId(access.companyId)).brandedPage)
    return { ok: false, error: "La página con tu marca es del plan Empresa." };

  const video = safeVideoUrl(input.video_url);
  if (input.video_url.trim() && !video) return { ok: false, error: "El video tiene que ser un enlace de YouTube o Vimeo." };
  const { error } = await supabase
    .from("companies")
    .update({
      brand_color: HEX.test(input.brand_color) ? input.brand_color : null,
      culture: input.culture.trim().slice(0, 1500) || null,
      perks: input.perks.map((p) => p.trim().slice(0, 80)).filter(Boolean).slice(0, 12),
      video_url: video,
    })
    .eq("id", access.companyId);
  if (error) return { ok: false, error: "No pudimos guardar. ¿Ya corriste la migración 047?" };
  revalidatePath(`/empresas/${access.companyId}`);
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

// ── Worka Pro ───────────────────────────────────────────────────────────

// Una empresa miró a un candidato. La empresa sale de la sesión dentro de la
// función de la base; si quien llama no es una empresa, no se registra nada.
export async function recordProfileView(candidateId: string, source: "postulacion" | "cv" | "talento" | "perfil", jobId?: string): Promise<void> {
  const supabase = await getServerClient();
  if (!supabase) return;
  const { error } = await supabase.rpc("fn_record_profile_view", { p_candidate: candidateId, p_source: source, p_job: jobId ?? null });
  if (error && !/function .* does not exist/i.test(error.message)) {
    console.error(`[worka:pro] record view failed: ${error.message}`);
  }
}

async function requirePro(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: true, userId: "demo" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  if (!(await isWorkaPro(user.id))) return { ok: false, error: `Esta herramienta es de ${PRO_BRAND}.` };
  return { ok: true, userId: user.id };
}

async function logAi(userId: string, kind: "cv_review" | "interview") {
  const admin = getAdminClient();
  if (admin && userId !== "demo") await admin.from("ai_usage").insert({ user_id: userId, kind });
}

function aiError(e: unknown): string {
  if (e instanceof Error && e.message === "NO_AI") return "La IA de Worka no está configurada todavía. Avisale al equipo de Worka.";
  console.error(`[worka:pro] ai failed: ${e instanceof Error ? e.message : String(e)}`);
  return "La IA no respondió. Probá de nuevo en un rato.";
}

export type CvReview = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: { section: string; tip: string; example?: string }[];
};

function cvAsText(cv: CvData): string {
  const lines = [
    `Nombre: ${cv.name}`,
    `Título: ${cv.headline}`,
    `Ciudad: ${cv.city}`,
    `Perfil: ${cv.summary}`,
    "Experiencia:",
    ...cv.experience.map((e) => `- ${e.role} en ${e.company} (${formatPeriod(e.start, e.end, e.current)}). ${e.description} ${bullets(e.highlights).join("; ")}`),
    "Estudios:",
    ...cv.education.map((e) => `- ${e.title}, ${e.institution} (${formatPeriod(e.start, e.end, e.current)})`),
    `Habilidades: ${cv.skills.join(", ")}`,
    `Herramientas: ${cv.tools.map((t) => `${t.name} (${t.level}/5)`).join(", ")}`,
    `Idiomas: ${cv.languages.map((l) => `${l.name} ${l.level}`).join(", ")}`,
    `Certificados y cursos: ${[...cv.certifications, ...cv.courses].map((c) => c.name).join(", ")}`,
    `Más: ${cv.extra}`,
  ];
  return lines.join("\n").slice(0, 8000);
}

export async function reviewCvWithAi(cv: CvData): Promise<Result & { review?: CvReview }> {
  const pro = await requirePro();
  if (!pro.ok) return { ok: false, error: pro.error };
  const usage = pro.userId === "demo" ? { cvReviews: 0 } : await getAiUsage(pro.userId);
  if (usage.cvReviews >= WORKA_PRO.limits.cvReviewsPerMonth)
    return { ok: false, error: `Ya usaste las ${WORKA_PRO.limits.cvReviewsPerMonth} revisiones de este mes.` };
  try {
    const review = await askJson<CvReview>(
      "Sos una reclutadora con experiencia en Paraguay y Latinoamérica. Revisás CVs de personas que buscan empleo (muchos en puestos operativos, comerciales y de atención). Respondé en español rioplatense neutro, con trato de vos, en tono amable y concreto. Devolvé solo JSON con esta forma: {\"score\": número de 0 a 100, \"summary\": una oración, \"strengths\": [hasta 3 frases], \"improvements\": [hasta 5 objetos {\"section\": sección del CV, \"tip\": qué cambiar, \"example\": texto de ejemplo listo para pegar (opcional)}]}. No inventes datos de la persona.",
      `Este es el CV:\n\n${cvAsText(cv)}`,
      3000
    );
    await logAi(pro.userId, "cv_review");
    return {
      ok: true,
      review: {
        score: Math.max(0, Math.min(100, Math.round(Number(review.score) || 0))),
        summary: String(review.summary ?? "").slice(0, 400),
        strengths: (review.strengths ?? []).map(String).slice(0, 3),
        improvements: (review.improvements ?? []).slice(0, 5).map((i) => ({
          section: String(i.section ?? "").slice(0, 60),
          tip: String(i.tip ?? "").slice(0, 400),
          example: i.example ? String(i.example).slice(0, 500) : undefined,
        })),
      },
    };
  } catch (e) {
    return { ok: false, error: aiError(e) };
  }
}

export async function startInterview(input: { role: string; context?: string }): Promise<Result & { questions?: string[] }> {
  const pro = await requirePro();
  if (!pro.ok) return { ok: false, error: pro.error };
  const role = input.role.trim().slice(0, 100);
  if (!role) return { ok: false, error: "Escribí el puesto para el que te preparás." };
  const usage = pro.userId === "demo" ? { interview: 0 } : await getAiUsage(pro.userId);
  if (usage.interview >= INTERVIEW_CALLS_PER_MONTH)
    return { ok: false, error: "Ya usaste las entrevistas de práctica de este mes." };
  try {
    const result = await askJson<{ questions: string[] }>(
      "Sos una entrevistadora de recursos humanos en Paraguay. Armás entrevistas de práctica realistas. Respondé solo JSON: {\"questions\": [5 preguntas en español, con trato de vos]}. Mezclá una de presentación, dos sobre experiencia o situaciones concretas del puesto, una de actitud y una sobre disponibilidad o expectativas.",
      `Puesto: ${role}\n${input.context ? `Detalles de la vacante: ${input.context.slice(0, 1500)}` : ""}`,
      1500
    );
    await logAi(pro.userId, "interview");
    const questions = (result.questions ?? []).map(String).filter(Boolean).slice(0, 5);
    if (questions.length === 0) return { ok: false, error: "La IA no armó las preguntas. Probá de nuevo." };
    return { ok: true, questions };
  } catch (e) {
    return { ok: false, error: aiError(e) };
  }
}

export type InterviewFeedback = { rating: number; good: string; improve: string; betterAnswer: string };

export async function interviewFeedback(input: { role: string; question: string; answer: string }): Promise<Result & { feedback?: InterviewFeedback }> {
  const pro = await requirePro();
  if (!pro.ok) return { ok: false, error: pro.error };
  const answer = input.answer.trim().slice(0, 2000);
  if (answer.length < 10) return { ok: false, error: "Escribí tu respuesta un poco más completa." };
  const usage = pro.userId === "demo" ? { interview: 0 } : await getAiUsage(pro.userId);
  if (usage.interview >= INTERVIEW_CALLS_PER_MONTH)
    return { ok: false, error: "Ya usaste las entrevistas de práctica de este mes." };
  try {
    const fb = await askJson<InterviewFeedback>(
      "Sos una entrevistadora de recursos humanos en Paraguay que ayuda a practicar. Evaluá la respuesta con honestidad y calidez, con trato de vos. Respondé solo JSON: {\"rating\": 1 a 5, \"good\": qué estuvo bien (1-2 oraciones), \"improve\": qué mejorar (1-2 oraciones), \"betterAnswer\": una versión mejorada de la respuesta, en primera persona, usando solo lo que la persona contó}.",
      `Puesto: ${input.role.slice(0, 100)}\nPregunta: ${input.question.slice(0, 400)}\nRespuesta: ${answer}`,
      1500
    );
    await logAi(pro.userId, "interview");
    return {
      ok: true,
      feedback: {
        rating: Math.max(1, Math.min(5, Math.round(Number(fb.rating) || 3))),
        good: String(fb.good ?? "").slice(0, 500),
        improve: String(fb.improve ?? "").slice(0, 500),
        betterAnswer: String(fb.betterAnswer ?? "").slice(0, 1200),
      },
    };
  } catch (e) {
    return { ok: false, error: aiError(e) };
  }
}

// Certificado verificable de Academia (cursos completos).
export async function issueCertificate(courseId: string): Promise<Result & { code?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: true, demo: true, code: "WK-DEMO-0001" };
  const { data, error } = await supabase.rpc("fn_issue_certificate", { p_course: courseId });
  if (error) return { ok: false, error: error.message.includes("completo") ? "Terminá todas las lecciones para obtener el certificado." : "No pudimos emitir el certificado." };
  return { ok: true, code: data as string };
}
