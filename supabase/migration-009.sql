-- ============================================================
-- Worka — Migración 009: blog (SEO)
-- Sección de blog con editor en el admin. Ejecutar en el SQL Editor.
-- Idempotente.
-- ============================================================

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',       -- markdown liviano
  cover_url text,
  audience text not null default 'personas'
    check (audience in ('personas', 'empresas')),
  status text not null default 'borrador'
    check (status in ('borrador', 'publicado')),
  author text not null default 'Equipo Worka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists idx_blog_status on blog_posts (status, published_at desc);

alter table blog_posts enable row level security;

-- Lectura pública solo de publicados; el admin ve y gestiona todo.
drop policy if exists blog_public_read on blog_posts;
create policy blog_public_read on blog_posts
  for select using (status = 'publicado' or fn_current_role() = 'admin');

drop policy if exists blog_admin_write on blog_posts;
create policy blog_admin_write on blog_posts
  for all using (fn_current_role() = 'admin')
  with check (fn_current_role() = 'admin');

-- ── 3 artículos de arranque (plantillas). No se pisan si ya existen. ──

insert into blog_posts (slug, title, excerpt, audience, status, published_at, content)
values (
  'salario-minimo-paraguay-2026',
  'Salario mínimo en Paraguay 2026: cuánto es y para quién aplica',
  'Qué es el salario mínimo legal vigente, cómo se ajusta cada año y en qué casos corresponde. Todo lo que un trabajador debe saber.',
  'personas',
  'publicado',
  now(),
  $md$El **salario mínimo** es el monto más bajo que, por ley, una empresa puede pagar a un trabajador por una jornada completa de trabajo. En Paraguay lo fija el Poder Ejecutivo por decreto y se ajusta periódicamente según la variación del costo de vida (el IPC que publica el Banco Central).

> Importante: el valor exacto cambia con cada actualización. Antes de tomar una decisión, verificá el monto vigente en el sitio del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS).

## ¿A quién le corresponde?

El salario mínimo aplica a la mayoría de los trabajadores del sector privado en relación de dependencia, con jornada completa (48 horas semanales). Si trabajás medio tiempo o por horas, el pago se calcula de forma proporcional.

## Conceptos que se suman al salario

- **Aguinaldo:** un sueldo extra al año, que se paga en diciembre.
- **IPS:** aporte a la seguridad social. Te da acceso a salud y jubilación.
- **Horas extra:** las horas trabajadas por encima de la jornada se pagan con un recargo.
- **Bonificación familiar:** un adicional para trabajadores con hijos menores, según la ley.

## ¿Qué hago si me pagan menos del mínimo?

Pagar por debajo del salario mínimo legal es una infracción. Podés hacer la consulta o la denuncia ante el MTESS, que tiene canales de atención al trabajador. Guardá siempre tus recibos de sueldo y cualquier comprobante.

## En resumen

El salario mínimo es un piso legal, no un techo. Conocerlo te ayuda a negociar mejor y a saber cuándo tus derechos no se están respetando. Si estás buscando trabajo, apuntá a empleos que como mínimo cumplan con este piso y con el aporte a IPS desde el primer día.$md$
) on conflict (slug) do nothing;

insert into blog_posts (slug, title, excerpt, audience, status, published_at, content)
values (
  'trabajos-en-maquiladoras-paraguay',
  'Trabajos en maquiladoras de Paraguay: qué son y cómo postular',
  'El régimen de maquila genera miles de empleos en Paraguay. Te contamos qué puestos hay, qué piden y cómo postularte.',
  'personas',
  'publicado',
  now(),
  $md$Las **maquiladoras** son empresas que producen o ensamblan productos en Paraguay para exportarlos, aprovechando el régimen de maquila. Este sector viene creciendo fuerte y es una de las mayores fuentes de empleo formal del país, sobre todo en el área industrial de Central, Alto Paraná y otras zonas.

## ¿Qué tipo de puestos ofrecen?

- **Operarios de producción y ensamblaje** (la mayoría de las vacantes).
- **Control de calidad.**
- **Logística y depósito.**
- **Costura y confección** (en maquilas textiles).
- **Mantenimiento y supervisión.**

## ¿Qué suelen pedir?

- Secundaria completa (en muchos casos alcanza).
- Disponibilidad para **turnos rotativos**.
- Puntualidad y trabajo en equipo.
- Para varios puestos **no piden experiencia**: la empresa te capacita.

## Ventajas de trabajar en una maquila

- Empleo **formal** con IPS y aguinaldo.
- Suelen ofrecer **transporte** y a veces almuerzo.
- Posibilidad real de crecer de operario a encargado.

## Cómo postularte

1. Tené tu **CV** listo y actualizado. Si no tenés, en Worka lo generás gratis.
2. Buscá vacantes del rubro **Producción / Fábrica** y **Logística**.
3. Fijate en las **líneas de colectivo** que llegan a la planta: es clave para no faltar.
4. Postulate y respondé rápido cuando la empresa te contacte por WhatsApp.

Las maquiladoras contratan durante todo el año y en tandas grandes. Tener el perfil completo y el CV cargado te pone primero en la fila.$md$
) on conflict (slug) do nothing;

insert into blog_posts (slug, title, excerpt, audience, status, published_at, content)
values (
  'como-buscar-trabajo-en-paraguay-2026',
  'Cómo buscar trabajo en Paraguay en 2026: guía paso a paso',
  'Una guía práctica para conseguir empleo más rápido: desde armar tu CV hasta la entrevista, con consejos pensados para Paraguay.',
  'personas',
  'publicado',
  now(),
  $md$Buscar trabajo puede ser abrumador, pero con un método ordenado conseguís resultados más rápido. Esta guía te lleva paso a paso.

## 1. Definí qué buscás

Antes de postularte a todo, pensá: ¿qué rubro, en qué ciudad, qué horario podés cumplir? Postularte a lo que realmente te encaja rinde más que mandar el CV a 100 avisos.

## 2. Armá un buen CV

Un CV claro de una página alcanza. Incluí: tus datos de contacto, una breve descripción tuya, tu experiencia (aunque sea informal) y tus estudios. Si no tenés CV, en **Worka lo generás gratis** con tus datos.

## 3. Cuidá tu presencia

- Poné una **foto de perfil** simple y prolija.
- Verificá tu número de **WhatsApp**: por ahí te van a contactar.
- Escribí una **bio corta** que diga quién sos y qué buscás.

## 4. Postulate de forma inteligente

- Usá los filtros por **rubro** y **ciudad**.
- Fijate en el **salario** y en **cómo llegar** (líneas de colectivo).
- Respondé las **preguntas de filtro** con sinceridad.
- Activá las **alertas por WhatsApp** para enterarte primero de las vacantes nuevas.

## 5. Preparate para la entrevista

- Confirmá día, hora y lugar; llegá 10 minutos antes.
- Llevá tu documento y, si podés, una copia del CV.
- Practicá una respuesta corta a "contame de vos".
- Mostrá ganas y puntualidad: en muchos puestos eso pesa más que la experiencia.

## 6. No te desanimes

Conseguir trabajo es un proceso. Cada entrevista es práctica. Mantené tu perfil actualizado, seguí postulándote y aprovechá cada contacto.

¿Listo para empezar? Creá tu perfil gratis y postulate hoy mismo.$md$
) on conflict (slug) do nothing;
