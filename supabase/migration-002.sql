-- ============================================================
-- Worka — Migración 002 (idempotente)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS del schema.sql inicial.
-- Se puede correr varias veces sin romper nada.
-- ============================================================

-- ---------- 1. Columnas nuevas ----------

alter table candidates add column if not exists phone_verified boolean not null default false;
alter table candidates add column if not exists identity_status text not null default 'none';
alter table candidates add column if not exists visible_to_companies boolean not null default true;
alter table candidates add column if not exists public_profile boolean not null default true;

alter table applications add column if not exists internal_note text;

alter table jobs add column if not exists featured_until timestamptz;

alter table companies add column if not exists banner_url text;
alter table companies add column if not exists website_url text;
alter table companies add column if not exists instagram_url text;
alter table companies add column if not exists facebook_url text;
alter table companies add column if not exists badges text[] not null default '{}';
alter table companies add column if not exists fast_responder boolean not null default false;

-- ---------- 2. Tablas nuevas ----------

create table if not exists company_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create table if not exists saved_jobs (
  candidate_id uuid not null references candidates (id) on delete cascade,
  job_id uuid not null references jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, job_id)
);

create table if not exists work_references (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  referrer_name text not null,
  referrer_phone text not null,
  relationship text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmada')),
  created_at timestamptz not null default now()
);
alter table work_references add column if not exists token uuid not null default gen_random_uuid();
create unique index if not exists idx_work_references_token on work_references (token);

create table if not exists company_followers (
  candidate_id uuid not null references candidates (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, company_id)
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  proposed_at timestamptz not null,
  location text not null default '',
  status text not null default 'propuesta' check (status in ('propuesta', 'confirmada', 'rechazada')),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  icon text not null default '🔔',
  title text not null,
  body text not null default '',
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  sender text not null check (sender in ('candidate', 'company')),
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Potenciar empleo: solicitudes de destaque pago
create table if not exists boost_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  plan text not null,          -- ej: '7 días', '15 días', '30 días'
  price_gs integer not null,   -- precio en guaraníes
  status text not null default 'pendiente_pago'
    check (status in ('pendiente_pago', 'activo', 'rechazado')),
  created_at timestamptz not null default now()
);

-- Configuración del sitio, editable desde /admin
create table if not exists site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

insert into site_settings (key, value) values
  ('site_name', 'Worka'),
  ('logo_url', ''),
  ('hero_title', 'Tu próximo paso empieza acá.'),
  ('hero_subtitle', 'La plataforma de empleo pensada para Paraguay: empresas verificadas, alertas por WhatsApp y hasta las líneas de colectivo para llegar a tu entrevista.'),
  ('contact_email', 'hola@worka.com.py'),
  ('contact_whatsapp', '+595 981 000 000'),
  ('payment_link', ''),
  ('help_text', 'Escribinos por WhatsApp o email y te respondemos en el día.')
on conflict (key) do nothing;

-- ---------- 3. Alta automática de perfiles (arregla el registro de empresas) ----------
-- Al crearse el usuario en Auth (email o Google), se crea el perfil con su rol
-- leído de user_metadata; si es empresa, también su fila en companies.
-- Corre como security definer, así que funciona aunque el email todavía no esté confirmado.

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := coalesce(meta->>'worka_role', 'candidate');
begin
  begin
    insert into public.profiles (id, role)
    values (new.id, v_role::user_role)
    on conflict (id) do nothing;
  exception when others then
    insert into public.profiles (id, role)
    values (new.id, 'candidate')
    on conflict (id) do nothing;
  end;

  -- Empresa en su propio bloque: un fallo aca (ej: RUC repetido) no debe
  -- tumbar el alta del usuario. Se omite ruc_check_status (usa su default).
  if v_role = 'company' and (meta ? 'company_name') then
    begin
      insert into public.companies (id, company_name, trade_name, ruc, location_city)
      values (
        new.id,
        meta->>'company_name',
        coalesce(nullif(meta->>'trade_name', ''), meta->>'company_name'),
        coalesce(meta->>'ruc', ''),
        coalesce(nullif(meta->>'location_city', ''), 'Asunción')
      )
      on conflict (id) do nothing;
    exception when others then
      null;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 4. RPCs para referencias laborales (link único público) ----------

create or replace function public.get_reference_by_token(ref_token uuid)
returns table (referrer_name text, relationship text, status text, candidate_name text)
language sql security definer set search_path = public
as $$
  select r.referrer_name, r.relationship, r.status, c.full_name
  from work_references r
  join candidates c on c.id = r.candidate_id
  where r.token = ref_token;
$$;

create or replace function public.confirm_reference(ref_token uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update work_references set status = 'confirmada' where token = ref_token;
  return found;
end;
$$;

-- ---------- 5. Políticas RLS ----------

alter table company_posts enable row level security;
alter table saved_jobs enable row level security;
alter table work_references enable row level security;
alter table company_followers enable row level security;
alter table interviews enable row level security;
alter table notifications enable row level security;
alter table messages enable row level security;
alter table boost_requests enable row level security;
alter table site_settings enable row level security;

drop policy if exists company_posts_read on company_posts;
create policy company_posts_read on company_posts for select using (true);
drop policy if exists company_posts_write on company_posts;
create policy company_posts_write on company_posts
  for all using (company_id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists saved_jobs_own on saved_jobs;
create policy saved_jobs_own on saved_jobs
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());

drop policy if exists work_references_own on work_references;
create policy work_references_own on work_references
  for all using (candidate_id = auth.uid() or fn_current_role() = 'admin')
  with check (candidate_id = auth.uid());
drop policy if exists work_references_company_read on work_references;
create policy work_references_company_read on work_references
  for select using (
    exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.candidate_id = work_references.candidate_id and j.company_id = auth.uid()
    )
  );

drop policy if exists company_followers_own on company_followers;
create policy company_followers_own on company_followers
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
drop policy if exists company_followers_company_read on company_followers;
create policy company_followers_company_read on company_followers
  for select using (company_id = auth.uid());

drop policy if exists interviews_company on interviews;
create policy interviews_company on interviews
  for all using (
    exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.id = application_id and j.company_id = auth.uid()
    )
  );
drop policy if exists interviews_candidate_read on interviews;
create policy interviews_candidate_read on interviews
  for select using (
    exists (select 1 from applications a where a.id = application_id and a.candidate_id = auth.uid())
  );
drop policy if exists interviews_candidate_update on interviews;
create policy interviews_candidate_update on interviews
  for update using (
    exists (select 1 from applications a where a.id = application_id and a.candidate_id = auth.uid())
  );

drop policy if exists notifications_own on notifications;
create policy notifications_own on notifications for select using (user_id = auth.uid());
drop policy if exists notifications_own_update on notifications;
create policy notifications_own_update on notifications for update using (user_id = auth.uid());

drop policy if exists messages_parties on messages;
create policy messages_parties on messages
  for all using (
    exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.id = application_id and (a.candidate_id = auth.uid() or j.company_id = auth.uid())
    )
  );

drop policy if exists boost_requests_company on boost_requests;
create policy boost_requests_company on boost_requests
  for all using (company_id = auth.uid() or fn_current_role() = 'admin')
  with check (company_id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists site_settings_read on site_settings;
create policy site_settings_read on site_settings for select using (true);
drop policy if exists site_settings_admin on site_settings;
create policy site_settings_admin on site_settings
  for all using (fn_current_role() = 'admin');

-- Búsqueda de talento: empresas ven candidatos visibles
drop policy if exists candidates_talent_search on candidates;
create policy candidates_talent_search on candidates
  for select using (visible_to_companies and fn_current_role() = 'company');

-- Perfil público /p/[id]: lectura anónima solo si el candidato lo activó
drop policy if exists candidates_public_profile on candidates;
create policy candidates_public_profile on candidates
  for select using (public_profile);

-- Postular: basta con que la postulacion sea del propio candidato
-- (el anti-spam se aplica a nivel de la app, no en RLS).
drop policy if exists applications_candidate_insert on applications;
create policy applications_candidate_insert on applications
  for insert with check (candidate_id = auth.uid());

-- ---------- 6. Storage: buckets y políticas ----------

insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('identidad', 'identidad', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('publico', 'publico', true)
on conflict (id) do nothing;

-- CVs: el dueño sube/lee; las empresas leen CVs de sus postulantes; admin todo
drop policy if exists cvs_owner_all on storage.objects;
create policy cvs_owner_all on storage.objects
  for all using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists cvs_company_read on storage.objects;
create policy cvs_company_read on storage.objects
  for select using (
    bucket_id = 'cvs' and exists (
      select 1 from applications a join jobs j on j.id = a.job_id
      where a.candidate_id::text = (storage.foldername(name))[1]
        and j.company_id = auth.uid()
    )
  );

-- Identidad: el dueño sube; solo admin lee (revisión de cédulas)
drop policy if exists identidad_owner_write on storage.objects;
create policy identidad_owner_write on storage.objects
  for insert with check (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists identidad_owner_update on storage.objects;
create policy identidad_owner_update on storage.objects
  for update using (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists identidad_admin_read on storage.objects;
create policy identidad_admin_read on storage.objects
  for select using (bucket_id = 'identidad' and fn_current_role() = 'admin');

-- Público (logo del sitio, logos de empresa): lectura libre, escribe admin o dueño
drop policy if exists publico_read on storage.objects;
create policy publico_read on storage.objects
  for select using (bucket_id = 'publico');
drop policy if exists publico_write on storage.objects;
create policy publico_write on storage.objects
  for all using (
    bucket_id = 'publico'
    and (fn_current_role() = 'admin' or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'publico'
    and (fn_current_role() = 'admin' or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ---------- 7. Hacerte admin ----------
-- Reemplazá el email por el tuyo y ejecutá esta línea una sola vez:
-- update profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'khaledbalcazar@gmail.com');
