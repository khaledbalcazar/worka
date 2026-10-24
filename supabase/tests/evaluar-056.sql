-- ============================================================
-- Prueba de la migración 056 (formulario propio por candidato)
--
-- SOLO para una base con 053 a 056 aplicadas. Corre dentro de una
-- transacción que termina en ROLLBACK, con datos ficticios.
--
-- Casos y resultado esperado (a mano):
--   A. Etapa con 10 likert (6 de "apertura" y 4 de "teson"), sortea 5:
--      el formulario tiene 5 preguntas, 3 de apertura y 2 de tesón
--      (proporción 6:4; ver el modelo sortearFormulario).
--   B. Antes de empezar, evaluar_load no manda las preguntas de esa etapa,
--      solo question_count = 5. Después de empezar, manda exactamente esas 5.
--   C. Empezar otra vez (recargar) no cambia el formulario.
--   D. Entregar respuestas para las 10: solo cuentan las 5 del formulario.
--      Escala 3, todas en 5 → 5 × 4 = 20 sobre 20 en total de rasgos.
--   E. Etapa con una excluyente y 9 más, sortea 2: la excluyente está.
--   F. Opciones mezcladas: el formulario guarda una permutación de las
--      mismas opciones.
-- ============================================================
begin;

do $$
declare
  v_company uuid := gen_random_uuid();
  v_process uuid;
  v_s1 uuid; v_s2 uuid;
  v_token text;
  v_pid uuid;
  v_form jsonb;
  v_form2 jsonb;
  v_load jsonb;
  v_answers jsonb := '{}'::jsonb;
  v_q record;
  v_knock uuid;
  v_p evaluar_participants;
  v_raw numeric := 0;
  v_max numeric := 0;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'evaluar_participants' and column_name = 'stage_forms'
  ) then
    raise exception 'La migración 056 no está aplicada en esta base.';
  end if;

  insert into auth.users (id, email) values (v_company, 'auditoria-056@example.invalid');
  insert into profiles (id, role) values (v_company, 'company')
    on conflict (id) do update set role = 'company';
  insert into companies (id, company_name, trade_name, ruc, location_city)
    values (v_company, 'Prueba Azar SA', 'Prueba Azar', '0000000-3', 'Asunción');

  insert into evaluar_processes (company_id, title, status)
    values (v_company, 'Proceso de prueba 056', 'activo') returning id into v_process;

  insert into evaluar_stages (process_id, position, title, draw_count, shuffle_questions)
    values (v_process, 0, 'Banco de rasgos', 5, true) returning id into v_s1;
  for i in 1..6 loop
    insert into evaluar_questions (stage_id, position, kind, text, dimension)
      values (v_s1, i, 'likert', 'A' || i, 'apertura');
  end loop;
  for i in 1..4 loop
    insert into evaluar_questions (stage_id, position, kind, text, dimension)
      values (v_s1, 10 + i, 'likert', 'T' || i, 'teson');
  end loop;

  insert into evaluar_stages (process_id, position, title, draw_count, shuffle_options)
    values (v_process, 1, 'Filtro', 2, true) returning id into v_s2;
  insert into evaluar_questions (stage_id, position, kind, text, options, correct, knockout)
    values (v_s2, 0, 'unica', 'Excluyente', '["Sí","No"]', '"Sí"', true) returning id into v_knock;
  for i in 1..9 loop
    insert into evaluar_questions (stage_id, position, kind, text, options, correct)
      values (v_s2, i, 'unica', 'P' || i, '["A","B","C","D"]', '"A"');
  end loop;

  insert into evaluar_participants (process_id, full_name)
    values (v_process, 'Persona Ficticia') returning id, token into v_pid, v_token;

  -- B (antes)
  v_load := evaluar_load(v_token);
  if jsonb_array_length(v_load -> 'stages' -> 0 -> 'questions') <> 0
     or (v_load -> 'stages' -> 0 ->> 'question_count')::int <> 5 then
    raise exception 'B: antes de empezar se mandaron preguntas o la cantidad no es 5: %', v_load -> 'stages' -> 0;
  end if;

  perform evaluar_start(v_token);
  perform evaluar_begin_stage(v_token, v_s1);
  select stage_forms -> v_s1::text into v_form from evaluar_participants where id = v_pid;

  -- A
  if jsonb_array_length(v_form -> 'q') <> 5 then
    raise exception 'A: el formulario tiene % preguntas', jsonb_array_length(v_form -> 'q');
  end if;
  if (select count(*) from evaluar_questions
      where id::text in (select jsonb_array_elements_text(v_form -> 'q')) and dimension = 'apertura') <> 3 then
    raise exception 'A: esperaba 3 de apertura en %', v_form -> 'q';
  end if;
  raise notice 'A OK';

  -- B (después)
  v_load := evaluar_load(v_token);
  if jsonb_array_length(v_load -> 'stages' -> 0 -> 'questions') <> 5 then
    raise exception 'B: después de empezar no llegaron las 5 preguntas';
  end if;
  raise notice 'B OK';

  -- C
  perform evaluar_begin_stage(v_token, v_s1);
  select stage_forms -> v_s1::text into v_form2 from evaluar_participants where id = v_pid;
  if v_form2 is distinct from v_form then
    raise exception 'C: el formulario cambió al empezar de nuevo';
  end if;
  raise notice 'C OK';

  -- D
  for v_q in select id from evaluar_questions where stage_id = v_s1 loop
    v_answers := v_answers || jsonb_build_object(v_q.id::text, 5);
  end loop;
  perform evaluar_submit_stage(v_token, v_s1, v_answers, null);
  select * into v_p from evaluar_participants where id = v_pid;
  select coalesce(sum((value ->> 'raw')::numeric), 0), coalesce(sum((value ->> 'max')::numeric), 0)
    into v_raw, v_max
    from jsonb_each(v_p.profile);
  if v_raw <> 20 or v_max <> 20 then
    raise exception 'D: esperaba 20/20 (solo las 5 del formulario), salió %/%', v_raw, v_max;
  end if;
  raise notice 'D OK';

  -- E y F
  perform evaluar_begin_stage(v_token, v_s2);
  select stage_forms -> v_s2::text into v_form from evaluar_participants where id = v_pid;
  if not (v_form -> 'q') ? v_knock::text then
    raise exception 'E: la excluyente quedó fuera del sorteo: %', v_form -> 'q';
  end if;
  raise notice 'E OK';
  if (select array_agg(x order by x) from jsonb_array_elements_text(v_form -> 'o' -> v_knock::text) as x)
     is distinct from array['No', 'Sí'] then
    raise exception 'F: las opciones mezcladas no son las mismas: %', v_form -> 'o';
  end if;
  raise notice 'F OK';
end;
$$;

rollback;
