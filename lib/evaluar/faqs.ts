// Preguntas frecuentes de Worka Evaluar.
//
// Viven acá y no dentro del componente porque se usan en dos lados: la
// pantalla y el JSON-LD que Google lee para armar el resultado enriquecido.
// Duplicarlas garantizaba que un dia el texto de la pagina y el que ve el
// buscador dejaran de coincidir, que es justo lo que Google penaliza.

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "¿Necesito una cuenta de Worka Empleos para usar Worka Evaluar?",
    a: "Sí. Worka Evaluar se integra con tus vacantes de Worka Empleos para que los candidatos arranquen la evaluación desde el propio aviso. Crear la cuenta de empresa en Worka también es gratis.",
  },
  {
    q: "¿Cómo funciona el período de prueba?",
    a: "Tenés 15 días de acceso completo, sin restricciones y sin tarjeta. Si al final decidís seguir, coordinamos el pago por transferencia o link de pago. No hay cobro automático: la renovación la confirmás vos.",
  },
  {
    q: "¿Los candidatos necesitan crear una cuenta para rendir?",
    a: "No, y es a propósito: cada cuenta que se pide es gente que abandona. Entran con un enlace propio y personal, responden y listo. Se guarda cada respuesta, así que pueden cortar y seguir después.",
  },
  {
    q: "¿Qué tests incluye?",
    a: "Cuatro instrumentos listos: los Cinco Grandes (personalidad), estilo laboral (competencias de trabajo), juicio situacional (qué haría la persona en situaciones reales) y razonamiento (series numéricas, fichas de dominó y analogías). Además hay procesos completos ya armados para cajero, chofer, call center, gastronomía y vendedor.",
  },
  {
    q: "¿Puedo invitar candidatos que no vienen de Worka Empleos?",
    a: "Sí. Además del enlace con tu vacante, podés invitar por email o WhatsApp a cualquier persona, venga de donde venga. También podés pegar una lista y cargar hasta 200 de una vez.",
  },
  {
    q: "¿Los resultados de personalidad sirven para descartar gente?",
    a: "No, y no lo recomendamos. Los tests de personalidad describen estilos de trabajo, no capacidad: no hay perfiles buenos ni malos. Lo decimos en la propia pantalla donde se decide. Sirven junto a la entrevista y la experiencia, nunca como único filtro.",
  },
];
