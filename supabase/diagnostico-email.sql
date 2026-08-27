-- Diagnóstico: "No encontramos una cuenta de Worka con ese email"
--
-- Correr en Supabase → SQL Editor. Cambiá el email de la primera línea por el
-- que estás cargando. Cada bloque contesta una posibilidad distinta.

-- ── 1. ¿Existe esa cuenta, y está confirmada? ─────────────────
--
-- Si devuelve 0 filas, esa persona no está registrada en Worka con ese email
-- exacto (ojo con puntos y alias de Gmail: para Worka son correos distintos).
--
-- Si aparece pero confirmed_at está vacío, se registró y nunca confirmó. La
-- fila existe igual, así que esto no bloquea la búsqueda, pero conviene saberlo.
select
  id,
  email,
  email_confirmed_at,
  created_at
from auth.users
where lower(email) = lower('khaledbalcazarecommerce@gmail.com');

-- ── 2. ¿La migración 035 está aplicada? ───────────────────────
--
-- Buscá en el resultado la palabra evaluar_accounts.
--   Si dice evaluar_accounts  → la 035 está aplicada.
--   Si dice evaluar_processes → falta correrla, y esa es la causa.
select pg_get_functiondef(oid) as definicion
from pg_proc
where proname = 'fn_user_id_by_email';

-- ── 3. ¿Tu cuenta pasa la reja? ───────────────────────────────
--
-- La reja mira a QUIEN CONSULTA, no a quien se busca. Tiene que devolver una
-- fila con tu company_id. Si vuelve vacío, tu usuario no tiene cuenta de
-- Evaluar y por eso la función no responde.
--
-- Cambiá el email por el tuyo, con el que entrás al panel.
select a.company_id, a.plan, a.status
from evaluar_accounts a
join auth.users u on u.id = a.company_id
where lower(u.email) = lower('khaledbalcazar@gmail.com');

-- ── 4. La prueba directa ──────────────────────────────────────
--
-- Esto es exactamente lo que hace la pantalla, sin la reja de por medio.
-- Si devuelve un uuid, el email está bien y el problema es la reja (paso 2).
select id as encontrado
from auth.users
where lower(email) = lower(trim('khaledbalcazarecommerce@gmail.com'))
limit 1;
