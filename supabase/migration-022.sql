-- ============================================================
-- Worka — Migración 022: Worka Evaluar
--
-- Plataforma de selección de personal (evaluar.worka.click), de pago con
-- 15 días de prueba. Vive en la misma base que Worka a propósito: el
-- diferencial es que una vacante de Worka Empleos se enlaza a un proceso de
-- Evaluar y el candidato arranca los tests desde el propio aviso, sin
-- rebotar entre dos sistemas.
--
-- Modelo:
--   evaluar_accounts      suscripción de la empresa (prueba / activa / vencida)
--   evaluar_processes     proceso de selección, opcionalmente atado a un job
--   evaluar_stages        etapas ordenadas del proceso
--   evaluar_questions     preguntas de cada etapa
--   evaluar_participants  candidato dentro del proceso (con o sin cuenta Worka)
--   evaluar_answers       respuestas
--   evaluar_events        línea de tiempo que el candidato ve (transparencia)
--   evaluar_notes         notas del evaluador para el tablero de decisión
--
-- La empresa es el propio perfil: companies.id = auth.uid(), igual que en
-- el resto del esquema.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

-- ── Suscripción ──────────────────────────────────────────────
-- Se cobra con link de pago y activación manual desde /admin, igual que los
-- impulsos de vacantes. Migrar a una pasarela después no cambia estas tablas.
create table if not exists evaluar_accounts (
  company_id uuid primary key references companies (id) on delete cascade,
  status text not null default 'prueba'
    check (status in ('prueba', 'activa', 'vencida', 'cancelada')),
  plan text not null default 'esencial',
  price_gs integer not null default 0,
  trial_ends_at timestamptz not null default (now() + interval '15 days'),
  paid_until timestamptz,
  created_at timestamptz not null default now()
);

-- ── Procesos ─────────────────────────────────────────────────
create table if not exists evaluar_processes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  -- El enlace con Worka Empleos. Null = proceso suelto (candidatos invitados
  -- a mano). Con job_id, quien se postula a esa vacante entra al proceso.
  job_id uuid references jobs (id) on delete set null,
  title text not null,
  description text not null default '',
  -- Mensaje que ve el candidato al terminar. Parte de la promesa de que acá
  -- nadie queda esperando sin saber nada.
  closing_message text not null default '',
  status text not null default 'borrador'
    check (status in ('borrador', 'activo', 'cerrado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_processes_company
  on evaluar_processes (company_id, status);
create index if not exists idx_ev_processes_job on evaluar_processes (job_id);

-- ── Etapas ───────────────────────────────────────────────────
create table if not exists evaluar_stages (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references evaluar_processes (id) on delete cascade,
  position smallint not null default 0,
  title text not null,
  description text not null default '',
  kind text not null default 'cuestionario'
    check (kind in ('cuestionario', 'tarea', 'entrevista')),
  -- Minutos sugeridos: al candidato se le dice cuánto le va a llevar antes
  -- de empezar, no después.
  minutes smallint not null default 5,
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_stages_process
  on evaluar_stages (process_id, position);

-- ── Preguntas ────────────────────────────────────────────────
create table if not exists evaluar_questions (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references evaluar_stages (id) on delete cascade,
  position smallint not null default 0,
  kind text not null default 'unica'
    check (kind in ('unica', 'multiple', 'texto', 'escala', 'numero')),
  text text not null,
  options jsonb not null default '[]'::jsonb,     -- ["A","B",...]
  correct jsonb,                                  -- null = sin respuesta correcta
  weight smallint not null default 1,
  -- Una respuesta incorrecta acá descarta al candidato del proceso.
  knockout boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_questions_stage
  on evaluar_questions (stage_id, position);

-- ── Participantes ────────────────────────────────────────────
-- El candidato puede tener cuenta de Worka (llegó desde una vacante) o no
-- (lo invitó la empresa por email). En ambos casos entra con un token, así
-- nadie tiene que crear otra cuenta para rendir una evaluación.
create table if not exists evaluar_participants (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references evaluar_processes (id) on delete cascade,
  candidate_id uuid references candidates (id) on delete set null,
  full_name text not null default '',
  email text,
  phone text,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  source text not null default 'invitado'
    check (source in ('worka', 'invitado')),
  status text not null default 'invitado'
    check (status in ('invitado', 'en_curso', 'completado', 'descartado', 'finalista', 'contratado')),
  stage_index smallint not null default 0,
  score numeric(5, 2),
  max_score numeric(5, 2),
  -- Motivo visible para el candidato cuando queda afuera.
  outcome_note text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (process_id, candidate_id)
);

create index if not exists idx_ev_participants_process
  on evaluar_participants (process_id, status);
create index if not exists idx_ev_participants_token
  on evaluar_participants (token);

-- ── Respuestas ───────────────────────────────────────────────
create table if not exists evaluar_answers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references evaluar_participants (id) on delete cascade,
  question_id uuid not null references evaluar_questions (id) on delete cascade,
  value jsonb not null default 'null'::jsonb,
  score numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (participant_id, question_id)
);

-- ── Línea de tiempo del candidato ────────────────────────────
-- Transparencia: el candidato ve exactamente qué pasó y cuándo.
create table if not exists evaluar_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references evaluar_participants (id) on delete cascade,
  kind text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_events_participant
  on evaluar_events (participant_id, created_at);

-- ── Notas del evaluador ──────────────────────────────────────
create table if not exists evaluar_notes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references evaluar_participants (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists idx_ev_notes_participant
  on evaluar_notes (participant_id, created_at);

-- ============================================================
-- RLS
-- ============================================================
alter table evaluar_accounts enable row level security;
alter table evaluar_processes enable row level security;
alter table evaluar_stages enable row level security;
alter table evaluar_questions enable row level security;
alter table evaluar_participants enable row level security;
alter table evaluar_answers enable row level security;
alter table evaluar_events enable row level security;
alter table evaluar_notes enable row level security;

-- Cuenta: la empresa ve y crea la suya; solo el admin cambia el estado de
-- pago (por eso no hay policy de update para la empresa).
drop policy if exists ev_accounts_own on evaluar_accounts;
create policy ev_accounts_own on evaluar_accounts
  for select using (company_id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists ev_accounts_create on evaluar_accounts;
create policy ev_accounts_create on evaluar_accounts
  for insert with check (company_id = auth.uid());

drop policy if exists ev_accounts_admin on evaluar_accounts;
create policy ev_accounts_admin on evaluar_accounts
  for update using (fn_current_role() = 'admin');

-- Procesos: los maneja la empresa dueña.
drop policy if exists ev_processes_own on evaluar_processes;
create policy ev_processes_own on evaluar_processes
  for all using (company_id = auth.uid() or fn_current_role() = 'admin')
  with check (company_id = auth.uid() or fn_current_role() = 'admin');

-- Etapas y preguntas: cuelgan del proceso de la empresa.
drop policy if exists ev_stages_own on evaluar_stages;
create policy ev_stages_own on evaluar_stages
  for all using (
    exists (
      select 1 from evaluar_processes p
      where p.id = process_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_processes p
      where p.id = process_id and p.company_id = auth.uid()
    )
  );

drop policy if exists ev_questions_own on evaluar_questions;
create policy ev_questions_own on evaluar_questions
  for all using (
    exists (
      select 1 from evaluar_stages s
      join evaluar_processes p on p.id = s.process_id
      where s.id = stage_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_stages s
      join evaluar_processes p on p.id = s.process_id
      where s.id = stage_id and p.company_id = auth.uid()
    )
  );

-- Participantes: los gestiona la empresa; el candidato con cuenta de Worka
-- ve el suyo (para el panel de transparencia dentro de Worka).
drop policy if exists ev_participants_company on evaluar_participants;
create policy ev_participants_company on evaluar_participants
  for all using (
    exists (
      select 1 from evaluar_processes p
      where p.id = process_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_processes p
      where p.id = process_id and p.company_id = auth.uid()
    )
  );

drop policy if exists ev_participants_self on evaluar_participants;
create policy ev_participants_self on evaluar_participants
  for select using (candidate_id = auth.uid());

-- Respuestas, eventos y notas: solo la empresa dueña del proceso.
drop policy if exists ev_answers_company on evaluar_answers;
create policy ev_answers_company on evaluar_answers
  for all using (
    exists (
      select 1 from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id and p.company_id = auth.uid()
    )
  );

drop policy if exists ev_events_read on evaluar_events;
create policy ev_events_read on evaluar_events
  for select using (
    exists (
      select 1 from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id
        and (
          p.company_id = auth.uid()
          or pa.candidate_id = auth.uid()
          or fn_current_role() = 'admin'
        )
    )
  );

drop policy if exists ev_notes_company on evaluar_notes;
create policy ev_notes_company on evaluar_notes
  for all using (
    exists (
      select 1 from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id and p.company_id = auth.uid()
    )
  );

-- ============================================================
-- Acceso del candidato por token
--
-- El candidato rinde sin crear cuenta, así que no hay auth.uid() con el cual
-- escribir una policy: el token ES la credencial. Estas funciones corren con
-- los permisos del dueño (security definer) y validan el token adentro, que
-- es la forma segura de resolverlo sin exponer las tablas.
-- ============================================================

-- Devuelve todo lo que el candidato necesita ver de su evaluación.
create or replace function evaluar_load(p_token text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_result jsonb;
begin
  select * into v_participant
  from evaluar_participants where token = p_token;
  if not found then
    return null;
  end if;

  select * into v_process
  from evaluar_processes where id = v_participant.process_id;

  select jsonb_build_object(
    'participant', jsonb_build_object(
      'id', v_participant.id,
      'full_name', v_participant.full_name,
      'status', v_participant.status,
      'stage_index', v_participant.stage_index,
      'score', v_participant.score,
      'max_score', v_participant.max_score,
      'outcome_note', v_participant.outcome_note,
      'completed_at', v_participant.completed_at
    ),
    'process', jsonb_build_object(
      'id', v_process.id,
      'title', v_process.title,
      'description', v_process.description,
      'closing_message', v_process.closing_message,
      'status', v_process.status,
      'company', (
        select c.trade_name from companies c where c.id = v_process.company_id
      )
    ),
    'stages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', s.title,
          'description', s.description,
          'kind', s.kind,
          'minutes', s.minutes,
          'questions', coalesce((
            select jsonb_agg(
              -- Nunca se manda `correct` al navegador: la corrección es del
              -- lado del servidor.
              jsonb_build_object(
                'id', q.id,
                'kind', q.kind,
                'text', q.text,
                'options', q.options
              ) order by q.position
            )
            from evaluar_questions q where q.stage_id = s.id
          ), '[]'::jsonb)
        ) order by s.position
      )
      from evaluar_stages s where s.process_id = v_process.id
    ), '[]'::jsonb),
    'answers', coalesce((
      select jsonb_object_agg(a.question_id::text, a.value)
      from evaluar_answers a where a.participant_id = v_participant.id
    ), '{}'::jsonb),
    'events', coalesce((
      select jsonb_agg(
        jsonb_build_object('kind', e.kind, 'message', e.message, 'at', e.created_at)
        order by e.created_at
      )
      from evaluar_events e where e.participant_id = v_participant.id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

-- Guarda las respuestas de una etapa, las corrige y avanza al candidato.
create or replace function evaluar_submit_stage(
  p_token text,
  p_stage_id uuid,
  p_answers jsonb   -- { "<question_id>": <valor> }
)
returns jsonb
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_stage evaluar_stages;
  v_total numeric(5,2) := 0;
  v_max numeric(5,2) := 0;
  v_knocked boolean := false;
  v_q record;
  v_value jsonb;
  v_ok boolean;
  v_stage_count int;
begin
  select * into v_participant
  from evaluar_participants where token = p_token;
  if not found then
    raise exception 'Token inválido';
  end if;
  if v_participant.status in ('descartado', 'completado', 'contratado') then
    raise exception 'Esta evaluación ya está cerrada';
  end if;

  select * into v_stage from evaluar_stages
  where id = p_stage_id and process_id = v_participant.process_id;
  if not found then
    raise exception 'Etapa inválida';
  end if;

  for v_q in
    select * from evaluar_questions where stage_id = p_stage_id order by position
  loop
    v_value := p_answers -> v_q.id::text;

    -- Sin respuesta correcta definida (texto abierto, escala) la pregunta no
    -- puntúa sola: la mira el evaluador en el tablero.
    if v_q.correct is null then
      insert into evaluar_answers (participant_id, question_id, value, score)
      values (v_participant.id, v_q.id, coalesce(v_value, 'null'::jsonb), 0)
      on conflict (participant_id, question_id)
      do update set value = excluded.value, score = excluded.score;
      continue;
    end if;

    v_ok := (v_value is not null and v_value = v_q.correct);
    v_max := v_max + v_q.weight;
    if v_ok then
      v_total := v_total + v_q.weight;
    elsif v_q.knockout then
      v_knocked := true;
    end if;

    insert into evaluar_answers (participant_id, question_id, value, score)
    values (
      v_participant.id,
      v_q.id,
      coalesce(v_value, 'null'::jsonb),
      case when v_ok then v_q.weight else 0 end
    )
    on conflict (participant_id, question_id)
    do update set value = excluded.value, score = excluded.score;
  end loop;

  select count(*) into v_stage_count
  from evaluar_stages where process_id = v_participant.process_id;

  update evaluar_participants set
    score = coalesce(score, 0) + v_total,
    max_score = coalesce(max_score, 0) + v_max,
    started_at = coalesce(started_at, now()),
    stage_index = case
      when v_knocked then stage_index
      else least(stage_index + 1, v_stage_count)
    end,
    status = case
      when v_knocked then 'descartado'
      when stage_index + 1 >= v_stage_count then 'completado'
      else 'en_curso'
    end,
    completed_at = case
      when v_knocked or stage_index + 1 >= v_stage_count then now()
      else completed_at
    end,
    outcome_note = case
      when v_knocked then 'No se cumplió un requisito excluyente del puesto.'
      else outcome_note
    end
  where id = v_participant.id
  returning * into v_participant;

  insert into evaluar_events (participant_id, kind, message)
  values (
    v_participant.id,
    case when v_knocked then 'descartado' else 'etapa' end,
    case
      when v_knocked then 'Tu proceso se cerró en la etapa "' || v_stage.title || '".'
      else 'Completaste la etapa "' || v_stage.title || '".'
    end
  );

  return jsonb_build_object(
    'status', v_participant.status,
    'stage_index', v_participant.stage_index,
    'outcome_note', v_participant.outcome_note
  );
end;
$$;

-- Marca el inicio (para que el candidato vea su propia línea de tiempo).
create or replace function evaluar_start(p_token text)
returns void
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
begin
  select * into v_participant
  from evaluar_participants where token = p_token;
  if not found then
    raise exception 'Token inválido';
  end if;
  if v_participant.started_at is not null then
    return;
  end if;

  update evaluar_participants
  set started_at = now(),
      status = case when status = 'invitado' then 'en_curso' else status end
  where id = v_participant.id;

  insert into evaluar_events (participant_id, kind, message)
  values (v_participant.id, 'inicio', 'Empezaste la evaluación.');
end;
$$;

grant execute on function evaluar_load(text) to anon, authenticated;
grant execute on function evaluar_submit_stage(text, uuid, jsonb) to anon, authenticated;
grant execute on function evaluar_start(text) to anon, authenticated;
