// Recibos digitales (número, código, monto en letras) y precios por país.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Carga un .ts de lib/ resolviendo los imports "@/lib/...".
const cache = {};
function load(rel) {
  if (cache[rel]) return cache[rel];
  const mod = { exports: {} };
  cache[rel] = mod.exports;
  const source = fs.readFileSync(fileURLToPath(new URL(`../${rel}.ts`, import.meta.url)), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const req = (p) => (p.startsWith('@/') ? load(p.slice(2)) : (() => { throw new Error(`import no soportado: ${p}`); })());
  new Function('exports', 'require', 'module', js)(mod.exports, req, mod);
  return mod.exports;
}
const R = load('lib/receipts');
const C = load('lib/currency');
const P = load('lib/plans');

test('número de recibo y código agrupado', () => {
  assert.equal(R.formatReceiptNumber(1), '001-001-0000001');
  assert.equal(R.formatReceiptNumber(1477), '001-001-0001477');
  assert.equal(R.groupCode('wk7q3m9xa2bc4def5ghj'), 'WK7Q 3M9X A2BC 4DEF 5GHJ');
  const code = R.codeFromBytes(new Uint8Array(Array.from({ length: 20 }, (_, i) => i * 13)));
  assert.equal(code.length, 20);
  assert.equal(R.isReceiptCode(code), true);
  assert.equal(R.isReceiptCode('WK7Q 3M9X A2BC 4DEF 5GHJ'), true);
  assert.equal(R.isReceiptCode('0000'), false);
  assert.equal(R.isReceiptCode('WK7Q3M9XA2BC4DEF5GH0'), false); // 0 no existe en el alfabeto
});

test('monto en letras como en el KuDE', () => {
  assert.equal(R.amountInWords(4015000, 'PYG'), 'GUARANÍES CUATRO MILLONES QUINCE MIL');
  assert.equal(R.amountInWords(365000, 'PYG'), 'GUARANÍES TRESCIENTOS SESENTA Y CINCO MIL');
  assert.equal(R.amountInWords(250000, 'PYG'), 'GUARANÍES DOSCIENTOS CINCUENTA MIL');
  assert.equal(R.amountInWords(1, 'PYG'), 'UN GUARANÍ');
  assert.equal(R.amountInWords(21000, 'ARS'), 'PESOS ARGENTINOS VEINTIÚN MIL');
  assert.equal(R.amountInWords(1100, 'CLP'), 'PESOS CHILENOS MIL CIEN');
  assert.equal(R.amountInWords(101, 'MXN'), 'PESOS MEXICANOS CIENTO UNO');
  assert.equal(R.amountInWords(21000000, 'COP'), 'PESOS COLOMBIANOS VEINTIÚN MILLONES');
  assert.equal(R.amountInWords(1000001, 'PYG'), 'GUARANÍES UN MILLÓN UNO');
  assert.equal(R.amountInWords(95.5, 'MXN'), 'PESOS MEXICANOS NOVENTA Y CINCO CON 50/100');
});

test('precios por país desde los guaraníes, redondeados', () => {
  assert.deepEqual(C.fromGuaranies(29000, 'py'), { amount: 29000, currency: 'PYG' });
  assert.deepEqual(C.fromGuaranies(29000, 'ar'), { amount: 7700, currency: 'ARS' });
  assert.deepEqual(C.fromGuaranies(29000, 'mx'), { amount: 95, currency: 'MXN' });
  assert.deepEqual(C.fromGuaranies(29000, 'co'), { amount: 16200, currency: 'COP' });
  assert.deepEqual(C.fromGuaranies(29000, 'cl'), { amount: 5000, currency: 'CLP' });
  assert.deepEqual(C.fromGuaranies(29000, 'bo'), { amount: 60, currency: 'BOB' });
  assert.deepEqual(C.fromGuaranies(250000, 'ar'), { amount: 66500, currency: 'ARS' });
  // Cotización editada por el admin
  assert.deepEqual(C.fromGuaranies(29000, 'ar', { fx_usd_ars: '1.600' }), { amount: 8100, currency: 'ARS' });
  assert.deepEqual(C.fromGuaranies(29000, 'mx', { fx_usd_mxn: '20,0' }), { amount: 100, currency: 'MXN' });
  assert.deepEqual(C.fromGuaranies(29000, 'ar', { fx_usd_ars: 'basura' }), { amount: 7700, currency: 'ARS' });
});

test('formato de moneda', () => {
  assert.equal(C.formatMoney({ amount: 250000, currency: 'PYG' }), 'Gs. 250.000');
  assert.match(C.formatMoney({ amount: 66500, currency: 'ARS' }), /^\$ 66\.500 ARS$/);
  assert.match(C.formatMoney({ amount: 60, currency: 'BOB' }), /^Bs 60$/);
});

test('total local = mensual local × meses pagados', () => {
  const t = P.localTotal('pro', 'pro', 12, 'ar', {});
  assert.deepEqual(t.local, { amount: 77000, currency: 'ARS' });
  assert.equal(t.gs, 290000);
  const e = P.localTotal('enterprise', 'empresa', 3, 'py', {});
  assert.deepEqual(e.local, { amount: 1770000, currency: 'PYG' });
  assert.deepEqual(P.requestMoney({ amount_gs: 250000, amount_local: 66500, currency: 'ARS' }), { amount: 66500, currency: 'ARS' });
  assert.deepEqual(P.requestMoney({ amount_gs: 250000 }), { amount: 250000, currency: 'PYG' });
});
