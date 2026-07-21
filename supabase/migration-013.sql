-- ============================================================
-- Worka — Migración 013: fuente Jooble
--
-- Agrega el tipo 'jooble': agregador de empleos con cobertura de
-- Paraguay. En una fuente 'jooble', el campo `url` guarda el texto de
-- búsqueda (ej: "ventas"). Vacío = trae todo Paraguay.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table job_sources drop constraint if exists job_sources_kind_check;
alter table job_sources
  add constraint job_sources_kind_check
  check (kind in ('auto', 'feed', 'html', 'serpapi', 'jooble'));
