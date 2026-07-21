-- ============================================================
-- Worka — Migración 010: vacantes externas (agregador)
--
-- Permite llenar el feed con avisos que no vienen de empresas
-- registradas en Worka: importados de feeds XML/RSS, extraídos de
-- una fuente con permiso, o cargados a mano desde el admin.
--
-- Se mantienen en tablas aparte de `jobs`/`companies` a propósito:
-- así no tocan el flujo real (kanban, postulaciones, mensajería) y
-- se pueden apagar por completo con un solo interruptor.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

-- ── Fuentes configurables desde el admin ──
create table if not exists job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,                       -- "Bolsa X", "Web de la empresa Y"
  kind text not null default 'feed'
    check (kind in ('feed', 'html')),       -- feed = RSS/Atom/XML; html = extractor
  url text not null,
  enabled boolean not null default true,

  -- Solo para kind = 'html': selectores CSS que dicen dónde mirar.
  sel_item text,        -- contenedor de cada aviso
  sel_title text,
  sel_company text,
  sel_city text,
  sel_link text,
  sel_description text,

  -- Datos por defecto si la fuente no los trae
  default_city text,
  default_industry text,

  -- Trazabilidad de la última corrida
  last_run_at timestamptz,
  last_result text,
  last_count integer not null default 0,

  created_at timestamptz not null default now()
);

-- ── Vacantes externas ──
create table if not exists external_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references job_sources (id) on delete set null,

  -- Identificador estable en la fuente, para no duplicar al reimportar.
  external_key text,

  title text not null,
  company_name text not null,
  company_logo_url text,
  description text not null default '',
  industry text,
  city text,
  modality text,
  contract_type text,
  salary_range text,

  -- Cómo postularse. Se revela solo a usuarios registrados.
  apply_email text,
  apply_url text,

  -- Atribución: siempre enlazamos de vuelta al aviso original.
  source_name text not null default 'Fuente externa',
  source_url text,

  status text not null default 'activa'
    check (status in ('activa', 'oculta')),
  imported_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Evita duplicados al reimportar la misma fuente.
create unique index if not exists idx_external_unique
  on external_jobs (source_id, external_key)
  where external_key is not null;

create index if not exists idx_external_status
  on external_jobs (status, imported_at desc);

-- ── RLS ──
alter table job_sources enable row level security;
alter table external_jobs enable row level security;

-- Las fuentes son solo del admin (contienen URLs y selectores internos).
drop policy if exists sources_admin on job_sources;
create policy sources_admin on job_sources
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- Las vacantes activas las ve cualquiera; el admin gestiona todo.
-- OJO: apply_email queda expuesto a nivel tabla; el filtrado por
-- sesión se hace en el servidor (lib/data.ts) antes de mandar al cliente.
drop policy if exists external_public_read on external_jobs;
create policy external_public_read on external_jobs
  for select using (status = 'activa' or fn_current_role() = 'admin');

drop policy if exists external_admin_write on external_jobs;
create policy external_admin_write on external_jobs
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- ── Interruptor general (apagado por defecto) ──
insert into site_settings (key, value)
values ('external_jobs_enabled', '')
on conflict (key) do nothing;
