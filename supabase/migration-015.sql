-- ============================================================
-- Worka — Migración 015: multi-país (Etapa 1)
--
-- Agrega el país a las vacantes externas y a las fuentes, para
-- extender Worka a Argentina, México, Colombia, Chile y Bolivia
-- además de Paraguay. Todo lo existente queda como 'py'.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table external_jobs
  add column if not exists country text not null default 'py';

alter table job_sources
  add column if not exists country text not null default 'py';

create index if not exists idx_external_country
  on external_jobs (country, status, imported_at desc);
