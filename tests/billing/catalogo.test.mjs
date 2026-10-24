// Casos de referencia del cobro con Lemon Squeezy. Los valores esperados
// están calculados a mano al lado de cada caso.
//
// Correr con: npm run test:billing
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  accesoHasta,
  centavosUsd,
  claveVariante,
  compraValida,
  formatoUsd,
  leerDatosCompra,
  leerVariantes,
  mesesPagados,
  todasLasClaves,
} from "../../lib/billing/catalogo.ts";
import { claveEvento, firmaValida } from "../../lib/billing/firma.ts";

const UUID_A = "11111111-1111-4111-8111-111111111111";
const UUID_B = "22222222-2222-4222-8222-222222222222";

test("compraValida: solo planes y duraciones que existen", () => {
  assert.equal(compraValida({ product: "enterprise", plan: "pro", months: 1 }), true);
  assert.equal(compraValida({ product: "evaluar", plan: "profesional", months: 12 }), true);
  assert.equal(compraValida({ product: "boost", plan: "15" }), true);
  // Corporativo es a medida; 6 meses no existe; un destacado no lleva meses.
  assert.equal(compraValida({ product: "evaluar", plan: "corporativo", months: 1 }), false);
  assert.equal(compraValida({ product: "pro", plan: "pro", months: 6 }), false);
  assert.equal(compraValida({ product: "boost", plan: "7", months: 1 }), false);
  assert.equal(compraValida({ product: "gratis", plan: "x", months: 1 }), false);
  assert.equal(compraValida(null), false);
});

test("claves de variante: 18 en total (15 suscripciones + 3 destacados)", () => {
  assert.equal(claveVariante({ product: "enterprise", plan: "empresa", months: 12 }), "enterprise:empresa:12");
  assert.equal(claveVariante({ product: "boost", plan: "30" }), "boost:30");
  const todas = todasLasClaves();
  assert.equal(todas.length, 18);
  assert.equal(new Set(todas).size, 18);
});

test("leerVariantes: ignora ids que no son números", () => {
  assert.deepEqual(
    leerVariantes('{"pro:pro:1": 123456, "pro:pro:3": "789", "pro:pro:12": "abc", "boost:7": 0}'),
    { "pro:pro:1": "123456", "pro:pro:3": "789" }
  );
  assert.deepEqual(leerVariantes("no es json"), {});
  assert.deepEqual(leerVariantes("[1,2]"), {});
  assert.deepEqual(leerVariantes(undefined), {});
});

test("centavosUsd: guaraníes a dólares enteros", () => {
  // 250.000 / 5.700 = 43,86 → USD 44
  assert.equal(centavosUsd(250000, 5700), 4400);
  // 29.000 / 5.700 = 5,09 → USD 5
  assert.equal(centavosUsd(29000, 5700), 500);
  // Anual de Evaluar Profesional: 790.000 × 10 = 7.900.000 / 5.700 = 1.385,96 → USD 1.386
  assert.equal(centavosUsd(790000 * mesesPagados(12), 5700), 138600);
  // Nunca menos de un dólar; sin precio o sin cambio, cero.
  assert.equal(centavosUsd(1000, 5700), 100);
  assert.equal(centavosUsd(0, 5700), 0);
  assert.equal(centavosUsd(100000, 0), 0);
});

test("mesesPagados y formato", () => {
  assert.equal(mesesPagados(1), 1);
  assert.equal(mesesPagados(3), 3);
  assert.equal(mesesPagados(12), 10);
  assert.equal(formatoUsd(4400), "USD 44");
  assert.equal(formatoUsd(4450), "USD 44,50");
});

test("leerDatosCompra: valida lo que vuelve del webhook", () => {
  const ok = leerDatosCompra({ payer_id: UUID_A, buyer_id: UUID_B, product: "pro", plan: "pro", months: "3" });
  assert.equal(ok?.compra.months, 3);
  assert.equal(ok?.product, "pro");
  const boost = leerDatosCompra({ payer_id: UUID_A, buyer_id: UUID_A, product: "boost", plan: "7", boost_id: UUID_B });
  assert.equal(boost?.boost_id, UUID_B);
  // Destacado sin solicitud, id inválido, plan inexistente: afuera.
  assert.equal(leerDatosCompra({ payer_id: UUID_A, buyer_id: UUID_A, product: "boost", plan: "7" }), null);
  assert.equal(leerDatosCompra({ payer_id: "1", buyer_id: UUID_A, product: "pro", plan: "pro", months: "1" }), null);
  assert.equal(leerDatosCompra({ payer_id: UUID_A, buyer_id: UUID_A, product: "pro", plan: "oro", months: "1" }), null);
  assert.equal(leerDatosCompra(null), null);
});

test("accesoHasta: qué estados dan acceso y hasta cuándo", () => {
  const ahora = Date.parse("2026-10-24T12:00:00Z");
  const renueva = "2026-11-24T12:00:00Z";
  const termina = "2026-11-10T00:00:00Z";
  const pasado = "2026-10-01T00:00:00Z";
  assert.equal(accesoHasta("active", renueva, null, ahora), "2026-11-24T12:00:00.000Z");
  assert.equal(accesoHasta("on_trial", renueva, null, ahora), "2026-11-24T12:00:00.000Z");
  // Cobro fallido: se respeta lo pagado mientras Lemon Squeezy reintenta.
  assert.equal(accesoHasta("past_due", renueva, null, ahora), "2026-11-24T12:00:00.000Z");
  // Cancelada: hasta el fin de lo pagado.
  assert.equal(accesoHasta("cancelled", renueva, termina, ahora), "2026-11-10T00:00:00.000Z");
  // Sin acceso.
  assert.equal(accesoHasta("expired", renueva, termina, ahora), null);
  assert.equal(accesoHasta("unpaid", renueva, null, ahora), null);
  assert.equal(accesoHasta("paused", renueva, null, ahora), null);
  assert.equal(accesoHasta("cancelled", null, pasado, ahora), null);
});

test("firma del webhook: HMAC-SHA256 del cuerpo crudo", () => {
  const cuerpo = '{"meta":{"event_name":"order_created"}}';
  const secreto = "secreto-de-prueba";
  const firma = createHmac("sha256", secreto).update(cuerpo).digest("hex");
  assert.equal(firmaValida(cuerpo, firma, secreto), true);
  // Un espacio de más en el cuerpo, otro secreto o sin firma: rechazada.
  assert.equal(firmaValida(cuerpo + " ", firma, secreto), false);
  assert.equal(firmaValida(cuerpo, firma, "otro"), false);
  assert.equal(firmaValida(cuerpo, null, secreto), false);
  assert.equal(firmaValida(cuerpo, firma, ""), false);
  assert.equal(firmaValida(cuerpo, "abc", secreto), false);
});

test("claveEvento: el mismo cuerpo, la misma clave", () => {
  assert.equal(claveEvento("x"), claveEvento("x"));
  assert.notEqual(claveEvento("x"), claveEvento("y"));
});
