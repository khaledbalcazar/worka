"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { TRIAL_DAYS, getMyEvaluarAccess } from "@/lib/evaluar";
import { LIKERT_LABELS, getTemplate } from "@/lib/evaluar/templates";
import { emailEnabled, emailLayout, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";

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

// Activa, extiende o corta la suscripción de una empresa. Es lo que cierra el
// circuito del cobro manual: sin esto habría que editar la tabla a mano en
// Supabase cada vez que alguien paga.
//
// La política de RLS ya exige rol admin para escribir en evaluar_accounts,
// pero se vuelve a chequear acá para devolver un mensaje claro en vez de un
// error críptico de la base.
export async function setEvaluarSubscription(
  companyId: string,
  action: "activar_1" | "activar_3" | "activar_12" | "vencer" | "cancelar"
): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin")
    return { ok: false, error: "Solo un admin puede tocar las suscripciones." };

  const meses =
    action === "activar_1" ? 1 : action === "activar_3" ? 3 : action === "activar_12" ? 12 : 0;

  let update: Record<string, unknown>;
  if (meses > 0) {
    // Si todavía le queda tiempo pago, se suma encima; si no, se cuenta desde
    // hoy. Renovar antes de que venza no debe hacerle perder días.
    const { data: current } = await supabase
      .from("evaluar_accounts")
      .select("paid_until")
      .eq("company_id", companyId)
      .maybeSingle();
    const prev = (current as { paid_until?: string } | null)?.paid_until;
    const desde =
      prev && new Date(prev).getTime() > Date.now()
        ? new Date(prev)
        : new Date();
    desde.setMonth(desde.getMonth() + meses);
    update = { status: "activa", paid_until: desde.toISOString() };
  } else {
    update = { status: action === "vencer" ? "vencida" : "cancelada" };
  }

  const { error } = await supabase
    .from("evaluar_accounts")
    .update(update)
    .eq("company_id", companyId);

  if (error) {
    console.error("setEvaluarSubscription:", error);
    return { ok: false, error: "No pudimos actualizar la suscripción." };
  }

  revalidatePath("/admin");
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

// Instancia una plantilla del catálogo como una etapa real del proceso, con
// sus preguntas copiadas. Se copia y no se referencia a propósito: si mañana
// corrijo un ítem del catálogo, un proceso que ya está corriendo no cambia de
// contenido a mitad de camino (y los resultados siguen siendo comparables).
export async function applyTemplate(
  processId: string,
  templateKey: string
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const template = getTemplate(templateKey);
  if (!template) return { ok: false, error: "Esa plantilla no existe." };

  const { count } = await supabase
    .from("evaluar_stages")
    .select("id", { count: "exact", head: true })
    .eq("process_id", processId);

  const { data: stage, error: stageError } = await supabase
    .from("evaluar_stages")
    .insert({
      process_id: processId,
      title: template.name,
      description: template.summary,
      minutes: template.minutes,
      position: count ?? 0,
      template_key: template.key,
      // Los tests con respuesta correcta van cronometrados: sin tiempo límite
      // dejan de medir razonamiento y pasan a medir paciencia.
      timed: template.scored === "correcto",
    })
    .select("id")
    .single();

  if (stageError || !stage) {
    console.error("applyTemplate stage:", stageError);
    return { ok: false, error: "No pudimos agregar la plantilla." };
  }

  const stageId = (stage as { id: string }).id;
  const rows = template.questions.map((q, i) => ({
    stage_id: stageId,
    position: i,
    kind: q.kind,
    text: q.text,
    options: q.kind === "likert" ? LIKERT_LABELS : (q.options ?? []),
    correct: q.correct ?? null,
    option_scores: q.optionScores ?? null,
    dimension: q.dimension ?? null,
    reverse: q.reverse ?? false,
    weight: q.weight ?? 1,
    knockout: false,
  }));

  const { error: qError } = await supabase
    .from("evaluar_questions")
    .insert(rows);

  if (qError) {
    console.error("applyTemplate questions:", qError);
    // Sin preguntas la etapa no sirve para nada y dejaría al candidato ante
    // una pantalla vacía: se deshace.
    await supabase.from("evaluar_stages").delete().eq("id", stageId);
    return { ok: false, error: "No pudimos cargar las preguntas." };
  }

  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true, id: stageId };
}

// Editar una pregunta ya cargada. Faltaba: la única salida era borrarla y
// escribirla de nuevo, y con eso se perdían las respuestas ya dadas (borrar la
// pregunta borra en cascada sus respuestas). Corregir una palabra no puede
// costar el historial del proceso.
export async function updateQuestion(
  processId: string,
  questionId: string,
  input: {
    text: string;
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
  if (!input.text.trim()) return { ok: false, error: "Escribí la pregunta." };

  const { data: current } = await supabase
    .from("evaluar_questions")
    .select("kind, options, correct")
    .eq("id", questionId)
    .maybeSingle();
  if (!current) return { ok: false, error: "Esa pregunta ya no existe." };

  const row = current as { kind: string; options: string[]; correct: unknown };
  const needsOptions = row.kind === "unica" || row.kind === "multiple";
  const options = needsOptions
    ? input.options.map((o) => o.trim()).filter(Boolean)
    : [];
  if (needsOptions && options.length < 2)
    return { ok: false, error: "Cargá al menos dos opciones." };

  const correct =
    needsOptions && input.correctIndex !== null
      ? (options[input.correctIndex] ?? null)
      : null;

  const { error } = await supabase
    .from("evaluar_questions")
    .update({
      text: input.text.trim(),
      options,
      correct,
      weight: Math.max(1, input.weight),
      knockout: input.knockout && correct !== null,
    })
    .eq("id", questionId);

  if (error) {
    console.error("updateQuestion:", error);
    return { ok: false, error: "No pudimos guardar la pregunta." };
  }
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

// Editar una etapa (nombre, descripción, minutos y si va cronometrada).
export async function updateStage(
  processId: string,
  stageId: string,
  input: {
    title: string;
    description?: string;
    minutes: number;
    timed: boolean;
  }
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };
  if (!input.title.trim())
    return { ok: false, error: "La etapa necesita un nombre." };

  const { error } = await supabase
    .from("evaluar_stages")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      minutes: Math.max(1, input.minutes),
      timed: input.timed,
    })
    .eq("id", stageId);

  if (error) return { ok: false, error: "No pudimos guardar la etapa." };
  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true };
}

// Mover una etapa arriba o abajo. Las etapas quedaban en el orden en que se
// crearon y no había forma de reacomodarlas.
export async function moveStage(
  processId: string,
  stageId: string,
  direction: "arriba" | "abajo"
): Promise<Result> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const { data: stages } = await supabase
    .from("evaluar_stages")
    .select("id, position")
    .eq("process_id", processId)
    .order("position");

  const list = (stages ?? []) as { id: string; position: number }[];
  const i = list.findIndex((s) => s.id === stageId);
  const j = direction === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };

  // Se reescriben las posiciones de toda la lista: es barato y deja el orden
  // consistente aunque hubiera huecos de borrados anteriores.
  const reordered = [...list];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];

  for (let pos = 0; pos < reordered.length; pos++) {
    await supabase
      .from("evaluar_stages")
      .update({ position: pos })
      .eq("id", reordered[pos].id);
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

// Invitación en lote. Una empresa que evalúa 40 personas no va a cargarlas de
// a una ni a copiar 40 enlaces a mano: se pegan las filas y listo.
// Formato por línea: "Nombre, email, teléfono" (email y teléfono opcionales).
export async function inviteBatch(
  processId: string,
  raw: string
): Promise<Result & { invited?: number; failed?: number }> {
  const { supabase } = await requireCompany();
  if (!supabase) return DEMO;
  const blocked = await requireActiveAccount();
  if (blocked) return { ok: false, error: blocked };

  const rows = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, email, phone] = line
        .split(/[,;\t]/)
        .map((p) => p.trim());
      return { full_name: name ?? "", email: email || null, phone: phone || null };
    })
    .filter((r) => r.full_name.length > 0);

  if (rows.length === 0)
    return { ok: false, error: "No encontramos ningún nombre en esa lista." };
  if (rows.length > 200)
    return { ok: false, error: "Máximo 200 por vez." };

  const { data: process } = await supabase
    .from("evaluar_processes")
    .select("title, company_id")
    .eq("id", processId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("evaluar_participants")
    .insert(rows.map((r) => ({ ...r, process_id: processId, source: "invitado" })))
    .select("token, full_name, email");

  if (error) {
    console.error("inviteBatch:", error);
    return { ok: false, error: "No pudimos cargar la lista." };
  }

  const created = (data ?? []) as {
    token: string;
    full_name: string;
    email: string | null;
  }[];

  const sent = await notifyParticipants(
    created,
    (process as { title?: string } | null)?.title ?? "una evaluación",
    (process as { company_id?: string } | null)?.company_id
  );

  revalidatePath(`/evaluar/app/procesos/${processId}`);
  return { ok: true, invited: created.length, failed: created.length - sent };
}

// Manda el enlace por email a quien tenga dirección. El que no la tenga queda
// igual en la lista: la empresa le pasa el enlace por WhatsApp desde el panel.
async function notifyParticipants(
  people: { token: string; full_name: string; email: string | null }[],
  processTitle: string,
  companyId?: string
): Promise<number> {
  if (!emailEnabled()) return 0;

  let companyName = "Una empresa";
  if (companyId) {
    const supabase = await getServerClient();
    const { data } = await supabase!
      .from("companies")
      .select("trade_name")
      .eq("id", companyId)
      .maybeSingle();
    companyName = (data as { trade_name?: string } | null)?.trade_name ?? companyName;
  }

  const base = SITE_URL.replace(/\/$/, "").replace("://", "://evaluar.");
  let sent = 0;
  for (const p of people) {
    if (!p.email) continue;
    const url = `${base}/e/${p.token}`;
    const ok = await sendEmail({
      to: p.email,
      subject: `${companyName} te invita a una evaluación`,
      html: emailLayout(`
        <p>Hola${p.full_name ? ` ${p.full_name}` : ""},</p>
        <p><strong>${companyName}</strong> te invita a completar la evaluación
        de <strong>${processTitle}</strong>.</p>
        <p>No necesitás crear ninguna cuenta: entrá desde este enlace, que es
        tuyo y personal.</p>
        <p style="margin:24px 0">
          <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">
            Empezar mi evaluación
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">Vas a ver desde el principio
        cuántas etapas tiene y cuánto te va a llevar cada una.</p>
      `),
    });
    if (ok) sent++;
  }
  return sent;
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
  answers: Record<string, unknown>,
  seconds?: number
): Promise<Result & { status?: string }> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;

  const { data, error } = await supabase.rpc("evaluar_submit_stage", {
    p_token: token,
    p_stage_id: stageId,
    p_answers: answers,
    p_seconds: seconds ?? null,
  });
  if (error) {
    console.error("evaluar_submit_stage:", error);
    return { ok: false, error: error.message };
  }
  revalidatePath(`/evaluar/e/${token}`);
  return { ok: true, status: (data as { status: string } | null)?.status };
}
