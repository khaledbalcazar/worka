-- ============================================================
-- Worka — Migración 057: cobro con tarjeta (Lemon Squeezy)
--
-- Requiere la 047 (subscriptions) y la 022 (evaluar_accounts). Idempotente.
--
-- Hasta acá todo se cobraba a mano: link de pago, aviso de "ya pagué" y un
-- admin que confirmaba. Desde esta migración el checkout de Lemon Squeezy
-- cobra con tarjeta, en dólares y con renovación automática, y su webhook
-- activa el plan solo. El cobro manual sigue funcionando al lado, para quien
-- paga por transferencia o Bancard.
--
-- Las dos tablas nuevas las escribe solo el servidor (service role):
--   billing_subscriptions  el estado de cada suscripción de Lemon Squeezy;
--   billing_events         cada webhook recibido, una sola vez (Lemon Squeezy
--                          reintenta si no respondemos 200, y un reintento no
--                          puede activar ni extender dos veces).
-- ============================================================

create table if not exists billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'lemonsqueezy',
  provider_subscription_id text not null unique,
  provider_customer_id text,
  -- Quién paga: la empresa (companies.id) o la persona (candidates.id).
  user_id uuid not null references profiles (id) on delete cascade,
  product text not null check (product in ('enterprise', 'pro', 'evaluar')),
  plan text not null,
  months smallint not null check (months in (1, 3, 12)),
  -- Estado tal cual lo manda Lemon Squeezy: on_trial, active, paused,
  -- past_due, unpaid, cancelled, expired.
  status text not null,
  renews_at timestamptz,
  ends_at timestamptz,
  card_brand text,
  card_last_four text,
  test_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_subs_user
  on billing_subscriptions (user_id, product);

alter table billing_subscriptions enable row level security;

drop policy if exists billing_subs_own on billing_subscriptions;
create policy billing_subs_own on billing_subscriptions
  for select using (user_id = auth.uid() or fn_current_role() = 'admin');

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  -- sha256 del cuerpo crudo: dos entregas del mismo evento dan la misma clave.
  event_key text not null unique,
  event_name text not null,
  provider_object_id text,
  test_mode boolean not null default false,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

alter table billing_events enable row level security;

drop policy if exists billing_events_admin on billing_events;
create policy billing_events_admin on billing_events
  for select using (fn_current_role() = 'admin');

-- Destacados pagados con tarjeta: el pedido de Lemon Squeezy que lo pagó.
alter table boost_requests
  add column if not exists provider_order_id text;
