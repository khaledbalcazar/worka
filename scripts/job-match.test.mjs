import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const mod = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/job-match.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const { jobMatch } = mod.exports;

const candidate = { location_city: 'Asunción', open_to_other_cities: false, preferences_modality: 'Presencial',
  preferences_industry: ['Ventas'], first_job_mode: true, cv_url: 'cv.pdf' };
const job = { modality: 'Presencial', industry: 'ventas', requires_experience: false,
  company: { location_city: 'ASUNCION' } };

test('full match ignores accents and case', () => {
  const r = jobMatch(candidate, job);
  assert.equal(r.percent, 100);
  assert.equal(r.level, 'Muy compatible');
});

test('other city counts as met only when the candidate accepts other cities', () => {
  const away = { ...job, company: { location_city: 'Encarnación' } };
  assert.equal(jobMatch(candidate, away).items.find((i) => i.key === 'ubicacion').status, 'unmet');
  assert.equal(jobMatch({ ...candidate, open_to_other_cities: true }, away).items.find((i) => i.key === 'ubicacion').status, 'met');
});

test('remote jobs match any city and "Cualquiera" matches any modality', () => {
  const r = jobMatch({ ...candidate, location_city: 'Luque', preferences_modality: 'Cualquiera' }, { ...job, modality: 'Remoto' });
  assert.equal(r.items.find((i) => i.key === 'ubicacion').status, 'met');
  assert.equal(r.items.find((i) => i.key === 'modalidad').status, 'met');
});

test('unknown items do not count toward the percentage', () => {
  const r = jobMatch({ ...candidate, preferences_industry: [], first_job_mode: false }, { ...job, requires_experience: true });
  assert.equal(r.total, 3);
  assert.equal(r.percent, 100);
});

test('first-job candidates do not match jobs that require experience', () => {
  const r = jobMatch({ ...candidate, cv_url: null }, { ...job, requires_experience: true });
  assert.equal(r.items.find((i) => i.key === 'experiencia').status, 'unmet');
  assert.equal(r.percent, 60);
});

test('loaded experience satisfies jobs that require it', () => {
  const r = jobMatch({ ...candidate, experience_count: 2 }, { ...job, requires_experience: true });
  const item = r.items.find((i) => i.key === 'experiencia');
  assert.equal(item.status, 'met');
  assert.match(item.text, /2 trabajos/);
});

test('skills written in the requirements add a met item; missing ones add nothing', () => {
  const withReq = { ...job, requirements: ['Manejo de CAJA registradora', 'Secundario completo'] };
  const r = jobMatch({ ...candidate, skills: ['Manejo de caja', 'Inglés'] }, withReq);
  assert.equal(r.items.find((i) => i.key === 'habilidades').status, 'met');
  const none = jobMatch({ ...candidate, skills: ['Inglés'] }, withReq);
  assert.equal(none.items.find((i) => i.key === 'habilidades'), undefined);
});
