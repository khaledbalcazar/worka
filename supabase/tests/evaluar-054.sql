-- ============================================================
-- Prueba de la migración 054 (escala likert 0 a 4 para candidatos nuevos)
--
-- SOLO para una base con la 053 y la 054 aplicadas. Corre dentro de una
-- transacción que termina en ROLLBACK, con datos ficticios.
--
-- Casos y resultado esperado (a mano):
--   A. Un participante nuevo nace con scoring_version = 2.
--   B. v2: likert 4 y inverso 2 → (4−1) + (5−2) = 6 sobre 8 (75%).
--   C. v1 (forzado): las mismas respuestas → 4 + (6−2) = 8 sobre 10 (80%).
-- ============================================================
begin;

do $$
declare
  v_company uuid := gen_random_uuid();
  v_process uuid;
  v_stage uuid;
  v_l1 uuid; v_l2 uuid;
  v_t2 text; v_t1 text;
  v_p2 uuid; v_p1 uuid;
  v_p evaluar_participants;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'evaluar_participants' and column_name = 'scoring_version'
  ) then
    raise exception 'La migración 054 no está aplicada en esta base.';
  end if;

  insert into auth.users (id, email) values (v_company, 'auditoria-054@example.invalid');
  insert into profiles (id, role) values (v_company, 'company')
    on conflict (id) do update set role = 'company';
  insert into companies (id, company_name, trade_name, ruc, location_city)
    values (v_company, 'Prueba Escala SA', 'Prueba Escala', '0000000-1', 'Asunción');

  insert into evaluar_processes (company_id, title, status)
    values (v_company, 'Proceso de prueba 054', 'activo') returning id into v_process;
  insert into evaluar_stages (process_id, position, title)
    values (v_process, 0, 'Rasgos') returning id into v_stage;
  insert into evaluar_questions (stage_id, position, kind, text, dimension)
    values (v_stage, 0, 'likert', 'L1', 'teson') returning id into v_l1;
  insert into evaluar_questions (stage_id, position, kind, text, dimension, reverse)
    values (v_stage, 1, 'likert', 'L2', 'teson', true) returning id into v_l2;

  -- A
  insert into evaluar_participants (process_id, full_name)
    values (v_process, 'Persona Nueva') returning id, token into v_p2, v_t2;
  select * into v_p from evaluar_participants where id = v_p2;
  if v_p.scoring_version <> 2 then
    raise exception 'A: el participante nuevo quedó con escala %', v_p.scoring_version;
  end if;
  raise notice 'A OK';

  -- B
  perform evaluar_submit_stage(v_t2, v_stage, jsonb_build_object(v_l1::text, 4, v_l2::text, 2), null);
  select * into v_p from evaluar_participants where id = v_p2;
  if (v_p.profile -> 'teson' ->> 'raw')::numeric <> 6 or (v_p.profile -> 'teson' ->> 'max')::numeric <> 8 then
    raise exception 'B: esperaba 6/8 en escala 2, salió %', v_p.profile -> 'teson';
  end if;
  raise notice 'B OK';

  -- C
  insert into evaluar_participants (process_id, full_name, scoring_version)
    values (v_process, 'Persona Anterior', 1) returning id, token into v_p1, v_t1;
  perform evaluar_submit_stage(v_t1, v_stage, jsonb_build_object(v_l1::text, 4, v_l2::text, 2), null);
  select * into v_p from evaluar_participants where id = v_p1;
  if (v_p.profile -> 'teson' ->> 'raw')::numeric <> 8 or (v_p.profile -> 'teson' ->> 'max')::numeric <> 10 then
    raise exception 'C: esperaba 8/10 en escala 1, salió %', v_p.profile -> 'teson';
  end if;
  raise notice 'C OK';
end;
$$;

rollback;
