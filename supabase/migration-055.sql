-- ============================================================
-- Worka — Migración 055: Evaluar · likert sin responder fuera del máximo
--
-- Decisión D-7 de docs/auditoria-evaluar/09-pendientes.md. Requiere la 054.
-- Idempotente. NO recalcula nada de lo ya rendido.
--
-- Hasta acá, un ítem likert sin responder sumaba 0 al rasgo y su máximo
-- igual (0 de 5 en la escala 1, 0 de 4 en la 2): dejarlo en blanco bajaba
-- más que contestar el mínimo. En el juicio situacional, en cambio, el ítem
-- vacío no contaba. Desde esta migración los participantes NUEVOS (escala 3)
-- tratan igual a los dos: lo no respondido queda fuera del rasgo.
--
-- Las preguntas con respuesta correcta NO cambian: sin contestar siguen
-- contando como incorrectas, porque si no alcanzaría con contestar solo las
-- fáciles para sacar 100%. El excluyente sin responder sigue descartando.
--
-- La escala 3 usa los mismos valores que la 2 (0 a 4 por ítem), así que la
-- app la lee igual que la 2.
-- ============================================================

alter table evaluar_participants
  alter column scoring_version set default 3;

-- ── La corrección, igual a la de la 054 salvo el máximo del likert ──
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

  for v_q in
    select * from evaluar_questions where stage_id = p_stage_id order by position, id
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

grant execute on function evaluar_submit_stage(text, uuid, jsonb, int) to anon, authenticated;
