// Catálogo de correos de Worka.
//
// El texto por defecto vive acá y el admin puede sobrescribirlo desde /admin.
// Se hace en este orden a propósito: una plantilla nueva sale funcionando con
// su redacción sin sembrar nada en la base, y "restaurar el original" es
// simplemente borrar la fila editada.
//
// Las variables se escriben {{asi}} y cada plantilla declara las suyas, para
// que el editor pueda mostrarlas y previsualizar con datos de ejemplo.

export type TemplateVar = {
  key: string;
  label: string;
  sample: string;
};

export type EmailTemplate = {
  key: string;
  name: string;
  /** Cuándo se dispara, en una línea, para el admin. */
  when: string;
  audience: "candidato" | "empresa";
  vars: TemplateVar[];
  subject: string;
  /** HTML del cuerpo. El encabezado y el pie los pone emailLayout. */
  body: string;
};

const V = {
  nombre: { key: "nombre", label: "Nombre de la persona", sample: "María González" },
  empresa: { key: "empresa", label: "Nombre de la empresa", sample: "Super Guaraní" },
  puesto: { key: "puesto", label: "Título de la vacante", sample: "Cajero/a" },
  enlace: { key: "enlace", label: "Enlace del botón", sample: "https://worka.click/postulaciones" },
  cta: { key: "cta", label: "Texto del botón", sample: "Ver mis postulaciones" },
} satisfies Record<string, TemplateVar>;

// Botón estándar. Se deja como texto en la plantilla para que el admin pueda
// moverlo, sacarlo o cambiarle el texto sin tocar código.
const BOTON = `<p style="margin:24px 0"><a href="{{enlace}}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">{{cta}}</a></p>`;

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    key: "postulacion_enviada",
    name: "Postulación enviada",
    when: "Apenas el candidato se postula a una vacante.",
    audience: "candidato",
    vars: [V.nombre, V.empresa, V.puesto, V.enlace, V.cta],
    subject: "Tu postulación a {{puesto}} fue enviada",
    body: `<p>Hola {{nombre}},</p>
<p>Tu perfil llegó a <strong>{{empresa}}</strong> por la vacante de <strong>{{puesto}}</strong>.</p>
<p>Te vamos a avisar por acá cada vez que tu postulación avance: cuando la vean, cuando te contacten y si te proponen una entrevista.</p>
${BOTON}`,
  },
  {
    key: "postulacion_nueva",
    name: "Nueva postulación (empresa)",
    when: "Cuando alguien se postula a una vacante de la empresa.",
    audience: "empresa",
    vars: [V.nombre, V.puesto, V.enlace, V.cta],
    subject: "Nueva postulación para {{puesto}}",
    body: `<p><strong>{{nombre}}</strong> se postuló a tu vacante de <strong>{{puesto}}</strong>.</p>
<p>Podés ver su perfil, su CV y sus respuestas a las preguntas de filtro.</p>
${BOTON}
<p style="color:#6b7280;font-size:13px">Cuanto antes le respondas, más chances de que siga interesado.</p>`,
  },
  {
    key: "postulacion_descartada",
    name: "Postulación descartada",
    when: "Cuando el candidato falla una pregunta excluyente.",
    audience: "candidato",
    vars: [V.nombre, V.puesto, V.enlace, V.cta],
    subject: "Tu postulación a {{puesto}} no siguió esta vez",
    body: `<p>Hola {{nombre}},</p>
<p>Para <strong>{{puesto}}</strong> buscaban un perfil distinto al tuyo, así que tu postulación no avanzó.</p>
<p>No es un cierre: hay más vacantes de tu rubro publicándose todos los días.</p>
${BOTON}`,
  },
  {
    key: "empresa_contacto",
    name: "La empresa te contactó",
    when: "Cuando la empresa marca que contactó al candidato.",
    audience: "candidato",
    vars: [V.nombre, V.empresa, V.puesto, V.enlace, V.cta],
    subject: "{{empresa}} te contactó",
    body: `<p>Hola {{nombre}},</p>
<p><strong>{{empresa}}</strong> te escribió por <strong>{{puesto}}</strong>. Revisá tu WhatsApp.</p>
${BOTON}`,
  },
  {
    key: "entrevista_propuesta",
    name: "Te propusieron una entrevista",
    when: "Cuando la empresa propone día y lugar de entrevista.",
    audience: "candidato",
    vars: [V.nombre, V.empresa, V.puesto, V.enlace, V.cta],
    subject: "{{empresa}} te propuso una entrevista",
    body: `<p>Hola {{nombre}},</p>
<p><strong>{{empresa}}</strong> te propuso una entrevista para <strong>{{puesto}}</strong>.</p>
<p>Entrá a confirmar el día y la hora.</p>
${BOTON}`,
  },
  {
    key: "mensaje_nuevo",
    name: "Mensaje nuevo en el chat",
    when: "Cuando la otra parte escribe en el chat de una postulación.",
    audience: "candidato",
    vars: [V.nombre, V.empresa, V.puesto, V.enlace, V.cta],
    subject: "Tenés un mensaje nuevo por {{puesto}}",
    body: `<p>Hola {{nombre}},</p>
<p>Recibiste un mensaje por <strong>{{puesto}}</strong>.</p>
${BOTON}`,
  },
  {
    key: "vacantes_vencimiento",
    name: "Vacantes por vencer o vencidas (empresa)",
    when: "Una vez por día: vacantes que vencen en 3 días o que ya vencieron.",
    audience: "empresa",
    vars: [
      V.empresa,
      { key: "titulo", label: "Resumen corto", sample: "2 vacantes vencen pronto" },
      { key: "detalle", label: "Lista de vacantes", sample: "Cajero/a — vence el 14 de octubre · Repositor/a — venció el 10 de octubre" },
      V.enlace,
      V.cta,
    ],
    subject: "{{titulo}}",
    body: `<p>Hola, equipo de {{empresa}}:</p>
<p>{{detalle}}</p>
<p>Una vacante vencida deja de aparecer en las búsquedas y no recibe más postulaciones. Si todavía buscás gente, renovala con un clic.</p>
${BOTON}
<p style="color:#6b7280;font-size:13px">Si ya cubriste el puesto, no hace falta que hagas nada.</p>`,
  },
  {
    key: "empresa_bienvenida_promo",
    name: "Bienvenida con Enterprise Pro y Evaluar de regalo (empresa)",
    when: "Cuando una empresa nueva se registra con el código de la promoción de lanzamiento.",
    audience: "empresa",
    vars: [
      V.empresa,
      { key: "codigo", label: "Código canjeado", sample: "WORKA3PRO" },
      { key: "vence", label: "Fin del plan de regalo", sample: "17 de enero de 2027" },
      V.enlace,
      V.cta,
    ],
    subject: "Bienvenidos a Worka: Enterprise Pro y Evaluar ya están activos",
    body: `<p>Hola, equipo de {{empresa}}:</p>
<p>¡Bienvenidos a Worka! Canjeaste el código <strong>{{codigo}}</strong> y tu empresa ya tiene <strong>Worka Enterprise Pro · Pro</strong> y <strong>Worka Evaluar · Profesional</strong> activos, sin costo, hasta el <strong>{{vence}}</strong>.</p>
<p style="margin:20px 0 8px;font-weight:600">Esto es lo que tenés incluido:</p>
<ul style="padding-left:20px;margin:0;line-height:1.7">
<li>Vacantes publicadas <strong>sin límite</strong>, con 60 días de vigencia y renovación automática.</li>
<li><strong>2 vacantes destacadas por mes</strong>: aparecen primero en la búsqueda durante 7 días.</li>
<li><strong>2 alertas urgentes por mes</strong>: avisamos al instante a los candidatos compatibles.</li>
<li><strong>Búsqueda de talento</strong>: encontrá perfiles antes de que se postulen.</li>
<li><strong>Prioridad en el correo semanal</strong> que reciben miles de candidatos.</li>
<li>Tablero de candidatos, preguntas de filtro y mensajes directos.</li>
</ul>
<p style="margin:20px 0 8px;font-weight:600">Y con Worka Evaluar · Profesional:</p>
<ul style="padding-left:20px;margin:0;line-height:1.7">
<li>Procesos de evaluación <strong>sin límite</strong>, enlazados con tus vacantes.</li>
<li>Pruebas a medida del puesto armadas con <strong>IA</strong>.</li>
<li><strong>Informe por candidato</strong> y exportación a Excel.</li>
<li>Invitación masiva de hasta 200 candidatos y tu equipo en cada proceso.</li>
</ul>
<p style="margin-top:20px">El mejor momento para aprovecharlo es hoy: publicá tu primera vacante en un par de minutos y empezá a recibir postulaciones.</p>
${BOTON}
<p style="color:#6b7280;font-size:13px">Cuando entres al panel te mostramos un recorrido corto por cada sección. Podés repetirlo cuando quieras desde el botón «Guía».</p>`,
  },
  {
    key: "aviso_general",
    name: "Aviso general",
    when: "Respaldo: cualquier aviso que todavía no tenga plantilla propia.",
    audience: "candidato",
    vars: [
      { key: "titulo", label: "Título del aviso", sample: "Novedad en tu postulación" },
      { key: "cuerpo", label: "Texto del aviso", sample: "Hubo un cambio en tu proceso." },
      V.enlace,
      V.cta,
    ],
    subject: "{{titulo}}",
    body: `<p>{{cuerpo}}</p>\n${BOTON}`,
  },
];

export function getEmailTemplate(key: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.key === key);
}

// Escapa los valores antes de meterlos en el HTML. Los datos vienen de la
// base (nombres, títulos de vacante) y un apóstrofo o un "<" mal puesto
// rompería el correo o, peor, inyectaría marcado.
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Reemplaza {{variables}}. Los enlaces no se escapan como texto: van dentro
 * de un href y escaparlos rompería la URL.
 */
export function fillTemplate(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    if (value === undefined) return "";
    return key === "enlace" ? encodeURI(value) : escape(value);
  });
}

export type RenderedEmail = { subject: string; body: string };

/** Aplica la edición del admin sobre el original y reemplaza las variables. */
export function renderEmail(
  template: EmailTemplate,
  override: { subject?: string; body?: string } | null,
  vars: Record<string, string>
): RenderedEmail {
  return {
    subject: fillTemplate(override?.subject || template.subject, vars),
    body: fillTemplate(override?.body || template.body, vars),
  };
}

/** Datos de ejemplo para la vista previa del editor. */
export function sampleVars(template: EmailTemplate): Record<string, string> {
  return Object.fromEntries(template.vars.map((v) => [v.key, v.sample]));
}
