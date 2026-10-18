-- ============================================================
-- Worka — Migración 051: Academia con videos, prácticas y proyecto final
--
-- Extiende cursos y lecciones de forma compatible: los 3 cursos que ya
-- existen siguen funcionando igual (los campos nuevos son opcionales).
--
--   courses:  metadatos SEO, «lo que vas a aprender», curso sugerido,
--             aviso legal, fecha de revisión, proyecto final y reglas del
--             certificado (nota mínima de los ejercicios).
--   lessons:  slug, «Para recordar», videos, enlaces útiles, práctica y
--             fecha de revisión. El quiz admite una «explanation» por
--             pregunta.
--   lesson_progress:         puntaje del quiz y la práctica de cada
--                            persona (privado, solo lo ve su dueño).
--   course_project_progress: el proyecto final de cada persona.
--
-- Después de esta, correr la 052 (los 6 cursos nuevos).
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table courses
  add column if not exists duration_label text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists outcomes jsonb not null default '[]'::jsonb,
  add column if not exists suggested_course text,
  add column if not exists legal_notice text,
  add column if not exists review_before date,
  add column if not exists final_project jsonb,
  add column if not exists cert_min_quiz integer check (cert_min_quiz between 0 and 100),
  add column if not exists cert_requires_project boolean not null default false;

alter table lessons
  add column if not exists slug text,
  add column if not exists key_points jsonb not null default '[]'::jsonb,
  add column if not exists videos jsonb not null default '[]'::jsonb,
  add column if not exists resources jsonb not null default '[]'::jsonb,
  add column if not exists practice jsonb,
  add column if not exists review_before date;

-- Índice único completo (no parcial) para poder usar ON CONFLICT en la 052.
-- Las lecciones viejas tienen slug NULL y los NULL no chocan entre sí.
create unique index if not exists uq_lessons_course_slug on lessons (course_id, slug);

-- ── Progreso fino por lección ──
create table if not exists lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  quiz_score integer,            -- mejor puntaje (respuestas correctas)
  quiz_total integer,
  practice_text text,            -- lo que escribió (privado)
  practice_checks jsonb not null default '[]'::jsonb,  -- índices tildados
  practice_done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists idx_lesson_progress_user on lesson_progress (user_id, course_id);

create table if not exists course_project_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  answer text,
  checks jsonb not null default '[]'::jsonb,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table lesson_progress enable row level security;
alter table course_project_progress enable row level security;

drop policy if exists lesson_progress_own on lesson_progress;
create policy lesson_progress_own on lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists course_project_own on course_project_progress;
create policy course_project_own on course_project_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Certificado: también exige nota mínima y proyecto final ──
-- Mismo cuerpo que la 047 más dos controles, solo para los cursos que los
-- definen (cert_min_quiz / cert_requires_project). Los cursos viejos no
-- cambian.
create or replace function public.fn_issue_certificate(p_course uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_name text;
  v_title text;
  v_min integer;
  v_project boolean;
  v_avg numeric;
begin
  if auth.uid() is null then
    raise exception 'Iniciá sesión' using errcode = '42501';
  end if;
  select code into v_code from course_certificates where user_id = auth.uid() and course_id = p_course;
  if v_code is not null then
    return v_code;
  end if;
  if not exists (select 1 from courses where id = p_course and status = 'publicado') then
    raise exception 'El curso no está disponible' using errcode = 'P0001';
  end if;
  if exists (select 1 from courses where id = p_course and premium)
     and fn_active_plan(auth.uid(), 'pro') is null then
    raise exception 'Este curso es de Worka Pro' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from lessons l
    where l.course_id = p_course
      and not exists (
        select 1 from lesson_completions lc
        where lc.lesson_id = l.id and lc.user_id = auth.uid()
      )
  ) or not exists (select 1 from lessons where course_id = p_course) then
    raise exception 'El curso todavía no está completo' using errcode = 'P0001';
  end if;

  select cert_min_quiz, cert_requires_project into v_min, v_project from courses where id = p_course;
  if v_min is not null then
    -- Promedio de las lecciones con ejercicio; una sin hacer cuenta como 0.
    select coalesce(avg(coalesce(lp.quiz_score::numeric / nullif(lp.quiz_total, 0), 0)) * 100, 0)
      into v_avg
    from lessons l
    left join lesson_progress lp on lp.lesson_id = l.id and lp.user_id = auth.uid()
    where l.course_id = p_course and jsonb_array_length(l.quiz) > 0;
    if v_avg < v_min then
      raise exception 'Tu promedio en los ejercicios todavía no llega al mínimo' using errcode = 'P0001';
    end if;
  end if;
  if coalesce(v_project, false) and not exists (
    select 1 from course_project_progress where user_id = auth.uid() and course_id = p_course and done
  ) then
    raise exception 'Falta el proyecto final' using errcode = 'P0001';
  end if;

  select coalesce(nullif(trim(full_name), ''), 'Estudiante de Worka') into v_name from candidates where id = auth.uid();
  select title into v_title from courses where id = p_course;
  v_code := 'WK-' || upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
  insert into course_certificates (code, user_id, course_id, full_name, course_title)
  values (v_code, auth.uid(), p_course, coalesce(v_name, 'Estudiante de Worka'), coalesce(v_title, 'Curso'))
  on conflict (user_id, course_id) do nothing;
  select code into v_code from course_certificates where user_id = auth.uid() and course_id = p_course;
  return v_code;
end;
$$;
revoke all on function public.fn_issue_certificate(uuid) from public;
grant execute on function public.fn_issue_certificate(uuid) to authenticated;
