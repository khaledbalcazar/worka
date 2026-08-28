// Contenido de posicionamiento de Worka Evaluar.
//
// ── Por qué en código y no en la base ─────────────────────────
//
// El blog de Worka Empleos vive en blog_posts porque es un flujo: se publica
// seguido y lo escribe cualquiera desde el backoffice. Esto es otra cosa —
// media docena de notas de fondo que casi no cambian y que son el argumento
// de venta del producto. En código se versionan, pasan por revisión y no se
// pueden publicar a medias.
//
// ── Por qué en el subdominio ──────────────────────────────────
//
// La autoridad que gana una página se la queda su dominio. Publicar esto en
// worka.click/blog ayudaría a la bolsa de empleo; publicarlo acá construye
// evaluar.worka.click, que es lo que tiene que posicionar.
//
// ── Sobre qué se escribe ──────────────────────────────────────
//
// Cada nota responde algo que alguien busca ANTES de saber que existe un
// producto que lo resuelve. Quien busca "worka evaluar" ya nos conoce; quien
// busca "cómo evaluar a un cajero" es a quien hay que llegar.

export type Bloque =
  | { t: "p"; x: string }
  | { t: "h2"; x: string }
  | { t: "h3"; x: string }
  | { t: "ul"; x: string[] }
  | { t: "ol"; x: string[] }
  | { t: "cita"; x: string }
  | { t: "caja"; titulo: string; x: string };

export type Recurso = {
  slug: string;
  titulo: string;
  /** El de la pestaña y el resultado de Google. Distinto del H1. */
  tituloSeo: string;
  bajada: string;
  descripcion: string;
  /** Para agrupar en el índice. */
  tema: "Selección" | "Integridad" | "Desempeño" | "Evaluación";
  minutos: number;
  fecha: string;
  bloques: Bloque[];
};

export const RECURSOS: Recurso[] = [
  {
    slug: "como-evaluar-un-cajero-antes-de-contratarlo",
    titulo: "Cómo evaluar a un cajero antes de contratarlo",
    tituloSeo:
      "Cómo evaluar a un cajero antes de contratarlo: qué medir y cómo",
    bajada:
      "Qué predice de verdad que alguien vaya a rendir en caja, qué preguntar y qué mirar antes de darle las llaves.",
    descripcion:
      "Guía práctica para evaluar candidatos a cajero en Paraguay: qué competencias importan, cómo medirlas, qué preguntas hacer en la entrevista y qué señales mirar antes de contratar.",
    tema: "Selección",
    minutos: 7,
    fecha: "2026-08-27",
    bloques: [
      {
        t: "p",
        x: "Un cajero maneja plata todos los días, atiende a gente apurada y es la última cara que ve el cliente antes de irse. Contratar mal en ese puesto se paga tres veces: en faltantes, en clientes que no vuelven y en el tiempo de volver a buscar.",
      },
      {
        t: "p",
        x: "Y sin embargo casi siempre se decide igual: una entrevista de veinte minutos, un CV que dice «responsable y proactivo» y una corazonada. Esta nota es sobre qué mirar en su lugar.",
      },

      { t: "h2", x: "Qué predice el desempeño en caja" },
      {
        t: "p",
        x: "La experiencia previa importa menos de lo que se cree. Alguien que estuvo dos años en otra caja aprendió ese sistema, no necesariamente el oficio. Lo que sí distingue a quien funciona en el puesto son cuatro cosas, y ninguna aparece en un CV:",
      },
      {
        t: "ul",
        x: [
          "**Atención al detalle.** No es «ser prolijo»: es notar que el vuelto no cierra antes de entregarlo. Se mide con tareas donde hay que detectar un error chico entre cosas que se parecen.",
          "**Tolerancia a la presión.** La caja no se complica en un día tranquilo. Se complica el sábado a la tarde con seis personas esperando y una que reclama.",
          "**Orientación al cliente.** Que el que reclama se vaya conforme, no que se vaya callado.",
          "**Cuidado de lo ajeno.** Qué le parece a esa persona que un compañero se lleve algo de poco valor. No es lo mismo que preguntarle si robó.",
        ],
      },

      { t: "h2", x: "Qué preguntar en la entrevista" },
      {
        t: "p",
        x: "Las preguntas que todo el mundo hace —«¿cuál es tu mayor defecto?», «¿dónde te ves en cinco años?»— tienen respuesta ensayada. Cambian poco entre el mejor y el peor candidato, así que no separan a nadie.",
      },
      {
        t: "p",
        x: "Las que sirven describen una situación concreta del puesto y dejan que la persona la resuelva en voz alta:",
      },
      {
        t: "ol",
        x: [
          "«Cerrás la caja y te faltan quince mil guaraníes. ¿Qué hacés?» Lo que importa no es la respuesta correcta sino si avisa, si intenta cubrirlo o si lo minimiza.",
          "«Un cliente insiste en que le cobraste de más y hay cuatro personas esperando. ¿Cómo lo resolvés?» Se escucha si prioriza al cliente, a la fila, o a tener razón.",
          "«Un compañero te pide que le marques la entrada porque va a llegar tarde. ¿Qué le decís?» Sin acusar a nadie, muestra dónde pone el límite.",
        ],
      },
      {
        t: "caja",
        titulo: "Lo que no hay que preguntar",
        x: "Edad, estado civil, si tiene hijos o si piensa tenerlos, religión, salud. Además de ser discriminatorio, no predice nada sobre el desempeño — y preguntado en una entrevista, deja a la empresa sin forma de defender la decisión si después se cuestiona.",
      },

      { t: "h2", x: "Por qué la entrevista sola no alcanza" },
      {
        t: "p",
        x: "El problema de la entrevista no es que sea inútil: es que mide una sola cosa muy bien, y no es la que uno cree. Mide qué tan cómoda está la persona hablando con un desconocido durante veinte minutos.",
      },
      {
        t: "p",
        x: "Eso favorece al que tiene labia y castiga al que se pone nervioso — dos rasgos que en la caja no cambian nada. El que cae simpático arranca el lunes, y a los dos meses ya no está.",
      },
      {
        t: "p",
        x: "Por eso conviene sumar algo que todos respondan igual, en las mismas condiciones, y que se corrija con la misma vara. No para reemplazar la entrevista, sino para llegar a ella sabiendo a quién tenés enfrente.",
      },

      { t: "h2", x: "Cómo armar una evaluación que la gente termine" },
      {
        t: "p",
        x: "El error más común es hacerla larga. Una evaluación de cuarenta minutos parece más seria, pero la mitad de la gente la abandona a la mitad — y los que abandonan no son los peores: son los que tienen otra oferta.",
      },
      {
        t: "ul",
        x: [
          "**Quince minutos como techo.** Alcanza para medir lo que importa.",
          "**Que arranque donde la persona ya está interesada**, no tres días después por correo.",
          "**Que se pueda hacer del celular**, de noche o el domingo. Quien está buscando trabajo suele estar trabajando.",
          "**Que no pida crear una cuenta.** Cada paso que agregás es gente que se cae.",
          "**Que la persona sepa en qué terminó**, aunque quede afuera. Los que se van sin bronca son los que después te recomiendan.",
        ],
      },

      { t: "h2", x: "Qué mirar antes de decidir" },
      {
        t: "p",
        x: "Cuando ya tenés los resultados, tres cosas antes de elegir:",
      },
      {
        t: "ol",
        x: [
          "**¿La respuesta es confiable?** Si alguien contestó veinticinco preguntas en cuarenta segundos, o marcó todo igual, ese perfil no describe a nadie. Eso se mira primero, no después.",
          "**¿Contra quién es ese puntaje?** Un 72% no significa nada solo. Significa algo cuando sabés si está arriba o abajo del resto de los que rindieron.",
          "**¿La prueba separó?** Si los veinte sacaron entre 68 y 72, esa prueba no distinguió a nadie y elegir por ahí es tirar una moneda.",
        ],
      },
      {
        t: "cita",
        x: "Ningún puntaje alcanza por sí solo para descartar a una persona. Lo que hace es decirte con quién conviene hablar más, y qué preguntarle.",
      },
    ],
  },

  {
    slug: "test-de-integridad-laboral",
    titulo: "Qué es un test de integridad laboral (y qué no es)",
    tituloSeo:
      "Test de integridad laboral: qué mide, qué no, y cómo se lee",
    bajada:
      "Miden actitudes, no confesiones. Qué se puede concluir de un resultado, qué no, y por qué preguntarle a alguien si robó es mala idea.",
    descripcion:
      "Qué es un test de integridad laboral, qué factores mide, por qué las pruebas actitudinales predicen mejor que las confesionales, y cómo interpretar el resultado sin convertirlo en una acusación.",
    tema: "Integridad",
    minutos: 6,
    fecha: "2026-08-27",
    bloques: [
      {
        t: "p",
        x: "«¿Hay forma de saber si esta persona es honesta?» Es una de las preguntas más frecuentes de quien contrata para caja, depósito o reparto. La respuesta corta es no. La larga es más útil.",
      },

      { t: "h2", x: "Qué miden en realidad" },
      {
        t: "p",
        x: "Un test de integridad laboral no detecta a nadie. Lo que hace es preguntar qué le parece aceptable a la persona en situaciones de trabajo, y comparar sus respuestas con las de quienes toleran ciertas conductas.",
      },
      {
        t: "p",
        x: "La diferencia importa. Un resultado bajo no dice «esta persona robó»: dice «sus respuestas se parecen a las de quienes justifican llevarse cosas». Es un indicador para repreguntar, no un veredicto.",
      },

      { t: "h2", x: "Actitudinal contra confesional" },
      {
        t: "p",
        x: "Hay dos maneras de armar estos instrumentos, y una es claramente peor.",
      },
      {
        t: "p",
        x: "La **confesional** pregunta por conducta pasada: si alguna vez se llevó algo, si consumió antes de trabajar. Suena más directa y tiene tres problemas:",
      },
      {
        t: "ol",
        x: [
          "**Legal.** Un cuestionario que pide admitir delitos convierte a la empresa en depositaria de una confesión, con todo lo que eso pesa si después hay un juicio laboral.",
          "**De validez.** Quien efectivamente robó no lo va a marcar en un formulario. El ítem filtra sinceridad, no conducta.",
          "**De privacidad.** Preguntar por consumo personal es indagar sobre salud, que es un dato protegido. Eso solo expone a la empresa a un reclamo por discriminación.",
        ],
      },
      {
        t: "p",
        x: "La **actitudinal** pregunta qué opina la persona de situaciones concretas: si llevarse algo de poco valor le parece grave, si taparía a un compañero que viene en malas condiciones, si prestar su usuario y clave tiene algo de malo. Predice igual o mejor, sin ninguno de esos tres costos.",
      },

      { t: "h2", x: "Qué factores se miden" },
      {
        t: "p",
        x: "Los instrumentos serios no dan un número único de «honestidad». Separan en factores, porque alguien puede cuidar mucho el dinero y ser laxo con los datos de los clientes:",
      },
      {
        t: "ul",
        x: [
          "**Cuidado de los bienes** — qué le parece usar o llevarse cosas de la empresa.",
          "**Manejo del conflicto** — si ve la reacción fuerte como una respuesta legítima.",
          "**Seguridad en el trabajo** — qué opina de saltear normas o de encubrir a quien lo hace.",
          "**Respeto en el trato** — si naturaliza el maltrato entre compañeros.",
          "**Límites personales** — si distingue qué está fuera de lugar.",
          "**Uso de la información** — cómo trata claves, datos de clientes y lo confidencial.",
        ],
      },

      { t: "h2", x: "Las escalas que dicen si el resto sirve" },
      {
        t: "p",
        x: "Esta es la parte que casi nadie mira y la que más importa. Un buen instrumento incluye dos escalas que no miden riesgo sino **credibilidad**:",
      },
      {
        t: "ul",
        x: [
          "**Veracidad.** Frases que casi nadie cumple del todo: «nunca en mi vida llegué tarde», «jamás dije una mentira». Marcarlas todas como propias no habla de una persona intachable: habla de alguien contestando lo que cree que queremos leer.",
          "**Distorsión.** Consistencia entre preguntas equivalentes. Si se contradice, el perfil describe una imagen y no a la persona.",
        ],
      },
      {
        t: "caja",
        titulo: "Si estas dos escalas están en rojo",
        x: "El resto del resultado no se lee. No porque la persona sea deshonesta, sino porque lo que contestó no la describe. Conviene volver a tomarlo o directamente ignorar ese perfil.",
      },

      { t: "h2", x: "Cómo se usa un resultado sin meterse en problemas" },
      {
        t: "ol",
        x: [
          "**Nunca como único criterio.** Un factor bajo no descarta a nadie por sí solo, y usarlo así es indefendible si la decisión se cuestiona después.",
          "**Se repregunta, no se lee en voz alta.** La forma de usar un factor en amarillo es plantearle a la persona una situación concreta del puesto y escuchar cómo la resolvería. Decirle «te dio bajo en integridad» no es una entrevista: es una acusación.",
          "**No se comparte más allá de quien decide.** Un resultado de este tipo circulando por la oficina es un problema serio, para la persona y para la empresa.",
          "**Se guarda el criterio, no solo el número.** Si a los seis meses alguien pregunta por qué se eligió a esta persona, tiene que constar qué se midió y con qué vara.",
        ],
      },
      {
        t: "cita",
        x: "Un test de integridad bien usado no te dice a quién no contratar. Te dice con quién conviene conversar un poco más antes de darle las llaves.",
      },
    ],
  },

  {
    slug: "evaluacion-de-desempeno-que-no-sea-un-tramite",
    titulo: "Evaluación de desempeño: cómo hacer que sirva para algo",
    tituloSeo:
      "Evaluación de desempeño: cómo hacerla bien (con ejemplos)",
    bajada:
      "Por qué las planillas de estrellas no funcionan, qué son los anclajes de conducta, y cómo hacer que la reunión anual deje de ser un trámite.",
    descripcion:
      "Cómo hacer una evaluación de desempeño que sirva: anclajes de conducta en vez de estrellas, comparación con la autoevaluación, y qué hacer con el resultado.",
    tema: "Desempeño",
    minutos: 7,
    fecha: "2026-08-27",
    bloques: [
      {
        t: "p",
        x: "La mayoría de las evaluaciones de desempeño se completan en quince minutos, la semana que vence el plazo, con la persona ya en la cabeza del jefe y el formulario como trámite. Salen números que nadie mira y una reunión incómoda que ninguno de los dos quería tener.",
      },
      {
        t: "p",
        x: "El problema casi nunca es la gente. Es cómo está armado el instrumento.",
      },

      { t: "h2", x: "Por qué las estrellas no funcionan" },
      {
        t: "p",
        x: "«Calificá comunicación del 1 al 5» parece simple y es el origen de casi todo lo que sale mal. Produce números que dependen de quién califica, no de quién es calificado:",
      },
      {
        t: "ul",
        x: [
          "El jefe exigente pone 3 donde el complaciente pone 5. Comparar dos áreas se vuelve imposible.",
          "Aparece el **efecto halo**: alguien que cae bien puntúa alto en todo, incluso en lo que no se le vio.",
          "Y la **indulgencia**: como nadie quiere la conversación difícil, casi todos terminan entre 3 y 4. La escala se comprime y deja de distinguir.",
        ],
      },
      {
        t: "p",
        x: "Sobre todo, un número no le dice nada a la persona. «Te puse 3 en comunicación» no se puede accionar. ¿Qué hago distinto el lunes?",
      },

      { t: "h2", x: "Los anclajes de conducta" },
      {
        t: "p",
        x: "La corrección es vieja y conocida, y casi nadie la aplica: en vez de pedir un número, se describen los cinco niveles en conducta observable y el evaluador elige el que más se parece a lo que vio.",
      },
      { t: "h3", x: "Ejemplo: comunicación" },
      {
        t: "ol",
        x: [
          "Hay que averiguar por otro lado en qué está.",
          "Avisa tarde o de forma confusa; se generan malentendidos.",
          "Informa lo importante cuando se le pregunta.",
          "Avisa por adelantado, sobre todo cuando algo se atrasa.",
          "Explica con claridad incluso lo complicado, y a quien corresponde.",
        ],
      },
      {
        t: "p",
        x: "Cambia tres cosas de golpe. El 4 significa lo mismo en depósito que en ventas, así que las áreas se pueden comparar. El evaluador tiene que pensar en algo que vio, no en una impresión general. Y la persona sale de la reunión con una frase concreta: «necesito avisar antes cuando algo se atrasa».",
      },
      {
        t: "caja",
        titulo: "Escribilos en conducta, no en adjetivos",
        x: "«Es proactivo» y «tiene actitud» no se pueden ver ni discutir. «Trae el problema con una propuesta de solución» sí: o pasó o no pasó.",
      },

      { t: "h2", x: "La autoevaluación, bien usada" },
      {
        t: "p",
        x: "Pedirle a la persona que se evalúe suele terminar en un ejercicio decorativo: se archiva y no se compara con nada. La lectura útil está justo en la comparación.",
      },
      {
        t: "ul",
        x: [
          "**Se pone 5 y su jefe le pone 2.** Ahí está la conversación que se viene postergando hace un año. Y casi siempre significa que la devolución no está llegando: nadie le dijo nunca cómo venía.",
          "**Se pone 2 y su jefe le pone 5.** Esa persona se subestima, y probablemente nunca va a pedir lo que le corresponde — hasta que se va a otro lado donde sí se lo ofrecen.",
        ],
      },
      {
        t: "p",
        x: "La brecha más grande es por donde conviene empezar a hablar. Es más útil que el promedio de los dos.",
      },

      { t: "h2", x: "Errores que arruinan el ciclo" },
      {
        t: "ol",
        x: [
          "**Evaluar veinte competencias.** El evaluador se cansa a la cuarta y el resto lo completa de memoria. Con seis u ocho alcanza.",
          "**Hacerla una vez al año y nada más.** Si la primera devolución que recibe alguien en doce meses es la formal, ya llegó tarde.",
          "**Atarla al aumento en la misma reunión.** Cuando hay plata sobre la mesa, nadie escucha la devolución: negocia.",
          "**No cerrar con compromisos.** Sin algo concreto acordado para el próximo período, la reunión no cambió nada.",
          "**Confundir el acuse con la conformidad.** Que la persona firme que la leyó no es que esté de acuerdo, y presentarlo así es arrancarle una firma. Tiene que poder dejar su desacuerdo escrito, en el mismo lugar.",
        ],
      },
      {
        t: "cita",
        x: "Una evaluación de desempeño sirve cuando la persona sale sabiendo qué hacer distinto y cuándo se va a volver a mirar. Todo lo demás es papeleo.",
      },
    ],
  },

  {
    slug: "test-psicometrico-laboral-que-mide",
    titulo: "Test psicométrico laboral: qué mide y qué no",
    tituloSeo:
      "Test psicométrico laboral: qué mide realmente y cómo se interpreta",
    bajada:
      "Personalidad, razonamiento y juicio situacional miden cosas distintas. Cuál conviene según el puesto, y por qué un puntaje sin percentil no dice nada.",
    descripcion:
      "Qué mide un test psicométrico laboral: diferencias entre pruebas de personalidad, razonamiento y juicio situacional, cuál usar según el puesto y cómo interpretar los resultados.",
    tema: "Evaluación",
    minutos: 6,
    fecha: "2026-08-27",
    bloques: [
      {
        t: "p",
        x: "«Test psicométrico» se usa como si fuera una sola cosa. En realidad agrupa instrumentos que miden cosas muy distintas, y elegir el equivocado es la forma más común de perder el tiempo y el de los candidatos.",
      },

      { t: "h2", x: "Las tres familias" },
      { t: "h3", x: "Personalidad" },
      {
        t: "p",
        x: "Describen estilos de trabajo: si la persona prefiere que le marquen los pasos o arrancar sola, si ordena antes de empezar o resuelve sobre la marcha. El modelo más usado y mejor estudiado son los Cinco Grandes.",
      },
      {
        t: "p",
        x: "**No hay respuestas correctas y no hay perfiles buenos ni malos.** Alguien muy detallista es excelente en control de stock y demasiado lento en un mostrador con fila. El resultado solo tiene sentido contra un puesto concreto.",
      },
      { t: "h3", x: "Razonamiento" },
      {
        t: "p",
        x: "Series numéricas, fichas de dominó, analogías. Acá sí hay respuestas correctas, y son las pruebas con mejor capacidad predictiva del desempeño en general — sobre todo en puestos que exigen aprender cosas nuevas seguido.",
      },
      {
        t: "p",
        x: "Van con reloj a propósito: sin límite de tiempo dejan de medir razonamiento y pasan a medir paciencia.",
      },
      { t: "h3", x: "Juicio situacional" },
      {
        t: "p",
        x: "Situaciones reales del puesto con varias formas de reaccionar. No hay una correcta y muchas absurdas: casi todas son defendibles, y la diferencia está en el orden de prioridades. Son las que mejor se entienden y las que menos rechazo generan en el candidato.",
      },

      { t: "h2", x: "Cuál usar según el puesto" },
      {
        t: "ul",
        x: [
          "**Atención al público** (cajero, mostrador, call center): juicio situacional primero, personalidad después. El razonamiento aporta poco.",
          "**Puestos técnicos o con capacitación larga**: razonamiento, que es lo que predice cuánto tarda en estar productivo.",
          "**Manejo de valores o accesos** (caja, depósito, sistemas): sumar integridad laboral.",
          "**Conducción de equipos**: personalidad y juicio situacional, con situaciones de conflicto entre personas.",
        ],
      },

      { t: "h2", x: "Por qué un puntaje solo no dice nada" },
      {
        t: "p",
        x: "Este es el error de lectura más común. «Sacó 72%» no significa nada sin dos cosas al lado.",
      },
      {
        t: "p",
        x: "**Contra quién.** Un 72 puede ser el mejor de la camada o la mitad de abajo. Eso lo contesta el percentil: cuánta gente quedó por debajo. Un percentil 85 dice que superó al 85% de quienes rindieron lo mismo.",
      },
      {
        t: "p",
        x: "**Si la respuesta es confiable.** Alguien que puso «de acuerdo» en los veinticinco ítems, o que los contestó en cuarenta segundos, también saca un número — y ese número no describe a nadie. Eso se mira antes que el resultado, no después.",
      },
      {
        t: "caja",
        titulo: "Y una tercera, del lado de la prueba",
        x: "Si todos los candidatos sacaron entre 68 y 72, esa prueba no separó a nadie. No sirve para elegir: conviene subirle la dificultad o medir otra cosa.",
      },

      { t: "h2", x: "Qué mirar al elegir un instrumento" },
      {
        t: "ol",
        x: [
          "**Que diga de dónde salen los ítems.** Los Cinco Grandes serios usan el IPIP, un banco de dominio público hecho justamente para que existan alternativas abiertas y citables.",
          "**Que esté en el castellano de acá.** Un test traducido de España mide comprensión de modismos ajenos además de lo que dice medir.",
          "**Que tenga escalas de validez.** Si no puede decirte cuándo alguien contestó para quedar bien, no podés confiar en ningún resultado.",
          "**Que la interpretación venga escrita.** Un número sin una frase que lo explique termina interpretado por quien tenga menos idea.",
          "**Que le explique al candidato qué le van a tomar.** Alguien que entra a ciegas rinde peor, y ahí estás midiendo ansiedad.",
        ],
      },
      {
        t: "cita",
        x: "Los resultados de personalidad describen estilos de trabajo, no capacidad. Entran a la conversación junto a la entrevista y la experiencia, nunca en lugar de ellas.",
      },
    ],
  },
];

export function getRecurso(slug: string): Recurso | undefined {
  return RECURSOS.find((r) => r.slug === slug);
}

/** Las otras dos del mismo tema, o las más recientes. Para el pie de la nota. */
export function relacionados(slug: string, cuantos = 2): Recurso[] {
  const actual = getRecurso(slug);
  const resto = RECURSOS.filter((r) => r.slug !== slug);
  if (!actual) return resto.slice(0, cuantos);
  return [
    ...resto.filter((r) => r.tema === actual.tema),
    ...resto.filter((r) => r.tema !== actual.tema),
  ].slice(0, cuantos);
}
