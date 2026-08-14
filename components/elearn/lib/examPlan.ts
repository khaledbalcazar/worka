// Cuenta regresiva al examen y plan de estudio ADAPTATIVO: se recalcula
// según los días que falten. No es el plan fijo de 6 semanas del manual —
// si quedan 10 días, arma un sprint de 10 días priorizando lo que más pesa.
//
// La prioridad sale de la distribución real del banco de preguntas del
// manual (Parte XV), que es la mejor evidencia de qué se pregunta más:
// Ley 1266 = 65 preguntas, Constitución 25, Ley 7445 25, Decretos 20,
// Código Civil 20, Ley 1/1992 20, Ley 5282 15, Ley 6618 + RM 983 15.

export interface ExamConfig {
  examDate: string | null; // ISO (solo día)
  dailyMinutes: number;
}

const KEY = 'dgrec_exam_config_v1';

const defaultConfig: ExamConfig = { examDate: null, dailyMinutes: 120 };

export function loadExamConfig(): ExamConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultConfig;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

export function saveExamConfig(cfg: ExamConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    // localStorage no disponible: no es crítico.
  }
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(iso: string): number {
  const a = new Date(todayIso() + 'T00:00:00Z').getTime();
  const b = new Date(iso + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  });
}

// ── Bloques de estudio, en orden de peso en el examen ──
interface StudySession {
  label: string;
  chapterId?: string; // curso del Temario Oficial al que enlaza
  minutes: number;
}

const SESSIONS: StudySession[] = [
  { label: 'Ley 1266 — Organización, libros y formalidades de las actas', chapterId: 'oficial-5', minutes: 60 },
  { label: 'Ley 1266 — Nacimientos: denuncia vs. declaración y plazos', chapterId: 'oficial-5', minutes: 55 },
  { label: 'Ley 1266 — Matrimonio: oposición, testigos e in extremis', chapterId: 'oficial-5', minutes: 55 },
  { label: 'Ley 1266 — Defunciones y los tres remedios registrales', chapterId: 'oficial-5', minutes: 55 },
  { label: 'Constitución Nacional — los cinco ejes del acta', chapterId: 'oficial-1', minutes: 50 },
  { label: 'Ley 7445/2025 — principios, concurso, derechos y prohibiciones', chapterId: 'oficial-2', minutes: 50 },
  { label: 'Decretos 19.102/2002 y 3080/2015 — estructura y competencias', chapterId: 'oficial-7', minutes: 45 },
  { label: 'Código Civil — nombre, matrimonio, nulidad y filiación', chapterId: 'oficial-3', minutes: 50 },
  { label: 'Ley 1/1992 — igualdad, régimen patrimonial y unión de hecho', chapterId: 'oficial-4', minutes: 45 },
  { label: 'Ley 5282/2014 — transparencia y procedimiento de acceso', chapterId: 'oficial-6', minutes: 35 },
  { label: 'Ley 6618/2020 y RM 983/2017 — estado civil y legajo', chapterId: 'oficial-10', minutes: 35 },
  { label: 'Misión, visión, historia y organigrama de la DGREC', chapterId: 'oficial-11', minutes: 30 }
];

export type PlanPhase = 'base' | 'refuerzo' | 'final';

export interface PlanTask {
  label: string;
  minutes: number;
  tab?: string;       // pestaña del aula a la que lleva
  chapterId?: string; // curso concreto, si aplica
}

export interface PlanDay {
  index: number;
  date: string;
  phase: PlanPhase;
  title: string;
  tasks: PlanTask[];
}

const PHASE_LABEL: Record<PlanPhase, string> = {
  base: 'Base — contenido nuevo',
  refuerzo: 'Refuerzo — datos duros y puntos débiles',
  final: 'Cierre — simulacros y entrevista'
};

export function phaseLabel(phase: PlanPhase): string {
  return PHASE_LABEL[phase];
}

// Reparte los elementos en n grupos lo más parejos posible, respetando el orden.
function chunkEvenly<T>(items: T[], groups: number): T[][] {
  if (groups <= 0) return [items];
  const out: T[][] = Array.from({ length: groups }, () => []);
  const base = Math.floor(items.length / groups);
  let extra = items.length % groups;
  let cursor = 0;
  for (let g = 0; g < groups; g++) {
    const take = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    out[g] = items.slice(cursor, cursor + take);
    cursor += take;
  }
  return out;
}

// Hábitos diarios: lo que rinde todos los días, sin importar la fase.
function dailyHabits(hasErrors: boolean): PlanTask[] {
  const tasks: PlanTask[] = [
    { label: 'Repaso de tarjetas vencidas (Leitner)', minutes: 15, tab: 'flashcards' }
  ];
  if (hasErrors) {
    tasks.push({ label: 'Repaso de errores del simulacro', minutes: 10, tab: 'quiz' });
  }
  return tasks;
}

// Genera el plan completo desde hoy hasta el día del examen.
export function generatePlan(daysRemaining: number, hasErrors: boolean): PlanDay[] {
  const total = Math.max(1, daysRemaining);
  const start = todayIso();

  // El último día no se estudia contenido nuevo: se repasa y se descansa.
  const studyDays = Math.max(1, total - 1);
  // Las tres fases deben sumar exactamente studyDays, incluso con muy pocos
  // días: primero se garantiza la base, y el resto se reparte si sobra.
  const baseDays = Math.min(studyDays, Math.max(1, Math.round(studyDays * 0.55)));
  const refuerzoDays = Math.min(studyDays - baseDays, Math.max(1, Math.round(studyDays * 0.25)));
  const finalDays = studyDays - baseDays - refuerzoDays;

  const groups = chunkEvenly(SESSIONS, baseDays);
  const days: PlanDay[] = [];
  let i = 0;

  // Fase base: contenido nuevo, lo más pesado primero.
  for (let d = 0; d < baseDays; d++) {
    const sessions = groups[d] ?? [];
    days.push({
      index: i,
      date: addDaysIso(start, i),
      phase: 'base',
      title: sessions.length ? sessions[0].label.split(' — ')[0] : 'Repaso libre',
      tasks: [
        ...sessions.map((s) => ({
          label: s.label,
          minutes: s.minutes,
          tab: 'lessons',
          chapterId: s.chapterId
        })),
        ...dailyHabits(hasErrors)
      ]
    });
    i++;
  }

  // Fase refuerzo: datos duros, quiz por bloque y los temas flojos.
  const refuerzoFocus = [
    { label: 'Hoja de datos duros: plazos y números', minutes: 30, tab: 'harddata' },
    { label: 'Quiz por bloques: Ley 1266 (el que más pesa)', minutes: 30, tab: 'quiz' },
    { label: 'Quiz por bloques: Constitución y Ley 7445', minutes: 30, tab: 'quiz' },
    { label: 'Guaraní: frases de atención al ciudadano', minutes: 25, tab: 'guarani' },
    { label: 'Ofimática: Word, Excel, PowerPoint y Outlook', minutes: 25, tab: 'ofimatica' },
    { label: 'Quiz por bloques: Código Civil y Ley 1/1992', minutes: 30, tab: 'quiz' }
  ];
  const refuerzoGroups = chunkEvenly(refuerzoFocus, refuerzoDays);
  for (let d = 0; d < refuerzoDays; d++) {
    days.push({
      index: i,
      date: addDaysIso(start, i),
      phase: 'refuerzo',
      title: 'Datos duros y puntos débiles',
      tasks: [...(refuerzoGroups[d] ?? []), ...dailyHabits(hasErrors)]
    });
    i++;
  }

  // Fase final: simulacros completos y entrevista.
  const finalFocus: PlanTask[][] = [
    [
      { label: 'Simulacro completo cronometrado', minutes: 60, tab: 'quiz' },
      { label: 'Revisar cada fallo y anotar el porqué', minutes: 25, tab: 'quiz' }
    ],
    [
      { label: 'Preparación de la entrevista: respuestas en voz alta', minutes: 40, tab: 'plan' },
      { label: 'Evaluador Feynman: explicá 2 temas en voz alta', minutes: 30, tab: 'feynman' }
    ],
    [
      { label: 'Segundo simulacro completo', minutes: 60, tab: 'quiz' },
      { label: 'Repaso de los 9 verbos, misión y organigrama', minutes: 25, tab: 'lessons', chapterId: 'oficial-11' }
    ]
  ];
  for (let d = 0; d < finalDays; d++) {
    days.push({
      index: i,
      date: addDaysIso(start, i),
      phase: 'final',
      title: 'Simulacro y entrevista',
      tasks: [...(finalFocus[d % finalFocus.length] ?? []), ...dailyHabits(hasErrors)]
    });
    i++;
  }

  // Último día: repaso ligero y logística. Nada nuevo.
  if (total > 1) {
    days.push({
      index: i,
      date: addDaysIso(start, i),
      phase: 'final',
      title: 'Víspera: repaso ligero y logística',
      tasks: [
        { label: 'Leer solo la hoja de datos duros (sin estudiar temas nuevos)', minutes: 30, tab: 'harddata' },
        { label: 'Repaso rápido de tarjetas en caja 1 y 2', minutes: 20, tab: 'flashcards' },
        { label: 'Preparar documentos, ropa y ruta al local del examen', minutes: 20 },
        { label: 'Dormir bien: rinde más que estudiar de madrugada', minutes: 0 }
      ]
    });
  }

  return days;
}
