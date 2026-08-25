-- ============================================================
-- Worka — Migración 023: puntaje por dimensión (tests psicométricos)
--
-- Hasta acá Evaluar solo sabía puntuar correcto/incorrecto, que sirve para
-- una prueba de conocimientos pero no para un test de personalidad: ahí no
-- hay respuestas correctas, hay rasgos que se acumulan.
--
-- Agrega:
--   questions.dimension      qué rasgo mide la pregunta (ej: 'extraversion')
--   questions.reverse        ítem inverso (contestar "mucho" resta, no suma)
--   questions.option_scores  puntos por opción, para los SJT (no es binario:
--                            hay respuestas buenas, aceptables y malas)
--   kind 'likert'            escala de acuerdo 1..5
--   participants.profile     perfil acumulado por dimensión
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table evaluar_questions
  add column if not exists dimension text,
  add column if not exists reverse boolean not null default false,
  add column if not exists option_scores jsonb;

-- Los ítems de personalidad no tienen respuesta correcta, así que el orden en
-- que se muestran no importa, pero sí importa poder agruparlos por rasgo.
create index if not exists idx_ev_questions_dimension
  on evaluar_questions (stage_id, dimension);

-- 'likert' se suma a los tipos permitidos sin tocar los existentes.
alter table evaluar_questions drop constraint if exists evaluar_questions_kind_check;
alter table evaluar_questions add constraint evaluar_questions_kind_check
  check (kind in ('unica', 'multiple', 'texto', 'escala', 'numero', 'likert'));

-- Perfil por dimensión: { "extraversion": { "raw": 18, "max": 25 }, ... }
alter table evaluar_participants
  add column if not exists profile jsonb not null default '{}'::jsonb;

-- De qué plantilla salió cada etapa, para poder interpretar el resultado
-- después (un puntaje sin saber qué instrumento lo produjo no dice nada).
alter table evaluar_stages
  add column if not exists template_key text;

-- ============================================================
-- Corrección con dimensiones
--
-- Reemplaza la versión de la 022. Convive lo viejo y lo nuevo: si la pregunta
-- tiene `correct` puntúa como antes, si tiene `dimension` acumula rasgo, y si
-- tiene `option_scores` reparte puntos por opción.
-- ============================================================
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
  v_profile jsonb;
  v_points numeric;
  v_item_max numeric;
  v_dim text;
  v_prev jsonb;
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

  v_profile := coalesce(v_participant.profile, '{}'::jsonb);

  for v_q in
    select * from evaluar_questions where stage_id = p_stage_id order by position
  loop
    v_value := p_answers -> v_q.id::text;
    v_points := null;
    v_item_max := null;

    -- 1) Escala de acuerdo: el propio número es el puntaje del rasgo. En un
    --    ítem inverso se da vuelta (contestar 5 en "me cuesta hablar con
    --    gente" resta extraversión, no suma).
    if v_q.kind = 'likert' then
      if v_value is not null and jsonb_typeof(v_value) = 'number' then
        -- Se extrae como texto y se castea: el casteo directo de jsonb a
        -- numeric depende de la versión de Postgres, y esto anda en todas.
        v_points := (v_value #>> '{}')::numeric;
        if v_q.reverse then
          v_points := 6 - v_points;
        end if;
      end if;
      v_item_max := 5;

    -- 2) SJT: cada opción vale distinto. No hay "la correcta", hay mejores y
    --    peores formas de resolver la situación.
    elsif v_q.option_scores is not null and v_value is not null then
      v_points := coalesce(
        (v_q.option_scores ->> (v_value #>> '{}'))::numeric,
        0
      );
      select coalesce(max(value::numeric), 0) into v_item_max
      from jsonb_each_text(v_q.option_scores) as t(key, value);

    -- 3) Conocimientos: correcto / incorrecto, como en la 022.
    elsif v_q.correct is not null then
      v_ok := (v_value is not null and v_value = v_q.correct);
      v_points := case when v_ok then v_q.weight else 0 end;
      v_item_max := v_q.weight;
      if not v_ok and v_q.knockout then
        v_knocked := true;
      end if;
    end if;

    -- El puntaje general solo suma lo que tiene una vara objetiva: aciertos
    -- de conocimientos, razonamiento y SJT (ahí sí hay respuestas mejores).
    -- La personalidad queda afuera: no existe "más puntaje" en extraversión, y
    -- meterla en un total sería inventar un ranking sin sentido.
    if v_q.kind <> 'likert' and v_item_max is not null then
      v_total := v_total + coalesce(v_points, 0);
      v_max := v_max + v_item_max;
    end if;

    -- Acumulado por dimensión.
    if v_q.dimension is not null and v_item_max is not null then
      v_dim := v_q.dimension;
      v_prev := coalesce(v_profile -> v_dim, '{"raw":0,"max":0}'::jsonb);
      v_profile := jsonb_set(
        v_profile,
        array[v_dim],
        jsonb_build_object(
          'raw', ((v_prev ->> 'raw')::numeric) + coalesce(v_points, 0),
          'max', ((v_prev ->> 'max')::numeric) + v_item_max
        )
      );
    end if;

    insert into evaluar_answers (participant_id, question_id, value, score)
    values (
      v_participant.id,
      v_q.id,
      coalesce(v_value, 'null'::jsonb),
      coalesce(v_points, 0)
    )
    on conflict (participant_id, question_id)
    do update set value = excluded.value, score = excluded.score;
  end loop;

  select count(*) into v_stage_count
  from evaluar_stages where process_id = v_participant.process_id;

  update evaluar_participants set
    score = coalesce(score, 0) + v_total,
    max_score = coalesce(max_score, 0) + v_max,
    profile = v_profile,
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

-- evaluar_load también debe entregar el perfil y el tipo de cada etapa.
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
      'profile', v_participant.profile,
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
          'template_key', s.template_key,
          'questions', coalesce((
            select jsonb_agg(
              -- Nunca se manda `correct` ni `option_scores` al navegador: la
              -- corrección es del lado del servidor.
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

grant execute on function evaluar_load(text) to anon, authenticated;
grant execute on function evaluar_submit_stage(text, uuid, jsonb) to anon, authenticated;
