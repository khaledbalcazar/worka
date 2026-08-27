import type { Template } from "./templates";
import { LIKERT_LABELS } from "./likert";

// Worka Confianza · Evaluación de integridad laboral
//
// ── Qué es y qué no es ────────────────────────────────────────
//
// Mide ACTITUDES ante situaciones de trabajo: qué le parece aceptable o
// inaceptable a la persona. No pregunta si robó, si se drogó o si agredió a
// alguien, y esa decisión es deliberada por tres motivos.
//
// El primero es legal: un cuestionario que pide admitir delitos convierte a
// la empresa en depositaria de una confesión, con todo lo que eso implica si
// después hay un juicio laboral. El segundo es de validez: quien efectivamente
// robó no lo va a marcar en un formulario, así que el ítem confesional filtra
// candor, no conducta. El tercero es que la investigación sobre conductas
// contraproducentes en el trabajo muestra que la vía actitudinal predice tan
// bien o mejor, sin ninguno de esos dos costos.
//
// ── Sobre los factores pedidos ────────────────────────────────
//
// Dos de los nueve —Mentira y Distorsión— no son factores de riesgo sino
// escalas de validez: sirven para saber si el resto del perfil merece
// confianza. Van marcadas como tales y se leen distinto.
//
// "Alcohol y Drogas" está planteado como seguridad en el trabajo: qué opina
// la persona de trabajar o conducir bajo efectos, y de encubrir a un
// compañero que lo hace. NO indaga sobre consumo personal. El consumo es un
// dato de salud, protegido, y preguntarlo en una selección expone a la
// empresa a un reclamo por discriminación que ningún puntaje justifica.
//
// ── Cómo se lee ───────────────────────────────────────────────
//
// El resultado es un INDICADOR, no un veredicto. Nunca dice que alguien es
// deshonesto: dice que sus respuestas se parecen más o menos a las de quienes
// toleran ciertas conductas. Por eso no puede descartar solo, y la pantalla
// lo dice donde se decide.
//
// Todos los ítems son originales. No reproducen ningún instrumento
// licenciado.

export const DIMENSIONES_INTEGRIDAD = [
  {
    key: "veracidad",
    label: "Veracidad",
    validez: true,
    high: "Responde de forma creíble, admitiendo faltas menores comunes.",
    low: "Se muestra impecable en todo, incluso en lo que casi nadie cumple.",
  },
  {
    key: "distorsion",
    label: "Distorsión de la imagen",
    validez: true,
    high: "Perfil consistente entre preguntas equivalentes.",
    low: "Contesta buscando quedar bien: el resto del perfil pierde valor.",
  },
  {
    key: "integridad",
    label: "Integridad general",
    high: "Sostiene lo correcto aunque nadie mire y aunque cueste.",
    low: "Acepta atajos cuando la ocasión los hace fáciles.",
  },
  {
    key: "bienes",
    label: "Cuidado de los bienes",
    high: "Trata lo de la empresa como ajeno y lo cuida.",
    low: "Justifica llevarse cosas chicas o usarlas para sí.",
  },
  {
    key: "conflicto",
    label: "Manejo del conflicto",
    high: "Resuelve los roces hablando, aun con la sangre caliente.",
    low: "Ve la reacción fuerte como una respuesta legítima.",
  },
  {
    key: "seguridad",
    label: "Seguridad en el trabajo",
    high: "No transa con las normas que protegen a la gente.",
    low: "Relativiza las reglas de seguridad cuando apuran los tiempos.",
  },
  {
    key: "trato",
    label: "Respeto en el trato",
    high: "No admite el maltrato ni el hostigamiento entre compañeros.",
    low: "Naturaliza el maltrato como parte del ambiente de trabajo.",
  },
  {
    key: "limites",
    label: "Límites personales",
    high: "Distingue con claridad qué es fuera de lugar en el trabajo.",
    low: "Minimiza comentarios y acercamientos incómodos.",
  },
  {
    key: "informacion",
    label: "Uso responsable de la información",
    high: "Cuida los datos, las claves y lo confidencial.",
    low: "Es laxo con la información y los accesos que le confían.",
  },
] as const;

// Ítems. `reverse: true` marca los que, al estar de acuerdo, indican riesgo:
// así el puntaje alto de cada factor significa siempre menos riesgo.
export const INTEGRIDAD: Template = {
  key: "integridad",
  name: "Integridad laboral",
  family: "laboral",
  summary:
    "Actitudes ante situaciones de trabajo donde la honestidad, el trato y el cuidado de lo ajeno se ponen en juego.",
  measures:
    "Nueve factores: veracidad, distorsión, integridad general, cuidado de los bienes, manejo del conflicto, seguridad, respeto en el trato, límites personales y uso de la información.",
  minutes: 9,
  scored: "dimension",
  source:
    "Instrumento original de Worka, de tipo actitudinal. No indaga sobre conducta pasada ni sobre consumo personal.",
  intro:
    "No es un examen y no hay respuestas correctas. Vas a leer frases sobre " +
    "situaciones que pasan en cualquier trabajo y marcar cuánto coincidís con " +
    "cada una. No te preguntamos nada sobre tu vida privada ni sobre tu salud. " +
    "Contestá lo que realmente pensás: las respuestas armadas se notan y juegan " +
    "en contra.",
  demo: {
    text: "Ejemplo: «Si un compañero se lleva materiales de la empresa, no es asunto mío.»",
    options: LIKERT_LABELS,
    answer: "En desacuerdo",
    explain:
      "No hay una única respuesta correcta, pero fijate que la frase mezcla dos " +
      "cosas: lo que hizo el otro y qué te toca a vos. Marcá lo que de verdad " +
      "harías, no lo que suena mejor.",
  },
  dimensions: DIMENSIONES_INTEGRIDAD.map((d) => ({
    key: d.key,
    label: d.label,
    high: d.high,
    low: d.low,
  })),
  questions: [
    // ── Veracidad (validez) ───────────────────────────────────
    // Afirmaciones que casi nadie cumple del todo. Marcarlas todas como
    // propias indica un perfil demasiado perfecto para ser real.
    {
      text: "Nunca en mi vida llegué tarde a un compromiso.",
      kind: "likert",
      dimension: "veracidad",
      reverse: true,
    },
    {
      text: "Jamás dije una mentira, ni siquiera para no herir a alguien.",
      kind: "likert",
      dimension: "veracidad",
      reverse: true,
    },
    {
      text: "Alguna vez me guardé una opinión para evitar un problema.",
      kind: "likert",
      dimension: "veracidad",
    },

    // ── Distorsión (validez) ──────────────────────────────────
    {
      text: "En un día de trabajo nunca me distraigo ni un minuto.",
      kind: "likert",
      dimension: "distorsion",
      reverse: true,
    },
    {
      text: "Todas las personas con las que trabajé quedaron conformes conmigo.",
      kind: "likert",
      dimension: "distorsion",
      reverse: true,
    },
    {
      text: "Alguna vez me equivoqué en el trabajo y tuve que corregirlo.",
      kind: "likert",
      dimension: "distorsion",
    },

    // ── Integridad general ────────────────────────────────────
    {
      text: "Si me dan vuelto de más en un negocio, lo devuelvo.",
      kind: "likert",
      dimension: "integridad",
    },
    {
      text: "Cuando nadie controla, no tiene tanto sentido cumplir cada regla.",
      kind: "likert",
      dimension: "integridad",
      reverse: true,
    },
    {
      text: "Prefiero avisar un error propio antes de que lo descubran.",
      kind: "likert",
      dimension: "integridad",
    },

    // ── Cuidado de los bienes ─────────────────────────────────
    {
      text: "Llevarse algo de poco valor del trabajo no le hace mal a nadie.",
      kind: "likert",
      dimension: "bienes",
      reverse: true,
    },
    {
      text: "Usar las herramientas de la empresa para trabajos propios está bien si no molesta.",
      kind: "likert",
      dimension: "bienes",
      reverse: true,
    },
    {
      text: "Cuido las cosas del trabajo igual que si fueran mías.",
      kind: "likert",
      dimension: "bienes",
    },

    // ── Manejo del conflicto ──────────────────────────────────
    {
      text: "Si alguien me falta el respeto en el trabajo, corresponde contestarle fuerte.",
      kind: "likert",
      dimension: "conflicto",
      reverse: true,
    },
    {
      text: "Cuando me enojo en el trabajo, prefiero esperar antes de responder.",
      kind: "likert",
      dimension: "conflicto",
    },
    {
      text: "Hay discusiones que se resuelven mejor levantando la voz.",
      kind: "likert",
      dimension: "conflicto",
      reverse: true,
    },

    // ── Seguridad en el trabajo ───────────────────────────────
    // Actitud ante trabajar o manejar bajo efectos, y ante encubrirlo.
    // No indaga consumo personal: eso es un dato de salud.
    {
      text: "Manejar un vehículo de la empresa después de tomar alcohol es inaceptable, sin excepciones.",
      kind: "likert",
      dimension: "seguridad",
    },
    {
      text: "Si un compañero viene al trabajo en malas condiciones, hay que taparlo.",
      kind: "likert",
      dimension: "seguridad",
      reverse: true,
    },
    {
      text: "Cuando los tiempos aprietan, se puede saltear algún paso de seguridad.",
      kind: "likert",
      dimension: "seguridad",
      reverse: true,
    },

    // ── Respeto en el trato ───────────────────────────────────
    {
      text: "Las cargadas pesadas entre compañeros son parte normal del trabajo.",
      kind: "likert",
      dimension: "trato",
      reverse: true,
    },
    {
      text: "Si veo que hostigan a un compañero, lo hablo o lo informo.",
      kind: "likert",
      dimension: "trato",
    },
    {
      text: "Un jefe exigente puede tratar mal a su gente si consigue resultados.",
      kind: "likert",
      dimension: "trato",
      reverse: true,
    },

    // ── Límites personales ────────────────────────────────────
    {
      text: "Los comentarios sobre el cuerpo de un compañero están fuera de lugar en el trabajo.",
      kind: "likert",
      dimension: "limites",
    },
    {
      text: "Si a alguien le incomoda un chiste, el problema es que es exagerado.",
      kind: "likert",
      dimension: "limites",
      reverse: true,
    },
    {
      text: "Insistir con una invitación después de un «no» está mal, aunque sea con buena intención.",
      kind: "likert",
      dimension: "limites",
    },

    // ── Uso responsable de la información ─────────────────────
    {
      text: "Prestarle mi usuario y clave a un compañero de confianza no tiene nada de malo.",
      kind: "likert",
      dimension: "informacion",
      reverse: true,
    },
    {
      text: "Llevarse la lista de clientes al cambiar de trabajo es parte del oficio.",
      kind: "likert",
      dimension: "informacion",
      reverse: true,
    },
    {
      text: "Los datos de los clientes se cuidan aunque nadie lo esté controlando.",
      kind: "likert",
      dimension: "informacion",
    },
  ],
};

// ── Lectura del resultado ──────────────────────────────────────

export type BandaRiesgo = "bajo" | "medio" | "atencion";

export type FactorIntegridad = {
  key: string;
  label: string;
  /** Puntaje del factor, 0-100. Alto = menos riesgo. */
  pct: number;
  banda: BandaRiesgo;
  /** Escala de validez: no es riesgo, dice si el resto es confiable. */
  validez: boolean;
  lectura: string;
};

/** Los cortes son deliberadamente conservadores: el costo de marcar mal a
 *  alguien que no lo merece es mucho más alto que el de no marcarlo. */
export function bandaDe(pct: number): BandaRiesgo {
  if (pct >= 70) return "bajo";
  if (pct >= 45) return "medio";
  return "atencion";
}

export const TEXTO_BANDA: Record<BandaRiesgo, string> = {
  bajo: "Sin señales",
  medio: "Conviene repreguntar",
  atencion: "Merece una conversación",
};

/** Los factores de integridad que hay en un perfil, ya leídos. */
export function leerIntegridad(
  profile: Record<string, { raw: number; max: number }> | undefined
): { validez: FactorIntegridad[]; riesgo: FactorIntegridad[] } | null {
  if (!profile) return null;

  const factores: FactorIntegridad[] = [];
  for (const d of DIMENSIONES_INTEGRIDAD) {
    const v = profile[d.key];
    if (!v || v.max <= 0) continue;
    const pct = Math.round((v.raw / v.max) * 100);
    factores.push({
      key: d.key,
      label: d.label,
      pct,
      banda: bandaDe(pct),
      validez: "validez" in d && d.validez === true,
      lectura: pct >= 60 ? d.high : d.low,
    });
  }

  // Si no rindió el instrumento, no hay nada que mostrar.
  if (factores.length === 0) return null;

  return {
    validez: factores.filter((f) => f.validez),
    // Del más bajo al más alto: lo que merece atención va primero.
    riesgo: factores.filter((f) => !f.validez).sort((a, b) => a.pct - b.pct),
  };
}

/** ¿Las escalas de validez invalidan la lectura del resto? */
export function perfilConfiable(validez: FactorIntegridad[]): boolean {
  return validez.every((f) => f.banda !== "atencion");
}
