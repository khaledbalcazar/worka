import "server-only";
import fs from "node:fs";
import path from "node:path";
import { formatManual, type Block } from "./format";

// Carga y procesa el Manual de Estudio completo (≈195 páginas) que vive en
// lib/elearn/manual.txt. Se usa para: (1) la vista "Manual Completo" del aula,
// y (2) aterrizar las respuestas del tutor IA en el texto real del manual.

let RAW: string | null = null;

function raw(): string {
  if (RAW == null) {
    try {
      RAW = fs.readFileSync(
        path.join(process.cwd(), "lib", "elearn", "manual.txt"),
        "utf8"
      );
    } catch {
      RAW = "";
    }
  }
  return RAW;
}

// Quita los encabezados/pies repetidos de cada página del PDF.
function clean(text: string): string {
  return text
    .replace(
      /Manual de Estudio Explicado desde Cero - MJRC-CPIEP-08-2026 - DGREC\s*\|\s*\d+\s*/g,
      ""
    )
    .replace(/\r/g, "");
}

export interface ManualPart {
  id: string;
  title: string;
  body: string; // texto plano (se mantiene para la búsqueda y el tutor IA)
  blocks: Block[]; // versión formateada para la lectura en pantalla
}

let PARTS: ManualPart[] | null = null;

// Divide el manual por sus 16 "PARTE …" (usando la aparición en el cuerpo,
// no la del índice). Cada parte conserva su texto completo.
export function getManualParts(): ManualPart[] {
  if (PARTS) return PARTS;
  const text = clean(raw());
  // Un encabezado de parte: línea que empieza con PARTE (tolera espacios dobles).
  const headingRe = /^PARTE\s+[0-9IVXAB\-]+\s*[—-].*$/gm;
  const matches: { index: number; title: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(text))) {
    matches.push({ index: m.index, title: m[0].replace(/\s+/g, " ").trim() });
  }
  // El cuerpo real arranca en la segunda tanda (la primera es el índice).
  // Nos quedamos con las apariciones a partir de la mitad del documento índice.
  const bodyStart = text.indexOf("PARTE 0 — CURSO EXPRESS", 2000);
  const body = matches.filter((x) => x.index >= (bodyStart > 0 ? bodyStart : 0));
  const parts: ManualPart[] = [];
  for (let i = 0; i < body.length; i++) {
    const start = body[i].index;
    const end = i + 1 < body.length ? body[i + 1].index : text.length;
    const slice = text.slice(start, end).trim();
    const firstNl = slice.indexOf("\n");
    const title = slice.slice(0, firstNl < 0 ? slice.length : firstNl)
      .replace(/\s+/g, " ")
      .trim();
    const content = firstNl < 0 ? "" : slice.slice(firstNl + 1).trim();
    parts.push({
      id: `parte-${i}`,
      title,
      body: content,
      blocks: formatManual(content),
    });
  }
  PARTS = parts;
  return parts;
}

// ── Recuperación simple por solapamiento de palabras clave ──

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ");
}

interface Chunk {
  label: string;
  text: string;
  tokens: Set<string>;
}

let CHUNKS: Chunk[] | null = null;

function chunks(): Chunk[] {
  if (CHUNKS) return CHUNKS;
  const parts = getManualParts();
  const out: Chunk[] = [];
  for (const part of parts) {
    // Trocea cada parte en bloques de ~1800 caracteres por párrafos.
    const paras = part.body.split(/\n\s*\n/);
    let buf = "";
    const flush = () => {
      const t = buf.trim();
      if (t.length > 60)
        out.push({
          label: part.title,
          text: t,
          tokens: new Set(normalize(part.title + " " + t).split(/\s+/).filter((w) => w.length > 3)),
        });
      buf = "";
    };
    for (const p of paras) {
      if ((buf + p).length > 1800) flush();
      buf += p + "\n\n";
    }
    flush();
  }
  CHUNKS = out;
  return out;
}

// Devuelve los pasajes del manual más relevantes para una consulta.
export function retrieveRelevant(query: string, n = 6, maxChars = 12000): string {
  const qTokens = new Set(
    normalize(query).split(/\s+/).filter((w) => w.length > 3)
  );
  if (qTokens.size === 0) return "";
  const scored = chunks()
    .map((c) => {
      let score = 0;
      for (const t of qTokens) if (c.tokens.has(t)) score++;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
  let acc = "";
  for (const { c } of scored) {
    const block = `--- ${c.label} ---\n${c.text}\n\n`;
    if (acc.length + block.length > maxChars) break;
    acc += block;
  }
  return acc.trim();
}
