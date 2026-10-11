// Sitemap: XML válido del protocolo, solo URLs del host canónico, sin fechas
// inventadas y partición automática al superar el límite.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const mod = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/sitemap.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const S = mod.exports;
const BASE = 'https://worka.click';
const now = new Date('2026-10-11T12:00:00Z');

test('urlset válido con namespace, escapado y lastmod solo si hay fecha real', () => {
  const xml = S.renderUrlset([
    { loc: `${BASE}/blog/a?x=1&y=2` },
    { loc: `${BASE}/empleo/j1`, lastmod: '2026-10-01T10:00:00Z' },
  ], now);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, /<loc>https:\/\/worka\.click\/blog\/a\?x=1&amp;y=2<\/loc><\/url>/);
  assert.match(xml, /<url><loc>https:\/\/worka\.click\/empleo\/j1<\/loc><lastmod>2026-10-01T10:00:00\.000Z<\/lastmod><\/url>/);
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  assert.ok(!/<lastmod><\/lastmod>/.test(xml));
});

test('fechas inválidas o futuras no se publican', () => {
  assert.equal(S.toLastmod('no-es-fecha', now), null);
  assert.equal(S.toLastmod('2030-01-01T00:00:00Z', now), null);
  assert.equal(S.toLastmod(null, now), null);
  assert.equal(S.toLastmod('2026-10-10T00:00:00Z', now), '2026-10-10T00:00:00.000Z');
});

test('solo URLs absolutas del host canónico y sin duplicados', () => {
  const urls = S.normalizeUrls([
    { loc: `${BASE}/empleos` },
    { loc: `${BASE}/empleos` },
    { loc: 'https://www.worka.click/empleos' },
    { loc: 'https://evaluar.worka.click/precios' },
    { loc: '/relativa' },
    { loc: 'javascript:alert(1)' },
  ], BASE);
  assert.deepEqual(urls.map((u) => u.loc), ['https://worka.click/empleos']);
});

test('se parte en varios sitemaps al pasar el límite', () => {
  assert.equal(S.partCount(0), 1);
  assert.equal(S.partCount(S.MAX_URLS_PER_SITEMAP), 1);
  assert.equal(S.partCount(S.MAX_URLS_PER_SITEMAP + 1), 2);
  const many = Array.from({ length: S.MAX_URLS_PER_SITEMAP + 5 }, (_, i) => ({ loc: `${BASE}/empleo/${i}` }));
  assert.equal(S.slicePart(many, 0).length, S.MAX_URLS_PER_SITEMAP);
  assert.equal(S.slicePart(many, 1).length, 5);
  const index = S.renderSitemapIndex([{ loc: `${BASE}/sitemap/0.xml` }, { loc: `${BASE}/sitemap/1.xml` }], now);
  assert.match(index, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.equal((index.match(/<sitemap>/g) ?? []).length, 2);
});

test('rutas de partes: solo /sitemap/N.xml', () => {
  assert.equal(S.parsePart('0.xml'), 0);
  assert.equal(S.parsePart('12.xml'), 12);
  assert.equal(S.parsePart('1'), null);
  assert.equal(S.parsePart('../x.xml'), null);
});

test('el sitemap no usa APIs de request ni el cliente con cookies', () => {
  const route = fs.readFileSync(fileURLToPath(new URL('../app/sitemap.xml/route.ts', import.meta.url)), 'utf8');
  const data = fs.readFileSync(fileURLToPath(new URL('../lib/sitemap-data.ts', import.meta.url)), 'utf8');
  const code = (src) => src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  for (const src of [route, data]) {
    assert.ok(!/next\/headers|cookies\(|headers\(\)|getServerClient/.test(code(src)));
  }
  assert.match(route, /export const revalidate = 3600/);
  // Sin páginas privadas ni de acceso entre las fijas.
  for (const p of ['/perfil', '/postulaciones', '/mensajes', '/admin', '/empresa"', '/ingresar', '/registro', '/guardados']) {
    assert.ok(!data.includes(`"${p.replace('"', '')}"`), `no debe incluir ${p}`);
  }
});
