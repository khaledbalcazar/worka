// Generador de CV: borrador inicial desde el perfil, fechas legibles y
// limpieza de lo que vuelve del navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
function load(path) {
  const mod = { exports: {} };
  const source = fs.readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
  new Function('exports', ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText)(mod.exports);
  return mod.exports;
}
const C = load('../lib/cv.ts');
const V = load('../lib/job-visibility.ts');

const candidate = {
  id: 'c1', full_name: 'Ana Pérez', phone_whatsapp: '+595 981 000 000', location_city: 'Luque',
  avatar_url: null, bio: null, first_job_mode: true, preferences_industry: ['Ventas', 'Gastronomía', 'Logística'],
};
const career = {
  experience: [{ role: 'Cajera', company: 'Real', start_date: '2022-03-01', end_date: null, description: 'Caja' }],
  education: [{ title: 'Bachiller', institution: 'CN', end_year: null, level: 'Secundario' }],
  skills: ['Puntualidad'],
  courses: [{ title: 'Entrevistas', completed_at: '2026-05-02T00:00:00Z' }],
};

test('el borrador sale del perfil', () => {
  const cv = C.cvFromProfile(candidate, career, 'ana@example.com');
  assert.equal(cv.name, 'Ana Pérez');
  assert.equal(cv.email, 'ana@example.com');
  assert.equal(cv.headline, 'Ventas · Gastronomía');
  assert.equal(cv.showPhoto, false);
  assert.match(cv.summary, /primera oportunidad/);
  assert.deepEqual(cv.experience[0], { role: 'Cajera', company: 'Real', city: '', start: '2022-03', end: '', current: true, description: 'Caja', highlights: '' });
  assert.equal(cv.education[0].current, true);
  assert.deepEqual(cv.courses[0], { name: 'Entrevistas', issuer: 'Worka Academia', year: '2026' });
});

test('fechas y viñetas', () => {
  assert.equal(C.formatMonth('2024-03'), 'mar. 2024');
  assert.equal(C.formatPeriod('2022-03', '', true), 'mar. 2022 – Actualidad');
  assert.equal(C.formatPeriod('2019', '2021', false), '2019 – 2021');
  assert.equal(C.formatPeriod('', '', false), '');
  assert.deepEqual(C.bullets('- uno\n\n• dos\n  tres  '), ['uno', 'dos', 'tres']);
});

test('lo guardado se limpia: versión, plantilla, color, niveles y largos', () => {
  const fallback = C.cvFromProfile(candidate, career, null);
  assert.equal(C.sanitizeCv('basura', fallback), fallback);
  assert.equal(C.sanitizeCv({ version: 2 }, fallback), fallback);
  const cv = C.sanitizeCv({
    version: 1, template: 'inexistente', accent: 'red;background:url(x)', name: '',
    summary: 'x'.repeat(5000),
    tools: [{ name: 'Excel', level: 99 }, { name: 'Word', level: 'abc' }],
    experience: Array.from({ length: 40 }, () => ({ role: 'R' })),
    skills: ['a', 3, null],
  }, fallback);
  assert.equal(cv.template, 'clasico');
  assert.match(cv.accent, /^#[0-9a-f]{6}$/i);
  assert.equal(cv.name, 'Ana Pérez');
  assert.equal(cv.summary.length, 1200);
  assert.deepEqual(cv.tools.map((t) => t.level), [5, 3]);
  assert.equal(cv.experience.length, 15);
  assert.deepEqual(cv.skills, ['a']);
});

test('checklist de completitud', () => {
  const cv = C.cvFromProfile(candidate, career, null);
  const done = Object.fromEntries(C.cvChecklist(cv).map((c) => [c.label, c.done]));
  assert.equal(done['Nombre y contacto'], true);
  assert.equal(done['Experiencia o estudios'], true);
  assert.equal(done['Habilidades'], false);
});

test('vacante vencida: sigue Activo pero no se publica', () => {
  const now = Date.parse('2026-10-11T12:00:00Z');
  assert.equal(V.isJobExpired('2026-10-01T00:00:00Z', now), true);
  assert.equal(V.isJobExpired('2026-11-01T00:00:00Z', now), false);
  assert.equal(V.isJobExpired(null, now), false);
  assert.equal(V.isJobListed({ status: 'Activo', expires_at: '2026-10-01T00:00:00Z' }, now), false);
  assert.equal(V.isJobListed({ status: 'Activo', expires_at: '2026-11-01T00:00:00Z' }, now), true);
  assert.equal(V.isJobListed({ status: 'Pausado', expires_at: '2026-11-01T00:00:00Z' }, now), false);
  assert.equal(V.renewalDate(30, now), '2026-11-10T12:00:00.000Z');
});

test('destaque pago vigente', () => {
  const now = Date.parse('2026-10-11T12:00:00Z');
  assert.equal(V.isJobFeatured({ featured: true, featured_until: '2026-10-20T00:00:00Z' }, now), true);
  assert.equal(V.isJobFeatured({ featured: true, featured_until: '2026-10-01T00:00:00Z' }, now), false);
  assert.equal(V.isJobFeatured({ featured: true, featured_until: null }, now), true);
  assert.equal(V.isJobFeatured({ featured: false, featured_until: '2026-10-20T00:00:00Z' }, now), false);
});
