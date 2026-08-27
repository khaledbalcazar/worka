-- Crear el bucket de entrevistas en video
--
-- Síntoma: el candidato graba, toca enviar y falla; o graba y el video no
-- aparece nunca del lado de la empresa.
--
-- Causa: la migración 029 crea el bucket con un INSERT sobre storage.buckets,
-- y esa sentencia necesita permisos que el editor SQL no siempre tiene. Las
-- demás sentencias de esa migración sí se aplicaron (por eso la columna
-- max_seconds existe), así que es fácil no darse cuenta de que faltó solo
-- esta.
--
-- ── La forma más simple: desde el panel ───────────────────────
--
-- Supabase → Storage → New bucket
--   Name:   entrevistas
--   Public: NO (desmarcado, es importante)
-- Y después correr solo el paso 2 de este archivo.
--
-- Si el panel no está a mano, probá el paso 1.

-- ── 1. Crear el bucket ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entrevistas',
  'entrevistas',
  false,
  52428800, -- 50 MB
  array['video/webm', 'video/mp4']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── 2. Quién puede mirar los videos ───────────────────────────
--
-- Privado: la grabación de alguien buscando trabajo no puede quedar en una
-- URL que se adivina. La empresa dueña del proceso la ve desde su sesión, y
-- el servidor firma un enlace de diez minutos cuando alguien toca reproducir.
--
-- La subida la hace el servidor con la service role, porque el candidato no
-- tiene cuenta: su credencial es el token del enlace.
drop policy if exists ev_video_lee_empresa on storage.objects;
create policy ev_video_lee_empresa on storage.objects
  for select using (
    bucket_id = 'entrevistas'
    and exists (
      select 1
      from evaluar_participants pa
      join evaluar_processes p on p.id = pa.process_id
      where p.company_id = auth.uid()
        and split_part(storage.objects.name, '/', 1) = pa.id::text
    )
  );

-- ── 3. Comprobar ──────────────────────────────────────────────
-- Tiene que devolver una fila, con public en false.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'entrevistas';
