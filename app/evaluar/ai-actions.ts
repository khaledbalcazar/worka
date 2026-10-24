"use server";

import { getBoardData, getMyEvaluarAccess, type BoardCandidate, type BoardData } from "@/lib/evaluar";
import { getCandidateReport } from "@/lib/evaluar/report";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import { planOf } from "@/lib/evaluar-plans";
import { getServerClient } from "@/lib/supabase/server";

// El asistente de IA de Evaluar, más allá de armar etapas.
//
// Cuatro ayudas para los momentos donde la empresa se traba: leer un informe,
// elegir entre finalistas, definir qué importa en el puesto y escribirle al
// candidato. Usan las mismas claves del backoffice (lib/evaluar/ai.ts).
//
// Reglas que valen para todas:
// - A la IA no le llegan nombres, emails ni teléfonos: los candidatos van como
//   «Candidato A», «B»… y el nombre se vuelve a poner acá, del lado nuestro.
// - Lo que devuelve es una lectura para ayudar a decidir, nunca la decisión:
//   la pantalla lo dice y el prompt le prohíbe recomendar descartar a alguien
//   por un rasgo de personalidad o por datos protegidos.
// - En modo demo (sin base) se devuelve un ejemplo armado con los datos, para
//   poder ver la pantalla.

type AiOut<T> = { ok: true; data: T; demo?: boolean } | { ok: false; error: string };

const REGLAS = [
  "Sos un asistente de selección de personal para empresas de Paraguay.",
  "Escribís en español con voseo, claro, concreto y sin tecnicismos.",
  "Nunca recomendás descartar a alguien solo por un rasgo de personalidad: los rasgos describen estilos, no capacidad.",
  "No mencionás ni inferís edad, sexo, religión, estado civil, hijos, salud, nacionalidad ni afiliación política.",
  "Sos prudente: hablás de indicios y de qué conviene verificar en la entrevista, no de certezas.",
].join("\n");

async function gate(processId: string): Promise<{ board: BoardData; live: boolean } | { error: string }> {
  const board = await getBoardData(processId);
  if (!board) return { error: "No encontramos el proceso." };
  const live = !!(await getServerClient());
  if (live && !planOf(await getMyEvaluarAccess()).ai)
    return { error: "El asistente de IA está incluido en los planes Profesional y Corporativo." };
  return { board, live };
}

async function pedirJson<T>(system: string, user: string, maxTokens = 1800): Promise<AiOut<T>> {
  const { callAi } = await import("@/lib/evaluar/ai");
  const r = await callAi({ system, user, json: true, maxTokens });
  if (!r.ok) return { ok: false, error: r.error };
  try {
    const t = r.text;
    return { ok: true, data: JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)) as T };
  } catch {
    console.error("evaluar ai: JSON inválido", r.text.slice(0, 300));
    return { ok: false, error: "El asistente devolvió algo que no pudimos leer. Probá de nuevo." };
  }
}

const etiqueta = (key: string) => ALL_DIMENSIONS[key]?.label ?? key;

// Rasgos de una persona en porcentaje, ordenados de más alto a más bajo.
function rasgos(c: BoardCandidate) {
  return Object.entries(c.profile ?? {})
    .filter(([, v]) => v && v.max > 0)
    .map(([k, v]) => ({ key: k, label: etiqueta(k), pct: Math.round((v.raw / v.max) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

function perfilIdeal(board: BoardData) {
  const ideal = (board.process.ideal_profile ?? {}) as Record<string, number>;
  const pesos = ["", "algo", "bastante", "mucho"];
  return Object.entries(ideal)
    .filter(([, w]) => w > 0)
    .map(([k, w]) => `${etiqueta(k)} (importa ${pesos[w] ?? "algo"})`)
    .join(", ");
}

const lista = (xs: unknown) => (Array.isArray(xs) ? xs.map((x) => String(x).trim()).filter(Boolean).slice(0, 6) : []);

// ── 1. Resumen del informe ─────────────────────────────────────

export type CandidateBrief = {
  resumen: string;
  fortalezas: string[];
  explorar: string[];
  preguntas: string[];
};

export async function aiCandidateBrief(processId: string, participantId: string): Promise<AiOut<CandidateBrief>> {
  const g = await gate(processId);
  if ("error" in g) return { ok: false, error: g.error };
  const c = g.board.candidates.find((x) => x.id === participantId);
  if (!c) return { ok: false, error: "No encontramos a esta persona en el proceso." };
  if (c.status === "invitado") return { ok: false, error: "Todavía no rindió: no hay nada para resumir." };

  const report = await getCandidateReport(participantId);
  const dims = report?.dimensions?.length
    ? report.dimensions.map((d) => ({ label: d.label, pct: d.pct, high: d.high, low: d.low }))
    : rasgos(c).map((r) => ({ label: r.label, pct: r.pct, high: "", low: "" }));

  if (!g.live) {
    const altos = dims.filter((d) => d.pct >= 70).map((d) => d.label);
    const bajos = dims.filter((d) => d.pct < 55).map((d) => d.label);
    return {
      ok: true,
      demo: true,
      data: {
        resumen: `${c.fit !== null ? `Ajusta un ${c.fit}% a lo que pide el puesto` : "Sin perfil ideal definido"}${c.percent !== null ? ` y resolvió bien el ${c.percent}% de las pruebas objetivas` : ""}. Es un perfil sólido para atención al público; conviene confirmar en la entrevista cómo se maneja con la caja bajo presión.`,
        fortalezas: altos.length ? altos.slice(0, 3).map((a) => `Se destaca en ${a.toLowerCase()}.`) : ["Respuestas consistentes a lo largo de la evaluación."],
        explorar: bajos.length ? bajos.slice(0, 3).map((b) => `${b}: puntaje más bajo que el resto de su perfil.`) : ["Nada llamativo: confirmá disponibilidad horaria y experiencia previa."],
        preguntas: [
          "Contame de una vez que el cierre de caja no te cerró. ¿Qué hiciste?",
          "Un cliente se enoja porque la fila no avanza. ¿Qué le decís?",
          "¿Cómo te organizás cuando tenés que atender y reponer al mismo tiempo?",
        ],
      },
    };
  }

  const datos = [
    `Puesto: ${g.board.process.title}`,
    `Lo que importa en el puesto: ${perfilIdeal(g.board) || "no definido"}`,
    `Ajuste al puesto: ${c.fit ?? "sin dato"}%`,
    `Pruebas objetivas (respuestas correctas): ${c.percent ?? "sin dato"}%`,
    "Rasgos (0-100, describen estilo, no capacidad):",
    ...dims.map((d) => `- ${d.label}: ${d.pct}${d.high ? ` (alto = ${d.high}; bajo = ${d.low})` : ""}`),
    `Calidad de respuesta: ${(report?.quality ?? []).map((q) => q.label).join(", ") || "sin alertas"}`,
    `Notas del equipo: ${c.notes.map((n) => `«${n.body}»${n.rating ? ` (${n.rating}/5)` : ""}`).join(" ") || "ninguna"}`,
  ].join("\n");

  const r = await pedirJson<Partial<CandidateBrief>>(
    [
      REGLAS,
      "",
      "Leés el informe de un candidato y devolvés SOLO un JSON:",
      '{"resumen":"2 o 3 frases","fortalezas":["..."],"explorar":["..."],"preguntas":["..."]}',
      "- fortalezas y explorar: 2 a 4 ítems cortos cada uno, atados a los datos.",
      "- preguntas: 3 a 5 preguntas de entrevista concretas para verificar lo que conviene explorar.",
    ].join("\n"),
    datos
  );
  if (!r.ok) return r;
  return {
    ok: true,
    data: {
      resumen: String(r.data.resumen ?? "").trim(),
      fortalezas: lista(r.data.fortalezas),
      explorar: lista(r.data.explorar),
      preguntas: lista(r.data.preguntas),
    },
  };
}

// ── 2. Comparar finalistas ─────────────────────────────────────

export type FinalistsComparison = {
  lectura: string;
  candidatos: { id: string; nombre: string; aFavor: string; aCuidar: string }[];
  siguientePaso: string;
};

export async function aiCompareFinalists(processId: string): Promise<AiOut<FinalistsComparison>> {
  const g = await gate(processId);
  if ("error" in g) return { ok: false, error: g.error };

  // Los que terminaron o ya están marcados como finalistas, con el mejor
  // ajuste primero. Más de cinco ya no es comparar, es otro ranking.
  const pool = g.board.candidates
    .filter((c) => ["completado", "finalista"].includes(c.status))
    .sort((a, b) => (b.fit ?? b.percent ?? 0) - (a.fit ?? a.percent ?? 0))
    .slice(0, 5);
  if (pool.length < 2) return { ok: false, error: "Hacen falta al menos dos personas que hayan terminado para comparar." };

  const letras = "ABCDE";
  const porLetra = new Map(pool.map((c, i) => [letras[i], c]));

  if (!g.live) {
    return {
      ok: true,
      demo: true,
      data: {
        lectura: `${pool[0].full_name} y ${pool[1].full_name} están parejos en lo que más pesa para el puesto. La diferencia está en el detalle: conviene una entrevista corta con las dos personas antes de decidir.`,
        candidatos: pool.map((c) => {
          const rs = rasgos(c);
          return {
            id: c.id,
            nombre: c.full_name,
            aFavor: rs[0] ? `Alto en ${rs[0].label.toLowerCase()} (${rs[0].pct}).` : "Buen resultado general.",
            aCuidar: rs.at(-1) ? `Más bajo en ${rs.at(-1)!.label.toLowerCase()} (${rs.at(-1)!.pct}).` : "Sin alertas.",
          };
        }),
        siguientePaso: "Llamá a las dos primeras y preguntales por una situación de cierre de caja con diferencia.",
      },
    };
  }

  const datos = [
    `Puesto: ${g.board.process.title}`,
    `Lo que importa en el puesto: ${perfilIdeal(g.board) || "no definido"}`,
    ...pool.map((c, i) => {
      const rs = rasgos(c);
      const notas = c.notes.filter((n) => n.rating).map((n) => n.rating!);
      return [
        `Candidato ${letras[i]}: ajuste ${c.fit ?? "s/d"}%, pruebas objetivas ${c.percent ?? "s/d"}%.`,
        `  Rasgos altos: ${rs.slice(0, 3).map((r) => `${r.label} ${r.pct}`).join(", ") || "s/d"}.`,
        `  Rasgos bajos: ${rs.slice(-2).map((r) => `${r.label} ${r.pct}`).join(", ") || "s/d"}.`,
        `  Notas del equipo: ${notas.length ? `promedio ${(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)}/5` : "sin calificar"}.`,
      ].join("\n");
    }),
  ].join("\n");

  const r = await pedirJson<{ lectura?: string; candidatos?: { letra?: string; a_favor?: string; a_cuidar?: string }[]; siguiente_paso?: string }>(
    [
      REGLAS,
      "",
      "Comparás finalistas de una búsqueda y devolvés SOLO un JSON:",
      '{"lectura":"2 o 3 frases comparando","candidatos":[{"letra":"A","a_favor":"una frase","a_cuidar":"una frase"}],"siguiente_paso":"una acción concreta"}',
      "- Nombrá a las personas solo por su letra.",
      "- No digas a quién contratar: decí qué distingue a cada una y qué verificar.",
    ].join("\n"),
    datos
  );
  if (!r.ok) return r;

  // Las letras vuelven a ser nombres acá: la IA nunca los vio.
  const conNombres = (t: string) =>
    t.replace(/Candidat[oa] ([A-E])\b/g, (m, l: string) => porLetra.get(l)?.full_name ?? m);
  return {
    ok: true,
    data: {
      lectura: conNombres(String(r.data.lectura ?? "")),
      candidatos: (r.data.candidatos ?? [])
        .map((x) => {
          const c = porLetra.get(String(x.letra ?? "").trim().toUpperCase());
          return c
            ? { id: c.id, nombre: c.full_name, aFavor: conNombres(String(x.a_favor ?? "")), aCuidar: conNombres(String(x.a_cuidar ?? "")) }
            : null;
        })
        .filter((x): x is FinalistsComparison["candidatos"][number] => !!x),
      siguientePaso: conNombres(String(r.data.siguiente_paso ?? "")),
    },
  };
}

// ── 3. Qué importa en el puesto ────────────────────────────────

export type IdealSuggestion = { pesos: Record<string, number>; porque: string };

export async function aiSuggestIdealProfile(processId: string): Promise<AiOut<IdealSuggestion>> {
  const g = await gate(processId);
  if ("error" in g) return { ok: false, error: g.error };

  // Solo se puede pedir lo que las etapas del proceso miden.
  const medibles = [...new Set(g.board.stages.flatMap((s) => s.questions.map((q) => q.dimension).filter((d): d is string => !!d)))];
  if (medibles.length === 0)
    return { ok: false, error: "Las etapas de este proceso no miden rasgos. Sumá una prueba de perfil para usar esto." };

  if (!g.live) {
    const pesos = Object.fromEntries(medibles.slice(0, 5).map((k, i) => [k, i < 2 ? 3 : 2]));
    return {
      ok: true,
      demo: true,
      data: { pesos, porque: "Para caja pesan la atención al cliente y la integridad; el cálculo y el detalle suman, y la presión importa en horas pico." },
    };
  }

  const r = await pedirJson<{ pesos?: Record<string, number>; porque?: string }>(
    [
      REGLAS,
      "",
      "Definís qué rasgos importan para un puesto. Devolvés SOLO un JSON:",
      '{"pesos":{"clave":1},"porque":"una o dos frases"}',
      "- Usá solo claves de la lista. Peso 1 = importa algo, 2 = bastante, 3 = mucho.",
      "- Elegí entre 3 y 6 rasgos; dejá afuera los que no tienen que ver con el puesto.",
    ].join("\n"),
    [
      `Puesto: ${g.board.process.title}`,
      g.board.process.description ? `Descripción: ${g.board.process.description}` : "",
      "Rasgos disponibles (clave: nombre):",
      ...medibles.map((k) => `- ${k}: ${etiqueta(k)}`),
    ].filter(Boolean).join("\n"),
    800
  );
  if (!r.ok) return r;

  const pesos: Record<string, number> = {};
  for (const [k, v] of Object.entries(r.data.pesos ?? {})) {
    const n = Math.round(Number(v));
    if (medibles.includes(k) && n >= 1 && n <= 3) pesos[k] = n;
  }
  if (Object.keys(pesos).length === 0) return { ok: false, error: "El asistente no propuso rasgos válidos. Probá de nuevo." };
  return { ok: true, data: { pesos, porque: String(r.data.porque ?? "").trim() } };
}

// ── 4. Escribir textos para el candidato ───────────────────────

export async function aiWriteProcessText(
  processId: string,
  kind: "descripcion" | "cierre",
  borrador: string
): Promise<AiOut<{ text: string }>> {
  const g = await gate(processId);
  if ("error" in g) return { ok: false, error: g.error };
  const p = g.board.process;

  if (!g.live) {
    return {
      ok: true,
      demo: true,
      data: {
        text:
          kind === "descripcion"
            ? `Buscamos ${p.title.toLowerCase()}. La evaluación lleva unos 25 minutos, se hace desde el celular y podés cortarla y seguir después. No hay respuestas perfectas: contestá como trabajás de verdad.`
            : "¡Gracias por tomarte el tiempo! Ya recibimos tus respuestas. Las revisamos esta semana y te escribimos por WhatsApp para contarte cómo sigue, quedes o no.",
      },
    };
  }

  const r = await pedirJson<{ text?: string }>(
    [
      REGLAS,
      "",
      kind === "descripcion"
        ? "Escribís la bienvenida que ve el candidato al abrir su evaluación: qué puesto es, cuánto tarda y que puede hacerlo tranquilo. Máximo 3 frases."
        : "Escribís el mensaje que ve el candidato al terminar la evaluación: agradecé, decí qué pasa ahora y cuándo va a tener novedades, sin prometer el puesto. Máximo 3 frases.",
      "Tono cálido y respetuoso. Devolvés SOLO un JSON: {\"text\":\"...\"}",
    ].join("\n"),
    [`Puesto: ${p.title}`, borrador.trim() ? `Borrador actual para mejorar: ${borrador.trim()}` : "No hay borrador: escribilo de cero."].join("\n"),
    500
  );
  if (!r.ok) return r;
  const text = String(r.data.text ?? "").trim();
  if (!text) return { ok: false, error: "El asistente devolvió un texto vacío. Probá de nuevo." };
  return { ok: true, data: { text: text.slice(0, 600) } };
}
