-- ============================================================
-- Worka — Migración 011: fuentes automáticas y caducidad
--
-- Agrega el modo 'auto': se pega una URL y el sistema detecta solo
-- de dónde sacar los avisos (JSON-LD, feed, sitemap o heurística),
-- sin configurar selectores a mano.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

-- Permitir kind = 'auto' además de 'feed' y 'html'.
alter table job_sources drop constraint if exists job_sources_kind_check;
alter table job_sources
  add constraint job_sources_kind_check
  check (kind in ('auto', 'feed', 'html'));

alter table job_sources
  alter column kind set default 'auto';

-- Cuántos días vive un aviso importado antes de ocultarse solo.
alter table job_sources
  add column if not exists expire_days integer not null default 30;

-- Qué método terminó funcionando en la última corrida (para mostrarlo).
alter table job_sources
  add column if not exists last_method text;

-- Índice para la limpieza de vencidas.
create index if not exists idx_external_expires
  on external_jobs (expires_at)
  where expires_at is not null;
