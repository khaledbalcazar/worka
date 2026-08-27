-- Arreglo del 500 al listar usuarios en el backoffice
--
-- Síntoma: /admin no carga y en los logs de Supabase aparece
--
--   GET /admin/users → 500
--   "unable to fetch records: sql: Scan error on column index 12,
--    name email_change_token_new: converting NULL to string is unsupported"
--
-- Qué pasa: GoTrue (el servicio de autenticación de Supabase) lee esas
-- columnas como texto, no como texto que pueda ser nulo. Si una sola fila de
-- auth.users tiene NULL en cualquiera de ellas, la lista entera falla — no esa
-- fila, la consulta completa.
--
-- De dónde salen los NULL: filas creadas o modificadas por fuera del flujo
-- normal de registro (una inserción a mano, una importación, un update por
-- SQL). El registro normal las deja en cadena vacía.
--
-- El arreglo es reemplazar NULL por cadena vacía, que es lo que GoTrue espera.
-- No toca contraseñas, ni emails, ni sesiones: solo son campos de token de
-- verificación que, cuando están vacíos, significan "no hay ninguno pendiente".
--
-- Correr en Supabase → SQL Editor.

-- 1. Ver primero cuántas filas están afectadas y por qué columna.
select
  count(*) filter (where confirmation_token is null)     as confirmation_token,
  count(*) filter (where email_change is null)           as email_change,
  count(*) filter (where email_change_token_new is null) as email_change_token_new,
  count(*) filter (where email_change_token_current is null) as email_change_token_current,
  count(*) filter (where recovery_token is null)         as recovery_token,
  count(*) filter (where phone_change is null)           as phone_change,
  count(*) filter (where phone_change_token is null)     as phone_change_token,
  count(*) filter (where reauthentication_token is null) as reauthentication_token
from auth.users;

-- 2. El arreglo. Solo toca las filas que tienen algún NULL.
update auth.users set
  confirmation_token          = coalesce(confirmation_token, ''),
  email_change                = coalesce(email_change, ''),
  email_change_token_new      = coalesce(email_change_token_new, ''),
  email_change_token_current  = coalesce(email_change_token_current, ''),
  recovery_token              = coalesce(recovery_token, ''),
  phone_change                = coalesce(phone_change, ''),
  phone_change_token          = coalesce(phone_change_token, ''),
  reauthentication_token      = coalesce(reauthentication_token, '')
where confirmation_token is null
   or email_change is null
   or email_change_token_new is null
   or email_change_token_current is null
   or recovery_token is null
   or phone_change is null
   or phone_change_token is null
   or reauthentication_token is null;

-- 3. Volver a correr el paso 1: tienen que dar todos cero.
