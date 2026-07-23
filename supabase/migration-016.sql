-- ============================================================
-- Worka — Migración 016: multi-país (Etapa 2)
--
-- El país entra al flujo real: candidatos y empresas guardan su
-- país, para que el feed, la búsqueda de talento y las landings
-- funcionen segmentados. Todo lo existente queda como 'py'.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table candidates
  add column if not exists country text not null default 'py';

alter table companies
  add column if not exists country text not null default 'py';

create index if not exists idx_candidates_country on candidates (country);
create index if not exists idx_companies_country on companies (country);

-- Trigger de alta actualizado: la empresa creada al confirmar el email
-- también guarda su país (viene en el metadata como worka_country).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := coalesce(meta->>'worka_role', 'candidate');
begin
  begin
    insert into public.profiles (id, role)
    values (new.id, v_role::user_role)
    on conflict (id) do nothing;
  exception when others then
    insert into public.profiles (id, role)
    values (new.id, 'candidate')
    on conflict (id) do nothing;
  end;

  if v_role = 'company' and (meta ? 'company_name') then
    begin
      insert into public.companies (id, company_name, trade_name, ruc, location_city, country)
      values (
        new.id,
        meta->>'company_name',
        coalesce(nullif(meta->>'trade_name', ''), meta->>'company_name'),
        coalesce(meta->>'ruc', ''),
        coalesce(nullif(meta->>'location_city', ''), 'Asunción'),
        coalesce(nullif(meta->>'worka_country', ''), 'py')
      )
      on conflict (id) do nothing;
    exception when others then
      null;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
