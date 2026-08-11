// Tipos de bloque del manual, ya extraídos y estructurados desde el .docx
// oficial por scripts/extract-manual.mjs (ver lib/elearn/manual-data.json).
// No hay parsing de texto plano acá: Word ya nos da la estructura real
// (encabezados, listas, tablas, citas, diagramas) — solo se tipa.

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "p"; text: string; style?: string }
  | { type: "li"; text: string }
  | { type: "callout"; tag: string; text: string }
  | { type: "quote"; text: string }
  | { type: "pre"; text: string }
  | { type: "table"; rows: string[][] };
