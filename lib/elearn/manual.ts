import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Block } from "./format";

// Manual de Estudio (fuente: .docx oficial, preprocesado por
// scripts/extract-manual.mjs a lib/elearn/manual-data.json). Se usa para:
// (1) la vista "Manual Completo" del aula, y (2) aterrizar las respuestas
// del tutor IA en el texto real del manual.

export interface ManualPart {
  id: string;
  title: string;
  blocks: Block[];
}

let PARTS: ManualPart[] | null = null;

export function getManualParts(): ManualPart[] {
  if (PARTS) return PARTS;
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "lib", "elearn", "manual-data.json"),
      "utf8"
    );
    PARTS = JSON.parse(raw) as ManualPart[];
  } catch {
    PARTS = [];
  }
  return PARTS;
}

export interface ManualSection {
  prefix: string; // "4.3", "0-B.1"…
  title: string;  // encabezado completo del H2
  blocks: Block[]; // contenido íntegro de la sección (sin el propio H2)
}

// Extrae el prefijo numérico de un encabezado ("4.3 CAPÍTULO I — ..." -> "4.3").
function sectionPrefix(text: string): string | null {
  const m = /^(\d+(?:-[A-Z])?(?:\.\d+)*)\s/.exec(text.trim());
  return m ? m[1] : null;
}

// Devuelve las secciones (H2) de una parte del manual, cada una con todo su
// contenido hasta el siguiente H2. Es el material de estudio que se muestra
// dentro de cada unidad de un curso del Temario Oficial.
export function getPartSections(partId: string): ManualSection[] {
  const part = getManualParts().find((p) => p.id === partId);
  if (!part) return [];
  const sections: ManualSection[] = [];
  let current: ManualSection | null = null;
  for (const b of part.blocks) {
    if (b.type === "heading" && b.level <= 2) {
      const prefix = sectionPrefix(b.text);
      current = { prefix: prefix ?? b.text, title: b.text, blocks: [] };
      sections.push(current);
      continue;
    }
    if (current) current.blocks.push(b);
  }
  return sections;
}

function blockText(b: Block): string {
  switch (b.type) {
    case "heading":
      return b.text;
    case "p":
    case "li":
    case "quote":
    case "pre":
      return b.text;
    case "callout":
      return `${b.tag}: ${b.text}`;
    case "table":
      return b.rows.map((r) => r.join(" | ")).join("\n");
  }
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
  const out: Chunk[] = [];
  for (const part of getManualParts()) {
    let buf: string[] = [];
    let heading = part.title;
    const flush = () => {
      const t = buf.join(" ").trim();
      if (t.length > 60)
        out.push({
          label: heading,
          text: t,
          tokens: new Set(
            normalize(part.title + " " + t)
              .split(/\s+/)
              .filter((w) => w.length > 3)
          ),
        });
      buf = [];
    };
    for (const b of part.blocks) {
      if (b.type === "heading") {
        flush();
        heading = b.text;
        continue;
      }
      const t = blockText(b);
      if ((buf.join(" ") + t).length > 1800) flush();
      buf.push(t);
    }
    flush();
  }
  CHUNKS = out;
  return out;
}

// Devuelve los pasajes del manual más relevantes para una consulta.
export function retrieveRelevant(query: string, n = 6, maxChars = 12000): string {
  const qTokens = new Set(normalize(query).split(/\s+/).filter((w) => w.length > 3));
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
