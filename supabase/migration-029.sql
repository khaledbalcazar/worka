-- Worka Evaluar · Entrevista asincrónica en video
--
-- La empresa deja una pregunta grabada; el candidato la contesta en video
-- cuando puede. Resuelve el problema más caro de una selección: coordinar
-- veinte entrevistas de quince minutos para descartar en los primeros dos.
--
-- Requiere la migración 025 aplicada. Correr en orden.

-- ── 1. Un tipo de pregunta más ────────────────────────────────
-- El video no puntúa solo: no hay respuesta correcta y lo juzga una persona.
-- Como la corrección de la 024 solo suma los ítems que tienen `correct`, una
-- pregunta de video queda fuera del puntaje sin tocar nada más.
alter table evaluar_questions drop constraint if exists evaluar_questions_kind_check;
alter table evaluar_questions add constraint evaluar_questions_kind_check
  check (kind in ('unica', 'multiple', 'texto', 'escala', 'numero', 'likert', 'video'));

-- Segundos máximos de grabación. Va en la pregunta y no en la etapa porque
-- "contá de vos en un minuto" y "resolvé este caso" no piden lo mismo.
alter table evaluar_questions
  add column if not exists max_seconds smallint not null default 90;

-- ── 2. Dónde viven los videos ─────────────────────────────────
-- Bucket privado: un video de una persona buscando trabajo no puede quedar
-- en una URL que se adivina. Se sirve siempre con URL firmada y de corta
-- duración, y solo a la empresa dueña del proceso.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entrevistas',
  'entrevistas',
  false,
  52428800, -- 50 MB
  array['video/webm', 'video/mp4']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- La subida la hace el servidor con la service role (el candidato no tiene
-- cuenta), así que acá no hace falta política de insert para authenticated.
-- Sí la de lectura, para que la empresa pueda mirar desde su sesión.
drop policy if exists ev_video_lee_empresa on storage.objects;
create policy ev_video_lee_empresa on storage.objects
  for select using (
    bucket_id = 'entrevistas'
    and exists (
      select 1
      from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where p.company_id = auth.uid()
        and split_part(storage.objects.name, '/', 1) = pa.id::text
    )
  );

-- ── 3. El tope de grabación tiene que llegar al candidato ─────
-- Misma función que dejó la 025, con max_seconds sumado al objeto de la
-- pregunta. Se reescribe entera porque plpgsql no se parchea por partes.

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
