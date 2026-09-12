-- ============================================================
-- Worka — Migración 040: correo de novedades (vacantes verificadas)
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- El cron /api/cron/resumen-empleos corre todos los días pero cada persona
-- recibe un correo cada siete. Para saber a quién le toca hace falta guardar
-- cuándo se le mandó el último.
--
-- Va en candidates y no en una tabla nueva de "envíos" a propósito: lo único
-- que se necesita saber es la última fecha, y una tabla de historial de
-- envíos crece para siempre sin que nadie la lea.

alter table candidates
  add column if not exists digest_sent_at timestamptz;

-- El cron busca "a quién le toca" ordenando por esta columna con los nulos
-- primero. Sin índice, cada corrida recorre la tabla entera de candidatos.
create index if not exists idx_candidates_digest
  on candidates (digest_sent_at nulls first)
  where alerts_enabled;

-- Interruptor del admin. Si la fila no existe, el correo sale igual: se crea
-- acá para que aparezca en /admin y se pueda apagar sin tocar código.
insert into site_settings (key, value)
values ('digest_enabled', 'true')
on conflict (key) do nothing;

-- Nota sobre la baja: no hace falta tabla de tokens. El enlace del correo
-- lleva el id del usuario firmado con HMAC (lib/unsubscribe.ts), así que se
-- verifica sin guardar nada y sin que la persona inicie sesión.
