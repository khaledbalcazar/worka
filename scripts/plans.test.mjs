// Planes (Worka Enterprise Pro / Worka Pro), avisos de vencimiento,
// alertas al instante y videos de marca empleadora.
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
const P = load('../lib/plans.ts');
const E = load('../lib/expiry-notices.ts');
const A = load('../lib/alert-match.ts');
const V = load('../lib/video.ts');

test('límites de cada plan de empresa', () => {
  assert.equal(P.enterpriseLimits('gratis').maxListedJobs, 3);
  assert.equal(P.enterpriseLimits('gratis').talentSearch, false);
  assert.equal(P.enterpriseLimits('pro').maxListedJobs, null);
  assert.equal(P.enterpriseLimits('pro').jobValidityDays, 60);
  assert.equal(P.enterpriseLimits('pro').team, false);
  assert.equal(P.enterpriseLimits('empresa').team, true);
  assert.equal(P.enterpriseLimits('empresa').brandedPage, true);
  // Cualquier cosa desconocida cae en Gratis.
  assert.equal(P.enterprisePlan('inventado').id, 'gratis');
  assert.equal(P.enterprisePlan(null).id, 'gratis');
});

test('precios: admin, defecto y anual a 10 meses', () => {
  assert.equal(P.monthlyPrice('enterprise', 'pro', {}), 250000);
  assert.equal(P.monthlyPrice('enterprise', 'pro', { price_enterprise_pro: 'Gs. 300.000' }), 300000);
  assert.equal(P.monthlyPrice('enterprise', 'pro', { price_enterprise_pro: 'abc' }), 250000);
  assert.equal(P.monthlyPrice('pro', 'pro', {}), 29000);
  assert.equal(P.totalPrice('pro', 'pro', 12, {}), 290000);
  assert.equal(P.totalPrice('enterprise', 'empresa', 3, {}), 590000 * 3);
  assert.equal(P.totalPrice('enterprise', 'gratis', 1, {}), 0);
  assert.equal(P.totalPrice('pro', 'pro', 7, {}), 0);
});

test('link de pago: propio, general o ninguno; solo http(s)', () => {
  assert.equal(P.paymentLink('pro', { payment_link_pro: 'https://pago/pro', payment_link: 'https://pago' }), 'https://pago/pro');
  assert.equal(P.paymentLink('pro', { payment_link: 'https://pago' }), 'https://pago');
  assert.equal(P.paymentLink('enterprise', { payment_link_enterprise: 'javascript:alert(1)' }), null);
  assert.equal(P.paymentLink('enterprise', {}), null);
});

test('renovar antes de vencer suma días; vencido arranca hoy', () => {
  const now = new Date('2026-10-12T12:00:00Z');
  assert.equal(P.extendedEnd('2026-11-01T00:00:00Z', 1, now), '2026-12-01T00:00:00.000Z');
  assert.equal(P.extendedEnd('2026-09-01T00:00:00Z', 1, now), '2026-11-12T12:00:00.000Z');
  assert.equal(P.extendedEnd(null, 12, now), '2027-10-12T12:00:00.000Z');
  assert.equal(P.daysLeft('2026-10-15T12:00:00Z', now.getTime()), 3);
});

test('avisos de vencimiento: uno por empresa con todas sus vacantes', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const soon = [
    { id: 'j1', title: 'Cajero', company_id: 'c1', expires_at: '2026-10-13T12:00:00Z' },
    { id: 'j2', title: 'Mozo', company_id: 'c2', expires_at: '2026-10-15T12:00:00Z' },
  ];
  const expired = [{ id: 'j3', title: 'Chofer', company_id: 'c1', expires_at: '2026-10-01T12:00:00Z' }];
  const groups = E.groupExpiryNotices(soon, expired, now);
  assert.equal(groups.length, 2);
  const c1 = groups.find((g) => g.companyId === 'c1');
  assert.deepEqual(c1.soonIds, ['j1']);
  assert.deepEqual(c1.expiredIds, ['j3']);
  assert.match(c1.title, /2 vacantes/);
  assert.match(c1.detail, /Chofer — venció/);
  assert.match(c1.detail, /Cajero — vence mañana/);
  const c2 = groups.find((g) => g.companyId === 'c2');
  assert.match(c2.title, /«Mozo» vence pronto/);
  assert.match(c2.detail, /en 3 días/);
});

test('alerta coincide por país, rubro, modalidad, palabra y ciudad (sin tildes)', () => {
  const job = { title: 'Cajera de Supermercado', industry: 'Ventas', modality: 'Presencial', address: 'Av. España', companyCountry: 'py', companyCity: 'Asunción' };
  const base = { keyword: null, industry: null, city: null, country: 'py', modality: null };
  assert.equal(A.alertMatchesJob(base, job), true);
  assert.equal(A.alertMatchesJob({ ...base, country: 'ar' }, job), false);
  assert.equal(A.alertMatchesJob({ ...base, keyword: 'cajera' }, job), true);
  assert.equal(A.alertMatchesJob({ ...base, keyword: 'chofer' }, job), false);
  assert.equal(A.alertMatchesJob({ ...base, city: 'asuncion' }, job), true);
  assert.equal(A.alertMatchesJob({ ...base, city: 'Luque' }, job), false);
  assert.equal(A.alertMatchesJob({ ...base, industry: 'ventas', modality: 'presencial' }, job), true);
  assert.equal(A.alertMatchesJob({ ...base, modality: 'Remoto' }, job), false);
});

test('video de marca: solo YouTube y Vimeo por https', () => {
  assert.equal(V.videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(V.videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(V.videoEmbedUrl('https://vimeo.com/123456'), 'https://player.vimeo.com/video/123456');
  assert.equal(V.videoEmbedUrl('http://youtube.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(V.videoEmbedUrl('https://evil.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(V.videoEmbedUrl('javascript:alert(1)'), null);
  assert.equal(V.videoEmbedUrl(null), null);
});
