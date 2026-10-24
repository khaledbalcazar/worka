// Casos de referencia de los cálculos de Worka Evaluar.
//
// Los resultados esperados están hechos a mano, al lado de cada caso, y no
// con el mismo código que se prueba: si alguien cambia una fórmula, la cuenta
// escrita acá deja de coincidir y hay que decidir cuál de las dos está bien.
//
// Correr con: npm run test:evaluar  (Node 22.6+ lee el .ts sin compilar).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  corregirEtapa,
  csvCell,
  dimensionPct,
  escapeHtml,
  fitCoverage,
  fitScore,
  likertValido,
  mensajeParaEmpresa,
  modoCorreccion,
  percentOf,
  validarEntrega,
} from "../../lib/evaluar/puntaje.ts";

// ── Porcentajes ────────────────────────────────────────────────

test("percentOf: 19 de 42 puntos es 45% (19/42 = 0,452)", () => {
  assert.equal(percentOf(19, 42), 45);
});

test("percentOf: sin máximo no hay porcentaje (denominador cero)", () => {
  assert.equal(percentOf(0, 0), null);
  assert.equal(percentOf(5, null), null);
  assert.equal(percentOf(null, 10), 0);
});

test("dimensionPct: max 0 devuelve null, no 0%", () => {
  assert.equal(dimensionPct({ raw: 0, max: 0 }), null);
  assert.equal(dimensionPct({ raw: 8, max: 15 }), 53); // 53,33
});

// ── Ajuste al puesto ───────────────────────────────────────────

test("fitScore: promedio ponderado solo de los rasgos rendidos", () => {
  // teson 8/15 = 0,5333 × 3 = 1,6 ; servicio 1/2 = 0,5 × 1 = 0,5
  // apertura pedida con peso 2 pero no rendida: no entra.
  // (1,6 + 0,5) / (3 + 1) = 0,525 → 53%
  const perfil = { teson: { raw: 8, max: 15 }, servicio: { raw: 1, max: 2 } };
  assert.equal(fitScore(perfil, { teson: 3, servicio: 1, apertura: 2 }), 53);
  assert.deepEqual(fitCoverage(perfil, { teson: 3, servicio: 1, apertura: 2 }), {
    rendidos: 2,
    pedidos: 3,
  });
});

test("fitScore: sin perfil ideal, pesos en cero o rasgos sin rendir → null", () => {
  assert.equal(fitScore({ teson: { raw: 4, max: 5 } }, undefined), null);
  assert.equal(fitScore({ teson: { raw: 4, max: 5 } }, { teson: 0 }), null);
  assert.equal(fitScore({ teson: { raw: 0, max: 0 } }, { teson: 2 }), null);
  assert.equal(fitScore({}, { apertura: 3 }), null);
});

test("fitScore y percent miden cosas distintas (antecedente 4)", () => {
  // Una persona puede tener 45% de puntaje (19/42 en preguntas con correcta y
  // puntos por opción) y 32% de ajuste (rasgos que pidió la empresa): no se
  // derivan uno del otro. Este caso fija que el ajuste no usa score/max.
  const perfil = { teson: { raw: 4, max: 12.5 } }; // 32%
  assert.equal(fitScore(perfil, { teson: 1 }), 32);
  assert.equal(percentOf(19, 42), 45);
});

// ── Corrección de una etapa ────────────────────────────────────

test("conocimientos: puntos, peso, sin responder y pregunta abierta", () => {
  const preguntas = [
    { id: "q1", kind: "unica", correct: "B", weight: 2 },
    { id: "q2", kind: "unica", correct: "4", weight: 1 },
    { id: "q3", kind: "unica", correct: "X", weight: 3 },
    { id: "q4", kind: "texto", correct: null },
  ];
  const r = corregirEtapa(preguntas, { q1: "B", q2: "5", q4: "Mi respuesta" });
  // q1 bien (2/2), q2 mal (0/1), q3 sin responder (0/3), q4 no puntúa.
  assert.equal(r.total, 2);
  assert.equal(r.max, 6);
  assert.equal(r.knocked, false);
  assert.deepEqual(r.scores, { q1: 2, q2: 0, q3: 0, q4: 0 });
  assert.equal(percentOf(r.total, r.max), 33);
});

test("excluyente: una incorrecta descarta; sin responder también", () => {
  const preguntas = [{ id: "k", kind: "unica", correct: "Sí", knockout: true }];
  assert.equal(corregirEtapa(preguntas, { k: "No" }).knocked, true);
  assert.equal(corregirEtapa(preguntas, {}).knocked, true);
  assert.equal(corregirEtapa(preguntas, { k: "Sí" }).knocked, false);
});

test("likert con ítem inverso y uno sin responder", () => {
  const preguntas = [
    { id: "a", kind: "likert", dimension: "teson" },
    { id: "b", kind: "likert", dimension: "teson", reverse: true },
    { id: "c", kind: "likert", dimension: "teson" },
  ];
  const r = corregirEtapa(preguntas, { a: 4, b: 2 });
  // a = 4 ; b inverso = 6 − 2 = 4 ; c sin responder = 0 con máximo 5.
  assert.deepEqual(r.profile.teson, { raw: 8, max: 15 });
  // El likert no entra al puntaje general, solo al perfil.
  assert.equal(r.total, 0);
  assert.equal(r.max, 0);
});

test("likert fuera de rango se toma como sin responder (no 9 de 5)", () => {
  assert.equal(likertValido(9), null);
  assert.equal(likertValido(0), null);
  assert.equal(likertValido(2.5), null);
  assert.equal(likertValido("3"), null);
  const r = corregirEtapa([{ id: "a", kind: "likert", dimension: "x" }], { a: 9 });
  assert.deepEqual(r.profile.x, { raw: 0, max: 5 });
});

test("juicio situacional: puntos por opción entran al puntaje y al rasgo", () => {
  const sjt = {
    id: "s",
    kind: "unica",
    dimension: "servicio",
    option_scores: { A: 2, B: 1, C: 0 },
  };
  const r = corregirEtapa([sjt], { s: "B" });
  assert.equal(r.total, 1);
  assert.equal(r.max, 2);
  assert.deepEqual(r.profile.servicio, { raw: 1, max: 2 });
  // Sin responder, el ítem de opción no suma al máximo: queda fuera.
  const vacio = corregirEtapa([sjt], {});
  assert.equal(vacio.max, 0);
  assert.equal(vacio.profile.servicio, undefined);
});

test("el perfil se acumula sobre el de etapas anteriores sin mutarlo", () => {
  const previo = { teson: { raw: 3, max: 5 } };
  const r = corregirEtapa(
    [{ id: "a", kind: "likert", dimension: "teson" }],
    { a: 5 },
    previo
  );
  assert.deepEqual(r.profile.teson, { raw: 8, max: 10 });
  assert.deepEqual(previo.teson, { raw: 3, max: 5 });
});

test("video: no puntúa ni pisa nada", () => {
  const r = corregirEtapa([{ id: "v", kind: "video" }], { v: "video" });
  assert.equal(r.max, 0);
  assert.equal(r.scores.v, undefined);
});

test("la respuesta correcta se compara por texto: reordenar opciones no cambia la nota", () => {
  const q = { id: "q", kind: "unica", correct: "Lima", options: ["Lima", "Quito"] };
  assert.equal(corregirEtapa([q], { q: "Lima" }).total, 1);
  const reordenada = { ...q, options: ["Quito", "Lima"] };
  assert.equal(corregirEtapa([reordenada], { q: "Lima" }).total, 1);
});

// ── Orden y doble envío ────────────────────────────────────────

test("validarEntrega: solo se corrige la etapa en curso", () => {
  const etapas = ["e1", "e2", "e3"];
  assert.equal(validarEntrega(etapas, 1, "e2"), "corregir");
  // Doble clic o reintento: la etapa ya entregada no vuelve a sumar.
  assert.equal(validarEntrega(etapas, 1, "e1"), "repetida");
  // Saltear etapas desde la consola.
  assert.equal(validarEntrega(etapas, 1, "e3"), "fuera_de_orden");
  assert.equal(validarEntrega(etapas, 1, "otra"), "invalida");
});

// ── Exportación y correos ──────────────────────────────────────

test("csvCell: neutraliza fórmulas y escapa comillas", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell("+595 981"), `"'+595 981"`);
  assert.equal(csvCell("-1"), `"'-1"`);
  assert.equal(csvCell("@sum"), `"'@sum"`);
  assert.equal(csvCell("Ana Pérez"), `"Ana Pérez"`);
  assert.equal(csvCell(null), `""`);
  assert.equal(csvCell(45), `"45"`);
});

test("escapeHtml: el nombre del candidato no inyecta HTML en el correo", () => {
  assert.equal(
    escapeHtml(`<a href="x">Ana</a> & 'co'`),
    "&lt;a href=&quot;x&quot;&gt;Ana&lt;/a&gt; &amp; &#39;co&#39;"
  );
  assert.equal(escapeHtml(null), "");
});

// ── Historial del panel ────────────────────────────────────────

test("mensajeParaEmpresa: tercera persona en vez de la voz del candidato", () => {
  assert.equal(
    mensajeParaEmpresa("etapa", 'Completaste la etapa "Razonamiento".', "Ana"),
    "Ana completó la etapa «Razonamiento»."
  );
  assert.equal(
    mensajeParaEmpresa("inicio", "Empezaste la evaluación.", ""),
    "Un candidato empezó la evaluación."
  );
  assert.equal(
    mensajeParaEmpresa("descartado", 'Tu proceso se cerró en la etapa "Filtro".', "Juan"),
    "Juan quedó fuera en la etapa «Filtro» por un requisito excluyente."
  );
});

// ── Modo de corrección ─────────────────────────────────────────

test("modoCorreccion: los ítems de plantilla no los juzga el evaluador", () => {
  assert.equal(modoCorreccion({ kind: "likert", correct: null }), "rasgo");
  assert.equal(
    modoCorreccion({ kind: "unica", correct: null, option_scores: { A: 1 } }),
    "por_opcion"
  );
  assert.equal(modoCorreccion({ kind: "unica", correct: "A" }), "correcta");
  assert.equal(modoCorreccion({ kind: "texto", correct: null }), "manual");
});
