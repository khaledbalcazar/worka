-- ============================================================
-- Worka — Migración 008: insignias personalizadas + textos legales
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

-- Insignias que crea el admin (además de las 5 fijas del catálogo).
-- El id (uuid) se guarda dentro de companies.badges igual que las fijas.
create table if not exists custom_badges (
  id uuid primary key default gen_random_uuid(),
  emoji text not null default '🏅',
  label text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table custom_badges enable row level security;

-- Lectura pública (se muestran en perfiles y vacantes); solo el admin las crea/borra.
drop policy if exists custom_badges_read on custom_badges;
create policy custom_badges_read on custom_badges
  for select using (true);

drop policy if exists custom_badges_admin_write on custom_badges;
create policy custom_badges_admin_write on custom_badges
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- Los textos legales (términos, privacidad) se guardan en site_settings,
-- que ya existe: keys legal_terms y legal_privacy. No requiere tabla nueva.
