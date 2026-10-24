import "server-only";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  ALL_DIMENSIONS,
  LIKERT_DIMENSIONS,
  LIKERT_LABELS,
} from "@/lib/evaluar/templates";
import {
  aEscalaV2,
  contarRespondidas,
  pctParaCortes,
  versionDe,
} from "@/lib/evaluar/puntaje";

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
  /** Puntaje propio, 0-100, en la escala con la que se corrigió. */
  pct: number;
  /** Lectura alta del rasgo (texto `high`), con el corte llevado a su escala. */
  alto: boolean;
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
  // Antes solo entraban los "completado": a quien pasaban a finalista o
  // contratado lo sacaban del baremo justo por ser de los mejores, y la
  // muestra quedaba corrida hacia abajo. Los descartados también entran: un
  // excluyente no cambia lo que la persona contestó en el resto.
  const ESTADOS = ["completado", "finalista", "contratado", "descartado"];
  // scoring_version llega con la 054. Sin la columna, la consulta falla
  // entera, así que se reintenta sin ella (todo es escala 1).
  let columnas = "profile, scoring_version";
  for (let desde = 0; ; desde += PAGINA) {
    let { data, error } = await admin
      .from("evaluar_participants")
      .select(columnas)
      .in("status", ESTADOS)
      .not("profile", "is", null)
      .range(desde, desde + PAGINA - 1);
    if (error && columnas !== "profile") {
      columnas = "profile";
      ({ data, error } = await admin
        .from("evaluar_participants")
        .select(columnas)
        .in("status", ESTADOS)
        .not("profile", "is", null)
        .range(desde, desde + PAGINA - 1));
    }
    if (error || !data || data.length === 0) break;

    for (const fila of data as unknown as {
      profile: Record<string, DimensionScore>;
      scoring_version?: number;
    }[]) {
      const version = versionDe(fila.scoring_version);
      for (const [key, v] of Object.entries(fila.profile ?? {})) {
        if (!v || v.max <= 0) continue;
        // Todo el baremo en la escala 2, para que v1 y v2 se comparen.
        const c = aEscalaV2(v, LIKERT_DIMENSIONS.has(key), version);
        if (c.max <= 0) continue;
        (norms[key] ??= []).push(Math.round((c.raw / c.max) * 100));
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
  norms: Norms,
  /** Escala con la que se corrigió este participante (1 o 2). */
  version = 1
): NormedDimension[] {
  return Object.entries(profile ?? {})
    .filter(([, v]) => v && v.max > 0)
    .map(([key, v]) => {
      const pct = Math.round((v.raw / v.max) * 100);
      // El percentil se busca en la escala del baremo (la 2), y redondeado
      // igual que el baremo: comparar un valor redondeado contra valores sin
      // redondear corría los empates para un lado.
      const comun = aEscalaV2(v, LIKERT_DIMENSIONS.has(key), version);
      const pctComun = comun.max > 0 ? Math.round((comun.raw / comun.max) * 100) : pct;
      const dist = norms[key] ?? [];
      const meta = ALL_DIMENSIONS[key];
      return {
        key,
        label: meta?.label ?? key,
        high: meta?.high ?? "",
        low: meta?.low ?? "",
        pct,
        alto:
          pctParaCortes(pct, LIKERT_DIMENSIONS.has(key) ? version : 1) >= 60,
        percentile: percentileOf(pctComun, dist),
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
  /** Preguntas contestadas, de las entregadas (`total`). */
  answered: number;
  total: number;
  /** Minutos entre la primera y la última respuesta. */
  minutes: number | null;
};

export async function getCandidateReport(
  participantId: string
): Promise<CandidateReport | null> {
  const supabase = await getServerClient();
  if (!supabase) return demoReport(participantId);
  const user = await getCurrentUser();
  if (!user) return null;

  // La política de evaluar_participants ya corta por empresa dueña: si el
  // participante no es de un proceso suyo, esto vuelve vacío.
  // "*" y no la lista de columnas: scoring_version recién existe con la 054,
  // y pedirla por nombre antes de eso haría fallar el informe entero.
  const { data: participant } = await supabase
    .from("evaluar_participants")
    .select("*")
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
      norms,
      versionDe((participant as { scoring_version?: number }).scoring_version)
    ),
    quality: qualityFlags(filas, tiemposEtapa),
    videos: filas
      .filter((a) => a.question?.kind === "video" && a.question?.id)
      .map((a) => ({
        questionId: a.question!.id,
        text: a.question!.text,
      })),
    ...(() => {
      const r = contarRespondidas(filas);
      return { answered: r.respondidas, total: r.total };
    })(),
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

// Modo demo: el perfil sale del acumulado por rasgo del candidato de
// ejemplo. Sin baremo (no hay población), así que sin percentiles: mostrar
// uno inventado sería justo lo que el informe dice que no hay que hacer.
async function demoReport(participantId: string): Promise<CandidateReport | null> {
  const { demoProcessDetail, DEMO_PROCESS_ID } = await import("@/lib/evaluar/demo");
  const { ALL_DIMENSIONS } = await import("@/lib/evaluar/templates");
  const detail = demoProcessDetail(DEMO_PROCESS_ID);
  const p = detail?.participants.find((x) => x.id === participantId);
  if (!detail || !p) return null;
  const total = detail.stages.reduce((s, st) => s + st.questions.length, 0);
  const dimensions: NormedDimension[] = Object.entries(p.profile ?? {})
    .filter(([, v]) => v.max > 0)
    .map(([key, v]) => {
      const d = ALL_DIMENSIONS[key];
      const pct = Math.round((v.raw / v.max) * 100);
      return { key, label: d?.label ?? key, high: d?.high ?? "", low: d?.low ?? "", pct, alto: pct >= 50, percentile: null, sample: 0 };
    });
  const minutes =
    p.started_at && p.completed_at ? Math.round((Date.parse(p.completed_at) - Date.parse(p.started_at)) / 60000) : null;
  return { dimensions, quality: [], videos: [], answered: p.completed_at ? total : 0, total, minutes };
}
