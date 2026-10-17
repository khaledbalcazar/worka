-- Migración 050: ciudad propia de cada vacante.
--
-- Hasta ahora la vacante no guardaba ciudad: el formulario la pedía pero se
-- descartaba, y el sitio mostraba la ciudad de la empresa. Una empresa de
-- Asunción que publicaba en Encarnación salía «en Asunción» en el listado,
-- el mapa, Google for Jobs y las alertas.
--
-- Las vacantes existentes toman la ciudad de su empresa (lo que ya se veía),
-- así no cambia nada para ellas hasta que la empresa la edite.

alter table jobs add column if not exists city text;

update jobs j
set city = c.location_city
from companies c
where c.id = j.company_id
  and j.city is null;

create index if not exists idx_jobs_city on jobs (lower(city));
