// Genera PDFs de ejemplo del informe de candidato con datos sintéticos.
//
//   node scripts/informe-pdf-ejemplos.mjs [carpeta-de-salida]
//
// Sirve para revisar la plantilla sin base ni servidor: casos de referencia,
// con baremo, vacío y con muchos rasgos (tests/evaluar/fixtures/informe.mjs).
// La plantilla es TSX: se transpila con TypeScript a una carpeta de caché
// dentro de node_modules, para que resuelva sus dependencias igual que la app.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToFile } from "@react-pdf/renderer";
import { construirInforme } from "../lib/evaluar/pdf/modelo.ts";
import * as casos from "../tests/evaluar/fixtures/informe.mjs";

const raiz = process.cwd();
const salida = path.resolve(process.argv[2] ?? "informe-pdf-ejemplos");
const cache = path.join(raiz, "node_modules", ".cache", "informe-pdf");
fs.mkdirSync(cache, { recursive: true });
fs.mkdirSync(salida, { recursive: true });

const fuente = fs.readFileSync(path.join(raiz, "lib/evaluar/pdf/InformePdf.tsx"), "utf8");
const { outputText } = ts.transpileModule(fuente, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
});
const destino = path.join(cache, "InformePdf.mjs");
fs.writeFileSync(destino, outputText);
const { default: InformePdf } = await import(pathToFileURL(destino).href);

for (const [nombre, entrada] of Object.entries(casos)) {
  const archivo = path.join(salida, `ejemplo-${nombre.toLowerCase()}.pdf`);
  await renderToFile(createElement(InformePdf, { m: construirInforme(entrada) }), archivo);
  console.log("listo:", archivo);
}
