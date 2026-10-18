// Importa un paquete de cursos de la Academia escrito en Markdown.
//
//   node scripts/academia-import.mjs <archivo.md> [--sin-verificar]
//
// Lee los bloques ```yaml curso / leccion / quiz / practica / proyecto_final,
// verifica cada video de YouTube contra oEmbed (los que no responden 200 no
// se publican y se listan como caídos) y genera:
//
//   - supabase/migration-052.sql        → los cursos y lecciones, idempotente
//   - lib/academia/cursos-2026-10.json  → los mismos datos para el modo demo
//
// El contenido vive en la base como el de los cursos anteriores, así se
// sigue pudiendo publicar, ordenar o despublicar desde el backoffice.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2];
const skipCheck = process.argv.includes("--sin-verificar");
if (!file) {
  console.error("Uso: node scripts/academia-import.mjs <archivo.md> [--sin-verificar]");
  process.exit(1);
}
const md = readFileSync(file, "utf8").replace(/\r\n/g, "\n");

// ── Parseo ──────────────────────────────────────────────────────────────

function block(text, tag) {
  const re = new RegExp("```yaml " + tag + "\\n([\\s\\S]*?)\\n```");
  const m = text.match(re);
  return m ? yaml.load(m[1]) : null;
}

// Texto entre «#### <titulo>» y el próximo encabezado #### o bloque de código.
function section(text, title) {
  const start = text.indexOf(`#### ${title}\n`);
  if (start < 0) return "";
  const rest = text.slice(start + title.length + 6);
  const end = rest.search(/\n#### |\n```yaml /);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

const minutes = (v) => parseInt(String(v ?? "").replace(/\D/g, ""), 10) || 5;
const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d) : null);

const REPORT_PLACEHOLDER = /^> \*\*\[Componente: enlace "Reportar un aviso sospechoso en Worka".*$/m;

const courseChunks = md.split(/\n## CURSO \d+ — /).slice(1);
const courses = courseChunks.map((chunk) => {
  // El anexo final no es parte del curso.
  chunk = chunk.split(/\n## Anexo/)[0];
  const meta = block(chunk, "curso");
  const lessonChunks = chunk.split(/\n### Lección \d+\.\d+ — /).slice(1);
  const lessons = lessonChunks.map((lc, i) => {
    const title = lc.split("\n")[0].trim();
    const lmeta = block(lc, "leccion") ?? {};
    // La lección termina donde empieza el proyecto final.
    const body = lc.split(/\n### Proyecto final/)[0];
    const reading = section(body, "Lectura").replace(REPORT_PLACEHOLDER, "[[reportar-aviso]]");
    const keyPoints = section(body, "Para recordar")
      .split("\n")
      .filter((l) => l.startsWith("- "))
      .map((l) => l.slice(2).trim());
    const quiz = (block(body, "quiz") ?? []).map((q) => ({
      q: q.pregunta,
      options: q.opciones.map(String),
      answer: q.correcta,
      explanation: q.explicacion ?? null,
    }));
    const p = block(body, "practica");
    return {
      slug: lmeta.slug,
      title,
      section: "Lecciones",
      duration_min: minutes(lmeta.duracion),
      sort: i + 1,
      content: reading,
      key_points: keyPoints,
      videos: (lmeta.videos ?? []).map((v) => ({
        youtube_id: v.youtube_id,
        title: v.titulo,
        channel: v.canal,
        why: v.por_que_verlo,
      })),
      resources: (lmeta.recursos ?? []).map((r) => ({ title: r.titulo, url: r.url })),
      review_before: iso(lmeta.revisar_antes),
      quiz,
      practice: p
        ? { title: p.titulo, type: p.tipo === "checklist" ? "checklist" : "texto", prompt: p.consigna, checklist: p.checklist ?? [] }
        : null,
    };
  });
  const fp = block(chunk, "proyecto_final");
  return {
    slug: meta.slug,
    title: meta.titulo,
    description: meta.descripcion_corta,
    category: meta.categoria,
    level: meta.nivel,
    sort: meta.orden,
    duration_label: meta.duracion_estimada ?? null,
    meta_title: meta.meta_title ?? null,
    meta_description: meta.meta_description ?? null,
    outcomes: meta.aprendizajes ?? [],
    suggested_course: meta.requisito_sugerido ?? null,
    legal_notice: meta.aviso_legal ?? null,
    review_before: iso(meta.revisar_antes),
    cert_min_quiz: meta.certificado?.nota_minima_quiz ?? null,
    cert_requires_project: !!meta.certificado?.requiere_proyecto_final,
    final_project: fp
      ? { title: fp.titulo, prompt: fp.consigna, suggested_questions: fp.preguntas_sugeridas ?? [], checklist: fp.checklist ?? [] }
      : null,
    lessons,
  };
});

// ── Verificación de videos ──────────────────────────────────────────────

const caidos = [];
if (!skipCheck) {
  for (const c of courses) {
    for (const l of c.lessons) {
      const ok = [];
      for (const v of l.videos) {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.youtube_id}&format=json`;
        let status = 0;
        try {
          status = (await fetch(url)).status;
        } catch {
          status = -1;
        }
        if (status === 200) ok.push(v);
        else caidos.push({ curso: c.slug, leccion: l.slug, id: v.youtube_id, titulo: v.title, status });
      }
      l.videos = ok;
    }
  }
}

// ── Salida ──────────────────────────────────────────────────────────────

const json = JSON.stringify({ generado: new Date().toISOString().slice(0, 10), videos_caidos: caidos, courses }, null, 2);
mkdirSync(resolve(root, "lib/academia"), { recursive: true });
writeFileSync(resolve(root, "lib/academia/cursos-2026-10.json"), json + "\n");

const q = (v) => {
  if (v === null || v === undefined) return "null";
  const s = String(v);
  if (s.includes("$wk$")) throw new Error("El texto contiene $wk$");
  return `$wk$${s}$wk$`;
};
const j = (v) => `${q(JSON.stringify(v))}::jsonb`;

let sql = `-- ============================================================
-- Worka — Migración 052: Academia, paquete de cursos de octubre 2026
--
-- Generada por scripts/academia-import.mjs a partir del archivo de cursos.
-- No editar a mano: corregí el .md y volvé a generar.
-- Requiere la migración 051. Idempotente: se puede correr de nuevo para
-- actualizar el texto sin perder el avance de nadie.
-- ============================================================
`;
for (const c of courses) {
  sql += `
-- ── ${c.title} ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values (${q(c.slug)}, ${q(c.title)}, ${q(c.description)}, ${q(c.category)}, ${q(c.level)}, 'publicado', ${c.sort}, ${q(c.duration_label)}, ${q(c.meta_title)}, ${q(c.meta_description)}, ${j(c.outcomes)}, ${q(c.suggested_course)}, ${q(c.legal_notice)}, ${c.review_before ? `${q(c.review_before)}::date` : "null"}, ${c.cert_min_quiz ?? "null"}, ${c.cert_requires_project}, ${c.final_project ? j(c.final_project) : "null"}, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();
`;
  for (const l of c.lessons) {
    sql += `
insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, ${q(l.slug)}, ${q(l.section)}, ${q(l.title)}, ${q(l.content)}, ${l.duration_min}, ${l.sort}, ${j(l.quiz)}, ${j(l.key_points)}, ${j(l.videos)}, ${j(l.resources)}, ${l.practice ? j(l.practice) : "null"}, ${l.review_before ? `${q(l.review_before)}::date` : "null"}
from courses where slug = ${q(c.slug)}
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;
`;
  }
}
writeFileSync(resolve(root, "supabase/migration-052.sql"), sql);

const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
const totalVideos = courses.reduce((s, c) => s + c.lessons.reduce((t, l) => t + l.videos.length, 0), 0);
console.log(`${courses.length} cursos · ${totalLessons} lecciones · ${totalVideos} videos verificados`);
if (caidos.length) {
  console.log("Videos caídos (no se publican):");
  for (const v of caidos) console.log(`  ${v.id} (HTTP ${v.status}) · ${v.curso} / ${v.leccion} · ${v.titulo}`);
}
