import "server-only";
import { getServerClient, getCurrentUser } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type {
  Application,
  ApplicationStatus,
  Candidate,
  ChatMessage,
  Company,
  CompanyPost,
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
export async function getTalentPool(): Promise<Candidate[]> {
  const supabase = await getServerClient();
  if (!supabase) return mock.talentPool.filter((c) => c.visible_to_companies);
  const { data } = await supabase
    .from("candidates")
    .select("*")
    .eq("visible_to_companies", true)
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
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
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
