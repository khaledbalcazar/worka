-- ============================================================
-- Worka — Migración 039: roles en el equipo de la empresa
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- Hasta ahora todo miembro del equipo podía lo mismo que el dueño: publicar,
-- editar, cerrar vacantes y escribirle a los candidatos. Esta migración
-- reparte eso en tres roles y —lo importante— los hace valer en la base, no
-- solo en la pantalla. Un permiso que solo se respeta en el frontend no es un
-- permiso: cualquiera con el token puede llamar a la API igual.
--
--   administrador → todo, incluido invitar y quitar gente del equipo
--   reclutador    → vacantes y candidatos; no toca el equipo
--   observador    → solo mira
--
-- El dueño de la cuenta (companies.id = auth.uid()) queda siempre por encima
-- de los roles: no tiene fila en company_members y no la necesita.

-- 1) La columna. Las filas que ya existen quedan como reclutador, que es lo
-- que de hecho venían siendo: podían operar pero no gestionar el equipo.
alter table company_members
  add column if not exists role text not null default 'reclutador';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'company_members_role_check'
  ) then
    alter table company_members
      add constraint company_members_role_check
      check (role in ('administrador', 'reclutador', 'observador'));
  end if;
end $$;

-- 2) ¿Puede escribir? Miembro activo cuyo rol no sea observador.
-- Se agrega una función nueva en vez de cambiar fn_is_company_member, porque
-- esa se sigue usando en las políticas de lectura, donde el observador sí
-- tiene que pasar.
create or replace function public.fn_company_member_can_write(comp uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from company_members m
    where m.company_id = comp
      and m.member_id = auth.uid()
      and m.status = 'activa'
      and m.role in ('administrador', 'reclutador')
  );
$$;

create or replace function public.fn_company_admin(comp uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from company_members m
    where m.company_id = comp
      and m.member_id = auth.uid()
      and m.status = 'activa'
      and m.role = 'administrador'
  );
$$;

-- 3) Las políticas de escritura pasan a exigir el permiso.
-- Las de lectura (jobs_public_read, applications_company, etc.) quedan como
-- están: el observador tiene que poder ver.

drop policy if exists jobs_company_write on jobs;
create policy jobs_company_write on jobs
  for insert with check (
    company_id = auth.uid() or fn_company_member_can_write(company_id)
  );

drop policy if exists jobs_company_update on jobs;
create policy jobs_company_update on jobs
  for update using (
    company_id = auth.uid()
    or fn_company_member_can_write(company_id)
    or fn_current_role() = 'admin'
  );

drop policy if exists job_questions_write on job_questions;
create policy job_questions_write on job_questions
  for all using (
    exists (
      select 1 from jobs j
      where j.id = job_id
        and (j.company_id = auth.uid() or fn_company_member_can_write(j.company_id))
    )
  );

drop policy if exists applications_company_update on applications;
create policy applications_company_update on applications
  for update using (
    exists (
      select 1 from jobs j
      where j.id = job_id
        and (j.company_id = auth.uid() or fn_company_member_can_write(j.company_id))
    )
  );

drop policy if exists interviews_company on interviews;
create policy interviews_company on interviews
  for all using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id
        and (j.company_id = auth.uid() or fn_company_member_can_write(j.company_id))
    )
  );

-- Mensajes: el observador puede leer el hilo pero no responder, así que acá
-- hay que separar la lectura de la escritura en dos políticas.
drop policy if exists messages_parties on messages;
create policy messages_parties_read on messages
  for select using (
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

drop policy if exists messages_parties_write on messages;
create policy messages_parties_write on messages
  for insert with check (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id
        and (
          a.candidate_id = auth.uid()
          or j.company_id = auth.uid()
          or fn_company_member_can_write(j.company_id)
        )
    )
  );

-- 4) Gestión del equipo: el dueño siempre; los administradores también.
drop policy if exists company_members_owner on company_members;
create policy company_members_owner on company_members
  for all using (
    company_id = auth.uid()
    or fn_company_admin(company_id)
    or fn_current_role() = 'admin'
  )
  with check (
    company_id = auth.uid()
    or fn_company_admin(company_id)
    or fn_current_role() = 'admin'
  );

-- Nota: fn_company_admin lee company_members dentro de una política de
-- company_members. No hay recursión porque la función es security definer y
-- por lo tanto no vuelve a pasar por RLS.
