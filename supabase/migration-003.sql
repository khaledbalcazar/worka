-- ============================================================
-- Worka — Migración 003: foto de perfil, bio, stats reales
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

-- Foto de perfil y bio del candidato (visibles para empresas y perfil público)
alter table candidates add column if not exists avatar_url text;
alter table candidates add column if not exists bio text;

-- Referencias: nuevo estado 'generada' (link creado, esperando confirmación)
alter table work_references drop constraint if exists work_references_status_check;
alter table work_references
  add constraint work_references_status_check
  check (status in ('pendiente', 'generada', 'confirmada'));

-- Contador de vistas de vacantes: función pública y segura para sumar 1.
-- La llama cualquiera al abrir el detalle (no expone datos, solo incrementa).
create or replace function public.increment_job_views(job uuid)
returns void
language sql security definer set search_path = public
as $$
  update public.jobs set views_count = views_count + 1 where id = job;
$$;

grant execute on function public.increment_job_views(uuid) to anon, authenticated;
