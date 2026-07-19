-- ============================================================
-- Worka — Migración 005: equipo de reclutadores + test de perfil
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

-- 1) Equipo: varios reclutadores por empresa.
-- El dueño invita por email; cuando esa persona inicia sesión, reclama su
-- lugar (member_id) y accede al panel de la empresa.
create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  email text not null,
  member_id uuid references profiles (id) on delete cascade,
  status text not null default 'invitada'
    check (status in ('invitada', 'activa')),
  created_at timestamptz not null default now(),
  unique (company_id, email)
);

alter table company_members enable row level security;

drop policy if exists company_members_owner on company_members;
create policy company_members_owner on company_members
  for all using (company_id = auth.uid() or fn_current_role() = 'admin')
  with check (company_id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists company_members_self_read on company_members;
create policy company_members_self_read on company_members
  for select using (
    member_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

-- El invitado reclama su fila al ingresar (match por email del token)
drop policy if exists company_members_claim on company_members;
create policy company_members_claim on company_members
  for update using (
    lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
  with check (member_id = auth.uid());

-- Helper: ¿el usuario actual es miembro activo del equipo de esta empresa?
create or replace function public.fn_is_company_member(comp uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from company_members m
    where m.company_id = comp
      and m.member_id = auth.uid()
      and m.status = 'activa'
  );
$$;

-- 2) Políticas extendidas: los miembros operan como la empresa.
drop policy if exists jobs_public_read on jobs;
create policy jobs_public_read on jobs
  for select using (
    status = 'Activo'
    or company_id = auth.uid()
    or fn_is_company_member(company_id)
    or fn_current_role() = 'admin'
  );

drop policy if exists jobs_company_write on jobs;
create policy jobs_company_write on jobs
  for insert with check (
    company_id = auth.uid() or fn_is_company_member(company_id)
  );

drop policy if exists jobs_company_update on jobs;
create policy jobs_company_update on jobs
  for update using (
    company_id = auth.uid()
    or fn_is_company_member(company_id)
    or fn_current_role() = 'admin'
  );

drop policy if exists job_questions_write on job_questions;
create policy job_questions_write on job_questions
  for all using (
    exists (
      select 1 from jobs j
      where j.id = job_id
        and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
    )
  );

drop policy if exists applications_company on applications;
create policy applications_company on applications
  for select using (
    exists (
      select 1 from jobs j
      where j.id = job_id
        and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
    )
  );

drop policy if exists applications_company_update on applications;
create policy applications_company_update on applications
  for update using (
    exists (
      select 1 from jobs j
      where j.id = job_id
        and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
    )
  );

drop policy if exists interviews_company on interviews;
create policy interviews_company on interviews
  for all using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id
        and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
    )
  );

drop policy if exists messages_parties on messages;
create policy messages_parties on messages
  for all using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id
        and (
          a.candidate_id = auth.uid()
          or j.company_id = auth.uid()
          or fn_is_company_member(j.company_id)
        )
    )
  );

drop policy if exists candidates_visible_to_employer on candidates;
create policy candidates_visible_to_employer on candidates
  for select using (
    exists (
      select 1
      from applications a
      join jobs j on j.id = a.job_id
      where a.candidate_id = candidates.id
        and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
    )
  );

-- Los miembros también pueden leer los datos de la empresa (ya son públicos)
-- y sus publicaciones. Editar el perfil de empresa queda solo para el dueño.

-- Storage: los miembros leen CVs de postulantes de su empresa
drop policy if exists cvs_company_read on storage.objects;
create policy cvs_company_read on storage.objects
  for select using (
    bucket_id = 'cvs' and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.candidate_id::text = (storage.foldername(name))[1]
        and (j.company_id = auth.uid() or public.fn_is_company_member(j.company_id))
    )
  );

-- 3) Test de perfil / match express
alter table candidates add column if not exists open_to_other_cities boolean not null default false;
