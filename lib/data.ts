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
      .map((q: any) => ({ id: q.id, question: q.question })),
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
  candidate_name: string;
  candidate_city: string;
  candidate_phone: string;
  status: ApplicationStatus;
  applied_at: string;
  answers_ok: number;
  answers_total: number;
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
  return data ? mapCompany(data) : null;
}

export async function getApplicantsForJob(
  jobId: string
): Promise<KanbanApplicant[]> {
  const supabase = await getServerClient();
  if (!supabase)
    return mock.companyApplicants.map((a) => ({
      ...a,
      candidate_phone: "595981234567",
    }));
  const { data } = await supabase
    .from("applications")
    .select(
      "*, candidate:candidates(full_name, location_city, phone_whatsapp), answers:application_answers(answer)"
    )
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    id: row.id,
    candidate_name: row.candidate?.full_name ?? "Candidato",
    candidate_city: row.candidate?.location_city ?? "",
    candidate_phone: (row.candidate?.phone_whatsapp ?? "").replace(/\D/g, ""),
    status: row.status,
    applied_at: row.applied_at,
    answers_ok: (row.answers ?? []).filter((x: any) => x.answer).length,
    answers_total: (row.answers ?? []).length,
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
