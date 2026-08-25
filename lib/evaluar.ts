import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { TRIAL_DAYS } from "@/lib/evaluar-config";

export { TRIAL_DAYS };

// Capa de datos de Worka Evaluar. Igual que lib/data.ts, las páginas solo
// importan de acá.


export type EvaluarStatus = "prueba" | "activa" | "vencida" | "cancelada";

export type EvaluarAccount = {
  company_id: string;
  status: EvaluarStatus;
  plan: string;
  price_gs: number;
  trial_ends_at: string;
  paid_until: string | null;
  created_at: string;
};

export type EvaluarProcess = {
  id: string;
  company_id: string;
  job_id: string | null;
  title: string;
  description: string;
  closing_message: string;
  status: "borrador" | "activo" | "cerrado";
  created_at: string;
};

export type EvaluarStage = {
  id: string;
  process_id: string;
  position: number;
  title: string;
  description: string;
  kind: "cuestionario" | "tarea" | "entrevista";
  minutes: number;
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
  score: number | null;
  max_score: number | null;
  outcome_note: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

// ── Suscripción ────────────────────────────────────────────────

// Estado real de la cuenta, ya resuelto contra el reloj: una cuenta guardada
// como "prueba" con la fecha vencida no habilita nada, y preguntarlo en cada
// pantalla es la forma de que se cuele un acceso gratis para siempre.
export type AccessState = {
  account: EvaluarAccount | null;
  active: boolean;
  inTrial: boolean;
  daysLeft: number;
};

export function resolveAccess(account: EvaluarAccount | null): AccessState {
  if (!account) {
    return { account: null, active: false, inTrial: false, daysLeft: 0 };
  }

  const now = Date.now();
  const trialEnd = new Date(account.trial_ends_at).getTime();
  const paidEnd = account.paid_until
    ? new Date(account.paid_until).getTime()
    : 0;

  const inTrial = account.status === "prueba" && trialEnd > now;
  const paid = account.status === "activa" && paidEnd > now;
  const daysLeft = Math.max(
    0,
    Math.ceil(((inTrial ? trialEnd : paidEnd) - now) / 86_400_000)
  );

  return { account, active: inTrial || paid, inTrial, daysLeft };
}

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

export type ProcessDetail = {
  process: EvaluarProcess & { job: { id: string; title: string } | null };
  stages: (EvaluarStage & { questions: EvaluarQuestion[] })[];
  participants: EvaluarParticipant[];
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

  const [{ data: stages }, { data: participants }] = await Promise.all([
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

// ── Tablero de decisión ────────────────────────────────────────

export type BoardCandidate = EvaluarParticipant & {
  percent: number | null;
  answers: { question_id: string; value: unknown; score: number }[];
  notes: { id: string; body: string; rating: number | null; created_at: string }[];
};

export type BoardData = {
  process: EvaluarProcess;
  stages: (EvaluarStage & { questions: EvaluarQuestion[] })[];
  candidates: BoardCandidate[];
};

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
      // El porcentaje se calcula sobre lo que la persona efectivamente rindió,
      // no sobre el total del proceso: comparar a alguien que hizo dos etapas
      // con alguien que hizo una sobre la misma base sería injusto.
      percent:
        p.max_score && p.max_score > 0
          ? Math.round(((p.score ?? 0) / p.max_score) * 100)
          : null,
      answers: answerMap.get(p.id) ?? [],
      notes: noteMap.get(p.id) ?? [],
    }))
    // Mejor puntaje primero; los que no rindieron todavía, al final.
    .sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1));

  return { process: detail.process, stages: detail.stages, candidates };
}

// ── Enlace con Worka Empleos ───────────────────────────────────

// ¿Esta vacante tiene evaluación? Lo consulta la página pública de la vacante
// para ofrecer "empezar la evaluación" ahí mismo.
export async function getProcessForJob(
  jobId: string
): Promise<{ id: string; title: string; stage_count: number } | null> {
  const supabase = await getServerClient();
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
export async function getMyParticipantToken(
  processId: string
): Promise<string | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("evaluar_participants")
    .select("token")
    .eq("process_id", processId)
    .eq("candidate_id", user.id)
    .maybeSingle();

  return (data as { token: string } | null)?.token ?? null;
}
