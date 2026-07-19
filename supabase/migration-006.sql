-- ============================================================
-- Worka — Migración 006: arreglar notificaciones
-- Sintoma: las notificaciones NO llegaban (campanita vacía) para personas
-- ni empresas. Causa: la tabla notifications tenía políticas de SELECT y
-- UPDATE, pero NINGUNA de INSERT. Por RLS, todo intento de crear una
-- notificación para OTRA persona (empresa→candidato, admin→todos, alertas de
-- empleo, entrevistas, denuncias) se rechazaba en silencio.
--
-- Fix: permitir crear notificaciones a cualquier usuario autenticado. Leerlas
-- sigue restringido al dueño (política notifications_own ya existente), así que
-- nadie puede ver las de otro. El envío masivo del admin ya está acotado porque
-- listar perfiles requiere rol admin.
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

drop policy if exists notifications_insert on notifications;
create policy notifications_insert on notifications
  for insert with check (auth.uid() is not null);
