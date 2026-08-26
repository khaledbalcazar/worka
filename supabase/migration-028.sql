-- ============================================================
-- Worka — Migración 028: plantillas de correo editables
--
-- Los textos de los correos estaban escritos en el código: cambiar una coma
-- exigía un despliegue. Ahora el admin los edita desde /admin.
--
-- La tabla guarda SOLO lo editado. El texto por defecto vive en el código
-- (lib/email-templates.ts), así que una plantilla nueva ya sale con su
-- redacción sin necesidad de sembrar nada, y "restaurar" es simplemente
-- borrar la fila.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

create table if not exists email_templates (
  key text primary key,
  subject text not null,
  body text not null,
  -- Apagar una plantilla corta ese correo sin tocar el resto del sistema.
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id) on delete set null
);

alter table email_templates enable row level security;

-- Solo el admin las ve y las edita. El envío corre con la clave de servicio,
-- que no pasa por RLS.
drop policy if exists email_templates_admin on email_templates;
create policy email_templates_admin on email_templates
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');
