-- ============================================================
-- Worka — Migración 020: Alertas de empleo
--
-- El candidato guarda una búsqueda (rubro, ciudad, palabra clave…) y
-- Worka le avisa cuando entran vacantes nuevas que matchean, tanto
-- propias de Worka como externas (agregadas). Entrega in-app siempre
-- y por email si hay proveedor configurado (RESEND_API_KEY).
--
-- Un cron diario (/api/cron/alertas) recorre las alertas activas.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

create table if not exists job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  keyword text,                                 -- texto libre; matchea contra el título
  industry text,                                -- rubro; null = todos
  city text,                                     -- ciudad; null = todas
  country text not null default 'py',
  modality text,                                 -- Presencial / Híbrido / Remoto; null = todas
  email_enabled boolean not null default true,
  inapp_enabled boolean not null default true,
  active boolean not null default true,
  last_run_at timestamptz,                        -- última vez que se evaluó
  created_at timestamptz not null default now()
);

create index if not exists idx_alerts_user on job_alerts (user_id);
create index if not exists idx_alerts_active on job_alerts (active, country);

-- ── RLS ──
alter table job_alerts enable row level security;

drop policy if exists alerts_own on job_alerts;
create policy alerts_own on job_alerts
  for all using (user_id = auth.uid() or fn_current_role() = 'admin')
  with check (user_id = auth.uid() or fn_current_role() = 'admin');
