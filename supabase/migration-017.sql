-- ============================================================
-- Worka — Migración 017: Academia Worka (cursos)
--
-- Cursos, lecciones y progreso de cada usuario. Cualquier persona
-- registrada tiene acceso a los cursos publicados. El admin crea y
-- edita todo desde el backoffice.
--
-- Ejecutar en el SQL Editor. Idempotente.
-- ============================================================

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_url text,
  category text not null default 'General',   -- Entrevistas, Habilidades, Empleo…
  level text not null default 'Básico'
    check (level in ('Básico', 'Intermedio', 'Avanzado')),
  status text not null default 'borrador'
    check (status in ('borrador', 'publicado')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  section text not null default '',           -- agrupa lecciones en módulos
  title text not null,
  content text not null default '',           -- markdown liviano
  video_url text,
  duration_min integer not null default 5,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_lessons_course on lessons (course_id, sort);

-- Progreso: una fila por lección completada por un usuario.
create table if not exists lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists idx_completions_user on lesson_completions (user_id, course_id);

-- ── RLS ──
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_completions enable row level security;

drop policy if exists courses_public_read on courses;
create policy courses_public_read on courses
  for select using (status = 'publicado' or fn_current_role() = 'admin');

drop policy if exists courses_admin_write on courses;
create policy courses_admin_write on courses
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- Las lecciones se ven si su curso es visible.
drop policy if exists lessons_read on lessons;
create policy lessons_read on lessons
  for select using (
    exists (
      select 1 from courses c
      where c.id = course_id
        and (c.status = 'publicado' or fn_current_role() = 'admin')
    )
  );

drop policy if exists lessons_admin_write on lessons;
create policy lessons_admin_write on lessons
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- Cada usuario gestiona su propio progreso.
drop policy if exists completions_own on lesson_completions;
create policy completions_own on lesson_completions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── 3 cursos de arranque ──

insert into courses (slug, title, description, category, level, status, sort)
values
  ('preparate-para-entrevistas', 'Preparate para tus entrevistas',
   'Todo lo que necesitás para llegar seguro a una entrevista de trabajo: qué decir, cómo prepararte y cómo responder las preguntas más comunes.',
   'Entrevistas', 'Básico', 'publicado', 1),
  ('descubri-tus-habilidades', 'Descubrí tus habilidades',
   'Aprendé a identificar tus fortalezas, ponerlas en tu CV y contarlas con ejemplos concretos que convencen a las empresas.',
   'Habilidades', 'Básico', 'publicado', 2),
  ('tu-primer-empleo', 'Tu primer empleo: guía completa',
   'Sin experiencia también se consigue trabajo. Esta guía te lleva paso a paso desde armar tu perfil hasta tu primer día.',
   'Empleo', 'Básico', 'publicado', 3)
on conflict (slug) do nothing;

-- Lecciones del curso de entrevistas
insert into lessons (course_id, section, title, content, duration_min, sort)
select c.id, s.section, s.title, s.content, s.dur, s.sort
from courses c
cross join (values
  ('Antes de la entrevista', 'Investigá la empresa',
   $md$Antes de cualquier entrevista, tomate 15 minutos para conocer a la empresa.

## Qué mirar
- A qué se dedica y qué productos o servicios ofrece.
- Su página en Worka: si está verificada y qué otras vacantes tiene.
- Sus redes sociales, para entender su tono y su cultura.

## Por qué importa
Cuando el entrevistador te pregunta "¿qué sabés de nosotros?", una respuesta preparada te distingue del resto al instante. Muestra interés real y que sos alguien que se prepara.$md$, 8, 1),
  ('Antes de la entrevista', 'Preparate para las preguntas típicas',
   $md$Casi todas las entrevistas incluyen estas preguntas. Prepará una respuesta corta para cada una:

- **"Contame de vos"** → 30 segundos: quién sos, qué hacés y qué buscás.
- **"¿Por qué querés este trabajo?"** → conectá el puesto con lo que te gusta o sabés hacer.
- **"¿Cuáles son tus fortalezas?"** → elegí 2 o 3 y da un ejemplo real de cada una.
- **"¿Y tus debilidades?"** → una real, y cómo estás trabajando en mejorarla.

> Practicá en voz alta. La primera vez que digas tu respuesta no debería ser frente al entrevistador.$md$, 10, 2),
  ('El día de la entrevista', 'Puntualidad y presentación',
   $md$Llegá **10 minutos antes**. Si es virtual, probá tu cámara y micrófono con tiempo.

## Lista rápida
- Llevá tu documento y una copia de tu CV.
- Vestí prolijo y acorde al lugar.
- Saludá con seguridad y sonreí.
- Apagá o silenciá el celular.

La puntualidad y la actitud pesan, en muchos puestos, más que la experiencia.$md$, 6, 3),
  ('El día de la entrevista', 'Cómo cerrar bien',
   $md$El final deja la última impresión.

- Hacé **una pregunta** al entrevistador (sobre el equipo, el día a día, los próximos pasos). Muestra interés.
- Agradecé por el tiempo.
- Preguntá cuándo tendrás novedades.

Después de la entrevista, si te contactaron por WhatsApp, un mensaje corto agradeciendo suma puntos.$md$, 6, 4)
) as s(section, title, content, dur, sort)
where c.slug = 'preparate-para-entrevistas'
and not exists (select 1 from lessons l where l.course_id = c.id);

-- Lecciones del curso de habilidades
insert into lessons (course_id, section, title, content, duration_min, sort)
select c.id, s.section, s.title, s.content, s.dur, s.sort
from courses c
cross join (values
  ('Identificá tus fortalezas', 'Habilidades blandas y técnicas',
   $md$Todos tenemos habilidades, aunque no las llamemos así.

## Dos tipos
- **Técnicas (hard skills):** manejar caja, conducir, usar Excel, cocinar, atender público.
- **Blandas (soft skills):** puntualidad, trabajo en equipo, responsabilidad, buena comunicación.

Hacé una lista de las tuyas. Pensá en trabajos anteriores, changas, estudios o incluso tareas de tu casa.$md$, 8, 1),
  ('Identificá tus fortalezas', 'Convertí tu experiencia en habilidades',
   $md$Aunque no hayas tenido un empleo formal, tenés experiencia:

- ¿Cuidaste a alguien? → responsabilidad, paciencia.
- ¿Vendiste algo? → atención al cliente, negociación.
- ¿Organizaste un evento? → planificación, trabajo en equipo.

Cada actividad se traduce en una habilidad que una empresa valora. Anotalas: son el corazón de tu CV.$md$, 8, 2),
  ('Mostralas', 'Contá tus habilidades con ejemplos',
   $md$Decir "soy responsable" no alcanza. Mostralo con un ejemplo:

> "En mi trabajo anterior nunca falté y me encargaban abrir el local porque confiaban en mí."

## La fórmula
**Situación → qué hiciste → resultado.**

Usá esta fórmula en la entrevista y en tu CV. Un ejemplo concreto convence mucho más que un adjetivo.$md$, 7, 3)
) as s(section, title, content, dur, sort)
where c.slug = 'descubri-tus-habilidades'
and not exists (select 1 from lessons l where l.course_id = c.id);

-- Lecciones del curso de primer empleo
insert into lessons (course_id, section, title, content, duration_min, sort)
select c.id, s.section, s.title, s.content, s.dur, s.sort
from courses c
cross join (values
  ('Preparate', 'Armá tu perfil y tu CV',
   $md$Sin experiencia también se consigue trabajo. El primer paso es tener un buen perfil.

- Completá tu perfil en Worka: foto, ciudad y rubros que te interesan.
- Si no tenés CV, **Worka te lo genera gratis** respondiendo unas preguntas.
- Incluí estudios, cursos, changas y habilidades. Todo suma.$md$, 8, 1),
  ('Preparate', 'El "modo primer empleo"',
   $md$Muchas vacantes **no piden experiencia**. En Worka, activá el filtro de *primer empleo* para verlas primero.

Buscá palabras como "sin experiencia", "te capacitamos", "operario/a", "cajero/a", "repartidor/a". Son puestos que suelen tomar gente nueva y enseñarle.$md$, 6, 2),
  ('Postulate', 'Postulaciones que funcionan',
   $md$- Postulate a lo que realmente podés cumplir (horario, cómo llegar).
- Respondé las preguntas de filtro con sinceridad.
- Activá las alertas por WhatsApp para enterarte primero.
- Respondé rápido cuando una empresa te escribe.

La rapidez y la actitud son tu mayor ventaja cuando recién empezás.$md$, 7, 3),
  ('Tu primer día', 'Empezá con el pie derecho',
   $md$¡Conseguiste el trabajo! Para que tu primer día salga bien:

- Confirmá horario y dirección el día anterior.
- Llegá temprano.
- Prestá atención, tomá notas y preguntá lo que no entendés.
- Mostrá ganas: en los primeros días se construye tu reputación.

Un buen comienzo abre la puerta a que te confíen más responsabilidades y a crecer.$md$, 6, 4)
) as s(section, title, content, dur, sort)
where c.slug = 'tu-primer-empleo'
and not exists (select 1 from lessons l where l.course_id = c.id);
