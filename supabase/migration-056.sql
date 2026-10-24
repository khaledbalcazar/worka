-- ============================================================
-- Worka — Migración 056: Evaluar · formulario propio por candidato
--
-- Requiere la 055. Idempotente. NO cambia nada de lo ya rendido ni de las
-- etapas existentes: todo lo nuevo viene apagado por defecto.
--
-- Hasta acá todos los candidatos de un proceso veían las mismas preguntas,
-- en el mismo orden y con las opciones en el mismo lugar: la respuesta de la
-- 7 se pasaba por WhatsApp como "la C". Desde esta migración cada etapa puede:
--
--   shuffle_questions  mostrar las preguntas en otro orden a cada persona;
--   shuffle_options    mezclar las opciones (nunca en las escalas likert,
--                      donde el orden es parte de la pregunta);
--   draw_count         sortear N preguntas del banco de la etapa, repartidas
--                      en proporción por rasgo, con las excluyentes siempre
--                      incluidas.
--
-- El formulario de cada persona (qué preguntas, en qué orden y con qué orden
-- de opciones) se arma UNA vez, al empezar la etapa, y queda guardado en
-- evaluar_participants.stage_forms. Recargar no lo cambia, y la corrección
-- cuenta solo esas preguntas: el máximo de cada uno sale de lo que le tocó.
--
-- La corrección sigue comparando la opción elegida con `correct` por texto,
-- así que mezclar opciones no cambia ningún puntaje.
--
-- También suma el tipo de pregunta "figura" (matrices y series dibujadas):
-- la consigna va en evaluar_questions.figure y las opciones son códigos de
-- figura (ver lib/evaluar/figuras.ts).
-- ============================================================

alter table evaluar_stages
  add column if not exists shuffle_questions boolean not null default false,
  add column if not exists shuffle_options boolean not null default false,
  add column if not exists draw_count smallint;

alter table evaluar_stages drop constraint if exists evaluar_stages_draw_count_check;
alter table evaluar_stages add constraint evaluar_stages_draw_count_check
  check (draw_count is null or draw_count >= 1);

alter table evaluar_participants
  add column if not exists stage_forms jsonb not null default '{}'::jsonb;

alter table evaluar_questions
  add column if not exists figure jsonb;

alter table evaluar_questions drop constraint if exists evaluar_questions_kind_check;
alter table evaluar_questions add constraint evaluar_questions_kind_check
  check (kind in ('unica', 'multiple', 'texto', 'escala', 'numero', 'likert', 'video', 'figura'));

-- ── Empezar una etapa: ahora también arma el formulario ───────
create or replace function evaluar_begin_stage(p_token text, p_stage_id uuid)
returns jsonb
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_stage evaluar_stages;
  v_pos int;
  v_ids jsonb;
  v_opts jsonb := '{}'::jsonb;
  v_q record;
begin
  select * into v_participant
  from evaluar_participants where token = p_token
  for update;
  if not found then
    raise exception 'Token inválido';
  end if;
  if v_participant.status in ('descartado', 'completado', 'contratado') then
    raise exception 'Esta evaluación ya está cerrada';
  end if;

  select * into v_process
  from evaluar_processes where id = v_participant.process_id;
  if v_process.status <> 'activo' then
    raise exception 'Esta evaluación no está abierta';
  end if;
  if v_process.deadline_at is not null and now() > v_process.deadline_at then
    raise exception 'El plazo de esta evaluación venció';
  end if;

  v_pos := evaluar_stage_position(v_participant.process_id, p_stage_id);
  if v_pos is null or v_pos <> v_participant.stage_index then
    raise exception 'Etapa inválida';
  end if;

  select * into v_stage from evaluar_stages where id = p_stage_id;

  -- El formulario se arma una sola vez por etapa.
  if not (coalesce(v_participant.stage_forms, '{}'::jsonb) ? p_stage_id::text) then
    -- Sorteo estratificado: dentro de cada rasgo las preguntas se ordenan al
    -- azar (rn), y se toman las primeras por (rn − 0,5) / total del rasgo.
    -- Así cada rasgo aporta en proporción a su tamaño en el banco. Las
    -- excluyentes van primero: un filtro del puesto no puede quedar afuera
    -- por sorteo.
    with base as (
      select
        q.id,
        q.position,
        q.knockout,
        row_number() over (partition by coalesce(q.dimension, '') order by random()) as rn,
        count(*) over (partition by coalesce(q.dimension, '')) as cnt
      from evaluar_questions q
      where q.stage_id = p_stage_id
    ),
    elegidas as (
      select b.id, b.position
      from base b
      order by (not b.knockout), (b.rn - 0.5) / b.cnt, random()
      limit coalesce(v_stage.draw_count, 32767)
    )
    select coalesce(
      jsonb_agg(
        to_jsonb(e.id::text)
        order by case when v_stage.shuffle_questions then random() else 0 end, e.position, e.id
      ),
      '[]'::jsonb
    )
    into v_ids
    from elegidas e;

    if v_stage.shuffle_options then
      for v_q in
        select q.id, q.options
        from evaluar_questions q
        where q.stage_id = p_stage_id
          and q.kind in ('unica', 'multiple', 'figura')
          and jsonb_typeof(q.options) = 'array'
          and jsonb_array_length(q.options) > 1
          and q.id::text in (select jsonb_array_elements_text(v_ids))
      loop
        v_opts := v_opts || jsonb_build_object(
          v_q.id::text,
          (select jsonb_agg(o order by random()) from jsonb_array_elements(v_q.options) as o)
        );
      end loop;
    end if;

    update evaluar_participants
    set stage_forms = coalesce(stage_forms, '{}'::jsonb)
      || jsonb_build_object(p_stage_id::text, jsonb_build_object('q', v_ids, 'o', v_opts))
    where id = v_participant.id
    returning * into v_participant;
  end if;

  if v_participant.stage_started_for is distinct from p_stage_id
     or v_participant.stage_started_at is null then
    update evaluar_participants set
      stage_started_at = now(),
      stage_started_for = p_stage_id,
      started_at = coalesce(started_at, now()),
      status = case when status = 'invitado' then 'en_curso' else status end
    where id = v_participant.id
    returning * into v_participant;
  end if;

  return jsonb_build_object(
    'stage_id', p_stage_id,
    'started_at', v_participant.stage_started_at,
    'server_now', now()
  );
end;
$$;

-- ── Entregar: solo las preguntas del formulario ───────────────
-- Igual a la de la 055 salvo el filtro del loop.
create or replace function evaluar_submit_stage(
  p_token text,
  p_stage_id uuid,
  p_answers jsonb,
  p_seconds int default null
)
returns jsonb
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_stage evaluar_stages;
  v_pos int;
  v_total numeric(5,2) := 0;
  v_max numeric(5,2) := 0;
  v_knocked boolean := false;
  v_q record;
  v_value jsonb;
  v_ok boolean;
  v_stage_count int;
  v_profile jsonb;
  v_times jsonb;
  v_seconds int;
  v_points numeric;
  v_item_max numeric;
  v_dim text;
  v_prev jsonb;
  v_form_ids uuid[];
begin
  -- FOR UPDATE: dos entregas a la vez esperan una a la otra en vez de leer
  -- las dos el mismo stage_index y sumar las dos.
  select * into v_participant
  from evaluar_participants where token = p_token
  for update;
  if not found then
    raise exception 'Token inválido';
  end if;

  select * into v_stage from evaluar_stages
  where id = p_stage_id and process_id = v_participant.process_id;
  if not found then
    raise exception 'Etapa inválida';
  end if;

  v_pos := evaluar_stage_position(v_participant.process_id, p_stage_id);

  -- Entrega repetida (doble clic, reintento, el reloj y el botón a la vez) o
  -- evaluación ya cerrada: se devuelve el estado como está, sin volver a
  -- corregir. Es lo que hace que reintentar sea inofensivo.
  if v_participant.status in ('descartado', 'completado', 'contratado')
     or v_pos < v_participant.stage_index then
    return jsonb_build_object(
      'status', v_participant.status,
      'stage_index', v_participant.stage_index,
      'outcome_note', v_participant.outcome_note,
      'repeated', true
    );
  end if;

  select * into v_process
  from evaluar_processes where id = v_participant.process_id;
  if v_process.status <> 'activo' then
    raise exception 'Esta evaluación no está abierta';
  end if;
  -- El trigger de la 025 solo mira cuando cambia stage_index, y un
  -- excluyente no lo cambia: se chequea acá también.
  if v_process.deadline_at is not null and now() > v_process.deadline_at then
    raise exception 'El plazo de esta evaluación venció el %',
      to_char(v_process.deadline_at, 'DD/MM/YYYY');
  end if;

  if v_pos > v_participant.stage_index then
    raise exception 'Primero terminá la etapa anterior';
  end if;

  v_profile := coalesce(v_participant.profile, '{}'::jsonb);
  v_times := coalesce(v_participant.stage_times, '{}'::jsonb);

  -- Los segundos los mide el servidor cuando la etapa se empezó con
  -- evaluar_begin_stage. El número del navegador queda solo como respaldo
  -- para quien ya estaba rindiendo cuando se aplicó esta migración.
  if v_participant.stage_started_for = p_stage_id
     and v_participant.stage_started_at is not null then
    v_seconds := greatest(
      0, extract(epoch from (now() - v_participant.stage_started_at))::int
    );
  elsif p_seconds is not null then
    v_seconds := greatest(p_seconds, 0);
  end if;

  if v_seconds is not null then
    v_times := jsonb_set(v_times, array[p_stage_id::text], to_jsonb(v_seconds));
  end if;

  -- Solo las preguntas del formulario de esta persona (056). Sin
  -- formulario (etapas empezadas antes de la 056), todas las de la etapa.
  select array_agg(x::uuid) into v_form_ids
  from jsonb_array_elements_text(
    coalesce(v_participant.stage_forms, '{}'::jsonb) -> p_stage_id::text -> 'q'
  ) as x;

  for v_q in
    select * from evaluar_questions
    where stage_id = p_stage_id
      and (v_form_ids is null or id = any (v_form_ids))
    order by position, id
  loop
    v_value := p_answers -> v_q.id::text;
    -- Un null de JSON es "sin responder", igual que la clave ausente.
    if v_value = 'null'::jsonb then
      v_value := null;
    end if;
    v_points := null;
    v_item_max := null;

    -- El video lo guarda uploadVideoAnswer con la ruta del archivo. La
    -- entrega no lo toca: antes lo pisaba con el texto "video".
    if v_q.kind = 'video' then
      insert into evaluar_answers (participant_id, question_id, value, score)
      values (v_participant.id, v_q.id, 'null'::jsonb, 0)
      on conflict (participant_id, question_id) do nothing;
      continue;
    end if;

    if v_q.kind = 'likert' then
      -- Solo un entero de 1 a 5. Cualquier otra cosa cuenta como sin
      -- responder, que es como ya se trataba la pregunta vacía.
      --
      -- Escala 2 (desde la 054): el ítem vale 0..4 sobre 4, así que la
      -- respuesta más baja es 0% y la del medio 50%. Escala 1: 1..5 sobre 5,
      -- tal cual se corrigió siempre; quien ya estaba invitado sigue así.
      if v_value is not null
         and jsonb_typeof(v_value) = 'number'
         and (v_value #>> '{}')::numeric in (1, 2, 3, 4, 5) then
        v_points := (v_value #>> '{}')::numeric;
        if v_participant.scoring_version >= 2 then
          v_points := case when v_q.reverse then 5 - v_points else v_points - 1 end;
        elsif v_q.reverse then
          v_points := 6 - v_points;
        end if;
      else
        v_value := coalesce(v_value, 'null'::jsonb);
      end if;
      -- Escala 3 (desde la 055): sin responder no suma al máximo, igual que
      -- en el juicio situacional. Antes contaba 0, peor que el mínimo.
      v_item_max := case
        when v_participant.scoring_version >= 3 and v_points is null then null
        when v_participant.scoring_version >= 2 then 4
        else 5
      end;

    elsif v_q.option_scores is not null and v_value is not null then
      v_points := coalesce(
        (v_q.option_scores ->> (v_value #>> '{}'))::numeric, 0
      );
      select coalesce(max(value::numeric), 0) into v_item_max
      from jsonb_each_text(v_q.option_scores) as t(key, value);

    elsif v_q.correct is not null then
      v_ok := (v_value is not null and v_value = v_q.correct);
      v_points := case when v_ok then v_q.weight else 0 end;
      v_item_max := v_q.weight;
      if not v_ok and v_q.knockout then
        v_knocked := true;
      end if;
    end if;

    if v_q.kind <> 'likert' and v_item_max is not null then
      v_total := v_total + coalesce(v_points, 0);
      v_max := v_max + v_item_max;
    end if;

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
      v_participant.id, v_q.id, coalesce(v_value, 'null'::jsonb),
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
    stage_times = v_times,
    -- El borrador era de esta etapa y el reloj también: se limpian.
    draft = '{}'::jsonb,
    stage_started_at = null,
    stage_started_for = null,
    started_at = coalesce(started_at, now()),
    stage_index = case
      when v_knocked then stage_index
      else least(v_pos + 1, v_stage_count)
    end,
    status = case
      when v_knocked then 'descartado'
      when v_pos + 1 >= v_stage_count then 'completado'
      else 'en_curso'
    end,
    completed_at = case
      when v_knocked or v_pos + 1 >= v_stage_count then now()
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
    'outcome_note', v_participant.outcome_note,
    'repeated', false
  );
end;
$$;

-- ── evaluar_load: el formulario de cada uno ───────────────────
-- Misma salida que la 053 más, por etapa, `question_count` y, por pregunta,
-- `figure`. Las etapas con azar que la persona todavía no empezó no mandan
-- sus preguntas (solo cuántas son): el banco completo no viaja al navegador.
create or replace function evaluar_load(p_token text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_company companies;
  v_stages jsonb := '[]'::jsonb;
  v_s record;
  v_form jsonb;
  v_questions jsonb;
  v_count int;
  v_result jsonb;
begin
  select * into v_participant
  from evaluar_participants where token = p_token;
  if not found then
    return null;
  end if;

  select * into v_process
  from evaluar_processes where id = v_participant.process_id;

  select * into v_company from companies where id = v_process.company_id;

  for v_s in
    select * from evaluar_stages s
    where s.process_id = v_process.id
    order by s.position, s.created_at, s.id
  loop
    v_form := coalesce(v_participant.stage_forms, '{}'::jsonb) -> v_s.id::text;

    if v_form is not null then
      select
        coalesce(jsonb_agg(
          jsonb_build_object(
            'id', q.id,
            'kind', q.kind,
            'max_seconds', q.max_seconds,
            'text', q.text,
            'options', coalesce(v_form -> 'o' -> q.id::text, q.options),
            'figure', q.figure
          ) order by f.ord
        ), '[]'::jsonb),
        count(*)
      into v_questions, v_count
      from jsonb_array_elements_text(v_form -> 'q') with ordinality as f(qid, ord)
      join evaluar_questions q on q.id = f.qid::uuid;

    elsif v_s.shuffle_questions or v_s.shuffle_options or v_s.draw_count is not null then
      v_questions := '[]'::jsonb;
      select count(*) into v_count from evaluar_questions q where q.stage_id = v_s.id;
      if v_s.draw_count is not null then
        v_count := least(v_count, v_s.draw_count);
      end if;

    else
      select
        coalesce(jsonb_agg(
          jsonb_build_object(
            'id', q.id,
            'kind', q.kind,
            'max_seconds', q.max_seconds,
            'text', q.text,
            'options', q.options,
            'figure', q.figure
          ) order by q.position, q.id
        ), '[]'::jsonb),
        count(*)
      into v_questions, v_count
      from evaluar_questions q
      where q.stage_id = v_s.id;
    end if;

    v_stages := v_stages || jsonb_build_array(jsonb_build_object(
      'id', v_s.id,
      'title', v_s.title,
      'description', v_s.description,
      'kind', v_s.kind,
      'minutes', v_s.minutes,
      'intro', v_s.intro,
      'demo', v_s.demo,
      'timed', v_s.timed,
      'template_key', v_s.template_key,
      'question_count', v_count,
      'questions', v_questions
    ));
  end loop;

  select jsonb_build_object(
    'server_now', now(),
    'participant', jsonb_build_object(
      'id', v_participant.id,
      'full_name', v_participant.full_name,
      'email', v_participant.email,
      'phone', v_participant.phone,
      'city', v_participant.city,
      'cv_url', v_participant.cv_url,
      'status', v_participant.status,
      'stage_index', v_participant.stage_index,
      'score', v_participant.score,
      'max_score', v_participant.max_score,
      'profile', v_participant.profile,
      'draft', v_participant.draft,
      'outcome_note', v_participant.outcome_note,
      'completed_at', v_participant.completed_at,
      'stage_started_at', v_participant.stage_started_at,
      'stage_started_for', v_participant.stage_started_for
    ),
    'process', jsonb_build_object(
      'id', v_process.id,
      'title', v_process.title,
      'description', v_process.description,
      'closing_message', v_process.closing_message,
      'status', v_process.status,
      'theme', v_process.theme,
      'deadline_at', v_process.deadline_at,
      'brand_color', v_process.brand_color,
      'company', v_company.trade_name,
      'logo', case
        when v_process.use_company_brand then v_company.logo_url else null
      end
    ),
    'stages', v_stages,
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
grant execute on function evaluar_begin_stage(text, uuid) to anon, authenticated;
grant execute on function evaluar_submit_stage(text, uuid, jsonb, int) to anon, authenticated;
