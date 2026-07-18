"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import type {
  ApplicationStatus,
  BadgeId,
  ContractType,
  JobStatus,
  Modality,
} from "@/lib/types";

export type ActionResult = { ok: boolean; error?: string; demo?: boolean };

const DEMO: ActionResult = { ok: true, demo: true };

// --- Candidato ---

// Límite diario de postulaciones: frena bots y postulaciones masivas sin sentido.
const DAILY_APPLICATION_LIMIT = 20;

export async function applyToJob(
  jobId: string,
  answers: { question_id: string; answer: boolean }[]
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para postularte." };

  // Medidas de seguridad livianas: perfil completo + WhatsApp verificado.
  const { data: candidate } = await supabase
    .from("candidates")
    .select("full_name, phone_whatsapp, phone_verified, location_city")
    .eq("id", user.id)
    .maybeSingle();
  if (!candidate || !candidate.full_name || !candidate.location_city)
    return {
      ok: false,
      error: "Completá tu perfil para postularte. Te toma 2 minutos.",
    };
  if (!candidate.phone_verified)
    return {
      ok: false,
      error:
        "Verificá tu WhatsApp desde tu perfil para poder postularte. Así las empresas saben que sos una persona real.",
    };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", user.id)
    .gte("applied_at", todayStart.toISOString());
  if ((count ?? 0) >= DAILY_APPLICATION_LIMIT)
    return {
      ok: false,
      error:
        "Llegaste al límite de 20 postulaciones por día. Mañana podés seguir: apuntá a las vacantes que mejor encajen con tu perfil.",
    };

  const { data: application, error } = await supabase
    .from("applications")
    .insert({ job_id: jobId, candidate_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ya te postulaste a esta vacante." };
    return { ok: false, error: "No pudimos enviar tu postulación." };
  }

  if (answers.length > 0) {
    await supabase.from("application_answers").insert(
      answers.map((a) => ({
        application_id: application.id,
        question_id: a.question_id,
        answer: a.answer,
      }))
    );
  }

  revalidatePath("/postulaciones");
  return { ok: true };
}

export async function reportJob(
  jobId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para denunciar." };

  const { error } = await supabase
    .from("reports")
    .insert({ job_id: jobId, reporter_id: user.id, reason });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ya denunciaste esta vacante." };
    return { ok: false, error: "No pudimos registrar la denuncia." };
  }
  return { ok: true };
}

// Verificación de WhatsApp. En producción, requestPhoneCode envía un código
// por la API de WhatsApp (Meta Cloud API) y verifyPhoneCode lo contrasta.
// Hasta conectar esa API, el código de prueba es 123456.
export async function requestPhoneCode(): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  // TODO(whatsapp-api): generar código, guardarlo con vencimiento y enviarlo.
  return { ok: true };
}

export async function verifyPhoneCode(code: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  // TODO(whatsapp-api): contrastar contra el código enviado de verdad.
  if (code.trim() !== "123456")
    return { ok: false, error: "Código incorrecto. Revisá tu WhatsApp." };
  const { error } = await supabase
    .from("candidates")
    .update({ phone_verified: true })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos verificar tu número." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function toggleSaveJob(
  jobId: string,
  save: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para guardar vacantes." };
  if (save) {
    const { error } = await supabase
      .from("saved_jobs")
      .upsert({ candidate_id: user.id, job_id: jobId });
    if (error) return { ok: false, error: "No pudimos guardar la vacante." };
  } else {
    await supabase
      .from("saved_jobs")
      .delete()
      .eq("candidate_id", user.id)
      .eq("job_id", jobId);
  }
  revalidatePath("/postulaciones");
  return { ok: true };
}

// Identidad verificada (opcional): sube cédula → revisión manual del admin.
export async function requestIdentityVerification(): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("candidates")
    .update({ identity_status: "pending" })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos enviar la solicitud." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function setIdentityStatus(
  candidateId: string,
  status: "verified" | "none"
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("candidates")
    .update({ identity_status: status })
    .eq("id", candidateId);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function addWorkReference(input: {
  referrer_name: string;
  referrer_phone: string;
  relationship: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("work_references")
    .insert({ candidate_id: user.id, ...input });
  if (error) return { ok: false, error: "No pudimos agregar la referencia." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function toggleFollowCompany(
  companyId: string,
  follow: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para seguir empresas." };
  if (follow) {
    const { error } = await supabase
      .from("company_followers")
      .upsert({ candidate_id: user.id, company_id: companyId });
    if (error) return { ok: false, error: "No pudimos seguir la empresa." };
  } else {
    await supabase
      .from("company_followers")
      .delete()
      .eq("candidate_id", user.id)
      .eq("company_id", companyId);
  }
  return { ok: true };
}

export async function proposeInterview(
  applicationId: string,
  proposedAt: string,
  location: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.from("interviews").insert({
    application_id: applicationId,
    proposed_at: new Date(proposedAt).toISOString(),
    location,
  });
  if (error) return { ok: false, error: "No pudimos proponer la entrevista." };
  return { ok: true };
}

export async function respondInterview(
  interviewId: string,
  accept: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("interviews")
    .update({ status: accept ? "confirmada" : "rechazada" })
    .eq("id", interviewId);
  if (error) return { ok: false, error: "No pudimos responder la entrevista." };
  revalidatePath("/postulaciones");
  return { ok: true };
}

export async function setApplicationNote(
  applicationId: string,
  note: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("applications")
    .update({ internal_note: note.slice(0, 1000) })
    .eq("id", applicationId);
  if (error) return { ok: false, error: "No pudimos guardar la nota." };
  return { ok: true };
}

export async function markNotificationsRead(): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  return { ok: true };
}

export async function sendChatMessage(
  applicationId: string,
  sender: "candidate" | "company",
  content: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.from("messages").insert({
    application_id: applicationId,
    sender,
    content: content.slice(0, 1000),
  });
  if (error) return { ok: false, error: "No pudimos enviar el mensaje." };
  return { ok: true };
}

export async function updateCandidatePrefs(prefs: {
  first_job_mode?: boolean;
  alerts_enabled?: boolean;
  visible_to_companies?: boolean;
  public_profile?: boolean;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("candidates")
    .update(prefs)
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar tus cambios." };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function completeOnboarding(input: {
  full_name: string;
  phone_whatsapp: string;
  phone_verified: boolean;
  location_city: string;
  preferences_industry: string[];
  first_job_mode: boolean;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "candidate" });
  if (profileError)
    return { ok: false, error: "No pudimos crear tu perfil." };

  const { error } = await supabase.from("candidates").upsert({
    id: user.id,
    ...input,
  });
  if (error) return { ok: false, error: "No pudimos guardar tus datos." };
  return { ok: true };
}

// --- Empresa ---

export async function createJob(input: {
  title: string;
  description: string;
  industry: string;
  modality: Modality;
  contract_type: ContractType | null;
  salary_range: string | null;
  schedule: string | null;
  address: string | null;
  nearby_transit: string | null;
  requirements: string[];
  benefits: string[];
  vacancies_count: number;
  expires_at: string | null;
  urgent: boolean;
  requires_experience: boolean;
  questions: string[];
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  const { questions, expires_at, ...jobFields } = input;
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      ...jobFields,
      company_id: user.id,
      ...(expires_at ? { expires_at } : {}),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No pudimos publicar la vacante." };

  if (questions.length > 0) {
    await supabase.from("job_questions").insert(
      questions.slice(0, 3).map((q, i) => ({
        job_id: job.id,
        question: q,
        position: i + 1,
      }))
    );
  }

  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  rejectionReason?: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("applications")
    .update({ status, rejection_reason: rejectionReason ?? null })
    .eq("id", applicationId);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };
  return { ok: true };
}

export async function duplicateJob(jobId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };

  const { data: original } = await supabase
    .from("jobs")
    .select("*, job_questions(*)")
    .eq("id", jobId)
    .single();
  if (!original) return { ok: false, error: "Vacante no encontrada." };

  const { job_questions, id, created_at, expires_at, views_count, ...fields } =
    original;
  void id;
  void created_at;
  void expires_at;
  void views_count;
  const { data: copy, error } = await supabase
    .from("jobs")
    .insert({ ...fields, status: "Pausado" })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No pudimos duplicar la vacante." };

  if (job_questions?.length) {
    await supabase.from("job_questions").insert(
      job_questions.map((q: { question: string; position: number }) => ({
        job_id: copy.id,
        question: q.question,
        position: q.position,
      }))
    );
  }
  revalidatePath("/empresa");
  return { ok: true };
}

export async function setJobStatus(
  jobId: string,
  status: JobStatus
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos cambiar el estado." };
  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function deleteJob(jobId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos eliminar la vacante." };
  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function updateJobExpiry(
  jobId: string,
  expiresAt: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("jobs")
    .update({ expires_at: new Date(expiresAt).toISOString() })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos actualizar la vigencia." };
  revalidatePath("/empresa");
  return { ok: true };
}

export async function updateCompanyProfile(input: {
  trade_name?: string;
  description?: string;
  location_city?: string;
  website_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("companies")
    .update(input)
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar los cambios." };
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

export async function createCompanyPost(
  content: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("company_posts")
    .insert({ company_id: user.id, content: content.slice(0, 500) });
  if (error) return { ok: false, error: "No pudimos publicar la novedad." };
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

export async function registerCompany(input: {
  company_name: string;
  trade_name: string;
  ruc: string;
  location_city: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user)
    return { ok: false, error: "Creá tu cuenta primero para registrar la empresa." };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "company" });
  if (profileError) return { ok: false, error: "No pudimos crear el perfil." };

  const { error } = await supabase
    .from("companies")
    .upsert({ id: user.id, ...input });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ese RUC ya está registrado en Worka." };
    return { ok: false, error: "No pudimos registrar la empresa." };
  }
  return { ok: true };
}

// --- Admin ---

export async function resolveModeration(
  jobId: string,
  decision: "aprobar" | "eliminar"
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("jobs")
    .update({ status: decision === "aprobar" ? "Activo" : "Cerrado" })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos resolver la moderación." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleCompanyBadge(
  companyId: string,
  badge: BadgeId,
  grant: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { data: company } = await supabase
    .from("companies")
    .select("badges")
    .eq("id", companyId)
    .single();
  if (!company) return { ok: false, error: "Empresa no encontrada." };
  const current: string[] = company.badges ?? [];
  const next = grant
    ? [...new Set([...current, badge])]
    : current.filter((b) => b !== badge);
  const { error } = await supabase
    .from("companies")
    .update({ badges: next })
    .eq("id", companyId);
  if (error) return { ok: false, error: "No pudimos actualizar la insignia." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function verifyCompany(companyId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase
    .from("companies")
    .update({ is_verified: true, ruc_check_status: "coincide" })
    .eq("id", companyId);
  if (error) return { ok: false, error: "No pudimos verificar la empresa." };
  revalidatePath("/admin");
  return { ok: true };
}

// --- Auth ---

export async function signInWithEmail(
  email: string,
  password: string,
  next: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Email o contraseña incorrectos." };
  redirect(next || "/empleos");
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
