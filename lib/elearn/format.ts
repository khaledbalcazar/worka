// Reconstruye el texto del PDF (líneas cortadas a lo ancho, espacios de
// justificación, diagramas ASCII) en bloques legibles. Sin dependencias:
// se usa en el servidor para servir el manual ya formateado.

export type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "li"; text: string }
  | { type: "callout"; tag: string; text: string }
  | { type: "pre"; text: string };

const ART = /[│┌┐└┘├┤┬┴┼─═║╔╗╚╝▼▲◄►┏┓┗┛━┃]/;
// Ancho típico de línea completa del PDF (medido: p90 ≈ 110).
const FULL_WIDTH = 88;

function tidy(line: string): string {
  return line
    .replace(/\s+/g, " ") // colapsa la justificación
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

// Encabezado numerado: "4.2 El mapa de la ley", "0-B.3 El sistema…"
const NUM_HEAD = /^(\d+(?:-[A-Z])?(?:\.\d+)*)\s+(\S.*)$/;
// Marcadores del manual: [PARA LA ENTREVISTA], [OJO], [TRUCO]…
const CALLOUT_START = /^\[([^\]]{2,40})\]\s*(.*)$/;
const BULLET = /^[-•▪>»→]\s+(.+)$/;
// Fila de tabla capítulo/artículos: "I Disposiciones generales 1-6",
// "Cap. Materia Arts." (encabezado de la tabla, se descarta).
const TABLE_ROW = /^([IVXLCDM]+|\d{1,3})\s+(.+?)\s+(\d{1,4}(?:-\d{1,4})?)$/;
const TABLE_HEADER = /^Cap\.?\s+Materia\s+Arts?\.?$/i;

function isHeading(l: string): boolean {
  if (l.length > 95) return false;
  if (/^PARTE\s/.test(l)) return true;
  const m = NUM_HEAD.exec(l);
  if (m && m[2].length > 2 && !/[.;]$/.test(l)) return true;
  // Línea corta en mayúsculas (títulos tipo "EJE 1 — DERECHOS…")
  const letters = l.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (
    letters.length > 6 &&
    letters === letters.toUpperCase() &&
    !/[.]$/.test(l)
  )
    return true;
  return false;
}

export function formatManual(rawBody: string): Block[] {
  const src = rawBody.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let art: string[] = [];
  let calloutTag: string | null = null;

  const flushPara = () => {
    if (calloutTag != null) {
      const text = para.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "callout", tag: calloutTag, text });
      calloutTag = null;
      para = [];
      return;
    }
    if (!para.length) return;
    const text = para.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "p", text });
    para = [];
  };
  const flushArt = () => {
    if (!art.length) return;
    // Recorta líneas en blanco de los bordes del diagrama.
    while (art.length && !art[0].trim()) art.shift();
    while (art.length && !art[art.length - 1].trim()) art.pop();
    if (art.length) blocks.push({ type: "pre", text: art.join("\n") });
    art = [];
  };

  for (const rawLine of src) {
    // Los diagramas se preservan tal cual (sin colapsar espacios).
    if (ART.test(rawLine)) {
      flushPara();
      art.push(rawLine.replace(/\s+$/, ""));
      continue;
    }
    const line = tidy(rawLine);
    if (art.length) {
      // Una línea normal corta puede seguir siendo parte del diagrama.
      if (!line) {
        flushArt();
        continue;
      }
      flushArt();
    }
    if (!line) {
      flushPara();
      continue;
    }

    if (TABLE_HEADER.test(line)) continue; // encabezado repetido de tabla

    if (isHeading(line)) {
      flushPara();
      const m = NUM_HEAD.exec(line);
      // Nivel por profundidad de la numeración (4.2 → h3, 4 → h2).
      const depth = m ? m[1].split(".").length : 1;
      blocks.push({ type: depth >= 2 ? "h3" : "h2", text: line });
      continue;
    }

    const tr = TABLE_ROW.exec(line);
    if (tr && !para.length) {
      flushPara();
      blocks.push({ type: "li", text: `${tr[1]} — ${tr[2]} (Art. ${tr[3]})` });
      continue;
    }

    const b = BULLET.exec(line);
    if (b) {
      flushPara();
      blocks.push({ type: "li", text: b[1].trim() });
      continue;
    }

    const c = CALLOUT_START.exec(line);
    if (c) {
      flushPara();
      calloutTag = c[1].trim();
      para = c[2] ? [c[2]] : [];
      continue;
    }

    para.push(line);
    // Los callouts se cierran por línea vacía/heading, no por ancho — suelen
    // tener frases cortas. Los párrafos normales sí cortan por ancho.
    if (calloutTag == null && line.length < FULL_WIDTH) flushPara();
  }
  flushArt();
  flushPara();
  return blocks;
}
