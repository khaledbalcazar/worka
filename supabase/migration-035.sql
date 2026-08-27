-- Worka Evaluar · Buscar un email desde desempeño también
--
-- Síntoma: al cargar a alguien en un ciclo de desempeño, la pantalla dice
-- "quien evalúa todavía no tiene cuenta en Worka" para un email que sí está
-- registrado.
--
-- Causa: fn_user_id_by_email tiene una reja para que no se pueda usar como
-- buscador de correos ajenos, y esa reja pedía tener al menos un proceso de
-- SELECCIÓN creado. Desempeño no tiene procesos, tiene ciclos, así que la
-- función devolvía null y la pantalla lo interpretaba como "no existe".
--
-- La reja sigue, pero ahora pregunta lo que de verdad importa: si quien
-- consulta es un cliente de Evaluar. Eso cubre los dos productos y no depende
-- de haber creado algo antes — alguien que recién activa su cuenta y arranca
-- por desempeño es un caso normal, no un intento de espiar correos.

create or replace function fn_user_id_by_email(p_email text)
returns uuid
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Solo para clientes de Evaluar. Sin esto, cualquier usuario registrado
  -- podría preguntar si tal correo tiene cuenta, uno por uno.
  if not exists (
    select 1 from evaluar_accounts where company_id = auth.uid()
  ) and coalesce(fn_current_role(), '') <> 'admin' then
    return null;
  end if;

  select id into v_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  return v_id;
end;
$$;

grant execute on function fn_user_id_by_email(text) to authenticated;
