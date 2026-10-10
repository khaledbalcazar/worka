import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const mod = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/geo.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const { cityCoords, distanceKm, estimateCommute, commuteLabel } = mod.exports;

test('finds cities ignoring accents and case, per country', () => {
  assert.deepEqual(cityCoords('asuncion', 'py'), cityCoords('Asunción', 'py'));
  assert.notDeepEqual(cityCoords('Concepción', 'py'), cityCoords('Concepción', 'cl'));
  assert.equal(cityCoords('Atlantis', 'py'), null);
});

test('distance between Asunción and San Lorenzo is about 10 km', () => {
  const d = distanceKm(cityCoords('Asunción'), cityCoords('San Lorenzo'));
  assert.ok(d > 7 && d < 13, String(d));
});

test('urban trips use the city bus, long trips the long-distance bus', () => {
  const near = estimateCommute('Asunción', 'San Lorenzo');
  assert.equal(near.mode, 'colectivo');
  assert.ok(near.minutes >= 40 && near.minutes <= 60, String(near.minutes));
  const far = estimateCommute('Asunción', 'Ciudad del Este');
  assert.equal(far.mode, 'ómnibus');
  assert.ok(far.minutes > 300, String(far.minutes));
  assert.match(commuteLabel(far), /^≈ \d+ h/);
});

test('same city and unknown cities are reported, not guessed', () => {
  assert.equal(commuteLabel(estimateCommute('Luque', 'LUQUE')), 'En tu ciudad');
  assert.equal(commuteLabel(estimateCommute('Atlantis', 'Luque')), null);
  assert.equal(commuteLabel(estimateCommute(null, 'Luque')), null);
});
