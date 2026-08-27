// Las etiquetas de la escala de acuerdo, en su propio módulo.
//
// Vive aparte de templates.ts para romper un ciclo de imports: integridad.ts
// las necesita, y templates.ts importa integridad.ts para armar el catálogo.
// Con la constante allá adentro, el ciclo hacía que integridad.ts la leyera
// antes de que existiera y todo el catálogo fallara al cargar.
export const LIKERT_LABELS = [
  "Muy en desacuerdo",
  "En desacuerdo",
  "Ni acuerdo ni desacuerdo",
  "De acuerdo",
  "Muy de acuerdo",
];
