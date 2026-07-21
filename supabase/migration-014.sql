-- ============================================================
-- Worka — Migración 014: arreglar el upsert de vacantes externas
--
-- El índice único de migration-010 era PARCIAL (where external_key is
-- not null). Postgres no lo acepta como árbitro del ON CONFLICT del
-- upsert, y por eso la importación fallaba con "No pudimos guardar".
--
-- Lo reemplazamos por un índice único normal sobre (source_id,
-- external_key). Los NULL se consideran distintos entre sí, así que no
-- molesta a las vacantes cargadas a mano (sin fuente ni clave).
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

drop index if exists idx_external_unique;

create unique index if not exists idx_external_unique
  on external_jobs (source_id, external_key);
