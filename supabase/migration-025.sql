-- ============================================================
-- Worka — Migración 025: marca, borradores, fecha límite y equipo
--
-- Cuatro cosas que faltaban:
--
-- 1. La evaluación se veía siempre igual, con la marca de Worka. Ahora toma el
--    logo y el color de la empresa que evalúa: el candidato siente que está
--    con el empleador y no en una plataforma ajena, y eso sube la confianza.
-- 2. Las respuestas se guardaban recién al terminar la etapa. Si se cortaba el
--    internet en la pregunta 20 de 25, se perdían las 20. Ahora hay borrador.
-- 3. No había fecha de cierre, así que un proceso quedaba abierto para siempre.
-- 4. Evaluaba una sola persona: la dueña de la cuenta.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table evaluar_processes
  add column if not exists theme text not null default 'sobrio'
    check (theme in ('sobrio', 'moderno', 'calido')),
  -- Vacío = se usa el color de Worka.
  add column if not exists brand_color text,
  add column if not exists use_company_brand boolean not null default true,
  add column if not exists deadline_at timestamptz;

alter table evaluar_participants
  -- Respuestas a medio hacer de la etapa en curso.
  add column if not exists draft jsonb not null default '{}'::jsonb,
  add column if not exists cv_url text,
  add column if not exists city text,
  add column if not exists reminded_at timestamptz;

-- ── Equipo evaluador ─────────────────────────────────────────
-- Que el jefe del área y RRHH puntúen por separado. La empresa dueña siempre
-- tiene acceso; esta tabla suma a los demás.
create table if not exists evaluar_process_members (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references evaluar_processes (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (process_id, user_id)
);

create index if not exists idx_ev_members_process
  on evaluar_process_members (process_id);
create index if not exists idx_ev_members_user
  on evaluar_process_members (user_id);

alter table evaluar_process_members enable row level security;

drop policy if exists ev_members_owner on evaluar_process_members;
create policy ev_members_owner on evaluar_process_members
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

-- Cada evaluador ve en qué procesos lo sumaron.
drop policy if exists ev_members_self on evaluar_process_members;
create policy ev_members_self on evaluar_process_members
  for select using (user_id = auth.uid());

-- ¿Puede este usuario trabajar en este proceso? Es dueño o está en el equipo.
-- Va como función para no repetir el mismo EXISTS en cada policy.
create or replace function fn_evaluar_can_access(p_process uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from evaluar_processes p
    where p.id = p_process
      and (
        p.company_id = auth.uid()
        or fn_current_role() = 'admin'
        or exists (
          select 1 from evaluar_process_members m
          where m.process_id = p.id and m.user_id = auth.uid()
        )
      )
  );
$$;

grant execute on function fn_evaluar_can_access(uuid) to authenticated;

-- Los del equipo pueden ver el proceso, sus candidatos y sus notas, y dejar
-- las propias. Editar el proceso sigue siendo solo de la empresa dueña.
drop policy if exists ev_processes_team_read on evaluar_processes;
create policy ev_processes_team_read on evaluar_processes
  for select using (fn_evaluar_can_access(id));

drop policy if exists ev_participants_team_read on evaluar_participants;
create policy ev_participants_team_read on evaluar_participants
  for select using (fn_evaluar_can_access(process_id));

drop policy if exists ev_notes_team on evaluar_notes;
create policy ev_notes_team on evaluar_notes
  for select using (
    exists (
      select 1 from evaluar_participants pa
      where pa.id = participant_id and fn_evaluar_can_access(pa.process_id)
    )
  );

drop policy if exists ev_notes_team_write on evaluar_notes;
create policy ev_notes_team_write on evaluar_notes
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from evaluar_participants pa
      where pa.id = participant_id and fn_evaluar_can_access(pa.process_id)
    )
  );

-- Buscar el id de un usuario por su email, para sumarlo al equipo evaluador.
-- El email vive en auth.users y no en profiles, así que hace falta una función
-- con permisos elevados.
--
-- Va acotada a quien realmente la necesita: solo responde si quien pregunta
-- tiene al menos un proceso propio. Sin ese filtro, cualquier usuario logueado
-- podría averiguar qué direcciones están registradas en Worka.
create or replace function fn_user_id_by_email(p_email text)
returns uuid
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from evaluar_processes where company_id = auth.uid()
  ) then
    return null;
  end if;

  select id into v_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  return v_id;
end;
$$;

grant execute on function fn_user_id_by_email(text) to authenticated;

-- ============================================================
-- Borrador del candidato
--
-- Guarda sin corregir ni avanzar de etapa. Se llama seguido (cada respuesta),
-- así que hace lo mínimo posible.
-- ============================================================
create or replace function evaluar_save_draft(p_token text, p_answers jsonb)
returns void
language plpgsql volatile security definer
set search_path = public
as $$
begin
  update evaluar_participants
  set draft = coalesce(p_answers, '{}'::jsonb)
  where token = p_token
    and status not in ('descartado', 'completado', 'contratado');
end;
$$;

-- Datos del candidato invitado, que no tiene cuenta de Worka y por lo tanto
-- no tiene perfil de dónde sacarlos.
create or replace function evaluar_save_profile(
  p_token text,
  p_email text,
  p_phone text,
  p_city text
)
returns void
language plpgsql volatile security definer
set search_path = public
as $$
begin
  update evaluar_participants
  set email = coalesce(nullif(trim(p_email), ''), email),
      phone = coalesce(nullif(trim(p_phone), ''), phone),
      city = coalesce(nullif(trim(p_city), ''), city)
  where token = p_token;
end;
$$;

grant execute on function evaluar_save_draft(text, jsonb) to anon, authenticated;
grant execute on function evaluar_save_profile(text, text, text, text) to anon, authenticated;

-- ============================================================
-- evaluar_load: suma marca, tema, fecha límite y borrador.
-- ============================================================
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
      'completed_at', v_participant.completed_at
    ),
    'process', jsonb_build_object(
      'id', v_process.id,
      'title', v_process.title,
      'description', v_process.description,
      'closing_message', v_process.closing_message,
      'status', v_process.status,
      'theme', v_process.theme,
      'deadline_at', v_process.deadline_at,
      -- El color propio gana; si no hay, se usa el de Worka.
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
          'timed', s.timed,
          'template_key', s.template_key,
          'questions', coalesce((
            select jsonb_agg(
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

-- ============================================================
-- La fecha límite se respeta del lado del servidor.
--
-- Mostrarla nada más sería decorativo: quien deje la pestaña abierta podría
-- seguir enviando una semana después del cierre.
-- ============================================================
create or replace function evaluar_check_deadline()
returns trigger
language plpgsql
as $$
declare
  v_deadline timestamptz;
begin
  select deadline_at into v_deadline
  from evaluar_processes where id = new.process_id;

  if v_deadline is not null
     and now() > v_deadline
     and old.stage_index is distinct from new.stage_index then
    raise exception 'El plazo de esta evaluación venció el %',
      to_char(v_deadline, 'DD/MM/YYYY');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_evaluar_deadline on evaluar_participants;
create trigger trg_evaluar_deadline
  before update on evaluar_participants
  for each row execute function evaluar_check_deadline();
