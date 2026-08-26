-- Worka Evaluar · Datos del concurso, explicación de etapas y claves de IA
--
-- Requiere la 025 y la 029 aplicadas. Correr en orden.

-- ── 1. Para qué unidad se llama el concurso ───────────────────
--
-- En una empresa chica alcanza con el nombre del puesto. En una con varias
-- sucursales o en el sector público no: "Cajero" no dice nada si no se sabe
-- para qué unidad y qué departamento se está llamando, y el informe termina
-- sobre el escritorio de alguien que no participó de la búsqueda.
alter table evaluar_processes
  add column if not exists org_unit text not null default '',
  add column if not exists department text not null default '',
  add column if not exists manager_name text not null default '',
  add column if not exists manager_email text not null default '';

-- ── 2. Que el candidato entienda qué le van a tomar ───────────
--
-- Hoy entra a una etapa llamada "Los Cinco Grandes" y no sabe si es un
-- examen, cuánto dura ni si se puede equivocar. Eso no mide lo que se quiere
-- medir: mide cuánta ansiedad tolera la persona en los primeros dos minutos.
alter table evaluar_stages
  -- Qué es esta etapa y qué se espera, en criollo.
  add column if not exists intro text not null default '',
  -- Una pregunta de ejemplo, resuelta, para que vea el formato antes de que
  -- empiece a contar el tiempo. {text, options, answer, explain}
  add column if not exists demo jsonb;

-- ── 3. Claves de IA ───────────────────────────────────────────
--
-- Varias por proveedor a propósito: las cuentas gratuitas de Groq tienen
-- tope por minuto, y con una sola clave el asistente se cae justo cuando dos
-- empresas lo usan a la vez. Se rota entre las que estén activas y la que
-- falla se marca sola.
--
-- La clave se guarda tal cual porque hay que poder usarla; lo que la protege
-- es que la tabla es de lectura exclusiva del admin y que el servidor la lee
-- con la service role. Nunca viaja al navegador.
create table if not exists evaluar_ai_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'groq',
  label text not null default '',
  api_key text not null,
  active boolean not null default true,
  last_used_at timestamptz,
  failed_at timestamptz,
  fail_reason text,
  created_at timestamptz not null default now()
);

alter table evaluar_ai_keys enable row level security;

drop policy if exists ev_ai_keys_admin on evaluar_ai_keys;
create policy ev_ai_keys_admin on evaluar_ai_keys
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

create index if not exists idx_ev_ai_keys_activa
  on evaluar_ai_keys (provider, active, last_used_at);

-- ── 4. La explicación y la demo tienen que llegar al candidato ─
-- Misma función que dejó la 029, con intro y demo sumados a la etapa.
-- Se reescribe entera porque plpgsql no se parchea por partes.

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
