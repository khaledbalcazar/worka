"use server";

import { getBoardData, getMyEvaluarAccess, getMyProcesses } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

// Worka Copilot: el asistente que vive al costado del panel de Evaluar.
//
// Contesta dudas de uso («¿cómo invito candidatos?»), explica lo que se ve en
// pantalla y ayuda a decidir con los datos del proceso abierto. Usa las
// mismas claves de IA del backoffice (lib/evaluar/ai.ts).
//
// Igual que el resto del asistente, a la IA no le llegan nombres, emails ni
// teléfonos de candidatos: del proceso abierto se mandan cantidades y
// puntajes, nunca quién es quién.

export type CopilotMessage = { role: "user" | "assistant"; content: string };

type Out = { ok: true; text: string; demo?: boolean } | { ok: false; error: string };

const MAX_TURNOS = 12;
const MAX_LARGO = 1200;

// Lo que el Copilot sabe del producto. Escrito acá y no inventado por el
// modelo: si una función cambia de lugar, se corrige en un solo texto.
const MANUAL = `
Worka Evaluar es el software de selección y evaluación de Worka (Paraguay). Rutas del panel:
- Inicio: /evaluar/app — resumen, gráficos y actividad.
- Procesos: /evaluar/app/procesos — lista; «Nuevo proceso» en la barra lateral crea uno desde una plantilla por puesto (cajero, chofer, call center, gastronomía, vendedor) o desde cero.
- Un proceso tiene pestañas: Resumen, Candidatos, Comparar y decidir (tablero), Etapas y Ajustes.
  · Etapas: se agregan pruebas del catálogo (Cinco Grandes, Estilo laboral, Juicio situacional, Razonamiento con reloj, Integridad laboral, Atención al detalle, etc.) o se generan con IA describiendo el puesto. Con candidatos rindiendo, la estructura queda fija.
  · Candidatos: se invitan por email o se comparte el enlace; cada uno tiene su enlace propio. Estados: Invitado, Rindiendo, Para revisar, Finalista, Contratado, Descartado.
  · Comparar y decidir: tablero con ajuste al puesto, pruebas objetivas, notas del equipo y «Comparar con IA».
  · Informe por candidato: ajuste al puesto, pruebas objetivas, avance, calidad de respuesta, integridad, perfil por rasgo y «Lectura con IA» con preguntas para la entrevista. Se imprime.
  · Ajustes: General (nombre, vacante enlazada, mensajes con «Escribir con IA»), Área y responsable, Qué importa en el puesto (perfil ideal con pesos 1-3 y «Sugerir con IA»), Diseño y plazo (tema y color), Equipo, Más acciones (duplicar, archivar).
- Publicar: el proceso pasa de Borrador a Publicado; sin publicar nadie puede rendir.
- Enlazar una vacante de Worka Empleos: el candidato empieza la evaluación desde el aviso, sin crear cuenta.
- El candidato rinde desde el celular, sin cuenta; puede usar «Continuar con Worka Empleos» para cargar sus datos y CV. Cada respuesta se guarda sola.
- Desempeño: /evaluar/app/desempeno — evaluaciones con conductas escritas, autoevaluación.
- Plan y facturación: /evaluar/app/plan — planes Esencial, Profesional y Corporativo; prueba gratis de 15 días. La IA está en Profesional y Corporativo.
- Ajustes de la cuenta: /evaluar/app/ajustes.
- Panel de empresa de Worka: /empresa (vacantes, talento, mensajes).
Cómo leer resultados: el ajuste al puesto sale del perfil ideal; las pruebas objetivas son el % de respuestas correctas; los rasgos describen estilos, no capacidad; los percentiles necesitan una muestra mínima de 30 personas.
`.trim();

const SISTEMA = [
  "Sos Worka Copilot, el asistente del panel de Worka Evaluar.",
  "Ayudás a empresas de Paraguay a usar la plataforma y a decidir mejor. Escribís en español con voseo, claro y breve.",
  "Respondé en 2 a 6 frases o una lista corta. Usá **negrita** para lo clave.",
  "Cuando indiques dónde está algo, poné un enlace en formato markdown a la ruta del panel, por ejemplo [Procesos](/evaluar/app/procesos). Solo rutas que empiecen con /evaluar o /empresa.",
  "Si no sabés algo o no está en el manual, decilo y sugerí escribir a soporte. No inventes funciones.",
  "Nunca recomendés descartar a alguien por un rasgo de personalidad ni por edad, sexo, religión, estado civil, hijos, salud, nacionalidad o política.",
  "",
  "Manual del producto:",
  MANUAL,
].join("\n");

// Qué tiene abierto la persona, en números y sin nombres.
async function contexto(path: string): Promise<string> {
  const m = /^\/evaluar\/app\/procesos\/([^/?#]+)/.exec(path);
  if (!m) {
    const procesos = await getMyProcesses().catch(() => []);
    if (!procesos.length) return `Pantalla: ${path}. La empresa todavía no tiene procesos.`;
    return [
      `Pantalla: ${path}.`,
      `Procesos de la empresa (${procesos.length}): ${procesos
        .slice(0, 8)
        .map((p) => `«${p.title}» (${p.status}${p.archived ? ", archivado" : ""}, ${p.participant_count ?? 0} candidatos)`)
        .join("; ")}.`,
    ].join("\n");
  }
  const board = await getBoardData(decodeURIComponent(m[1])).catch(() => null);
  if (!board) return `Pantalla: ${path}.`;
  const porEstado: Record<string, number> = {};
  for (const c of board.candidates) porEstado[c.status] = (porEstado[c.status] ?? 0) + 1;
  const terminados = board.candidates
    .filter((c) => c.fit !== null || c.percent !== null)
    .sort((a, b) => (b.fit ?? b.percent ?? 0) - (a.fit ?? a.percent ?? 0))
    .slice(0, 6)
    .map((c, i) => `#${i + 1}: ajuste ${c.fit ?? "s/d"}%, pruebas ${c.percent ?? "s/d"}%, estado ${c.status}`);
  return [
    `Pantalla: ${path}.`,
    `Proceso abierto: «${board.process.title}», estado ${board.process.status}.`,
    `Etapas: ${board.stages.map((s) => `${s.title} (${s.questions.length} preguntas${s.timed ? ", con reloj" : ""})`).join("; ") || "ninguna"}.`,
    `Candidatos por estado: ${Object.entries(porEstado).map(([k, v]) => `${k} ${v}`).join(", ") || "ninguno"}.`,
    `Perfil ideal definido: ${Object.keys(board.process.ideal_profile ?? {}).length ? "sí" : "no"}.`,
    terminados.length ? `Mejores resultados (sin nombres):\n${terminados.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function askCopilot(history: CopilotMessage[], path: string): Promise<Out> {
  const turnos = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNOS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LARGO) }));
  const ultima = turnos.at(-1);
  if (!ultima || ultima.role !== "user" || !ultima.content.trim()) return { ok: false, error: "Escribí tu pregunta." };

  const live = !!(await getServerClient());
  if (!live) return { ok: true, demo: true, text: respuestaDemo(ultima.content) };

  if (!(await getCurrentUser())) return { ok: false, error: "Tu sesión venció. Volvé a ingresar." };
  if (!planOf(await getMyEvaluarAccess()).ai)
    return {
      ok: false,
      error: "Worka Copilot está incluido en los planes Profesional y Corporativo. Podés verlos en Plan y facturación.",
    };

  const ctx = await contexto(String(path || "").slice(0, 200));
  const conversacion = turnos.map((m) => `${m.role === "user" ? "Empresa" : "Copilot"}: ${m.content}`).join("\n\n");

  const { callAi } = await import("@/lib/evaluar/ai");
  const r = await callAi({
    system: SISTEMA,
    user: `Contexto de lo que tiene abierto:\n${ctx}\n\nConversación:\n${conversacion}\n\nRespondé como Copilot al último mensaje de la empresa.`,
    maxTokens: 700,
  });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, text: r.text.replace(/^Copilot:\s*/i, "").trim() };
}

// En modo demo no hay claves: respuestas armadas para las dudas más comunes,
// así se puede ver y probar el panel.
function respuestaDemo(pregunta: string): string {
  const q = pregunta.toLowerCase();
  if (/recomend|qu[eé] pruebas|cajero|chofer|vendedor/.test(q))
    return [
      "Para un **cajero** suele funcionar:",
      "- **Razonamiento** (con reloj): cálculo y vuelto.\n- **Juicio situacional**: trato con el cliente y la fila.\n- **Integridad laboral**: cuidado del dinero y de lo ajeno.",
      "La plantilla **Cajero** ya trae estas etapas armadas. Creala desde **Nuevo proceso**.",
      "[Ver mis procesos](/evaluar/app/procesos)",
    ].join("\n\n");
  if (/invit|candidat|enlace|link/.test(q))
    return "Entrá al proceso y abrí la pestaña **Candidatos**. Ahí podés **invitar por email** o **copiar el enlace** para mandarlo por WhatsApp. Cada persona rinde desde el celular, sin crear cuenta.\n\n[Ver mis procesos](/evaluar/app/procesos)";
  if (/public|borrador/.test(q))
    return "Un proceso nace como **Borrador**. Cuando tenga al menos una etapa, tocá **Publicar** arriba a la derecha del proceso: recién ahí la gente puede rendir.";
  if (/inform|leer|result|puntaje|ajuste/.test(q))
    return "El **ajuste al puesto** compara a la persona con lo que marcaste en *Qué importa en el puesto*. Las **pruebas objetivas** son el % de respuestas correctas. Los **rasgos** describen estilos, no capacidad.\n\nEn cada informe tenés **Lectura con IA** con preguntas para la entrevista.";
  if (/plan|precio|pag|factur/.test(q))
    return "Tenés **15 días de prueba**. Después elegís entre **Esencial**, **Profesional** y **Corporativo**; la IA está en los dos últimos.\n\n[Plan y facturación](/evaluar/app/plan)";
  if (/vacante|aviso|worka empleos/.test(q))
    return "En **Ajustes › General** del proceso elegís la **vacante enlazada**. Con eso, quien vea el aviso en Worka Empleos puede empezar la evaluación desde ahí.";
  if (/\bia\b|inteligencia|generar|prueba/.test(q))
    return "En **Etapas** podés **generar una prueba con IA**: describí el puesto en una línea y queda como borrador para revisar. También hay IA en el informe, en el tablero y en los mensajes al candidato.";
  return "¡Hola! Soy **Worka Copilot**. Puedo ayudarte a **crear un proceso**, **invitar candidatos**, **leer un informe** o **comparar finalistas**. ¿Qué necesitás?\n\n_(Modo demostración: con la base conectada respondo con IA y con tus datos.)_";
}
