-- ============================================================
-- Worka — Migración 047: Worka Enterprise Pro, Worka Pro y avisos de
-- vencimiento de vacantes.
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de la 045 y la 046.
-- Idempotente y no destructiva: crea tablas y funciones nuevas y agrega
-- columnas con valor por defecto. No borra ni cambia datos existentes.
-- ============================================================
--
-- Cobro manual: la persona paga con el link de pago, avisa desde Worka y el
-- admin aprueba. Aprobar crea (o extiende) la suscripción. Las funciones que
-- dependen del plan consultan fn_active_plan().

-- ── Suscripciones ───────────────────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product text not null check (product in ('enterprise', 'pro')),
  plan text not null,
  status text not null default 'activa' check (status in ('activa', 'cancelada')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  payment_request_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_user on subscriptions (user_id, product, ends_at desc);

alter table subscriptions enable row level security;
drop policy if exists subscriptions_read on subscriptions;
create policy subscriptions_read on subscriptions
  for select using (user_id = auth.uid() or fn_current_role() = 'admin');
drop policy if exists subscriptions_admin on subscriptions;
create policy subscriptions_admin on subscriptions
  for all using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- ── Avisos de pago (cobro manual) ───────────────────────────────────────
create table if not exists payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product text not null check (product in ('enterprise', 'pro')),
  plan text not null,
  months integer not null check (months between 1 and 24),
  amount_gs integer not null check (amount_gs >= 0),
  reference text,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'rechazada')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists idx_payment_requests_status on payment_requests (status, created_at desc);

alter table payment_requests enable row level security;
drop policy if exists payment_requests_read on payment_requests;
create policy payment_requests_read on payment_requests
  for select using (user_id = auth.uid() or fn_current_role() = 'admin');
drop policy if exists payment_requests_insert on payment_requests;
create policy payment_requests_insert on payment_requests
  for insert with check (user_id = auth.uid() and status = 'pendiente');
drop policy if exists payment_requests_admin on payment_requests;
create policy payment_requests_admin on payment_requests
  for all using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- Plan vigente de cualquier usuario (o null). Es un dato de vitrina (la
-- insignia "Pro"), así que se puede consultar para otros.
create or replace function public.fn_active_plan(p_user uuid, p_product text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select s.plan
  from subscriptions s
  where s.user_id = p_user
    and s.product = p_product
    and s.status = 'activa'
    and s.starts_at <= now()
    and s.ends_at > now()
  order by s.ends_at desc
  limit 1;
$$;
revoke all on function public.fn_active_plan(uuid, text) from public;
grant execute on function public.fn_active_plan(uuid, text) to anon, authenticated;

-- Quiénes de una lista tienen Worka Pro (para ordenar la búsqueda de talento).
create or replace function public.fn_pro_users(p_ids uuid[])
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select distinct s.user_id
  from subscriptions s
  where s.user_id = any (p_ids)
    and s.product = 'pro'
    and s.status = 'activa'
    and s.starts_at <= now()
    and s.ends_at > now();
$$;
revoke all on function public.fn_pro_users(uuid[]) from public;
grant execute on function public.fn_pro_users(uuid[]) to authenticated;

-- ── Vacantes: vigencia según plan, límite del plan Gratis, renovación
--    automática y avisos de vencimiento ──────────────────────────────────
alter table jobs add column if not exists auto_renew boolean not null default false;
alter table jobs add column if not exists expiry_warned_at timestamptz;
alter table jobs add column if not exists expired_notified_at timestamptz;

create or replace function public.fn_guard_job_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_days integer;
  v_listed integer;
  v_reactivating boolean;
begin
  -- Si cambia la vigencia, los avisos de vencimiento se vuelven a armar.
  if tg_op = 'UPDATE' and new.expires_at is distinct from old.expires_at then
    new.expiry_warned_at := null;
    new.expired_notified_at := null;
  end if;

  if fn_is_privileged() then
    return new;
  end if;

  v_plan := coalesce(fn_active_plan(new.company_id, 'enterprise'), 'gratis');
  v_days := case when v_plan = 'gratis' then 30 else 60 end;

  -- Vigencia máxima del plan (un día de margen por husos horarios).
  if (tg_op = 'INSERT' or new.expires_at is distinct from old.expires_at)
     and new.expires_at > now() + make_interval(days => v_days + 1) then
    new.expires_at := now() + make_interval(days => v_days);
  end if;

  -- La renovación automática es del plan Pro o Empresa.
  if v_plan = 'gratis' then
    new.auto_renew := false;
  end if;

  -- Plan Gratis: hasta 3 vacantes publicadas (activas y vigentes) a la vez.
  if v_plan = 'gratis' and new.status = 'Activo' and new.expires_at > now() then
    v_reactivating := tg_op = 'INSERT'
      or old.status is distinct from 'Activo'
      or old.expires_at <= now();
    if v_reactivating then
      select count(*) into v_listed
      from jobs j
      where j.company_id = new.company_id
        and j.id <> new.id
        and j.status = 'Activo'
        and j.expires_at > now();
      if v_listed >= 3 then
        raise exception 'Con el plan Gratis podés tener hasta 3 vacantes publicadas a la vez. Pasate a Worka Enterprise Pro para publicar sin límite.'
          using errcode = 'P0001';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_job_plan on jobs;
create trigger trg_guard_job_plan
  before insert or update on jobs
  for each row execute function public.fn_guard_job_plan();

-- Destaques incluidos en el plan y alertas urgentes: registro de uso.
create table if not exists job_promotions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  job_id uuid references jobs (id) on delete set null,
  kind text not null check (kind in ('boost', 'urgent_alert')),
  recipients integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_job_promotions_company on job_promotions (company_id, kind, created_at desc);
alter table job_promotions enable row level security;
drop policy if exists job_promotions_read on job_promotions;
create policy job_promotions_read on job_promotions
  for select using (
    company_id = auth.uid()
    or fn_company_member_can_write(company_id)
    or fn_current_role() = 'admin'
  );

-- ── Página de empresa con marca (plan Empresa) ──────────────────────────
alter table companies add column if not exists brand_color text;
alter table companies add column if not exists culture text;
alter table companies add column if not exists perks text[] not null default '{}';
alter table companies add column if not exists video_url text;

-- ── Worka Pro: quién vio tu perfil ──────────────────────────────────────
create table if not exists profile_views (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  source text not null check (source in ('postulacion', 'cv', 'talento', 'perfil')),
  job_id uuid references jobs (id) on delete set null,
  view_date date not null default current_date,
  viewed_at timestamptz not null default now(),
  unique (candidate_id, company_id, source, view_date)
);
create index if not exists idx_profile_views_candidate on profile_views (candidate_id, viewed_at desc);

alter table profile_views enable row level security;
-- El detalle (qué empresa) es de Worka Pro; el conteo va por fn_my_profile_view_count.
drop policy if exists profile_views_pro_read on profile_views;
create policy profile_views_pro_read on profile_views
  for select using (
    (candidate_id = auth.uid() and fn_active_plan(auth.uid(), 'pro') is not null)
    or fn_current_role() = 'admin'
  );

-- Registra que la empresa de quien llama miró a un candidato. La empresa sale
-- de la sesión (dueño o miembro activo), nunca de un parámetro.
create or replace function public.fn_record_profile_view(p_candidate uuid, p_source text, p_job uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid;
begin
  if p_source not in ('postulacion', 'cv', 'talento', 'perfil') then
    return;
  end if;
  select id into v_company from companies where id = auth.uid();
  if v_company is null then
    select company_id into v_company
    from company_members
    where member_id = auth.uid() and status = 'activa'
    limit 1;
  end if;
  if v_company is null or p_candidate is null then
    return;
  end if;
  insert into profile_views (candidate_id, company_id, source, job_id)
  values (p_candidate, v_company, p_source, p_job)
  on conflict (candidate_id, company_id, source, view_date) do nothing;
end;
$$;
revoke all on function public.fn_record_profile_view(uuid, text, uuid) from public;
grant execute on function public.fn_record_profile_view(uuid, text, uuid) to authenticated;

create or replace function public.fn_my_profile_view_count(p_days integer default 30)
returns table (views bigint, companies bigint)
language sql
stable
security definer
set search_path = public
as $$
  select count(*), count(distinct company_id)
  from profile_views
  where candidate_id = auth.uid()
    and viewed_at > now() - make_interval(days => greatest(1, least(p_days, 365)));
$$;
revoke all on function public.fn_my_profile_view_count(integer) from public;
grant execute on function public.fn_my_profile_view_count(integer) to authenticated;

-- Detalle de cada postulación propia (Worka Pro): cuántos se postularon y
-- cuándo la empresa vio el perfil o el CV. Solo devuelve filas a quien es Pro.
create or replace function public.fn_my_application_insights()
returns table (job_id uuid, applicants bigint, company_viewed_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.job_id,
         (select count(*) from applications x where x.job_id = a.job_id),
         (select max(v.viewed_at) from profile_views v
           join jobs j on j.id = a.job_id
           where v.candidate_id = a.candidate_id and v.company_id = j.company_id)
  from applications a
  where a.candidate_id = auth.uid()
    and fn_active_plan(auth.uid(), 'pro') is not null;
$$;
revoke all on function public.fn_my_application_insights() from public;
grant execute on function public.fn_my_application_insights() to authenticated;

-- ── Worka Pro: uso de la IA (revisión de CV y simulador de entrevista) ──
create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  kind text not null check (kind in ('cv_review', 'interview')),
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_user on ai_usage (user_id, kind, created_at desc);
alter table ai_usage enable row level security;
drop policy if exists ai_usage_read on ai_usage;
create policy ai_usage_read on ai_usage
  for select using (user_id = auth.uid() or fn_current_role() = 'admin');

-- ── Academia: cursos premium y certificados verificables ────────────────
alter table courses add column if not exists premium boolean not null default false;

create table if not exists course_certificates (
  code text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  full_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
alter table course_certificates enable row level security;
-- Público a propósito: es lo que permite verificar un certificado por su código.
drop policy if exists course_certificates_public on course_certificates;
create policy course_certificates_public on course_certificates for select using (true);

-- Emite (o devuelve) el certificado de quien llama, solo con el curso completo.
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
begin
  if auth.uid() is null then
    raise exception 'Iniciá sesión' using errcode = '42501';
  end if;
  select code into v_code from course_certificates where user_id = auth.uid() and course_id = p_course;
  if v_code is not null then
    return v_code;
  end if;
  if not exists (select 1 from fn_completed_courses(auth.uid()) c where c.course_id = p_course) then
    raise exception 'El curso todavía no está completo' using errcode = 'P0001';
  end if;
  -- fn_completed_courses cuenta lecciones hechas; además hay que tenerlas todas.
  if exists (
    select 1 from lessons l
    where l.course_id = p_course
      and not exists (
        select 1 from lesson_completions lc
        where lc.lesson_id = l.id and lc.user_id = auth.uid()
      )
  ) then
    raise exception 'El curso todavía no está completo' using errcode = 'P0001';
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
