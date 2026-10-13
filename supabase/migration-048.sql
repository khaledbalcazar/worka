-- ============================================================
-- Worka — Migración 048: recibos digitales (sin valor fiscal) y precios
-- en la moneda de cada país.
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de la 047. Copiar el
-- archivo COMPLETO, sin seleccionar texto en el editor.
-- Idempotente y no destructiva.
-- ============================================================
--
-- Cada compra confirmada (plan o destaque) genera un recibo con número
-- correlativo (001-001-0000001) y un código de verificación que va en el QR.
-- Worka todavía no tiene RUC: el recibo es un comprobante de pago digital
-- SIN VALOR FISCAL, y así lo dice el propio documento.

-- Moneda y datos de facturación del aviso de pago.
alter table payment_requests add column if not exists currency text not null default 'PYG';
alter table payment_requests add column if not exists amount_local numeric(14, 2);
alter table payment_requests add column if not exists billing_name text;
alter table payment_requests add column if not exists billing_doc text;

create sequence if not exists receipt_number_seq start 1;

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  number bigint not null unique default nextval('receipt_number_seq'),
  code text not null unique,
  user_id uuid not null references profiles (id) on delete cascade,
  payment_request_id uuid unique references payment_requests (id) on delete set null,
  boost_request_id uuid unique references boost_requests (id) on delete set null,
  customer_name text not null,
  customer_doc text,
  customer_email text,
  items jsonb not null,
  currency text not null default 'PYG',
  total numeric(14, 2) not null,
  total_gs integer not null,
  payment_reference text,
  status text not null default 'emitido' check (status in ('emitido', 'anulado')),
  issued_at timestamptz not null default now()
);
create index if not exists idx_receipts_user on receipts (user_id, issued_at desc);

alter table receipts enable row level security;
-- Cada uno ve sus recibos; el admin, todos. Se crean solo desde el servidor
-- (cliente de servicio) al confirmar el pago: no hay política de insert.
drop policy if exists receipts_read on receipts;
create policy receipts_read on receipts
  for select using (user_id = auth.uid() or fn_current_role() = 'admin');
drop policy if exists receipts_admin_update on receipts;
create policy receipts_admin_update on receipts
  for update using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- Verificación pública por el código del QR. Devuelve lo mínimo para
-- confirmar que el recibo existe, sin el email ni el documento del cliente.
create or replace function public.fn_verify_receipt(p_code text)
returns table (
  number bigint,
  issued_at timestamptz,
  customer text,
  concept text,
  currency text,
  total numeric,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select r.number,
         r.issued_at,
         -- Nombre parcial: "Camila B." / "Supermercados G."
         split_part(r.customer_name, ' ', 1) ||
           case when split_part(r.customer_name, ' ', 2) <> ''
                then ' ' || left(split_part(r.customer_name, ' ', 2), 1) || '.'
                else '' end,
         coalesce(r.items -> 0 ->> 'description', 'Compra en Worka'),
         r.currency,
         r.total,
         r.status
  from receipts r
  where r.code = upper(replace(trim(p_code), ' ', ''));
$$;
revoke all on function public.fn_verify_receipt(text) from public;
grant execute on function public.fn_verify_receipt(text) to anon, authenticated;
