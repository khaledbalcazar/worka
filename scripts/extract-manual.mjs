#!/usr/bin/env node
// Convierte lib/elearn/manual.docx (el .docx oficial, fuente canónica) en
// lib/elearn/manual-data.json: un árbol de Partes -> Bloques (encabezados,
// párrafos, listas, tablas reales, callouts, diagramas).
//
// Se corre una sola vez (o cuando cambia el manual): `node scripts/extract-manual.mjs`.
// El runtime (lib/elearn/manual.ts) solo LEE el JSON generado — no parsea XML.
// Requiere el binario `unzip` (un .docx es un .zip).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DOCX_PATH = path.join(process.cwd(), "lib", "elearn", "manual.docx");
const OUT_PATH = path.join(process.cwd(), "lib", "elearn", "manual-data.json");

const xml = execFileSync("unzip", ["-p", DOCX_PATH, "word/document.xml"], {
  maxBuffer: 1024 * 1024 * 50,
}).toString("utf8");
const bodyStart = xml.indexOf("<w:body>") + "<w:body>".length;
const bodyEnd = xml.lastIndexOf("</w:body>");
const body = xml.slice(bodyStart, bodyEnd);

function textOfParagraph(pXml) {
  return [...pXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
    .map((m) => m[1])
    .join("")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function styleOfParagraph(pXml) {
  const m = /<w:pStyle w:val="([^"]+)"/.exec(pXml);
  return m ? m[1] : null;
}

function isListParagraph(pXml) {
  return /<w:numPr>/.test(pXml);
}

// Walk top-level children of <w:body>: <w:p> and <w:tbl>, in document order.
function walkBody(src) {
  const nodes = [];
  let i = 0;
  while (i < src.length) {
    const tblIdx = src.indexOf("<w:tbl>", i);
    const pIdx = src.indexOf("<w:p ", i);
    const pIdx2 = src.indexOf("<w:p>", i);
    const nextP = pIdx === -1 ? pIdx2 : pIdx2 === -1 ? pIdx : Math.min(pIdx, pIdx2);

    if (tblIdx === -1 && nextP === -1) break;

    if (tblIdx !== -1 && (nextP === -1 || tblIdx < nextP)) {
      const end = src.indexOf("</w:tbl>", tblIdx) + "</w:tbl>".length;
      nodes.push({ kind: "tbl", xml: src.slice(tblIdx, end) });
      i = end;
    } else {
      const end = src.indexOf("</w:p>", nextP) + "</w:p>".length;
      nodes.push({ kind: "p", xml: src.slice(nextP, end) });
      i = end;
    }
  }
  return nodes;
}

function parseTable(tblXml) {
  const rows = [...tblXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((m) => m[0]);
  return rows.map((rowXml) => {
    const cells = [...rowXml.matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)].map((m) => m[0]);
    return cells.map((cellXml) => {
      const paras = [...cellXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((m) =>
        textOfParagraph(m[0]).trim()
      );
      return paras.filter(Boolean).join(" ");
    });
  });
}

const CALLOUT_RE = /^\[([^\]]{2,40})\]\s*(.*)$/;

const HEADING_STYLE_LEVEL = {
  Heading1: 1,
  Heading2: 2,
  Heading3: 3,
  Heading4: 4,
};

const nodes = walkBody(body);

// Construye la lista plana de bloques (con el nivel de heading marcado),
// luego se agrupa en Partes por los Heading1.
const flat = [];
for (const node of nodes) {
  if (node.kind === "tbl") {
    const rows = parseTable(node.xml).filter((r) => r.some((c) => c.trim()));
    if (rows.length) flat.push({ type: "table", rows });
    continue;
  }
  const style = styleOfParagraph(node.xml);
  const text = textOfParagraph(node.xml).trim();
  if (!text) continue;

  if (style && HEADING_STYLE_LEVEL[style]) {
    flat.push({ type: "heading", level: HEADING_STYLE_LEVEL[style], text });
    continue;
  }
  if (style === "SourceCode") {
    // Diagrama ASCII: se acumula en bloques consecutivos.
    const last = flat[flat.length - 1];
    if (last && last.type === "pre") last.text += "\n" + text;
    else flat.push({ type: "pre", text });
    continue;
  }
  if (style === "BlockText") {
    flat.push({ type: "quote", text });
    continue;
  }
  const list = isListParagraph(node.xml);
  const callout = CALLOUT_RE.exec(text);
  if (list) {
    flat.push({ type: "li", text });
    continue;
  }
  if (callout && callout[2]) {
    flat.push({ type: "callout", tag: callout[1].trim(), text: callout[2].trim() });
    continue;
  }
  flat.push({ type: "p", text, style: style || "Normal" });
}

// Título/Subtítulo/TOC iniciales: se descartan (antes del primer Heading1).
const firstHeadingIdx = flat.findIndex((b) => b.type === "heading" && b.level === 1);
const content = flat.slice(firstHeadingIdx);

// Agrupa por Parte (Heading1). Cada parte guarda sus bloques (sin el propio
// heading de nivel 1, que pasa a ser el título de la parte).
const parts = [];
let current = null;
for (const b of content) {
  if (b.type === "heading" && b.level === 1) {
    current = { id: `parte-${parts.length}`, title: b.text, blocks: [] };
    parts.push(current);
    continue;
  }
  if (!current) continue; // no debería pasar tras el slice
  current.blocks.push(b);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(parts));
console.log(`Extraídas ${parts.length} partes, ${content.length} bloques totales.`);
console.log(`Escrito: ${OUT_PATH}`);
