import { getTemplate } from "@/lib/evaluar/templates";
import type {
  BoardData,
  EvaluarParticipant,
  EvaluarQuestion,
  EvaluarStage,
  PanelActivity,
  ProcessDetail,
  ProcessRow,
} from "@/lib/evaluar";

// Datos de ejemplo de Worka Evaluar para el modo demo (sin Supabase).
//
// Antes el panel en demo arrancaba vacío y no había forma de ver el proceso,
// el tablero ni el informe sin una base: imposible revisar el diseño. Las
// preguntas salen de las plantillas reales y los puntajes son fijos (sin
// azar) para que la vista no cambie en cada recarga. Nada de esto se guarda.

const DAY = 86_400_000;
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * 3_600_000).toISOString();

export const DEMO_PROCESS_ID = "demo-cajero";
const DRAFT_ID = "demo-repositor";

function stageFrom(key: string, processId: string, position: number, timed: boolean): EvaluarStage & { questions: EvaluarQuestion[] } {
  const t = getTemplate(key)!;
  const id = `${processId}-s${position}`;
  return {
    id,
    process_id: processId,
    position,
    title: t.name,
    description: t.summary,
    kind: "cuestionario",
    minutes: t.minutes,
    timed,
    template_key: t.key,
    intro: t.intro,
    demo: { text: t.demo.text, options: t.demo.options, answer: t.demo.answer, explain: t.demo.explain },
    questions: t.questions.map((q, i) => ({
      id: `${id}-q${i + 1}`,
      stage_id: id,
      position: i + 1,
      kind: q.kind,
      text: q.text,
      options: q.options ?? [],
      correct: q.correct ?? null,
      weight: q.weight ?? 1,
      knockout: false,
      dimension: q.dimension ?? null,
      option_scores: q.optionScores ?? null,
      reverse: q.reverse ?? false,
      figure: q.figure,
    })),
  };
}

const process: ProcessDetail["process"] = {
  id: DEMO_PROCESS_ID,
  company_id: "demo",
  job_id: "j1",
  job: { id: "j1", title: "Cajero/a para sucursal centro" },
  title: "Cajero/a · Sucursal Centro",
  description: "Buscamos cajeros/as para el turno mañana y tarde de la sucursal centro.",
  closing_message: "¡Gracias! Si avanzás, te escribimos por WhatsApp esta semana.",
  status: "activo",
  created_at: ago(9),
  theme: "sobrio",
  deadline_at: new Date(Date.now() + 5 * DAY).toISOString(),
  archived: false,
  // Lo que más importa para el puesto (0-100 por rasgo).
  ideal_profile: { numerico: 70, servicio: 85, integridad_sjt: 90, detalle: 80, presion: 75 },
  org_unit: "Sucursal Centro",
  department: "Cajas",
};

const stages = [
  stageFrom("razonamiento", DEMO_PROCESS_ID, 1, true),
  stageFrom("sjt_atencion", DEMO_PROCESS_ID, 2, false),
  stageFrom("estilo_laboral", DEMO_PROCESS_ID, 3, false),
];

const maxOf = (stage: (typeof stages)[number]) => stage.questions.length * 4;
const TOTAL_MAX = stages.reduce((s, st) => s + maxOf(st), 0);

// [nombre, estado, etapa, % total, perfil por rasgo (0-1), días desde el alta, ciudad]
const PEOPLE: [string, EvaluarParticipant["status"], number, number | null, Record<string, number>, number, string][] = [
  ["Lucía Martínez", "completado", 3, 0.86, { numerico: 0.8, servicio: 0.9, integridad_sjt: 0.95, detalle: 0.85, presion: 0.8 }, 6, "Asunción"],
  ["Rodrigo Páez", "completado", 3, 0.78, { numerico: 0.9, servicio: 0.7, integridad_sjt: 0.8, detalle: 0.75, presion: 0.7 }, 5, "San Lorenzo"],
  ["Ana Giménez", "finalista", 3, 0.81, { numerico: 0.7, servicio: 0.85, integridad_sjt: 0.9, detalle: 0.8, presion: 0.75 }, 8, "Asunción"],
  ["Marcos Benítez", "completado", 3, 0.61, { numerico: 0.55, servicio: 0.65, integridad_sjt: 0.7, detalle: 0.5, presion: 0.6 }, 4, "Luque"],
  ["Sofía Ramírez", "en_curso", 2, null, { numerico: 0.75 }, 2, "Fernando de la Mora"],
  ["Pablo González", "en_curso", 1, null, {}, 1, "Lambaré"],
  ["Carla Duarte", "invitado", 0, null, {}, 1, "Asunción"],
  ["Jorge Villalba", "descartado", 3, 0.42, { numerico: 0.4, servicio: 0.45, integridad_sjt: 0.35, detalle: 0.4, presion: 0.5 }, 7, "Capiatá"],
];

const participants: EvaluarParticipant[] = PEOPLE.map(([name, status, stage, pct, prof, days, city], i) => {
  const done = pct !== null;
  return {
    id: `demo-p${i + 1}`,
    process_id: DEMO_PROCESS_ID,
    candidate_id: i % 3 === 0 ? `cand-${i}` : null,
    full_name: name,
    email: `${name.split(" ")[0].toLowerCase()}@ejemplo.com`,
    phone: null,
    token: `demo-token-${i + 1}`,
    source: i % 3 === 0 ? "worka" : "invitado",
    status,
    stage_index: stage,
    city,
    cv_url: null,
    score: done ? Math.round(pct * TOTAL_MAX) : null,
    max_score: done ? TOTAL_MAX : null,
    outcome_note: status === "descartado" ? "No alcanzó lo mínimo en integridad." : null,
    reject_reason: status === "descartado" ? "perfil" : null,
    started_at: status === "invitado" ? null : ago(days - 0.2),
    completed_at: done ? ago(days - 1) : null,
    created_at: ago(days),
    profile: Object.fromEntries(Object.entries(prof).map(([k, v]) => [k, { raw: Math.round(v * 40), max: 40 }])),
    scoring_version: 3,
  };
});

export function demoProcessRows(): ProcessRow[] {
  const draft: ProcessRow = {
    id: DRAFT_ID,
    company_id: "demo",
    job_id: null,
    job: null,
    title: "Repositor/a de mercaderías",
    description: "",
    closing_message: "",
    status: "borrador",
    created_at: ago(1),
    archived: false,
    stage_count: 2,
    participant_count: 0,
    esDueno: true,
  };
  return [
    { ...process, stage_count: stages.length, participant_count: participants.length, esDueno: true },
    draft,
  ];
}

export function demoProcessDetail(id: string): ProcessDetail | null {
  if (id === DEMO_PROCESS_ID) return { process, esDueno: true, stages, participants, members: [] };
  if (id === DRAFT_ID) {
    const draft = demoProcessRows()[1];
    return {
      process: draft,
      esDueno: true,
      stages: [stageFrom("sjt_atencion", DRAFT_ID, 1, false), stageFrom("atencion_detalle", DRAFT_ID, 2, true)],
      participants: [],
      members: [],
    };
  }
  return null;
}

export function demoActivity(): PanelActivity[] {
  return [
    { at: ago(0, 2), message: "Sofía Ramírez terminó la etapa «Razonamiento (psicométrico)»", processTitle: process.title },
    { at: ago(0, 5), message: "Pablo González empezó la evaluación", processTitle: process.title },
    { at: ago(1), message: "Marcos Benítez completó todas las etapas", processTitle: process.title },
    { at: ago(1, 3), message: "Se invitó a Carla Duarte", processTitle: process.title },
  ];
}

export function demoBoardNotes(): Record<string, BoardData["candidates"][number]["notes"]> {
  return {
    "demo-p1": [{ id: "n1", body: "Muy buena en la entrevista telefónica. Disponible ya.", rating: 5, created_at: ago(2) }],
    "demo-p3": [{ id: "n2", body: "Experiencia previa en caja en otra cadena.", rating: 4, created_at: ago(3) }],
  };
}

