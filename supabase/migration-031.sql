-- Worka Evaluar · Más ajustes por concurso
--
-- Requiere la 025, la 029 y la 030 aplicadas. Correr en orden.
--
-- Los tres se leen aparte y no desde evaluar_load a propósito: esa función
-- ya se reescribió tres veces para sumarle campos, y cada reescritura de un
-- plpgsql largo es una oportunidad de romper algo que ya funciona.

alter table evaluar_processes
  -- Orden aleatorio de las preguntas dentro de cada etapa. La barajada es
  -- estable por candidato (se siembra con su id), así que refrescar la
  -- pantalla no le reordena lo que ya venía contestando.
  add column if not exists shuffle_questions boolean not null default false,

  -- Cupo de participantes. Cuando se llena, la vacante enlazada deja de
  -- aceptar gente nueva. Sirve para las búsquedas que se publican en redes y
  -- de golpe traen cuatrocientas personas para un puesto.
  add column if not exists max_participants smallint,

  -- Si el candidato ve su propio puntaje al terminar. Por defecto no: en una
  -- prueba de personalidad no hay puntaje que mostrar, y en una de
  -- conocimientos mostrarlo convierte cada rechazo en una discusión sobre el
  -- número en vez de sobre el puesto.
  add column if not exists show_score_to_candidate boolean not null default false;
