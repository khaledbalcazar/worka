-- ============================================================
-- Worka — Migración 058: cobro con tarjeta vía dLocal Go
--
-- Requiere la 047 (subscriptions) y la 022 (evaluar_accounts). Idempotente
-- y no destructiva: no borra ni cambia nada de la 057 (Lemon Squeezy), cuyo
-- historial y suscripciones vigentes quedan como estaban. Se puede correr
-- con o sin la 057 aplicada.
--
-- dLocal Go cobra pagos únicos: cada uno cubre 1, 3 o 12 meses (o un
-- destacado) y no se renueva solo. El pago no lleva quién pagó ni qué
-- compró, solo nuestro id como order_id; por eso la compra se guarda acá
-- ANTES de ir al checkout, y la confirmación lee esta fila para saber a
-- quién activar.
--
-- La escriben solo el servidor (service role):
--   billing_payments  cada compra con tarjeta y su estado en dLocal Go;
--                     activated_at marca que ya se activó (una sola vez).
--   billing_events    cada aviso recibido, para revisar a mano (la misma
--                     tabla de la 057; se crea si no existe).
-- ============================================================

create table if not exists billing_payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'dlocalgo',
  -- Id del pago en dLocal Go ("DP-…"). Null hasta que se crea el checkout.
  provider_payment_id text unique,
  -- Quién paga: la empresa (companies.id) o la persona (candidates.id).
  payer_id uuid not null references profiles (id) on delete cascade,
  -- Quién apretó el botón (el dueño, un admin del equipo o la persona).
  buyer_id uuid not null references profiles (id) on delete cascade,
  product text not null check (product in ('enterprise', 'pro', 'evaluar', 'boost')),
  plan text not null,
  months smallint check (months in (1, 3, 12)),
  boost_id uuid references boost_requests (id) on delete set null,
  -- Lo que se cobra: guaraníes enteros o dólares.
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null check (currency in ('PYG', 'USD')),
  -- CREATED (todavía sin checkout), FAILED (no se pudo crear) o el estado
  -- de dLocal Go: PENDING, PAID, REJECTED, CANCELLED, EXPIRED.
  status text not null default 'CREATED',
  paid_at timestamptz,
  activated_at timestamptz,
  error text,
  test_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_payments_payer
  on billing_payments (payer_id, product);

-- El cron diario busca los pagos recientes que quedaron sin activar.
create index if not exists idx_billing_payments_pending
  on billing_payments (created_at)
  where activated_at is null;

alter table billing_payments enable row level security;

drop policy if exists billing_payments_own on billing_payments;
create policy billing_payments_own on billing_payments
  for select using (payer_id = auth.uid() or buyer_id = auth.uid() or fn_current_role() = 'admin');

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
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

-- Destacados pagados con tarjeta: el pago que lo pagó (en la 057 ya existe).
alter table boost_requests
  add column if not exists provider_order_id text;
