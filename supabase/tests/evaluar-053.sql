-- ============================================================
-- Prueba de la migración 053 (Evaluar · entrega y reloj)
--
-- SOLO para una base local o de staging con la 053 aplicada. Todo corre
-- dentro de una transacción que termina en ROLLBACK: no deja nada escrito.
-- Usa datos ficticios (empresa "Prueba Auditoría", RUC 0000000-0).
--
-- Cada bloque imprime OK o lanza una excepción con lo que falló. Si llega
-- al final sin excepción, pasaron todos los casos.
--
-- Casos y resultado esperado (calculado a mano):
--   A. Proceso en borrador: evaluar_start y la entrega se rechazan.
--   B. Etapa 1 (2 preguntas con correcta, pesos 2 y 1; responde bien la de
--      peso 2): score 2 / max 3.
--   C. Repetir la entrega de la etapa 1: no suma; sigue 2 / 3, stage_index 1.
--   D. Mandar la etapa 3 estando en la 2: "Primero terminá la etapa anterior".
--   E. Etapa 2 con likert 9 (fuera de rango) e inverso 2: rasgo 4 / 10.
--   F. Etapa 3 con video ya subido: la ruta del video sigue intacta.
--   G. La empresa dueña puede insertar en evaluar_events (policy nueva).
-- ============================================================
begin;

do $$
declare
  v_company uuid := gen_random_uuid();
  v_process uuid;
  v_s1 uuid; v_s2 uuid; v_s3 uuid;
  v_q1 uuid; v_q2 uuid; v_l1 uuid; v_l2 uuid; v_v1 uuid;
  v_token text;
  v_pid uuid;
  v_r jsonb;
  v_p evaluar_participants;
  v_ok boolean;
  v_err text;
begin
  -- Antes que nada: ¿está aplicada la 053? Sin ella todos los casos fallan
  -- con mensajes que confunden (el primero es «evaluar_start aceptó un
  -- borrador», porque la versión vieja no mira el estado del proceso).
  if not exists (select 1 from pg_proc where proname = 'evaluar_begin_stage')
     or not exists (
       select 1 from information_schema.columns
       where table_name = 'evaluar_participants' and column_name = 'stage_started_at'
     ) then
    raise exception 'La migración 053 no está aplicada en esta base: corré supabase/migration-053.sql y después este script.';
  end if;
  if pg_get_functiondef('evaluar_start(text)'::regprocedure) not like '%no está abierta%' then
    raise exception 'evaluar_start es la versión vieja (sin chequeo de estado): volvé a correr la sección 7 de la 053.';
  end if;

  insert into auth.users (id, email) values (v_company, 'auditoria-053@example.invalid');
  insert into profiles (id, role) values (v_company, 'company')
    on conflict (id) do update set role = 'company';
  insert into companies (id, company_name, trade_name, ruc, location_city)
    values (v_company, 'Prueba Auditoría SA', 'Prueba Auditoría', '0000000-0', 'Asunción');

  insert into evaluar_processes (company_id, title, status)
    values (v_company, 'Proceso de prueba 053', 'borrador')
    returning id into v_process;

  insert into evaluar_stages (process_id, position, title) values (v_process, 0, 'Uno') returning id into v_s1;
  insert into evaluar_stages (process_id, position, title) values (v_process, 1, 'Dos') returning id into v_s2;
  insert into evaluar_stages (process_id, position, title) values (v_process, 2, 'Tres') returning id into v_s3;

  insert into evaluar_questions (stage_id, position, kind, text, options, correct, weight)
    values (v_s1, 0, 'unica', 'P1', '["A","B"]', '"B"', 2) returning id into v_q1;
  insert into evaluar_questions (stage_id, position, kind, text, options, correct, weight)
    values (v_s1, 1, 'unica', 'P2', '["A","B"]', '"A"', 1) returning id into v_q2;
  insert into evaluar_questions (stage_id, position, kind, text, dimension)
    values (v_s2, 0, 'likert', 'L1', 'teson') returning id into v_l1;
  insert into evaluar_questions (stage_id, position, kind, text, dimension, reverse)
    values (v_s2, 1, 'likert', 'L2', 'teson', true) returning id into v_l2;
  insert into evaluar_questions (stage_id, position, kind, text)
    values (v_s3, 0, 'video', 'V1') returning id into v_v1;

  insert into evaluar_participants (process_id, full_name)
    values (v_process, 'Persona Ficticia') returning id, token into v_pid, v_token;

  -- A. Borrador
  v_ok := false;
  v_err := '(no lanzó error)';
  begin
    perform evaluar_start(v_token);
  exception when others then
    v_err := sqlerrm;
    v_ok := sqlerrm like '%no está abierta%';
  end;
  if not v_ok then raise exception 'A: evaluar_start aceptó un borrador. Respuesta: %', v_err; end if;
  v_ok := false;
  v_err := '(no lanzó error)';
  begin
    perform evaluar_submit_stage(v_token, v_s1, jsonb_build_object(v_q1::text, 'B'), null);
  exception when others then
    v_err := sqlerrm;
    v_ok := sqlerrm like '%no está abierta%';
  end;
  if not v_ok then raise exception 'A: la entrega aceptó un borrador. Respuesta: %', v_err; end if;
  raise notice 'A OK';

  update evaluar_processes set status = 'activo' where id = v_process;

  -- B. Etapa 1
  perform evaluar_begin_stage(v_token, v_s1);
  v_r := evaluar_submit_stage(
    v_token, v_s1, jsonb_build_object(v_q1::text, 'B', v_q2::text, 'B'), 999
  );
  select * into v_p from evaluar_participants where id = v_pid;
  if v_p.score <> 2 or v_p.max_score <> 3 or v_p.stage_index <> 1 then
    raise exception 'B: esperaba 2/3 en etapa 1, salió %/% en %', v_p.score, v_p.max_score, v_p.stage_index;
  end if;
  -- El tiempo lo midió el servidor, no son los 999 que mandó el navegador.
  if (v_p.stage_times ->> v_s1::text)::int >= 999 then
    raise exception 'B: se guardó el tiempo del navegador';
  end if;
  raise notice 'B OK';

  -- C. Repetida
  v_r := evaluar_submit_stage(v_token, v_s1, jsonb_build_object(v_q1::text, 'B'), null);
  select * into v_p from evaluar_participants where id = v_pid;
  if v_p.score <> 2 or v_p.max_score <> 3 or v_p.stage_index <> 1
     or (v_r ->> 'repeated')::boolean is not true then
    raise exception 'C: la entrega repetida volvió a sumar (%/% en %)', v_p.score, v_p.max_score, v_p.stage_index;
  end if;
  raise notice 'C OK';

  -- D. Fuera de orden
  v_ok := false;
  v_err := '(no lanzó error)';
  begin
    perform evaluar_submit_stage(v_token, v_s3, '{}'::jsonb, null);
  exception when others then
    v_err := sqlerrm;
    v_ok := sqlerrm like '%etapa anterior%';
  end;
  if not v_ok then raise exception 'D: aceptó una etapa salteada. Respuesta: %', v_err; end if;
  raise notice 'D OK';

  -- E. Likert fuera de rango + inverso
  v_r := evaluar_submit_stage(
    v_token, v_s2, jsonb_build_object(v_l1::text, 9, v_l2::text, 2), null
  );
  select * into v_p from evaluar_participants where id = v_pid;
  -- L1 = 9 → sin responder (0 de 5); L2 inverso 2 → 4 de 5. Total 4 / 10.
  if (v_p.profile -> 'teson' ->> 'raw')::numeric <> 4
     or (v_p.profile -> 'teson' ->> 'max')::numeric <> 10 then
    raise exception 'E: esperaba teson 4/10, salió %', v_p.profile -> 'teson';
  end if;
  raise notice 'E OK';

  -- F. Video
  insert into evaluar_answers (participant_id, question_id, value, score)
    values (v_pid, v_v1, '{"video":"x/y.webm","type":"video/webm"}', 0);
  v_r := evaluar_submit_stage(v_token, v_s3, jsonb_build_object(v_v1::text, 'video'), null);
  if (select value ->> 'video' from evaluar_answers where participant_id = v_pid and question_id = v_v1)
     is distinct from 'x/y.webm' then
    raise exception 'F: la entrega pisó la ruta del video';
  end if;
  select * into v_p from evaluar_participants where id = v_pid;
  if v_p.status <> 'completado' then
    raise exception 'F: esperaba completado, quedó %', v_p.status;
  end if;
  raise notice 'F OK';

  -- G. Policy de eventos para la empresa dueña
  perform set_config('request.jwt.claims', json_build_object('sub', v_company)::text, true);
  set local role authenticated;
  insert into evaluar_events (participant_id, kind, message)
    values (v_pid, 'finalista', 'Pasaste a la etapa final del proceso.');
  reset role;
  raise notice 'G OK';
end;
$$;

rollback;
