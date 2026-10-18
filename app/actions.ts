"use server";

import { revalidatePath } from "next/cache";
import { notify, notifyMany } from "@/lib/notify";
import { redirect } from "next/navigation";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { slugify as toSlug } from "@/lib/slug";
import { WHATS_NEW_SETTING, sanitizeWhatsNew, type WhatsNewConfig } from "@/lib/whats-new";
import { BOOST_PLANS, COMPANY_ROLES } from "@/lib/types";
import { isJobListed } from "@/lib/job-visibility";
import { getEffectiveCompanyId } from "@/lib/company-context";
import { getEnterpriseLimits, listingLimitError, planErrorMessage } from "@/lib/subscriptions";
import {
  normalizeSkills,
  validateEducation,
  validateExperience,
  type EducationInput,
  type ExperienceInput,
} from "@/lib/career";
import type {
  ApplicationStatus,
  BadgeId,
  CompanyRole,
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
  id?: string;
  // Alta de empresa: se canjeó el código de la promoción de lanzamiento.
  promo?: boolean;
};

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

  // Medida anti-spam liviana: exigimos perfil con datos básicos. La cuenta
  // ya viene verificada por email (Supabase Auth).
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

  // Solo vacantes publicadas: activas y sin vencer. Una vencida sigue
  // "Activo" en la base, pero la empresa ya no la espera.
  const { data: target } = await supabase
    .from("jobs")
    .select("status, expires_at")
    .eq("id", jobId)
    .maybeSingle();
  if (!target || !isJobListed(target))
    return { ok: false, error: "Esta vacante ya no recibe postulaciones." };

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

  // Datos de la vacante para los avisos: quién publica y cómo se llama.
  const { data: jobRow } = await supabase
    .from("jobs")
    .select("title, company_id, company:companies(trade_name)")
    .eq("id", jobId)
    .maybeSingle();
  const j = jobRow as unknown as {
    title?: string;
    company_id?: string;
    company?: { trade_name?: string } | null;
  } | null;
  const jobTitle = j?.title ?? "una vacante";
  const companyId = j?.company_id ?? null;
  const empresaNombre = j?.company?.trade_name ?? "la empresa";

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

      // Un descarte automático se avisa igual, y en el momento: enterarse hoy
      // duele menos que esperar tres semanas una respuesta que no va a llegar.
      await notify({
        userId: user.id,
        icon: "📋",
        title: "Tu postulación no siguió esta vez",
        body: `Para "${jobTitle}" buscaban un perfil distinto. Seguí postulándote: hay más vacantes de tu rubro.`,
        href: "/postulaciones",
        cta: "Ver más vacantes",
        template: {
          key: "postulacion_descartada",
          vars: { nombre: candidate.full_name, puesto: jobTitle },
        },
      });
      revalidatePath("/postulaciones");
      return { ok: true };
    }
  }

  // Confirmación al candidato: sin esto queda sin saber si su postulación
  // llegó, que es la primera pregunta que se hace cualquiera.
  await notify({
    userId: user.id,
    icon: "✅",
    title: "Postulación enviada",
    body: `Tu perfil llegó a ${empresaNombre} por "${jobTitle}".`,
    emailBody: `Tu perfil llegó a <strong>${empresaNombre}</strong> por la vacante de <strong>${jobTitle}</strong>. Te vamos a avisar por acá cada vez que tu postulación avance.`,
    href: "/postulaciones",
    cta: "Ver mis postulaciones",
    template: {
      key: "postulacion_enviada",
      vars: {
        nombre: candidate.full_name,
        empresa: empresaNombre,
        puesto: jobTitle,
      },
    },
  });

  // Aviso a la empresa. Era el hueco más grande: nadie le decía que alguien
  // se había postulado, así que los candidatos esperaban días a que a alguien
  // se le ocurriera entrar al panel.
  if (companyId) {
    await notify({
      userId: companyId,
      icon: "🎯",
      title: `Nueva postulación para ${jobTitle}`,
      body: `${candidate.full_name} se postuló. Revisá su perfil y su CV.`,
      href: `/empresa/vacantes/${jobId}`,
      cta: "Ver la postulación",
      template: {
        key: "postulacion_nueva",
        vars: { nombre: candidate.full_name, puesto: jobTitle },
      },
    });
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

// ── Vacantes de otros portales (migración 043) ──

const EXTERNAL_STATUSES = ["enviada", "me_contactaron", "entrevista", "descartada"] as const;

// "Ya me postulé": deja la postulación externa en Mis postulaciones. Los
// datos del aviso se copian del registro en la base, no de lo que mande el
// navegador.
export async function recordExternalApplication(
  externalJobId: string,
  method: "email" | "enlace"
): Promise<ActionResult> {
  if (method !== "email" && method !== "enlace") return { ok: false, error: "Método inválido." };
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, id: `demo-xapp-${Date.now()}` };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { data: job } = await supabase
    .from("external_jobs")
    .select("id,title,company_name,source_name")
    .eq("id", externalJobId)
    .maybeSingle();
  if (!job) return { ok: false, error: "Este aviso ya no está disponible." };
  const { data, error } = await supabase
    .from("external_applications")
    .upsert(
      {
        candidate_id: user.id,
        external_job_id: job.id,
        job_title: job.title,
        company_name: job.company_name,
        source_name: job.source_name,
        method,
      },
      { onConflict: "candidate_id,external_job_id" }
    )
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "No pudimos guardar tu postulación." };
  revalidatePath("/postulaciones");
  return { ok: true, id: data.id as string };
}

export async function updateExternalApplicationStatus(
  id: string,
  status: (typeof EXTERNAL_STATUSES)[number]
): Promise<ActionResult> {
  if (!EXTERNAL_STATUSES.includes(status)) return { ok: false, error: "Estado inválido." };
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("external_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("candidate_id", user.id);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };
  revalidatePath("/postulaciones");
  return { ok: true };
}

export async function deleteExternalApplication(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("external_applications")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);
  if (error) return { ok: false, error: "No pudimos quitar la postulación." };
  revalidatePath("/postulaciones");
  return { ok: true };
}

export async function reportExternalJob(
  externalJobId: string,
  reason: string
): Promise<ActionResult> {
  const clean = reason.trim().slice(0, 200);
  if (clean.length < 3) return { ok: false, error: "Elegí un motivo." };
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para denunciar." };
  const { error } = await supabase
    .from("external_job_reports")
    .insert({ external_job_id: externalJobId, reporter_id: user.id, reason: clean });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya denunciaste este aviso." };
    return { ok: false, error: "No pudimos registrar la denuncia." };
  }
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
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("candidate_id", user.id)
      .eq("job_id", jobId);
    if (error) return { ok: false, error: "No pudimos quitar la vacante de guardados." };
  }
  revalidatePath("/guardados");
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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
    .select("id,token")
    .single();
  if (error) return { ok: false, error: "No pudimos agregar la referencia." };
  revalidatePath("/perfil");
  return { ok: true, token: data.token as string, id: data.id as string };
}

// ── Trayectoria: experiencia, estudios y habilidades (migración 042) ──

// Crea o actualiza una experiencia. Con id edita; sin id agrega.
export async function saveExperience(
  input: ExperienceInput & { id?: string }
): Promise<ActionResult> {
  const problem = validateExperience(input);
  if (problem) return { ok: false, error: problem };
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, id: input.id ?? `demo-exp-${Date.now()}` };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const row = {
    candidate_id: user.id,
    role: input.role.trim(),
    company: input.company.trim(),
    start_date: `${input.start_month}-01`,
    end_date: input.end_month ? `${input.end_month}-01` : null,
    description: input.description.trim(),
  };
  const query = input.id
    ? supabase.from("candidate_experience").update(row).eq("id", input.id).eq("candidate_id", user.id)
    : supabase.from("candidate_experience").insert(row);
  const { data, error } = await query.select("id").single();
  if (error || !data) return { ok: false, error: "No pudimos guardar la experiencia." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true, id: data.id as string };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("candidate_experience")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);
  if (error) return { ok: false, error: "No pudimos eliminar la experiencia." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true };
}

export async function saveEducation(
  input: EducationInput & { id?: string }
): Promise<ActionResult> {
  const problem = validateEducation(input);
  if (problem) return { ok: false, error: problem };
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, id: input.id ?? `demo-edu-${Date.now()}` };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const row = {
    candidate_id: user.id,
    institution: input.institution.trim(),
    title: input.title.trim(),
    level: input.level,
    end_year: input.end_year,
  };
  const query = input.id
    ? supabase.from("candidate_education").update(row).eq("id", input.id).eq("candidate_id", user.id)
    : supabase.from("candidate_education").insert(row);
  const { data, error } = await query.select("id").single();
  if (error || !data) return { ok: false, error: "No pudimos guardar los estudios." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true, id: data.id as string };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("candidate_education")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);
  if (error) return { ok: false, error: "No pudimos eliminar los estudios." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true };
}

export async function updateSkills(skills: string[]): Promise<ActionResult & { skills?: string[] }> {
  const clean = normalizeSkills(skills);
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, skills: clean };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const { error } = await supabase
    .from("candidates")
    .update({ skills: clean })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar tus habilidades." };
  revalidatePath("/perfil");
  revalidatePath(`/p/${user.id}`);
  return { ok: true, skills: clean };
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

// Supabase tipa los joins anidados de forma ambigua (objeto o array según cómo
// infiera la relación), así que describimos la forma que estas consultas
// realmente devuelven en vez de apagar el chequeo con `any`.
type ApplicantNotifyRow = {
  candidate_id: string | null;
  reviewed_at?: string | null;
  job?: {
    title?: string | null;
    company?: { trade_name?: string | null } | null;
  } | null;
};

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

  const a = app as unknown as ApplicantNotifyRow | null;

  const { error } = await supabase
    .from("applications")
    .update({
      status: "Contactado",
      ...(a?.reviewed_at ? {} : { reviewed_at: new Date().toISOString() }),
    })
    .eq("id", applicationId);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };

  if (a?.candidate_id) {
    const empresa = a.job?.company?.trade_name ?? "Una empresa";
    await notify({
      userId: a.candidate_id,
      icon: "💬",
      title: `${empresa} te contactó`,
      body: `Te escribieron por WhatsApp por "${a.job?.title ?? "una vacante"}". ¡Revisá tu teléfono!`,
      href: "/postulaciones",
      cta: "Ver mi postulación",
      template: {
        key: "empresa_contacto",
        vars: {
          nombre: "",
          empresa,
          puesto: a.job?.title ?? "una vacante",
        },
      },
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
  // "Quién vio tu CV" (Worka Pro). La función ignora a quien no es empresa.
  await supabase.rpc("fn_record_profile_view", { p_candidate: candidateId, p_source: "cv", p_job: null });
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
  const a = app as unknown as ApplicantNotifyRow | null;
  if (a?.candidate_id) {
    const empresa = a.job?.company?.trade_name ?? "Una empresa";
    await notify({
      userId: a.candidate_id,
      icon: "📅",
      title: "Te propusieron una entrevista",
      body: `${empresa} te propuso una entrevista para "${a.job?.title ?? "una vacante"}". Confirmá desde tus postulaciones.`,
      href: "/postulaciones",
      cta: "Confirmar la entrevista",
      template: {
        key: "entrevista_propuesta",
        vars: {
          nombre: "",
          empresa,
          puesto: a.job?.title ?? "una vacante",
        },
      },
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
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  if (error) return { ok: false, error: "No pudimos marcar las notificaciones como leídas." };
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

  // Aviso a la otra parte. Un chat sin aviso es un chat que nadie lee: el
  // mensaje quedaba esperando a que la persona entrara por casualidad.
  const { data: app } = await supabase
    .from("applications")
    .select("candidate_id, job:jobs(title, company_id, company:companies(trade_name))")
    .eq("id", applicationId)
    .maybeSingle();

  const a = app as unknown as {
    candidate_id: string;
    job?: {
      title?: string;
      company_id?: string;
      company?: { trade_name?: string } | null;
    } | null;
  } | null;

  if (a?.job) {
    const puesto = a.job.title ?? "una vacante";
    if (sender === "company" && a.candidate_id) {
      await notify({
        userId: a.candidate_id,
        icon: "✉️",
        title: `${a.job.company?.trade_name ?? "Una empresa"} te escribió`,
        body: `Tenés un mensaje nuevo por "${puesto}".`,
        href: "/mensajes",
        cta: "Leer el mensaje",
        template: {
          key: "mensaje_nuevo",
          vars: { nombre: "", empresa: a.job.company?.trade_name ?? "", puesto },
        },
      });
    } else if (sender === "candidate" && a.job.company_id) {
      await notify({
        userId: a.job.company_id,
        icon: "✉️",
        title: `Mensaje nuevo por ${puesto}`,
        body: "Un candidato te escribió desde el chat de la postulación.",
        href: "/empresa/mensajes",
        cta: "Leer el mensaje",
        template: {
          key: "mensaje_nuevo",
          vars: { nombre: "", empresa: "", puesto },
        },
      });
    }
  }

  return { ok: true };
}

export async function updateCandidatePrefs(prefs: {
  first_job_mode?: boolean;
  alerts_enabled?: boolean;
  email_notifications?: boolean;
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
  country?: string;
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
    country: input.country ?? "py",
    // La cuenta se verifica por email (confirmación de Supabase Auth, ver
    // migración 046). El WhatsApp queda solo como dato de contacto.
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
  city: string;
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

  // Plan Gratis: hasta 3 publicadas a la vez (la base lo vuelve a frenar).
  const limitError = await listingLimitError(companyId);
  if (limitError) return { ok: false, error: limitError };
  // Vigencia del plan: 30 días gratis, 60 con Worka Enterprise Pro.
  const { jobValidityDays } = await getEnterpriseLimits(companyId);
  const maxExpiry = Date.now() + jobValidityDays * 86400000;

  const { questions, expires_at, ...jobFields } = input;
  // Obligatorios (el formulario ya los pide; acá se vuelve a cortar).
  if (!input.title.trim()) return { ok: false, error: "El título del puesto es obligatorio." };
  if (!input.industry.trim()) return { ok: false, error: "Elegí el rubro." };
  if (!input.description.trim()) return { ok: false, error: "La descripción del puesto es obligatoria." };
  if (input.modality === "Presencial" && !input.nearby_transit?.trim())
    return { ok: false, error: "Para vacantes presenciales indicá las líneas de colectivo cercanas." };
  const city = (input.city ?? "").trim().slice(0, 80);
  if (!city) return { ok: false, error: "Elegí la ciudad donde es el puesto." };
  const requested = expires_at ? Date.parse(expires_at) : NaN;
  const expiry = Number.isFinite(requested) ? Math.min(requested, maxExpiry) : maxExpiry;
  const row = { ...jobFields, city, company_id: companyId, expires_at: new Date(expiry).toISOString() };
  let { data: job, error } = await supabase.from("jobs").insert(row).select("id").single();
  // Sin la migración 050 no existe jobs.city: se publica igual para no
  // frenar a nadie, pero queda en el log porque la ciudad se pierde.
  if (error && /city/i.test(error.message)) {
    console.error("[worka:jobs] falta la migración 050 (jobs.city):", error.message);
    const { city: _omit, ...withoutCity } = row;
    void _omit;
    ({ data: job, error } = await supabase.from("jobs").insert(withoutCity).select("id").single());
  }
  if (error || !job)
    return { ok: false, error: planErrorMessage(error?.message) ?? "No pudimos publicar la vacante." };

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
      // Solo campanita, sin `cta`: el correo de vacantes nuevas lo manda el
      // cron diario de alertas, agrupado. Mandar uno por cada publicación
      // sería varios correos al día a la misma persona.
      await notifyMany(
        matches.map((c: { id: string }) => c.id),
        (userId) => ({
          userId,
          icon: "✨",
          title: `Nueva vacante de ${input.industry}`,
          body: `${input.title} — coincide con tus rubros de interés.`,
          href: `/empleo/${job.id}`,
        })
      );
    }
  } catch {
    // silencioso: la publicación ya se hizo
  }

  // Avisa a Bing/Yandex (IndexNow) que hay una URL nueva para indexar ya.
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(job.id));

  revalidatePath("/empresa");
  revalidatePath("/empleos");
  // Worka Pro: alertas al instante (no frena la publicación si falla).
  const { notifyInstantAlerts } = await import("@/lib/instant-alerts");
  await notifyInstantAlerts(job.id);
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
    city?: string;
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
  if (input.city !== undefined) {
    input.city = input.city.trim().slice(0, 80);
    if (!input.city) return { ok: false, error: "Elegí la ciudad donde es el puesto." };
  }
  if (input.title !== undefined && !input.title.trim()) return { ok: false, error: "El título es obligatorio." };
  if (input.description !== undefined && !input.description.trim()) return { ok: false, error: "La descripción es obligatoria." };
  const { error } = await supabase
    .from("jobs")
    .update(input)
    .eq("id", jobId)
    .eq("company_id", user.id);
  if (error) {
    if (/city/i.test(error.message)) console.error("[worka:jobs] falta la migración 050 (jobs.city):", error.message);
    return { ok: false, error: "No pudimos guardar los cambios." };
  }

  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));

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
  if (status === "Activo") {
    const { data: job } = await supabase.from("jobs").select("company_id").eq("id", jobId).maybeSingle();
    const limitError = job ? await listingLimitError(job.company_id, jobId) : null;
    if (limitError) return { ok: false, error: limitError };
  }
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);
  if (error)
    return { ok: false, error: planErrorMessage(error.message) ?? (error.message.includes("revisión") ? "La vacante está en revisión por Worka." : "No pudimos cambiar el estado.") };

  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));

  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function deleteJob(jobId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos eliminar la vacante." };

  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));

  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function updateJobExpiry(
  jobId: string,
  expiresAt: string
): Promise<ActionResult & { expires_at?: string; note?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { data: job } = await supabase.from("jobs").select("company_id, status, expires_at").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, error: "No encontramos la vacante." };
  const { jobValidityDays } = await getEnterpriseLimits(job.company_id);
  const maxExpiry = Date.now() + jobValidityDays * 86400000;
  const requested = Date.parse(expiresAt);
  if (!Number.isFinite(requested)) return { ok: false, error: "Elegí una fecha válida." };
  // Renovar una vencida la vuelve a publicar: cuenta para el límite del plan.
  if (job.status === "Activo" && Date.parse(job.expires_at) <= Date.now() && requested > Date.now()) {
    const limitError = await listingLimitError(job.company_id, jobId);
    if (limitError) return { ok: false, error: limitError };
  }
  const clamped = Math.min(requested, maxExpiry);
  const { error } = await supabase
    .from("jobs")
    .update({ expires_at: new Date(clamped).toISOString() })
    .eq("id", jobId);
  if (error)
    return { ok: false, error: planErrorMessage(error.message) ?? "No pudimos actualizar la vigencia." };
  revalidatePath("/empresa");
  revalidatePath("/empleos");
  return {
    ok: true,
    expires_at: new Date(clamped).toISOString(),
    ...(clamped < requested ? { note: `Tu plan permite publicar hasta ${jobValidityDays} días seguidos.` } : {}),
  };
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
  kind: "logo" | "favicon" | "hero" = "logo"
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
    return { ok: false, error: "Solo el admin puede cambiar las imágenes del sitio." };

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0)
    return { ok: false, error: "Elegí una imagen." };
  // La imagen del hero es grande (foto de portada); el logo debe ser liviano.
  const maxMb = kind === "hero" ? 5 : 2;
  if (file.size > maxMb * 1024 * 1024)
    return {
      ok: false,
      error: `La imagen no puede pesar más de ${maxMb} MB.`,
    };

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `site/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error)
    return { ok: false, error: `No pudimos subir el ${kind} del sitio.` };

  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  const settingKey =
    kind === "logo"
      ? "logo_url"
      : kind === "favicon"
        ? "favicon_url"
        : "hero_image_url";
  await supabase.from("site_settings").upsert({
    key: settingKey,
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
  country?: string;
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
    .upsert({ id: user.id, ...input, country: input.country ?? "py" });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ese RUC ya está registrado en Worka." };
    return { ok: false, error: "No pudimos registrar la empresa." };
  }
  // Alta con sesión inmediata (confirmación de email apagada): la promoción
  // de lanzamiento se canjea ya, sin esperar al callback.
  const { redeemSignupPromo } = await import("@/lib/promo-server");
  const promo = await redeemSignupPromo(user);
  return { ok: true, promo: promo.redeemed };
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
  // El plan y el precio salen de la lista oficial, no de lo que mande el
  // navegador: antes una llamada armada a mano podía pedir 30 días por Gs. 1.
  void priceGs;
  const option = BOOST_PLANS.find((p) => p.plan === plan);
  if (!option) return { ok: false, error: "Elegí uno de los planes disponibles." };
  const companyId = await getEffectiveCompanyId(supabase, user.id);
  if (!companyId) return { ok: false, error: "Tu cuenta no tiene una empresa asociada." };
  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!job) return { ok: false, error: "Esa vacante no es de tu empresa." };
  const { error } = await supabase.from("boost_requests").insert({
    job_id: jobId,
    company_id: companyId,
    plan: option.plan,
    price_gs: option.price_gs,
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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
  if (approve) {
    // Recibo digital del destaque (requiere la migración 048).
    const { issueBoostReceipt } = await import("@/lib/receipts-server");
    await issueBoostReceipt(boostId);
  }
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Configuración del sitio (CMS-lite del backoffice)
// Invita a alguien al equipo de la empresa (por email y con un rol).
//
// El id de la empresa sale de getEffectiveCompanyId y no de user.id: un
// administrador invitado también puede sumar gente, y su user.id no es el de
// la empresa. Quién puede hacerlo de verdad lo decide RLS (migración 039);
// esto solo evita apuntar a la empresa equivocada.
export async function inviteTeamMember(
  email: string,
  role: CompanyRole = "reclutador"
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const companyId = await getEffectiveCompanyId(supabase, user.id);
  if (!companyId) return { ok: false, error: "No encontramos tu empresa." };
  if (!(await getEnterpriseLimits(companyId)).team)
    return { ok: false, error: "El equipo de selección con varios usuarios es del plan Empresa de Worka Enterprise Pro." };
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@"))
    return { ok: false, error: "Escribí un email válido." };
  if (!COMPANY_ROLES.some((r) => r.id === role))
    return { ok: false, error: "Ese rol no existe." };

  const { error } = await supabase
    .from("company_members")
    .insert({ company_id: companyId, email: clean, role });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ese email ya está invitado." };
    if (error.code === "42703")
      return {
        ok: false,
        error: "Falta correr migration-039.sql en Supabase.",
      };
    return {
      ok: false,
      error: "No pudimos invitar (¿corriste migration-005.sql?).",
    };
  }
  revalidatePath("/empresa/equipo");
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

export async function setTeamMemberRole(
  id: string,
  role: CompanyRole
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (!COMPANY_ROLES.some((r) => r.id === role))
    return { ok: false, error: "Ese rol no existe." };
  const companyId = await getEffectiveCompanyId(supabase, user.id);
  if (!companyId) return { ok: false, error: "No encontramos tu empresa." };

  // Sin .select() no hay forma de distinguir "no tenía permiso" de "salió
  // bien": RLS deja pasar el UPDATE y afecta cero filas, sin error.
  const { data, error } = await supabase
    .from("company_members")
    .update({ role })
    .eq("id", id)
    .eq("company_id", companyId)
    .select("id");
  if (error) return { ok: false, error: "No pudimos cambiar el rol." };
  if (!data || data.length === 0)
    return { ok: false, error: "No tenés permiso para cambiar ese rol." };
  revalidatePath("/empresa/equipo");
  return { ok: true };
}

export async function removeTeamMember(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const companyId = await getEffectiveCompanyId(supabase, user.id);
  if (!companyId) return { ok: false, error: "No encontramos tu empresa." };
  const { data, error } = await supabase
    .from("company_members")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId)
    .select("id");
  if (error) return { ok: false, error: "No pudimos quitar al miembro." };
  if (!data || data.length === 0)
    return { ok: false, error: "No tenés permiso para quitar a esa persona." };
  revalidatePath("/empresa/equipo");
  revalidatePath("/empresa/perfil");
  return { ok: true };
}

// Envía a IndexNow (Bing/Yandex) todas las URLs públicas ya existentes:
// vacantes activas + páginas de empresas verificadas + home. Se usa una sola
// vez para que el catálogo entero se indexe rápido en lugar de esperar a que
// cada vacante se re-publique.
export async function indexNowSubmitAll(): Promise<ActionResult & { sent?: number }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };

  const { pingIndexNow } = await import("@/lib/indexnow");
  const { SITE_URL } = await import("@/lib/supabase/config");
  const base = SITE_URL.replace(/\/$/, "");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("status", "Activo");
  const { data: companies } = await supabase
    .from("companies")
    .select("id")
    .eq("is_verified", true);

  const urls = [
    base,
    `${base}/empleos`,
    ...(jobs ?? []).map((j: { id: string }) => `${base}/empleo/${j.id}`),
    ...(companies ?? []).map((c: { id: string }) => `${base}/empresas/${c.id}`),
  ];

  // La API acepta hasta 10.000 URLs por request; nuestro catálogo entra de sobra.
  await pingIndexNow(urls);
  return { ok: true, sent: urls.length };
}

// --- Gestión de vacantes desde el admin ---

export async function adminSetJobFeatured(
  jobId: string,
  featured: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase
    .from("jobs")
    .update({
      featured,
      featured_until: featured
        ? new Date(Date.now() + 30 * 86400000).toISOString()
        : null,
    })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos actualizar la vacante." };
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function adminSetJobStatus(
  jobId: string,
  status: JobStatus
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos cambiar el estado." };
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Extiende la vigencia de vacantes activas (desde hoy). Una vacante vencida
// sigue "Activo" pero no aparece en /empleos; esto la vuelve a publicar.
export async function adminRenewJobs(
  jobIds: string[],
  days = 30
): Promise<ActionResult & { renewed?: number }> {
  const supabase = await getServerClient();
  if (!supabase) return { ...DEMO, renewed: jobIds.length };
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const ids = [...new Set(jobIds)].slice(0, 500);
  if (ids.length === 0) return { ok: true, renewed: 0 };
  const span = Math.min(Math.max(Math.round(days), 1), 90);
  const { data, error } = await supabase
    .from("jobs")
    .update({ expires_at: new Date(Date.now() + span * 86400000).toISOString() })
    .in("id", ids)
    .eq("status", "Activo")
    .select("id");
  if (error) return { ok: false, error: "No pudimos renovar las vacantes." };
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  if (data?.length) pingIndexNow(data.map((row) => jobUrl(row.id)));
  revalidatePath("/admin");
  revalidatePath("/empleos");
  revalidatePath("/");
  return { ok: true, renewed: data?.length ?? 0 };
}

export async function adminDeleteJob(jobId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos eliminar la vacante." };
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Descarta una denuncia (bandeja del admin).
export async function dismissReport(reportId: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  // .select() devuelve las filas borradas: si es 0, la RLS bloqueó el borrado
  // (falta la política reports_admin_delete → correr migration-004/007).
  const { data, error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .select("id");
  if (error || !data || data.length === 0)
    return {
      ok: false,
      error:
        "No pudimos descartar la denuncia. Corré supabase/migration-007.sql en Supabase.",
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
  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
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
  await notify({
    userId: companyId,
    icon: "⚠️",
    title: "Advertencia del equipo de Worka",
    body: `Tu vacante "${jobTitle}" recibió denuncias de la comunidad. Revisala: si incumple las reglas (pedir dinero, datos falsos), será eliminada.`,
    href: "/empresa",
    cta: "Revisar mi vacante",
  });
  return { ok: true };
}

// Verifica que quien llama sea admin (para las acciones del backoffice).
// Mensaje de error legible a partir del error de Supabase.
function dbError(error: { code?: string; message?: string }): string {
  if (error.code === "23505") return "Ya existe un registro con ese dato único.";
  return `No pudimos guardar: ${error.message ?? "error"} (¿corriste la migración?)`;
}

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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase
    .from("jobs")
    .update({ status: decision === "aprobar" ? "Activo" : "Cerrado" })
    .eq("id", jobId);
  if (error) return { ok: false, error: "No pudimos resolver la moderación." };

  // Resolver la moderación limpia las denuncias de ese empleo: si no, la
  // bandeja las sigue mostrando ("vuelven") y con una denuncia más el empleo
  // se re-modera automáticamente.
  await supabase.from("reports").delete().eq("job_id", jobId);

  const { pingIndexNow, jobUrl } = await import("@/lib/indexnow");
  pingIndexNow(jobUrl(jobId));
  revalidatePath("/admin");
  revalidatePath("/empleos");
  return { ok: true };
}

// Fija el país activo del visitante (cookie). Lo usan el selector de país
// y las landings, para que el registro y la home se adapten a ese país.
export async function setCountry(code: string): Promise<ActionResult> {
  const { setActiveCountryCookie } = await import("@/lib/country-context");
  await setActiveCountryCookie(code);
  return { ok: true };
}

// ── Vacantes externas (solo admin) ──

export async function saveJobSource(input: {
  id?: string;
  name: string;
  kind: "auto" | "feed" | "html" | "serpapi" | "jooble";
  url: string;
  country?: string;
  enabled: boolean;
  expire_days?: number;
  max_age_hours?: number;
  sel_item?: string;
  sel_title?: string;
  sel_company?: string;
  sel_city?: string;
  sel_link?: string;
  sel_description?: string;
  default_city?: string;
  default_industry?: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.name.trim())
    return { ok: false, error: "Poné un nombre." };
  // Jooble admite búsqueda vacía (todo Paraguay); el resto necesita url/búsqueda.
  if (input.kind !== "jooble" && !input.url.trim())
    return { ok: false, error: "Poné una URL o una búsqueda." };
  // En serpapi y jooble, `url` es el texto de búsqueda, no una URL real.
  if (input.kind !== "serpapi" && input.kind !== "jooble") {
    try {
      new URL(input.url);
    } catch {
      return { ok: false, error: "Esa URL no es válida." };
    }
  }

  const row = {
    name: input.name.trim(),
    kind: input.kind,
    url: input.url.trim(),
    country: input.country ?? "py",
    enabled: input.enabled,
    expire_days: input.expire_days ?? 30,
    max_age_hours: input.max_age_hours ?? 24,
    sel_item: input.sel_item?.trim() || null,
    sel_title: input.sel_title?.trim() || null,
    sel_company: input.sel_company?.trim() || null,
    sel_city: input.sel_city?.trim() || null,
    sel_link: input.sel_link?.trim() || null,
    sel_description: input.sel_description?.trim() || null,
    default_city: input.default_city?.trim() || null,
    default_industry: input.default_industry?.trim() || null,
  };

  const { error } = input.id
    ? await supabase.from("job_sources").update(row).eq("id", input.id)
    : await supabase.from("job_sources").insert(row);
  if (error)
    return {
      ok: false,
      error: "No pudimos guardar (¿corriste migration-010.sql?).",
    };
  revalidatePath("/admin/externas");
  return { ok: true };
}

export async function deleteJobSource(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("job_sources").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar la fuente." };
  revalidatePath("/admin/externas");
  return { ok: true };
}

// Trae las vacantes de una fuente y las guarda. Reimportar no duplica:
// el índice (source_id, external_key) hace que se actualicen.
export async function runImport(
  sourceId: string
): Promise<ActionResult & { count?: number; method?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };

  const { data: source } = await supabase
    .from("job_sources")
    .select("*")
    .eq("id", sourceId)
    .maybeSingle();
  if (!source) return { ok: false, error: "No encontramos esa fuente." };

  const { fetchSource } = await import("@/lib/external/importer");
  let parsed: Awaited<ReturnType<typeof fetchSource>>;
  try {
    parsed = await fetchSource(source as import("@/lib/types").JobSource);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    await supabase
      .from("job_sources")
      .update({
        last_run_at: new Date().toISOString(),
        last_result: `Error: ${message}`,
        last_count: 0,
      })
      .eq("id", sourceId);
    revalidatePath("/admin/externas");
    return { ok: false, error: message };
  }

  if (parsed.jobs.length === 0) {
    await supabase
      .from("job_sources")
      .update({
        last_run_at: new Date().toISOString(),
        last_result: "No se encontraron avisos (revisá la URL o los selectores).",
        last_method: parsed.method,
        last_count: 0,
      })
      .eq("id", sourceId);
    revalidatePath("/admin/externas");
    return { ok: false, error: "No se encontró ningún aviso en esa fuente." };
  }

  // Los avisos importados caducan solos para no dejar vacantes muertas.
  const days = source.expire_days ?? 30;
  const expiresAt = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toISOString();

  const rows = parsed.jobs.map((j) => ({
    source_id: sourceId,
    external_key: j.external_key,
    country: source.country ?? "py",
    title: j.title,
    company_name: j.company_name,
    company_logo_url: j.company_logo_url,
    description: j.description,
    city: j.city,
    industry: j.industry,
    salary_range: j.salary_range,
    apply_email: j.apply_email,
    apply_url: j.apply_url,
    source_name: source.name,
    source_url: j.source_url,
    status: "activa",
    imported_at: new Date().toISOString(),
    expires_at: expiresAt,
  }));

  const { error } = await supabase
    .from("external_jobs")
    .upsert(rows, { onConflict: "source_id,external_key" });
  if (error)
    return {
      ok: false,
      error: `No pudimos guardar las vacantes importadas: ${error.message} (¿corriste migration-014.sql?)`,
    };

  await supabase
    .from("job_sources")
    .update({
      last_run_at: new Date().toISOString(),
      last_result: `OK: ${rows.length} avisos`,
      last_method: parsed.method,
      last_count: rows.length,
    })
    .eq("id", sourceId);

  revalidatePath("/admin/externas");
  revalidatePath("/empleos");
  return { ok: true, count: rows.length, method: parsed.method };
}

// Carga manual: sirve para "crear" una empresa sin registro, ya que la
// vacante externa guarda el nombre y logo de la empresa como texto.
export async function saveExternalJob(input: {
  id?: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  description: string;
  city?: string;
  industry?: string;
  salary_range?: string;
  apply_email?: string;
  apply_url?: string;
  source_name?: string;
  source_url?: string;
  status: "activa" | "oculta";
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.title.trim() || !input.company_name.trim())
    return { ok: false, error: "Poné al menos el puesto y la empresa." };
  if (!input.apply_email?.trim() && !input.apply_url?.trim())
    return {
      ok: false,
      error: "Poné un correo o un link para que la gente pueda postularse.",
    };

  const row = {
    title: input.title.trim(),
    company_name: input.company_name.trim(),
    company_logo_url: input.company_logo_url?.trim() || null,
    description: input.description.trim(),
    city: input.city?.trim() || null,
    industry: input.industry?.trim() || null,
    salary_range: input.salary_range?.trim() || null,
    apply_email: input.apply_email?.trim() || null,
    apply_url: input.apply_url?.trim() || null,
    source_name: input.source_name?.trim() || "Cargada por Worka",
    source_url: input.source_url?.trim() || null,
    status: input.status,
  };

  const { error } = input.id
    ? await supabase.from("external_jobs").update(row).eq("id", input.id)
    : await supabase.from("external_jobs").insert(row);
  if (error)
    return {
      ok: false,
      error: "No pudimos guardar (¿corriste migration-010.sql?).",
    };
  revalidatePath("/admin/externas");
  revalidatePath("/empleos");
  return { ok: true };
}

export async function deleteExternalJob(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("external_jobs").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar la vacante." };
  revalidatePath("/admin/externas");
  revalidatePath("/empleos");
  return { ok: true };
}

// Popup de novedades de /empleos. Se guarda limpio (sanitizeWhatsNew): solo
// enlaces internos y textos con largo máximo. "Eliminar" lo guarda apagado,
// sin perder el contenido, para poder volver a encenderlo.
export async function saveWhatsNew(
  config: WhatsNewConfig
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const clean = sanitizeWhatsNew(config);
  if (clean.enabled && clean.items.length === 0)
    return { ok: false, error: "Agregá al menos una novedad para mostrar el popup." };
  const { error } = await supabase.from("site_settings").upsert({
    key: WHATS_NEW_SETTING,
    value: JSON.stringify(clean),
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "No pudimos guardar el popup." };
  revalidatePath("/empleos");
  revalidatePath("/admin");
  return { ok: true };
}

// Interruptor general de todo el agregador.
export async function setExternalJobsEnabled(
  enabled: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("site_settings").upsert({
    key: "external_jobs_enabled",
    value: enabled ? "true" : "",
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "No pudimos cambiar el interruptor." };
  revalidatePath("/admin/externas");
  revalidatePath("/empleos");
  revalidatePath("/");
  return { ok: true };
}

// ── Academia ──

// Marca o desmarca una lección como completada (usuario logueado).
export async function toggleLessonComplete(
  lessonId: string,
  courseId: string,
  done: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para guardar tu avance." };
  if (done) {
    const { error } = await supabase
      .from("lesson_completions")
      .upsert({ user_id: user.id, lesson_id: lessonId, course_id: courseId });
    if (error) return { ok: false, error: "No pudimos guardar tu avance." };
  } else {
    const { error } = await supabase
      .from("lesson_completions")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
    if (error) return { ok: false, error: "No pudimos actualizar tu avance." };
  }
  return { ok: true };
}

// ── Academia: quiz con puntaje, práctica y proyecto final (migración 051) ──
//
// La lección se da por completa cuando tiene el quiz hecho (cualquier
// puntaje: la nota cuenta para el certificado, no para avanzar) y la
// práctica con todo el checklist tildado. Se decide acá, con la lección
// leída de la base, y no con lo que diga el navegador.

type LessonReq = { id: string; course_id: string; quiz: unknown[]; practice: { checklist?: string[] } | null };

async function lessonFor(supabase: NonNullable<Awaited<ReturnType<typeof getServerClient>>>, lessonId: string): Promise<LessonReq | null> {
  const { data } = await supabase.from("lessons").select("id, course_id, quiz, practice").eq("id", lessonId).maybeSingle();
  return (data as LessonReq | null) ?? null;
}

async function syncLessonCompletion(
  supabase: NonNullable<Awaited<ReturnType<typeof getServerClient>>>,
  userId: string,
  lesson: LessonReq
): Promise<boolean> {
  const { data: p } = await supabase
    .from("lesson_progress")
    .select("quiz_score, practice_done")
    .eq("user_id", userId)
    .eq("lesson_id", lesson.id)
    .maybeSingle();
  const quizOk = !lesson.quiz?.length || (p?.quiz_score ?? null) !== null;
  const practiceOk = !lesson.practice?.checklist?.length || !!p?.practice_done;
  if (!quizOk || !practiceOk) return false;
  await supabase.from("lesson_completions").upsert({ user_id: userId, lesson_id: lesson.id, course_id: lesson.course_id });
  return true;
}

export async function saveQuizResult(lessonId: string, score: number): Promise<ActionResult & { completed?: boolean; best?: number }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para guardar tu avance." };
  const lesson = await lessonFor(supabase, lessonId);
  if (!lesson) return { ok: false, error: "No encontramos la lección." };
  const total = lesson.quiz?.length ?? 0;
  const clean = Math.max(0, Math.min(total, Math.round(Number(score) || 0)));
  // Se guarda el mejor intento: repetir el ejercicio nunca baja la nota.
  const { data: prev } = await supabase.from("lesson_progress").select("quiz_score").eq("user_id", user.id).eq("lesson_id", lessonId).maybeSingle();
  const best = Math.max(clean, prev?.quiz_score ?? 0);
  const { error } = await supabase.from("lesson_progress").upsert(
    { user_id: user.id, lesson_id: lessonId, course_id: lesson.course_id, quiz_score: best, quiz_total: total, updated_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id" }
  );
  if (error) return { ok: false, error: "No pudimos guardar tu resultado. ¿Ya se corrió la migración 051?" };
  return { ok: true, best, completed: await syncLessonCompletion(supabase, user.id, lesson) };
}

export async function saveLessonPractice(lessonId: string, text: string, checks: number[]): Promise<ActionResult & { completed?: boolean; done?: boolean }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para guardar tu avance." };
  const lesson = await lessonFor(supabase, lessonId);
  if (!lesson) return { ok: false, error: "No encontramos la lección." };
  const items = lesson.practice?.checklist?.length ?? 0;
  const valid = [...new Set(checks.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < items))];
  const done = items > 0 && valid.length === items;
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: lesson.course_id,
      practice_text: text.slice(0, 10000),
      practice_checks: valid,
      practice_done: done,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
  if (error) return { ok: false, error: "No pudimos guardar tu práctica. ¿Ya se corrió la migración 051?" };
  return { ok: true, done, completed: await syncLessonCompletion(supabase, user.id, lesson) };
}

export async function saveCourseProject(courseId: string, answer: string, checks: number[]): Promise<ActionResult & { done?: boolean }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para guardar tu avance." };
  const { data: course } = await supabase.from("courses").select("final_project").eq("id", courseId).maybeSingle();
  const items = ((course?.final_project as { checklist?: string[] } | null)?.checklist ?? []).length;
  if (!items) return { ok: false, error: "Este curso no tiene proyecto final." };
  const valid = [...new Set(checks.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < items))];
  const done = valid.length === items;
  const { error } = await supabase.from("course_project_progress").upsert(
    { user_id: user.id, course_id: courseId, answer: answer.slice(0, 10000), checks: valid, done, updated_at: new Date().toISOString() },
    { onConflict: "user_id,course_id" }
  );
  if (error) return { ok: false, error: "No pudimos guardar tu proyecto. ¿Ya se corrió la migración 051?" };
  return { ok: true, done };
}

// Lecciones de un curso, para el editor del admin (server action).
export async function getCourseLessonsClient(
  courseId: string
): Promise<import("@/lib/types").Lesson[]> {
  const { getCourseLessons } = await import("@/lib/data");
  return getCourseLessons(courseId);
}

// ── Academia: gestión (solo admin) ──

function courseSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function saveCourse(input: {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  cover_url?: string;
  category: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  status: "borrador" | "publicado";
  sort?: number;
  premium?: boolean;
}): Promise<ActionResult & { id?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.title.trim())
    return { ok: false, error: "Ponele un título al curso." };

  const slug =
    (input.slug?.trim() || courseSlugify(input.title)) || `curso-${Date.now()}`;
  const row = {
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    cover_url: input.cover_url?.trim() || null,
    category: input.category.trim() || "General",
    level: input.level,
    status: input.status,
    sort: input.sort ?? 0,
    // Solo se manda si es premium: así guardar cursos sigue andando aunque
    // todavía no se haya corrido la migración 047.
    ...(input.premium !== undefined ? { premium: input.premium } : {}),
    updated_at: new Date().toISOString(),
  };

  let id = input.id;
  if (input.id) {
    const { error } = await supabase
      .from("courses")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: dbError(error) };
  } else {
    const { data, error } = await supabase
      .from("courses")
      .insert(row)
      .select("id")
      .single();
    if (error) return { ok: false, error: dbError(error) };
    id = data?.id;
  }
  revalidatePath("/academia");
  revalidatePath(`/academia/${slug}`);
  revalidatePath("/admin/academia");
  return { ok: true, id };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar el curso." };
  revalidatePath("/academia");
  revalidatePath("/admin/academia");
  return { ok: true };
}

export async function saveLesson(input: {
  id?: string;
  course_id: string;
  section: string;
  title: string;
  content: string;
  video_url?: string;
  duration_min: number;
  quiz?: import("@/lib/types").QuizQuestion[];
  sort: number;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.title.trim())
    return { ok: false, error: "Ponele un título a la lección." };

  // Limpia el quiz: descarta preguntas vacías o sin opciones válidas.
  const quiz = (input.quiz ?? [])
    .map((q) => ({
      q: (q.q ?? "").trim(),
      options: (q.options ?? []).map((o) => (o ?? "").trim()).filter(Boolean),
      answer: q.answer ?? 0,
    }))
    .filter((q) => q.q && q.options.length >= 2)
    .map((q) => ({
      ...q,
      answer: Math.min(Math.max(q.answer, 0), q.options.length - 1),
    }));

  const row = {
    course_id: input.course_id,
    section: input.section.trim(),
    title: input.title.trim(),
    content: input.content,
    video_url: input.video_url?.trim() || null,
    duration_min: input.duration_min || 5,
    quiz,
    sort: input.sort,
  };
  const { error } = input.id
    ? await supabase.from("lessons").update(row).eq("id", input.id)
    : await supabase.from("lessons").insert(row);
  if (error) return { ok: false, error: dbError(error) };
  revalidatePath("/admin/academia");
  return { ok: true };
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar la lección." };
  revalidatePath("/admin/academia");
  return { ok: true };
}

// ── Blog (solo admin) ──

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca tildes
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function saveBlogPost(input: {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  audience: "personas" | "empresas";
  status: "borrador" | "publicado";
}): Promise<ActionResult & { slug?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.title.trim())
    return { ok: false, error: "Ponele un título al artículo." };

  const slug = (input.slug?.trim() || slugify(input.title)) || `post-${Date.now()}`;
  const now = new Date().toISOString();
  const row = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    cover_url: input.cover_url,
    audience: input.audience,
    status: input.status,
    updated_at: now,
    ...(input.status === "publicado" ? { published_at: now } : {}),
  };

  let error;
  if (input.id) {
    ({ error } = await supabase.from("blog_posts").update(row).eq("id", input.id));
  } else {
    ({ error } = await supabase.from("blog_posts").insert(row));
  }
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ya existe un artículo con ese enlace (slug)." };
    return {
      ok: false,
      error: "No pudimos guardar (¿corriste migration-009.sql?).",
    };
  }

  // Avisar a Bing/Yandex del artículo nuevo o actualizado.
  if (input.status === "publicado") {
    const { pingIndexNow } = await import("@/lib/indexnow");
    const { CANONICAL_URL } = await import("@/lib/supabase/config");
    pingIndexNow(`${CANONICAL_URL}/blog/${slug}`);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { ok: true, slug };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar el artículo." };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok: true };
}

// Sube la portada de un artículo al bucket público (solo admin).
export async function uploadBlogCover(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "Elegí una imagen." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "La imagen no puede pesar más de 5 MB." };

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `blog/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { ok: false, error: "No pudimos subir la portada." };
  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// Crea una insignia personalizada (solo admin).
export async function createCustomBadge(input: {
  emoji: string;
  label: string;
  description: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!input.label.trim())
    return { ok: false, error: "Ponele un nombre a la insignia." };
  const { error } = await supabase.from("custom_badges").insert({
    emoji: input.emoji.trim() || "🏅",
    label: input.label.trim(),
    description: input.description.trim(),
  });
  if (error)
    return {
      ok: false,
      error: "No pudimos crear la insignia (¿corriste migration-008.sql?).",
    };
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteCustomBadge(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
  const { error } = await supabase.from("custom_badges").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar la insignia." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleCompanyBadge(
  companyId: string,
  badge: string, // id del catálogo fijo o uuid de una insignia personalizada
  grant: boolean
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
  if (!(await assertAdmin()))
    return { ok: false, error: "Solo el admin puede hacer esto." };
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
  // Solo destinos internos: un "next" externo haría de esto un redirect
  // abierto hacia otro sitio con el dominio de Worka como fachada.
  const internal =
    next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
  // Si pidieron una página específica se respeta; si no, según el rol.
  // Excepción: la cuenta sin perfil va primero al alta, llevándose el destino.
  if (!internal || next === "/empleos") redirect(home);
  if (home === "/onboarding")
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  redirect(next);
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

// Deshace una baja desde la propia página de baja.
//
// Se autoriza con el mismo token firmado del correo y no con la sesión: quien
// llega acá viene de un clic en el cliente de correo, casi nunca con la
// sesión abierta, y pedirle que inicie sesión para arreglar un clic
// equivocado es pedirle que no lo arregle.
export async function reactivarCorreos(token: string): Promise<ActionResult> {
  const { verificarBaja } = await import("@/lib/unsubscribe");
  const userId = verificarBaja(token);
  if (!userId) return { ok: false, error: "El enlace no es válido." };

  const { getAdminClient } = await import("@/lib/supabase/admin");
  const admin = getAdminClient();
  if (!admin) return DEMO;

  await Promise.all([
    admin
      .from("candidates")
      .update({ email_notifications: true, alerts_enabled: true })
      .eq("id", userId),
    admin
      .from("companies")
      .update({ email_notifications: true })
      .eq("id", userId),
  ]);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

// ============================================================
// Worka Freelancers
// ============================================================

// El candidato acepta unirse a Worka Freelancers: se crea su perfil.
export async function joinFreelancers(): Promise<
  ActionResult & { slug?: string }
> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };

  // ¿ya tiene perfil?
  const { data: existing } = await supabase
    .from("freelancer_profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return { ok: true, slug: existing.slug };

  // Necesita ser candidato: tomamos su nombre, ciudad y país.
  const { data: cand } = await supabase
    .from("candidates")
    .select("full_name, location_city, country")
    .eq("id", user.id)
    .maybeSingle();
  if (!cand)
    return {
      ok: false,
      error: "Primero completá tu perfil de candidato en Worka.",
    };

  // slug único: nombre + sufijo corto del id
  const base = slugify(cand.full_name) || "freelancer";
  const slug = `${base}-${user.id.slice(0, 6)}`;

  const { error } = await supabase.from("freelancer_profiles").insert({
    id: user.id,
    slug,
    location_city: cand.location_city ?? "",
    country: cand.country ?? "py",
  });
  if (error)
    return { ok: false, error: "No pudimos crear tu perfil de freelancer." };
  revalidatePath("/freelancer");
  revalidatePath("/freelancers");
  return { ok: true, slug };
}

export async function updateFreelancerProfile(input: {
  headline?: string;
  bio?: string;
  category?: string;
  skills?: string[];
  languages?: string[];
  hourly_rate?: number | null;
  currency?: string;
  availability?: "disponible" | "ocupado" | "no_disponible";
  years_experience?: number | null;
  location_city?: string;
  website_url?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  github_url?: string | null;
  behance_url?: string | null;
  accent_color?: string;
  is_public?: boolean;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("freelancer_profiles")
    .update(input)
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar tus cambios." };
  revalidatePath("/freelancer");
  return { ok: true };
}

// Crea o actualiza un servicio. Si trae `id`, actualiza; si no, inserta.
export async function saveFreelancerService(input: {
  id?: string;
  title: string;
  description?: string;
  price_from?: number | null;
  currency?: string;
  delivery_days?: number | null;
  sort?: number;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (!input.title?.trim())
    return { ok: false, error: "El servicio necesita un título." };

  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase
      .from("freelancer_services")
      .update(rest)
      .eq("id", id)
      .eq("freelancer_id", user.id);
    if (error) return { ok: false, error: "No pudimos guardar el servicio." };
  } else {
    const { error } = await supabase
      .from("freelancer_services")
      .insert({ ...input, freelancer_id: user.id });
    if (error) return { ok: false, error: "No pudimos crear el servicio." };
  }
  revalidatePath("/freelancer");
  return { ok: true };
}

export async function deleteFreelancerService(
  id: string
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("freelancer_services")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);
  if (error) return { ok: false, error: "No pudimos borrar el servicio." };
  revalidatePath("/freelancer");
  return { ok: true };
}

export async function savePortfolioItem(input: {
  id?: string;
  title: string;
  description?: string;
  image_url?: string | null;
  link_url?: string | null;
  role?: string | null;
  client?: string | null;
  year?: number | null;
  sort?: number;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (!input.title?.trim())
    return { ok: false, error: "El proyecto necesita un título." };

  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase
      .from("portfolio_items")
      .update(rest)
      .eq("id", id)
      .eq("freelancer_id", user.id);
    if (error) return { ok: false, error: "No pudimos guardar el proyecto." };
  } else {
    const { error } = await supabase
      .from("portfolio_items")
      .insert({ ...input, freelancer_id: user.id });
    if (error) return { ok: false, error: "No pudimos crear el proyecto." };
  }
  revalidatePath("/freelancer");
  return { ok: true };
}

export async function deletePortfolioItem(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);
  if (error) return { ok: false, error: "No pudimos borrar el proyecto." };
  revalidatePath("/freelancer");
  return { ok: true };
}

export async function savePaymentLink(input: {
  id?: string;
  label: string;
  url: string;
  sort?: number;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (!input.label?.trim() || !input.url?.trim())
    return { ok: false, error: "Poné un nombre y un link válido." };
  // Solo aceptamos URLs http(s): evitamos javascript: y otros esquemas.
  if (!/^https?:\/\//i.test(input.url.trim()))
    return { ok: false, error: "El link debe empezar con http:// o https://" };

  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase
      .from("payment_links")
      .update(rest)
      .eq("id", id)
      .eq("freelancer_id", user.id);
    if (error) return { ok: false, error: "No pudimos guardar el link." };
  } else {
    const { error } = await supabase
      .from("payment_links")
      .insert({ ...input, freelancer_id: user.id });
    if (error) return { ok: false, error: "No pudimos crear el link." };
  }
  revalidatePath("/freelancer");
  return { ok: true };
}

export async function deletePaymentLink(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("payment_links")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);
  if (error) return { ok: false, error: "No pudimos borrar el link." };
  revalidatePath("/freelancer");
  return { ok: true };
}

// Imagen del freelancer (banner o portfolio) → bucket público.
export async function uploadFreelancerImage(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión primero." };
  const file = formData.get("image") as File | null;
  const kind = String(formData.get("kind") ?? "portfolio");
  if (!file || file.size === 0) return { ok: false, error: "Elegí una imagen." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "La imagen no puede pesar más de 5 MB." };

  const path = `freelancers/${user.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("publico")
    .upload(path, file, { upsert: true, contentType: "image/jpeg" });
  if (error) return { ok: false, error: "No pudimos subir la imagen." };
  const { data } = supabase.storage.from("publico").getPublicUrl(path);
  const url = data.publicUrl;
  if (kind === "banner") {
    await supabase
      .from("freelancer_profiles")
      .update({ banner_url: url })
      .eq("id", user.id);
    revalidatePath("/freelancer");
  }
  return { ok: true, url };
}

// Un cliente pide presupuesto a un freelancer.
export async function requestQuote(input: {
  freelancer_id: string;
  name: string;
  email: string;
  message: string;
  budget?: string;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim())
    return { ok: false, error: "Completá tu nombre, email y mensaje." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email.trim()))
    return { ok: false, error: "El email no es válido." };
  const user = await getCurrentUser();
  const { error } = await supabase.from("quote_requests").insert({
    freelancer_id: input.freelancer_id,
    requester_id: user?.id ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    budget: input.budget?.trim() || null,
  });
  if (error)
    return { ok: false, error: "No pudimos enviar tu solicitud. Probá de nuevo." };
  return { ok: true };
}

export async function setQuoteStatus(
  id: string,
  status: "nuevo" | "respondido" | "cerrado"
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", id)
    .eq("freelancer_id", user.id);
  if (error) return { ok: false, error: "No pudimos actualizar la solicitud." };
  revalidatePath("/freelancer");
  return { ok: true };
}

// ============================================================
// Alertas de empleo
// ============================================================

export async function createJobAlert(input: {
  keyword?: string;
  industry?: string;
  city?: string;
  country: string;
  modality?: string;
  email_enabled?: boolean;
  inapp_enabled?: boolean;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para crear alertas." };
  // Al menos un criterio, si no la alerta traería todo.
  if (!input.keyword?.trim() && !input.industry && !input.city && !input.modality)
    return {
      ok: false,
      error: "Elegí al menos un criterio (rubro, ciudad o palabra clave).",
    };
  const { error } = await supabase.from("job_alerts").insert({
    user_id: user.id,
    keyword: input.keyword?.trim() || null,
    industry: input.industry || null,
    city: input.city?.trim() || null,
    country: input.country,
    modality: input.modality || null,
    email_enabled: input.email_enabled ?? true,
    inapp_enabled: input.inapp_enabled ?? true,
  });
  if (error) return { ok: false, error: "No pudimos crear la alerta." };
  revalidatePath("/alertas");
  return { ok: true };
}

export async function updateJobAlert(
  id: string,
  patch: { email_enabled?: boolean; inapp_enabled?: boolean; active?: boolean }
): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("job_alerts")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "No pudimos actualizar la alerta." };
  revalidatePath("/alertas");
  return { ok: true };
}

export async function deleteJobAlert(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("job_alerts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "No pudimos borrar la alerta." };
  revalidatePath("/alertas");
  return { ok: true };
}

// ============================================================
// Reseñas de empresas
// ============================================================

export async function createCompanyReview(input: {
  company_name: string;
  company_id?: string | null;
  country: string;
  rating: number;
  role?: string;
  employment_type?: "actual" | "ex" | "entrevista";
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean | null;
}): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión para dejar una reseña." };
  if (!input.company_name?.trim())
    return { ok: false, error: "Falta el nombre de la empresa." };
  if (!input.rating || input.rating < 1 || input.rating > 5)
    return { ok: false, error: "Elegí una calificación de 1 a 5 estrellas." };

  const slug = toSlug(input.company_name);
  const { error } = await supabase.from("company_reviews").insert({
    company_id: input.company_id || null,
    company_name: input.company_name.trim(),
    company_slug: slug,
    country: input.country,
    reviewer_id: user.id,
    rating: input.rating,
    role: input.role?.trim() || null,
    employment_type: input.employment_type ?? "ex",
    title: input.title?.trim() || "",
    body: input.body?.trim() || "",
    pros: input.pros?.trim() || null,
    cons: input.cons?.trim() || null,
    would_recommend: input.would_recommend ?? null,
  });
  if (error) {
    // Violación de la restricción única = ya reseñó esta empresa.
    if (error.code === "23505")
      return { ok: false, error: "Ya dejaste una reseña para esta empresa." };
    return { ok: false, error: "No pudimos guardar tu reseña." };
  }
  revalidatePath(`/opiniones/${slug}`);
  revalidatePath("/opiniones");
  return { ok: true };
}

export async function deleteCompanyReview(id: string): Promise<ActionResult> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesión no válida." };
  const { error } = await supabase
    .from("company_reviews")
    .delete()
    .eq("id", id)
    .eq("reviewer_id", user.id);
  if (error) return { ok: false, error: "No pudimos borrar la reseña." };
  revalidatePath("/opiniones");
  return { ok: true };
}

// Búsqueda de empleadores (registrados + externos) para el buscador de opiniones.
export async function searchEmployersAction(
  q: string,
  country: string
): Promise<
  { slug: string; name: string; company_id: string | null; logo_url: string | null }[]
> {
  const { searchEmployers } = await import("@/lib/data");
  return searchEmployers(q, country);
}
