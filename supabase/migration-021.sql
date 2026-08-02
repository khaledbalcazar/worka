-- ============================================================
-- Worka — Migración 021: Reseñas de empresas (estilo Glassdoor)
--
-- Los candidatos opinan sobre empleadores, estén o no registrados en
-- Worka. Cada reseña se agrupa por `company_slug` (nombre normalizado).
-- Si el empleador tiene cuenta en Worka, se guarda `company_id` y en la
-- ficha aparece como "Verificada en Worka".
--
-- Una reseña por persona y por empresa (anti-spam).
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

create table if not exists company_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies (id) on delete set null, -- null = empleador no registrado
  company_name text not null,
  company_slug text not null,                    -- nombre normalizado para agrupar
  country text not null default 'py',
  reviewer_id uuid not null references profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  role text,                                     -- puesto / cargo
  employment_type text not null default 'ex'
    check (employment_type in ('actual', 'ex', 'entrevista')),
  title text not null default '',
  body text not null default '',
  pros text,
  cons text,
  would_recommend boolean,
  status text not null default 'visible'
    check (status in ('visible', 'oculta')),
  created_at timestamptz not null default now(),
  unique (company_slug, reviewer_id)
);

create index if not exists idx_reviews_slug on company_reviews (company_slug, status);
create index if not exists idx_reviews_country on company_reviews (country, status);
create index if not exists idx_reviews_company on company_reviews (company_id);

-- ── RLS ──
alter table company_reviews enable row level security;

-- Lectura pública de las visibles; el autor y el admin ven las suyas siempre.
drop policy if exists reviews_public_read on company_reviews;
create policy reviews_public_read on company_reviews
  for select using (
    status = 'visible' or reviewer_id = auth.uid() or fn_current_role() = 'admin'
  );

-- Cada persona escribe reseñas a su nombre.
drop policy if exists reviews_insert on company_reviews;
create policy reviews_insert on company_reviews
  for insert with check (reviewer_id = auth.uid());

-- El autor edita/borra la suya; el admin modera cualquiera.
drop policy if exists reviews_owner_write on company_reviews;
create policy reviews_owner_write on company_reviews
  for update using (reviewer_id = auth.uid() or fn_current_role() = 'admin')
  with check (reviewer_id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists reviews_owner_delete on company_reviews;
create policy reviews_owner_delete on company_reviews
  for delete using (reviewer_id = auth.uid() or fn_current_role() = 'admin');
