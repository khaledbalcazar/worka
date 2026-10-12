-- ============================================================
-- Worka — Migración 046: verificación por email (adiós WhatsApp)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de la 045.
-- Idempotente y no destructiva: agrega una columna, la completa con el dato
-- real de Supabase Auth y deja de depender de phone_verified (que queda en
-- la tabla, sin usarse, para no borrar datos).
-- ============================================================
--
-- Antes: el registro marcaba phone_verified = true a todos y la app mostraba
-- "WhatsApp verificado" sin haber verificado nada. Ahora la insignia sale de
-- auth.users.email_confirmed_at: el email se confirmó de verdad o no.

alter table candidates add column if not exists email_verified boolean not null default false;

-- Valor real a partir de Supabase Auth (solo lectura de auth.users).
create or replace function public.fn_email_confirmed(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users u where u.id = p_user and u.email_confirmed_at is not null
  );
$$;

-- El guardia de la 045 se amplía: email_verified nunca se toma de lo que
-- mande el cliente, siempre se recalcula desde auth.users.
create or replace function public.fn_guard_candidate_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_verified := fn_email_confirmed(new.id);

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

-- Cuando la persona confirma el email (o lo cambia), se actualiza su fila.
create or replace function public.fn_sync_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update candidates
     set email_verified = (new.email_confirmed_at is not null)
   where id = new.id
     and email_verified is distinct from (new.email_confirmed_at is not null);
  return new;
end;
$$;

drop trigger if exists trg_sync_email_verified on auth.users;
create trigger trg_sync_email_verified
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.fn_sync_email_verified();

-- Completar las filas existentes con el dato real.
update candidates c
   set email_verified = true
  from auth.users u
 where u.id = c.id
   and u.email_confirmed_at is not null
   and c.email_verified = false;
