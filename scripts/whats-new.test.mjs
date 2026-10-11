// Popup de novedades: lo que llega de site_settings se limpia (solo enlaces
// internos, íconos conocidos, largos máximos) y se puede apagar desde el admin.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const mod = { exports: {} };
const source = fs.readFileSync(fileURLToPath(new URL('../lib/whats-new.ts', import.meta.url)), 'utf8');
new Function('exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const W = mod.exports;

test('sin fila en site_settings: contenido por defecto, encendido', () => {
  for (const stored of [undefined, null, '', '   ']) {
    const c = W.activeWhatsNew(stored);
    assert.ok(c);
    assert.equal(c.version, W.DEFAULT_WHATS_NEW.version);
    assert.ok(c.items.length > 0);
  }
});

test('eliminado desde el admin: no se muestra, pero conserva el contenido', () => {
  const stored = JSON.stringify({ ...W.DEFAULT_WHATS_NEW, enabled: false });
  assert.equal(W.activeWhatsNew(stored), null);
  assert.equal(W.parseWhatsNew(stored).items.length, W.DEFAULT_WHATS_NEW.items.length);
});

test('JSON roto o sin novedades: apagado en vez de romper la página', () => {
  assert.equal(W.activeWhatsNew('{no es json'), null);
  assert.equal(W.activeWhatsNew(JSON.stringify({ enabled: true, items: [] })), null);
  assert.equal(W.activeWhatsNew(JSON.stringify({ enabled: 'true', items: [{ title: 'x' }] })), null);
});

test('solo enlaces internos', () => {
  assert.equal(W.safeHref('/cv'), '/cv');
  assert.equal(W.safeHref('/empleos?vista=mapa'), '/empleos?vista=mapa');
  for (const bad of ['//evil.com', 'https://evil.com', 'javascript:alert(1)', '/a b', '/\\evil.com', 'cv', 42, null]) {
    assert.equal(W.safeHref(bad), '', String(bad));
  }
});

test('limpia cada novedad: ícono conocido, título obligatorio, máximo y largos', () => {
  const c = W.sanitizeWhatsNew({
    enabled: true,
    title: 'x'.repeat(500),
    items: [
      { icon: '<script>', title: '  Uno  ', text: 'a', href: 'https://evil.com', cta: 'Ir' },
      { icon: 'map', title: '', text: 'sin título' },
      'basura',
      ...Array.from({ length: 12 }, (_, i) => ({ icon: 'map', title: `N${i}`, href: '/cv' })),
    ],
  });
  assert.equal(c.title.length, 120);
  assert.equal(c.items.length, W.MAX_ITEMS);
  assert.deepEqual(c.items[0], { icon: 'sparkles', title: 'Uno', text: 'a', href: '', cta: '' });
  assert.equal(c.items[1].cta, 'Ver más');
});

test('versión nueva para volver a mostrarlo y clave por versión', () => {
  assert.equal(W.nextVersion(new Date('2026-10-11T12:34:56Z')), '20261011123456');
  assert.notEqual(W.seenKey('a'), W.seenKey('b'));
});
