-- ============================================================
-- Worka — Fix del trigger de alta (registro de EMPRESA fallaba)
-- Sintoma: "Database error saving new user" (HTTP 500) al registrar empresa.
-- Causa: el insert en companies metia un texto en ruc_check_status (enum) y
--        cualquier fallo del trigger tumbaba TODO el alta del usuario.
-- Ejecutar este bloque en el SQL Editor de Supabase. Es idempotente.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := coalesce(meta->>'worka_role', 'candidate');
begin
  -- Perfil: siempre. Si el rol viniera invalido, cae a 'candidate'.
  begin
    insert into public.profiles (id, role)
    values (new.id, v_role::user_role)
    on conflict (id) do nothing;
  exception when others then
    insert into public.profiles (id, role)
    values (new.id, 'candidate')
    on conflict (id) do nothing;
  end;

  -- Empresa: solo si el alta trae los datos. Va en su propio bloque para que,
  -- si algo falla (ej: RUC repetido), NO se caiga el registro del usuario.
  -- Se omite ruc_check_status a proposito: usa su valor por defecto ('pendiente').
  if v_role = 'company' and (meta ? 'company_name') then
    begin
      insert into public.companies (id, company_name, trade_name, ruc, location_city)
      values (
        new.id,
        meta->>'company_name',
        coalesce(nullif(meta->>'trade_name', ''), meta->>'company_name'),
        coalesce(meta->>'ruc', ''),
        coalesce(nullif(meta->>'location_city', ''), 'Asunción')
      )
      on conflict (id) do nothing;
    exception when others then
      null; -- la empresa se completa al primer ingreso si aca fallara
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
