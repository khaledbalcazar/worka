-- ============================================================
-- Prueba de la migración 055 (likert sin responder fuera del máximo)
--
-- SOLO para una base con la 053, la 054 y la 055 aplicadas. Corre dentro de
-- una transacción que termina en ROLLBACK, con datos ficticios.
--
-- Casos y resultado esperado (a mano):
--   A. Un participante nuevo nace con scoring_version = 3.
--   B. Escala 3: likert 4, inverso 2 y uno sin responder → 3 + 3 = 6 sobre 8
--      (el vacío no suma al máximo).
--   C. Escala 2 (forzada): lo mismo → 6 sobre 12 (el vacío cuenta 0 de 4).
--   D. Escala 3, pregunta con correcta sin responder → sigue sumando al
--      máximo: 0 sobre 2.
-- ============================================================
begin;

do $$
declare
  v_company uuid := gen_random_uuid();
  v_process uuid;
  v_stage uuid;
  v_l1 uuid; v_l2 uuid; v_l3 uuid; v_c1 uuid;
  v_t3 text; v_t2 text;
  v_p3 uuid; v_p2 uuid;
  v_p evaluar_participants;
begin
  if (select column_default from information_schema.columns
      where table_name = 'evaluar_participants' and column_name = 'scoring_version')
     is distinct from '3' then
    raise exception 'La migración 055 no está aplicada en esta base.';
  end if;

  insert into auth.users (id, email) values (v_company, 'auditoria-055@example.invalid');
  insert into profiles (id, role) values (v_company, 'company')
    on conflict (id) do update set role = 'company';
  insert into companies (id, company_name, trade_name, ruc, location_city)
    values (v_company, 'Prueba Vacíos SA', 'Prueba Vacíos', '0000000-2', 'Asunción');

  insert into evaluar_processes (company_id, title, status)
    values (v_company, 'Proceso de prueba 055', 'activo') returning id into v_process;
  insert into evaluar_stages (process_id, position, title)
    values (v_process, 0, 'Rasgos') returning id into v_stage;
  insert into evaluar_questions (stage_id, position, kind, text, dimension)
    values (v_stage, 0, 'likert', 'L1', 'teson') returning id into v_l1;
  insert into evaluar_questions (stage_id, position, kind, text, dimension, reverse)
    values (v_stage, 1, 'likert', 'L2', 'teson', true) returning id into v_l2;
  insert into evaluar_questions (stage_id, position, kind, text, dimension)
    values (v_stage, 2, 'likert', 'L3', 'teson') returning id into v_l3;
  insert into evaluar_questions (stage_id, position, kind, text, options, correct, weight)
    values (v_stage, 3, 'unica', 'C1', '["A","B"]', '"A"', 2) returning id into v_c1;

  -- A
  insert into evaluar_participants (process_id, full_name)
    values (v_process, 'Persona Nueva') returning id, token into v_p3, v_t3;
  select * into v_p from evaluar_participants where id = v_p3;
  if v_p.scoring_version <> 3 then
    raise exception 'A: el participante nuevo quedó con escala %', v_p.scoring_version;
  end if;
  raise notice 'A OK';

  -- B y D
  perform evaluar_submit_stage(v_t3, v_stage, jsonb_build_object(v_l1::text, 4, v_l2::text, 2), null);
  select * into v_p from evaluar_participants where id = v_p3;
  if (v_p.profile -> 'teson' ->> 'raw')::numeric <> 6 or (v_p.profile -> 'teson' ->> 'max')::numeric <> 8 then
    raise exception 'B: esperaba 6/8 en escala 3, salió %', v_p.profile -> 'teson';
  end if;
  raise notice 'B OK';
  if v_p.score <> 0 or v_p.max_score <> 2 then
    raise exception 'D: la correcta sin responder debía contar 0/2, salió %/%', v_p.score, v_p.max_score;
  end if;
  raise notice 'D OK';

  -- C
  insert into evaluar_participants (process_id, full_name, scoring_version)
    values (v_process, 'Persona Escala 2', 2) returning id, token into v_p2, v_t2;
  perform evaluar_submit_stage(v_t2, v_stage, jsonb_build_object(v_l1::text, 4, v_l2::text, 2), null);
  select * into v_p from evaluar_participants where id = v_p2;
  if (v_p.profile -> 'teson' ->> 'raw')::numeric <> 6 or (v_p.profile -> 'teson' ->> 'max')::numeric <> 12 then
    raise exception 'C: esperaba 6/12 en escala 2, salió %', v_p.profile -> 'teson';
  end if;
  raise notice 'C OK';
end;
$$;

rollback;
