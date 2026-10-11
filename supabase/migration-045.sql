-- ============================================================
-- Worka — Migración 045: campos de confianza y de pago solo para el admin
-- Ejecutar en el SQL Editor de Supabase. Idempotente y no destructiva:
-- no borra ni modifica datos existentes. Agrega dos funciones, tres
-- triggers y reemplaza una política de boost_requests.
-- ============================================================
--
-- Problema: las políticas de escritura de jobs, companies y candidates dejan
-- que cada dueño edite SU fila completa (companies_self y candidates_self son
-- "for all"; jobs_company_update no limita columnas). Con una llamada directa
-- a la API (o a una server action) se podía:
--   - marcar la propia vacante como destacada sin pagar (featured);
--   - reactivar una vacante que el admin pasó a "Moderacion" por denuncias;
--   - ponerse el sello de empresa verificada o insignias (is_verified, badges);
--   - marcarse la identidad como verificada (identity_status = 'verified');
--   - aprobar la propia solicitud de destaque (boost_requests.status).
--
-- Por qué triggers y no cambiar las políticas: las políticas no pueden limitar
-- columnas, y partirlas en muchas reglas arriesga romper la edición normal
-- del perfil y de las vacantes. El trigger deja pasar todo lo demás y solo
-- protege estos campos. El admin, el service role (cron) y el SQL Editor
-- (auth.uid() nulo) siguen pudiendo cambiarlos.

-- ¿Quién llama puede tocar campos de confianza?
create or replace function public.fn_is_privileged()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is null
      or exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ── Vacantes: destaque pago y moderación ────────────────────────────────
create or replace function public.fn_guard_job_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if fn_is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.featured := false;
    new.featured_until := null;
    return new;
  end if;

  -- El destaque solo lo da el admin al aprobar el pago. Se conserva el valor
  -- anterior en silencio para no romper el formulario de edición.
  new.featured := old.featured;
  new.featured_until := old.featured_until;

  -- Una vacante en revisión solo la libera el admin.
  if old.status = 'Moderacion' and new.status is distinct from old.status then
    raise exception 'La vacante está en revisión por Worka y no se puede reactivar.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_job_fields on jobs;
create trigger trg_guard_job_fields
  before insert or update on jobs
  for each row execute function public.fn_guard_job_fields();

-- ── Empresas: verificación e insignias ──────────────────────────────────
create or replace function public.fn_guard_company_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if fn_is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_verified := false;
    new.ruc_check_status := 'pendiente';
    new.badges := '{}';
    return new;
  end if;

  new.is_verified := old.is_verified;
  new.ruc_check_status := old.ruc_check_status;
  new.badges := old.badges;
  return new;
end;
$$;

drop trigger if exists trg_guard_company_fields on companies;
create trigger trg_guard_company_fields
  before insert or update on companies
  for each row execute function public.fn_guard_company_fields();

-- ── Candidatos: identidad verificada ────────────────────────────────────
-- El candidato puede pedir la verificación ('pending') o volver a 'none',
-- pero no darse 'verified'.
create or replace function public.fn_guard_candidate_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if fn_is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.identity_status = 'verified' then
      new.identity_status := 'none';
    end if;
    return new;
  end if;

  if new.identity_status = 'verified' and old.identity_status is distinct from 'verified' then
    new.identity_status := old.identity_status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_candidate_fields on candidates;
create trigger trg_guard_candidate_fields
  before insert or update on candidates
  for each row execute function public.fn_guard_candidate_fields();

-- ── Solicitudes de destaque ─────────────────────────────────────────────
-- Antes: "for all" para la empresa, que así podía cambiar el estado de su
-- propia solicitud. Ahora la empresa (o un miembro del equipo con permiso
-- de escritura) solo ve y crea solicitudes pendientes; aprobar o rechazar
-- es del admin.
drop policy if exists boost_requests_company on boost_requests;
drop policy if exists boost_requests_company_read on boost_requests;
drop policy if exists boost_requests_company_insert on boost_requests;
drop policy if exists boost_requests_admin on boost_requests;

create policy boost_requests_company_read on boost_requests
  for select using (
    company_id = auth.uid()
    or fn_company_member_can_write(company_id)
    or fn_current_role() = 'admin'
  );

create policy boost_requests_company_insert on boost_requests
  for insert with check (
    (company_id = auth.uid() or fn_company_member_can_write(company_id))
    and status = 'pendiente_pago'
  );

create policy boost_requests_admin on boost_requests
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');
