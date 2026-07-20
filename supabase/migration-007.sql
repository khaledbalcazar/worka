-- ============================================================
-- Worka — Migración 007: asegurar borrado de denuncias por el admin
-- Sintoma: al descartar una denuncia en el backoffice, "vuelve" al refrescar.
-- Causa: faltaba la política que permite al admin BORRAR filas de reports
-- (venía en migration-004; esto la reasegura de forma idempotente).
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

drop policy if exists reports_admin_delete on reports;
create policy reports_admin_delete on reports
  for delete using (fn_current_role() = 'admin');
