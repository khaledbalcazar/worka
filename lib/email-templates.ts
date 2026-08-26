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
