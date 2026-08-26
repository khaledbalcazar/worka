-- ============================================================
-- Worka — Migración 027: avisos por correo
--
-- Hasta acá lo único que salía por email eran las alertas de empleo. Todo lo
-- demás vivía solo en la campanita, que solo ve quien entra a la app: la
-- empresa no se enteraba de que alguien se postuló hasta que abría el panel,
-- y el candidato no sabía si su postulación había llegado.
--
-- Se agrega la preferencia por lado (se puede apagar) y la marca de cuándo se
-- mandó cada aviso, para no repetir.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table notifications
  add column if not exists emailed_at timestamptz;

-- Apagar los correos tiene que ser posible: obligar a recibirlos es la forma
-- más rápida de que marquen el remitente como spam y se rompa el envío para
-- todos, incluidas las invitaciones a evaluaciones.
alter table candidates
  add column if not exists email_notifications boolean not null default true;

alter table companies
  add column if not exists email_notifications boolean not null default true;
