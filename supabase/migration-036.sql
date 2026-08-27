-- Worka Evaluar · Cargar a alguien aunque el evaluador todavía no se registró
--
-- Requiere la 033 y la 035 aplicadas.
--
-- El problema: armar un ciclo exigía que cada jefe ya tuviera cuenta en Worka.
-- En la práctica eso es al revés de como pasa — RRHH arma el ciclo un martes
-- y recién ahí les avisa a los jefes — y dejaba la pantalla en un callejón sin
-- salida: no podés cargar a la persona hasta que el otro se registre, y el
-- otro no tiene motivo para registrarse hasta que lo cargues.
--
-- Ahora se guarda el email y la fila queda esperando. Cuando esa persona
-- entra con ese correo, la evaluación le aparece sola.

-- ── 1. El evaluador puede estar pendiente ─────────────────────
alter table evaluar_desempeno
  alter column evaluador_id drop not null;

alter table evaluar_desempeno
  add column if not exists evaluador_email text not null default '';

-- Con evaluador_id nulo la restricción única de la 033 deja de servir: en
-- Postgres los NULL no chocan entre sí, así que la misma persona se podría
-- cargar dos veces. Esta cubre ese caso por email.
create unique index if not exists idx_ev_desempeno_pendiente
  on evaluar_desempeno (ciclo_id, empleado_nombre, lower(evaluador_email), tipo)
  where evaluador_id is null;

-- ── 2. Que la vea cuando se registre ──────────────────────────
--
-- Se resuelve por email en la propia política, sin ningún paso de
-- vinculación: apenas entra con ese correo, la fila le aparece. Un paso de
-- "vincular cuenta" seria una cosa más que puede quedar sin hacer.
drop policy if exists ev_desempeno_evaluador on evaluar_desempeno;
create policy ev_desempeno_evaluador on evaluar_desempeno
  for select using (
    evaluador_id = auth.uid()
    or (
      evaluador_id is null
      and evaluador_email <> ''
      and lower(evaluador_email) = lower(coalesce(auth.email(), ''))
    )
  );

drop policy if exists ev_desempeno_evaluador_edita on evaluar_desempeno;
create policy ev_desempeno_evaluador_edita on evaluar_desempeno
  for update using (
    evaluador_id = auth.uid()
    or (
      evaluador_id is null
      and evaluador_email <> ''
      and lower(evaluador_email) = lower(coalesce(auth.email(), ''))
    )
  )
  with check (
    evaluador_id = auth.uid()
    or (
      evaluador_id is null
      and evaluador_email <> ''
      and lower(evaluador_email) = lower(coalesce(auth.email(), ''))
    )
  );

-- ── 3. El candado de columnas, al día ─────────────────────────
--
-- Mismo guard de la 033, ahora contemplando al evaluador pendiente: si no,
-- quien entra por email quedaría del lado del empleado y no podría cargar
-- nada.
create or replace function evaluar_desempeno_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid;
begin
  select c.company_id into v_empresa
  from evaluar_ciclos c where c.id = old.ciclo_id;

  if auth.uid() = v_empresa
     or auth.uid() = old.evaluador_id
     or (
       old.evaluador_id is null
       and old.evaluador_email <> ''
       and lower(old.evaluador_email) = lower(coalesce(auth.email(), ''))
     )
     or fn_current_role() = 'admin' then
    return new;
  end if;

  -- Cualquier otro que llegue hasta acá es el empleado evaluado, y lo único
  -- que le corresponde es dejar constancia de que la leyó.
  if new.puntajes        is distinct from old.puntajes
     or new.comentarios  is distinct from old.comentarios
     or new.fortalezas   is distinct from old.fortalezas
     or new.a_mejorar    is distinct from old.a_mejorar
     or new.compromisos  is distinct from old.compromisos
     or new.status       is distinct from old.status
     or new.ciclo_id     is distinct from old.ciclo_id
     or new.empleado_id  is distinct from old.empleado_id
     or new.evaluador_id is distinct from old.evaluador_id
     or new.tipo         is distinct from old.tipo then
    raise exception 'Solo podés dejar tu acuse de recibo, no modificar la evaluación.';
  end if;

  return new;
end;
$$;
