"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { TRIAL_DAYS, getMyEvaluarAccess } from "@/lib/evaluar";

type Result = { ok: boolean; error?: string; id?: string; token?: string };

const DEMO: Result = {
  ok: false,
  error: "Modo demostración: conectá Supabase para guardar de verdad.",
};

async function requireCompany() {
  const supabase = await getServerClient();
  if (!supabase) return { supabase: null, user: null } as const;
  const user = await getCurrentUser();
  return { supabase, user } as const;
}

// Toda escritura pasa por acá: sin suscripción vigente no se crea ni se
// modifica nada. Chequearlo solo en la interfaz dejaría la puerta abierta a
// seguir usando la plataforma con la prueba vencida.
async function requireActiveAccount(): Promise<string | null> {
  const access = await getMyEvaluarAccess();
  if (!access.account) return "Todavía no activaste tu prueba de Worka Evaluar.";
  if (!access.active)
    return "Tu prueba terminó. Activá tu suscripción para seguir usando Evaluar.";
  return null;
}

// ── Cuenta y prueba ────────────────────────────────────────────

export async function startTrial(): Promise<Result> {
  const { supabase, user } = await requireCompany();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "company")
    return {
      ok: false,
      error: "Worka Evaluar es para empresas. Registrá tu empresa primero.",
    };

  const trialEnds = new Date(
    Date.now() + TRIAL_DAYS * 86_400_000
  ).toISOString();

  // Si ya existe no se toca: reinsertar reiniciaría la prueba cada vez que
  // alguien vuelve a entrar y la prueba sería infinita.
  const { error } = await supabase
    .from("evaluar_accounts")
    .insert({ company_id: user.id, trial_ends_at: trialEnds })
    .select("company_id")
    .single();

  if (error && error.code !== "23505") {
    console.error("startTrial:", error);
    return { ok: false, error: "No pudimos activar tu prueba." };
  }

  revalidatePath("/evaluar/app");
  return { ok: true };
}

// ── Procesos ───────────────────────────────────────────────────

export async function createProcess(input: {
  title: string;
  description?: string;
  job_id?: string | null;
}): Promise<Result> {
  const { supabase, user } = await requireCompany();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  if (!input.title.trim())
    return { ok: false, error: "Poné un nombre al proceso." };

  const { data, error } = await supabase
    .from("evaluar_processes")
    .insert({
      company_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      job_id: input.job_id || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createProcess:", error);
    return { ok: false, error: "No pudimos crear el proceso." };
  }

  revalidatePath("/evaluar/app");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateProcess(
  id: string,
  input: {
    title?: string;
    description?: string;
    closing_message?: string;
    job_id?: string | null;
    status?: "borrador" | "activo" | "cerrado";
  }
): Promise<Result> {
  const { supabase, user } = await requireCompany();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const { error } = await supabase
    .from("evaluar_processes")
    .update(input)
    .eq("id", id)
    .eq("company_id", user.id);

  if (error) {
    console.error("updateProcess:", error);
    return { ok: false, error: "No pudimos guardar los cambios." };
  }
  revalidatePath(`/evaluar/app/procesos/${id}`);
  revalidatePath("/evaluar/app");
  return { ok: true };
}

// ── Etapas y preguntas ─────────────────────────────────────────

export async function addStage(
  processId: string,
  input: { title: string; description?: string; minutes?: number }
): Promise<Result> {
  const { supabase, user } = await requireCompany();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };
  if (!input.title.trim())
    return { ok: false, error: "La etapa necesita un nombre." };

  const { count } = await supabase
    .from("evaluar_stages")
    .select("id", { count: "exact", head: true })
    .eq("process_id", processId);

  const { data, error } = await supabase
    .from("evaluar_stages")
    .insert({
      process_id: processId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      minutes: input.minutes ?? 5,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("addStage:", error);
    return { ok: false, error: "No pudimos agregar la etapa." };
  }
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteStage(
  processId: string,
  stageId: string
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const { error } = await supabase
    .from("evaluar_stages")
    .delete()
    .eq("id", stageId);
  if (error) return { ok: false, error: "No pudimos borrar la etapa." };
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

export async function addQuestion(
  processId: string,
  stageId: string,
  input: {
    text: string;
    kind: "unica" | "multiple" | "texto" | "escala" | "numero";
    options: string[];
    correctIndex: number | null;
    weight: number;
    knockout: boolean;
  }
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };
  if (!input.text.trim())
    return { ok: false, error: "Escribí la pregunta." };

  const needsOptions = input.kind === "unica" || input.kind === "multiple";
  const options = needsOptions
    ? input.options.map((o) => o.trim()).filter(Boolean)
    : [];
  if (needsOptions && options.length < 2)
    return { ok: false, error: "Cargá al menos dos opciones." };

  const { count } = await supabase
    .from("evaluar_stages")
    .select("id", { count: "exact", head: true })
    .eq("id", stageId);
  if (!count) return { ok: false, error: "Esa etapa ya no existe." };

  const { count: qCount } = await supabase
    .from("evaluar_questions")
    .select("id", { count: "exact", head: true })
    .eq("stage_id", stageId);

  // La respuesta correcta se guarda como el texto de la opción, no como su
  // posición: si mañana se reordenan las opciones, la corrección sigue siendo
  // la misma. Sin respuesta correcta, la pregunta la juzga el evaluador.
  const correct =
    needsOptions && input.correctIndex !== null
      ? options[input.correctIndex] ?? null
      : null;

  const { error } = await supabase.from("evaluar_questions").insert({
    stage_id: stageId,
    position: qCount ?? 0,
    kind: input.kind,
    text: input.text.trim(),
    options,
    correct,
    weight: Math.max(1, input.weight),
    knockout: input.knockout && correct !== null,
  });

  if (error) {
    console.error("addQuestion:", error);
    return { ok: false, error: "No pudimos guardar la pregunta." };
  }
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

export async function deleteQuestion(
  processId: string,
  questionId: string
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const { error } = await supabase
    .from("evaluar_questions")
    .delete()
    .eq("id", questionId);
  if (error) return { ok: false, error: "No pudimos borrar la pregunta." };
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

// ── Participantes ──────────────────────────────────────────────

export async function inviteParticipant(
  processId: string,
  input: { full_name: string; email?: string; phone?: string }
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };
  if (!input.full_name.trim())
    return { ok: false, error: "Poné el nombre de la persona." };

  const { data, error } = await supabase
    .from("evaluar_participants")
    .insert({
      process_id: processId,
      full_name: input.full_name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      source: "invitado",
    })
    .select("token")
    .single();

  if (error) {
    console.error("inviteParticipant:", error);
    return { ok: false, error: "No pudimos invitar a esa persona." };
  }

  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true, token: (data as { token: string }).token };
}

export async function setParticipantStatus(
  processId: string,
  participantId: string,
  status: "finalista" | "descartado" | "contratado" | "completado",
  note?: string
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const { error } = await supabase
    .from("evaluar_participants")
    .update({ status, outcome_note: note?.trim() || null })
    .eq("id", participantId);
  if (error) return { ok: false, error: "No pudimos actualizar el estado." };

  // La decisión queda en la línea de tiempo que el candidato ve: el objetivo
  // es que nadie se quede sin saber en qué terminó.
  const mensajes: Record<string, string> = {
    finalista: "Pasaste a la etapa final del proceso.",
    contratado: "¡Fuiste seleccionado/a para el puesto!",
    descartado: "El proceso se cerró para vos en esta oportunidad.",
    completado: "Terminaste la evaluación. La empresa está revisando.",
  };
  await supabase.from("evaluar_events").insert({
    participant_id: participantId,
    kind: status,
    message: note?.trim() || mensajes[status],
  });

  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

export async function addNote(
  processId: string,
  participantId: string,
  body: string,
  rating?: number
): Promise<Result> {
  const { supabase, user } = await requireCompany();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };
  if (!body.trim()) return { ok: false, error: "Escribí la nota." };

  const { error } = await supabase.from("evaluar_notes").insert({
    participant_id: participantId,
    author_id: user.id,
    body: body.trim(),
    rating: rating ?? null,
  });
  if (error) return { ok: false, error: "No pudimos guardar la nota." };
  revalidatePath(`/evaluar/app/procesos/${processId}/tablero`);
  return { ok: true };
}

// ── Entrada del candidato desde una vacante de Worka ───────────

// El diferencial: quien mira una vacante en Worka arranca la evaluación sin
// salir del flujo ni crear otra cuenta. Devuelve el token para /e/<token>.
export async function joinProcessFromJob(processId: string): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user)
    return { ok: false, error: "Iniciá sesión para empezar la evaluación." };

  const { data: existing } = await supabase
    .from("evaluar_participants")
    .select("token")
    .eq("process_id", processId)
    .eq("candidate_id", user.id)
    .maybeSingle();
  if (existing)
    return { ok: true, token: (existing as { token: string }).token };

  const { data: candidate } = await supabase
    .from("candidates")
    .select("full_name, phone_whatsapp")
    .eq("id", user.id)
    .maybeSingle();
  const c = candidate as
    | { full_name: string; phone_whatsapp: string }
    | null;
  if (!c?.full_name)
    return {
      ok: false,
      error: "Completá tu perfil (nombre y ciudad) para empezar la evaluación.",
    };

  const { data, error } = await supabase
    .from("evaluar_participants")
    .insert({
      process_id: processId,
      candidate_id: user.id,
      full_name: c.full_name,
      phone: c.phone_whatsapp,
      source: "worka",
    })
    .select("token")
    .single();

  if (error) {
    console.error("joinProcessFromJob:", error);
    return { ok: false, error: "No pudimos abrir tu evaluación." };
  }
  return { ok: true, token: (data as { token: string }).token };
}

// ── Evaluación del candidato (por token, sin cuenta) ───────────

export async function loadEvaluation(token: string) {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("evaluar_load", {
    p_token: token,
  });
  if (error) {
    console.error("evaluar_load:", error);
    return null;
  }
  return data;
}

export async function startEvaluation(token: string): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const { error } = await supabase.rpc("evaluar_start", { p_token: token });
  if (error) return { ok: false, error: "No pudimos abrir la evaluación." };
  return { ok: true };
}

export async function submitStage(
  token: string,
  stageId: string,
  answers: Record<string, unknown>
): Promise<Result & { status?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;

  const { data, error } = await supabase.rpc("evaluar_submit_stage", {
    p_token: token,
    p_stage_id: stageId,
    p_answers: answers,
  });
  if (error) {
    console.error("evaluar_submit_stage:", error);
    return { ok: false, error: error.message };
  }
  revalidatePath(`/evaluar/e/${token}`);
  return { ok: true, status: (data as { status: string } | null)?.status };
}
