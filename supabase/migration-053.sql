-- ============================================================
-- Worka — Migración 053: Evaluar · integridad de la entrega y del reloj
--
-- Sale de la auditoría de docs/auditoria-evaluar (hallazgos EV-01 a EV-07).
-- Requiere 022 a 030 aplicadas. Idempotente. Correr en el SQL Editor y
-- después probar con supabase/tests/evaluar-053.sql (ver ese archivo).
--
-- Qué corrige, en una línea cada uno:
--
-- 1. Una etapa se podía entregar más de una vez y cada entrega SUMABA al
--    puntaje y avanzaba de etapa: un doble clic, un reintento por red o el
--    reloj que vence justo cuando se toca "Terminar" contaban doble y
--    salteaban la etapa siguiente. También se podía mandar cualquier etapa
--    del proceso, en cualquier orden, desde la consola.
-- 2. Se podía rendir un proceso en borrador o cerrado: la función no miraba
--    el estado del proceso, solo el token.
-- 3. El cronómetro era solo del navegador: recargar la página lo reiniciaba,
--    y los segundos que se guardaban los mandaba el propio candidato.
-- 4. Entregar una etapa con video pisaba la respuesta del video (la ruta del
--    archivo) con el texto "video": la empresa veía "todavía no hay video".
-- 5. Un likert aceptaba cualquier número: un 9 sumaba 9 de 5 al rasgo.
-- 6. La empresa no podía escribir en la línea de tiempo del candidato (no
--    había policy de insert), así que las decisiones nunca le llegaban.
-- 7. Quedaba viva la versión de 3 argumentos de la 023, ejecutable por anon
--    y con la corrección vieja.
--
-- Lo que NO cambia a propósito: cómo se puntúa un ítem válido. Los
-- resultados ya guardados no se recalculan.
-- ============================================================

-- ── 1. Columnas del reloj del servidor ───────────────────────
-- Cuándo empezó la etapa en curso y cuál era. Se guardan juntas porque una
-- marca de tiempo sin la etapa no dice si sigue valiendo.
alter table evaluar_participants
  add column if not exists stage_started_at timestamptz,
  add column if not exists stage_started_for uuid;

-- ── 2. La empresa escribe en la línea de tiempo ───────────────
drop policy if exists ev_events_company_insert on evaluar_events;
create policy ev_events_company_insert on evaluar_events
  for insert with check (
    exists (
      select 1
      from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where pa.id = participant_id
        and (p.company_id = auth.uid() or fn_current_role() = 'admin')
    )
  );

-- ── 3. Fuera la versión vieja de la corrección ────────────────
drop function if exists evaluar_submit_stage(text, uuid, jsonb);

-- ── 4. Posición de una etapa dentro de su proceso ─────────────
-- El orden es (position, created_at, id). Solo position no alcanza: borrar
-- y agregar etapas deja posiciones repetidas, y con un empate el orden que
-- ve el candidato podía no ser el que corrige la base.
create or replace function evaluar_stage_position(p_process uuid, p_stage uuid)
returns int
language sql stable security definer
set search_path = public
as $$
  select (t.rn - 1)::int
  from (
    select s.id, row_number() over (order by s.position, s.created_at, s.id) as rn
    from evaluar_stages s
    where s.process_id = p_process
  ) t
  where t.id = p_stage;
$$;

revoke all on function evaluar_stage_position(uuid, uuid) from public, anon, authenticated;

-- ── 5. Empezar una etapa ──────────────────────────────────────
-- La llama el navegador cuando el candidato toca "Empezar" en la etapa. Si
-- la etapa ya había empezado, devuelve la hora original: recargar no
-- reinicia el reloj.
create or replace function evaluar_begin_stage(p_token text, p_stage_id uuid)
returns jsonb
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_pos int;
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

-- ── 6. Entregar una etapa ─────────────────────────────────────
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
      -- responder (0 de 5), que es como ya se trataba la pregunta vacía.
      if v_value is not null
         and jsonb_typeof(v_value) = 'number'
         and (v_value #>> '{}')::numeric in (1, 2, 3, 4, 5) then
        v_points := (v_value #>> '{}')::numeric;
        if v_q.reverse then
          v_points := 6 - v_points;
        end if;
      else
        v_value := coalesce(v_value, 'null'::jsonb);
      end if;
      v_item_max := 5;

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

-- ── 7. Empezar la evaluación y el borrador: solo con proceso activo ─
create or replace function evaluar_start(p_token text)
returns void
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_status text;
begin
  select * into v_participant
  from evaluar_participants where token = p_token;
  if not found then
    raise exception 'Token inválido';
  end if;

  select status into v_status
  from evaluar_processes where id = v_participant.process_id;
  if v_status <> 'activo' then
    raise exception 'Esta evaluación no está abierta';
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

create or replace function evaluar_save_draft(p_token text, p_answers jsonb)
returns void
language plpgsql volatile security definer
set search_path = public
as $$
begin
  update evaluar_participants pa
  set draft = coalesce(p_answers, '{}'::jsonb)
  where pa.token = p_token
    and pa.status not in ('descartado', 'completado', 'contratado')
    and exists (
      select 1 from evaluar_processes p
      where p.id = pa.process_id and p.status = 'activo'
    );
end;
$$;

-- ── 8. evaluar_load: reloj del servidor y orden con desempate ──
-- Misma función que dejó la 030, con tres datos más (stage_started_at,
-- stage_started_for y server_now) y el orden de etapas con desempate.
create or replace function evaluar_load(p_token text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_participant evaluar_participants;
  v_process evaluar_processes;
  v_company companies;
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
    'stages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', s.title,
          'description', s.description,
          'kind', s.kind,
          'minutes', s.minutes,
          'intro', s.intro,
          'demo', s.demo,
          'timed', s.timed,
          'template_key', s.template_key,
          'questions', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', q.id,
                'kind', q.kind,
                'max_seconds', q.max_seconds,
                'text', q.text,
                'options', q.options
              ) order by q.position, q.id
            )
            from evaluar_questions q where q.stage_id = s.id
          ), '[]'::jsonb)
        ) order by s.position, s.created_at, s.id
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
grant execute on function evaluar_begin_stage(text, uuid) to anon, authenticated;
grant execute on function evaluar_submit_stage(text, uuid, jsonb, int) to anon, authenticated;
grant execute on function evaluar_start(text) to anon, authenticated;
grant execute on function evaluar_save_draft(text, jsonb) to anon, authenticated;
