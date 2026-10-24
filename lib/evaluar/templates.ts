// Catálogo de instrumentos listos para usar en Worka Evaluar.
//
// Vive en código y no en la base a propósito: así se versiona con el
// repositorio, se puede corregir un ítem sin migrar datos, y cada proceso se
// queda con la copia que se le instanció (si mañana cambio una pregunta, no se
// altera un proceso que ya está corriendo).
//
// Sobre la propiedad intelectual: el 16PF (IPAT/PSI) y el OPQ32 (SHL) son
// instrumentos licenciados; sus ítems no se reproducen acá. Los Cinco Grandes
// usan el IPIP, un banco de ítems de dominio público creado justamente para
// que existan alternativas abiertas y citables. El resto es material original.

import { LIKERT_LABELS } from "./likert";
import { INTEGRIDAD } from "./integridad";
import {
  MATRICES_FIGURALES,
  SERIES_FIGURALES,
  codificar,
  type FiguraSpec,
} from "./figuras";
import { ATENCION, NUMERICO } from "./bancos/generados";
import {
  BIG5_EXTRA,
  COMPETENCIAS,
  COMPETENCIAS_DIMENSIONES,
} from "./bancos/personalidad";
import {
  CONDUCTUAL,
  SJT_DIMENSIONES_EXTRA,
  SJT_EXTRA,
} from "./bancos/situacional";

export type TemplateQuestion = {
  text: string;
  /** "figura": la consigna y las opciones son dibujos (ver figuras.ts). */
  kind: "likert" | "unica" | "texto" | "figura";
  /** Casillas de la matriz o de la serie, solo en las de tipo "figura". */
  figure?: FiguraSpec;
  options?: string[];
  /** Respuesta correcta (solo instrumentos con vara objetiva). */
  correct?: string;
  /** Puntos por opción, para los SJT: no hay una correcta, hay mejores. */
  optionScores?: Record<string, number>;
  /** Rasgo que mide el ítem. */
  dimension?: string;
  /** Ítem inverso: responder "mucho" resta en lugar de sumar. */
  reverse?: boolean;
  weight?: number;
};

export type TemplateDimension = {
  key: string;
  label: string;
  /** Qué significa puntuar alto y bajo, en lenguaje de trabajo, no clínico. */
  high: string;
  low: string;
};

export type Template = {
  key: string;
  name: string;
  family: "personalidad" | "sjt" | "cognitivo" | "laboral";
  summary: string;
  measures: string;
  minutes: number;
  scored: "dimension" | "correcto";
  source: string;
  dimensions: TemplateDimension[];
  questions: TemplateQuestion[];
  /** Que es esta prueba y que se espera, dicho al candidato. */
  intro: string;
  /** Ejemplo resuelto, para ver el formato sin que corra el reloj. */
  demo: TemplateDemo;
  /**
   * Banco: cuántas preguntas recibe cada candidato, sorteadas y repartidas
   * por rasgo (ver evaluar_begin_stage, migración 056). Sin esto, todas.
   */
  draw?: number;
  /** Cada candidato ve las preguntas en otro orden. */
  shuffleQuestions?: boolean;
  /** Cada candidato ve las opciones en otro orden (nunca en las escalas). */
  shuffleOptions?: boolean;
};

export type TemplateDemo = {
  text: string;
  options: string[];
  answer: string;
  explain: string;
  /** Ejemplo en figuras: las opciones y la respuesta son códigos de figura. */
  figure?: FiguraSpec;
};

// Se reexporta para no romper los imports que ya la traen de aca.
export { LIKERT_LABELS } from "./likert";

// ── 1. Cinco Grandes (Big Five / OCEAN) ────────────────────────
const bigFive: Template = {
  key: "big5",
  name: "Los Cinco Grandes",
  family: "personalidad",
  summary:
    "Los cinco rasgos de personalidad con más respaldo científico: apertura, tesón, extraversión, amabilidad y estabilidad emocional.",
  measures:
    "Describe cómo tiende a comportarse la persona en general. No mide capacidad ni predice sola el desempeño: se lee junto al resto del proceso.",
  minutes: 6,
  scored: "dimension",
  source:
    "Ítems adaptados del International Personality Item Pool (IPIP), de dominio público.",
  dimensions: [
    {
      key: "apertura",
      label: "Apertura a nuevas experiencias",
      high: "Curiosa, se adapta a lo nuevo, propone cambios.",
      low: "Prefiere lo conocido y los procedimientos establecidos.",
    },
    {
      key: "teson",
      label: "Tesón (responsabilidad)",
      high: "Ordenada, cumple plazos, termina lo que empieza.",
      low: "Flexible pero puede dispersarse o postergar.",
    },
    {
      key: "extraversion",
      label: "Extraversión",
      high: "Sociable, cómoda con gente y exposición.",
      low: "Reservada, rinde mejor en trabajo concentrado.",
    },
    {
      key: "amabilidad",
      label: "Amabilidad",
      high: "Colaboradora, empática, evita el conflicto.",
      low: "Directa y competitiva, negocia sin rodeos.",
    },
    {
      key: "estabilidad",
      label: "Estabilidad emocional",
      high: "Mantiene la calma bajo presión.",
      low: "Se altera más ante imprevistos y tensión.",
    },
  ],
  intro:
    "No es un examen y no hay respuestas correctas. Son frases sobre cómo " +
    "trabajás; marcá cuánto se parecen a vos. Contestá lo primero que se te " +
    "venga: pensarlo de más no mejora el resultado, lo enturbia. Nadie " +
    "queda afuera por esto — describe tu estilo de trabajo, no cuánto servís.",
  demo: {
    text: "Ejemplo: «Termino lo que empiezo, aunque se ponga aburrido.»",
    options: LIKERT_LABELS,
    answer: "De acuerdo",
    explain:
      "Si en general terminás lo que arrancás pero alguna vez lo dejaste, " +
      "«De acuerdo» es más honesto que «Muy de acuerdo». La escala mide qué " +
      "tanto, no sí o no.",
  },
  questions: [
    // Extraversión
    { text: "Me siento cómodo/a rodeado/a de gente.", kind: "likert", dimension: "extraversion" },
    { text: "Me cuesta arrancar una conversación con alguien que no conozco.", kind: "likert", dimension: "extraversion", reverse: true },
    { text: "En una reunión suelo ser de los que más habla.", kind: "likert", dimension: "extraversion" },
    { text: "Prefiero quedarme en segundo plano.", kind: "likert", dimension: "extraversion", reverse: true },
    { text: "Me resulta fácil hacerme conocido/a en un lugar nuevo.", kind: "likert", dimension: "extraversion" },

    // Amabilidad
    { text: "Me interesa de verdad cómo está la gente con la que trabajo.", kind: "likert", dimension: "amabilidad" },
    { text: "Me cuesta ponerme en el lugar del otro.", kind: "likert", dimension: "amabilidad", reverse: true },
    { text: "Hago lo posible para que los demás se sientan cómodos.", kind: "likert", dimension: "amabilidad" },
    { text: "Cuando hay un problema, primero pienso en cómo me afecta a mí.", kind: "likert", dimension: "amabilidad", reverse: true },
    { text: "Dedico tiempo a ayudar a un compañero aunque no me lo pidan.", kind: "likert", dimension: "amabilidad" },

    // Tesón
    { text: "Termino lo que empiezo, aunque se complique.", kind: "likert", dimension: "teson" },
    { text: "Dejo tareas a medio hacer y las retomo después.", kind: "likert", dimension: "teson", reverse: true },
    { text: "Me gusta tener todo ordenado y en su lugar.", kind: "likert", dimension: "teson" },
    { text: "Postergo lo que no me gusta hacer.", kind: "likert", dimension: "teson", reverse: true },
    { text: "Cumplo con los plazos que me comprometo a cumplir.", kind: "likert", dimension: "teson" },

    // Estabilidad emocional
    { text: "Mantengo la calma cuando las cosas se ponen tensas.", kind: "likert", dimension: "estabilidad" },
    { text: "Me estreso con facilidad.", kind: "likert", dimension: "estabilidad", reverse: true },
    { text: "Me preocupo por cosas que no puedo controlar.", kind: "likert", dimension: "estabilidad", reverse: true },
    { text: "Cuando algo sale mal, me recupero rápido.", kind: "likert", dimension: "estabilidad" },
    { text: "Me altera que el día no salga como lo había planeado.", kind: "likert", dimension: "estabilidad", reverse: true },

    // Apertura
    { text: "Entiendo rápido ideas y conceptos nuevos.", kind: "likert", dimension: "apertura" },
    { text: "Me interesa poco lo que no sea concreto y práctico.", kind: "likert", dimension: "apertura", reverse: true },
    { text: "Se me ocurren formas distintas de hacer las cosas.", kind: "likert", dimension: "apertura" },
    { text: "Prefiero la rutina antes que probar algo nuevo.", kind: "likert", dimension: "apertura", reverse: true },
    { text: "Me gusta aprender cosas que no tienen que ver con mi trabajo.", kind: "likert", dimension: "apertura" },
  ],
};

// ── 2. Estilo laboral (competencias de trabajo) ────────────────
// El reemplazo legítimo de un 16PF/OPQ: mide rasgos de trabajo, con ítems
// propios y en un lenguaje que la empresa puede accionar.
const workStyle: Template = {
  key: "estilo_laboral",
  name: "Estilo laboral",
  family: "laboral",
  summary:
    "Ocho rasgos de comportamiento en el trabajo: cómo la persona organiza, decide, se relaciona y responde a la presión.",
  measures:
    "Pensado para mandos medios y puestos con responsabilidad. Indica preferencias de estilo, no aptitudes.",
  minutes: 6,
  scored: "dimension",
  source: "Instrumento propio de Worka.",
  dimensions: [
    { key: "liderazgo", label: "Conducción de equipo", high: "Toma el timón y ordena al grupo.", low: "Prefiere aportar sin dirigir." },
    { key: "equipo", label: "Trabajo en equipo", high: "Suma al grupo y comparte información.", low: "Rinde mejor con autonomía." },
    { key: "detalle", label: "Atención al detalle", high: "Revisa y detecta errores chicos.", low: "Prioriza avanzar sobre pulir." },
    { key: "presion", label: "Tolerancia a la presión", high: "Sostiene el ritmo en picos de trabajo.", low: "Rinde mejor con carga pareja." },
    { key: "cliente", label: "Orientación al cliente", high: "Pone al cliente en el centro.", low: "Se enfoca en la tarea interna." },
    { key: "adaptabilidad", label: "Adaptabilidad", high: "Se acomoda rápido a los cambios.", low: "Necesita reglas estables." },
    { key: "autonomia", label: "Autonomía", high: "Avanza sin que le marquen cada paso.", low: "Prefiere instrucciones claras." },
    { key: "planificacion", label: "Planificación", high: "Ordena el trabajo antes de arrancar.", low: "Resuelve sobre la marcha." },
  ],
  intro:
    "Igual que la anterior: frases sobre tu forma de trabajar, sin respuestas " +
    "correctas. Acá se mira cómo te movés en un equipo — si preferís que te " +
    "marquen los pasos o arrancar solo, si te sale ordenar al grupo o aportar " +
    "sin dirigir. Ninguna de las dos puntas es mejor; sirven para saber en qué " +
    "puesto ibas a estar más cómodo.",
  demo: {
    text: "Ejemplo: «Cuando el equipo se traba, soy el que propone por dónde seguir.»",
    options: LIKERT_LABELS,
    answer: "Ni acuerdo ni desacuerdo",
    explain:
      "Si a veces sí y a veces no, el punto del medio es la respuesta correcta " +
      "para vos. No es «no sé»: es «depende», y eso también es información.",
  },
  questions: [
    { text: "Cuando un grupo no arranca, suelo ser quien organiza.", kind: "likert", dimension: "liderazgo" },
    { text: "Me incomoda tener que decirle a otro cómo hacer su trabajo.", kind: "likert", dimension: "liderazgo", reverse: true },
    { text: "Me siento cómodo/a tomando decisiones que afectan a otros.", kind: "likert", dimension: "liderazgo" },

    { text: "Comparto lo que sé aunque nadie me lo pida.", kind: "likert", dimension: "equipo" },
    { text: "Rindo mejor cuando trabajo solo/a.", kind: "likert", dimension: "equipo", reverse: true },
    { text: "Prefiero resolver un problema entre varios que por mi cuenta.", kind: "likert", dimension: "equipo" },

    { text: "Reviso mi trabajo antes de entregarlo.", kind: "likert", dimension: "detalle" },
    { text: "Se me escapan errores chicos cuando voy apurado/a.", kind: "likert", dimension: "detalle", reverse: true },
    { text: "Noto cuando algo no cierra en una planilla o un número.", kind: "likert", dimension: "detalle" },

    { text: "Trabajo bien cuando hay mucha gente esperando.", kind: "likert", dimension: "presion" },
    { text: "Los días de mucho movimiento me agotan más de la cuenta.", kind: "likert", dimension: "presion", reverse: true },
    { text: "Puedo sostener el ritmo varias horas sin perder calidad.", kind: "likert", dimension: "presion" },

    { text: "Prefiero que el cliente se vaya conforme aunque me lleve más tiempo.", kind: "likert", dimension: "cliente" },
    { text: "Me molesta que me interrumpan para atender a alguien.", kind: "likert", dimension: "cliente", reverse: true },
    { text: "Me acuerdo de lo que cada cliente habitual necesita.", kind: "likert", dimension: "cliente" },

    { text: "Me acomodo rápido cuando cambian la forma de trabajar.", kind: "likert", dimension: "adaptabilidad" },
    { text: "Me cuesta cuando cambian las reglas a mitad de camino.", kind: "likert", dimension: "adaptabilidad", reverse: true },
    { text: "Aprendo herramientas nuevas sin que me las expliquen dos veces.", kind: "likert", dimension: "adaptabilidad" },

    { text: "Avanzo sin esperar que me digan el próximo paso.", kind: "likert", dimension: "autonomia" },
    { text: "Prefiero consultar antes de decidir algo por mi cuenta.", kind: "likert", dimension: "autonomia", reverse: true },
    { text: "Si algo se traba, busco la salida antes de avisar.", kind: "likert", dimension: "autonomia" },

    { text: "Antes de empezar, me armo un orden de lo que voy a hacer.", kind: "likert", dimension: "planificacion" },
    { text: "Suelo arrancar y ver sobre la marcha.", kind: "likert", dimension: "planificacion", reverse: true },
    { text: "Calculo bien cuánto me va a llevar cada tarea.", kind: "likert", dimension: "planificacion" },
  ],
};

// ── 3. SJT — Juicio situacional ────────────────────────────────
// Escenarios reales de trabajo. No hay una respuesta "correcta": hay
// respuestas mejores y peores, y eso es lo que se puntúa.
const sjt: Template = {
  key: "sjt_atencion",
  name: "Juicio situacional (atención y ventas)",
  family: "sjt",
  summary:
    "Ocho situaciones reales de mostrador, caja y atención. Mide qué haría la persona, no qué dice que haría.",
  measures:
    "Capacidad de resolver problemas del día a día: servicio, integridad, trabajo en equipo y manejo de presión.",
  minutes: 8,
  scored: "dimension",
  source: "Escenarios originales de Worka.",
  dimensions: [
    { key: "servicio", label: "Servicio al cliente", high: "Resuelve sin perder al cliente.", low: "Se apega al reglamento aunque pierda la venta." },
    // Antes la clave era "integridad", la misma que el factor del instrumento
    // de integridad laboral: el perfil sumaba las dos pruebas en un solo
    // rasgo. Las etapas ya creadas conservan la clave vieja (D-3).
    { key: "integridad_sjt", label: "Integridad (juicio situacional)", high: "Actúa bien incluso sin control.", low: "Puede transar según la conveniencia." },
    { key: "resolucion", label: "Resolución de problemas", high: "Encuentra la salida práctica.", low: "Deriva o espera instrucciones." },
    { key: "equipo_sjt", label: "Compañerismo", high: "Sostiene al equipo en el apuro.", low: "Se enfoca solo en su parte." },
  ],
  intro:
    "Situaciones que pasan de verdad en el mostrador y en el teléfono. Vas a " +
    "ver varias formas de reaccionar y tenés que elegir qué harías vos. Acá sí " +
    "hay opciones mejores que otras, pero casi ninguna es un disparate: la " +
    "diferencia está en el orden de prioridades. Elegí lo que harías de verdad, " +
    "no lo que suena más lindo.",
  demo: {
    text:
      "Ejemplo: un cliente reclama a los gritos por algo que no fue culpa tuya " +
      "y hay gente esperando detrás. ¿Qué hacés?",
    options: [
      "Le explico que el error no fue mío y sigo con el próximo",
      "Lo escucho, le pido disculpas por la espera y lo llevo a un costado para resolverlo",
      "Llamo al encargado y me corro del problema",
    ],
    answer:
      "Lo escucho, le pido disculpas por la espera y lo llevo a un costado para resolverlo",
    explain:
      "Atiende al cliente y libera la fila, que son los dos problemas a la vez. " +
      "Tener razón no resuelve ninguno de los dos.",
  },
  questions: [
    {
      text: "Un cliente vuelve furioso porque el producto que compró ayer salió fallado. No tiene el ticket. ¿Qué hacés?",
      kind: "unica",
      dimension: "servicio",
      options: [
        "Le explico que sin ticket no puedo hacer nada y lo derivo a la gerencia.",
        "Busco la compra en el sistema por su cédula o teléfono y resuelvo el cambio.",
        "Le cambio el producto igual, sin verificar nada, para que se vaya tranquilo.",
        "Le digo que vuelva cuando encuentre el ticket.",
      ],
      optionScores: {
        "Le explico que sin ticket no puedo hacer nada y lo derivo a la gerencia.": 1,
        "Busco la compra en el sistema por su cédula o teléfono y resuelvo el cambio.": 3,
        "Le cambio el producto igual, sin verificar nada, para que se vaya tranquilo.": 1,
        "Le digo que vuelva cuando encuentre el ticket.": 0,
      },
    },
    {
      text: "Cerrando la caja te das cuenta de que te sobran Gs. 50.000 y nadie lo notó. ¿Qué hacés?",
      kind: "unica",
      dimension: "integridad_sjt",
      options: [
        "Lo informo y lo dejo asentado en el cierre.",
        "Lo guardo por si mañana falta y así se compensa.",
        "Me lo llevo: si sobra es porque alguien pagó de más.",
        "No digo nada y lo dejo en la caja.",
      ],
      optionScores: {
        "Lo informo y lo dejo asentado en el cierre.": 3,
        "Lo guardo por si mañana falta y así se compensa.": 1,
        "Me lo llevo: si sobra es porque alguien pagó de más.": 0,
        "No digo nada y lo dejo en la caja.": 1,
      },
    },
    {
      text: "Hay cola de ocho personas y el sistema de facturación se cuelga. ¿Qué hacés primero?",
      kind: "unica",
      dimension: "resolucion",
      options: [
        "Aviso a los que esperan cuánto va a demorar y empiezo a tomar los pedidos a mano.",
        "Espero a que el sistema vuelva sin decir nada.",
        "Llamo al soporte y me quedo esperando la respuesta.",
        "Cierro la caja y mando a todos a la caja de al lado.",
      ],
      optionScores: {
        "Aviso a los que esperan cuánto va a demorar y empiezo a tomar los pedidos a mano.": 3,
        "Espero a que el sistema vuelva sin decir nada.": 0,
        "Llamo al soporte y me quedo esperando la respuesta.": 2,
        "Cierro la caja y mando a todos a la caja de al lado.": 1,
      },
    },
    {
      text: "Un compañero falta y su trabajo queda sin hacer. Vos ya terminaste el tuyo. ¿Qué hacés?",
      kind: "unica",
      dimension: "equipo_sjt",
      options: [
        "Le aviso al encargado y me ofrezco a cubrir lo más urgente.",
        "Hago solo lo mío: no es mi responsabilidad.",
        "Hago todo su trabajo sin avisarle a nadie.",
        "Espero a que alguien me lo pida.",
      ],
      optionScores: {
        "Le aviso al encargado y me ofrezco a cubrir lo más urgente.": 3,
        "Hago solo lo mío: no es mi responsabilidad.": 0,
        "Hago todo su trabajo sin avisarle a nadie.": 2,
        "Espero a que alguien me lo pida.": 1,
      },
    },
    {
      text: "Un cliente te pide un producto que se acabó. ¿Qué hacés?",
      kind: "unica",
      dimension: "servicio",
      options: [
        "Le digo que no hay y sigo con el próximo.",
        "Le ofrezco una alternativa parecida y le aviso cuándo llega el que buscaba.",
        "Le digo que vuelva la semana que viene.",
        "Le digo que pruebe en otro local.",
      ],
      optionScores: {
        "Le digo que no hay y sigo con el próximo.": 0,
        "Le ofrezco una alternativa parecida y le aviso cuándo llega el que buscaba.": 3,
        "Le digo que vuelva la semana que viene.": 1,
        "Le digo que pruebe en otro local.": 1,
      },
    },
    {
      text: "Ves que un compañero le cobra de menos a un conocido suyo. ¿Qué hacés?",
      kind: "unica",
      dimension: "integridad_sjt",
      options: [
        "Hablo con él primero y, si sigue, lo informo.",
        "No me meto, es su problema.",
        "Lo informo directamente al encargado.",
        "Hago lo mismo cuando venga un conocido mío.",
      ],
      optionScores: {
        "Hablo con él primero y, si sigue, lo informo.": 3,
        "No me meto, es su problema.": 0,
        "Lo informo directamente al encargado.": 2,
        "Hago lo mismo cuando venga un conocido mío.": 0,
      },
    },
    {
      text: "Te toca un cliente que te levanta la voz delante de los demás. ¿Qué hacés?",
      kind: "unica",
      dimension: "servicio",
      options: [
        "Le contesto en el mismo tono: no tiene por qué tratarme así.",
        "Bajo la voz, lo escucho hasta el final y le propongo una solución concreta.",
        "Lo ignoro y sigo atendiendo a otro.",
        "Llamo al encargado enseguida sin escuchar el reclamo.",
      ],
      optionScores: {
        "Le contesto en el mismo tono: no tiene por qué tratarme así.": 0,
        "Bajo la voz, lo escucho hasta el final y le propongo una solución concreta.": 3,
        "Lo ignoro y sigo atendiendo a otro.": 0,
        "Llamo al encargado enseguida sin escuchar el reclamo.": 1,
      },
    },
    {
      text: "Te piden una tarea que no sabés hacer y el encargado no está. ¿Qué hacés?",
      kind: "unica",
      dimension: "resolucion",
      options: [
        "La hago como me parece y después veo.",
        "Le pregunto a un compañero que sepa y la hago con lo que me explique.",
        "La dejo para cuando vuelva el encargado.",
        "Digo que no me corresponde.",
      ],
      optionScores: {
        "La hago como me parece y después veo.": 1,
        "Le pregunto a un compañero que sepa y la hago con lo que me explique.": 3,
        "La dejo para cuando vuelva el encargado.": 1,
        "Digo que no me corresponde.": 0,
      },
    },
  ],
};

// ── 4. Razonamiento (psicométrico) ─────────────────────────────
// Series numéricas, series de fichas de dominó y analogías verbales. Acá sí
// hay respuesta correcta: se puntúa como conocimientos.
const reasoning: Template = {
  key: "razonamiento",
  name: "Razonamiento (psicométrico)",
  family: "cognitivo",
  summary:
    "Doce ejercicios de series numéricas, series de fichas de dominó y analogías verbales.",
  measures:
    "Capacidad de detectar patrones y razonar con información nueva. Es el mejor predictor aislado de aprendizaje en el puesto.",
  minutes: 10,
  scored: "correcto",
  source: "Ítems originales de Worka.",
  dimensions: [
    { key: "numerico", label: "Razonamiento numérico", high: "Detecta patrones en números.", low: "Le cuesta el cálculo abstracto." },
    { key: "abstracto", label: "Razonamiento abstracto", high: "Ve la lógica en figuras y series.", low: "Necesita ejemplos concretos." },
    { key: "verbal", label: "Razonamiento verbal", high: "Maneja relaciones entre conceptos.", low: "Trabaja mejor con instrucciones literales." },
  ],
  intro:
    "Esta sí es una prueba con respuestas correctas, y tiene tiempo. Son series, " +
    "fichas de dominó y analogías: se resuelven mirando qué regla se repite. Si " +
    "una no te sale, pasá a la siguiente y volvé después — quedarse trabado es " +
    "lo que más puntos cuesta. Casi nadie llega a contestar todas, así que no te " +
    "asustes si se termina el tiempo.",
  demo: {
    text: "Ejemplo: 2, 4, 8, 16, ¿qué número sigue?",
    options: ["18", "24", "32", "64"],
    answer: "32",
    explain:
      "Cada número es el doble del anterior, así que 16 × 2 = 32. La clave " +
      "siempre es encontrar qué operación se repite entre un paso y el siguiente.",
  },
  questions: [
    { text: "¿Qué número sigue? 2, 4, 8, 16, ___", kind: "unica", dimension: "numerico", options: ["18", "24", "32", "64"], correct: "32" },
    { text: "¿Qué número sigue? 3, 6, 5, 10, 9, ___", kind: "unica", dimension: "numerico", options: ["18", "12", "14", "11"], correct: "18" },
    { text: "¿Qué número falta? 7, 14, 28, ___, 112", kind: "unica", dimension: "numerico", options: ["42", "56", "84", "96"], correct: "56" },
    { text: "Si 5 personas cargan un camión en 6 horas, ¿cuántas horas tardan 10 personas al mismo ritmo?", kind: "unica", dimension: "numerico", options: ["3", "6", "12", "2"], correct: "3" },

    { text: "Serie de fichas de dominó. ¿Cuál sigue? 1|2 · 2|3 · 3|4 · ___", kind: "unica", dimension: "abstracto", options: ["4|5", "5|6", "4|4", "1|5"], correct: "4|5" },
    { text: "Serie de fichas. ¿Cuál sigue? 0|1 · 1|3 · 2|5 · ___", kind: "unica", dimension: "abstracto", options: ["3|7", "3|6", "4|7", "2|7"], correct: "3|7" },
    { text: "Serie de fichas. ¿Cuál sigue? 6|6 · 5|5 · 4|4 · ___", kind: "unica", dimension: "abstracto", options: ["3|3", "3|4", "4|3", "2|2"], correct: "3|3" },
    { text: "Serie de fichas. La suma de cada ficha crece de a 2: 1|1 · 1|3 · 2|4 · ___", kind: "unica", dimension: "abstracto", options: ["3|5", "2|6", "4|4", "3|6"], correct: "3|5" },

    { text: "Guante es a mano como zapato es a ___", kind: "unica", dimension: "verbal", options: ["cuero", "pie", "media", "caminar"], correct: "pie" },
    { text: "Médico es a hospital como maestro es a ___", kind: "unica", dimension: "verbal", options: ["alumno", "escuela", "libro", "pizarra"], correct: "escuela" },
    { text: "¿Cuál NO pertenece al grupo?", kind: "unica", dimension: "verbal", options: ["Martillo", "Destornillador", "Clavo", "Pinza"], correct: "Clavo" },
    { text: "Si todos los repositores usan uniforme y Ana usa uniforme, ¿qué se puede afirmar con certeza?", kind: "unica", dimension: "verbal", options: ["Ana es repositora.", "Ana no es repositora.", "No se puede afirmar que Ana sea repositora.", "Todos los que usan uniforme son repositores."], correct: "No se puede afirmar que Ana sea repositora." },
  ],
};

// ── Bancos (sorteo por candidato) ──────────────────────────────
//
// Estas pruebas tienen muchas más preguntas de las que rinde cada persona: a
// cada candidato se le sortea una muestra repartida por rasgo, en otro orden
// y con las opciones mezcladas. Dos postulantes del mismo proceso ven
// pruebas distintas, y pasarse las respuestas deja de servir.

const figural = (dim: string) => (it: (typeof MATRICES_FIGURALES)[number]): TemplateQuestion => ({
  text:
    it.figure.tipo === "matriz"
      ? "¿Qué figura completa la casilla vacía?"
      : "¿Qué figura sigue en la serie?",
  kind: "figura",
  figure: it.figure,
  options: it.options,
  correct: it.correct,
  dimension: dim,
});

// Ejemplo de matriz: forma por fila (círculo, cuadrado, triángulo) y relleno
// por columna (blanco, negro, rayado). Falta el triángulo rayado.
const DEMO_MATRIZ = (() => {
  const c = (forma: "circulo" | "cuadrado" | "triangulo", relleno: "vacio" | "lleno" | "rayado") =>
    codificar({ forma, relleno, giro: 0, cantidad: 1, marca: "ninguna", pos: "sd", tam: "g" });
  const formas = ["circulo", "cuadrado", "triangulo"] as const;
  const rellenos = ["vacio", "lleno", "rayado"] as const;
  const celdas = formas.flatMap((f) => rellenos.map((r) => c(f, r))).slice(0, 8);
  return {
    figure: { tipo: "matriz" as const, celdas },
    options: [c("triangulo", "lleno"), c("triangulo", "rayado"), c("cuadrado", "rayado"), c("circulo", "rayado")],
    answer: c("triangulo", "rayado"),
  };
})();

const DEMO_SERIE = (() => {
  const c = (giro: number) =>
    codificar({ forma: "linea", relleno: "vacio", giro, cantidad: 1, marca: "ninguna", pos: "sd", tam: "g" });
  return {
    figure: { tipo: "serie" as const, celdas: [c(0), c(45), c(90), c(135)] },
    options: [c(0), c(45), c(90), c(135)],
    answer: c(0),
  };
})();

const matrices: Template = {
  key: "matrices",
  name: "Razonamiento abstracto con figuras (matrices)",
  family: "cognitivo",
  summary:
    "Matrices de 3×3 con una casilla vacía: hay que descubrir la regla y elegir la figura que la completa.",
  measures:
    "Razonamiento abstracto sin depender del idioma ni de la lectura. Cada candidato recibe 12 de 120 matrices, de una a tres reglas simultáneas.",
  minutes: 12,
  scored: "correcto",
  source: "Ítems figurales originales de Worka, generados por regla.",
  dimensions: [
    { key: "figural", label: "Razonamiento abstracto (figuras)", high: "Descubre reglas nuevas en poco tiempo.", low: "Necesita ejemplos antes de encontrar la regla." },
  ],
  intro:
    "Vas a ver cuadros de nueve casillas con figuras. En cada fila y cada " +
    "columna las figuras cambian siguiendo una regla, y la última casilla está " +
    "vacía. Elegí la figura que la completa. Tiene tiempo: si una no te sale, " +
    "pasá a la siguiente.",
  demo: {
    text: "Ejemplo: ¿qué figura completa la casilla vacía?",
    options: DEMO_MATRIZ.options,
    answer: DEMO_MATRIZ.answer,
    figure: DEMO_MATRIZ.figure,
    explain:
      "Cada fila tiene una forma (círculo, cuadrado, triángulo) y cada columna " +
      "un relleno (blanco, negro, rayado). A la última casilla le toca el " +
      "triángulo rayado.",
  },
  questions: MATRICES_FIGURALES.map(figural("figural")),
  draw: 12,
  shuffleQuestions: true,
  shuffleOptions: true,
};

const seriesFiguras: Template = {
  key: "series_figuras",
  name: "Series de figuras",
  family: "cognitivo",
  summary: "Cuatro figuras en fila que cambian siguiendo una regla: hay que elegir la quinta.",
  measures:
    "Razonamiento secuencial con figuras. Cada candidato recibe 10 de 60 series.",
  minutes: 8,
  scored: "correcto",
  source: "Ítems figurales originales de Worka, generados por regla.",
  dimensions: [
    { key: "secuencias", label: "Razonamiento secuencial (figuras)", high: "Sigue varias reglas a la vez sin perderse.", low: "Se pierde cuando cambian dos cosas juntas." },
  ],
  intro:
    "Vas a ver cuatro figuras en fila. De una a la siguiente cambia algo: la " +
    "forma, el relleno, cuántas son, hacia dónde apuntan o dónde está la marca. " +
    "Elegí la que sigue. Tiene tiempo.",
  demo: {
    text: "Ejemplo: ¿qué figura sigue en la serie?",
    options: DEMO_SERIE.options,
    answer: DEMO_SERIE.answer,
    figure: DEMO_SERIE.figure,
    explain:
      "La línea gira un octavo de vuelta en cada paso. Después de la inclinada " +
      "hacia la izquierda vuelve a quedar horizontal.",
  },
  questions: SERIES_FIGURALES.map(figural("secuencias")),
  draw: 10,
  shuffleQuestions: true,
  shuffleOptions: true,
};

const numericoBanco: Template = {
  key: "numerico_banco",
  name: "Razonamiento numérico",
  family: "cognitivo",
  summary:
    "Series de números, descuentos y reglas de tres con precios en guaraníes.",
  measures:
    "Cálculo aplicado y detección de patrones numéricos. Cada candidato recibe 12 de 60 ejercicios.",
  minutes: 12,
  scored: "correcto",
  source: "Ítems originales de Worka, generados por regla (la respuesta sale de la cuenta).",
  dimensions: [
    { key: "numerico", label: "Razonamiento numérico", high: "Detecta patrones en números.", low: "Le cuesta el cálculo abstracto." },
  ],
  intro:
    "Son ejercicios con números: series, descuentos y cuentas del día a día. " +
    "Podés usar papel, pero no calculadora. Tiene tiempo: si uno se te traba, " +
    "pasá al siguiente.",
  demo: {
    text: "Ejemplo: una remera cuesta 80.000 Gs. y tiene 25% de descuento. ¿Cuánto se paga?",
    options: ["20.000 Gs.", "55.000 Gs.", "60.000 Gs.", "75.000 Gs."],
    answer: "60.000 Gs.",
    explain: "El 25% de 80.000 es 20.000. Se paga 80.000 − 20.000 = 60.000.",
  },
  questions: NUMERICO,
  draw: 12,
  shuffleQuestions: true,
  shuffleOptions: true,
};

const atencion: Template = {
  key: "atencion_detalle",
  name: "Atención y precisión",
  family: "cognitivo",
  summary:
    "Facturas, RUC, chapas y nombres casi iguales: hay que encontrar el que coincide exactamente.",
  measures:
    "Precisión al copiar y verificar datos, clave en caja, depósito y administración. Cada candidato recibe 15 de 60.",
  minutes: 6,
  scored: "correcto",
  source: "Ítems originales de Worka, generados por regla.",
  dimensions: [
    { key: "atencion", label: "Atención y precisión", high: "Detecta diferencias mínimas en datos.", low: "Se le escapan errores chicos al copiar." },
  ],
  intro:
    "Vas a ver un dato (una factura, un RUC, una chapa o un nombre) y cuatro " +
    "opciones muy parecidas. Solo una es exactamente igual. Es rápido y tiene " +
    "tiempo: mirá con cuidado cada carácter.",
  demo: {
    text: "Ejemplo: ¿cuál es exactamente igual a este RUC?  4512367-8",
    options: ["4512367-8", "4513267-8", "4512367-3", "451267-8"],
    answer: "4512367-8",
    explain: "Las otras tienen dos números invertidos, el último dígito cambiado o un número de menos.",
  },
  questions: ATENCION,
  draw: 15,
  shuffleQuestions: true,
  shuffleOptions: true,
};

const big5Banco: Template = {
  ...bigFive,
  key: "big5_banco",
  name: "Cinco Grandes (versión ampliada)",
  summary:
    "Los cinco rasgos de personalidad con un banco de 85 frases: cada candidato recibe 40, ocho por rasgo.",
  measures: bigFive.measures,
  minutes: 9,
  source:
    "25 ítems basados en el IPIP (dominio público) y 60 originales de Worka. Sin baremo ni validación propios todavía.",
  questions: [...bigFive.questions, ...BIG5_EXTRA],
  draw: 40,
  shuffleQuestions: true,
};

const competencias: Template = {
  key: "competencias",
  name: "Competencias conductuales",
  family: "laboral",
  summary:
    "Seis competencias de trabajo: resultados, responsabilidad, comunicación, aprendizaje, autocontrol e iniciativa.",
  measures:
    "Cómo dice actuar la persona en el día a día. Cada candidato recibe 36 de 60 frases, seis por competencia.",
  minutes: 8,
  scored: "dimension",
  source: "Ítems originales de Worka. Describe estilos; no tiene validación propia todavía.",
  dimensions: COMPETENCIAS_DIMENSIONES,
  intro:
    "No es un examen. Son frases sobre cómo trabajás; marcá cuánto se parecen " +
    "a vos. No hay respuestas buenas ni malas, y contestar lo que suena mejor " +
    "se nota: algunas frases dicen lo mismo al revés.",
  demo: {
    text: "Ejemplo: «Prefiero terminar una tarea antes de empezar otra.»",
    options: LIKERT_LABELS,
    answer: "De acuerdo",
    explain: "Es solo para ver el formato: esta frase no cuenta. Marcá cuánto coincidís de verdad.",
  },
  questions: COMPETENCIAS,
  draw: 36,
  shuffleQuestions: true,
};

const sjtBanco: Template = {
  ...sjt,
  key: "sjt_banco",
  name: "Juicio situacional (versión ampliada)",
  summary:
    "48 situaciones de caja, salón, depósito, oficina y supervisión: cada candidato recibe 12.",
  measures:
    "Qué haría la persona ante situaciones reales: servicio, resolución, compañerismo, integridad y conducción.",
  minutes: 12,
  dimensions: [...sjt.dimensions, ...SJT_DIMENSIONES_EXTRA],
  questions: [...sjt.questions, ...SJT_EXTRA],
  draw: 12,
  shuffleQuestions: true,
  shuffleOptions: true,
};

const entrevista: Template = {
  key: "entrevista_conductual",
  name: "Entrevista por competencias (escrita)",
  family: "laboral",
  summary:
    "Preguntas abiertas del tipo «contame una vez que…». Cada candidato recibe 4 de 40.",
  measures:
    "Experiencias concretas que respaldan lo que la persona dice de sí misma. Las lee el evaluador.",
  minutes: 15,
  scored: "dimension",
  source: "Preguntas originales de Worka, con el formato situación-acción-resultado.",
  dimensions: [],
  intro:
    "Vas a responder unas pocas preguntas sobre situaciones que viviste en el " +
    "trabajo, el estudio o la vida diaria. Contá qué pasó, qué hiciste vos y " +
    "cómo terminó. No hay respuestas correctas: importa que sea un caso real.",
  demo: {
    text: "Ejemplo: «Contanos una vez que resolviste un problema sin ayuda.»",
    options: ["Qué pasó", "Qué hiciste vos", "Cómo terminó"],
    answer: "Qué hiciste vos",
    explain:
      "Una buena respuesta cuenta las tres cosas, y sobre todo qué hiciste vos. " +
      "Unas pocas líneas alcanzan.",
  },
  questions: CONDUCTUAL,
  draw: 4,
  shuffleQuestions: true,
};

// La integridad vive en su propio archivo: son 27 items con mucho contexto
// escrito al lado, y mezclarlos aca haria ilegible el resto del catalogo.
//
// Las cinco primeras ahora también mezclan el orden al aplicarse (las etapas
// ya creadas no cambian). Las escalas nunca mezclan sus opciones: el orden
// de "muy en desacuerdo" a "muy de acuerdo" es parte de la pregunta.
export const TEMPLATES: Template[] = [
  { ...bigFive, shuffleQuestions: true },
  { ...workStyle, shuffleQuestions: true },
  { ...sjt, shuffleQuestions: true, shuffleOptions: true },
  { ...reasoning, shuffleQuestions: true, shuffleOptions: true },
  { ...INTEGRIDAD, shuffleQuestions: true },
  matrices,
  seriesFiguras,
  numericoBanco,
  atencion,
  big5Banco,
  competencias,
  sjtBanco,
  entrevista,
];

export function getTemplate(key: string): Template | undefined {
  return TEMPLATES.find((t) => t.key === key);
}

// Diccionario de todas las dimensiones, para poder rotular un resultado sin
// saber de qué plantilla vino.
export const ALL_DIMENSIONS: Record<string, TemplateDimension> =
  Object.fromEntries(
    TEMPLATES.flatMap((t) => t.dimensions).map((d) => [d.key, d])
  );

// Rasgos que se miden con ítems likert. Hacen falta para llevar la escala v1
// (1-5) a la v2 (0-4) al comparar; ver aEscalaV2 en lib/evaluar/puntaje.ts.
// "integridad" entra aunque en etapas viejas también la usaba el juicio
// situacional: la mayoría de sus ítems son del instrumento de integridad.
export const LIKERT_DIMENSIONS: ReadonlySet<string> = new Set(
  TEMPLATES.flatMap((t) =>
    t.questions.filter((q) => q.kind === "likert" && q.dimension).map((q) => q.dimension as string)
  )
);

// ── Plantillas por rubro ───────────────────────────────────────
//
// Un proceso entero ya armado para los puestos que más se buscan en Paraguay.
// La empresa elige el rubro y le queda listo: la mayor parte del abandono al
// armar un proceso pasa por tener que decidir qué medir desde cero.
export type RoleTemplate = {
  key: string;
  name: string;
  icon: string;
  summary: string;
  /** Instrumentos del catálogo, en orden. */
  stages: string[];
  /** Preguntas de filtro propias del puesto, como primera etapa. */
  screening: {
    title: string;
    minutes: number;
    questions: TemplateQuestion[];
  };
};

// Atajo para las preguntas excluyentes de filtro: sí/no con respuesta correcta.
function si(text: string, correcta: "Sí" | "No" = "Sí"): TemplateQuestion {
  return {
    text,
    kind: "unica",
    options: ["Sí", "No"],
    correct: correcta,
    weight: 1,
  };
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    key: "cajero",
    name: "Cajero / a",
    icon: "🧾",
    summary:
      "Filtro de experiencia y manejo de efectivo, razonamiento numérico y juicio situacional de mostrador.",
    stages: ["razonamiento", "sjt_atencion"],
    screening: {
      title: "Requisitos del puesto",
      minutes: 2,
      questions: [
        si("¿Tenés experiencia previa manejando caja o efectivo?"),
        si("¿Podés trabajar los fines de semana o feriados?"),
        si("¿Tenés disponibilidad para trabajar por turnos rotativos?"),
        {
          text: "Si al cerrar la caja te falta dinero, ¿qué hacés?",
          kind: "unica",
          dimension: "integridad_sjt",
          options: [
            "Lo informo enseguida y reviso los movimientos del día.",
            "Pongo la diferencia de mi bolsillo y no digo nada.",
            "Espero a ver si aparece mañana.",
          ],
          optionScores: {
            "Lo informo enseguida y reviso los movimientos del día.": 3,
            "Pongo la diferencia de mi bolsillo y no digo nada.": 1,
            "Espero a ver si aparece mañana.": 0,
          },
        },
      ],
    },
  },
  {
    key: "chofer",
    name: "Chofer / repartidor",
    icon: "🚚",
    summary:
      "Registro, categoría y antecedentes, más juicio situacional en ruta y atención al cliente.",
    stages: ["sjt_atencion", "estilo_laboral"],
    screening: {
      title: "Requisitos del puesto",
      minutes: 3,
      questions: [
        si("¿Tenés registro de conducir profesional vigente?"),
        si("¿Tenés más de un año de experiencia conduciendo para trabajo?"),
        si("¿Estás dispuesto/a a presentar tu certificado de antecedentes?"),
        {
          text: "Vas con el reparto y el cliente no está en la dirección. ¿Qué hacés?",
          kind: "unica",
          dimension: "resolucion",
          options: [
            "Lo llamo, espero unos minutos y aviso a la empresa antes de seguir.",
            "Dejo el paquete con un vecino sin avisar.",
            "Vuelvo con el paquete sin llamar a nadie.",
          ],
          optionScores: {
            "Lo llamo, espero unos minutos y aviso a la empresa antes de seguir.": 3,
            "Dejo el paquete con un vecino sin avisar.": 1,
            "Vuelvo con el paquete sin llamar a nadie.": 0,
          },
        },
      ],
    },
  },
  {
    key: "call_center",
    name: "Call center / atención",
    icon: "🎧",
    summary:
      "Disponibilidad horaria y manejo de reclamos, más personalidad y razonamiento verbal.",
    stages: ["sjt_atencion", "big5"],
    screening: {
      title: "Requisitos del puesto",
      minutes: 3,
      questions: [
        si("¿Tenés conexión estable a internet y un lugar tranquilo para trabajar?"),
        si("¿Tenés experiencia atendiendo clientes por teléfono o chat?"),
        {
          text: "Un cliente repite el mismo reclamo por tercera vez y ya está enojado. ¿Qué hacés?",
          kind: "unica",
          dimension: "servicio",
          options: [
            "Le reconozco la molestia, le digo qué voy a hacer y le doy un plazo concreto.",
            "Le repito la misma respuesta que le dieron antes.",
            "Lo derivo a otra área para sacármelo de encima.",
          ],
          optionScores: {
            "Le reconozco la molestia, le digo qué voy a hacer y le doy un plazo concreto.": 3,
            "Le repito la misma respuesta que le dieron antes.": 1,
            "Lo derivo a otra área para sacármelo de encima.": 0,
          },
        },
      ],
    },
  },
  {
    key: "gastronomia",
    name: "Gastronomía (mozo / cocina)",
    icon: "🍽️",
    summary:
      "Disponibilidad, higiene y ritmo de servicio, más juicio situacional de salón.",
    stages: ["sjt_atencion", "estilo_laboral"],
    screening: {
      title: "Requisitos del puesto",
      minutes: 3,
      questions: [
        si("¿Tenés disponibilidad para trabajar de noche y los fines de semana?"),
        si("¿Tenés carnet de salud vigente o podés tramitarlo?"),
        si("¿Tenés experiencia previa en gastronomía?"),
        {
          text: "En pleno servicio se cae un plato y el salón está lleno. ¿Qué hacés?",
          kind: "unica",
          dimension: "resolucion",
          options: [
            "Aviso, limpio rápido para que nadie se lastime y sigo con las mesas.",
            "Sigo atendiendo y lo limpio cuando baje el movimiento.",
            "Busco al encargado y espero que me diga qué hacer.",
          ],
          optionScores: {
            "Aviso, limpio rápido para que nadie se lastime y sigo con las mesas.": 3,
            "Sigo atendiendo y lo limpio cuando baje el movimiento.": 0,
            "Busco al encargado y espero que me diga qué hacer.": 1,
          },
        },
      ],
    },
  },
  {
    key: "vendedor",
    name: "Vendedor / a",
    icon: "🛍️",
    summary:
      "Experiencia y movilidad, personalidad orientada a la venta y juicio situacional comercial.",
    stages: ["big5", "sjt_atencion"],
    screening: {
      title: "Requisitos del puesto",
      minutes: 3,
      questions: [
        si("¿Tenés experiencia en ventas con objetivos o metas?"),
        si("¿Contás con movilidad propia?"),
        {
          text: "Un cliente duda y dice que lo va a pensar. ¿Qué hacés?",
          kind: "unica",
          dimension: "servicio",
          options: [
            "Le pregunto qué lo frena y le muestro una opción que se ajuste mejor.",
            "Lo dejo ir sin decir nada.",
            "Insisto con el mismo producto hasta que se decida.",
          ],
          optionScores: {
            "Le pregunto qué lo frena y le muestro una opción que se ajuste mejor.": 3,
            "Lo dejo ir sin decir nada.": 1,
            "Insisto con el mismo producto hasta que se decida.": 0,
          },
        },
      ],
    },
  },
];

export function getRoleTemplate(key: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find((r) => r.key === key);
}
