import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const mod = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/career.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const { validateExperience, validateEducation, normalizeSkills, experiencePeriod } = mod.exports;
const today = new Date('2026-10-10T12:00:00');
const exp = { role: 'Cajera', company: 'Despensa', start_month: '2024-02', end_month: '2025-12', description: '' };

test('valid experience passes; future start and reversed dates fail', () => {
  assert.equal(validateExperience(exp, today), null);
  assert.match(validateExperience({ ...exp, start_month: '2026-11' }, today), /futura/);
  assert.match(validateExperience({ ...exp, end_month: '2023-01' }, today), /anterior/);
  assert.equal(validateExperience({ ...exp, end_month: null }, today), null);
  assert.match(validateExperience({ ...exp, role: ' ' }, today), /puesto/);
});

test('education requires a known level and a sensible year', () => {
  const edu = { institution: 'Colegio', title: 'Bachiller', level: 'Secundario', end_year: 2023 };
  assert.equal(validateEducation(edu, today), null);
  assert.match(validateEducation({ ...edu, level: 'Doctorado' }, today), /nivel/);
  assert.match(validateEducation({ ...edu, end_year: 1900 }, today), /año/);
  assert.equal(validateEducation({ ...edu, end_year: null }, today), null);
});

test('skills drop blanks and accent/case duplicates and cap at 20', () => {
  assert.deepEqual(normalizeSkills([' Excel ', 'excel', 'Guaraní', 'guarani', '']), ['Excel', 'Guaraní']);
  assert.equal(normalizeSkills(Array.from({ length: 30 }, (_, i) => `s${i}`)).length, 20);
});

test('experience period reads in Spanish with its length', () => {
  assert.equal(experiencePeriod({ start_date: '2024-02-01', end_date: '2025-12-01' }), 'feb 2024 – dic 2025 · 1 año 11 meses');
  assert.match(experiencePeriod({ start_date: '2026-09-01', end_date: null }, today), /actualidad · 2 meses/);
});
