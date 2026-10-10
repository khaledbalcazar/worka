-- ============================================================
-- Worka — Migración 042: trayectoria del candidato e insignias de Academia
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- 1. Experiencia laboral, estudios y habilidades con campos propios. Hasta
--    ahora todo eso vivía como texto libre en la bio o en el PDF del CV, y no
--    se podía mostrar ordenado ni usar para comparar con una vacante.
--
-- 2. Insignias de Academia: los cursos que la persona terminó al 100% se
--    muestran en su perfil. No se guarda nada nuevo: se calculan a partir de
--    lesson_completions, que ya existe desde la migración 017.

-- ── Habilidades ──
alter table candidates
  add column if not exists skills text[] not null default '{}';

-- Un límite razonable para que el perfil no se convierta en una lista de
-- palabras clave.
alter table candidates drop constraint if exists candidates_skills_max;
alter table candidates
  add constraint candidates_skills_max check (cardinality(skills) <= 20);

-- ── Experiencia ──
create table if not exists candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  role text not null check (char_length(role) between 2 and 80),
  company text not null check (char_length(company) between 1 and 80),
  start_date date not null,
  end_date date,                      -- null = trabajo actual
  description text not null default '' check (char_length(description) <= 400),
  created_at timestamptz not null default now(),
  constraint candidate_experience_dates check (end_date is null or end_date >= start_date)
);

create index if not exists idx_experience_candidate
  on candidate_experience (candidate_id, start_date desc);

-- ── Estudios ──
create table if not exists candidate_education (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  institution text not null check (char_length(institution) between 2 and 100),
  title text not null check (char_length(title) between 2 and 100),
  level text not null default 'Otro'
    check (level in ('Secundario', 'Técnico', 'Universitario', 'Curso', 'Otro')),
  end_year integer check (end_year between 1950 and 2100), -- null = en curso
  created_at timestamptz not null default now()
);

create index if not exists idx_education_candidate
  on candidate_education (candidate_id, end_year desc nulls first);

-- ── RLS ──
-- Escribe solo el dueño. Leen quienes ya pueden leer al candidato: la
-- subconsulta sobre candidates respeta sus propias políticas (perfil propio,
-- perfil público, búsqueda de talento y empresas a las que se postuló), así
-- que estas tablas nunca muestran más que el perfil al que pertenecen.
alter table candidate_experience enable row level security;
alter table candidate_education enable row level security;

drop policy if exists experience_own on candidate_experience;
create policy experience_own on candidate_experience
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

drop policy if exists experience_read on candidate_experience;
create policy experience_read on candidate_experience
  for select using (exists (select 1 from candidates c where c.id = candidate_id));

drop policy if exists education_own on candidate_education;
create policy education_own on candidate_education
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

drop policy if exists education_read on candidate_education;
create policy education_read on candidate_education
  for select using (exists (select 1 from candidates c where c.id = candidate_id));

-- ── Insignias de Academia ──
-- lesson_completions solo la lee su dueño (migración 017). Para mostrar las
-- insignias en el perfil público o a una empresa hace falta leer el progreso
-- de otra persona, así que la función corre como definer y repite a mano las
-- mismas reglas de visibilidad del candidato. Devuelve solo cursos
-- publicados con todas sus lecciones completas, nunca el progreso parcial.
create or replace function public.fn_completed_courses(p_user uuid)
returns table (course_id uuid, slug text, title text, category text, completed_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.slug, c.title, c.category, max(lc.completed_at)
  from courses c
  join lesson_completions lc on lc.course_id = c.id and lc.user_id = p_user
  where c.status = 'publicado'
    and (
      p_user = auth.uid()
      or fn_current_role() = 'admin'
      or exists (
        select 1 from candidates cand
        where cand.id = p_user
          and (cand.public_profile
               or (cand.visible_to_companies and fn_current_role() = 'company'))
      )
      or exists (
        select 1
        from applications a
        join jobs j on j.id = a.job_id
        where a.candidate_id = p_user
          and (j.company_id = auth.uid() or fn_is_company_member(j.company_id))
      )
    )
  group by c.id, c.slug, c.title, c.category
  having count(distinct lc.lesson_id) >= (select count(*) from lessons l where l.course_id = c.id)
  order by max(lc.completed_at) desc;
$$;

revoke all on function public.fn_completed_courses(uuid) from public;
grant execute on function public.fn_completed_courses(uuid) to anon, authenticated;
