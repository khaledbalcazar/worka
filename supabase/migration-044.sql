-- ============================================================
-- Worka — Migración 044: resumen de las vacantes a las que me postulé
-- Ejecutar en el SQL Editor de Supabase. Idempotente y no destructiva:
-- solo crea una función de lectura. No toca tablas ni políticas.
-- ============================================================
--
-- Problema (incidente "Cannot read properties of null (reading
-- 'filter_questions')" en Mis postulaciones y Mensajes):
--
-- La política jobs_public_read (migración 005) deja que un candidato lea
-- solo las vacantes con status = 'Activo'. Cuando la empresa pausa o cierra
-- una vacante, o pasa a moderación, la postulación sigue existiendo pero el
-- join applications -> jobs le llega al candidato como null. La app asumía
-- que siempre había vacante y la página entera se caía.
--
-- Por qué una función y no otra política sobre jobs: una política del tipo
-- "puedo leer las vacantes a las que me postulé" abriría la fila completa de
-- jobs (descripción, contadores, etc.) a cualquier consulta directa a la API.
-- Para mostrar la postulación alcanza con el título, el estado y el nombre y
-- logo de la empresa; la función devuelve solo eso y solo para las
-- postulaciones de quien la llama (auth.uid()).

create or replace function public.fn_my_applied_job_summaries()
returns table (
  job_id uuid,
  title text,
  status text,
  company_id uuid,
  company_name text,
  company_logo_url text,
  company_city text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    j.id,
    j.title,
    j.status::text,
    c.id,
    coalesce(nullif(c.trade_name, ''), c.company_name),
    c.logo_url,
    c.location_city
  from applications a
  join jobs j on j.id = a.job_id
  left join companies c on c.id = j.company_id
  where a.candidate_id = auth.uid();
$$;

revoke all on function public.fn_my_applied_job_summaries() from public;
grant execute on function public.fn_my_applied_job_summaries() to authenticated;
