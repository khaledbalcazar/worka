import "server-only";
import { getServerClient, getCurrentUser } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { slugify } from "./slug";
import type {
  Application,
  ApplicationStatus,
  Candidate,
  ChatMessage,
  Company,
  CompanyPost,
  FreelancerWithIdentity,
  FreelancerPublic,
  QuoteRequest,
  Interview,
  JobWithCompany,
  Notification,
  Report,
  WorkReference,
} from "./types";
import * as mock from "./mock-data";

// Capa de datos: consulta Supabase en modo live y cae a los datos de
// ejemplo en modo demo. Las páginas solo importan de acá.

export function isLive(): boolean {
  return isSupabaseConfigured();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapJob(row: any): JobWithCompany {
  return {
    ...row,
    filter_questions: (row.filter_questions ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((q: any) => ({
        id: q.id,
        question: q.question,
        knockout: q.knockout ?? false,
      })),
    company: mapCompany(row.company),
  };
}

function mapCompany(row: any): Company {
  return {
    ...row,
    fast_responder: row.fast_responder ?? false,
    badges: row.badges ?? [],
  };
}

const JOB_SELECT =
  "*, company:companies(*), filter_questions:job_questions(*)";

export async function getActiveJobs(): Promise<JobWithCompany[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getActiveJobs();
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("status", "Activo")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Error cargando empleos: ${error.message}`);
  return (data ?? []).map(mapJob);
}

export async function getJobById(
  id: string
): Promise<JobWithCompany | undefined> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getJobById(id);
  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapJob(data) : undefined;
}

export async function getCompanyById(
  id: string
): Promise<Company | undefined> {
  const supabase = await getServerClient();
  if (!supabase) return mock.companies.find((c) => c.id === id);
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapCompany(data) : undefined;
}

export async function getCompanyPosts(
  companyId: string
): Promise<CompanyPost[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.companyPosts.filter((p) => p.company_id === companyId);
  const { data } = await supabase
    .from("company_posts")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as CompanyPost[];
}

export async function getJobsByCompany(
  companyId: string
): Promise<JobWithCompany[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.getJobsWithCompany().filter((j) => j.company_id === companyId);
  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapJob);
}

// --- Candidato ---

export async function getCurrentCandidate(): Promise<Candidate | null> {
  const supabase = await getServerClient();
  if (!supabase) return mock.currentCandidate;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data as Candidate | null;
}

export type ApplicationWithJob = Application & { job: JobWithCompany };

export async function getMyApplications(): Promise<ApplicationWithJob[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getApplicationsWithJob() as ApplicationWithJob[];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("applications")
    .select(`*, job:jobs(${JOB_SELECT})`)
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    ...row,
    answers: [],
    job: mapJob(row.job),
  }));
}

export async function getMyAppliedJobIds(): Promise<Set<string>> {
  const supabase = await getServerClient();
  if (!supabase)
    return new Set(mock.applications.map((application) => application.job_id));
  const user = await getCurrentUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("applications")
    .select("job_id")
    .eq("candidate_id", user.id);
  return new Set((data ?? []).map((r: any) => r.job_id as string));
}

export async function getMySavedJobIds(): Promise<Set<string>> {
  const supabase = await getServerClient();
  if (!supabase) return new Set(mock.savedJobIds);
  const user = await getCurrentUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("candidate_id", user.id);
  return new Set((data ?? []).map((r: any) => r.job_id as string));
}

export async function getMySavedJobs(): Promise<JobWithCompany[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock
      .getActiveJobs()
      .filter((j) => mock.savedJobIds.includes(j.id));
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("saved_jobs")
    .select(`job:jobs(${JOB_SELECT})`)
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? [])
    .map((r: any) => r.job)
    .filter((j: any) => j && j.status === "Activo")
    .map(mapJob);
}

export async function getMyNotifications(): Promise<Notification[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.notifications;
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Notification[];
}

export async function getMyReferences(): Promise<WorkReference[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.workReferences;
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("work_references")
    .select("*")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkReference[];
}

export async function getMyFollowedCompanyIds(): Promise<Set<string>> {
  const supabase = await getServerClient();
  if (!supabase) return new Set(mock.followedCompanyIds);
  const user = await getCurrentUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("company_followers")
    .select("company_id")
    .eq("candidate_id", user.id);
  return new Set((data ?? []).map((r: any) => r.company_id as string));
}

// Entrevistas de mis postulaciones, indexadas por postulación
export async function getMyInterviews(): Promise<Record<string, Interview>> {
  const supabase = await getServerClient();
  if (!supabase)
    return Object.fromEntries(
      mock.interviews.map((i) => [i.application_id, i])
    );
  const user = await getCurrentUser();
  if (!user) return {};
  const { data } = await supabase
    .from("interviews")
    .select("*, application:applications!inner(candidate_id)")
    .eq("application.candidate_id", user.id);
  return Object.fromEntries(
    ((data ?? []) as any[]).map((i) => [i.application_id, i as Interview])
  );
}

export async function getMessagesByApplication(
  applicationId: string
): Promise<ChatMessage[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.chatMessages.filter(
      (m) => m.application_id === applicationId
    );
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at");
  return (data ?? []) as ChatMessage[];
}

// Perfil público /p/[id] — respeta el toggle public_profile
export async function getPublicCandidate(
  id: string
): Promise<(Candidate & { references: WorkReference[] }) | null> {
  const supabase = await getServerClient();
  if (!supabase) {
    const c = mock.talentPool.find((x) => x.id === id) ?? null;
    if (!c || !c.public_profile) return null;
    return { ...c, references: mock.workReferences.filter((r) => r.candidate_id === id) };
  }
  const { data } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .eq("public_profile", true)
    .maybeSingle();
  if (!data) return null;
  const { data: refs } = await supabase
    .from("work_references")
    .select("*")
    .eq("candidate_id", id)
    .eq("status", "confirmada");
  return { ...(data as Candidate), references: (refs ?? []) as WorkReference[] };
}

// Rango salarial por rubro, calculado de las vacantes con salario visible
export interface SalaryStat {
  industry: string;
  count: number;
  min: number;
  max: number;
}

function parseGs(range: string): number[] {
  const matches = range.replace(/\./g, "").match(/\d{6,}/g);
  return (matches ?? []).map(Number);
}

export async function getSalaryStats(): Promise<SalaryStat[]> {
  const jobs = await getActiveJobs();
  const byIndustry = new Map<string, number[]>();
  for (const job of jobs) {
    if (!job.salary_range) continue;
    const nums = parseGs(job.salary_range);
    if (nums.length === 0) continue;
    const list = byIndustry.get(job.industry) ?? [];
    list.push(...nums);
    byIndustry.set(job.industry, list);
  }
  return [...byIndustry.entries()]
    .map(([industry, nums]) => ({
      industry,
      count: nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
    }))
    .sort((a, b) => b.count - a.count);
}

// --- Empresa ---

export interface KanbanApplicant {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_city: string;
  candidate_phone: string;
  avatar_url: string | null;
  bio: string | null;
  identity_verified: boolean;
  has_cv: boolean;
  status: ApplicationStatus;
  applied_at: string;
  answers_ok: number;
  answers_total: number;
  internal_note: string;
  interview: { id: string; proposed_at: string; status: string } | null;
}

export async function getCurrentCompany(): Promise<Company | null> {
  const supabase = await getServerClient();
  if (!supabase) return mock.companies[0]; // demo: Super Guaraní
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (data) return mapCompany(data);

  // ¿Es miembro del equipo de alguna empresa? (invitado por el dueño)
  // Primero reclama invitaciones pendientes que coincidan con su email.
  if (user.email) {
    await supabase
      .from("company_members")
      .update({ member_id: user.id, status: "activa" })
      .ilike("email", user.email)
      .is("member_id", null);
  }
  const { data: membership } = await supabase
    .from("company_members")
    .select("company:companies(*)")
    .eq("member_id", user.id)
    .eq("status", "activa")
    .limit(1)
    .maybeSingle();
  const company = (membership as any)?.company;
  return company ? mapCompany(company) : null;
}

export async function getCompanyMembers(
  companyId: string
): Promise<import("./types").CompanyMember[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.companyMembers;
  const { data } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at");
  return (data ?? []) as import("./types").CompanyMember[];
}

export async function getApplicantsForJob(
  jobId: string
): Promise<KanbanApplicant[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.companyApplicants.map((a) => ({
      ...a,
      candidate_id: a.id,
      candidate_phone: "595981234567",
      avatar_url: null,
      bio:
        "Con experiencia en atención al cliente. Responsable y con ganas de sumar.",
      identity_verified: false,
      has_cv: true,
      internal_note: "",
      interview: null,
    }));
  const { data } = await supabase
    .from("applications")
    .select(
      "*, candidate:candidates(id, full_name, location_city, phone_whatsapp, avatar_url, bio, identity_status, cv_url), answers:application_answers(answer), interview:interviews(id, proposed_at, status)"
    )
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    id: row.id,
    candidate_id: row.candidate?.id ?? "",
    candidate_name: row.candidate?.full_name ?? "Candidato",
    candidate_city: row.candidate?.location_city ?? "",
    candidate_phone: (row.candidate?.phone_whatsapp ?? "").replace(/\D/g, ""),
    avatar_url: row.candidate?.avatar_url ?? null,
    bio: row.candidate?.bio ?? null,
    identity_verified: row.candidate?.identity_status === "verified",
    has_cv: !!row.candidate?.cv_url,
    status: row.status,
    applied_at: row.applied_at,
    answers_ok: (row.answers ?? []).filter((x: any) => x.answer).length,
    answers_total: (row.answers ?? []).length,
    internal_note: row.internal_note ?? "",
    interview: row.interview?.[0] ?? null,
  }));
}

// Hilos de chat de la empresa: una conversación por postulación recibida.
export interface CompanyThread {
  applicationId: string;
  jobTitle: string;
  candidateName: string;
  messages: ChatMessage[];
}

export async function getCompanyThreads(): Promise<CompanyThread[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.companyApplicants.slice(0, 3).map((a) => ({
      applicationId: a.id,
      jobTitle: "Cajero/a para sucursal centro",
      candidateName: a.candidate_name,
      messages: mock.chatMessages.filter((m) => m.application_id === a.id),
    }));
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("applications")
    .select(
      "id, job:jobs!inner(title, company_id), candidate:candidates(full_name), messages(id, application_id, sender, content, created_at)"
    )
    .eq("job.company_id", (await getCurrentCompany())?.id ?? user.id)
    .order("applied_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as any[]).map((row) => ({
    applicationId: row.id,
    jobTitle: row.job?.title ?? "Vacante",
    candidateName: row.candidate?.full_name ?? "Candidato",
    messages: (row.messages ?? []).sort(
      (a: ChatMessage, b: ChatMessage) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

// URL firmada del CV de un candidato para la empresa (RLS: solo si se postuló).
export async function getCandidateCvUrl(
  candidateId: string
): Promise<string | null> {
  const supabase = await getServerClient();
  if (!supabase) return "#demo-cv";
  const { data } = await supabase.storage
    .from("cvs")
    .createSignedUrl(`${candidateId}/cv.pdf`, 300);
  return data?.signedUrl ?? null;
}

// Stats reales del panel de empresa.
export interface CompanyStats {
  activeJobs: number;
  applicationsThisWeek: number;
  totalViews: number;
  avgResponseHours: number | null;
  applicationsPerJob: { title: string; count: number }[];
}

export async function getCompanyStats(
  companyId: string
): Promise<CompanyStats> {
  const supabase = await getServerClient();
  const jobs = await getJobsByCompany(companyId);
  const activeJobs = jobs.filter((j) => j.status === "Activo").length;
  const totalViews = jobs.reduce((s, j) => s + j.views_count, 0);
  if (!supabase)
    return {
      activeJobs,
      applicationsThisWeek: 23,
      totalViews,
      avgResponseHours: 31,
      applicationsPerJob: jobs.slice(0, 5).map((j, i) => ({
        title: j.title,
        count: [12, 8, 5, 3, 1][i] ?? 1,
      })),
    };

  const jobIds = jobs.map((j) => j.id);
  if (jobIds.length === 0)
    return {
      activeJobs,
      applicationsThisWeek: 0,
      totalViews,
      avgResponseHours: null,
      applicationsPerJob: [],
    };

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .in("job_id", jobIds)
    .gte("applied_at", weekAgo);

  // Tiempo medio de respuesta: promedio de reviewed_at - applied_at.
  const { data: reviewed } = await supabase
    .from("applications")
    .select("applied_at, reviewed_at")
    .in("job_id", jobIds)
    .not("reviewed_at", "is", null)
    .limit(200);
  let avgResponseHours: number | null = null;
  if (reviewed && reviewed.length > 0) {
    const hours = reviewed.map(
      (r: any) =>
        (new Date(r.reviewed_at).getTime() - new Date(r.applied_at).getTime()) /
        3600000
    );
    avgResponseHours = Math.round(
      hours.reduce((a, b) => a + b, 0) / hours.length
    );
  }
  // Postulaciones por vacante (para el gráfico del panel).
  const { data: allApps } = await supabase
    .from("applications")
    .select("job_id")
    .in("job_id", jobIds)
    .limit(1000);
  const perJobCount = new Map<string, number>();
  for (const row of (allApps ?? []) as { job_id: string }[]) {
    perJobCount.set(row.job_id, (perJobCount.get(row.job_id) ?? 0) + 1);
  }
  const applicationsPerJob = jobs
    .map((j) => ({ title: j.title, count: perJobCount.get(j.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    activeJobs,
    applicationsThisWeek: count ?? 0,
    totalViews,
    avgResponseHours,
    applicationsPerJob,
  };
}

// Configuración del sitio (editable desde /admin)
export async function getSiteSettings(): Promise<Record<string, string>> {
  const supabase = await getServerClient();
  if (!supabase) return mock.defaultSiteSettings;
  const { data } = await supabase.from("site_settings").select("key, value");
  const out = { ...mock.defaultSiteSettings };
  for (const row of data ?? []) out[row.key] = row.value;
  return out;
}

// Rubros escritos a mano por empresas que aún no son etiqueta oficial.
export async function getPendingIndustryTags(): Promise<string[]> {
  const supabase = await getServerClient();
  if (!supabase) return ["Veterinaria"];
  const settings = await getSiteSettings();
  const approved = new Set(
    [
      ...mock.INDUSTRIES,
      ...(settings.custom_industries ?? "").split(",").map((s) => s.trim()),
    ].filter(Boolean)
  );
  const { data } = await supabase.from("jobs").select("industry").limit(500);
  const pending = new Set<string>();
  for (const row of data ?? []) {
    const ind = (row.industry ?? "").trim();
    if (ind && !approved.has(ind)) pending.add(ind);
  }
  return [...pending];
}

export async function getReferenceByToken(token: string): Promise<{
  referrer_name: string;
  relationship: string;
  status: string;
  candidate_name: string;
} | null> {
  const supabase = await getServerClient();
  if (!supabase) {
    const ref = mock.workReferences.find((r) => r.token === token);
    if (!ref) return null;
    return {
      referrer_name: ref.referrer_name,
      relationship: ref.relationship,
      status: ref.status,
      candidate_name: mock.currentCandidate.full_name,
    };
  }
  const { data } = await supabase.rpc("get_reference_by_token", {
    ref_token: token,
  });
  return data?.[0] ?? null;
}

export async function getAllReferences(): Promise<
  (WorkReference & { candidate_name?: string })[]
> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.workReferences.map((r) => ({
      ...r,
      candidate_name: mock.currentCandidate.full_name,
    }));
  const { data } = await supabase
    .from("work_references")
    .select("*, candidate:candidates(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((r: any) => ({
    ...r,
    candidate_name: r.candidate?.full_name,
  }));
}

export async function getBoostRequests(): Promise<
  (import("./types").BoostRequest & { job_title?: string; company_name?: string })[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("boost_requests")
    .select("*, job:jobs(title), company:companies(trade_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((b: any) => ({
    ...b,
    job_title: b.job?.title,
    company_name: b.company?.trade_name,
  }));
}

// Búsqueda activa de talento: solo perfiles con visible_to_companies
export async function getTalentPool(country?: string): Promise<Candidate[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.talentPool.filter((c) => c.visible_to_companies);
  let q = supabase
    .from("candidates")
    .select("*")
    .eq("visible_to_companies", true);
  // Una empresa solo ve candidatos de su propio país.
  if (country) q = q.eq("country", country);
  const { data } = await q
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Candidate[];
}

// --- Admin ---

// URLs firmadas de las fotos de cédula (solo funciona con rol admin)
export async function getIdentityDocUrls(
  candidateId: string
): Promise<{ label: string; url: string }[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data: files } = await supabase.storage
    .from("identidad")
    .list(candidateId);
  if (!files?.length) return [];
  const out: { label: string; url: string }[] = [];
  for (const f of files) {
    const { data } = await supabase.storage
      .from("identidad")
      .createSignedUrl(`${candidateId}/${f.name}`, 3600);
    if (data?.signedUrl)
      out.push({
        label: f.name.startsWith("front")
          ? "Frente"
          : f.name.startsWith("back")
            ? "Dorso"
            : "Selfie",
        url: data.signedUrl,
      });
  }
  return out;
}

// Estadísticas globales del negocio para el backoffice.
export interface GlobalStats {
  candidates: number;
  companies: number;
  activeJobs: number;
  totalJobs: number;
  applications: number;
  applicationsThisWeek: number;
  contactedRate: number; // % de postulaciones que llegaron a Contactado
  signupsByDay: { day: string; count: number }[]; // últimos 14 días
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await getServerClient();
  if (!supabase) {
    const today = new Date();
    return {
      candidates: 128,
      companies: 34,
      activeJobs: mock.getActiveJobs().length,
      totalJobs: mock.jobs.length,
      applications: 512,
      applicationsThisWeek: 87,
      contactedRate: 41,
      signupsByDay: Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today.getTime() - (13 - i) * 86400000);
        return {
          day: d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit" }),
          count: [3, 5, 2, 8, 6, 4, 9, 7, 5, 11, 8, 6, 10, 12][i],
        };
      }),
    };
  }

  const count = async (
    table: string,
    filter?: (q: any) => any
  ): Promise<number> => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count: c } = await q;
    return c ?? 0;
  };

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const [
    candidates,
    companies,
    activeJobs,
    totalJobs,
    applications,
    applicationsThisWeek,
    contacted,
  ] = await Promise.all([
    count("candidates"),
    count("companies"),
    count("jobs", (q) => q.eq("status", "Activo")),
    count("jobs"),
    count("applications"),
    count("applications", (q) => q.gte("applied_at", weekAgo)),
    count("applications", (q) => q.eq("status", "Contactado")),
  ]);

  // Registros por día (últimos 14) desde profiles.created_at.
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", since);
  const byDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    byDay.set(
      d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit" }),
      0
    );
  }
  for (const p of profiles ?? []) {
    const key = new Date(p.created_at).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
    });
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return {
    candidates,
    companies,
    activeJobs,
    totalJobs,
    applications,
    applicationsThisWeek,
    contactedRate: applications > 0 ? Math.round((contacted / applications) * 100) : 0,
    signupsByDay: [...byDay.entries()].map(([day, c]) => ({ day, count: c })),
  };
}

// Listado de usuarios para el backoffice. Con la Service Role Key configurada
// incluye el email de cada cuenta; sin ella, lista los perfiles de la app.
export interface AdminUser {
  id: string;
  email: string | null;
  role: string;
  name: string;
  created_at: string;
}

export async function getAdminUsers(): Promise<{
  users: AdminUser[];
  fullAccess: boolean;
}> {
  const supabase = await getServerClient();
  if (!supabase)
    return {
      users: mock.talentPool.map((c) => ({
        id: c.id,
        email: `${c.full_name.split(" ")[0].toLowerCase()}@ejemplo.com`,
        role: "candidate",
        name: c.full_name,
        created_at: c.created_at,
      })),
      fullAccess: true,
    };

  const { getAdminClient } = await import("./supabase/admin");
  const admin = getAdminClient();

  // Nombres visibles desde las tablas de la app
  const [{ data: candidates }, { data: companies }, { data: profiles }] =
    await Promise.all([
      supabase.from("candidates").select("id, full_name"),
      supabase.from("companies").select("id, trade_name"),
      supabase.from("profiles").select("id, role, created_at"),
    ]);
  const names = new Map<string, string>();
  for (const c of candidates ?? []) names.set(c.id, c.full_name);
  for (const c of companies ?? []) names.set(c.id, c.trade_name);
  const roles = new Map<string, { role: string; created_at: string }>();
  for (const p of profiles ?? [])
    roles.set(p.id, { role: p.role, created_at: p.created_at });

  if (admin) {
    // GoTrue devuelve 500 al listar usuarios si alguna fila de auth.users
    // tiene NULL en las columnas de token (email_change_token_new y
    // parecidas): su lector no sabe convertir NULL a texto. Es un bug de
    // Supabase, no de acá, y la fila se arregla poniendo cadena vacía.
    //
    // Mientras tanto no puede costar el backoffice entero: si la lista no
    // viene, se arma con lo que hay en profiles. Se pierden los emails, que
    // es exactamente lo que aporta el cliente administrativo, pero el resto
    // del panel sigue en pie.
    try {
      const { data, error } = await admin.auth.admin.listUsers({
        perPage: 200,
      });
      if (error) throw error;
      return {
        users: (data?.users ?? []).map((u) => ({
          id: u.id,
          email: u.email ?? null,
          role: roles.get(u.id)?.role ?? "sin perfil",
          name: names.get(u.id) ?? "—",
          created_at: u.created_at,
        })),
        fullAccess: true,
      };
    } catch (e) {
      console.error("getAdminUsers: listUsers falló, sigo sin emails", e);
    }
  }

  return {
    users: [...roles.entries()].map(([id, r]) => ({
      id,
      email: null,
      role: r.role,
      name: names.get(id) ?? "—",
      created_at: r.created_at,
    })),
    fullAccess: false,
  };
}

export async function getPendingIdentities(): Promise<Candidate[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.talentPool.filter((c) => c.identity_status === "pending");
  const { data } = await supabase
    .from("candidates")
    .select("*")
    .eq("identity_status", "pending");
  return (data ?? []) as Candidate[];
}

// ── Vacantes externas (agregador) ──

// Interruptor general: si está apagado, las externas no existen para nadie.
// Todas las vacantes externas activas, para el sitemap.
//
// getExternalJobs corta en 200 porque alimenta el feed, donde nadie scrollea
// mil avisos. Usar esa misma función para el sitemap dejaba afuera a las otras
// ~760: como ordena por fecha de importación, entraba solo la última tanda y
// las vacantes de Argentina, Colombia o Chile nunca llegaban a Google.
//
// Se pagina porque PostgREST devuelve como mucho 1000 filas por consulta.
export async function getAllExternalJobsForSitemap(): Promise<
  { id: string; imported_at: string }[]
> {
  if (!(await externalJobsEnabled())) return [];
  const supabase = await getServerClient();
  if (!supabase) return [];

  const salida: { id: string; imported_at: string }[] = [];
  const PAGINA = 1000;
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await supabase
      .from("external_jobs")
      .select("id, imported_at")
      .eq("status", "activa")
      .order("imported_at", { ascending: false })
      .range(desde, desde + PAGINA - 1);

    if (error) break;
    const filas = (data ?? []) as { id: string; imported_at: string }[];
    salida.push(...filas);
    if (filas.length < PAGINA) break;
    // Tope de seguridad: un sitemap admite 50.000 URLs.
    if (salida.length >= 45_000) break;
  }
  return salida;
}

/** Plantillas de correo editadas desde el admin. Solo las que se tocaron. */
export async function getEmailTemplateOverrides(): Promise<
  { key: string; subject: string; body: string; enabled: boolean }[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("email_templates")
    .select("key, subject, body, enabled");
  return (data ?? []) as {
    key: string;
    subject: string;
    body: string;
    enabled: boolean;
  }[];
}

export async function externalJobsEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.external_jobs_enabled === "true";
}

// Quita los datos de contacto salvo que haya sesión iniciada. El filtrado
// vive acá (servidor) para que el correo nunca viaje al cliente anónimo.
function gateContact(
  job: import("./types").ExternalJob,
  loggedIn: boolean
): import("./types").ExternalJob {
  if (loggedIn) return job;
  return { ...job, apply_email: null, apply_url: null };
}

export async function getExternalJobs(
  country?: string
): Promise<import("./types").ExternalJob[]> {
  if (!(await externalJobsEnabled())) return [];
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  let q = supabase
    .from("external_jobs")
    .select("*")
    .eq("status", "activa");
  if (country) q = q.eq("country", country);
  const { data } = await q
    .order("imported_at", { ascending: false })
    .limit(200);
  return ((data ?? []) as import("./types").ExternalJob[]).map((j) =>
    gateContact(j, !!user)
  );
}

export async function getExternalJob(
  id: string
): Promise<import("./types").ExternalJob | null> {
  if (!(await externalJobsEnabled())) return null;
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  const { data } = await supabase
    .from("external_jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "activa")
    .maybeSingle();
  if (!data) return null;
  return gateContact(data as import("./types").ExternalJob, !!user);
}

// Para el admin: ve todo, incluidas las ocultas y con los contactos.
export async function getAllExternalJobs(): Promise<
  import("./types").ExternalJob[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("external_jobs")
    .select("*")
    .order("imported_at", { ascending: false })
    .limit(300);
  return (data ?? []) as import("./types").ExternalJob[];
}

export async function getJobSources(): Promise<
  import("./types").JobSource[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("job_sources")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as import("./types").JobSource[];
}

// ── Academia ──

export async function getPublishedCourses(): Promise<
  import("./types").Course[]
> {
  const supabase = await getServerClient();
  if (!supabase) return mock.courses;
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "publicado")
    .order("sort", { ascending: true });
  return (data ?? []) as import("./types").Course[];
}

export async function getCourse(
  slug: string
): Promise<import("./types").CourseWithLessons | null> {
  const supabase = await getServerClient();
  if (!supabase) {
    const c = mock.courses.find((x) => x.slug === slug);
    return c ? { ...c, lessons: mock.lessonsFor(c.id) } : null;
  }
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!course) return null;
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("sort", { ascending: true });
  return {
    ...(course as import("./types").Course),
    lessons: (lessons ?? []) as import("./types").Lesson[],
  };
}

// IDs de las lecciones que el usuario actual ya completó en un curso.
export async function getMyCompletions(courseId: string): Promise<Set<string>> {
  const supabase = await getServerClient();
  if (!supabase) return new Set();
  const user = await getCurrentUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("lesson_completions")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId);
  return new Set((data ?? []).map((r) => r.lesson_id as string));
}

// Para el admin: todos los cursos, incluidos los borradores.
export async function getAllCourses(): Promise<import("./types").Course[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.courses;
  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("sort", { ascending: true });
  return (data ?? []) as import("./types").Course[];
}

export async function getCourseLessons(
  courseId: string
): Promise<import("./types").Lesson[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.lessonsFor(courseId);
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort", { ascending: true });
  return (data ?? []) as import("./types").Lesson[];
}

// ── Blog ──

export async function getPublishedPosts(): Promise<
  import("./types").BlogPost[]
> {
  const supabase = await getServerClient();
  if (!supabase) return mock.blogPosts;
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "publicado")
    .order("published_at", { ascending: false });
  return (data ?? []) as import("./types").BlogPost[];
}

export async function getBlogPost(
  slug: string
): Promise<import("./types").BlogPost | null> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.blogPosts.find((p) => p.slug === slug) ?? null;
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as import("./types").BlogPost) ?? null;
}

// Todos los posts (borradores incluidos) para el editor del admin.
export async function getAllBlogPosts(): Promise<
  import("./types").BlogPost[]
> {
  const supabase = await getServerClient();
  if (!supabase) return mock.blogPosts;
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data ?? []) as import("./types").BlogPost[];
}

export async function getCustomBadges(): Promise<
  import("./types").CustomBadge[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("custom_badges")
    .select("*")
    .order("created_at");
  return (data ?? []) as import("./types").CustomBadge[];
}

export async function getModerationQueue(): Promise<JobWithCompany[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.getJobsWithCompany().filter((j) => j.status === "Moderacion");
  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("status", "Moderacion");
  return (data ?? []).map(mapJob);
}

// Todas las vacantes para la gestión del admin (más recientes primero).
export async function getAllJobsForAdmin(): Promise<JobWithCompany[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getJobsWithCompany();
  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map(mapJob);
}

// Denuncias con el detalle de la vacante y empresa (bandeja del admin).
export interface DetailedReport extends Report {
  job_title: string;
  job_status: string;
  company_id: string;
  company_name: string;
}

export async function getDetailedReports(): Promise<DetailedReport[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.reports.map((r) => {
      const job = mock.getJobById(r.job_id);
      return {
        ...r,
        job_title: job?.title ?? "Vacante",
        job_status: job?.status ?? "Activo",
        company_id: job?.company_id ?? "",
        company_name: job?.company.trade_name ?? "—",
      };
    });
  const { data } = await supabase
    .from("reports")
    .select("*, job:jobs(title, status, company_id, company:companies(trade_name))")
    .order("created_at", { ascending: false })
    .limit(100);
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    job_id: r.job_id,
    reporter_id: r.reporter_id,
    reason: r.reason,
    created_at: r.created_at,
    job_title: r.job?.title ?? "Vacante",
    job_status: r.job?.status ?? "?",
    company_id: r.job?.company_id ?? "",
    company_name: r.job?.company?.trade_name ?? "—",
  }));
}

export async function getReports(): Promise<Report[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.reports;
  const { data } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Report[];
}

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.companies;
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at");
  return (data ?? []).map(mapCompany);
}

export async function getPendingCompanies(): Promise<Company[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.companies.filter((c) => !c.is_verified);
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("is_verified", false);
  return (data ?? []).map(mapCompany);
}

export async function getActiveJobsCount(): Promise<number> {
  const supabase = await getServerClient();
  if (!supabase) return mock.getActiveJobs().length;
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "Activo");
  return count ?? 0;
}

// Total de vacantes activas de un país = las de empresas de Worka de ese
// país + las externas activas de ese país (si el agregador está encendido).
export async function getCountryJobsCount(country: string): Promise<number> {
  const supabase = await getServerClient();
  if (!supabase) {
    const worka = mock
      .getActiveJobs()
      .filter((j) => (j.company.country ?? "py") === country).length;
    return worka; // en demo no hay externas
  }

  const { count: workaCount } = await supabase
    .from("jobs")
    // inner join a companies para filtrar por país de la empresa
    .select("id, companies!inner(country)", { count: "exact", head: true })
    .eq("status", "Activo")
    .eq("companies.country", country);

  let externalCount = 0;
  if (await externalJobsEnabled()) {
    const { count } = await supabase
      .from("external_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "activa")
      .eq("country", country);
    externalCount = count ?? 0;
  }

  return (workaCount ?? 0) + externalCount;
}

/* ── Worka Freelancers ── */

// Perfil de freelancer del usuario logueado (null si todavía no se unió).
export async function getMyFreelancerProfile(): Promise<FreelancerWithIdentity | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("freelancer_profiles")
    .select("*, candidates!inner(full_name, avatar_url)")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return attachIdentity(data);
}

// Directorio público con filtros opcionales.
export async function getFreelancerDirectory(opts?: {
  country?: string;
  category?: string;
  q?: string;
}): Promise<FreelancerWithIdentity[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("freelancer_profiles")
    .select("*, candidates!inner(full_name, avatar_url)")
    .eq("is_public", true)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(60);
  if (opts?.country) query = query.eq("country", opts.country);
  if (opts?.category && opts.category !== "Todas")
    query = query.eq("category", opts.category);
  if (opts?.q) query = query.ilike("headline", `%${opts.q}%`);
  const { data } = await query;
  return (data ?? []).map(attachIdentity);
}

// Perfil público completo por slug (con servicios, portfolio y links de pago).
export async function getPublicFreelancer(
  slug: string
): Promise<FreelancerPublic | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("freelancer_profiles")
    .select(
      "*, candidates!inner(full_name, avatar_url), freelancer_services(*), portfolio_items(*), payment_links(*)"
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (!data) return null;
  const base = attachIdentity(data);
  const sortBy = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;
  return {
    ...base,
    services: ((data as any).freelancer_services ?? []).sort(sortBy),
    portfolio: ((data as any).portfolio_items ?? []).sort(sortBy),
    payment_links: ((data as any).payment_links ?? []).sort(sortBy),
  };
}

// Presupuestos recibidos por el freelancer logueado.
export async function getMyQuoteRequests(): Promise<QuoteRequest[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as QuoteRequest[];
}

// Extrae la identidad (nombre/foto) del join con candidates y la adjunta.
function attachIdentity(row: any): FreelancerWithIdentity {
  const c = row.candidates ?? {};
  const { candidates, freelancer_services, portfolio_items, payment_links, ...profile } =
    row;
  return {
    ...(profile as FreelancerWithIdentity),
    identity: {
      full_name: c.full_name ?? "Freelancer",
      avatar_url: c.avatar_url ?? null,
    },
  };
}

// Panel del freelancer: su perfil + todas sus secciones + presupuestos.
export async function getMyFreelancerDashboard(): Promise<{
  profile: import("./types").FreelancerWithIdentity;
  services: import("./types").FreelancerService[];
  portfolio: import("./types").PortfolioItem[];
  payment_links: import("./types").PaymentLink[];
  quotes: QuoteRequest[];
} | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("freelancer_profiles")
    .select(
      "*, candidates!inner(full_name, avatar_url), freelancer_services(*), portfolio_items(*), payment_links(*)"
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  const profile = attachIdentity(data);
  const sortBy = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;
  const quotes = await getMyQuoteRequests();
  return {
    profile,
    services: (((data as any).freelancer_services ?? []) as import("./types").FreelancerService[]).sort(sortBy),
    portfolio: (((data as any).portfolio_items ?? []) as import("./types").PortfolioItem[]).sort(sortBy),
    payment_links: (((data as any).payment_links ?? []) as import("./types").PaymentLink[]).sort(sortBy),
    quotes,
  };
}

/* ── Alertas de empleo ── */

export async function getMyAlerts(): Promise<import("./types").JobAlert[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as import("./types").JobAlert[];
}

/* ── Panorama de mercado ── */

export interface MarketPanorama {
  country: string;
  workaActive: number;
  externalActive: number;
  totalActive: number;
  newThisWeek: number;
  applicantsPerJob: number | null;
  topIndustries: { industry: string; count: number }[];
  topCities: { city: string; count: number }[];
  freelancers: {
    total: number;
    byCategory: { category: string; count: number }[];
  };
}

// Métricas de mercado del país activo. Todo se calcula de datos reales:
// vacantes de Worka, vacantes externas agregadas, postulaciones y freelancers.
export async function getMarketPanorama(
  country: string
): Promise<MarketPanorama> {
  const empty: MarketPanorama = {
    country,
    workaActive: 0,
    externalActive: 0,
    totalActive: 0,
    newThisWeek: 0,
    applicantsPerJob: null,
    topIndustries: [],
    topCities: [],
    freelancers: { total: 0, byCategory: [] },
  };
  const supabase = await getServerClient();
  if (!supabase) return empty;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  // Vacantes de Worka activas (con país de la empresa)
  const { data: workaRows } = await supabase
    .from("jobs")
    .select("industry,created_at,company:companies!inner(country,location_city)")
    .eq("status", "Activo")
    .gt("expires_at", nowIso)
    .limit(2000);
  const worka = ((workaRows ?? []) as any[]).filter(
    (j) => (j.company?.country ?? "py") === country
  );

  // Vacantes externas activas del país
  const { data: extRows } = await supabase
    .from("external_jobs")
    .select("industry,city,imported_at")
    .eq("status", "activa")
    .eq("country", country)
    .limit(4000);
  const ext = (extRows ?? []) as any[];

  // Conteo por rubro (Worka + externas)
  const indCount = new Map<string, number>();
  const cityCount = new Map<string, number>();
  let newThisWeek = 0;
  for (const j of worka) {
    if (j.industry) indCount.set(j.industry, (indCount.get(j.industry) ?? 0) + 1);
    const city = j.company?.location_city;
    if (city) cityCount.set(city, (cityCount.get(city) ?? 0) + 1);
    if (j.created_at > weekAgo) newThisWeek++;
  }
  for (const j of ext) {
    if (j.industry) indCount.set(j.industry, (indCount.get(j.industry) ?? 0) + 1);
    if (j.city) cityCount.set(j.city, (cityCount.get(j.city) ?? 0) + 1);
    if (j.imported_at > weekAgo) newThisWeek++;
  }

  const topIndustries = [...indCount.entries()]
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const topCities = [...cityCount.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Competencia: postulaciones totales / vacantes de Worka (aprox.)
  let applicantsPerJob: number | null = null;
  const { count: appCount } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true });
  if (appCount != null && worka.length > 0)
    applicantsPerJob = Math.round((appCount / worka.length) * 10) / 10;

  // Freelancers por categoría
  const { data: flRows } = await supabase
    .from("freelancer_profiles")
    .select("category")
    .eq("is_public", true)
    .eq("country", country)
    .limit(2000);
  const flCount = new Map<string, number>();
  for (const f of (flRows ?? []) as any[])
    flCount.set(f.category, (flCount.get(f.category) ?? 0) + 1);

  return {
    country,
    workaActive: worka.length,
    externalActive: ext.length,
    totalActive: worka.length + ext.length,
    newThisWeek,
    applicantsPerJob,
    topIndustries,
    topCities,
    freelancers: {
      total: (flRows ?? []).length,
      byCategory: [...flCount.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    },
  };
}

/* ── Reseñas de empresas ── */

// Empleadores más reseñados del país (registrados o no), con promedio.
export async function getTopEmployers(
  country: string
): Promise<import("./types").EmployerSummary[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("company_reviews")
    .select("company_slug,company_name,company_id,rating")
    .eq("status", "visible")
    .eq("country", country)
    .limit(2000);
  const groups = new Map<
    string,
    { name: string; company_id: string | null; sum: number; n: number }
  >();
  for (const r of (data ?? []) as any[]) {
    const g = groups.get(r.company_slug) ?? {
      name: r.company_name,
      company_id: null,
      sum: 0,
      n: 0,
    };
    g.sum += r.rating;
    g.n += 1;
    if (r.company_id) g.company_id = r.company_id;
    groups.set(r.company_slug, g);
  }
  const summaries = [...groups.entries()].map(([slug, g]) => ({
    slug,
    name: g.name,
    company_id: g.company_id,
    logo_url: null as string | null,
    avg_rating: Math.round((g.sum / g.n) * 10) / 10,
    review_count: g.n,
  }));
  summaries.sort((a, b) => b.review_count - a.review_count);
  return summaries.slice(0, 24);
}

// Ficha de un empleador por slug: resumen + reseñas visibles.
export async function getEmployerBySlug(
  slug: string,
  fallbackName?: string
): Promise<{
  summary: import("./types").EmployerSummary;
  reviews: import("./types").CompanyReview[];
} | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data: reviews } = await supabase
    .from("company_reviews")
    .select("*")
    .eq("company_slug", slug)
    .eq("status", "visible")
    .order("created_at", { ascending: false });
  const list = (reviews ?? []) as import("./types").CompanyReview[];

  // Resolver identidad del empleador (nombre, si está registrado, logo).
  let name = list[0]?.company_name ?? fallbackName ?? slug;
  let company_id: string | null =
    list.find((r) => r.company_id)?.company_id ?? null;
  let logo_url: string | null = null;

  // ¿Hay una empresa registrada cuyo nombre normaliza a este slug?
  if (!company_id) {
    const { data: comps } = await supabase
      .from("companies")
      .select("id,trade_name,company_name,logo_url")
      .or(`trade_name.ilike.%${name}%,company_name.ilike.%${name}%`)
      .limit(20);
    const match = ((comps ?? []) as any[]).find(
      (c) => slugify(c.trade_name) === slug || slugify(c.company_name) === slug
    );
    if (match) {
      company_id = match.id;
      name = match.trade_name || match.company_name;
      logo_url = match.logo_url;
    }
  } else {
    const { data: comp } = await supabase
      .from("companies")
      .select("trade_name,company_name,logo_url")
      .eq("id", company_id)
      .maybeSingle();
    if (comp) {
      name = (comp as any).trade_name || (comp as any).company_name;
      logo_url = (comp as any).logo_url;
    }
  }

  if (list.length === 0 && !fallbackName && !company_id) return null;

  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return {
    summary: {
      slug,
      name,
      company_id,
      logo_url,
      avg_rating: list.length ? Math.round((sum / list.length) * 10) / 10 : 0,
      review_count: list.length,
    },
    reviews: list,
  };
}

// Busca empleadores para reseñar: registrados en Worka + nombres de las
// vacantes externas. Devuelve candidatos con su slug.
export async function searchEmployers(
  q: string,
  country: string
): Promise<
  { slug: string; name: string; company_id: string | null; logo_url: string | null }[]
> {
  const supabase = await getServerClient();
  if (!supabase || q.trim().length < 2) return [];
  const term = `%${q.trim()}%`;

  const [{ data: comps }, { data: ext }] = await Promise.all([
    supabase
      .from("companies")
      .select("id,trade_name,company_name,logo_url")
      .eq("country", country)
      .or(`trade_name.ilike.${term},company_name.ilike.${term}`)
      .limit(10),
    supabase
      .from("external_jobs")
      .select("company_name")
      .eq("country", country)
      .ilike("company_name", term)
      .limit(50),
  ]);

  const out = new Map<
    string,
    { slug: string; name: string; company_id: string | null; logo_url: string | null }
  >();
  for (const c of (comps ?? []) as any[]) {
    const name = c.trade_name || c.company_name;
    out.set(slugify(name), {
      slug: slugify(name),
      name,
      company_id: c.id,
      logo_url: c.logo_url,
    });
  }
  for (const e of (ext ?? []) as any[]) {
    if (!e.company_name) continue;
    const slug = slugify(e.company_name);
    if (!out.has(slug))
      out.set(slug, {
        slug,
        name: e.company_name,
        company_id: null,
        logo_url: null,
      });
  }
  return [...out.values()].slice(0, 12);
}

// Rating agregado de una empresa registrada (para su ficha pública).
export async function getCompanyRating(
  companyId: string
): Promise<{ avg: number; count: number; slug: string | null }> {
  const supabase = await getServerClient();
  if (!supabase) return { avg: 0, count: 0, slug: null };
  const { data } = await supabase
    .from("company_reviews")
    .select("rating,company_slug")
    .eq("company_id", companyId)
    .eq("status", "visible");
  const list = (data ?? []) as any[];
  if (list.length === 0) return { avg: 0, count: 0, slug: null };
  const sum = list.reduce((a, r) => a + r.rating, 0);
  return {
    avg: Math.round((sum / list.length) * 10) / 10,
    count: list.length,
    slug: list[0].company_slug ?? null,
  };
}
