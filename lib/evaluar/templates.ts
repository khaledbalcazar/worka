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

export type TemplateQuestion = {
  text: string;
  kind: "likert" | "unica";
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
};

export const LIKERT_LABELS = [
  "Muy en desacuerdo",
  "En desacuerdo",
  "Ni acuerdo ni desacuerdo",
  "De acuerdo",
  "Muy de acuerdo",
];

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
    { key: "integridad", label: "Integridad", high: "Actúa bien incluso sin control.", low: "Puede transar según la conveniencia." },
    { key: "resolucion", label: "Resolución de problemas", high: "Encuentra la salida práctica.", low: "Deriva o espera instrucciones." },
    { key: "equipo_sjt", label: "Compañerismo", high: "Sostiene al equipo en el apuro.", low: "Se enfoca solo en su parte." },
  ],
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
      dimension: "integridad",
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
      dimension: "integridad",
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

export const TEMPLATES: Template[] = [bigFive, workStyle, sjt, reasoning];

export function getTemplate(key: string): Template | undefined {
  return TEMPLATES.find((t) => t.key === key);
}

// Diccionario de todas las dimensiones, para poder rotular un resultado sin
// saber de qué plantilla vino.
export const ALL_DIMENSIONS: Record<string, TemplateDimension> =
  Object.fromEntries(
    TEMPLATES.flatMap((t) => t.dimensions).map((d) => [d.key, d])
  );
