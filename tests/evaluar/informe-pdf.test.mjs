// Reglas del informe PDF (especificación v1.0), sobre el modelo de
// presentación: lo que la plantilla muestra sale de acá.
import { test } from "node:test";
import assert from "node:assert/strict";
import { construirInforme, porcentajePuntos } from "../../lib/evaluar/pdf/modelo.ts";
import { CON_BAREMO, MUCHOS, REFERENCIA, VACIO } from "./fixtures/informe.mjs";

test("caso de referencia: resumen, avance y estado", () => {
  const m = construirInforme(REFERENCIA);
  const [ajuste, objetivas, avance] = m.resumen;
  assert.equal(ajuste.valor, null);
  assert.equal(ajuste.sinValor, "No calculado");
  assert.match(ajuste.detalle, /Falta configurar qué importa en el puesto/);
  assert.equal(objetivas.valor, "44%");
  assert.match(objetivas.detalle, /^21 de 48 puntos/);
  // 4 de 4 no se convierte en «terminó»: se muestra junto con Rindiendo.
  assert.equal(avance.valor, "4 de 4");
  assert.match(avance.detalle, /Todavía está rindiendo/);
  assert.equal(m.estado, "Rindiendo");
  assert.equal(m.origen, "Invitado por la empresa");
});

test("caso de referencia: rasgos, ceros, orden y disponibilidad", () => {
  const m = construirInforme(REFERENCIA);
  assert.deepEqual(m.rasgos.map((r) => r.pct), [78, 67, 33, 25, 0, 0, 0]);
  // Los dos razonamientos abstractos siguen separados.
  assert.equal(m.rasgos.filter((r) => r.label.startsWith("Razonamiento abstracto")).length, 2);
  assert.deepEqual(
    m.rasgos.map((r) => r.comparacion),
    [9, 9, 1, 8, 10, 8, 9].map((n) => `Sin baremo disponible · ${n} de 30 respuestas`)
  );
  assert.equal(m.hayPercentil, false);
  assert.equal(m.hayObjetivo, false);
  assert.ok(m.rasgos.every((r) => r.objetivo === null));
  assert.ok(!m.guia.some((g) => /percentil compara|línea punteada/.test(g)));
});

test("caso de referencia: alerta de calidad sin convertirla en descarte", () => {
  const m = construirInforme(REFERENCIA);
  assert.equal(m.calidad.length, 1);
  assert.equal(m.calidad[0].titulo, "Contestó demasiado rápido");
  assert.match(m.calidad[0].detalle, /2\.1 segundos por pregunta \(67 segundos para 32\).*2\.5/);
  assert.equal(m.consistencia, null);
  assert.equal(m.cv, "No adjuntó CV.");
  assert.deepEqual(m.notas, []);
});

test("con baremo y perfil del puesto: percentil rotulado aparte y objetivo real", () => {
  const m = construirInforme(CON_BAREMO);
  assert.equal(m.rasgos[0].comparacion, "Percentil 72 · contra 140 personas evaluadas");
  assert.equal(m.rasgos[0].objetivo, 100);
  assert.equal(m.rasgos[2].objetivo, 33);
  assert.equal(m.objetivoCompleto, true);
  assert.equal(m.resumen[0].valor, "61%");
  assert.match(m.resumen[2].detalle, /^Terminó el 24 de octubre de 2026, en 1 minuto\./);
  assert.ok(m.guia.some((g) => /percentil compara/.test(g)));
});

test("perfil del puesto parcial: no se cierra el polígono", () => {
  const m = construirInforme({ ...REFERENCIA, proceso: { ...REFERENCIA.proceso, ideal_profile: { servicio: 3 } } });
  assert.equal(m.hayObjetivo, true);
  assert.equal(m.objetivoCompleto, false);
});

test("datos incompletos: null no es cero y no se divide por cero", () => {
  assert.equal(porcentajePuntos(21, 48), 44);
  assert.equal(porcentajePuntos(0, 48), 0);
  assert.equal(porcentajePuntos(0, 0), null);
  assert.equal(porcentajePuntos(null, 48), null);
  assert.equal(porcentajePuntos(5, null), null);
  const m = construirInforme(VACIO);
  assert.equal(m.resumen[1].valor, null);
  assert.equal(m.resumen[1].sinValor, "No calculable");
  assert.equal(m.resumen[2].valor, "1 de 4");
  assert.match(m.resumen[2].detalle, /no empezó/);
  assert.equal(m.rasgos.length, 0);
  assert.equal(m.radar, false);
  assert.equal(m.consistencia, null);
});

test("cero de puntos se muestra como 0%", () => {
  const m = construirInforme({ ...REFERENCIA, candidato: { ...REFERENCIA.candidato, score: 0 } });
  assert.equal(m.resumen[1].valor, "0%");
});

test("contactos solo para quien puede verlos; líneas vacías fuera", () => {
  assert.deepEqual(construirInforme(REFERENCIA).ubicacionContacto, ["San Lorenzo", "persona@ejemplo.test", "0900 000 000"]);
  assert.deepEqual(construirInforme(MUCHOS).ubicacionContacto, ["San Lorenzo"]);
  const sinCiudad = construirInforme({ ...REFERENCIA, candidato: { ...REFERENCIA.candidato, city: "  ", phone: null } });
  assert.deepEqual(sinCiudad.ubicacionContacto, ["persona@ejemplo.test"]);
});

test("contenido variable: muchos rasgos, integridad, notas y textos como datos", () => {
  const m = construirInforme(MUCHOS);
  assert.equal(m.rasgos.length, 18);
  assert.equal(m.radar, false); // más de 12 ejes: solo tabla con barras
  assert.deepEqual(m.rasgos.map((r) => r.numero), Array.from({ length: 18 }, (_, i) => i + 1));
  assert.equal(m.integridad?.confiable, true);
  assert.deepEqual(m.integridad?.paraHablar, ["Cuidado de lo ajeno"]);
  assert.equal(m.notas.length, 2);
  assert.match(m.notas[1].texto, /^<script>/); // se muestra como texto, no se interpreta
  assert.equal(m.notas[0].meta, "23 de octubre de 2026 · Calificación 4 de 5");
  assert.match(m.cv, /Adjuntó su CV/);
  assert.equal(m.videos, 2);
});

test("el nombre del proceso no repite el área", () => {
  const m = construirInforme({ ...REFERENCIA, proceso: { ...REFERENCIA.proceso, title: "Cajero · Sucursal Centro", org_unit: "Sucursal Centro", department: "Cajas" } });
  assert.equal(m.area, "Cajas");
});
