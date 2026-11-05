// Casos de referencia del cobro con tarjeta (dLocal Go, y lo heredado de
// Lemon Squeezy). Los valores esperados
// están calculados a mano al lado de cada caso.
//
// Correr con: npm run test:billing
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  accesoHasta,
  centavosUsd,
  compraValida,
  formatoMonto,
  formatoUsd,
  leerDatosCompra,
  mesesPagados,
  montoCobro,
  pagoCubre,
} from "../../lib/billing/catalogo.ts";
import { claveEvento, firmaDlocalValida, firmaValida } from "../../lib/billing/firma.ts";

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

test("montoCobro: guaraníes tal cual, o dólares enteros", () => {
  assert.deepEqual(montoCobro(250000, "PYG", 5700), { valor: 250000, moneda: "PYG" });
  // 250.000 / 5.700 = 43,86 → USD 44 (dLocal Go pide dólares, no centavos)
  assert.deepEqual(montoCobro(250000, "USD", 5700), { valor: 44, moneda: "USD" });
  assert.equal(montoCobro(0, "PYG", 5700).valor, 0);
  assert.equal(formatoMonto({ valor: 250000, moneda: "PYG" }), "Gs. 250.000");
  assert.equal(formatoMonto({ valor: 44, moneda: "USD" }), "USD 44");
});

test("pagoCubre: solo un pago aprobado, nuestro y por el monto entero", () => {
  const esperado = { orderId: UUID_A, monto: { valor: 250000, moneda: "PYG" } };
  const pago = { status: "PAID", order_id: UUID_A, currency: "PYG", amount: 250000 };
  assert.equal(pagoCubre(pago, esperado), true);
  assert.equal(pagoCubre({ ...pago, status: "PENDING" }, esperado), false);
  // Un pago de otra compra que trae otro order_id no activa esta.
  assert.equal(pagoCubre({ ...pago, order_id: UUID_B }, esperado), false);
  assert.equal(pagoCubre({ ...pago, currency: "USD" }, esperado), false);
  assert.equal(pagoCubre({ ...pago, amount: 1000 }, esperado), false);
  assert.equal(pagoCubre(null, esperado), false);
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

test("firma de dLocal Go: HMAC de la API Key más el cuerpo, con la Secret Key", () => {
  const cuerpo = '{"payment_id":"DP-283"}';
  const firma = createHmac("sha256", "MiSecretKey").update("MiApiKey" + cuerpo).digest("hex");
  const cabecera = `V2-HMAC-SHA256, Signature: ${firma}`;
  assert.equal(firmaDlocalValida(cuerpo, cabecera, "MiApiKey", "MiSecretKey"), true);
  assert.equal(firmaDlocalValida(cuerpo + " ", cabecera, "MiApiKey", "MiSecretKey"), false);
  assert.equal(firmaDlocalValida(cuerpo, cabecera, "OtraApiKey", "MiSecretKey"), false);
  assert.equal(firmaDlocalValida(cuerpo, `Bearer ${firma}`, "MiApiKey", "MiSecretKey"), false);
  assert.equal(firmaDlocalValida(cuerpo, null, "MiApiKey", "MiSecretKey"), false);
});
