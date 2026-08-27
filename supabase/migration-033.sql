-- Worka Evaluar · Evaluación de desempeño
--
-- Requiere las anteriores aplicadas (hasta la 032).
--
-- ── Por qué va aparte de los procesos de selección ────────────
--
-- Un candidato y un empleado no son lo mismo, aunque los dos se evalúen.
-- El candidato entra con un enlace, sin cuenta, y la empresa ve todo lo suyo.
-- El empleado ya trabaja ahí: tiene cuenta, su evaluación la escribe su jefe,
-- él la firma, y NO puede ver la de sus compañeros. Meter eso adentro de
-- evaluar_participants habría hecho que una sola política de RLS floja
-- filtrara la evaluación de todo el personal de una empresa.
--
-- Se repite un poco de estructura a cambio de que los permisos sean simples
-- de leer y difíciles de romper.

-- ── 1. Ciclos ─────────────────────────────────────────────────
-- Una evaluación de desempeño es de un período: "segundo semestre 2026".
-- Sin el ciclo no se puede comparar a la misma persona contra sí misma, que
-- es lo único que hace útil a todo esto.
create table if not exists evaluar_ciclos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  title text not null,
  description text not null default '',
  -- borrador: se arma. abierto: los jefes cargan. cerrado: solo lectura.
  status text not null default 'borrador'
    check (status in ('borrador', 'abierto', 'cerrado')),
  -- Competencias elegidas para este ciclo, por su clave del catálogo.
  competencias jsonb not null default '[]'::jsonb,
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_ciclos_empresa
  on evaluar_ciclos (company_id, created_at desc);

-- ── 2. Evaluaciones ───────────────────────────────────────────
-- Una fila por persona evaluada y por quién la evalúa. Así el mismo empleado
-- puede tener la de su jefe y su autoevaluación sin pisarse.
create table if not exists evaluar_desempeno (
  id uuid primary key default gen_random_uuid(),
  ciclo_id uuid not null references evaluar_ciclos (id) on delete cascade,
  -- A quién se evalúa. Puede no tener cuenta todavía: se guarda el nombre.
  empleado_id uuid references profiles (id) on delete set null,
  empleado_nombre text not null,
  empleado_puesto text not null default '',
  empleado_area text not null default '',
  -- Si conduce gente, se le suman las competencias de jefatura.
  conduce boolean not null default false,
  -- Quién evalúa y desde qué lugar.
  evaluador_id uuid not null references profiles (id) on delete cascade,
  tipo text not null default 'jefe'
    check (tipo in ('jefe', 'auto', 'par')),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_curso', 'enviada')),
  -- Puntajes por competencia: { "calidad": 4, "equipo": 3, ... }
  puntajes jsonb not null default '{}'::jsonb,
  -- Comentarios por competencia, opcionales.
  comentarios jsonb not null default '{}'::jsonb,
  fortalezas text not null default '',
  a_mejorar text not null default '',
  -- Lo acordado para el próximo período.
  compromisos text not null default '',
  -- El empleado deja constancia de que la leyó. No es conformidad.
  acuse_at timestamptz,
  acuse_comentario text not null default '',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (ciclo_id, empleado_nombre, evaluador_id, tipo)
);

create index if not exists idx_ev_desempeno_ciclo
  on evaluar_desempeno (ciclo_id, status);
create index if not exists idx_ev_desempeno_evaluador
  on evaluar_desempeno (evaluador_id, status);
create index if not exists idx_ev_desempeno_empleado
  on evaluar_desempeno (empleado_id);

-- ── 3. Permisos ───────────────────────────────────────────────

alter table evaluar_ciclos enable row level security;
alter table evaluar_desempeno enable row level security;

-- El ciclo es de la empresa dueña.
drop policy if exists ev_ciclos_own on evaluar_ciclos;
create policy ev_ciclos_own on evaluar_ciclos
  for all using (company_id = auth.uid() or fn_current_role() = 'admin')
  with check (company_id = auth.uid() or fn_current_role() = 'admin');

-- La empresa ve y administra todas las evaluaciones de sus ciclos.
drop policy if exists ev_desempeno_empresa on evaluar_desempeno;
create policy ev_desempeno_empresa on evaluar_desempeno
  for all using (
    exists (
      select 1 from evaluar_ciclos c
      where c.id = evaluar_desempeno.ciclo_id
        and (c.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_ciclos c
      where c.id = evaluar_desempeno.ciclo_id
        and (c.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  );

-- El evaluador ve y completa SOLO las que le tocan.
drop policy if exists ev_desempeno_evaluador on evaluar_desempeno;
create policy ev_desempeno_evaluador on evaluar_desempeno
  for select using (evaluador_id = auth.uid());

drop policy if exists ev_desempeno_evaluador_edita on evaluar_desempeno;
create policy ev_desempeno_evaluador_edita on evaluar_desempeno
  for update using (evaluador_id = auth.uid())
  with check (evaluador_id = auth.uid());

-- El empleado ve SOLO la suya, y solo una vez enviada. Antes de eso es un
-- borrador de su jefe y mostrarlo a medio escribir no le sirve a nadie.
drop policy if exists ev_desempeno_empleado on evaluar_desempeno;
create policy ev_desempeno_empleado on evaluar_desempeno
  for select using (
    empleado_id = auth.uid() and status = 'enviada'
  );

-- Y puede dejar su acuse. La condición del using se repite en el with check
-- a propósito: sin eso podría cambiarse el empleado_id a sí mismo en una
-- fila ajena y quedarse con la evaluación de otro.
drop policy if exists ev_desempeno_acuse on evaluar_desempeno;
create policy ev_desempeno_acuse on evaluar_desempeno
  for update using (empleado_id = auth.uid() and status = 'enviada')
  with check (empleado_id = auth.uid() and status = 'enviada');

-- ── 4. El acuse no puede tocar la nota ────────────────────────
--
-- La política de arriba deja al empleado hacer UPDATE sobre su fila, y RLS no
-- sabe limitar por columna: con eso solo, podría cambiarse sus propios
-- puntajes. El candado va en un disparador, que es donde se puede mirar qué
-- cambió exactamente.
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

  -- La empresa dueña y el evaluador asignado editan con libertad.
  if auth.uid() = v_empresa
     or auth.uid() = old.evaluador_id
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

drop trigger if exists trg_evaluar_desempeno_guard on evaluar_desempeno;
create trigger trg_evaluar_desempeno_guard
  before update on evaluar_desempeno
  for each row execute function evaluar_desempeno_guard();
