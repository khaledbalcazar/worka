// Bancos de ítems de escala de acuerdo (likert): Cinco Grandes ampliado y
// competencias conductuales.
//
// Todos los ítems son originales de Worka. Cada rasgo tiene ítems derechos e
// inversos en cantidades parecidas: sin inversos, quien marca "de acuerdo" en
// todo saca un perfil alto en todo, y la inconsistencia (report.ts) no se
// puede detectar.
//
// Ninguno de estos bancos tiene todavía estudios de confiabilidad ni de
// validez propios. Se presentan como descripción de estilos, nunca como
// predicción de desempeño.

import type { TemplateQuestion } from "../templates";

const L = (
  text: string,
  dimension: string,
  reverse = false
): TemplateQuestion => ({ text, kind: "likert", dimension, ...(reverse ? { reverse: true } : {}) });

// ── Cinco Grandes: 60 ítems nuevos (12 por rasgo) ──────────────
// Se suman a los 25 de la versión corta para formar un banco de 85 del que
// cada candidato recibe una muestra estratificada por rasgo.
export const BIG5_EXTRA: TemplateQuestion[] = [
  // Apertura
  L("Me entusiasma aprender una forma nueva de hacer mi trabajo.", "apertura"),
  L("Prefiero las tareas que ya conozco a las que tengo que descubrir.", "apertura", true),
  L("Me gusta entender por qué las cosas funcionan como funcionan.", "apertura"),
  L("Las ideas raras me parecen una pérdida de tiempo.", "apertura", true),
  L("Disfruto probando comidas, lugares o música que no conozco.", "apertura"),
  L("Me aburre hablar de temas que no tienen una aplicación práctica.", "apertura", true),
  L("Se me ocurren varias soluciones para un mismo problema.", "apertura"),
  L("Si algo funciona, no veo por qué cambiarlo.", "apertura", true),
  L("Me interesa escuchar puntos de vista muy distintos al mío.", "apertura"),
  L("Leer o mirar algo sobre un tema nuevo me cansa rápido.", "apertura", true),
  L("Me imagino seguido cómo se podría mejorar lo que hago.", "apertura"),
  L("Me siento incómodo/a cuando las reglas no están claras desde el principio.", "apertura", true),

  // Tesón (responsabilidad)
  L("Antes de irme reviso que no me haya quedado nada pendiente.", "teson"),
  L("Muchas veces dejo las cosas para último momento.", "teson", true),
  L("Cumplo lo que prometo aunque me cueste.", "teson"),
  L("Me cuesta mantener mis cosas ordenadas.", "teson", true),
  L("Llego a horario aunque nadie lo controle.", "teson"),
  L("Si una tarea es aburrida, la hago a medias.", "teson", true),
  L("Anoto lo que tengo que hacer para no olvidarme.", "teson"),
  L("A veces me olvido de avisar cuando no voy a llegar a tiempo.", "teson", true),
  L("Termino una tarea antes de empezar otra.", "teson"),
  L("Me distraigo con facilidad cuando trabajo solo/a.", "teson", true),
  L("Me gusta que mi trabajo quede bien hecho, aunque nadie lo revise.", "teson"),
  L("Cambio de plan seguido sin terminar lo que empecé.", "teson", true),

  // Extraversión
  L("Me cargo de energía estando con otras personas.", "extraversion"),
  L("Después de un día con mucha gente necesito estar solo/a un buen rato.", "extraversion", true),
  L("Me animo a hablar en público aunque me pongan nervioso/a.", "extraversion"),
  L("Prefiero escribir un mensaje antes que llamar por teléfono.", "extraversion", true),
  L("En un grupo nuevo, suelo ser quien rompe el hielo.", "extraversion"),
  L("Me siento más cómodo/a escuchando que hablando.", "extraversion", true),
  L("Disfruto atender a muchas personas en un mismo día.", "extraversion"),
  L("Evito los lugares donde hay mucho ruido y movimiento.", "extraversion", true),
  L("Me resulta fácil contagiar entusiasmo a los demás.", "extraversion"),
  L("Me cuesta pedir algo a alguien que no conozco.", "extraversion", true),
  L("Me gusta que me den tareas donde tenga que tratar con gente.", "extraversion"),
  L("En las reuniones espero a que otros hablen primero.", "extraversion", true),

  // Amabilidad
  L("Confío en que la mayoría de la gente hace las cosas con buena intención.", "amabilidad"),
  L("Si alguien se equivoca conmigo, me cuesta perdonarlo.", "amabilidad", true),
  L("Cedo en algo mío si eso ayuda a que el equipo esté bien.", "amabilidad"),
  L("Digo lo que pienso aunque sepa que va a lastimar.", "amabilidad", true),
  L("Me doy cuenta cuando un compañero está pasando un mal momento.", "amabilidad"),
  L("Los problemas de los demás no son asunto mío.", "amabilidad", true),
  L("Trato con el mismo respeto a un cliente que a un compañero.", "amabilidad"),
  L("Discuto hasta ganar aunque el tema sea menor.", "amabilidad", true),
  L("Agradezco cuando alguien me ayuda, aunque sea algo chico.", "amabilidad"),
  L("Me molesta tener que explicar las cosas más de una vez.", "amabilidad", true),
  L("Prefiero resolver un desacuerdo hablando antes que imponiendo.", "amabilidad"),
  L("Desconfío de quien es amable conmigo sin motivo.", "amabilidad", true),

  // Estabilidad emocional
  L("Mantengo la calma cuando las cosas se complican.", "estabilidad"),
  L("Me preocupo mucho por cosas que después no pasan.", "estabilidad", true),
  L("Un mal día en el trabajo no me arruina el resto de la semana.", "estabilidad"),
  L("Me altero con facilidad cuando algo no sale como esperaba.", "estabilidad", true),
  L("Puedo recibir una crítica sin tomármela como algo personal.", "estabilidad"),
  L("Me cuesta dormir cuando tengo algo pendiente.", "estabilidad", true),
  L("Cuando me equivoco, lo corrijo y sigo adelante.", "estabilidad"),
  L("Cambio de humor varias veces en el mismo día.", "estabilidad", true),
  L("Trabajar con el tiempo justo no me paraliza.", "estabilidad"),
  L("Me siento inseguro/a cuando tengo que tomar una decisión solo/a.", "estabilidad", true),
  L("Puedo dejar los problemas del trabajo en el trabajo.", "estabilidad"),
  L("Me pongo nervioso/a cuando alguien me observa mientras trabajo.", "estabilidad", true),
];

// ── Competencias conductuales: 60 ítems (10 por competencia) ───
export const COMPETENCIAS_DIMENSIONES = [
  { key: "resultados", label: "Orientación a resultados", high: "Se pone metas y empuja hasta cumplirlas.", low: "Cumple lo pedido sin buscar más." },
  { key: "responsabilidad", label: "Responsabilidad", high: "Se hace cargo de lo suyo y de sus errores.", low: "Tiende a esperar que otros resuelvan." },
  { key: "comunicacion", label: "Comunicación", high: "Explica claro y se asegura de que se entendió.", low: "Da por hecho que el otro entendió." },
  { key: "aprendizaje", label: "Aprendizaje continuo", high: "Busca aprender y pide devolución.", low: "Aprende cuando se lo exigen." },
  { key: "autocontrol", label: "Autocontrol", high: "Responde con calma aun bajo tensión.", low: "Reacciona en caliente." },
  { key: "iniciativa", label: "Iniciativa", high: "Ve lo que falta y lo hace sin que se lo pidan.", low: "Espera indicaciones para actuar." },
];

export const COMPETENCIAS: TemplateQuestion[] = [
  // Orientación a resultados
  L("Me pongo metas propias, además de las que me pide la empresa.", "resultados"),
  L("Si cumplí con lo mínimo, no veo motivo para hacer más.", "resultados", true),
  L("Mido cuánto avancé para saber si voy bien.", "resultados"),
  L("Cuando una meta es difícil, prefiero bajarla antes que intentarlo.", "resultados", true),
  L("Busco la forma de hacer lo mismo en menos tiempo.", "resultados"),
  L("Me da igual si el resultado sale un poco peor de lo esperado.", "resultados", true),
  L("Me esfuerzo más cuando sé que mi trabajo se va a medir.", "resultados"),
  L("Abandono una tarea cuando aparecen obstáculos.", "resultados", true),
  L("Me siento satisfecho/a cuando supero lo que me propuse.", "resultados"),
  L("Prefiero no comprometerme con números concretos.", "resultados", true),

  // Responsabilidad
  L("Si me equivoco, lo digo antes de que alguien lo descubra.", "responsabilidad"),
  L("Cuando algo sale mal, suele ser por culpa de otros.", "responsabilidad", true),
  L("Cuido las herramientas y los materiales como si fueran míos.", "responsabilidad"),
  L("Si nadie me controla, me tomo las cosas con más calma.", "responsabilidad", true),
  L("Aviso con tiempo cuando no voy a poder cumplir algo.", "responsabilidad"),
  L("Dejo para el compañero del turno siguiente lo que no alcancé a terminar, sin avisar.", "responsabilidad", true),
  L("Respeto los procedimientos aunque me parezcan lentos.", "responsabilidad"),
  L("Prometo cosas que después no puedo cumplir.", "responsabilidad", true),
  L("Me hago cargo de lo que me toca aunque no me guste.", "responsabilidad"),
  L("Si un error no lo nota nadie, no hace falta corregirlo.", "responsabilidad", true),

  // Comunicación
  L("Antes de terminar una conversación, confirmo que se entendió lo acordado.", "comunicacion"),
  L("Me cuesta explicar lo que hago a alguien que no es del área.", "comunicacion", true),
  L("Escucho hasta el final antes de responder.", "comunicacion"),
  L("Interrumpo cuando ya sé lo que el otro me va a decir.", "comunicacion", true),
  L("Adapto mi forma de hablar a la persona que tengo enfrente.", "comunicacion"),
  L("Mis mensajes escritos suelen generar malentendidos.", "comunicacion", true),
  L("Pregunto cuando algo no me quedó claro.", "comunicacion"),
  L("Prefiero no decir que no entendí para no quedar mal.", "comunicacion", true),
  L("Doy malas noticias de forma directa pero respetuosa.", "comunicacion"),
  L("Cuando estoy apurado/a, contesto con monosílabos.", "comunicacion", true),

  // Aprendizaje continuo
  L("Pido que me digan qué puedo mejorar.", "aprendizaje"),
  L("Una vez que aprendí a hacer mi trabajo, no necesito aprender más.", "aprendizaje", true),
  L("Aprovecho los momentos libres para aprender algo útil para mi puesto.", "aprendizaje"),
  L("Las capacitaciones me parecen una pérdida de tiempo.", "aprendizaje", true),
  L("Cuando cometo un error, pienso qué hacer distinto la próxima vez.", "aprendizaje"),
  L("Me molesta que me corrijan delante de otros, aunque tengan razón.", "aprendizaje", true),
  L("Observo cómo trabajan los que mejor lo hacen para copiar lo bueno.", "aprendizaje"),
  L("Me cuesta usar un sistema nuevo y prefiero seguir con el de antes.", "aprendizaje", true),
  L("Busco por mi cuenta cómo resolver algo que no sé hacer.", "aprendizaje"),
  L("Si algo me sale mal dos veces, dejo de intentarlo.", "aprendizaje", true),

  // Autocontrol
  L("Puedo atender a un cliente enojado sin perder la calma.", "autocontrol"),
  L("Cuando alguien me levanta la voz, respondo en el mismo tono.", "autocontrol", true),
  L("Pienso antes de contestar un mensaje que me molestó.", "autocontrol"),
  L("Si estoy de mal humor, se me nota en el trato.", "autocontrol", true),
  L("Puedo esperar el momento adecuado para plantear un reclamo.", "autocontrol"),
  L("Digo cosas en caliente de las que después me arrepiento.", "autocontrol", true),
  L("Sigo trabajando bien aunque haya un conflicto en el equipo.", "autocontrol"),
  L("Me cuesta disimular cuando alguien no me cae bien.", "autocontrol", true),
  L("Respiro y me ordeno antes de resolver una situación tensa.", "autocontrol"),
  L("Cuando me frustro, abandono lo que estoy haciendo.", "autocontrol", true),

  // Iniciativa
  L("Si veo algo que falta, lo hago sin que me lo pidan.", "iniciativa"),
  L("Espero a que me digan qué hacer antes de moverme.", "iniciativa", true),
  L("Propongo mejoras aunque no sean parte de mi tarea.", "iniciativa"),
  L("Si un problema no es de mi área, no me meto.", "iniciativa", true),
  L("Me ofrezco para tareas nuevas antes de que las asignen.", "iniciativa"),
  L("Cuando termino lo mío, espero hasta que me den algo más.", "iniciativa", true),
  L("Busco soluciones antes de llevarle un problema al jefe.", "iniciativa"),
  L("Prefiero no proponer ideas por si salen mal.", "iniciativa", true),
  L("Me adelanto a lo que va a necesitar el cliente.", "iniciativa"),
  L("Hago solo lo que figura en mi descripción de puesto.", "iniciativa", true),
];
