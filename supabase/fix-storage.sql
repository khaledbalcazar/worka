-- ============================================================
-- Worka — Fix: "new row violates row-level security policy" al subir
-- fotos de identidad (o CV, o logo). Causa: el bucket existe pero le
-- faltan (o quedaron mal aplicadas) las politicas de storage.objects.
-- Ejecutar completo en el SQL Editor de Supabase. Idempotente: podés
-- correrlo las veces que quieras sin romper nada.
-- ============================================================

-- 1) Asegura que los 3 buckets existan con la visibilidad correcta.
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false)
  on conflict (id) do update set public = excluded.public;
insert into storage.buckets (id, name, public) values ('identidad', 'identidad', false)
  on conflict (id) do update set public = excluded.public;
insert into storage.buckets (id, name, public) values ('publico', 'publico', true)
  on conflict (id) do update set public = excluded.public;

-- 2) Helper de rol (por si esta migración se corre sola, sin schema.sql antes).
create or replace function public.fn_current_role()
returns user_role
language sql stable security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3) CVs: el dueño sube/lee/borra; empresas leen CVs de sus postulantes; admin todo.
drop policy if exists cvs_owner_all on storage.objects;
create policy cvs_owner_all on storage.objects
  for all using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists cvs_company_read on storage.objects;
create policy cvs_company_read on storage.objects
  for select using (
    bucket_id = 'cvs' and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.candidate_id::text = (storage.foldername(name))[1]
        and j.company_id = auth.uid()
    )
  );

-- 4) Identidad: el dueño sube/actualiza; solo admin lee (revisión de cédulas).
drop policy if exists identidad_owner_write on storage.objects;
create policy identidad_owner_write on storage.objects
  for insert with check (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists identidad_owner_update on storage.objects;
create policy identidad_owner_update on storage.objects
  for update using (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists identidad_owner_read on storage.objects;
create policy identidad_owner_read on storage.objects
  for select using (
    bucket_id = 'identidad' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists identidad_admin_read on storage.objects;
create policy identidad_admin_read on storage.objects
  for select using (bucket_id = 'identidad' and public.fn_current_role() = 'admin');

drop policy if exists identidad_admin_all on storage.objects;
create policy identidad_admin_all on storage.objects
  for all using (bucket_id = 'identidad' and public.fn_current_role() = 'admin');

-- 5) Público (logos, banners, avatares): lectura libre; escribe el dueño o admin.
drop policy if exists publico_read on storage.objects;
create policy publico_read on storage.objects
  for select using (bucket_id = 'publico');

-- Nota de seguridad: el avatar se guarda como "avatars/<uuid>.jpg" (el uuid va
-- en el NOMBRE del archivo, no en una carpeta propia), así que se valida el
-- nombre completo — si solo validáramos la carpeta "avatars", cualquier
-- usuario logueado podría sobrescribir el avatar de otro. El logo del sitio
-- ("site/logo.*") es exclusivo del admin.
drop policy if exists publico_write on storage.objects;
create policy publico_write on storage.objects
  for insert with check (
    bucket_id = 'publico'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or name = 'avatars/' || auth.uid()::text || '.jpg'
      or ((storage.foldername(name))[1] = 'site' and public.fn_current_role() = 'admin')
      or public.fn_current_role() = 'admin'
    )
  );

drop policy if exists publico_update on storage.objects;
create policy publico_update on storage.objects
  for update using (
    bucket_id = 'publico'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or name = 'avatars/' || auth.uid()::text || '.jpg'
      or ((storage.foldername(name))[1] = 'site' and public.fn_current_role() = 'admin')
      or public.fn_current_role() = 'admin'
    )
  );
