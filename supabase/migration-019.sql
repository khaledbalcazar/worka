-- ============================================================
-- Worka — Migración 019: Worka Freelancers
--
-- Extensión opt-in sobre la cuenta de candidato. Al aceptar unirse
-- se crea un `freelancer_profiles` (1:1 con candidates). El freelancer
-- arma su perfil público: historia, servicios, portfolio, links de pago
-- y personalización. Los clientes le piden presupuesto (quote_requests).
--
-- Worka NUNCA procesa pagos: solo guarda los links que el freelancer pega
-- (Mercado Pago, PayPal, Stripe, transferencia…). El cobro ocurre afuera.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

-- Perfil de freelancer (1:1 con el candidato que aceptó unirse)
create table if not exists freelancer_profiles (
  id uuid primary key references candidates (id) on delete cascade,
  slug text not null unique,
  headline text not null default '',            -- "Diseñador UX/UI", una línea
  bio text not null default '',                 -- historia / sobre mí (markdown liviano)
  category text not null default 'General',     -- Diseño, Desarrollo, Marketing…
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  hourly_rate integer,                          -- tarifa/hora en `currency`; null = a convenir
  currency text not null default 'PYG',
  availability text not null default 'disponible'
    check (availability in ('disponible', 'ocupado', 'no_disponible')),
  years_experience smallint,
  location_city text not null default '',
  country text not null default 'py',
  website_url text,
  linkedin_url text,
  instagram_url text,
  github_url text,
  behance_url text,
  banner_url text,
  accent_color text not null default '#7C5CFC', -- personalización del perfil
  is_public boolean not null default true,
  is_verified boolean not null default false,
  featured boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_freelancers_category on freelancer_profiles (country, category);
create index if not exists idx_freelancers_public on freelancer_profiles (is_public, featured);

-- Servicios / paquetes que ofrece (estilo "desde X, entrega en Y días")
create table if not exists freelancer_services (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  price_from integer,                           -- "desde"; null = a convenir
  currency text not null default 'PYG',
  delivery_days smallint,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_services_freelancer on freelancer_services (freelancer_id, sort);

-- Portfolio: proyectos con imagen y link
create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text,
  link_url text,
  role text,                                    -- rol en el proyecto
  client text,
  year smallint,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_freelancer on portfolio_items (freelancer_id, sort);

-- Links de pago personalizables (Worka no procesa el dinero)
create table if not exists payment_links (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles (id) on delete cascade,
  label text not null,                          -- "Mercado Pago", "PayPal"…
  url text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_paylinks_freelancer on payment_links (freelancer_id, sort);

-- Solicitudes de presupuesto que llegan al freelancer
create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references freelancer_profiles (id) on delete cascade,
  requester_id uuid references profiles (id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  budget text,                                  -- presupuesto estimado (texto libre)
  status text not null default 'nuevo'
    check (status in ('nuevo', 'respondido', 'cerrado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_quotes_freelancer on quote_requests (freelancer_id, created_at desc);

-- updated_at automático (reutiliza el trigger genérico del esquema base)
drop trigger if exists trg_touch_freelancer on freelancer_profiles;
create trigger trg_touch_freelancer
  before update on freelancer_profiles
  for each row execute function fn_touch_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table freelancer_profiles enable row level security;
alter table freelancer_services enable row level security;
alter table portfolio_items enable row level security;
alter table payment_links enable row level security;
alter table quote_requests enable row level security;

-- Perfil: público si is_public; el dueño y el admin siempre.
drop policy if exists freelancers_public_read on freelancer_profiles;
create policy freelancers_public_read on freelancer_profiles
  for select using (is_public or id = auth.uid() or fn_current_role() = 'admin');

drop policy if exists freelancers_owner_write on freelancer_profiles;
create policy freelancers_owner_write on freelancer_profiles
  for all using (id = auth.uid() or fn_current_role() = 'admin')
  with check (id = auth.uid() or fn_current_role() = 'admin');

-- Helper para las tablas hijas: ¿el perfil padre es visible?
-- (público, o el usuario es el dueño / admin)
-- Servicios
drop policy if exists services_read on freelancer_services;
create policy services_read on freelancer_services
  for select using (
    exists (
      select 1 from freelancer_profiles f
      where f.id = freelancer_id
        and (f.is_public or f.id = auth.uid() or fn_current_role() = 'admin')
    )
  );

drop policy if exists services_owner_write on freelancer_services;
create policy services_owner_write on freelancer_services
  for all using (freelancer_id = auth.uid() or fn_current_role() = 'admin')
  with check (freelancer_id = auth.uid() or fn_current_role() = 'admin');

-- Portfolio
drop policy if exists portfolio_read on portfolio_items;
create policy portfolio_read on portfolio_items
  for select using (
    exists (
      select 1 from freelancer_profiles f
      where f.id = freelancer_id
        and (f.is_public or f.id = auth.uid() or fn_current_role() = 'admin')
    )
  );

drop policy if exists portfolio_owner_write on portfolio_items;
create policy portfolio_owner_write on portfolio_items
  for all using (freelancer_id = auth.uid() or fn_current_role() = 'admin')
  with check (freelancer_id = auth.uid() or fn_current_role() = 'admin');

-- Links de pago
drop policy if exists paylinks_read on payment_links;
create policy paylinks_read on payment_links
  for select using (
    exists (
      select 1 from freelancer_profiles f
      where f.id = freelancer_id
        and (f.is_public or f.id = auth.uid() or fn_current_role() = 'admin')
    )
  );

drop policy if exists paylinks_owner_write on payment_links;
create policy paylinks_owner_write on payment_links
  for all using (freelancer_id = auth.uid() or fn_current_role() = 'admin')
  with check (freelancer_id = auth.uid() or fn_current_role() = 'admin');

-- Solicitudes de presupuesto:
--   - cualquier persona autenticada puede crear una (requester_id = ella misma)
--   - las lee el freelancer dueño, quien la envió, o el admin
--   - las actualiza (cambia estado) solo el freelancer dueño o el admin
drop policy if exists quotes_insert on quote_requests;
create policy quotes_insert on quote_requests
  for insert with check (requester_id = auth.uid() or requester_id is null);

drop policy if exists quotes_read on quote_requests;
create policy quotes_read on quote_requests
  for select using (
    freelancer_id = auth.uid()
    or requester_id = auth.uid()
    or fn_current_role() = 'admin'
  );

drop policy if exists quotes_owner_update on quote_requests;
create policy quotes_owner_update on quote_requests
  for update using (freelancer_id = auth.uid() or fn_current_role() = 'admin')
  with check (freelancer_id = auth.uid() or fn_current_role() = 'admin');
