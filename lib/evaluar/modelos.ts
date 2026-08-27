// Modelos sugeridos para el selector del backoffice.
//
// Vive aparte de lib/evaluar/ai.ts porque aquel es server-only —lee las claves
// con la service role— y esta lista la necesita un componente del navegador.
//
// NO es una lista cerrada: el campo acepta cualquier texto. Groq da de alta
// modelos nuevos seguido, y obligar a desplegar un cambio para usar uno
// repetiria el problema que la columna vino a resolver.
export const MODELOS_SUGERIDOS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "moonshotai/kimi-k2-instruct",
  "qwen/qwen3-32b",
];
