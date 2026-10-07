import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const moduleUnderTest = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/job-search.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(moduleUnderTest.exports);
const { matchesJob, matchesExternalJob } = moduleUnderTest.exports;
const filters = { query: '', city: '', industry: '', modality: '', contract: '',
  firstJobOnly: false, onlyVerified: false, withSalary: false, hideApplied: false };
const worka = { id: '1', title: 'Técnico de atención al cliente', industry: 'Servicios',
  company: { trade_name: 'Ejemplo', location_city: 'Asunción', is_verified: true },
  requires_experience: false, salary_range: 'Gs. 3.000.000', modality: 'Remoto', contract_type: 'Tiempo completo' };
const external = { ...worka, company_name: 'Ejemplo', city: 'Asunción' };

test('finds accented job titles and cities using uppercase unaccented text with spaces', () => {
  const search = { ...filters, query: '  TECNICO  ', city: 'asuncion' };
  assert.equal(matchesJob(worka, search, new Set()), true);
  assert.equal(matchesExternalJob(external, search), true);
});
test('external jobs must satisfy modality and contract; unknown values do not satisfy a requested filter', () => {
  const search = { ...filters, modality: 'Remoto', contract: 'Tiempo completo' };
  assert.equal(matchesExternalJob(external, search), true);
  assert.equal(matchesExternalJob({ ...external, modality: null }, search), false);
  assert.equal(matchesExternalJob({ ...external, contract_type: 'Medio tiempo' }, search), false);
});
test('first job and verified-only searches exclude external listings with unverified information', () => {
  assert.equal(matchesExternalJob(external, { ...filters, firstJobOnly: true }), false);
  assert.equal(matchesExternalJob(external, { ...filters, onlyVerified: true }), false);
  assert.equal(matchesJob(worka, { ...filters, firstJobOnly: true, onlyVerified: true }, new Set()), true);
});
test('hiding applications excludes applied Worka jobs and preserves other opportunities', () => {
  assert.equal(matchesJob(worka, { ...filters, hideApplied: true }, new Set(['1'])), false);
  assert.equal(matchesJob(worka, { ...filters, hideApplied: true }, new Set(['2'])), true);
});
test('empty salary text does not qualify as a visible salary', () => {
  assert.equal(matchesJob({ ...worka, salary_range: '  ' }, { ...filters, withSalary: true }, new Set()), false);
  assert.equal(matchesExternalJob({ ...external, salary_range: null }, { ...filters, withSalary: true }), false);
});
