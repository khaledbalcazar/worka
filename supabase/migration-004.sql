-- ============================================================
-- Worka — Migración 004: preguntas eliminatorias + bandeja de denuncias
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

-- Preguntas eliminatorias (knockout): si el candidato responde "No",
-- la postulación se marca automáticamente como no apta.
alter table job_questions add column if not exists knockout boolean not null default false;

-- Bandeja de denuncias: el admin puede descartar denuncias.
drop policy if exists reports_admin_delete on reports;
create policy reports_admin_delete on reports
  for delete using (fn_current_role() = 'admin');
