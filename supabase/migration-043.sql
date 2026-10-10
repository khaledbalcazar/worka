-- ============================================================
-- Worka — Migración 043: postulaciones y denuncias de avisos externos
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- Las vacantes de otros portales (external_jobs, migración 010) se postulan
-- fuera de Worka: por correo o en el aviso original. Hasta ahora la persona
-- salía de Worka y no le quedaba ningún registro: no aparecían en Mis
-- postulaciones y no había forma de anotar si la empresa respondió.
--
-- 1. external_applications: el candidato marca "ya me postulé" y lleva el
--    estado a mano (la empresa no está en Worka para actualizarlo).
-- 2. external_job_reports: denunciar un aviso externo sospechoso. Con 3
--    denuncias válidas el aviso se oculta solo, la misma regla que las
--    vacantes de Worka (schema.sql, fn_auto_moderate_job).

-- ── Postulaciones externas ──
create table if not exists external_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  external_job_id uuid references external_jobs (id) on delete set null,
  -- Copia de los datos del aviso: la postulación tiene que seguir legible
  -- aunque el aviso se oculte o se borre al reimportar.
  job_title text not null,
  company_name text not null,
  source_name text not null,
  method text not null check (method in ('email', 'enlace')),
  status text not null default 'enviada'
    check (status in ('enviada', 'me_contactaron', 'entrevista', 'descartada')),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, external_job_id)
);

create index if not exists idx_external_applications_candidate
  on external_applications (candidate_id, applied_at desc);

alter table external_applications enable row level security;

-- Solo la dueña: ni empresas ni otros candidatos ven estas filas.
drop policy if exists external_applications_own on external_applications;
create policy external_applications_own on external_applications
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

-- ── Denuncias de avisos externos ──
create table if not exists external_job_reports (
  id uuid primary key default gen_random_uuid(),
  external_job_id uuid not null references external_jobs (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 200),
  created_at timestamptz not null default now(),
  unique (external_job_id, reporter_id)
);

alter table external_job_reports enable row level security;

drop policy if exists external_reports_insert on external_job_reports;
create policy external_reports_insert on external_job_reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists external_reports_admin on external_job_reports;
create policy external_reports_admin on external_job_reports
  for select using (fn_current_role() = 'admin');

-- Misma regla que las vacantes de Worka: cuentan las denuncias de cuentas
-- con 7+ días o con alguna postulación, para frenar denuncias coordinadas.
create or replace function fn_auto_moderate_external_job()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  valid_reports integer;
begin
  select count(*) into valid_reports
  from external_job_reports r
  join candidates c on c.id = r.reporter_id
  where r.external_job_id = new.external_job_id
    and (
      c.created_at < now() - interval '7 days'
      or exists (select 1 from applications a where a.candidate_id = c.id)
      or exists (select 1 from external_applications e where e.candidate_id = c.id)
    );

  if valid_reports >= 3 then
    update external_jobs set status = 'oculta'
    where id = new.external_job_id and status = 'activa';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auto_moderate_external on external_job_reports;
create trigger trg_auto_moderate_external
after insert on external_job_reports
for each row execute function fn_auto_moderate_external_job();
