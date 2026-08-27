-- Worka Evaluar · Que la persona evaluada reciba y firme su evaluación
--
-- Requiere la 033, 036 y 037 aplicadas.
--
-- Dos cosas faltaban. La primera es el mismo problema que tenía el evaluador:
-- empleado_id solo se completaba si esa persona ya tenía cuenta en el momento
-- de cargarla. Si se registraba después, la evaluación no le aparecía nunca —
-- quedaba huérfana, sin forma de recuperarla salvo editando la tabla a mano.
--
-- La segunda es que no había manera de avisarle. La evaluación se enviaba y
-- quedaba esperando a que la persona entrara por su cuenta a buscarla, cosa
-- que no pasa: una devolución de desempeño se comunica, no se publica.

-- ── 1. El empleado también puede estar pendiente ──────────────
alter table evaluar_desempeno
  add column if not exists empleado_email text not null default '';

-- Cuándo se le avisó por correo. Sirve para no mandar dos veces sin querer y
-- para que el jefe vea si ya salió.
alter table evaluar_desempeno
  add column if not exists notificado_at timestamptz;

create index if not exists idx_ev_desempeno_empleado_email
  on evaluar_desempeno (lower(empleado_email))
  where empleado_email <> '';

-- ── 2. Que la vea al registrarse con ese correo ───────────────
--
-- Igual que con el evaluador: se resuelve por email en la propia política,
-- sin ningún paso de vinculación que pueda quedar sin hacer.
drop policy if exists ev_desempeno_empleado on evaluar_desempeno;
create policy ev_desempeno_empleado on evaluar_desempeno
  for select using (
    status = 'enviada'
    and (
      empleado_id = auth.uid()
      or (
        empleado_email <> ''
        and lower(empleado_email) = lower(coalesce(auth.email(), ''))
      )
    )
  );

drop policy if exists ev_desempeno_acuse on evaluar_desempeno;
create policy ev_desempeno_acuse on evaluar_desempeno
  for update using (
    status = 'enviada'
    and (
      empleado_id = auth.uid()
      or (
        empleado_email <> ''
        and lower(empleado_email) = lower(coalesce(auth.email(), ''))
      )
    )
  )
  with check (
    status = 'enviada'
    and (
      empleado_id = auth.uid()
      or (
        empleado_email <> ''
        and lower(empleado_email) = lower(coalesce(auth.email(), ''))
      )
    )
  );

-- ── 3. Y que pueda leer el ciclo de su evaluación ─────────────
create or replace function fn_participa_en_ciclo(p_ciclo uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from evaluar_desempeno d
    where d.ciclo_id = p_ciclo
      and (
        d.evaluador_id = auth.uid()
        or (
          d.evaluador_id is null
          and d.evaluador_email <> ''
          and lower(d.evaluador_email) = lower(coalesce(auth.email(), ''))
        )
        or (
          d.status = 'enviada'
          and (
            d.empleado_id = auth.uid()
            or (
              d.empleado_email <> ''
              and lower(d.empleado_email) = lower(coalesce(auth.email(), ''))
            )
          )
        )
      )
  );
$$;

-- ── 4. El candado de columnas, al día ─────────────────────────
--
-- El empleado que entra por email tiene que caer del mismo lado que el que
-- entra por id: puede dejar su acuse y nada más.
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
