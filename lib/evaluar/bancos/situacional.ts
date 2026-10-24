// Bancos de juicio situacional y de entrevista conductual.
//
// Juicio situacional: cada escena tiene cuatro respuestas con puntos 3, 2, 1
// y 0. No hay una "correcta": hay mejores y peores, y las intermedias suman
// algo. Las escenas son de trabajo en Paraguay (caja, salón, depósito,
// oficina, supervisión) y originales de Worka.
//
// Entrevista conductual: preguntas abiertas del tipo "contame una vez que…".
// No se corrigen solas; las mira una persona, idealmente con una rúbrica.

import type { TemplateQuestion } from "../templates";

let orden = 0;
// Las opciones se rotan para que la mejor no quede siempre en el mismo
// lugar cuando la etapa no mezcla opciones.
function S(
  text: string,
  dimension: string,
  [mejor, buena, floja, mala]: [string, string, string, string]
): TemplateQuestion {
  const base = [mejor, buena, floja, mala];
  const k = orden++ % 4;
  const options = [...base.slice(k), ...base.slice(0, k)];
  return {
    text,
    kind: "unica",
    dimension,
    options,
    optionScores: { [mejor]: 3, [buena]: 2, [floja]: 1, [mala]: 0 },
  };
}

export const SJT_DIMENSIONES_EXTRA = [
  { key: "liderazgo_sjt", label: "Conducción (juicio situacional)", high: "Ordena al equipo y sostiene el criterio con respeto.", low: "Evita intervenir o impone sin escuchar." },
];

// ── Juicio situacional: 40 escenas ─────────────────────────────
export const SJT_EXTRA: TemplateQuestion[] = [
  // Servicio
  S("Un cliente llega diez minutos antes del cierre y pide que le muestres varios productos. ¿Qué hacés?", "servicio", [
    "Lo atiendo con normalidad y le aviso con amabilidad a qué hora cerramos.",
    "Lo atiendo, pero le pido que elija rápido.",
    "Le digo que vuelva mañana, que ya estamos cerrando.",
    "Hago como que no lo vi y sigo ordenando.",
  ]),
  S("Una clienta dice que el precio de la góndola no coincide con el que le cobraste. ¿Qué hacés?", "servicio", [
    "Verifico la góndola o pido que la verifiquen, y si tiene razón le cobro el precio exhibido.",
    "Le digo que el sistema no se equivoca, pero llamo al encargado si insiste.",
    "Le explico que los precios cambian y que el de caja es el que vale.",
    "Le digo que si no le conviene, no lo lleve.",
  ]),
  S("Un cliente pregunta por un producto que no tienen. ¿Qué hacés?", "servicio", [
    "Le digo cuándo puede llegar, le ofrezco una alternativa parecida y anoto su contacto si quiere que le avisemos.",
    "Le ofrezco otro producto parecido.",
    "Le digo que no hay y que pruebe en otro lado.",
    "Le digo que no hay y sigo con lo mío.",
  ]),
  S("Un cliente mayor no entiende cómo pagar con el código QR. ¿Qué hacés?", "servicio", [
    "Le explico paso a paso con paciencia y le ofrezco otro medio de pago si prefiere.",
    "Le hago yo el pago con su celular, si me lo permite.",
    "Le digo que le pida ayuda a un familiar.",
    "Le digo que entonces pague en efectivo y atiendo al siguiente.",
  ]),
  S("Te piden por teléfono un pedido grande para mañana, pero no sabés si llegan a prepararlo. ¿Qué hacés?", "servicio", [
    "Consulto con depósito antes de confirmar y le doy al cliente un plazo realista.",
    "Lo confirmo y después veo cómo se resuelve.",
    "Le digo que no se puede para no complicarme.",
    "Lo anoto sin decirle nada sobre los plazos.",
  ]),
  S("Un cliente quiere devolver un producto fuera del plazo de cambio, pero sin uso. ¿Qué hacés?", "servicio", [
    "Le explico la política y consulto al encargado si se puede hacer una excepción.",
    "Le explico la política con amabilidad y le digo que no se puede.",
    "Le hago el cambio sin consultar a nadie.",
    "Le digo que la culpa es suya por no venir antes.",
  ]),
  S("Hay una fila larga y un cliente se queja en voz alta de la demora. ¿Qué hacés?", "servicio", [
    "Le pido disculpas por la espera, sigo atendiendo rápido y aviso para que habiliten otra caja si se puede.",
    "Le explico que estamos con poca gente.",
    "Sigo atendiendo sin responderle.",
    "Le contesto que todos están esperando igual que él.",
  ]),
  S("Un cliente te pide tu opinión sobre dos productos y el más caro no le conviene. ¿Qué hacés?", "servicio", [
    "Le recomiendo el que mejor se ajusta a lo que necesita, aunque sea el más barato.",
    "Le explico las diferencias y dejo que decida.",
    "Le recomiendo el más caro porque deja más comisión.",
    "Le digo que todos son iguales.",
  ]),

  // Resolución de problemas
  S("Se corta el sistema de facturación con clientes esperando. ¿Qué hacés?", "resolucion", [
    "Aviso al encargado, informo a los clientes y uso el procedimiento de respaldo (factura manual) si existe.",
    "Aviso al encargado y espero a que vuelva el sistema.",
    "Les digo a los clientes que vuelvan más tarde.",
    "Sigo cobrando sin factura para no perder la venta.",
  ]),
  S("Te llega un pedido con dos productos equivocados y el cliente lo necesita hoy. ¿Qué hacés?", "resolucion", [
    "Le aviso enseguida, coordino el cambio para hoy y reviso por qué pasó.",
    "Le aviso y le ofrezco cambiarlo la semana que viene.",
    "Le mando lo que hay y espero a ver si reclama.",
    "Le echo la culpa al proveedor y no hago nada más.",
  ]),
  S("Notás que un procedimiento del área hace perder mucho tiempo a todos. ¿Qué hacés?", "resolucion", [
    "Propongo a mi encargado una forma concreta de mejorarlo y me ofrezco para probarla.",
    "Lo comento con mis compañeros.",
    "Lo sigo haciendo igual porque así es la regla.",
    "Me salteo los pasos que me parecen inútiles sin avisar.",
  ]),
  S("Te piden dos tareas urgentes al mismo tiempo dos personas distintas. ¿Qué hacés?", "resolucion", [
    "Les explico a los dos la situación y acuerdo prioridades con quien corresponde.",
    "Hago primero la del que tiene más cargo.",
    "Hago la que me resulta más fácil.",
    "Hago las dos a medias para cumplir con ambos.",
  ]),
  S("Llegás al depósito y la mercadería del día no coincide con el remito. ¿Qué hacés?", "resolucion", [
    "Registro la diferencia, aviso antes de firmar y dejo constancia en el remito.",
    "Firmo y después le aviso al encargado.",
    "La recibo igual porque seguro después aparece.",
    "Cambio el remito para que coincida.",
  ]),
  S("Un compañero te pasa un trabajo con errores y la entrega es en una hora. ¿Qué hacés?", "resolucion", [
    "Corrijo lo urgente, se lo comento al compañero y aviso si algo no llega a tiempo.",
    "Se lo devuelvo para que lo corrija él.",
    "Lo entrego igual, el error no es mío.",
    "Le aviso al jefe que el compañero trabaja mal.",
  ]),
  S("No sabés cómo resolver un problema que te asignaron. ¿Qué hacés?", "resolucion", [
    "Busco información, pruebo lo que puedo y pido ayuda con una pregunta concreta.",
    "Le pido directamente al jefe que me diga cómo hacerlo.",
    "Espero a que alguien se dé cuenta y me ayude.",
    "Lo dejo para después y paso a otra cosa.",
  ]),
  S("Una máquina hace un ruido raro, pero sigue funcionando. ¿Qué hacés?", "resolucion", [
    "La detengo si es seguro hacerlo y aviso a mantenimiento antes de seguir.",
    "Aviso a mantenimiento y sigo trabajando.",
    "Sigo trabajando mientras funcione.",
    "La desarmo yo para ver qué tiene.",
  ]),

  // Compañerismo
  S("Un compañero nuevo no sabe usar el sistema y está trabado. ¿Qué hacés?", "equipo_sjt", [
    "Le explico lo básico cuando puedo y le paso a quién consultar.",
    "Le digo que pregunte al encargado.",
    "Lo dejo que aprenda solo, como hice yo.",
    "Le hago yo su tarea para que no moleste.",
  ]),
  S("Un compañero llega tarde seguido y vos cubrís su puesto. ¿Qué hacés?", "equipo_sjt", [
    "Hablo con él en privado y, si sigue pasando, lo planteo al encargado.",
    "Lo sigo cubriendo para no generar problemas.",
    "Se lo cuento a otros compañeros.",
    "Dejo de cubrirlo sin avisar a nadie.",
  ]),
  S("En la reunión del equipo, tu idea es rechazada. ¿Qué hacés?", "equipo_sjt", [
    "Pregunto qué no convenció y apoyo la opción elegida.",
    "Acepto la decisión, aunque no me guste.",
    "Insisto con mi idea hasta que la acepten.",
    "Hago las cosas a mi manera igual.",
  ]),
  S("Terminás tu tarea antes y un compañero está atrasado. ¿Qué hacés?", "equipo_sjt", [
    "Le ofrezco ayuda y le aviso al encargado que tengo tiempo libre.",
    "Le ofrezco ayuda si me lo pide.",
    "Me tomo un descanso, ya cumplí con lo mío.",
    "Le comento al jefe que el compañero es lento.",
  ]),
  S("Dos compañeros discuten fuerte delante de clientes. ¿Qué hacés?", "equipo_sjt", [
    "Les pido con calma que lo hablen en otro lugar y sigo atendiendo.",
    "Llamo al encargado.",
    "Me alejo para no meterme.",
    "Opino a favor del que tiene razón.",
  ]),
  S("Se reparte el trabajo del día y te toca la tarea que nadie quiere. ¿Qué hacés?", "equipo_sjt", [
    "La hago bien y propongo rotarla entre todos en adelante.",
    "La hago sin decir nada.",
    "La hago, pero me quejo con todos.",
    "Intento pasársela a otro.",
  ]),
  S("Un compañero comete un error que afecta tu trabajo. ¿Qué hacés?", "equipo_sjt", [
    "Se lo digo con respeto, lo resolvemos y vemos cómo evitarlo.",
    "Lo corrijo yo y no digo nada.",
    "Se lo cuento al jefe primero.",
    "Se lo reclamo delante de todos.",
  ]),
  S("Te enterás de un rumor sobre un compañero. ¿Qué hacés?", "equipo_sjt", [
    "No lo repito y, si lo afecta, le sugiero hablarlo con quien corresponda.",
    "No lo repito.",
    "Lo comento solo con quien tengo confianza.",
    "Lo cuento, total ya lo sabe todo el mundo.",
  ]),

  // Integridad
  S("Al cerrar la caja te sobran 20.000 Gs. ¿Qué hacés?", "integridad_sjt", [
    "Lo informo y lo registro como sobrante para que se revisen los movimientos.",
    "Lo dejo en la caja sin decir nada.",
    "Lo guardo por si mañana falta.",
    "Me lo quedo: seguro nadie lo nota.",
  ]),
  S("Un proveedor te ofrece un regalo si lo recomendás para la próxima compra. ¿Qué hacés?", "integridad_sjt", [
    "Lo rechazo y lo informo según la política de la empresa.",
    "Lo rechazo sin decir nada.",
    "Lo acepto, pero recomiendo igual al mejor proveedor.",
    "Lo acepto y lo recomiendo.",
  ]),
  S("Ves que un compañero se lleva productos sin pagar. ¿Qué hacés?", "integridad_sjt", [
    "Lo informo por el canal que corresponde.",
    "Le digo que no lo haga más.",
    "No digo nada, no es asunto mío.",
    "Le pido que la próxima vez me traiga a mí también.",
  ]),
  S("Tu jefe te pide que firmes una planilla de control que no hiciste. ¿Qué hacés?", "integridad_sjt", [
    "Le explico que no puedo firmar algo que no controlé y me ofrezco a hacer el control ahora.",
    "La firmo, pero le aviso que no la hice.",
    "La firmo porque me lo pidió el jefe.",
    "La firmo y pongo cualquier dato.",
  ]),
  S("Un cliente te pide factura con un monto mayor al de la compra. ¿Qué hacés?", "integridad_sjt", [
    "Le explico que solo puedo facturar lo que compró.",
    "Le digo que consulte con el encargado.",
    "Se la hago si es cliente frecuente.",
    "Se la hago, total no me perjudica.",
  ]),
  S("Encontrás un error en un informe tuyo que ya se entregó. ¿Qué hacés?", "integridad_sjt", [
    "Aviso enseguida y entrego la versión corregida.",
    "Lo corrijo en la próxima entrega sin avisar.",
    "Espero a ver si alguien lo nota.",
    "Si alguien lo nota, digo que el dato vino mal.",
  ]),
  S("Te dan la contraseña del sistema de un compañero para cubrirlo un día. ¿Qué hacés?", "integridad_sjt", [
    "Pido que me den un acceso propio o que quede registrado que lo uso yo con autorización.",
    "La uso solo ese día.",
    "La uso y la guardo por si la vuelvo a necesitar.",
    "La comparto con otros que la puedan necesitar.",
  ]),
  S("Tenés que registrar tu hora de entrada y llegaste 15 minutos tarde. ¿Qué hacés?", "integridad_sjt", [
    "Registro la hora real y aviso el motivo.",
    "Registro la hora real sin decir nada.",
    "Pido a un compañero que me marque a horario.",
    "Pongo la hora que me corresponde, 15 minutos no es nada.",
  ]),

  // Conducción
  S("Coordinás un turno y una persona del equipo no cumple con lo acordado. ¿Qué hacés?", "liderazgo_sjt", [
    "Hablo con ella en privado, escucho qué pasa y acordamos qué va a cambiar.",
    "Le marco el error delante del equipo para que sirva de ejemplo.",
    "Hago yo su parte para no perder tiempo.",
    "No digo nada para no generar mal clima.",
  ]),
  S("Tu equipo no va a llegar a la meta del mes. ¿Qué hacés?", "liderazgo_sjt", [
    "Reviso con el equipo qué está frenando, priorizamos y aviso con tiempo a mi jefe.",
    "Le pido al equipo que se esfuerce más.",
    "Espero a fin de mes y explico lo que pasó.",
    "Culpo a la falta de recursos.",
  ]),
  S("Dos personas de tu equipo tienen un conflicto que afecta al resto. ¿Qué hacés?", "liderazgo_sjt", [
    "Hablo con cada una por separado y después las junto para acordar cómo trabajar.",
    "Las separo de turno para que no se crucen.",
    "Les digo que lo resuelvan entre ellas.",
    "Me pongo del lado de quien tiene más antigüedad.",
  ]),
  S("Llega una persona nueva a tu equipo. ¿Qué hacés?", "liderazgo_sjt", [
    "Le presento al equipo, le explico cómo se trabaja y le asigno a alguien de referencia.",
    "Le paso el manual y le digo que pregunte si tiene dudas.",
    "La pongo a trabajar enseguida, aprende haciendo.",
    "Espero a ver cómo se desempeña antes de dedicarle tiempo.",
  ]),
  S("Tu jefe toma una decisión que el equipo no comparte. ¿Qué hacés?", "liderazgo_sjt", [
    "Le transmito las dudas del equipo y, una vez decidido, explico el motivo y la sostengo.",
    "La comunico tal cual, sin dar explicaciones.",
    "Le digo al equipo que tampoco estoy de acuerdo.",
    "No la aplico y sigo como antes.",
  ]),
  S("Alguien del equipo propone una mejora que vos no habías pensado. ¿Qué hacés?", "liderazgo_sjt", [
    "La reconozco delante del equipo y la probamos.",
    "Le digo que está bien y que la vemos más adelante.",
    "La presento como idea mía.",
    "La descarto porque así funciona bien.",
  ]),
  S("Tenés que comunicar un cambio de horario que va a molestar al equipo. ¿Qué hacés?", "liderazgo_sjt", [
    "Lo explico en persona, con el motivo y con tiempo, y escucho los casos particulares.",
    "Lo mando por mensaje al grupo.",
    "Lo aplico sin avisar hasta que alguien pregunte.",
    "Digo que la decisión no es mía y que reclamen arriba.",
  ]),
  S("Una persona de tu equipo te cuenta que está pasando un problema personal serio. ¿Qué hacés?", "liderazgo_sjt", [
    "La escucho, veo qué flexibilidad se le puede dar y lo trato con reserva.",
    "Le digo que lo deje fuera del trabajo.",
    "Le doy unos días sin consultarlo con nadie.",
    "Lo comento con el resto para que la entiendan.",
  ]),
];

// ── Entrevista conductual: 40 preguntas abiertas ───────────────
const T = (text: string, dimension: string): TemplateQuestion => ({ text, kind: "texto", dimension });

export const CONDUCTUAL: TemplateQuestion[] = [
  // Servicio
  T("Contanos una vez que atendiste a un cliente muy molesto. ¿Qué pasó, qué hiciste y cómo terminó?", "servicio"),
  T("Describí una situación en la que hiciste algo más de lo que te correspondía para ayudar a un cliente.", "servicio"),
  T("Contanos una vez que no pudiste darle a un cliente lo que pedía. ¿Cómo se lo explicaste?", "servicio"),
  T("¿Qué hiciste la última vez que un cliente te reclamó por un error que no era tuyo?", "servicio"),
  T("Contanos cómo hacés para que un cliente vuelva a elegirte.", "servicio"),
  // Resolución de problemas
  T("Contanos un problema del trabajo que resolviste sin que nadie te dijera cómo.", "resolucion"),
  T("Describí una vez que algo salió mal a último momento. ¿Qué hiciste?", "resolucion"),
  T("Contanos una mejora que propusiste o aplicaste en un trabajo anterior. ¿Qué resultado tuvo?", "resolucion"),
  T("¿Cuál fue la decisión más difícil que tuviste que tomar en un trabajo? ¿Cómo la tomaste?", "resolucion"),
  T("Contanos una vez que te faltó información para hacer algo. ¿Cómo la conseguiste?", "resolucion"),
  // Trabajo en equipo
  T("Contanos una vez que tuviste un desacuerdo con un compañero. ¿Cómo lo resolvieron?", "equipo_sjt"),
  T("Describí un trabajo en equipo del que estés orgulloso/a. ¿Cuál fue tu parte?", "equipo_sjt"),
  T("Contanos una vez que ayudaste a un compañero que estaba atrasado.", "equipo_sjt"),
  T("¿Qué hiciste la última vez que alguien del equipo no cumplió con su parte?", "equipo_sjt"),
  T("Contanos cómo te integraste la última vez que entraste a un grupo de trabajo nuevo.", "equipo_sjt"),
  // Responsabilidad
  T("Contanos un error que cometiste en el trabajo. ¿Qué hiciste cuando te diste cuenta?", "responsabilidad"),
  T("Describí una vez que tuviste que cumplir con un plazo muy ajustado. ¿Cómo te organizaste?", "responsabilidad"),
  T("Contanos una tarea que no te gustaba hacer y cómo te aseguraste de hacerla bien.", "responsabilidad"),
  T("¿Qué hiciste la última vez que te diste cuenta de que no ibas a poder cumplir con algo que habías prometido?", "responsabilidad"),
  T("Contanos una situación en la que cuidaste algo de la empresa como si fuera tuyo.", "responsabilidad"),
  // Comunicación
  T("Contanos una vez que tuviste que explicar algo complicado a alguien que no sabía del tema.", "comunicacion"),
  T("Describí una situación en la que un malentendido causó un problema. ¿Qué aprendiste?", "comunicacion"),
  T("Contanos una vez que tuviste que dar una mala noticia en el trabajo.", "comunicacion"),
  T("¿Cómo hacés para asegurarte de que entendiste bien una indicación? Dá un ejemplo.", "comunicacion"),
  T("Contanos una vez que tuviste que decirle a un superior que no estabas de acuerdo.", "comunicacion"),
  // Aprendizaje
  T("Contanos algo que aprendiste por tu cuenta para hacer mejor tu trabajo.", "aprendizaje"),
  T("Describí una crítica que recibiste en el trabajo. ¿Qué hiciste con ella?", "aprendizaje"),
  T("Contanos la última vez que tuviste que aprender a usar una herramienta o un sistema nuevo.", "aprendizaje"),
  T("¿Qué es lo más importante que aprendiste de un error? Contanos la situación.", "aprendizaje"),
  T("Contanos una habilidad que mejoraste en el último año y cómo lo lograste.", "aprendizaje"),
  // Autocontrol
  T("Contanos una situación de mucha presión en el trabajo. ¿Cómo la manejaste?", "autocontrol"),
  T("Describí una vez que alguien te trató mal en el trabajo. ¿Cómo reaccionaste?", "autocontrol"),
  T("Contanos un día en que todo salió mal. ¿Qué hiciste para seguir adelante?", "autocontrol"),
  T("¿Qué hacés cuando sentís que te estás enojando en el trabajo? Dá un ejemplo.", "autocontrol"),
  T("Contanos una vez que tuviste que esperar para plantear un reclamo en el momento adecuado.", "autocontrol"),
  // Iniciativa y conducción
  T("Contanos algo que hiciste en el trabajo sin que nadie te lo pidiera.", "iniciativa"),
  T("Describí una vez que tuviste que organizar a otras personas para cumplir una tarea.", "iniciativa"),
  T("Contanos una oportunidad que viste antes que los demás. ¿Qué hiciste?", "iniciativa"),
  T("¿Cuál fue el objetivo más difícil que te propusiste en un trabajo y cómo te fue?", "resultados"),
  T("Contanos una vez que superaste lo que te pedían. ¿Cómo lo mediste?", "resultados"),
];
