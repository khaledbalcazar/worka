// Catálogo de competencias laborales.
//
// Lo que hace defendible a una evaluación de desempeño no es la escala sino
// los anclajes. "Calificá comunicación del 1 al 5" produce números que
// dependen de quién califica: el jefe exigente pone 3 donde el complaciente
// pone 5, y comparar dos áreas se vuelve imposible.
//
// Con anclajes de conducta, el evaluador no elige un número: elige la
// descripción que más se parece a lo que vio. Eso recorta la indulgencia y el
// efecto halo, y sobre todo le da al empleado algo concreto sobre lo que
// trabajar — "necesitás avisar antes cuando algo se atrasa" en vez de "te
// puse 3 en comunicación".
//
// Las descripciones están escritas en conducta observable a propósito: nada
// de "es proactivo" ni "tiene actitud", que no se pueden ver ni discutir.

export type Competencia = {
  key: string;
  label: string;
  /** Para qué sirve, en una línea. */
  resumen: string;
  /** Qué se ve en cada nivel. Índice 0 = nivel 1, índice 4 = nivel 5. */
  anclajes: [string, string, string, string, string];
  /** Solo aplica a quien conduce gente. */
  soloJefatura?: boolean;
};

export const COMPETENCIAS: Competencia[] = [
  {
    key: "calidad",
    label: "Calidad del trabajo",
    resumen: "Qué tan bien queda hecho lo que entrega.",
    anclajes: [
      "Su trabajo casi siempre vuelve con correcciones.",
      "Entrega con errores que otro tiene que corregir seguido.",
      "Entrega bien lo habitual; en lo complejo necesita revisión.",
      "Entrega parejo y bien, casi sin necesidad de corrección.",
      "Su trabajo se toma de referencia para el resto del equipo.",
    ],
  },
  {
    key: "responsabilidad",
    label: "Cumplimiento y responsabilidad",
    resumen: "Si se puede contar con que haga lo que se comprometió.",
    anclajes: [
      "Hay que recordarle cada cosa y aun así queda pendiente.",
      "Cumple si se le insiste; se le pasan compromisos.",
      "Cumple lo que asume, con algún recordatorio.",
      "Cumple sin que nadie le recuerde y avisa si algo se complica.",
      "Se hace cargo también de lo que nadie le pidió y no queda suelto.",
    ],
  },
  {
    key: "equipo",
    label: "Trabajo en equipo",
    resumen: "Cómo suma o resta al grupo con el que trabaja.",
    anclajes: [
      "Genera roces y el equipo lo evita.",
      "Trabaja aislado y no comparte lo que sabe.",
      "Colabora cuando se lo piden.",
      "Ofrece ayuda sin que se la pidan y comparte lo que sabe.",
      "Mejora el clima del equipo: los demás rinden más con él o ella.",
    ],
  },
  {
    key: "comunicacion",
    label: "Comunicación",
    resumen: "Si lo que dice llega claro y a tiempo a quien tiene que llegar.",
    anclajes: [
      "Hay que averiguar por otro lado en qué está.",
      "Avisa tarde o de forma confusa; se generan malentendidos.",
      "Informa lo importante cuando se le pregunta.",
      "Avisa por adelantado, sobre todo cuando algo se atrasa.",
      "Explica con claridad incluso lo complicado, y a quien corresponde.",
    ],
  },
  {
    key: "cliente",
    label: "Atención al cliente",
    resumen: "Cómo queda el cliente después de tratar con esta persona.",
    anclajes: [
      "Hubo reclamos por su trato.",
      "Atiende sin ganas; el cliente queda conforme a medias.",
      "Atiende correctamente lo habitual.",
      "El cliente queda conforme y lo menciona.",
      "Clientes vuelven o preguntan por él o ella.",
    ],
  },
  {
    key: "problemas",
    label: "Resolución de problemas",
    resumen: "Qué hace cuando algo se sale de lo previsto.",
    anclajes: [
      "Se traba y espera a que otro lo resuelva.",
      "Trae el problema sin haber intentado nada.",
      "Resuelve lo conocido; consulta ante lo nuevo.",
      "Trae el problema con una propuesta de solución.",
      "Resuelve solo y previene que vuelva a pasar.",
    ],
  },
  {
    key: "adaptabilidad",
    label: "Adaptación al cambio",
    resumen: "Cómo responde cuando cambian las reglas o las prioridades.",
    anclajes: [
      "Se resiste abiertamente y frena al resto.",
      "Acepta el cambio a regañadientes y tarda en incorporarlo.",
      "Se adapta con acompañamiento.",
      "Se acomoda rápido y sin fricción.",
      "Ayuda a que el resto del equipo se adapte.",
    ],
  },
  {
    key: "asistencia",
    label: "Asistencia y puntualidad",
    resumen: "Si está cuando tiene que estar.",
    anclajes: [
      "Ausencias o llegadas tarde reiteradas sin aviso.",
      "Llega tarde seguido o avisa sobre la hora.",
      "Cumple el horario con alguna excepción avisada.",
      "Puntual y presente; avisa con tiempo cuando no puede.",
      "Puntualidad sostenida y disponibilidad cuando hizo falta.",
    ],
  },
  {
    key: "conduccion",
    label: "Conducción del equipo",
    resumen: "Cómo hace trabajar y crecer a la gente a su cargo.",
    soloJefatura: true,
    anclajes: [
      "Su equipo trabaja mal o se va.",
      "Ordena tareas pero no acompaña ni corrige a tiempo.",
      "Organiza el trabajo y su equipo cumple.",
      "Da devolución seguido y su gente mejora.",
      "Forma gente: de su equipo salen personas listas para más.",
    ],
  },
  {
    key: "desarrollo",
    label: "Aprendizaje y desarrollo",
    resumen: "Si crece en el puesto o se queda donde entró.",
    anclajes: [
      "Repite los mismos errores pese a las devoluciones.",
      "Aprende solo lo mínimo y con insistencia.",
      "Incorpora lo que se le enseña.",
      "Busca aprender por su cuenta y lo aplica.",
      "Aprende y le enseña al resto.",
    ],
  },
];

export const COMPETENCIAS_POR_KEY: Record<string, Competencia> =
  Object.fromEntries(COMPETENCIAS.map((c) => [c.key, c]));

/** Las que aplican a un puesto, según conduzca gente o no. */
export function competenciasPara(conduce: boolean): Competencia[] {
  return COMPETENCIAS.filter((c) => conduce || !c.soloJefatura);
}

export const NIVELES = [
  { valor: 1, label: "Muy por debajo" },
  { valor: 2, label: "Por debajo" },
  { valor: 3, label: "En lo esperado" },
  { valor: 4, label: "Por encima" },
  { valor: 5, label: "Sobresaliente" },
] as const;
