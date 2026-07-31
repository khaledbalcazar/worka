-- ============================================================
-- Worka — Migración 018: ejercicios en la Academia
--
-- Cada lección puede tener un quiz (preguntas de opción múltiple)
-- para que el usuario se autoevalúe. El formato es un array JSON:
--   [{ "q": "Pregunta", "options": ["A","B","C"], "answer": 1 }]
-- donde "answer" es el índice de la opción correcta.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

alter table lessons
  add column if not exists quiz jsonb not null default '[]'::jsonb;

-- Ejercicios de arranque para las lecciones de los cursos seed.
update lessons set quiz = $q$[
  {"q":"¿Cuánto conviene investigar sobre la empresa antes de la entrevista?",
   "options":["Nada, improviso","Unos 15 minutos","No hace falta"],"answer":1}
]$q$::jsonb
where title = 'Investigá la empresa' and quiz = '[]'::jsonb;

update lessons set quiz = $q$[
  {"q":"¿Con cuánta anticipación conviene llegar a la entrevista?",
   "options":["Sobre la hora","10 minutos antes","Media hora tarde está bien"],"answer":1},
  {"q":"¿Qué conviene llevar?","options":["Nada","Documento y una copia del CV","Solo el celular"],"answer":1}
]$q$::jsonb
where title = 'Puntualidad y presentación' and quiz = '[]'::jsonb;

update lessons set quiz = $q$[
  {"q":"¿Cuál es un ejemplo de habilidad blanda?",
   "options":["Manejar Excel","Puntualidad","Conducir"],"answer":1}
]$q$::jsonb
where title = 'Habilidades blandas y técnicas' and quiz = '[]'::jsonb;

update lessons set quiz = $q$[
  {"q":"¿Qué activás en Worka para ver vacantes sin requisito de experiencia?",
   "options":["El modo primer empleo","El chat","Las notificaciones"],"answer":0}
]$q$::jsonb
where title = 'El "modo primer empleo"' and quiz = '[]'::jsonb;
