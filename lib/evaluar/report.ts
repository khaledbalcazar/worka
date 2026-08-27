import "server-only";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { ALL_DIMENSIONS, LIKERT_LABELS } from "@/lib/evaluar/templates";

// Informe por candidato: el puntaje solo no alcanza.
//
// Un "72%" no dice nada sin dos cosas al lado. La primera es contra quién:
// 72% puede ser el mejor de la muestra o la mitad de abajo, y eso lo contesta
// el baremo. La segunda es si la respuesta merece confianza: alguien que puso
// "de acuerdo" en los veinticinco ítems en cuarenta segundos también saca un
// número, y ese número no significa nada. Las dos van juntas acá porque
// mostrar el percentil de una respuesta basura es peor que no mostrar nada.

export type DimensionScore = { raw: number; max: number };

export type NormedDimension = {
  key: string;
  label: string;
  high: string;
  low: string;
  /** Puntaje propio, 0-100. */
  pct: number;
  /** Posición contra la población. null si la muestra es chica. */
  percentile: number | null;
  /** Cuánta gente hay en el baremo de este rasgo. */
  sample: number;
};

export type QualityFlag = {
  kind: "plana" | "apurada" | "inconsistente";
  label: string;
  detail: string;
  severity: "aviso" | "alerta";
};

// Menos de esto no es un baremo, es una anécdota. Con 30 respuestas el
// percentil ya ordena bien; abajo de eso se prefiere no mostrar número antes
// que mostrar uno que se mueve entero con cada candidato nuevo.
export const MIN_MUESTRA = 30;

/** Umbral de segundos por ítem abajo del cual la respuesta es sospechosa. */
const SEG_POR_ITEM = 2.5;

// ── Baremos ────────────────────────────────────────────────────

export type Norms = Record<string, number[]>;

// La distribución de cada rasgo en toda la plataforma, ya ordenada.
//
// Se lee con el cliente administrativo porque un baremo hecho solo con los
// candidatos de una empresa no es un baremo: la mayoría de los procesos tiene
// diez o quince personas. Lo que sale de acá son números agregados, nunca una
// fila de nadie: quién puntuó qué no cruza el límite de la empresa dueña.
//
// Se guarda en memoria un rato porque la recorrida es completa y abrir cinco
// informes seguidos para comparar candidatos es lo normal, no la excepción:
// sin esto serían cinco recorridas idénticas. Un evaluado nuevo mueve el
// percentil de forma imperceptible sobre una muestra de cientos, así que
// media hora de desfasaje no cambia ninguna decisión.
const NORMS_TTL = 30 * 60 * 1000;
let normsCache: { at: number; data: Norms } | null = null;

export async function getNorms(): Promise<Norms> {
  if (normsCache && Date.now() - normsCache.at < NORMS_TTL) {
    return normsCache.data;
  }

  const admin = getAdminClient();
  if (!admin) return {};

  const norms: Norms = {};
  const PAGINA = 1000;
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await admin
      .from("evaluar_participants")
      .select("profile")
      .eq("status", "completado")
      .not("profile", "is", null)
      .range(desde, desde + PAGINA - 1);
    if (error || !data || data.length === 0) break;

    for (const fila of data as { profile: Record<string, DimensionScore> }[]) {
      for (const [key, v] of Object.entries(fila.profile ?? {})) {
        if (!v || v.max <= 0) continue;
        (norms[key] ??= []).push((v.raw / v.max) * 100);
      }
    }
    if (data.length < PAGINA) break;
  }

  for (const key of Object.keys(norms)) norms[key].sort((a, b) => a - b);
  normsCache = { at: Date.now(), data: norms };
  return norms;
}

// Percentil por rango medio: el porcentaje de la población que quedó abajo,
// más la mitad de los que empataron. Sin el empate, el que saca el puntaje
// más común queda arbitrariamente arriba o abajo de todos sus iguales.
export function percentileOf(value: number, sorted: number[]): number | null {
  if (sorted.length < MIN_MUESTRA) return null;
  let abajo = 0;
  let iguales = 0;
  for (const v of sorted) {
    if (v < value) abajo++;
    else if (v === value) iguales++;
    else break;
  }
  return Math.round(((abajo + iguales / 2) / sorted.length) * 100);
}

export function normDimensions(
  profile: Record<string, DimensionScore>,
  norms: Norms
): NormedDimension[] {
  return Object.entries(profile ?? {})
    .filter(([, v]) => v && v.max > 0)
    .map(([key, v]) => {
      const pct = Math.round((v.raw / v.max) * 100);
      const dist = norms[key] ?? [];
      const meta = ALL_DIMENSIONS[key];
      return {
        key,
        label: meta?.label ?? key,
        high: meta?.high ?? "",
        low: meta?.low ?? "",
        pct,
        percentile: percentileOf(pct, dist),
        sample: dist.length,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

// ── Control de calidad de la respuesta ─────────────────────────

export type AnswerRow = {
  question_id: string;
  value: unknown;
  created_at: string;
  question: {
    id: string;
    text: string;
    kind: string;
    dimension: string | null;
    reverse: boolean | null;
    options: string[] | null;
  } | null;
};

// El índice Likert (1-5) de una respuesta, o null si no es de escala.
function likertIndex(value: unknown, options: string[] | null): number | null {
  if (typeof value === "number") return value >= 1 && value <= 5 ? value : null;
  if (typeof value !== "string") return null;
  const lista = options?.length ? options : LIKERT_LABELS;
  const i = lista.indexOf(value);
  return i >= 0 ? i + 1 : null;
}

export function qualityFlags(
  answers: AnswerRow[],
  /** Segundos que tardó cada etapa, de evaluar_participants.stage_times. */
  stageTimes?: Record<string, number>
): QualityFlag[] {
  const flags: QualityFlag[] = [];

  const likert = answers
    .map((a) => ({ a, n: likertIndex(a.value, a.question?.options ?? null) }))
    .filter((x): x is { a: AnswerRow; n: number } => x.n !== null);

  // 1. Respuesta plana. Contestar todo igual es la forma más barata de
  //    terminar un test, y deja un perfil que a simple vista parece normal.
  if (likert.length >= 8) {
    const conteo = new Map<number, number>();
    for (const { n } of likert) conteo.set(n, (conteo.get(n) ?? 0) + 1);
    const proporcion = Math.max(...conteo.values()) / likert.length;
    if (proporcion >= 0.8) {
      flags.push({
        kind: "plana",
        label: "Respondió casi todo igual",
        detail:
          `El ${Math.round(proporcion * 100)}% de las respuestas de escala ` +
          `son la misma opción. El perfil de abajo pierde casi todo su valor.`,
        severity: proporcion >= 0.9 ? "alerta" : "aviso",
      });
    }
  }

  // 2. Velocidad.
  //
  // Se mide con el tiempo real de cada etapa, no con la distancia entre los
  // created_at de las respuestas. Ese era el cálculo anterior y estaba mal de
  // raíz: la corrección inserta todas las respuestas de una etapa dentro de
  // una sola transacción, así que comparten el mismo instante. Los huecos
  // daban cero y la señal saltaba para absolutamente todo el mundo, incluida
  // la gente que se había tomado su tiempo.
  const segundos = Object.values(stageTimes ?? {}).filter(
    (s): s is number => typeof s === "number" && s > 0
  );
  if (segundos.length > 0 && answers.length >= 8) {
    const total = segundos.reduce((s, x) => s + x, 0);
    const porItem = total / answers.length;
    if (porItem < SEG_POR_ITEM) {
      flags.push({
        kind: "apurada",
        label: "Contestó demasiado rápido",
        detail:
          `${porItem.toFixed(1)} segundos por pregunta (${Math.round(total)} ` +
          `segundos para ${answers.length}). Abajo de ${SEG_POR_ITEM} no ` +
          `alcanza ni para leer el ítem.`,
        severity: porItem < 1.5 ? "alerta" : "aviso",
      });
    }
  }

  // 3. Inconsistencia. Cada rasgo tiene ítems derechos e inversos que dicen lo
  //    mismo al revés. Quien contesta pensando en qué queda bien responde
  //    parecido a los dos, y ahí las dos medias se separan.
  const porDim = new Map<string, { der: number[]; inv: number[] }>();
  for (const { a, n } of likert) {
    const dim = a.question?.dimension;
    if (!dim) continue;
    const g = porDim.get(dim) ?? { der: [], inv: [] };
    (a.question?.reverse ? g.inv : g.der).push(n);
    porDim.set(dim, g);
  }

  const brechas: number[] = [];
  const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  for (const { der, inv } of porDim.values()) {
    if (der.length < 2 || inv.length < 2) continue;
    // El ítem inverso se da vuelta sobre la escala de 5 antes de comparar.
    brechas.push(Math.abs(media(der) - (6 - media(inv))));
  }

  if (brechas.length >= 2) {
    const promedio = media(brechas);
    if (promedio >= 1.2) {
      flags.push({
        kind: "inconsistente",
        label: "Respuestas que se contradicen",
        detail:
          `Diferencia media de ${promedio.toFixed(1)} puntos entre ítems que ` +
          `preguntan lo mismo al derecho y al revés. Puede ser distracción o ` +
          `una respuesta armada.`,
        severity: promedio >= 1.8 ? "alerta" : "aviso",
      });
    }
  }

  return flags;
}

// ── Informe completo ───────────────────────────────────────────

export type CandidateReport = {
  dimensions: NormedDimension[];
  quality: QualityFlag[];
  /** Respuestas en video, para que la empresa las mire. */
  videos: { questionId: string; text: string }[];
  answered: number;
  /** Minutos entre la primera y la última respuesta. */
  minutes: number | null;
};

export async function getCandidateReport(
  participantId: string
): Promise<CandidateReport | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  // La política de evaluar_participants ya corta por empresa dueña: si el
  // participante no es de un proceso suyo, esto vuelve vacío.
  const { data: participant } = await supabase
    .from("evaluar_participants")
    .select("id, profile, stage_times")
    .eq("id", participantId)
    .maybeSingle();
  if (!participant) return null;

  const [{ data: answers }, norms] = await Promise.all([
    supabase
      .from("evaluar_answers")
      .select(
        "question_id, value, created_at, question:evaluar_questions(id, text, kind, dimension, reverse, options)"
      )
      .eq("participant_id", participantId)
      .order("created_at"),
    getNorms(),
  ]);

  const filas = (answers ?? []) as unknown as AnswerRow[];
  const tiemposEtapa =
    (participant as { stage_times?: Record<string, number> }).stage_times ?? {};

  return {
    dimensions: normDimensions(
      (participant as { profile: Record<string, DimensionScore> }).profile ?? {},
      norms
    ),
    quality: qualityFlags(filas, tiemposEtapa),
    videos: filas
      .filter((a) => a.question?.kind === "video" && a.question?.id)
      .map((a) => ({
        questionId: a.question!.id,
        text: a.question!.text,
      })),
    answered: filas.length,
    // De los tiempos por etapa, no de los created_at: esos son todos el
    // mismo instante porque la correccion inserta todo junto.
    minutes: (() => {
      const total = Object.values(tiemposEtapa).reduce<number>(
        (s, x) => s + (typeof x === "number" && x > 0 ? x : 0),
        0
      );
      return total > 0 ? Math.max(1, Math.round(total / 60)) : null;
    })(),
  };
}
