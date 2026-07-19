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

// Convierte cualquier error de Supabase/Auth en un texto legible en español.
// Nunca devuelve "{}" ni un objeto: eso era lo que se veía en pantalla.
function friendlyAuthError(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message ?? "")
      : String(err ?? "");
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (!msg || msg === "{}" || msg === "[object Object]")
    return "No pudimos conectar con el servidor. Revisá tu conexión y volvé a intentar.";
  if (lower.includes("already registered") || lower.includes("already exists"))
    return "Ese email ya tiene una cuenta. Iniciá sesión en su lugar.";
  if (lower.includes("password") && lower.includes("least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (lower.includes("invalid") && lower.includes("email"))
    return "El email no es válido. Revisalo e intentá de nuevo.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Demasiados intentos. Esperá un minuto y probá otra vez.";
  return msg;
}

export type ActionResult = {
  ok: boolean;
  error?: string;
  demo?: boolean;
  token?: string;
};

const DEMO: ActionResult = { ok: true, demo: true };

// Empresa efectiva del usuario: su propia empresa, o aquella de la que es
// miembro activo del equipo de reclutamiento (invitado por el dueño).
async function getEffectiveCompanyId(
  supabase: NonNullable<Awaited<ReturnType<typeof getServerClient>>>,
  userId: string
): Promise<string | null> {
  const { data: own } = await supabase
    .from("companies")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (own) return own.id;
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("member_id", userId)
    .eq("status", "activa")
    .limit(1)
    .maybeSingle();
  return membership?.company_id ?? null;
}

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

  // Medida anti-spam liviana: exigimos perfil con datos básicos.
  // (La verificación de WhatsApp quedará como requisito cuando conectemos la
  // API de Meta; hoy no bloquea para no frenar postulaciones legítimas.)
  const { data: candidate } = await supabase
    .from("candidates")
    .select("full_name, location_city")
    .eq("id", user.id)
    .maybeSingle();
  if (!candidate || !candidate.full_name || !candidate.location_city)
    return {
      ok: false,
      error:
        "Completá tu perfil (nombre y ciudad) para postularte. Te toma 2 minutos.",
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
    console.error("applyToJob insert error:", error);
    // Surface del código de Postgres para diagnosticar (42501 = RLS, 23503 = FK…)
    return {
      ok: false,
      error: `No pudimos enviar tu postulación (${error.code ?? "?"}: ${error.message ?? "error"}).`,
    };
  }

  if (answers.length > 0) {
    await supabase.from("application_answers").insert(
      answers.map((a) => ({
        application_id: application.id,
        question_id: a.question_id,
        answer: a.answer,
      }))
    );

    // Preguntas eliminatorias (knockout): un "No" descarta automáticamente.
    // La empresa lo ve en Descartados y el candidato en su línea de tiempo.
    const { data: knockouts } = await supabase
      .from("job_questions")
      .select("id")
      .eq("job_id", jobId)
      .eq("knockout", true);
    const knockoutIds = new Set((knockouts ?? []).map((q: { id: string }) => q.id));
    const failedKnockout = answers.some(
      (a) => knockoutIds.has(a.question_id) && !a.answer
    );
    if (failedKnockout) {
      await supabase
        .from("applications")
        .update({
          status: "Rechazado",
          rejection_reason: "Perfil distinto al buscado",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", application.id);
    }
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

// Subida real del CV al bucket privado 'cvs'
export async function uploadCv(formData: FormData): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const file = formData.get("cv") as File | null;
  if (!file || file.size === 0)
    return { ok: false, error: "Elegí un archivo PDF." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "El CV no puede pesar más de 5 MB." };

  const path = `${user.id}/cv.pdf`;
  const { error } = await supabase.storage
    .from("cvs")
    .upload(path, file, { upsert: true, contentType: "application/pdf" });
  if (error)
    return {
      ok: false,
      error:
        "No pudimos subir el CV. Verificá que el bucket 'cvs' exista (migration-002.sql).",
    };

  await supabase.from("candidates").update({ cv_url: path }).eq("id", user.id);
  revalidatePath("/perfil");
  return { ok: true };
}

// Identidad verificada: sube frente y dorso de cédula + selfie sosteniéndola.
// Quedan en el bucket privado 'identidad' (solo el admin puede verlas) y el
// perfil pasa a 'pending' hasta la aprobación en el backoffice.
export async function submitIdentityDocs(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };

  const parts: [string, string][] = [
    ["front", "frente"],
    ["back", "dorso"],
    ["selfie", "selfie"],
  ];
  for (const [field, label] of parts) {
    const file = formData.get(field) as File | null;
    if (!file || file.size === 0)
      return { ok: false, error: `Falta la foto: ${label}.` };
    if (file.size > 8 * 1024 * 1024)
      return { ok: false, error: `La foto de ${label} pesa más de 8 MB.` };
    const ext = file.type === "image/png" ? "png" : "jpg";
    const { error } = await supabase.storage
      .from("identidad")
      .upload(`${user.id}/${field}.${ext}`, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
    if (error) {
      console.error("submitIdentityDocs upload error:", error);
      const hint = error.message?.toLowerCase().includes("row-level security")
        ? "Faltan aplicar las políticas de Storage: corré supabase/fix-storage.sql."
        : "¿Existe el bucket 'identidad'? Corré supabase/fix-storage.sql.";
      return {
        ok: false,
        error: `No pudimos subir la foto de ${label} (${error.message}). ${hint}`,
      };
    }
  }

  const { error } = await supabase
    .from("candidates")
    .update({ identity_status: "pending" })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos enviar la solicitud." };
  revalidatePath("/perfil");
  revalidatePath("/admin");
  return { ok: true };
}

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
  if (!supabase) return { ...DEMO, token: `demo-${Date.now()}` };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { data, error } = await supabase
    .from("work_references")
    .insert({ candidate_id: user.id, ...input, status: "generada" })
    .select("token")
    .single();
  if (error) return { ok: false, error: "No pudimos agregar la referencia." };
  revalidatePath("/perfil");
  return { ok: true, token: data.token as string };
}

// Confirmación pública de referencia vía link único (RPC security definer)
export async function confirmReferenceByToken(
  token: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { data, error } = await supabase.rpc("confirm_reference", {
    ref_token: token,
  });
  if (error || !data)
    return { ok: false, error: "El link no es válido o ya venció." };
  return { ok: true };
}

// Configuración del candidato: edición completa de datos (incluye bio y rubros)
export async function updateCandidateProfile(input: {
  full_name?: string;
  phone_whatsapp?: string;
  location_city?: string;
  preferences_industry?: string[];
  bio?: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("candidates")
    .update(input)
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar tus datos." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true };
}

// Foto de perfil del candidato → bucket público, visible para empresas.
export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "Elegí una imagen." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "La foto no puede pesar más de 5 MB." };

  const path = `avatars/${user.id}.jpg`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: "image/jpeg" });
  if (error)
    return { ok: false, error: "No pudimos subir la foto. ¿Existe el bucket 'publico'?" };
  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  await supabase.from("candidates").update({ avatar_url: url }).eq("id", user.id);
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true, url };
}

// URL firmada temporal para ver el CV propio (el bucket 'cvs' es privado).
export async function getMyCvUrl(): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: true, url: "#demo-cv" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { data, error } = await supabase.storage
    .from("cvs")
    .createSignedUrl(`${user.id}/cv.pdf`, 300);
  if (error || !data)
    return { ok: false, error: "No encontramos tu CV cargado." };
  return { ok: true, url: data.signedUrl };
}

// Elimina el CV cargado (archivo + referencia en el perfil).
export async function deleteCv(): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  await supabase.storage.from("cvs").remove([`${user.id}/cv.pdf`]);
  await supabase.from("candidates").update({ cv_url: null }).eq("id", user.id);
  revalidatePath("/perfil");
  return { ok: true };
}

export async function deleteWorkReference(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("work_references")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);
  if (error) return { ok: false, error: "No pudimos eliminar la referencia." };
  revalidatePath("/perfil");
  return { ok: true };
}

// Suma 1 vista al abrir el detalle de una vacante.
export async function incrementJobViews(jobId: string): Promise<void> {
  const supabase = await getServerClient();
  if (!supabase) return;
  await supabase.rpc("increment_job_views", { job: jobId });
}

// Eliminación de cuenta: borra el perfil (cascada a todos los datos) y cierra sesión.
export async function deleteAccount(): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos eliminar la cuenta." };
  await supabase.auth.signOut();
  redirect("/");
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

// La empresa contactó al candidato por WhatsApp: el estado pasa a 'Contactado'
// al instante y el candidato lo ve reflejado en su línea de tiempo + campanita.
export async function contactApplicant(
  applicationId: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;

  const { data: app } = await supabase
    .from("applications")
    .select("candidate_id, reviewed_at, job:jobs(title, company:companies(trade_name))")
    .eq("id", applicationId)
    .maybeSingle();

  const { error } = await supabase
    .from("applications")
    .update({
      status: "Contactado",
      ...((app as any)?.reviewed_at ? {} : { reviewed_at: new Date().toISOString() }),
    })
    .eq("id", applicationId);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };

  const a = app as any;
  if (a?.candidate_id) {
    const empresa = a.job?.company?.trade_name ?? "Una empresa";
    await supabase.from("notifications").insert({
      user_id: a.candidate_id,
      icon: "💬",
      title: `${empresa} te contactó`,
      body: `Te escribieron por WhatsApp por "${a.job?.title ?? "una vacante"}". ¡Revisá tu teléfono!`,
      href: "/postulaciones",
    });
  }
  revalidatePath("/postulaciones");
  return { ok: true };
}

// La empresa abre el CV del candidato (URL firmada; RLS: solo si se postuló).
export async function getApplicantCvUrl(
  candidateId: string
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { ok: true, url: "#demo-cv" };
  const { data, error } = await supabase.storage
    .from("cvs")
    .createSignedUrl(`${candidateId}/cv.pdf`, 300);
  if (error || !data)
    return { ok: false, error: "Este candidato no cargó un CV." };
  return { ok: true, url: data.signedUrl };
}

export async function proposeInterview(
  applicationId: string,
  proposedAt: string,
  location: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;

  // Datos para la notificación del candidato.
  const { data: app } = await supabase
    .from("applications")
    .select("candidate_id, job:jobs(title, company:companies(trade_name))")
    .eq("id", applicationId)
    .maybeSingle();

  // Reemplaza cualquier entrevista previa (reprogramar / posponer).
  await supabase.from("interviews").delete().eq("application_id", applicationId);
  const { error } = await supabase.from("interviews").insert({
    application_id: applicationId,
    proposed_at: new Date(proposedAt).toISOString(),
    location,
  });
  if (error) return { ok: false, error: "No pudimos proponer la entrevista." };

  // Notificación al candidato (campanita + queda en su historial).
  const a = app as any;
  if (a?.candidate_id) {
    const empresa = a.job?.company?.trade_name ?? "Una empresa";
    await supabase.from("notifications").insert({
      user_id: a.candidate_id,
      icon: "📅",
      title: "Te propusieron una entrevista",
      body: `${empresa} te propuso una entrevista para "${a.job?.title ?? "una vacante"}". Confirmá desde tus postulaciones.`,
      href: "/postulaciones",
    });
  }
  revalidatePath("/postulaciones");
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
  preferences_modality?: string;
  open_to_other_cities?: boolean;
  preferences_industry?: string[];
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
  location_city: string;
  preferences_industry: string[];
  first_job_mode: boolean;
  bio?: string;
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
    // La verificación de la cuenta es por email (confirmación de Supabase);
    // el número de WhatsApp queda como dato de contacto, sin OTP.
    phone_verified: true,
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
  questions: (string | { question: string; knockout: boolean })[];
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  const companyId = await getEffectiveCompanyId(supabase, user.id);
  if (!companyId)
    return { ok: false, error: "Tu cuenta no tiene una empresa asociada." };

  const { questions, expires_at, ...jobFields } = input;
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      ...jobFields,
      company_id: companyId,
      ...(expires_at ? { expires_at } : {}),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No pudimos publicar la vacante." };

  if (questions.length > 0) {
    await supabase.from("job_questions").insert(
      questions.slice(0, 3).map((q, i) => ({
        job_id: job.id,
        question: typeof q === "string" ? q : q.question,
        knockout: typeof q === "string" ? false : q.knockout,
        position: i + 1,
      }))
    );
  }

  // Alertas de empleo: notifica a candidatos con alertas activas cuyo rubro
  // coincide (medida best-effort; no bloquea la publicación si falla).
  try {
    const { data: matches } = await supabase
      .from("candidates")
      .select("id")
      .eq("alerts_enabled", true)
      .contains("preferences_industry", [input.industry])
      .limit(300);
    if (matches && matches.length > 0) {
      await supabase.from("notifications").insert(
        matches.map((c: { id: string }) => ({
          user_id: c.id,
          icon: "✨",
          title: `Nueva vacante de ${input.industry}`,
          body: `${input.title} — coincide con tus rubros de interés.`,
          href: `/empleo/${job.id}`,
        }))
      );
    }
  } catch {
    // silencioso: la publicación ya se hizo
  }

  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

// Novedad de la app: el admin la envía a todos (o a un rol). Aparece en la campanita.
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

// Edición de una vacante existente (RLS: solo la empresa dueña).
export async function updateJob(
  jobId: string,
  input: {
    title?: string;
    description?: string;
    industry?: string;
    modality?: Modality;
    contract_type?: ContractType | null;
    salary_range?: string | null;
    schedule?: string | null;
    address?: string | null;
    nearby_transit?: string | null;
    requirements?: string[];
    benefits?: string[];
    vacancies_count?: number;
    urgent?: boolean;
    requires_experience?: boolean;
  }
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const { error } = await supabase
    .from("jobs")
    .update(input)
    .eq("id", jobId)
    .eq("company_id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar los cambios." };
  revalidatePath("/empresa");
  revalidatePath(`/empleo/${jobId}`);
  revalidatePath("/empleos");
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

// Sube logo o banner de la empresa al bucket público y guarda la URL.
export async function uploadCompanyImage(
  formData: FormData,
  kind: "logo" | "banner"
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0)
    return { ok: false, error: "Elegí una imagen." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "La imagen no puede pesar más de 5 MB." };

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error)
    return {
      ok: false,
      error: "No pudimos subir la imagen. ¿Creaste el bucket 'publico'?",
    };

  // URL pública + timestamp para saltear la caché del navegador
  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  await supabase
    .from("companies")
    .update({ [kind === "logo" ? "logo_url" : "banner_url"]: url })
    .eq("id", user.id);

  revalidatePath("/empresa/perfil");
  revalidatePath(`/empresas/${user.id}`);
  return { ok: true, url };
}

// Sube el logo o favicon del sitio (solo admin) y lo guarda en settings.
export async function uploadSiteLogo(
  formData: FormData,
  kind: "logo" | "favicon" = "logo"
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  // Defensa en profundidad: el chequeo real vive en la política de Storage,
  // pero también lo validamos acá para no depender solo de RLS.
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como admin." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin")
    return { ok: false, error: "Solo el admin puede cambiar el logo del sitio." };

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0)
    return { ok: false, error: "Elegí una imagen." };
  if (file.size > 2 * 1024 * 1024)
    return { ok: false, error: "El logo no puede pesar más de 2 MB." };

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `site/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error)
    return { ok: false, error: `No pudimos subir el ${kind} del sitio.` };

  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  await supabase.from("site_settings").upsert({
    key: kind === "logo" ? "logo_url" : "favicon_url",
    value: url,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, url };
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

// Potenciar empleo: la empresa solicita el destaque, el admin confirma el pago.
export async function requestBoost(
  jobId: string,
  plan: string,
  priceGs: number
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const { error } = await supabase.from("boost_requests").insert({
    job_id: jobId,
    company_id: user.id,
    plan,
    price_gs: priceGs,
  });
  if (error) return { ok: false, error: "No pudimos registrar la solicitud." };
  return { ok: true };
}

export async function resolveBoost(
  boostId: string,
  approve: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { data: boost } = await supabase
    .from("boost_requests")
    .select("job_id, plan")
    .eq("id", boostId)
    .single();
  if (!boost) return { ok: false, error: "Solicitud no encontrada." };

  const { error } = await supabase
    .from("boost_requests")
    .update({ status: approve ? "activo" : "rechazado" })
    .eq("id", boostId);
  if (error) return { ok: false, error: "No pudimos actualizar la solicitud." };

  if (approve) {
    const days = Number(boost.plan.match(/\d+/)?.[0] ?? 7);
    await supabase
      .from("jobs")
      .update({
        featured: true,
        featured_until: new Date(Date.now() + days * 86400000).toISOString(),
      })
      .eq("id", boost.job_id);
  }
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Configuración del sitio (CMS-lite del backoffice)
// Invita a un reclutador al equipo de la empresa (por email).
export async function inviteTeamMember(email: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@"))
    return { ok: false, error: "Escribí un email válido." };

  const { error } = await supabase
    .from("company_members")
    .insert({ company_id: user.id, email: clean });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ese email ya está invitado." };
    return {
      ok: false,
      error: "No pudimos invitar (¿corriste migration-005.sql?).",
    };
  }
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

export async function removeTeamMember(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("id", id)
    .eq("company_id", user.id);
  if (error) return { ok: false, error: "No pudimos quitar al miembro." };
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

// Descarta una denuncia (bandeja del admin).
export async function dismissReport(reportId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("reports").delete().eq("id", reportId);
  if (error)
    return {
      ok: false,
      error: "No pudimos descartar (¿corriste migration-004.sql?).",
    };
  revalidatePath("/admin");
  return { ok: true };
}

// Oculta una vacante denunciada (pasa a Moderación, fuera del feed).
export async function hideJobForReview(jobId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase
    .from("jobs")
    .update({ status: "Moderacion" })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos ocultar la vacante." };
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Advierte a la empresa por una vacante denunciada (campanita).
export async function warnCompany(
  companyId: string,
  jobTitle: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("notifications").insert({
    user_id: companyId,
    icon: "⚠️",
    title: "Advertencia del equipo de Worka",
    body: `Tu vacante "${jobTitle}" recibió denuncias de la comunidad. Revisala: si incumple las reglas (pedir dinero, datos falsos), será eliminada.`,
    href: "/empresa",
  });
  if (error) return { ok: false, error: "No pudimos enviar la advertencia." };
  return { ok: true };
}

// Verifica que quien llama sea admin (para las acciones del backoffice).
async function assertAdmin(): Promise<boolean> {
  const supabase = await getServerClient();
  if (!supabase) return true; // demo
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "admin";
}

// Envía el correo de recuperación de contraseña a cualquier usuario (admin).
export async function adminSendRecovery(email: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { SITE_URL } = await import("@/lib/supabase/config");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/restablecer`,
  });
  if (error) return { ok: false, error: friendlyAuthError(error) };
  return { ok: true };
}

// Elimina una cuenta (usuario o empresa) desde el backoffice.
// Con Service Role Key borra también la cuenta de auth; sin ella, borra el
// perfil y todos los datos de la app (cascada).
export async function adminDeleteUser(userId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };

  const { getAdminClient } = await import("@/lib/supabase/admin");
  const admin = getAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error)
      return { ok: false, error: "No pudimos eliminar la cuenta de auth." };
  }
  // Borra el perfil de la app (si auth ya cascadeó, no pasa nada).
  await supabase.from("profiles").delete().eq("id", userId);
  revalidatePath("/admin");
  return { ok: true };
}

// Notificación masiva desde el admin: cae en la campanita de la audiencia.
export async function broadcastNotification(input: {
  audience: "candidates" | "companies" | "all";
  title: string;
  body: string;
  href?: string;
  icon?: string;
}): Promise<ActionResult & { sent?: number }> {
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, sent: 0 };
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };

  let q = supabase.from("profiles").select("id");
  if (input.audience !== "all") {
    q = q.eq("role", input.audience === "candidates" ? "candidate" : "company");
  }
  const { data: profiles, error: qErr } = await q;
  if (qErr) return { ok: false, error: "No pudimos obtener los destinatarios." };

  const rows = (profiles ?? []).map((p: { id: string }) => ({
    user_id: p.id,
    icon: input.icon || "📢",
    title: input.title,
    body: input.body,
    href: input.href || null,
  }));
  if (rows.length === 0) return { ok: true, sent: 0 };

  // Inserción en lotes por si hay muchos usuarios.
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from("notifications")
      .insert(rows.slice(i, i + 500));
    if (error) return { ok: false, error: "No pudimos enviar la notificación." };
  }
  return { ok: true, sent: rows.length };
}

// Aprueba un rubro propuesto por una empresa: pasa a la lista oficial
// (site_settings.custom_industries, separados por coma).
export async function approveIndustryTag(tag: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "custom_industries")
    .maybeSingle();
  const current = (data?.value ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (!current.includes(tag)) current.push(tag);
  const { error } = await supabase.from("site_settings").upsert({
    key: "custom_industries",
    value: current.join(","),
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "No pudimos aprobar el rubro." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveSiteSettings(
  settings: Record<string, string>
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("site_settings").upsert(rows);
  if (error) return { ok: false, error: "No pudimos guardar la configuración." };
  revalidatePath("/");
  revalidatePath("/admin");
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

// Eleva a admin a los emails listados en la env var ADMIN_EMAILS
// (separados por coma). Así el backoffice se habilita sin tocar SQL.
async function maybeElevateAdmin(
  supabase: NonNullable<Awaited<ReturnType<typeof getServerClient>>>,
  userId: string,
  email: string | undefined
) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (email && admins.includes(email.toLowerCase())) {
    await supabase
      .from("profiles")
      .upsert({ id: userId, role: "admin" });
  }
}

// A cada rol, su casa: empresa → panel, admin → backoffice, candidato → feed.
export async function getRoleHome(): Promise<string> {
  const supabase = await getServerClient();
  if (!supabase) return "/empleos";
  const user = await getCurrentUser();
  if (!user) return "/empleos";
  await maybeElevateAdmin(supabase, user.id, user.email);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "admin") return "/admin";
  if (profile?.role === "company") return "/empresa";
  // Candidato sin perfil todavía → onboarding
  const { data: candidate } = await supabase
    .from("candidates")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return candidate ? "/empleos" : "/onboarding";
}

export async function signInWithEmail(
  email: string,
  password: string,
  next: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Email o contraseña incorrectos." };
  const home = await getRoleHome();
  // Si pidieron una página específica se respeta; si no, según el rol.
  redirect(next && next !== "/empleos" ? next : home);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, string>
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { SITE_URL } = await import("@/lib/supabase/config");
  let error;
  try {
    ({ error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
        data: metadata ?? {},
      },
    }));
  } catch (e) {
    // Falla de red / configuración: queda en los logs de Vercel.
    console.error("signUp threw:", e);
    return { ok: false, error: friendlyAuthError(e) };
  }
  if (error) {
    console.error("signUp error:", error);
    return { ok: false, error: friendlyAuthError(error) };
  }
  return { ok: true };
}

// Recuperación de contraseña: envía el link (sirve para personas y empresas).
export async function requestPasswordReset(
  email: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { SITE_URL } = await import("@/lib/supabase/config");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/restablecer`,
  });
  if (error) return { ok: false, error: friendlyAuthError(error) };
  return { ok: true };
}

// Define la nueva contraseña (tras entrar por el link de recuperación).
export async function updatePassword(
  password: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: friendlyAuthError(error) };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
