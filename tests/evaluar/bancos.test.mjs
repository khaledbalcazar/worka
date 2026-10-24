// Control de calidad de los bancos de ítems de Worka Evaluar.
//
// Cada banco se revisa con reglas que no dependen de cómo se generó: si una
// clave está mal, una opción repetida o una figura no se puede dibujar, la
// prueba lo marca. Las respuestas numéricas se recalculan desde el enunciado.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MATRICES_FIGURALES,
  SERIES_FIGURALES,
  decodificar,
  describir,
} from "../../lib/evaluar/figuras.ts";
import { ATENCION, NUMERICO } from "../../lib/evaluar/bancos/generados.ts";
import { BIG5_EXTRA, COMPETENCIAS } from "../../lib/evaluar/bancos/personalidad.ts";
import { CONDUCTUAL, SJT_EXTRA } from "../../lib/evaluar/bancos/situacional.ts";

const total =
  MATRICES_FIGURALES.length +
  SERIES_FIGURALES.length +
  NUMERICO.length +
  ATENCION.length +
  BIG5_EXTRA.length +
  COMPETENCIAS.length +
  SJT_EXTRA.length +
  CONDUCTUAL.length;

test(`hay al menos 500 ítems nuevos (${total})`, () => {
  assert.ok(total >= 500, `solo ${total}`);
});

function clave(item) {
  assert.ok(Array.isArray(item.options), "sin opciones");
  assert.equal(new Set(item.options).size, item.options.length, `opciones repetidas: ${item.options}`);
  assert.ok(item.options.includes(item.correct), `la correcta no está entre las opciones: ${item.correct}`);
}

test("figuras: 4 opciones distintas, una correcta, todo dibujable", () => {
  for (const it of [...MATRICES_FIGURALES, ...SERIES_FIGURALES]) {
    assert.equal(it.options.length, 4);
    clave(it);
    for (const cod of [...it.figure.celdas, ...it.options]) {
      assert.ok(decodificar(cod), `código inválido: ${cod}`);
      assert.ok(describir(cod).length > 3);
    }
    assert.equal(it.figure.celdas.length, it.figure.tipo === "matriz" ? 8 : 4);
  }
});

test("figuras: hay de las tres dificultades y ninguna matriz repetida", () => {
  const dif = new Set(MATRICES_FIGURALES.map((i) => i.dificultad));
  assert.deepEqual([...dif].sort(), [1, 2, 3]);
  const claves = new Set(MATRICES_FIGURALES.map((i) => i.figure.celdas.join("|")));
  assert.equal(claves.size, MATRICES_FIGURALES.length);
});

// Recalcula la respuesta de un ítem numérico a partir del texto.
function numeros(texto) {
  return [...texto.matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, "")));
}
function siguiente(serie) {
  const d = serie.slice(1).map((x, i) => x - serie[i]);
  if (d.every((x) => x === d[0])) return serie.at(-1) + d[0];
  const q = serie[1] / serie[0];
  if (serie.every((x, i) => i === 0 || x === serie[i - 1] * q)) return serie.at(-1) * q;
  const dd = d.slice(1).map((x, i) => x - d[i]);
  if (dd.every((x) => x === dd[0])) return serie.at(-1) + d.at(-1) + dd[0];
  // Alternada: los saltos pares e impares se repiten.
  if (d.every((x, i) => x === d[i % 2])) return serie.at(-1) + d[d.length % 2];
  return null;
}

test("numérico: cada respuesta se recalcula desde el enunciado", () => {
  for (const q of NUMERICO) {
    clave(q);
    assert.equal(q.options.length, 4);
    const n = numeros(q.text);
    const correcta = Number(q.correct.replace(/\D/g, ""));
    if (q.text.startsWith("¿Qué número sigue?")) {
      assert.equal(siguiente(n), correcta, q.text);
    } else if (q.text.includes("descuento")) {
      const [precio, pct] = n;
      assert.equal(precio - (precio * pct) / 100, correcta, q.text);
    } else {
      const [cantidad, costo, pedida] = n;
      assert.equal((costo / cantidad) * pedida, correcta, q.text);
    }
  }
});

test("atención: una sola opción idéntica al dato", () => {
  for (const q of ATENCION) {
    clave(q);
    const dato = q.text.split("?  ")[1];
    assert.equal(q.correct, dato);
    assert.equal(q.options.filter((o) => o === dato).length, 1);
  }
});

test("likert: cada rasgo tiene ítems derechos e inversos, sin frases repetidas", () => {
  for (const banco of [BIG5_EXTRA, COMPETENCIAS]) {
    const textos = new Set(banco.map((q) => q.text));
    assert.equal(textos.size, banco.length);
    const porRasgo = new Map();
    for (const q of banco) {
      assert.equal(q.kind, "likert");
      const g = porRasgo.get(q.dimension) ?? { der: 0, inv: 0 };
      if (q.reverse) g.inv++;
      else g.der++;
      porRasgo.set(q.dimension, g);
    }
    for (const [rasgo, g] of porRasgo) {
      assert.ok(g.der >= 4 && g.inv >= 4, `${rasgo}: ${g.der} derechos y ${g.inv} inversos`);
    }
  }
});

test("juicio situacional: cuatro opciones con 3, 2, 1 y 0 puntos", () => {
  for (const q of SJT_EXTRA) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.deepEqual(Object.keys(q.optionScores).sort(), [...q.options].sort());
    assert.deepEqual(Object.values(q.optionScores).sort(), [0, 1, 2, 3]);
  }
  // La mejor no queda siempre en el mismo lugar.
  const lugares = new Set(SJT_EXTRA.map((q) => q.options.findIndex((o) => q.optionScores[o] === 3)));
  assert.equal(lugares.size, 4);
});

test("entrevista conductual: preguntas abiertas y distintas", () => {
  assert.equal(new Set(CONDUCTUAL.map((q) => q.text)).size, CONDUCTUAL.length);
  for (const q of CONDUCTUAL) assert.equal(q.kind, "texto");
});
