// Cálculos de Worka Evaluar que no dependen de la base ni del navegador.
//
// Viven acá, sin un solo import, para que las pruebas de tests/evaluar los
// corran con `node --test` tal cual, sin compilar nada. Lo que se muestra en
// el tablero, en el informe y en el Excel sale de estas funciones: si un
// número cambia, cambia acá y la prueba lo marca.

export type DimensionScores = Record<string, { raw: number; max: number }>;

// ── Porcentajes ────────────────────────────────────────────────

/** Puntos sobre máximo, 0-100. Null cuando no hay nada que medir. */
export function percentOf(
  score: number | null | undefined,
  max: number | null | undefined
): number | null {
  if (!max || max <= 0) return null;
  return Math.round(((score ?? 0) / max) * 100);
}

/** Porcentaje de un rasgo. Null si el rasgo no tiene máximo. */
export function dimensionPct(
  v: { raw: number; max: number } | null | undefined
): number | null {
  if (!v || v.max <= 0) return null;
  return Math.round((v.raw / v.max) * 100);
}

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

/** Cuántos de los rasgos que pidió la empresa rindió la persona. */
export function fitCoverage(
  profile: DimensionScores,
  ideal: Record<string, number> | undefined
): { rendidos: number; pedidos: number } {
  const claves = Object.keys(ideal ?? {}).filter((k) => (ideal![k] ?? 0) > 0);
  return {
    rendidos: claves.filter((k) => (profile[k]?.max ?? 0) > 0).length,
    pedidos: claves.length,
  };
}

// ── Exportación ────────────────────────────────────────────────

// Una celda de CSV para Excel en español (separador punto y coma).
//
// Además de las comillas, neutraliza las fórmulas: el nombre y el email los
// escribe el candidato, y una celda que empieza con "=" Excel la ejecuta al
// abrir el archivo. Con un apóstrofo adelante se lee como texto.
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// ── Correos ────────────────────────────────────────────────────

/** Escapa texto que va dentro del HTML de un correo. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Historial ──────────────────────────────────────────────────

// La línea de tiempo se escribe para el candidato ("Completaste la etapa…").
// En el panel de la empresa esas mismas filas tienen que contar qué hizo
// otra persona, no hablarle a quien lee.
export function mensajeParaEmpresa(
  kind: string,
  message: string,
  nombre: string | null | undefined
): string {
  const quien = nombre?.trim() || "Un candidato";
  const etapa = message.match(/etapa\s+"([^"]+)"/i)?.[1];

  switch (kind) {
    case "inicio":
      return `${quien} empezó la evaluación.`;
    case "etapa":
      return etapa
        ? `${quien} completó la etapa «${etapa}».`
        : `${quien} completó una etapa.`;
    case "descartado":
      return etapa
        ? `${quien} quedó fuera en la etapa «${etapa}» por un requisito excluyente.`
        : `${quien} quedó fuera del proceso.`;
    case "finalista":
      return `${quien} pasó a la etapa final.`;
    case "contratado":
      return `${quien} fue seleccionado/a.`;
    case "completado":
      return `${quien} volvió a quedar para revisar.`;
    default:
      return `${quien}: ${message}`;
  }
}

// ── Tipos de pregunta ──────────────────────────────────────────

export const KIND_LABEL: Record<string, string> = {
  unica: "Opción única",
  multiple: "Opción múltiple",
  texto: "Respuesta escrita",
  escala: "Escala 1 a 5",
  numero: "Número",
  likert: "Escala de acuerdo",
  video: "Video",
};

export type ModoCorreccion = "correcta" | "por_opcion" | "rasgo" | "manual";

// Cómo se corrige una pregunta. El editor decía "la juzga el evaluador" de
// todo lo que no tuviera respuesta correcta, incluidos los ítems de las
// plantillas, que se corrigen solos por rasgo o por puntos por opción.
export function modoCorreccion(q: {
  kind: string;
  correct: unknown;
  option_scores?: unknown;
  dimension?: string | null;
}): ModoCorreccion {
  if (q.kind === "likert") return "rasgo";
  if (q.option_scores) return "por_opcion";
  if (q.correct !== null && q.correct !== undefined) return "correcta";
  return "manual";
}

// ── Modelo de referencia de la corrección ──────────────────────
//
// Copia en TypeScript de lo que hace evaluar_submit_stage (migración 053)
// con las respuestas de UNA etapa. No corre en producción: la corrección es
// de la base. Está para fijar con casos de referencia qué número tiene que
// salir, y para que un cambio en la función de la base tenga contra qué
// compararse.

export type PreguntaRef = {
  id: string;
  kind: string;
  correct?: unknown;
  option_scores?: Record<string, number> | null;
  weight?: number;
  knockout?: boolean;
  dimension?: string | null;
  reverse?: boolean;
};

export type EtapaCorregida = {
  /** Puntos que suma la etapa al puntaje (todo menos likert). */
  total: number;
  max: number;
  knocked: boolean;
  profile: DimensionScores;
  /** Puntos por pregunta, como quedan en evaluar_answers.score. */
  scores: Record<string, number>;
};

function igualJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Un valor de likert válido: entero de 1 a 5. Fuera de eso, sin respuesta. */
export function likertValido(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5
    ? v
    : null;
}

export function corregirEtapa(
  preguntas: PreguntaRef[],
  respuestas: Record<string, unknown>,
  perfilPrevio: DimensionScores = {}
): EtapaCorregida {
  const profile: DimensionScores = Object.fromEntries(
    Object.entries(perfilPrevio).map(([k, v]) => [k, { ...v }])
  );
  const scores: Record<string, number> = {};
  let total = 0;
  let max = 0;
  let knocked = false;

  for (const q of preguntas) {
    const value = respuestas[q.id];
    let points: number | null = null;
    let itemMax: number | null = null;

    if (q.kind === "video") {
      // El video no puntúa y su respuesta la escribe la subida, no la entrega.
      continue;
    } else if (q.kind === "likert") {
      const n = likertValido(value);
      if (n !== null) points = q.reverse ? 6 - n : n;
      itemMax = 5;
    } else if (q.option_scores && value !== undefined && value !== null) {
      points = q.option_scores[String(value)] ?? 0;
      itemMax = Math.max(0, ...Object.values(q.option_scores));
    } else if (q.correct !== null && q.correct !== undefined) {
      const ok = value !== undefined && value !== null && igualJson(value, q.correct);
      const w = q.weight ?? 1;
      points = ok ? w : 0;
      itemMax = w;
      if (!ok && q.knockout) knocked = true;
    }

    if (q.kind !== "likert" && itemMax !== null) {
      total += points ?? 0;
      max += itemMax;
    }

    if (q.dimension && itemMax !== null) {
      const prev = profile[q.dimension] ?? { raw: 0, max: 0 };
      profile[q.dimension] = {
        raw: prev.raw + (points ?? 0),
        max: prev.max + itemMax,
      };
    }

    scores[q.id] = points ?? 0;
  }

  return { total, max, knocked, profile, scores };
}

export type ResultadoEntrega = "corregir" | "repetida" | "fuera_de_orden" | "invalida";

// Qué hace la base con una entrega, según en qué etapa está la persona.
//
// Antes cualquier etapa del proceso se aceptaba en cualquier momento, y cada
// entrega SUMABA al puntaje: un doble clic, o el reloj que vence justo cuando
// se toca "Terminar", contaba la etapa dos veces y salteaba la siguiente.
export function validarEntrega(
  etapasEnOrden: string[],
  stageIndex: number,
  stageId: string
): ResultadoEntrega {
  const pos = etapasEnOrden.indexOf(stageId);
  if (pos < 0) return "invalida";
  if (pos < stageIndex) return "repetida";
  if (pos > stageIndex) return "fuera_de_orden";
  return "corregir";
}
