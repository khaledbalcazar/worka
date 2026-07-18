-- ============================================================
-- Worka — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- Extensiones: búsqueda con tolerancia a errores de tipeo
create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- Tipos enumerados
-- ------------------------------------------------------------
create type user_role as enum ('candidate', 'company', 'admin');
create type job_modality as enum ('Presencial', 'Híbrido', 'Remoto');
create type job_status as enum ('Activo', 'Pausado', 'Cerrado', 'Moderacion');
create type application_status as enum ('Pendiente', 'Revisado', 'Contactado', 'Rechazado');
create type ruc_check as enum ('pendiente', 'coincide', 'no_coincide');

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

-- Perfiles (1:1 con auth.users de Supabase)
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table candidates (
  id uuid primary key references profiles (id) on delete cascade,
  full_name text not null,
  phone_whatsapp text not null,
  phone_verified boolean not null default false, -- verificado por código de WhatsApp
  identity_status text not null default 'none'
    check (identity_status in ('none', 'pending', 'verified')),
  location_city text not null,
  visible_to_companies boolean not null default true, -- aparece en búsqueda de talento
  public_profile boolean not null default true, -- página pública /p/[id]
  cv_url text,
  cv_text text, -- texto extraído del PDF: se parsea una sola vez
  preferences_industry text[] not null default '{}',
  preferences_modality text,
  first_job_mode boolean not null default false,
  alerts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table companies (
  id uuid primary key references profiles (id) on delete cascade,
  company_name text not null,
  trade_name text not null,
  ruc text not null unique,
  logo_url text,
  banner_url text,
  description text,
  location_city text not null,
  website_url text,
  instagram_url text,
  facebook_url text,
  badges text[] not null default '{}', -- insignias (catálogo en la app)
  is_verified boolean not null default false,
  ruc_check_status ruc_check not null default 'pendiente',
  fast_responder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Publicaciones cortas de la empresa (novedades en su página pública)
create table company_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  title text not null,
  description text not null,
  industry text not null,
  modality job_modality not null,
  contract_type text,
  salary_range text,
  schedule text,
  address text,
  nearby_transit text,
  requirements text[] not null default '{}',
  benefits text[] not null default '{}',
  vacancies_count smallint not null default 1,
  status job_status not null default 'Activo',
  requires_experience boolean not null default false,
  urgent boolean not null default false,
  featured boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  -- Vacante presencial sin líneas de colectivo: no se permite
  constraint transit_required_if_onsite
    check (modality <> 'Presencial' or nearby_transit is not null)
);

-- Preguntas de filtro por vacante (máx. 3, validado en la app)
create table job_questions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  question text not null,
  knockout boolean not null default false, -- responder "No" descarta automáticamente
  position smallint not null default 1
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  candidate_id uuid not null references candidates (id) on delete cascade,
  status application_status not null default 'Pendiente',
  rejection_reason text,
  internal_note text, -- nota privada del reclutador (nunca visible al candidato)
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  whatsapp_notified boolean not null default false, -- evita alertas repetidas
  -- Un candidato no puede postularse dos veces a la misma vacante
  constraint one_application_per_job unique (job_id, candidate_id)
);

-- Respuestas del candidato a las preguntas de filtro
create table application_answers (
  application_id uuid not null references applications (id) on delete cascade,
  question_id uuid not null references job_questions (id) on delete cascade,
  answer boolean not null,
  primary key (application_id, question_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  reporter_id uuid not null references candidates (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  -- Un candidato no puede denunciar dos veces la misma vacante
  constraint one_report_per_candidate unique (job_id, reporter_id)
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index idx_jobs_status_created on jobs (status, created_at desc);
create index idx_jobs_company on jobs (company_id);
-- Referencias laborales: un ex-empleador confirma por WhatsApp
create table work_references (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  referrer_name text not null,
  referrer_phone text not null,
  relationship text not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmada')),
  created_at timestamptz not null default now()
);

-- Empresas seguidas por candidatos
create table company_followers (
  candidate_id uuid not null references candidates (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, company_id)
);

-- Entrevistas propuestas desde el kanban
create table interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  proposed_at timestamptz not null,
  location text not null default '',
  status text not null default 'propuesta'
    check (status in ('propuesta', 'confirmada', 'rechazada')),
  created_at timestamptz not null default now()
);

-- Centro de notificaciones (candidatos y empresas)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  icon text not null default '🔔',
  title text not null,
  body text not null default '',
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Chat interno por postulación
create table messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  sender text not null check (sender in ('candidate', 'company')),
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Vacantes guardadas por el candidato
create table saved_jobs (
  candidate_id uuid not null references candidates (id) on delete cascade,
  job_id uuid not null references jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, job_id)
);

create index idx_applications_job on applications (job_id);
create index idx_applications_candidate on applications (candidate_id);
create index idx_reports_job on reports (job_id);

-- Búsqueda full-text en español + tolerancia a errores de tipeo
create index idx_jobs_search on jobs
  using gin (to_tsvector('spanish', title || ' ' || description));
create index idx_jobs_title_trgm on jobs using gin (title gin_trgm_ops);

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------

-- Regla de moderación automática: 3+ denuncias => la vacante se oculta.
-- Solo cuentan denuncias de cuentas con 7+ días de antigüedad o con al
-- menos una postulación previa (mitiga denuncias falsas coordinadas).
create or replace function fn_auto_moderate_job()
returns trigger
language plpgsql
security definer
as $$
declare
  valid_reports integer;
begin
  select count(*) into valid_reports
  from reports r
  join candidates c on c.id = r.reporter_id
  where r.job_id = new.job_id
    and (
      c.created_at < now() - interval '7 days'
      or exists (select 1 from applications a where a.candidate_id = c.id)
    );

  if valid_reports >= 3 then
    update jobs set status = 'Moderacion'
    where id = new.job_id and status = 'Activo';
  end if;

  return new;
end;
$$;

create trigger trg_auto_moderate
after insert on reports
for each row execute function fn_auto_moderate_job();

-- Marca reviewed_at la primera vez que la postulación pasa a 'Revisado'.
-- El webhook de WhatsApp (Edge Function) escucha este cambio y notifica
-- al candidato solo si whatsapp_notified = false.
create or replace function fn_mark_reviewed()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'Pendiente' and old.status = 'Pendiente' then
    new.reviewed_at := coalesce(new.reviewed_at, now());
  end if;
  return new;
end;
$$;

create trigger trg_mark_reviewed
before update on applications
for each row execute function fn_mark_reviewed();

-- updated_at automático
create or replace function fn_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_touch_profiles before update on profiles
for each row execute function fn_touch_updated_at();
create trigger trg_touch_candidates before update on candidates
for each row execute function fn_touch_updated_at();
create trigger trg_touch_companies before update on companies
for each row execute function fn_touch_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table candidates enable row level security;
alter table companies enable row level security;
alter table company_posts enable row level security;
alter table jobs enable row level security;
alter table job_questions enable row level security;
alter table applications enable row level security;
alter table application_answers enable row level security;
alter table reports enable row level security;

-- Helper: rol del usuario autenticado
create or replace function fn_current_role()
returns user_role
language sql stable security definer
as $$
  select role from profiles where id = auth.uid();
$$;

-- profiles: cada uno ve y edita el suyo; admin ve todo
create policy profiles_self on profiles
  for all using (id = auth.uid() or fn_current_role() = 'admin');

-- candidates: el candidato gestiona su fila
create policy candidates_self on candidates
  for all using (id = auth.uid() or fn_current_role() = 'admin');

-- candidates: una empresa solo lee perfiles que se postularon a sus vacantes
create policy candidates_visible_to_employer on candidates
  for select using (
    exists (
      select 1
      from applications a
      join jobs j on j.id = a.job_id
      where a.candidate_id = candidates.id
        and j.company_id = auth.uid()
    )
  );

-- companies: la empresa gestiona su fila; los perfiles públicos son visibles
create policy companies_self on companies
  for all using (id = auth.uid() or fn_current_role() = 'admin');
create policy companies_public_read on companies
  for select using (true);

-- company_posts: lectura pública; escribe la empresa dueña
create policy company_posts_read on company_posts
  for select using (true);
create policy company_posts_write on company_posts
  for all using (company_id = auth.uid() or fn_current_role() = 'admin');

-- jobs: el feed público solo muestra vacantes activas;
-- la empresa dueña y el admin ven todas las suyas
create policy jobs_public_read on jobs
  for select using (
    status = 'Activo'
    or company_id = auth.uid()
    or fn_current_role() = 'admin'
  );
create policy jobs_company_write on jobs
  for insert with check (company_id = auth.uid());
create policy jobs_company_update on jobs
  for update using (company_id = auth.uid() or fn_current_role() = 'admin');

-- job_questions: visibles con la vacante; las gestiona la empresa dueña
create policy job_questions_read on job_questions
  for select using (true);
create policy job_questions_write on job_questions
  for all using (
    exists (select 1 from jobs j where j.id = job_id and j.company_id = auth.uid())
  );

-- applications: el candidato ve las suyas; la empresa ve las de sus vacantes
create policy applications_candidate on applications
  for select using (candidate_id = auth.uid());
-- Postular: basta con que la postulacion sea del propio candidato.
-- El anti-spam (perfil completo + limite diario) se aplica en la app.
create policy applications_candidate_insert on applications
  for insert with check (candidate_id = auth.uid());

-- saved_jobs: cada candidato maneja solo sus guardados
alter table saved_jobs enable row level security;
create policy saved_jobs_own on saved_jobs
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

-- work_references: el candidato gestiona las suyas; empresas con postulación cruzada pueden verlas
alter table work_references enable row level security;
create policy work_references_own on work_references
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());
create policy work_references_company_read on work_references
  for select using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.candidate_id = work_references.candidate_id
        and j.company_id = auth.uid()
    )
  );

-- company_followers: cada candidato maneja sus seguidas; la empresa ve su conteo
alter table company_followers enable row level security;
create policy company_followers_own on company_followers
  for all using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());
create policy company_followers_company_read on company_followers
  for select using (company_id = auth.uid());

-- interviews: la empresa dueña de la vacante crea; el candidato responde
alter table interviews enable row level security;
create policy interviews_company on interviews
  for all using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = auth.uid()
    )
  );
create policy interviews_candidate_read on interviews
  for select using (
    exists (
      select 1 from applications a
      where a.id = application_id and a.candidate_id = auth.uid()
    )
  );
create policy interviews_candidate_update on interviews
  for update using (
    exists (
      select 1 from applications a
      where a.id = application_id and a.candidate_id = auth.uid()
    )
  );

-- notifications: cada usuario ve y actualiza solo las suyas
alter table notifications enable row level security;
create policy notifications_own on notifications
  for select using (user_id = auth.uid());
create policy notifications_own_update on notifications
  for update using (user_id = auth.uid());

-- messages: solo las dos partes de la postulación
alter table messages enable row level security;
create policy messages_parties on messages
  for all using (
    exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      where a.id = application_id
        and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
    )
  );

-- Búsqueda activa de talento: empresas ven candidatos que se hicieron visibles
create policy candidates_talent_search on candidates
  for select using (
    visible_to_companies and fn_current_role() = 'company'
  );
create policy applications_company on applications
  for select using (
    exists (select 1 from jobs j where j.id = job_id and j.company_id = auth.uid())
  );
create policy applications_company_update on applications
  for update using (
    exists (select 1 from jobs j where j.id = job_id and j.company_id = auth.uid())
  );

-- application_answers: mismas reglas que la postulación
create policy answers_read on application_answers
  for select using (
    exists (
      select 1 from applications a
      where a.id = application_id
        and (
          a.candidate_id = auth.uid()
          or exists (select 1 from jobs j where j.id = a.job_id and j.company_id = auth.uid())
        )
    )
  );
create policy answers_insert on application_answers
  for insert with check (
    exists (select 1 from applications a where a.id = application_id and a.candidate_id = auth.uid())
  );

-- reports: el candidato crea; solo el admin lee
create policy reports_insert on reports
  for insert with check (reporter_id = auth.uid());
create policy reports_admin_read on reports
  for select using (fn_current_role() = 'admin');
create policy reports_admin_delete on reports
  for delete using (fn_current_role() = 'admin');

-- ------------------------------------------------------------
-- Business Intelligence (Power BI / Looker Studio)
-- ------------------------------------------------------------
-- IMPORTANTE: nunca exponer credenciales de las tablas crudas (contienen
-- datos personales). Se crea un rol de solo lectura con acceso únicamente
-- a vistas agregadas, sin información personal identificable.

create schema if not exists bi;

create or replace view bi.daily_metrics as
select
  date_trunc('day', a.applied_at)::date as day,
  count(*) as applications,
  count(distinct a.candidate_id) as unique_candidates,
  count(distinct a.job_id) as jobs_with_applications
from applications a
group by 1;

create or replace view bi.jobs_health as
select
  j.industry,
  j.modality,
  co.location_city,
  count(*) filter (where j.status = 'Activo') as active_jobs,
  avg(j.views_count) as avg_views,
  count(a.id) as total_applications,
  count(a.id) filter (where a.status = 'Contactado') as contacted
from jobs j
join companies co on co.id = j.company_id
left join applications a on a.job_id = j.id
group by 1, 2, 3;

create or replace view bi.funnel as
select
  count(*) filter (where status = 'Pendiente') as pendientes,
  count(*) filter (where status = 'Revisado') as revisados,
  count(*) filter (where status = 'Contactado') as contactados,
  count(*) filter (where status = 'Rechazado') as rechazados
from applications;

-- Rol de solo lectura para herramientas de BI (cambiar la contraseña):
-- create role bi_reader with login password 'CAMBIAR_ESTA_CONTRASENA';
-- grant usage on schema bi to bi_reader;
-- grant select on all tables in schema bi to bi_reader;
-- alter default privileges in schema bi grant select on tables to bi_reader;

-- ------------------------------------------------------------
-- Storage (bucket de CVs)
-- ------------------------------------------------------------
-- Crear bucket privado 'cvs' desde el panel de Supabase y aplicar:
--
-- create policy "cv_owner_all" on storage.objects
--   for all using (bucket_id = 'cvs' and owner = auth.uid());
--
-- create policy "cv_employer_read" on storage.objects
--   for select using (
--     bucket_id = 'cvs' and exists (
--       select 1
--       from applications a
--       join jobs j on j.id = a.job_id
--       join candidates c on c.id = a.candidate_id
--       where j.company_id = auth.uid()
--         and c.cv_url like '%' || storage.objects.name
--     )
--   );
