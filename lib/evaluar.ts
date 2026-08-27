import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { TRIAL_DAYS } from "@/lib/evaluar-config";
import {
  resolveAccess,
  type AccessState,
  type EvaluarAccount,
  type EvaluarStatus,
} from "@/lib/evaluar-access";

export { TRIAL_DAYS, resolveAccess };
export type { AccessState, EvaluarAccount, EvaluarStatus };

// Capa de datos de Worka Evaluar. Igual que lib/data.ts, las páginas solo
// importan de acá.


export type EvaluarProcess = {
  id: string;
  company_id: string;
  job_id: string | null;
  title: string;
  description: string;
  closing_message: string;
  status: "borrador" | "activo" | "cerrado";
  created_at: string;
  theme?: string | null;
  brand_color?: string | null;
  use_company_brand?: boolean;
  deadline_at?: string | null;
  archived?: boolean;
  ideal_profile?: Record<string, number>;
  /** Para que unidad y departamento se llama el concurso. */
  org_unit?: string;
  department?: string;
  manager_name?: string;
  manager_email?: string;
};

export type EvaluarStage = {
  id: string;
  process_id: string;
  position: number;
  title: string;
  description: string;
  kind: "cuestionario" | "tarea" | "entrevista";
  minutes: number;
  /** Etapa con cronómetro (los tests con respuesta correcta). */
  timed?: boolean;
  template_key?: string | null;
  /** Que es esta etapa y que se espera, en criollo. */
  intro?: string;
  /** Pregunta de ejemplo resuelta, para ver el formato sin presion. */
  demo?: StageDemo | null;
};

export type StageDemo = {
  text: string;
  options: string[];
  answer: string;
  explain: string;
};

export type EvaluarQuestion = {
  id: string;
  stage_id: string;
  position: number;
  kind: "unica" | "multiple" | "texto" | "escala" | "numero";
  text: string;
  options: string[];
  correct: unknown;
  weight: number;
  knockout: boolean;
  dimension?: string | null;
  /** Tope de grabacion, solo para las preguntas de video. */
  max_seconds?: number;
};

export type ParticipantStatus =
  | "invitado"
  | "en_curso"
  | "completado"
  | "descartado"
  | "finalista"
  | "contratado";

export type EvaluarParticipant = {
  id: string;
  process_id: string;
  candidate_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  token: string;
  source: "worka" | "invitado";
  status: ParticipantStatus;
  stage_index: number;
  city?: string | null;
  cv_url?: string | null;
  score: number | null;
  max_score: number | null;
  outcome_note: string | null;
  /** Motivo tipificado del descarte. */
  reject_reason?: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  /** Acumulado por rasgo. Lo llena la corrección del lado de la base. */
  profile?: Record<string, { raw: number; max: number }>;
};

// ── Suscripción ────────────────────────────────────────────────

export async function getMyEvaluarAccess(): Promise<AccessState> {
  const supabase = await getServerClient();
  if (!supabase) {
    // Modo demo: se navega como una cuenta en prueba recién creada.
    const trial = new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();
    return {
      account: {
        company_id: "demo",
        status: "prueba",
        plan: "esencial",
        price_gs: 0,
        trial_ends_at: trial,
        paid_until: null,
        created_at: new Date().toISOString(),
      },
      active: true,
      inTrial: true,
      daysLeft: TRIAL_DAYS,
    };
  }

  const user = await getCurrentUser();
  if (!user) return { account: null, active: false, inTrial: false, daysLeft: 0 };

  const { data } = await supabase
    .from("evaluar_accounts")
    .select("*")
    .eq("company_id", user.id)
    .maybeSingle();

  return resolveAccess((data as EvaluarAccount) ?? null);
}

// ── Procesos ───────────────────────────────────────────────────

export type ProcessRow = EvaluarProcess & {
  job: { id: string; title: string } | null;
  stage_count: number;
  participant_count: number;
};

export async function getMyProcesses(): Promise<ProcessRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("evaluar_processes")
    .select(
      "*, job:jobs(id, title), evaluar_stages(count), evaluar_participants(count)"
    )
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as (EvaluarProcess & {
    job: { id: string; title: string } | null;
    evaluar_stages: { count: number }[];
    evaluar_participants: { count: number }[];
  })[]).map((p) => ({
    ...p,
    stage_count: p.evaluar_stages?.[0]?.count ?? 0,
    participant_count: p.evaluar_participants?.[0]?.count ?? 0,
  }));
}

export type ProcessMember = {
  id: string;
  user_id: string;
  created_at: string;
};

export type ProcessDetail = {
  process: EvaluarProcess & { job: { id: string; title: string } | null };
  stages: (EvaluarStage & { questions: EvaluarQuestion[] })[];
  participants: EvaluarParticipant[];
  members: ProcessMember[];
};

export async function getProcessDetail(
  id: string
): Promise<ProcessDetail | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: process } = await supabase
    .from("evaluar_processes")
    .select("*, job:jobs(id, title)")
    .eq("id", id)
    .eq("company_id", user.id)
    .maybeSingle();
  if (!process) return null;

  const [{ data: stages }, { data: participants }, { data: members }] =
    await Promise.all([
    supabase
      .from("evaluar_stages")
      .select("*, evaluar_questions(*)")
      .eq("process_id", id)
      .order("position"),
    supabase
      .from("evaluar_participants")
      .select("*")
      .eq("process_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("evaluar_process_members")
      .select("id, user_id, created_at")
      .eq("process_id", id),
  ]);

  return {
    process: process as ProcessDetail["process"],
    stages: ((stages ?? []) as unknown as (EvaluarStage & {
      evaluar_questions: EvaluarQuestion[];
    })[]).map((s) => ({
      ...s,
      questions: [...(s.evaluar_questions ?? [])].sort(
        (a, b) => a.position - b.position
      ),
    })),
    participants: (participants ?? []) as EvaluarParticipant[],
    members: (members ?? []) as ProcessMember[],
  };
}

// Vacantes activas de la empresa que todavía no tienen proceso enlazado.
// Es la puerta de entrada del diferencial: enlazar el aviso con la evaluación.
export async function getLinkableJobs(): Promise<
  { id: string; title: string; linked: boolean }[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const [{ data: jobs }, { data: linked }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title")
      .eq("company_id", user.id)
      .eq("status", "Activo")
      .order("created_at", { ascending: false }),
    supabase
      .from("evaluar_processes")
      .select("job_id")
      .eq("company_id", user.id)
      .not("job_id", "is", null),
  ]);

  const taken = new Set(
    ((linked ?? []) as { job_id: string }[]).map((l) => l.job_id)
  );
  return ((jobs ?? []) as { id: string; title: string }[]).map((j) => ({
    ...j,
    linked: taken.has(j.id),
  }));
}

// ── Panel: lo que necesita atención ────────────────────────────

export type PanelAlert = {
  kind: "revisar" | "borrador" | "plazo";
  processId: string;
  processTitle: string;
  count: number;
  detail: string;
};

export type PanelActivity = {
  at: string;
  message: string;
  processTitle: string;
};

export type PanelData = {
  processes: ProcessRow[];
  alerts: PanelAlert[];
  activity: PanelActivity[];
  stats: { activos: number; enCurso: number; completados: number };
};

// Todo lo del panel en una sola pasada. La pregunta que la empresa se hace al
// entrar no es "qué procesos tengo" sino "qué está esperando algo mío": sin
// esto hay que abrir proceso por proceso para descubrir que seis personas
// terminaron y nadie las miró.
export async function getPanelData(): Promise<PanelData> {
  const vacio: PanelData = {
    processes: [],
    alerts: [],
    activity: [],
    stats: { activos: 0, enCurso: 0, completados: 0 },
  };

  const supabase = await getServerClient();
  if (!supabase) return vacio;
  const user = await getCurrentUser();
  if (!user) return vacio;

  const processes = await getMyProcesses();
  const visibles = processes.filter((p) => !p.archived);
  if (visibles.length === 0) return { ...vacio, processes: visibles };

  const ids = visibles.map((p) => p.id);
  const titulo = new Map(visibles.map((p) => [p.id, p.title]));

  const [{ data: participants }, { data: events }] = await Promise.all([
    supabase
      .from("evaluar_participants")
      .select("id, process_id, status, full_name, completed_at")
      .in("process_id", ids),
    supabase
      .from("evaluar_events")
      .select("kind, message, created_at, participant:evaluar_participants(process_id)")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const gente = (participants ?? []) as {
    id: string;
    process_id: string;
    status: string;
    full_name: string;
    completed_at: string | null;
  }[];

  const alerts: PanelAlert[] = [];

  // 1) Terminaron y nadie los movió: es lo más urgente que existe acá.
  for (const p of visibles) {
    const esperando = gente.filter(
      (g) => g.process_id === p.id && g.status === "completado"
    ).length;
    if (esperando > 0) {
      alerts.push({
        kind: "revisar",
        processId: p.id,
        processTitle: p.title,
        count: esperando,
        detail:
          esperando === 1
            ? "1 persona terminó y espera tu decisión"
            : `${esperando} personas terminaron y esperan tu decisión`,
      });
    }
  }

  // 2) Procesos armados que nunca se publicaron: trabajo hecho sin usar.
  for (const p of visibles) {
    if (p.status === "borrador" && p.stage_count > 0) {
      alerts.push({
        kind: "borrador",
        processId: p.id,
        processTitle: p.title,
        count: 1,
        detail: "Está armado pero sin publicar: nadie puede rendirlo todavía",
      });
    }
  }

  // 3) Plazos que vencen dentro de la semana.
  const enUnaSemana = Date.now() + 7 * 86_400_000;
  for (const p of visibles) {
    if (!p.deadline_at || p.status !== "activo") continue;
    const cierre = new Date(p.deadline_at).getTime();
    if (cierre > Date.now() && cierre < enUnaSemana) {
      const dias = Math.ceil((cierre - Date.now()) / 86_400_000);
      alerts.push({
        kind: "plazo",
        processId: p.id,
        processTitle: p.title,
        count: dias,
        detail:
          dias === 1 ? "Cierra mañana" : `Cierra en ${dias} días`,
      });
    }
  }

  const activity: PanelActivity[] = (
    (events ?? []) as unknown as {
      message: string;
      created_at: string;
      participant: { process_id: string } | null;
    }[]
  )
    .filter((e) => e.participant && titulo.has(e.participant.process_id))
    .map((e) => ({
      at: e.created_at,
      message: e.message,
      processTitle: titulo.get(e.participant!.process_id) ?? "",
    }));

  return {
    processes: visibles,
    alerts,
    activity,
    stats: {
      activos: visibles.filter((p) => p.status === "activo").length,
      enCurso: gente.filter((g) => g.status === "en_curso").length,
      completados: gente.filter((g) =>
        ["completado", "finalista", "contratado"].includes(g.status)
      ).length,
    },
  };
}

// ── Administración de suscripciones ────────────────────────────

export type EvaluarAccountRow = EvaluarAccount & {
  company: { trade_name: string; company_name: string } | null;
};

/** Todas las cuentas de Evaluar, para el backoffice. Solo la ve un admin. */
export async function getEvaluarAccounts(): Promise<EvaluarAccountRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];

  // El join va contra companies, que es la única relación directa: los
  // procesos cuelgan de la empresa, no de la cuenta.
  const { data } = await supabase
    .from("evaluar_accounts")
    .select("*, company:companies(trade_name, company_name)")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as EvaluarAccountRow[];
}

// ── Tablero de decisión ────────────────────────────────────────

/** Perfil crudo por dimensión, tal como lo acumula la base. */
export type DimensionScores = Record<string, { raw: number; max: number }>;

export type BoardCandidate = EvaluarParticipant & {
  percent: number | null;
  /** Ajuste al perfil ideal del puesto, 0-100. Null si no se definio. */
  fit: number | null;
  profile: DimensionScores;
  answers: { question_id: string; value: unknown; score: number }[];
  notes: { id: string; body: string; rating: number | null; created_at: string }[];
};

export type BoardData = {
  process: EvaluarProcess;
  stages: (EvaluarStage & { questions: EvaluarQuestion[] })[];
  candidates: BoardCandidate[];
};

// Ajuste al perfil ideal: promedio de los rasgos que importan, ponderado por
// cuánto importa cada uno.
//
// Ordenar por puntaje bruto trata igual a un cajero y a un supervisor. Acá la
// empresa dice qué pesa para ESE puesto y el orden lo refleja. Se calcula solo
// sobre los rasgos que la persona efectivamente rindió: penalizar por una
// etapa que todavía no hizo la dejaría última sin motivo.
export function fitScore(
  profile: DimensionScores,
  ideal: Record<string, number> | undefined
): number | null {
  if (!ideal) return null;
  const claves = Object.keys(ideal).filter((k) => (ideal[k] ?? 0) > 0);
  if (claves.length === 0) return null;

  let suma = 0;
  let pesos = 0;
  for (const k of claves) {
    const v = profile[k];
    if (!v || v.max <= 0) continue;
    const peso = ideal[k];
    suma += (v.raw / v.max) * peso;
    pesos += peso;
  }
  if (pesos === 0) return null;
  return Math.round((suma / pesos) * 100);
}

export async function getBoardData(processId: string): Promise<BoardData | null> {
  const detail = await getProcessDetail(processId);
  if (!detail) return null;

  const supabase = await getServerClient();
  if (!supabase) return null;

  const ids = detail.participants.map((p) => p.id);
  const [{ data: answers }, { data: notes }] = await Promise.all([
    ids.length
      ? supabase
          .from("evaluar_answers")
          .select("participant_id, question_id, value, score")
          .in("participant_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase
          .from("evaluar_notes")
          .select("id, participant_id, body, rating, created_at")
          .in("participant_id", ids)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const byParticipant = <T extends { participant_id: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    for (const r of rows) {
      const list = map.get(r.participant_id) ?? [];
      list.push(r);
      map.set(r.participant_id, list);
    }
    return map;
  };

  const answerMap = byParticipant(
    (answers ?? []) as (BoardCandidate["answers"][number] & {
      participant_id: string;
    })[]
  );
  const noteMap = byParticipant(
    (notes ?? []) as (BoardCandidate["notes"][number] & {
      participant_id: string;
    })[]
  );

  const candidates: BoardCandidate[] = detail.participants
    .map((p) => ({
      ...p,
      profile: (p.profile ?? {}) as DimensionScores,
      // El porcentaje se calcula sobre lo que la persona efectivamente rindió,
      // no sobre el total del proceso: comparar a alguien que hizo dos etapas
      // con alguien que hizo una sobre la misma base sería injusto.
      percent:
        p.max_score && p.max_score > 0
          ? Math.round(((p.score ?? 0) / p.max_score) * 100)
          : null,
      answers: answerMap.get(p.id) ?? [],
      notes: noteMap.get(p.id) ?? [],
      fit: fitScore(
        (p.profile ?? {}) as DimensionScores,
        detail.process.ideal_profile
      ),
    }))
    // Si la empresa definió qué importa para el puesto, se ordena por ajuste;
    // si no, por puntaje bruto. Los que no rindieron van siempre al final.
    .sort((a, b) =>
      a.fit !== null || b.fit !== null
        ? (b.fit ?? -1) - (a.fit ?? -1)
        : (b.percent ?? -1) - (a.percent ?? -1)
    );

  return { process: detail.process, stages: detail.stages, candidates };
}

// ── Enlace con Worka Empleos ───────────────────────────────────

// ¿Esta vacante tiene evaluación? Lo consulta la página pública de la vacante
// para ofrecer "empezar la evaluación" ahí mismo.
export async function getProcessForJob(
  jobId: string
): Promise<{ id: string; title: string; stage_count: number } | null> {
  // Se lee con el cliente administrativo a propósito. Esta consulta corre en
  // la página pública de la vacante, o sea con la sesión del candidato, y la
  // única política sobre evaluar_processes deja leer a la empresa dueña. Con
  // el cliente normal siempre devolvía null: la vacante enlazada se mostraba
  // como una común y la evaluación quedaba invisible para todo el mundo.
  //
  // No se abre una política pública en su lugar porque la fila guarda el
  // perfil ideal del puesto, y un candidato que lo lee sabe qué contestar.
  // Acá salen tres campos elegidos a mano y nada más.
  const supabase = getAdminClient() ?? (await getServerClient());
  if (!supabase) return null;

  const { data } = await supabase
    .from("evaluar_processes")
    .select("id, title, evaluar_stages(count)")
    .eq("job_id", jobId)
    .eq("status", "activo")
    .maybeSingle();
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    title: string;
    evaluar_stages: { count: number }[];
  };
  return {
    id: row.id,
    title: row.title,
    stage_count: row.evaluar_stages?.[0]?.count ?? 0,
  };
}

// El token del candidato en un proceso, si ya fue dado de alta.
export type MyParticipation = { token: string; status: ParticipantStatus };

// Estado del candidato dentro del proceso, no solo su token: la vacante
// necesita saber si ya rindio para dibujar bien el camino.
export async function getMyParticipation(
  processId: string
): Promise<MyParticipation | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("evaluar_participants")
    .select("token, status")
    .eq("process_id", processId)
    .eq("candidate_id", user.id)
    .maybeSingle();

  return (data as MyParticipation | null) ?? null;
}

// Claves de IA para el backoffice. La clave sale enmascarada: el admin
// necesita distinguirlas, no volver a leerlas enteras.
export type AiKeyRow = {
  id: string;
  provider: string;
  label: string;
  masked: string;
  active: boolean;
  last_used_at: string | null;
  failed_at: string | null;
  fail_reason: string | null;
  created_at: string;
};

export async function getAiKeys(): Promise<AiKeyRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("evaluar_ai_keys")
    .select("*")
    .order("created_at", { ascending: false });

  return ((data ?? []) as (AiKeyRow & { api_key: string })[]).map((k) => ({
    id: k.id,
    provider: k.provider,
    label: k.label,
    masked: k.api_key.slice(0, 6) + "…" + k.api_key.slice(-4),
    active: k.active,
    last_used_at: k.last_used_at,
    failed_at: k.failed_at,
    fail_reason: k.fail_reason,
    created_at: k.created_at,
  }));
}
