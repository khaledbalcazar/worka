-- ============================================================
-- Worka — Datos de demostración (ejecutar DESPUÉS de schema.sql)
-- Ejecutar en el SQL Editor de Supabase.
--
-- Crea 3 usuarios de prueba (contraseña: worka2026) con sus
-- perfiles, 1 empresa, 1 candidato, 1 admin y vacantes de ejemplo.
-- Solo para entornos de desarrollo: NO ejecutar en producción.
-- ============================================================

-- Usuarios de prueba en Supabase Auth
-- (insertar en auth.users funciona para desarrollo; en producción
--  los usuarios se crean por el flujo normal de registro)
insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'empresa@demo.worka.py',
   crypt('worka2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'candidata@demo.worka.py',
   crypt('worka2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin@demo.worka.py',
   crypt('worka2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into auth.identities
  (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email',
       jsonb_build_object('sub', id::text, 'email', email), now(), now(), now()
from auth.users
where email like '%@demo.worka.py';

-- Perfiles
insert into profiles (id, role) values
  ('00000000-0000-4000-a000-000000000001', 'company'),
  ('00000000-0000-4000-a000-000000000002', 'candidate'),
  ('00000000-0000-4000-a000-000000000003', 'admin');

-- Empresa demo
insert into companies
  (id, company_name, trade_name, ruc, description, location_city,
   is_verified, ruc_check_status, fast_responder)
values
  ('00000000-0000-4000-a000-000000000001',
   'Supermercados Guaraní S.A.', 'Super Guaraní', '80012345-6',
   'Cadena de supermercados con 12 sucursales en Gran Asunción.',
   'Asunción', true, 'coincide', true);

-- Candidata demo
insert into candidates
  (id, full_name, phone_whatsapp, phone_verified, location_city,
   preferences_industry, preferences_modality, first_job_mode, alerts_enabled)
values
  ('00000000-0000-4000-a000-000000000002',
   'María Fernanda González', '+595981234567', true, 'Asunción',
   array['Ventas', 'Atención al Cliente'], 'Full-time', true, true);

-- Vacantes de ejemplo
insert into jobs
  (id, company_id, title, description, industry, modality, salary_range,
   nearby_transit, status, requires_experience, urgent, featured, views_count)
values
  ('10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000001',
   'Cajero/a para sucursal centro',
   'Atención al cliente, manejo de caja registradora y arqueo diario. Horario rotativo de lunes a sábado. No se requiere experiencia previa: nosotros te capacitamos.',
   'Ventas', 'Presencial', 'Gs. 2.800.000 + bonificaciones',
   'Líneas 12, 30 y 56', 'Activo', false, true, true, 342),
  ('10000000-0000-4000-a000-000000000002',
   '00000000-0000-4000-a000-000000000001',
   'Repositor/a de mercaderías',
   'Reposición de mercaderías en góndolas, control de vencimientos y apoyo en depósito. Turno mañana o tarde.',
   'Logística', 'Presencial', 'Gs. 2.800.000',
   'Líneas 15 y 23', 'Activo', false, false, false, 156);

-- Preguntas de filtro
insert into job_questions (job_id, question, position) values
  ('10000000-0000-4000-a000-000000000001', '¿Podés trabajar fines de semana?', 1),
  ('10000000-0000-4000-a000-000000000001', '¿Vivís en Asunción o alrededores?', 2),
  ('10000000-0000-4000-a000-000000000002', '¿Podés levantar peso (hasta 20 kg)?', 1);

-- Postulación de ejemplo
insert into applications (job_id, candidate_id, status) values
  ('10000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-a000-000000000002', 'Pendiente');
