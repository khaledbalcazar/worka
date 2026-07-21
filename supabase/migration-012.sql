-- ============================================================
-- Worka — Migración 012: agente automático (Google Jobs vía SerpApi)
--
-- Agrega el tipo de fuente 'serpapi': una búsqueda guardada que el
-- cron ejecuta solo y trae avisos de Google Jobs (incluye LinkedIn,
-- Computrabajo, etc.) filtrados a Paraguay y a las últimas 24 horas.
--
-- En una fuente 'serpapi', el campo `url` guarda el texto de búsqueda
-- (ej: "ventas", "cajero", "administrativo"). No es una URL real.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table job_sources drop constraint if exists job_sources_kind_check;
alter table job_sources
  add constraint job_sources_kind_check
  check (kind in ('auto', 'feed', 'html', 'serpapi'));

-- Ventana de frescura en horas (por defecto 24h = "publicado hoy").
alter table job_sources
  add column if not exists max_age_hours integer not null default 24;
