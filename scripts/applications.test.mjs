// Regresión del incidente en Mis postulaciones y Mensajes:
// "TypeError: Cannot read properties of null (reading 'filter_questions')".
// Una postulación a una vacante no activa llega con job = null (la RLS de
// jobs solo deja ver las Activas) y eso tiraba abajo la página entera.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

function load(file) {
  const mod = { exports: {} };
  const source = fs.readFileSync(fileURLToPath(new URL(`../lib/${file}`, import.meta.url)), 'utf8');
  new Function('exports', 'require', ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText)(mod.exports, () => ({}));
  return mod.exports;
}
const { mapJob } = load('job-mapper.ts');
const { buildApplicationViews, unavailableLabel } = load('applications.ts');

const company = { id: 'c1', trade_name: 'Super Guaraní', company_name: 'Supermercados Guaraní S.A.', logo_url: null, location_city: 'Asunción' };
const activeJob = {
  id: 'j1', title: 'Cajero/a', status: 'Activo', company,
  filter_questions: [
    { id: 'q2', question: '¿Tenés experiencia en caja?', knockout: true, position: 2 },
    { id: 'q1', question: '¿Vivís en Asunción?', knockout: null, position: 1 },
  ],
};
const app = (id, jobId, job) => ({ id, job_id: jobId, candidate_id: 'cand1', status: 'Pendiente', rejection_reason: null, applied_at: '2026-10-01T10:00:00Z', reviewed_at: null, job });
const closedSummary = { job_id: 'j2', title: 'Repositor/a', status: 'Cerrado', company_id: 'c1', company_name: 'Super Guaraní', company_logo_url: null, company_city: 'Asunción' };

test('reproduce el error original: mapear la vacante sin resolver el null', () => {
  const rows = [app('a1', 'j1', activeJob), app('a2', 'j2', null)];
  assert.throws(() => rows.map((r) => mapJob(r.job)), /Cannot read properties of null \(reading 'filter_questions'\)/);
});

test('una postulación a una vacante cerrada no tira abajo las demás', () => {
  const rows = [app('a1', 'j1', activeJob), app('a2', 'j2', null), app('a3', 'j3', activeJob)];
  const { views, issues } = buildApplicationViews(rows, [closedSummary], mapJob);
  assert.equal(views.length, 3);
  assert.deepEqual(views.map((v) => v.id), ['a1', 'a2', 'a3']);
  const closed = views[1];
  assert.equal(closed.job, null);
  assert.equal(closed.summary.title, 'Repositor/a');
  assert.equal(closed.summary.status, 'Cerrado');
  assert.equal(closed.summary.available, false);
  assert.equal(issues.length, 0, 'una vacante cerrada con resumen es un estado normal, no un error');
});

test('las preguntas de filtro de las vacantes visibles se conservan y ordenan', () => {
  const { views } = buildApplicationViews([app('a1', 'j1', activeJob)], [], mapJob);
  const q = views[0].job.filter_questions;
  assert.deepEqual(q.map((x) => x.id), ['q1', 'q2']);
  assert.equal(q[0].knockout, false);
  assert.equal(q[1].knockout, true);
  assert.equal(views[0].summary.available, true);
  assert.equal(views[0].summary.company_name, 'Super Guaraní');
});

test('pausada y en moderación también se listan, sin enlace al aviso', () => {
  const rows = [app('a1', 'j4', null), app('a2', 'j5', null)];
  const summaries = [
    { ...closedSummary, job_id: 'j4', status: 'Pausado' },
    { ...closedSummary, job_id: 'j5', status: 'Moderacion' },
  ];
  const { views } = buildApplicationViews(rows, summaries, mapJob);
  assert.deepEqual(views.map((v) => unavailableLabel(v.summary.status)), ['Vacante pausada', 'Vacante en revisión']);
  assert.ok(views.every((v) => v.summary.available === false && v.job === null));
});

test('sin vacante ni resumen: se lista igual y se reporta como dato faltante', () => {
  const { views, issues } = buildApplicationViews([app('a9', 'j9', null)], [], mapJob);
  assert.equal(views.length, 1);
  assert.equal(views[0].summary.title, 'Vacante no disponible');
  assert.deepEqual(issues, [{ applicationId: 'a9', jobId: 'j9', reason: 'job_missing' }]);
});

test('vacante sin empresa: no rompe y se reporta como problema de datos', () => {
  const orphan = { ...activeJob, id: 'j6', company: null };
  const { views, issues } = buildApplicationViews([app('a6', 'j6', orphan)], [], mapJob);
  assert.equal(views.length, 1);
  assert.equal(views[0].job, null);
  assert.equal(views[0].summary.title, 'Cajero/a');
  assert.deepEqual(issues.map((i) => i.reason), ['company_missing']);
});

test('la consulta del candidato no pide la nota privada del reclutador', () => {
  const src = fs.readFileSync(fileURLToPath(new URL('../lib/data.ts', import.meta.url)), 'utf8');
  const cols = src.match(/MY_APPLICATION_COLUMNS =\s*"([^"]+)"/);
  assert.ok(cols, 'MY_APPLICATION_COLUMNS tiene que existir');
  assert.ok(!cols[1].includes('internal_note'));
  assert.ok(!cols[1].includes('*'));
  const fn = src.slice(src.indexOf('export async function getMyApplications'), src.indexOf('export async function getMyAppliedJobIds'));
  assert.match(fn, /\.select\(`\$\{MY_APPLICATION_COLUMNS\}, job:jobs/);
  assert.match(fn, /\.eq\("candidate_id", user\.id\)/, 'solo las postulaciones de quien consulta');
});
