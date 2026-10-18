-- ============================================================
-- Worka — Migración 052: Academia, paquete de cursos de octubre 2026
--
-- Generada por scripts/academia-import.mjs a partir del archivo de cursos.
-- No editar a mano: corregí el .md y volvé a generar.
-- Requiere la migración 051. Idempotente: se puede correr de nuevo para
-- actualizar el texto sin perder el avance de nadie.
-- ============================================================

-- ── Tu CV que consigue entrevistas ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$cv-que-consigue-entrevistas$wk$, $wk$Tu CV que consigue entrevistas$wk$, $wk$Armá un CV claro, con logros concretos y listo para pasar los filtros automáticos. Te llevás una versión base y aprendés a adaptarla a cada aviso.$wk$, $wk$CV$wk$, $wk$Básico$wk$, 'publicado', 4, $wk$80 min$wk$, $wk$Cómo hacer un CV que consiga entrevistas — Curso gratis | Academia Worka$wk$, $wk$Aprendé a armar tu currículum paso a paso, escribir logros en vez de tareas, pasar los filtros ATS y adaptarlo a cada aviso. Curso gratis con ejercicios y certificado.$wk$, $wk$["Estructurar un CV de una página que se lee en segundos","Convertir tareas en logros con una fórmula simple","Hacer un CV compatible con sistemas de filtrado (ATS)","Adaptar tu CV a cada aviso en 15 minutos","Usar la inteligencia artificial como ayuda sin perder tu voz"]$wk$::jsonb, null, null, null, 70, true, $wk${"title":"Tu CV listo para postular","prompt":"Armá tu CV completo de una página siguiendo todo el curso y adaptalo a un aviso real. Subilo a tu perfil de Worka o guardalo para tu próxima postulación.","suggested_questions":[],"checklist":["Tiene encabezado con contacto y perfil de 3 líneas","Cada experiencia tiene 2 a 4 logros con la fórmula Verbo + Qué + Resultado","Pasó la prueba de copiar y pegar en un bloc de notas","Está adaptado a un aviso concreto (título, logros y habilidades)","No tiene errores de ortografía (lo revisé yo y otra persona)","Está en PDF con nombre de archivo claro"]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$lo-que-mira-un-reclutador$wk$, $wk$Lecciones$wk$, $wk$Lo que mira un reclutador en los primeros segundos$wk$, $wk$Cuando una empresa publica un aviso, puede recibir decenas o cientos de CV. La persona que los revisa no los lee de punta a punta: **los escanea**. En la primera pasada busca tres cosas: qué puesto querés, si cumplís lo básico que pide el aviso y si hay algo que te haga destacar. Si no lo encuentra rápido, pasa al siguiente.

Por eso tu CV no es tu biografía. Es un **anuncio de una página** que responde una sola pregunta: *¿por qué vale la pena llamarte?*

**La estructura que funciona**

1. **Datos de contacto.** Nombre completo, ciudad (no hace falta la dirección exacta), celular con WhatsApp, un correo que suene profesional (nombre.apellido@…) y, si tenés, tu link de LinkedIn o de tu perfil en Worka.
2. **Título y perfil (3 líneas).** Arriba de todo, decí qué sos y qué buscás. Ejemplo: *"Auxiliar administrativa con experiencia en facturación y atención al cliente. Manejo Excel intermedio y sistemas de gestión. Busco crecer en el área contable."*
3. **Experiencia.** Del trabajo más reciente al más antiguo. Puesto, empresa, ciudad, fechas (mes y año) y 2 a 4 líneas con logros (lo vemos en la lección 2).
4. **Formación.** Título o carrera, institución y año (o "en curso"). Cursos cortos solo si suman al puesto.
5. **Habilidades.** Herramientas concretas (Excel, Canva, caja registradora, manejo de montacargas), idiomas con nivel real y alguna habilidad blanda que puedas demostrar.

**Reglas de oro**

- **Una página** si tenés menos de 8–10 años de experiencia.
- **Letra legible** (11–12 pt), márgenes normales, mucho espacio en blanco.
- **Archivo en PDF**, con nombre claro: `CV-Ana-Gimenez-Administrativa.pdf`. Nunca `cv final final 2.pdf`.
- **Cero errores de ortografía.** Un error en el CV se lee como "no presta atención".

**¿Foto, cédula, estado civil?** En Paraguay todavía es común ver CV con foto y datos personales. La foto es opcional: si la ponés, que sea de frente, con fondo neutro y ropa acorde al rubro (nada de recortes de una fiesta). **No pongas tu número de cédula completo, ni tu fecha de nacimiento, ni tu estado civil**: no hacen falta para evaluarte y exponen tus datos. Si la empresa los necesita, te los va a pedir más adelante en el proceso.

**Si no tenés experiencia formal**, no dejes el espacio vacío: poné una sección de **"Experiencia y proyectos"** con changas, voluntariados, trabajos en el negocio familiar, pasantías, proyectos del colegio o la facultad. Todo eso cuenta si lo contás bien.$wk$, 15, 1, $wk$[{"q":"¿Qué hace primero la mayoría de los reclutadores con un CV?","options":["Lo lee completo con atención","Lo escanea rápido buscando puesto, requisitos y algo que destaque","Revisa primero la foto","Llama por teléfono para conocer a la persona"],"answer":1,"explanation":"Con muchos CV por aviso, la primera pasada es un escaneo de pocos segundos. Por eso lo importante tiene que estar arriba y a la vista."},{"q":"¿Cuál de estos datos conviene NO poner en el CV?","options":["Celular con WhatsApp","Ciudad donde vivís","Número de cédula completo","Link a tu perfil profesional"],"answer":2,"explanation":"El número de cédula es un dato sensible que no sirve para evaluarte. Si la empresa lo necesita, te lo pide más adelante."},{"q":"¿Cuál es el mejor nombre para el archivo de tu CV?","options":["cv.pdf","CV-Ana-Gimenez-Administrativa.pdf","curriculum nuevo (2).docx","Ana_final_final.pdf"],"answer":1,"explanation":"Un nombre claro con tu nombre y el puesto ayuda a que tu archivo se encuentre fácil y transmite orden."}]$wk$::jsonb, $wk$["Tu CV es un anuncio de una página, no tu biografía.","Arriba de todo: qué sos y qué buscás, en tres líneas.","PDF, nombre de archivo claro y cero errores.","No expongas datos sensibles que nadie te pidió."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu encabezado en 3 líneas","type":"texto","prompt":"Escribí el bloque de arriba de tu CV: tus datos de contacto y un perfil de máximo 3 líneas que diga qué sos, qué sabés hacer y qué buscás.","checklist":["Mi correo suena profesional (nombre y apellido, sin apodos)","El perfil dice qué puesto o área busco","Menciono al menos 2 habilidades o herramientas concretas","No pasa de 3 líneas","No incluí cédula, fecha de nacimiento ni estado civil"]}$wk$::jsonb, null
from courses where slug = $wk$cv-que-consigue-entrevistas$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$logros-no-tareas$wk$, $wk$Lecciones$wk$, $wk$Logros, no tareas: la fórmula que convence$wk$, $wk$El error más común en un CV es listar **tareas**: "atención al cliente", "manejo de caja", "reposición de mercaderías". Eso describe el puesto, no a vos. Cualquiera que tuvo ese trabajo podría escribir lo mismo.

Lo que hace que te llamen son los **logros**: qué hiciste *bien*, *cuánto* y *con qué resultado*.

**La fórmula: Verbo + Qué hiciste + Resultado (con un número si se puede)**

| Tarea (débil) | Logro (fuerte) |
|---|---|
| Atención al cliente | Atendí un promedio de 60 clientes por día en mostrador, con quejas casi nulas en mis turnos |
| Manejo de caja | Manejé caja de cierre durante 1 año sin diferencias en los arqueos |
| Redes sociales del local | Creé el Instagram del negocio familiar y llegamos a 1.200 seguidores en 6 meses |
| Reposición | Reorganicé el depósito por categorías y reduje el tiempo de búsqueda de productos |

**Verbos que ayudan:** organicé, atendí, logré, reduje, aumenté, coordiné, creé, propuse, capacité, resolví, vendí, mejoré.

**¿Y si no tengo números?** Buscá alguna de estas cosas:

- **Volumen:** cuántos clientes, pedidos, llamadas, productos, alumnos.
- **Tiempo:** cuánto tiempo, qué tan rápido, con qué frecuencia.
- **Responsabilidad:** te dejaron a cargo de algo, te eligieron para algo, te pidieron que enseñes a otros.
- **Reconocimiento:** te felicitaron, te renovaron el contrato, te ascendieron, te recomendaron.

Una estimación honesta vale ("cerca de 40 pedidos por día"). **Inventar no vale**: en la entrevista te van a preguntar por cada línea y se nota.

**Sin experiencia laboral, la fórmula funciona igual:**

- *"Coordiné un equipo de 5 compañeros para el proyecto final de la carrera; presentamos en fecha y obtuvimos la nota máxima."*
- *"Organicé la rifa del curso y recaudamos lo necesario para la cena de egresados."*
- *"Ayudé en la despensa familiar los fines de semana: caja, atención y control de stock."*

Cada puesto del CV tiene que tener entre 2 y 4 líneas así. Elegí las que más se parezcan a lo que pide el aviso.$wk$, 15, 2, $wk$[{"q":"¿Cuál de estas líneas es un logro y no una tarea?","options":["Responsable de ventas","Atención telefónica","Superé la meta de ventas del trimestre en 3 de 4 meses","Manejo de clientes"],"answer":2,"explanation":"Tiene verbo, qué hiciste y un resultado medible. Las otras opciones solo nombran tareas."},{"q":"No tenés datos exactos de cuántos clientes atendías. ¿Qué hacés?","options":["Inventás un número alto para impresionar","Ponés una estimación honesta, por ejemplo \"cerca de 40 por día\"","Dejás solo la tarea sin detalle","Borrás ese trabajo del CV"],"answer":1,"explanation":"Una estimación razonable y honesta suma. Inventar es riesgoso porque te pueden preguntar en la entrevista."},{"q":"¿Qué podés poner si nunca tuviste un empleo formal?","options":["Nada, el CV queda sin experiencia","Proyectos, voluntariados, changas y ayuda en negocios familiares, contados como logros","Solo tus materias de la facultad","Tus hobbies"],"answer":1,"explanation":"La experiencia no formal también muestra habilidades. Contala con la misma fórmula de logros."}]$wk$::jsonb, $wk$["Las tareas describen el puesto; los logros te describen a vos.","Verbo + qué hiciste + resultado.","Si no hay número, buscá volumen, tiempo, responsabilidad o reconocimiento.","Estimar con honestidad, sí. Inventar, nunca."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Convertí 3 tareas en logros","type":"texto","prompt":"Elegí un trabajo, proyecto o experiencia que tengas. Escribí 3 tareas que hacías y después reescribí cada una como logro usando la fórmula Verbo + Qué + Resultado.","checklist":["Cada logro empieza con un verbo en pasado","Al menos 2 de los 3 tienen un número o una estimación honesta","Ninguno es inventado","Leídos en voz alta, suenan a algo que hice yo, no a cualquiera"]}$wk$::jsonb, null
from courses where slug = $wk$cv-que-consigue-entrevistas$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$cv-que-pasa-filtros-ats$wk$, $wk$Lecciones$wk$, $wk$Un CV que pasa los filtros automáticos (ATS)$wk$, $wk$Muchas empresas medianas y grandes, y casi todos los portales de empleo, usan un **ATS** (*Applicant Tracking System*, sistema de seguimiento de candidatos). Es un programa que recibe los CV, **extrae el texto** y ayuda a ordenarlos y filtrarlos, muchas veces por **palabras clave** del aviso.

Ojo: el ATS no siempre "rechaza solo". Muchas veces lo que hace es ordenar o permitir búsquedas, y después decide una persona. Pero si el sistema **no puede leer** tu CV o no encuentra las palabras que la empresa busca, tu postulación puede quedar al fondo de la lista. No todas las empresas usan uno, pero preparar tu CV para que un ATS lo lea bien no te perjudica nunca.

**Formato que se lee bien**

- **Una sola columna**, de arriba hacia abajo. Las plantillas con dos columnas, barras de nivel ("Excel ●●●○○") o gráficos se ven lindas, pero muchas veces el programa mezcla el texto o no lo lee.
- **Títulos de sección estándar:** Experiencia, Formación, Habilidades. No inventes nombres como "Mi recorrido".
- **Nada de información importante dentro de imágenes,** íconos o encabezados/pies de página.
- **Fuentes comunes** (Arial, Calibri, Helvetica, Garamond).
- **PDF generado desde Word, Google Docs o Canva con texto real** (no una foto escaneada). Prueba rápida: abrí tu PDF, seleccioná todo el texto y pegalo en un bloc de notas. Si sale ordenado, el ATS también lo va a leer.

**Palabras clave**

Leé el aviso y marcá los **sustantivos técnicos**: herramientas, tareas, títulos. Si el aviso dice "Excel avanzado", "facturación electrónica" o "atención al cliente", y vos tenés esa experiencia, **usá las mismas palabras** en tu CV (no sinónimos). Si dice "auxiliar contable", que tu título diga "auxiliar contable" y no "ayudante del área de números".

**Lo que no hay que hacer**

- Pegar el aviso entero en tu CV o esconder palabras clave en letra blanca. Los reclutadores lo detectan y te descartan por deshonesto.
- Poner palabras clave de cosas que no sabés hacer. Pasás el filtro, pero caés en la entrevista.

**¿Y Canva?** Podés usarlo, pero elegí una plantilla de una columna, sin gráficos de nivel, y hacé la prueba del copiar y pegar antes de enviar.$wk$, 15, 3, $wk$[{"q":"¿Qué hace un ATS?","options":["Hace la entrevista por vos","Recibe los CV, extrae el texto y ayuda a filtrarlos u ordenarlos","Diseña tu CV automáticamente","Llama a tus referencias"],"answer":1,"explanation":"Es un sistema que procesa los CV para que la empresa pueda filtrarlos y ordenarlos. Por eso importa que pueda leer tu texto."},{"q":"¿Cuál es la prueba más simple para saber si un ATS puede leer tu CV?","options":["Imprimirlo","Mandárselo a un amigo","Copiar todo el texto del PDF y pegarlo en un bloc de notas","Ponerle más colores"],"answer":2,"explanation":"Si el texto pegado sale completo y en orden, la mayoría de los sistemas lo va a leer bien."},{"q":"El aviso pide \"facturación electrónica\" y vos hiciste eso. ¿Cómo lo ponés?","options":["Con las mismas palabras, \"facturación electrónica\"","Con un sinónimo para que suene original","No lo ponés porque ya está en el aviso","En letra blanca para que solo lo lea el sistema"],"answer":0,"explanation":"Usar los mismos términos ayuda a que el sistema y la persona encuentren lo que buscan. Esconder texto es un truco que te puede descalificar."}]$wk$::jsonb, $wk$["Una columna, títulos estándar, texto real (no imágenes).","Probá copiar y pegar tu PDF: si se lee ordenado, estás bien.","Usá las mismas palabras del aviso para lo que sí sabés hacer.","Nada de trucos: lo que pase el filtro lo va a leer una persona."]$wk$::jsonb, $wk$[{"youtube_id":"LmP4qolrjjQ","title":"Cómo hacer un Currículum que supere los filtros ATS - Fácil y rápido","channel":"CVcrea ES","why":"Muestra en pantalla qué formatos leen bien estos sistemas y qué errores hacen que un CV quede afuera."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Test de lectura de tu CV","type":"checklist","prompt":"Abrí tu CV actual (o el borrador que estás armando) y hacé estas pruebas.","checklist":["Está en una sola columna","Las secciones se llaman Experiencia, Formación y Habilidades (o similar estándar)","No hay barras de nivel, gráficos ni texto dentro de imágenes","Copié y pegué el texto en un bloc de notas y salió completo y ordenado","Lo guardé en PDF con un nombre de archivo claro"]}$wk$::jsonb, null
from courses where slug = $wk$cv-que-consigue-entrevistas$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$adapta-tu-cv-a-cada-aviso$wk$, $wk$Lecciones$wk$, $wk$Adaptá tu CV a cada aviso en 15 minutos$wk$, $wk$Mandar el mismo CV a 50 avisos parece eficiente, pero suele dar pocas respuestas. Mandar un CV **adaptado** a 10 avisos bien elegidos casi siempre rinde más. La buena noticia: adaptar no es reescribir todo. Con una **versión base** bien hecha, cada adaptación te lleva unos 15 minutos.

**Paso 1 — Tu CV base (una sola vez)**

Armá un documento "maestro" con **todo**: todos tus trabajos, proyectos, cursos y logros, aunque pase de una página. Es tu banco. De ahí vas a sacar lo que necesites para cada aviso.

**Paso 2 — Leé el aviso con un marcador (5 min)**

Separá en tres listas:

- **Requisitos excluyentes:** lo que piden sí o sí (título, años de experiencia, licencia de conducir, disponibilidad de horario).
- **Deseables:** lo que suma pero no es obligatorio.
- **Palabras clave:** herramientas, tareas y el nombre exacto del puesto.

Si no cumplís **la mayoría** de los excluyentes, guardá tu energía para otro aviso. Si cumplís casi todo y te falta un deseable, postulate igual.

**Paso 3 — Ajustá tres partes (10 min)**

1. **Título y perfil:** que digan el nombre del puesto del aviso y las 2 o 3 habilidades que más piden.
2. **Logros:** de tu banco, elegí los que mejor responden a lo que pide el aviso y ponelos primero en cada puesto.
3. **Habilidades:** ordená poniendo arriba las que aparecen en el aviso.

**Paso 4 — Revisión final**

- ¿Se nota en 10 segundos que encajás con *este* puesto?
- ¿El nombre del archivo y el asunto del correo dicen el puesto?
- ¿Leíste todo una vez más buscando errores?

**Guardá cada versión** con el nombre de la empresa (`CV-Ana-Gimenez-Banco-X.pdf`) para saber qué mandaste si te llaman.

**En Worka:** mantené tu perfil completo y actualizado, y usá el CV adaptado cuando postules a avisos que te importan de verdad.$wk$, 15, 4, $wk$[{"q":"¿Qué es el \"CV base\"?","options":["El CV más corto posible","Un documento maestro con toda tu experiencia y logros, del que sacás versiones","El primer CV que hiciste en tu vida","Una plantilla de internet"],"answer":1,"explanation":"El CV base es tu banco de información. Cada versión adaptada se arma eligiendo de ahí lo más relevante."},{"q":"Cumplís casi todos los requisitos excluyentes, pero te falta un deseable. ¿Qué hacés?","options":["No te postulás","Te postulás igual con un CV adaptado","Mentís diciendo que sí lo tenés","Esperás a tener todo"],"answer":1,"explanation":"Los deseables no son obligatorios. Si cumplís lo esencial, vale la pena postularte."},{"q":"¿Qué tres partes ajustás al adaptar tu CV?","options":["Foto, colores y tipografía","Datos de contacto, formación y hobbies","Título/perfil, orden de logros y habilidades","Solo el nombre del archivo"],"answer":2,"explanation":"Son las partes que más pesan en la primera lectura y las que mejor muestran que encajás con ese puesto."}]$wk$::jsonb, $wk$["Un CV base con todo; versiones cortas para cada aviso.","Separá excluyentes, deseables y palabras clave.","Ajustá título/perfil, orden de logros y habilidades.","Guardá cada versión con el nombre de la empresa."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Adaptación real","type":"texto","prompt":"Elegí un aviso real (de Worka u otro portal). Pegá sus requisitos y escribí las tres listas (excluyentes, deseables, palabras clave). Después escribí tu nuevo perfil de 3 líneas adaptado a ese aviso.","checklist":["Separé excluyentes, deseables y palabras clave","Verifiqué que cumplo la mayoría de los excluyentes","Mi perfil nuevo usa el nombre del puesto del aviso","Mencioné las 2 o 3 habilidades que más piden y que realmente tengo"]}$wk$::jsonb, null
from courses where slug = $wk$cv-que-consigue-entrevistas$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$ia-como-ayudante-para-tu-cv$wk$, $wk$Lecciones$wk$, $wk$La IA como ayudante (sin que tu CV suene a robot)$wk$, $wk$Herramientas como ChatGPT, Claude o Gemini pueden ayudarte mucho a armar tu CV, pero mal usadas producen textos genéricos que los reclutadores ya reconocen: "proactivo, apasionado, orientado a resultados, con capacidad de trabajo en equipo". Si todos mandan lo mismo, nadie destaca.

**La regla:** la IA **ordena y pule**; **los hechos los ponés vos**.

**Para qué sí sirve**

- **Convertir tareas en logros.** Contale con tus palabras qué hacías y pedile que lo pase a la fórmula Verbo + Qué + Resultado.
- **Encontrar palabras clave de un aviso.** Pegale el aviso y pedile que liste requisitos excluyentes, deseables y palabras clave.
- **Revisar ortografía y claridad.**
- **Acortar.** Si tu CV pasa de una página, pedile que te sugiera qué recortar.
- **Practicar.** Pedile que te haga preguntas de entrevista sobre tu propio CV.

**Ejemplos de pedidos (prompts) que funcionan**

> "Trabajé 1 año en una farmacia. Atendía en mostrador, cobraba y controlaba vencimientos. Una vez detecté un lote vencido antes de que se vendiera. Convertí esto en 3 líneas de logros para un CV, en español de Paraguay, sin exagerar y sin palabras como 'proactivo' o 'apasionado'. No inventes números: si falta un dato, preguntame."

> "Este es el aviso: [pegar]. Este es mi CV: [pegar]. Decime qué requisitos del aviso no se ven en mi CV y qué palabras clave me faltan. No reescribas el CV entero."

**Para qué no**

- **No le pidas que invente experiencia, números ni títulos.** Lo que figure en tu CV tenés que poder explicarlo en la entrevista.
- **No copies y pegues sin leer.** Revisá que cada línea sea verdad y suene a vos.
- **Cuidá tus datos.** No hace falta pegar tu cédula, dirección ni teléfono para que te ayude. Reemplazalos por "[mi teléfono]" y completalos después.

**Prueba final:** leé tu CV en voz alta. Si hay una frase que nunca dirías así, cambiala.$wk$, 20, 5, $wk$[{"q":"¿Cuál es el mejor uso de la IA para tu CV?","options":["Que invente logros para completar","Que escriba todo el CV sin darle información","Que te ayude a ordenar y redactar hechos reales que vos le contás","Que copie el CV de otra persona"],"answer":2,"explanation":"La IA es buena para ordenar y pulir información verdadera. Inventar te expone en la entrevista."},{"q":"¿Qué conviene NO pegar en una herramienta de IA?","options":["Un aviso de trabajo","Una descripción de tus tareas","Tu número de cédula y dirección","Un borrador de tu perfil"],"answer":2,"explanation":"No hace falta compartir datos sensibles para que la herramienta te ayude. Usá marcadores como \"[mi teléfono]\"."},{"q":"¿Por qué evitar frases como \"proactivo y orientado a resultados\"?","options":["Porque están prohibidas","Porque son genéricas y no muestran nada concreto de vos","Porque son muy largas","Porque el ATS no las lee"],"answer":1,"explanation":"Son frases que aparecen en miles de CV. Un logro concreto dice mucho más que un adjetivo."}]$wk$::jsonb, $wk$["La IA ordena y pule; los hechos son tuyos.","Pedile que no invente y que te pregunte lo que falta.","No pegues datos personales sensibles.","Si no lo dirías en voz alta, no va en tu CV."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu prompt personal","type":"texto","prompt":"Escribí un pedido (prompt) para una IA que te ayude a convertir una de tus experiencias en logros. Incluí qué hacías, en qué contexto, y la instrucción de no inventar ni usar frases genéricas. Probalo y pegá acá el resultado que te quedó después de revisarlo vos.","checklist":["Le conté hechos reales con mis palabras","Le pedí que no invente datos y que me pregunte lo que falta","No incluí datos personales sensibles","Revisé el resultado y cambié lo que no sonaba a mí"]}$wk$::jsonb, null
from courses where slug = $wk$cv-que-consigue-entrevistas$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

-- ── Entrevistas nivel 2: STAR, online y salario ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$entrevistas-nivel-2$wk$, $wk$Entrevistas nivel 2: STAR, online y salario$wk$, $wk$Ya sabés lo básico. Ahora aprendé a responder con ejemplos que convencen, a brillar en videollamadas y a hablar de plata sin miedo.$wk$, $wk$Entrevistas$wk$, $wk$Intermedio$wk$, 'publicado', 5, $wk$90 min$wk$, $wk$Método STAR, entrevistas online y pretensión salarial — Curso gratis | Academia Worka$wk$, $wk$Aprendé a responder preguntas por competencias con el método STAR, prepararte para entrevistas por videollamada y responder la pretensión salarial. Curso gratis con certificado.$wk$, $wk$["Responder preguntas por competencias con el método STAR","Armar tu banco de historias para cualquier entrevista","Preparar entrevistas por videollamada, teléfono y WhatsApp","Responder la pretensión salarial con un rango bien pensado","Manejar preguntas difíciles y hacer un buen seguimiento"]$wk$::jsonb, $wk$preparate-para-entrevistas$wk$, null, null, 70, true, $wk${"title":"Simulacro completo de entrevista","prompt":"Pedile a alguien de confianza que te entreviste por videollamada durante 15 minutos usando estas preguntas. Grabate (con permiso) y mirate después.","suggested_questions":["Contame de vos en 1 minuto","Contame una vez que resolviste un problema difícil","Contame una vez que trabajaste en equipo","¿Cuál es tu mayor debilidad?","¿Cuál es tu pretensión salarial?","¿Por qué deberíamos contratarte?","¿Tenés alguna pregunta?"],"checklist":["Respondí las preguntas \"Contame una vez que…\" con STAR","Cada respuesta duró menos de 2 minutos","Miré a la cámara al hablar y el entorno estuvo cuidado","Respondí la pretensión con un rango investigado","Hice al menos 2 preguntas al final","Anoté 2 cosas para mejorar después de ver la grabación"]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$metodo-star$wk$, $wk$Lecciones$wk$, $wk$Preguntas por competencias y el método STAR$wk$, $wk$Cada vez más entrevistas incluyen preguntas que empiezan con **"Contame una vez que…"**:

- "Contame una vez que tuviste un problema con un cliente."
- "Contame una situación en la que tuviste que aprender algo rápido."
- "Contame de un error que cometiste en el trabajo."

Se llaman **preguntas por competencias** (o conductuales). La idea detrás es simple: **lo que hiciste en el pasado es la mejor pista de lo que vas a hacer en el futuro.** Por eso no quieren opiniones ("yo soy muy responsable"), quieren **hechos**.

**El método STAR** te ayuda a contar un hecho de forma ordenada y en 1 a 2 minutos:

- **S — Situación:** dónde estabas y qué pasaba. (1–2 frases)
- **T — Tarea:** qué te tocaba resolver a vos. (1 frase)
- **A — Acción:** qué hiciste **vos**, paso a paso. (la parte más larga)
- **R — Resultado:** cómo terminó, idealmente con un dato, y qué aprendiste.

**Ejemplo**

*Pregunta: "Contame una vez que tuviste que atender a un cliente enojado."*

- **S:** "Trabajaba en la caja de un supermercado un sábado a la mañana, con mucha fila."
- **T:** "Un señor reclamaba porque le habían cobrado mal una promoción y quería hablar con el encargado, que no estaba."
- **A:** "Lo escuché sin interrumpirlo, le pedí el ticket y revisé el precio en el sistema. Vi que la promoción no se había cargado. Le expliqué qué había pasado, le pedí disculpas, hice la devolución de la diferencia como indica el procedimiento y avisé al encargado por mensaje para que corrijan el sistema."
- **R:** "El cliente se fue tranquilo y agradeció. Ese mismo día corrigieron la promoción y evitamos el mismo reclamo con otros clientes. Aprendí que muchas veces el enojo baja cuando la persona siente que la escuchan."

**Errores comunes**

- **Hablar en plural todo el tiempo** ("hicimos", "decidimos"). Está bien mencionar al equipo, pero el entrevistador quiere saber qué hiciste **vos**.
- **Quedarte en la situación** y no llegar nunca al resultado.
- **Elegir una historia sin final** o con un final malo sin aprendizaje.
- **Inventar.** Te van a repreguntar detalles ("¿y qué te dijo el encargado?") y se nota.

**¿Y si la historia salió mal?** Vale. Cerrá con lo que aprendiste y qué hacés distinto ahora. Mostrar aprendizaje es una competencia en sí misma.$wk$, 20, 1, $wk$[{"q":"¿Qué busca una pregunta que empieza con \"Contame una vez que…\"?","options":["Tu opinión sobre un tema","Un hecho concreto de tu pasado que muestre cómo actuás","Que hables de tus estudios","Que cuentes un chiste"],"answer":1,"explanation":"Son preguntas por competencias. Lo que hiciste antes es la mejor pista de cómo vas a actuar."},{"q":"¿Qué parte del STAR debería ser la más larga?","options":["Situación","Tarea","Acción","Resultado"],"answer":2,"explanation":"La acción muestra qué hiciste vos y cómo pensaste. Es lo que más le interesa al entrevistador."},{"q":"¿Cuál es un error frecuente al usar STAR?","options":["Terminar con un resultado","Hablar solo en plural y no decir qué hiciste vos","Dar un ejemplo concreto","Responder en 2 minutos"],"answer":1,"explanation":"Mencionar al equipo está bien, pero si todo es \"hicimos\", el entrevistador no sabe cuál fue tu aporte."}]$wk$::jsonb, $wk$["\"Contame una vez que…\" pide hechos, no opiniones.","STAR: Situación, Tarea, Acción (la más larga), Resultado.","Hablá en primera persona: qué hiciste vos.","Toda historia cierra con un resultado o un aprendizaje."]$wk$::jsonb, $wk$[{"youtube_id":"8YHS3URNAww","title":"Cómo Responder Preguntas de Entrevista con la Metodología STAR","channel":"Nodd3r","why":"Arma una respuesta STAR completa paso a paso con un ejemplo de liderazgo. Sirve para ver el método en acción."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu primera respuesta STAR","type":"texto","prompt":"Respondé por escrito con el método STAR esta pregunta: 'Contame una vez que resolviste un problema sin que nadie te lo pida'. Separá S, T, A y R.","checklist":["La situación se entiende en 1 o 2 frases","Queda claro qué me tocaba a mí","La acción describe pasos concretos que hice yo","Cierro con un resultado o un aprendizaje","Leída en voz alta, dura menos de 2 minutos"]}$wk$::jsonb, null
from courses where slug = $wk$entrevistas-nivel-2$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$banco-de-historias$wk$, $wk$Lecciones$wk$, $wk$Tu banco de historias$wk$, $wk$No podés adivinar todas las preguntas, pero sí podés llegar con **6 a 8 historias preparadas** que sirvan para casi cualquier pregunta por competencias. A eso le llamamos tu **banco de historias**.

**Las competencias que más se preguntan**

1. **Trabajo en equipo:** una vez que colaboraste para lograr algo.
2. **Resolución de problemas:** algo que salió mal y lo arreglaste.
3. **Atención al cliente o trato con personas difíciles.**
4. **Aprendizaje rápido:** algo que tuviste que aprender en poco tiempo.
5. **Presión y organización:** muchas cosas a la vez, plazos cortos.
6. **Iniciativa:** algo que hiciste sin que te lo pidan.
7. **Error y aprendizaje:** algo que hiciste mal y qué cambiaste.
8. **Logro del que estás orgulloso/a.**

**Cómo armarlo**

Hacé una tabla con una fila por historia y estas columnas:

| Historia (nombre corto) | S y T en una línea | Acción clave | Resultado / dato | Competencias que muestra |
|---|---|---|---|---|
| "El cliente de la promo" | Caja del súper, cobro mal una promo | Escuché, revisé, devolví, avisé | Cliente conforme, se corrigió el sistema | Atención al cliente, resolución de problemas |

Una misma historia puede servir para varias preguntas. "El cliente de la promo" sirve para "cliente difícil", "resolver un problema" y "trabajar bajo presión".

**¿De dónde saco historias si tengo poca experiencia?** Del colegio o la facultad (trabajos en grupo, exámenes difíciles), de changas, del negocio familiar, de voluntariados, del club, de la iglesia, de un emprendimiento propio, de cuidar a un familiar. Lo que importa es **qué hiciste vos** y **qué resultado tuvo**.

**Practicá en voz alta.** Escribir la historia ayuda, pero en la entrevista vas a hablar. Grabate con el celular contando dos historias. Escuchate: ¿se entiende?, ¿dura menos de 2 minutos?, ¿llegás al resultado?

**La comunicación también cuenta**

- Mirá a la cámara o a la persona, no al techo.
- Pausas cortas están bien: es mejor pensar 2 segundos que llenar con "eeeh".
- Si no entendiste la pregunta, pedí que te la repitan. Es una señal de escucha, no de debilidad.$wk$, 20, 2, $wk$[{"q":"¿Para qué sirve un banco de historias?","options":["Para memorizar respuestas palabra por palabra","Para tener ejemplos listos que se adaptan a muchas preguntas","Para leerlas durante la entrevista","Para mandarlas por correo antes de la entrevista"],"answer":1,"explanation":"Con pocas historias bien preparadas podés responder la mayoría de las preguntas por competencias."},{"q":"Tenés poca experiencia laboral. ¿De dónde podés sacar historias?","options":["Solo de empleos formales","De estudios, changas, voluntariados, negocio familiar o proyectos propios","De películas","De experiencias de amigos"],"answer":1,"explanation":"Cualquier experiencia propia donde hiciste algo y hubo un resultado sirve, siempre que sea real."},{"q":"No entendiste bien una pregunta. ¿Qué hacés?","options":["Respondés cualquier cosa rápido","Pedís con amabilidad que te la repitan o aclaren","Cambiás de tema","Te quedás en silencio"],"answer":1,"explanation":"Pedir aclaración muestra que escuchás y que querés responder bien."}]$wk$::jsonb, $wk$["Llevá 6 a 8 historias preparadas, no respuestas de memoria.","Una historia puede responder varias preguntas.","La experiencia no formal también vale.","Practicá en voz alta y grabate."]$wk$::jsonb, $wk$[{"youtube_id":"ZiTm7HkE2Do","title":"Responde con Éxito en Entrevistas por Competencias: Domina el Método STAR","channel":"Michelle Engelmann","why":"Además de STAR, explica cómo armar un banco personal de experiencias y suma consejos de comunicación no verbal."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Armá tu banco de 6 historias","type":"texto","prompt":"Completá tu tabla con al menos 6 historias (nombre corto, situación y tarea en una línea, acción clave, resultado, competencias). Después grabate contando 2 de ellas.","checklist":["Tengo al menos 6 historias reales","Cubren trabajo en equipo, problemas, clientes, aprendizaje, presión y error","Cada una tiene un resultado o aprendizaje","Me grabé contando 2 y duran menos de 2 minutos cada una"]}$wk$::jsonb, null
from courses where slug = $wk$entrevistas-nivel-2$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$entrevistas-online$wk$, $wk$Lecciones$wk$, $wk$Entrevistas por videollamada, teléfono y WhatsApp$wk$, $wk$Hoy muchas primeras entrevistas son por **Google Meet, Zoom, Teams, llamada telefónica o incluso por WhatsApp**. Parecen más informales, pero se evalúan igual que una presencial. La diferencia es que **los problemas técnicos y el entorno también hablan de vos**.

**Antes (el día anterior)**

- **Probá la plataforma** que te indicaron: instalala si hace falta, entrá al link de prueba y revisá cámara y micrófono.
- **Revisá tu nombre de usuario.** Que diga tu nombre y apellido, no "gamer2004".
- **Elegí el lugar:** pared lisa o lugar ordenado detrás, luz de frente (una ventana delante tuyo, no detrás) y el menor ruido posible.
- **Cámara a la altura de los ojos.** Si usás el celular, apoyalo en algo firme y en horizontal. Nada de sostenerlo con la mano.
- **Batería y datos:** celular o notebook cargado, y si tu wifi falla, tené datos móviles como plan B.
- **Avisá en casa** que vas a estar en una entrevista.

**Durante**

- **Conectate 5 minutos antes.**
- **Vestite como si fuera presencial** (también de la cintura para abajo, por si tenés que pararte).
- **Mirá a la cámara cuando hablás**, no a tu propia imagen en la pantalla.
- **Silenciá notificaciones** del celular y la computadora.
- Podés tener **una hoja con 3 o 4 notas** (tus historias clave, preguntas para hacer), pero no leas respuestas.
- Si se corta: volvé a entrar, y si no podés, escribí enseguida al contacto por el medio que tengas: "Disculpe, se me cortó la conexión, ¿puedo reconectarme o prefiere que lo llame?".

**Entrevista telefónica**

- Buscá un lugar sin ruido y atendé con tu nombre: "Hola, habla Ana Giménez".
- Sonreí aunque no te vean: se nota en la voz.
- Tené tu CV y el aviso a mano.

**Entrevista o preselección por WhatsApp**

Algunas empresas mandan preguntas por WhatsApp o piden audios. Respondé **como si fuera un correo**: saludo, respuesta completa, cierre. Nada de "ok" o stickers. Si piden un audio, grabalo en un lugar silencioso, escuchalo antes de mandarlo y que no pase de lo que te piden. (Y desconfiá si en el chat te piden plata o datos bancarios: lo vemos en el curso "Que no te estafen".)$wk$, 15, 3, $wk$[{"q":"¿Dónde conviene que esté la luz en una videollamada?","options":["Detrás tuyo","De frente, iluminando tu cara","Arriba, apuntando a la cámara","No importa"],"answer":1,"explanation":"Con la luz detrás quedás a contraluz y no se te ve la cara. La luz de frente es la mejor opción."},{"q":"Se corta la conexión en medio de la entrevista. ¿Qué hacés?","options":["Esperás a que te vuelvan a llamar sin hacer nada","Intentás reconectarte y, si no podés, avisás de inmediato al contacto","Das por perdida la entrevista","Mandás un sticker"],"answer":1,"explanation":"Los cortes pasan. Lo que se evalúa es cómo reaccionás: rápido y con buena comunicación."},{"q":"¿Cómo respondés preguntas de preselección por WhatsApp?","options":["Con respuestas cortas tipo \"ok\"","Con saludo, respuesta completa y cierre, como un correo","Solo con audios largos","Con emojis para parecer simpático"],"answer":1,"explanation":"Aunque el canal sea informal, la empresa te está evaluando. Escribí con el mismo cuidado que en un correo."}]$wk$::jsonb, $wk$["Probá la plataforma, cámara y micrófono el día antes.","Luz de frente, cámara a la altura de los ojos, fondo ordenado.","Mirá a la cámara cuando hablás.","Por WhatsApp, escribí como si fuera un correo."]$wk$::jsonb, $wk$[{"youtube_id":"cyzgVnXGBl0","title":"Cómo triunfar en una Entrevista Virtual de Trabajo","channel":"Teresa Baró • Comunicación de éxito","why":"Diez consejos concretos de una experta en comunicación, desde el fondo de la cámara hasta la expresión de la cara."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Ensayo técnico","type":"checklist","prompt":"Hacé una videollamada de prueba de 5 minutos con alguien de confianza (o grabate) usando la plataforma que más se usa en tu rubro.","checklist":["Mi nombre de usuario muestra mi nombre y apellido","La luz me ilumina la cara de frente","La cámara está a la altura de mis ojos y fija","El fondo está ordenado y no hay ruido fuerte","Practiqué mirar a la cámara mientras hablo","Tengo un plan B si se corta (datos móviles y contacto a mano)"]}$wk$::jsonb, null
from courses where slug = $wk$entrevistas-nivel-2$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$pretension-salarial$wk$, $wk$Lecciones$wk$, $wk$"¿Cuál es tu pretensión salarial?"$wk$, $wk$Es la pregunta que más nervios da, y a veces aparece en el mismo formulario de postulación. Si pedís mucho, temés quedar afuera; si pedís poco, después te arrepentís. La solución es **llegar con un número pensado, no improvisado**.

**Paso 1 — Investigá cuánto se paga**

- Mirá avisos del mismo puesto en Worka y otros portales: algunos publican rango salarial.
- Preguntá a gente que trabaja en el rubro (por mensaje privado, con respeto).
- Tené en cuenta la ciudad, el tamaño de la empresa y la jornada.

**Paso 2 — Conocé el piso legal**

En Paraguay, desde el **1 de julio de 2026 el salario mínimo para actividades diversas no especificadas es de Gs. 3.044.000 por mes** (jornada completa). Algunas actividades tienen mínimos propios más altos. Ningún empleo formal de jornada completa puede pagar menos que el mínimo que corresponde. *(Más detalle en el curso "Tus derechos al empezar a trabajar".)*

**Paso 3 — Entendé bruto y neto**

Cuando hablás de salario en Paraguay, lo habitual es hablar del **bruto**. A eso se le descuenta el **9% de aporte obrero al IPS**. Ejemplo con el mínimo: Gs. 3.044.000 − 9% (Gs. 273.960) = **Gs. 2.770.040 que te depositan**. Si tu cuenta es "necesito cobrar X en mano", sumale el descuento para saber qué bruto pedir. Si no te queda claro si hablan de bruto o neto, preguntá: es una pregunta normal.

**Paso 4 — Armá tu rango**

- **Mínimo aceptable:** lo menos que podés aceptar sin que te afecte (y nunca por debajo del mínimo legal).
- **Objetivo:** lo que es razonable según tu investigación.
- **Rango a decir:** empezá un poco por encima de tu objetivo, con un margen corto. Ejemplo: si tu objetivo es Gs. 4.000.000, podés decir "entre 4 y 4,5 millones".

**Paso 5 — Cómo decirlo**

> "Según lo que investigué para este tipo de puesto y lo que puedo aportar, mi pretensión está entre 4 y 4,5 millones brutos. Igual me interesa conocer el paquete completo: beneficios, horario y posibilidades de crecimiento."

Si te preguntan muy temprano y preferís esperar: *"¿Me podrían compartir el rango previsto para el puesto? Así veo si estamos alineados."* Si insisten, da tu rango: evitar la respuesta para siempre puede jugar en contra.

**Más allá del número**, mirá: IPS desde el primer día, horario, días de trabajo, comisiones, viáticos, capacitación, posibilidad de crecer. Un salario un poco menor con IPS y estabilidad puede valer más que uno más alto en negro.

**Señal de alerta:** si te ofrecen trabajar sin IPS, "a prueba sin pagar" o por debajo del mínimo en jornada completa, eso no es una negociación: es una irregularidad.$wk$, 20, 4, $wk$[{"q":"¿Cuál es el salario mínimo mensual en Paraguay desde el 1 de julio de 2026 (actividades diversas no especificadas)?","options":["Gs. 2.550.307","Gs. 2.899.048","Gs. 3.044.000","Gs. 3.500.000"],"answer":2,"explanation":"El reajuste de 2026 llevó el mínimo general a Gs. 3.044.000 mensuales. Verificalo siempre en mtess.gov.py porque cambia cada año."},{"q":"Si tu salario bruto es Gs. 3.044.000, ¿cuánto se descuenta de aporte obrero al IPS?","options":["Gs. 273.960 (9%)","Gs. 502.260 (16,5%)","Nada, lo paga todo la empresa","Gs. 304.400 (10%)"],"answer":0,"explanation":"El trabajador aporta el 9% de su salario. El 16,5% es el aporte patronal, que paga la empresa aparte."},{"q":"¿Cuál es la mejor forma de responder la pretensión salarial?","options":["Lo que ustedes quieran pagar","Un número exacto muy alto para negociar","Un rango corto basado en tu investigación, mencionando que te interesa el paquete completo","Negarte a responder siempre"],"answer":2,"explanation":"Un rango investigado muestra seguridad y flexibilidad. Hablar del paquete completo abre la conversación."}]$wk$::jsonb, $wk$["Investigá antes: no improvises el número.","Piso legal: Gs. 3.044.000 desde el 1/7/2026 (actividades diversas).","Bruto menos 9% de IPS = neto.","Decí un rango corto y hablá del paquete completo."]$wk$::jsonb, $wk$[{"youtube_id":"vq5s8XMB5VE","title":"¿Cuánto quieres GANAR? Como NEGOCIAR el SALARIO en la entrevista de trabajo","channel":"Luis Prado","why":"Explica cómo responder la pregunta del salario sin cerrarte puertas. No habla de Paraguay, así que los montos no aplican, pero la lógica sí."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu rango salarial","type":"texto","prompt":"Elegí el puesto al que más te interesa postular. Buscá al menos 3 avisos o referencias de salario. Escribí tu mínimo aceptable, tu objetivo, el rango que vas a decir (en bruto) y tu frase para responder.","checklist":["Busqué al menos 3 referencias reales","Mi mínimo aceptable no está por debajo del salario mínimo legal","Calculé cuánto me quedaría en mano (bruto menos 9% de IPS)","Escribí mi frase y la practiqué en voz alta"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$entrevistas-nivel-2$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$preguntas-dificiles-y-seguimiento$wk$, $wk$Lecciones$wk$, $wk$Preguntas difíciles y el seguimiento$wk$, $wk$Algunas preguntas no buscan información sino **ver cómo reaccionás**. Con un poco de preparación dejan de ser trampas.

**"¿Cuál es tu mayor debilidad?"**
Elegí algo **real pero que no sea central para el puesto**, y contá qué estás haciendo para mejorarlo. *"Me cuesta hablar en público. Por eso este año me anoté para presentar los trabajos de mi grupo en la facultad, y cada vez me cuesta menos."* Evitá el clásico "soy perfeccionista": suena a respuesta armada.

**"¿Por qué te fuiste de tu último trabajo?" / "¿Por qué tenés un hueco en tu CV?"**
Respondé breve, honesto y **sin hablar mal** de nadie. *"Terminó mi contrato temporal y estoy buscando algo estable."* *"Estuve un año cuidando a un familiar. Ya está resuelto y estoy lista para volver a trabajar."* Después llevá la conversación a lo que querés: este puesto.

**"¿Por qué deberíamos contratarte a vos?"**
Es tu cierre de venta: **2 o 3 razones conectadas con el aviso** y una prueba de cada una. *"Porque tengo experiencia en atención al cliente, manejo el sistema de facturación que usan y vivo cerca, así que puedo cumplir el horario de apertura sin problemas."*

**"¿Tenés alguna pregunta?"**
Siempre tené 2 o 3. Ejemplos:
- "¿Cómo sería un día normal en este puesto?"
- "¿Qué esperan que logre la persona en los primeros tres meses?"
- "¿Cuáles son los próximos pasos del proceso?"

**Preguntas que no corresponden.** Si te preguntan si tenés pareja, si pensás tener hijos o tu religión, no estás obligado/a a responder. Podés decir con calma: *"Prefiero enfocarme en lo que puedo aportar al puesto."*

**El seguimiento: lo que casi nadie hace**

- **El mismo día**, mandá un mensaje corto de agradecimiento (correo o WhatsApp, según el canal que usaron con vos): *"Hola, [nombre]. Gracias por la entrevista de hoy para el puesto de [puesto]. Me quedé con más ganas de sumarme al equipo, sobre todo por [algo que te contaron]. Quedo atenta a los próximos pasos. Saludos, Ana Giménez."*
- **Si te dijeron un plazo y pasó**, esperá un par de días más y consultá una sola vez, con amabilidad.
- **Si no te eligen**, agradecé y pedí, si se puede, una sugerencia para mejorar. Muchas personas consiguen el siguiente puesto en la misma empresa por cómo cerraron.$wk$, 15, 5, $wk$[{"q":"¿Cuál es una buena respuesta a \"¿Cuál es tu mayor debilidad?\"","options":["No tengo debilidades","Soy demasiado perfeccionista","Una debilidad real, no central para el puesto, con lo que estás haciendo para mejorarla","Una crítica a tu jefe anterior"],"answer":2,"explanation":"Muestra autoconocimiento y ganas de mejorar, que es lo que buscan con esa pregunta."},{"q":"Te preguntan si pensás tener hijos. ¿Qué podés hacer?","options":["Estás obligado/a a responder","Responder con calma que preferís enfocarte en lo que podés aportar al puesto","Levantarte e irte gritando","Mentir"],"answer":1,"explanation":"Es una pregunta que no tiene que ver con tu capacidad para el puesto. Podés redirigir la conversación con respeto."},{"q":"¿Cuándo conviene mandar el mensaje de agradecimiento?","options":["El mismo día de la entrevista","Un mes después","Solo si te eligen","Nunca, molesta"],"answer":0,"explanation":"Un mensaje breve el mismo día te diferencia y deja una buena última impresión."}]$wk$::jsonb, $wk$["Debilidad: real, no central y con plan de mejora.","Nunca hables mal de empleos anteriores.","Llevá 2 o 3 preguntas para hacer.","Mensaje de agradecimiento el mismo día."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tus respuestas difíciles","type":"texto","prompt":"Escribí tu respuesta a: 1) ¿Cuál es tu mayor debilidad? 2) ¿Por qué deberíamos contratarte? 3) Tus 3 preguntas para el final. 4) Tu mensaje de agradecimiento modelo.","checklist":["La debilidad es real y tiene un plan de mejora","El \"por qué contratarte\" tiene 2 o 3 razones con prueba","Tengo 3 preguntas para hacer","Mi mensaje de agradecimiento es corto y menciona algo concreto"]}$wk$::jsonb, null
from courses where slug = $wk$entrevistas-nivel-2$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

-- ── Buscá empleo con estrategia ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$busca-empleo-con-estrategia$wk$, $wk$Buscá empleo con estrategia$wk$, $wk$Dejá de mandar CV al azar. Definí qué buscás, usá todos los canales que existen en Paraguay, activá tus contactos y armá una rutina semanal que dé resultados.$wk$, $wk$Empleo$wk$, $wk$Básico$wk$, 'publicado', 6, $wk$70 min$wk$, $wk$Cómo buscar trabajo en Paraguay con estrategia — Curso gratis | Academia Worka$wk$, $wk$Aprendé a definir tu objetivo laboral, dónde buscar empleo en Paraguay (portales, EmpleaPy, ferias, contactos) y cómo organizar tu búsqueda semana a semana. Curso gratis con certificado.$wk$, $wk$["Definir 2 o 3 puestos objetivo y tus condiciones mínimas","Usar todos los canales de búsqueda disponibles en Paraguay","Pedir ayuda a tus contactos sin sentir vergüenza","Organizar tu búsqueda con un tablero y metas semanales"]$wk$::jsonb, null, null, null, 70, true, $wk${"title":"Dos semanas de búsqueda con sistema","prompt":"Durante 2 semanas, aplicá tu plan. Al final, completá un resumen corto.","suggested_questions":[],"checklist":["Tengo mi objetivo y frase de búsqueda escritos","Usé al menos 3 canales distintos","Mandé mensajes a al menos 5 contactos","Registré todas mis postulaciones en el tablero","Revisé mis números y escribí qué voy a ajustar"]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$defini-tu-objetivo$wk$, $wk$Lecciones$wk$, $wk$Primero, qué buscás$wk$, $wk$"Busco trabajo de lo que sea" parece una buena actitud, pero en la práctica complica todo: tu CV queda genérico, no sabés dónde buscar y te cuesta explicar en una entrevista por qué querés *ese* puesto. Las búsquedas que funcionan empiezan con un **objetivo claro**.

**1. Elegí 2 o 3 puestos objetivo**

No uno solo (te limita) ni diez (te dispersa). Que tengan relación entre sí. Ejemplos:

- Cajero/a · Atención al cliente · Vendedor/a de salón
- Auxiliar administrativo/a · Recepcionista · Asistente de facturación
- Ayudante de cocina · Mozo/a · Bachero/a con posibilidad de crecer

Para elegir, cruzá tres preguntas: **¿qué sé hacer o puedo aprender rápido?**, **¿qué se pide en el mercado?** (mirá cuántos avisos hay de eso en Worka) y **¿qué me interesa al menos un poco?**

**2. Definí tus condiciones**

Anotá con honestidad:

- **Zona:** ¿hasta dónde podés viajar? Calculá cuánto tiempo y cuánta plata se va en pasaje por día. Un sueldo un poco más alto lejos de tu casa puede rendir menos que uno cerca.
- **Horario:** ¿podés turnos rotativos, noches, fines de semana? ¿Estudiás?
- **Salario mínimo aceptable** (en el curso "Entrevistas nivel 2" aprendés a calcularlo).
- **Modalidad:** presencial, híbrido o remoto.
- **No negociables:** por ejemplo, IPS desde el inicio.

**3. Escribí tu frase de búsqueda**

Una oración que puedas decir a cualquier persona en 10 segundos:

> *"Estoy buscando trabajo como auxiliar administrativa o recepcionista en Asunción o San Lorenzo, de lunes a viernes. Tengo experiencia en facturación y manejo Excel."*

Esa frase va a ser tu perfil de CV, tu titular de LinkedIn y lo que le digas a tus contactos. Cuanto más clara, más fácil es que otros te ayuden.

**¿Y si necesito trabajar ya, de lo que sea?** Es una situación real y válida. En ese caso, separá dos búsquedas: una **urgente** (trabajos que podés conseguir rápido para cubrir gastos) y otra **de fondo** (el puesto al que querés llegar), aunque le dediques menos horas. Así no perdés el rumbo.$wk$, 15, 1, $wk$[{"q":"¿Cuántos puestos objetivo conviene definir?","options":["Uno solo","2 o 3 relacionados entre sí","Todos los que existan","Ninguno, mejor de lo que sea"],"answer":1,"explanation":"Dos o tres puestos te dan opciones sin dispersarte, y te permiten adaptar mejor tu CV."},{"q":"¿Por qué importa calcular el costo y el tiempo de viaje?","options":["No importa","Porque un sueldo más alto lejos de casa puede rendirte menos","Porque la empresa lo pregunta siempre","Para elegir la ropa"],"answer":1,"explanation":"El pasaje y las horas de viaje son parte del costo de trabajar. Hay que tenerlos en cuenta para decidir."},{"q":"¿Para qué sirve tu frase de búsqueda?","options":["Para decirla en la entrevista final solamente","Para que cualquier persona entienda en segundos qué buscás y pueda ayudarte","Para ponerla en tu estado de WhatsApp y nada más","No sirve"],"answer":1,"explanation":"Una frase clara se usa en tu CV, tu perfil y cuando hablás con contactos. Facilita que te recomienden."}]$wk$::jsonb, $wk$["2 o 3 puestos objetivo relacionados entre sí.","Condiciones claras: zona, horario, salario mínimo, modalidad.","Una frase de búsqueda que cualquiera entienda en 10 segundos.","Si es urgente: búsqueda rápida + búsqueda de fondo."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu objetivo en una hoja","type":"texto","prompt":"Escribí tus 2 o 3 puestos objetivo, tus condiciones (zona, horario, salario mínimo aceptable, modalidad, no negociables) y tu frase de búsqueda.","checklist":["Los puestos tienen relación entre sí","Revisé que hay avisos de esos puestos en Worka","Calculé tiempo y costo de viaje de las zonas que elegí","Mi frase de búsqueda se dice en menos de 10 segundos"]}$wk$::jsonb, null
from courses where slug = $wk$busca-empleo-con-estrategia$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$donde-buscar-empleo-en-paraguay$wk$, $wk$Lecciones$wk$, $wk$Dónde están los empleos en Paraguay$wk$, $wk$Mucha gente busca trabajo en un solo lugar (un grupo de Facebook o un portal) y se frustra. Los empleos aparecen por **varios canales a la vez**. Usá al menos tres.

**1. Portales de empleo**

- **Worka (worka.click):** completá tu perfil al 100%, activá alertas para tus puestos objetivo y postulá con tu CV adaptado. Revisá también la sección de opiniones para conocer a las empresas.
- **EmpleaPy (emplea.mtess.gov.py):** el portal oficial del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS). Te registrás, completás tu CV y postulás a vacancias de empresas privadas. Publica vacancias de Asunción, Central y otros departamentos.
- **Otros portales y LinkedIn:** úsalos también. La misma empresa a veces publica en varios lugares.

**2. Ferias y jornadas de empleo**

El MTESS organiza **ferias de empleo** y jornadas de entrevistas con varias empresas en un solo día, en Asunción y en el interior. Muchas incluyen puestos para primer empleo. Seguí las redes del MTESS y de tu municipalidad para enterarte. Para ir: llevá varias copias de tu CV, vestite como para una entrevista y prepará tu frase de búsqueda, porque vas a hablar con muchas empresas en poco tiempo.

El MTESS también ofrece servicios gratuitos de orientación laboral. Consultá en la **Dirección General de Empleo** o en mtess.gov.py qué talleres están disponibles.

**3. Programas para jóvenes**

El Gobierno lanzó **EmpleaPy Joven**, un programa para promover el primer empleo formal de jóvenes, con incentivos para las empresas que los contratan. Las condiciones (edad, requisitos, cómo anotarse) pueden cambiar: verificalas en los canales oficiales del MTESS antes de contar con él.

**4. Directo a las empresas**

¿Hay empresas donde te gustaría trabajar? Muchas tienen sección "Trabajá con nosotros" en su web, o reciben CV en un correo de RR. HH. Para comercios, gastronomía y servicios, **ir en persona** con tu CV en un horario tranquilo (no en hora pico) todavía funciona en Paraguay.

**5. Tu red de contactos**

Familia, amigos, ex compañeros, profesores, vecinos, gente de tu iglesia o club. Muchísimos puestos se llenan por recomendación. Lo vemos en detalle en la próxima lección.

**6. Grupos de Facebook y WhatsApp**

Pueden tener ofertas reales, pero también son el lugar favorito de las estafas. Usalos con cuidado y verificá todo (curso "Que no te estafen").$wk$, 20, 2, $wk$[{"q":"¿Cuál es el portal oficial de empleo del Ministerio de Trabajo de Paraguay?","options":["EmpleaPy","Facebook Marketplace","Un grupo de WhatsApp","El portal del IPS"],"answer":0,"explanation":"EmpleaPy (emplea.mtess.gov.py) es el portal oficial del MTESS para buscar vacancias y postular."},{"q":"¿Qué conviene llevar a una feria de empleo?","options":["Nada, todo es digital","Varias copias del CV y tu frase de búsqueda preparada","Solo la cédula","Un regalo para cada empresa"],"answer":1,"explanation":"En una feria hablás con muchas empresas en poco tiempo. Tener CV impresos y saber presentarte rápido marca la diferencia."},{"q":"¿Cuántos canales de búsqueda conviene usar?","options":["Solo uno, para no confundirse","Al menos 3 a la vez","Ninguno, esperar a que te llamen","Solo grupos de Facebook"],"answer":1,"explanation":"Las ofertas aparecen por distintos caminos. Combinar canales aumenta tus oportunidades."}]$wk$::jsonb, $wk$["Usá al menos 3 canales a la vez.","Worka + EmpleaPy + contactos es una buena base.","Ferias de empleo: muchas empresas en un día.","Grupos de redes: sí, pero verificando todo."]$wk$::jsonb, $wk$[{"youtube_id":"S70ih_QurYk","title":"Emplea PY","channel":"Gobierno del Paraguay","why":"Presentación oficial del portal de empleo público EmpleaPy, que conecta a quienes buscan trabajo con empresas."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tus canales activos","type":"checklist","prompt":"Activá al menos 3 canales esta semana.","checklist":["Completé mi perfil de Worka y activé alertas para mis puestos objetivo","Me registré en EmpleaPy y cargué mi CV","Anoté 5 empresas donde me gustaría trabajar y busqué cómo reciben CV","Sigo las redes del MTESS o de mi municipalidad para enterarme de ferias","Le conté mi frase de búsqueda a al menos 3 personas"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$busca-empleo-con-estrategia$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$contactos-y-mercado-oculto$wk$, $wk$Lecciones$wk$, $wk$Tus contactos y los empleos que no se publican$wk$, $wk$Muchas vacantes se cubren **sin publicarse**: alguien de adentro recomienda a un conocido, el dueño le pregunta a un proveedor, una profe le pasa un nombre a una empresa. A eso se le llama a veces **"mercado oculto"**. Vas a leer cifras como "el 70% o el 80% de los empleos no se publica": no hay un dato confiable para Paraguay y esos números probablemente estén exagerados. Lo que sí es seguro es que **las recomendaciones pesan mucho**, sobre todo en empresas chicas y medianas.

**"Pero yo no tengo contactos"**

Casi todos tenemos más de los que creemos. Hacé una lista de 20 personas: familiares, amigos, vecinos, ex compañeros del colegio o la facultad, profesores, ex jefes, gente de tu iglesia, club o barrio, clientes del negocio familiar. No necesitás que trabajen en RR. HH.: necesitás que **sepan qué buscás** y se acuerden de vos cuando escuchen de algo.

**Cómo pedir ayuda sin incomodar**

La clave: **no pidas "un trabajo"**. Pedí algo concreto y fácil de dar.

*Para alguien cercano:*
> "Hola, tía. Te cuento que estoy buscando trabajo como auxiliar administrativa o recepcionista, en Asunción o San Lorenzo. Si escuchás de algo o conocés a alguien que trabaje en una empresa de la zona, ¿me avisás? Te paso mi CV por si acaso. ¡Gracias!"

*Para alguien que trabaja en una empresa que te interesa:*
> "Hola, Carlos. Soy Ana, compañera de Lucía en la UNA. Vi que trabajás en [empresa] y me interesa mucho el área de administración. ¿Tendrías 10 minutos esta semana para contarme cómo es trabajar ahí y qué valoran en los candidatos? Sería de gran ayuda."

Fijate que en el segundo caso no pedís trabajo: pedís **información**. Es mucho más fácil decir que sí a eso, y muchas veces la conversación termina en "mandame tu CV, que lo paso".

**Reglas de buena educación**

- Mensajes cortos, con tu nombre y cómo se conocen.
- Respetá si no responden. Podés insistir **una vez**, con amabilidad, a la semana.
- **Agradecé siempre**, aunque no salga nada.
- Cuando consigas trabajo, avisales y agradecé otra vez. Y ayudá a otros cuando te toque.$wk$, 20, 3, $wk$[{"q":"¿Qué es el llamado \"mercado oculto\" de empleo?","options":["Trabajos ilegales","Vacantes que se cubren sin publicarse, muchas veces por recomendación","Empleos solo para extranjeros","Ofertas en la deep web"],"answer":1,"explanation":"Son puestos que se llenan por contactos o recomendaciones antes de publicarse. Las cifras exactas son discutidas, pero el fenómeno existe."},{"q":"¿Cuál es el mejor pedido para un contacto que trabaja en una empresa que te interesa?","options":["¿Me conseguís trabajo?","¿Tenés 10 minutos para contarme cómo es trabajar ahí?","Mandarle tu CV sin decir nada","Escribirle todos los días hasta que responda"],"answer":1,"explanation":"Pedir información es fácil de aceptar y abre la puerta a una recomendación."},{"q":"Un contacto no te respondió. ¿Qué hacés?","options":["Le escribís todos los días","Insistís una vez, con amabilidad, después de una semana","Lo bloqueás","Le reclamás en público"],"answer":1,"explanation":"Un recordatorio amable está bien. Más que eso puede incomodar."}]$wk$::jsonb, $wk$["Muchas vacantes se cubren por recomendación.","Hacé una lista de 20 contactos: tenés más de los que creés.","Pedí algo concreto y fácil: información o un aviso, no \"un trabajo\".","Agradecé siempre, consigas o no."]$wk$::jsonb, $wk$[{"youtube_id":"W_M9EM04pko","title":"Como funciona el MERCADO OCULTO DE EMPLEO o TRABAJO","channel":"Luis Prado","why":"Explica por qué muchas vacantes se cubren antes de publicarse y cómo llegar a ellas."},{"youtube_id":"mv07mjl8CEo","title":"TALLER: CÓMO ACCEDER AL MERCADO OCULTO DE EMPLEO","channel":"Francisco F","why":"Una mirada crítica que pone en duda los porcentajes que se repiten sobre el mercado oculto. Verlo junto al anterior te da una idea equilibrada."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu lista de 20 y 3 mensajes","type":"texto","prompt":"Escribí tu lista de 20 contactos (solo nombre y de dónde los conocés). Elegí 3 y escribí el mensaje que les vas a mandar esta semana, adaptado a cada uno.","checklist":["Tengo 20 contactos de distintos ámbitos","Cada mensaje dice mi nombre, cómo nos conocemos y qué busco","Pido algo concreto (información o que me avisen), no \"un trabajo\"","Mandé al menos uno de los 3 mensajes"]}$wk$::jsonb, null
from courses where slug = $wk$busca-empleo-con-estrategia$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$sistema-semanal-de-busqueda$wk$, $wk$Lecciones$wk$, $wk$Tu sistema semanal de búsqueda$wk$, $wk$Buscar trabajo es, en sí mismo, un trabajo. Las personas que consiguen empleo más rápido no siempre son las más calificadas: muchas veces son las más **constantes y organizadas**.

**1. Tu tablero de postulaciones**

Usá una planilla (Google Sheets o Excel) o una nota del celular con estas columnas:

| Fecha | Empresa | Puesto | Canal | CV usado | Estado | Próximo paso | Fecha próximo paso |
|---|---|---|---|---|---|---|---|
| 14/10 | Empresa X | Recepcionista | Worka | CV-Recepcion-X | Postulado | Consultar si no hay respuesta | 24/10 |

Estados posibles: *Postulado → Contactado → Entrevista → Segunda entrevista → Oferta / No seleccionado*.

Así sabés a quién le escribiste, qué CV mandaste y cuándo hacer seguimiento.

**2. Metas de actividad, no de resultado**

No podés controlar si te llaman, pero sí lo que hacés. Poné metas semanales como:

- 5 a 10 postulaciones **adaptadas** (calidad antes que cantidad).
- 3 mensajes a contactos.
- 1 hora de capacitación (un curso de la Academia, por ejemplo).
- 1 práctica de entrevista.

**3. Bloques fijos en tu semana**

Si no estás trabajando, tratá la búsqueda como un horario: por ejemplo, de lunes a viernes de 8 a 11. Si trabajás o estudiás, 3 bloques de una hora por semana ya hacen diferencia.

**4. Revisá tus números cada dos semanas**

- **Muchas postulaciones y casi ninguna respuesta** → el problema suele estar en el CV o en que postulás a puestos que no encajan. Revisá el curso 1.
- **Te llaman pero no pasás la entrevista** → practicá más (curso 2 y "Preparate para tus entrevistas").
- **Llegás a la etapa final y no te eligen** → pedí devolución y seguí: estás cerca.

**5. Cuidá tu ánimo**

Los "no" y los silencios son parte del proceso y **no dicen nada de tu valor como persona**. Celebrá las metas de actividad cumplidas, no solo las ofertas. Mantené rutinas: dormir, moverte, ver gente. Si sentís que el desánimo te supera, hablalo con alguien de confianza.$wk$, 15, 4, $wk$[{"q":"¿Cuál es un ejemplo de meta de actividad?","options":["Conseguir trabajo esta semana","Hacer 5 postulaciones adaptadas esta semana","Que me llamen 3 empresas","Ganar más que el mes pasado"],"answer":1,"explanation":"Las metas de actividad dependen de vos. Los resultados llegan como consecuencia."},{"q":"Postulaste a 30 avisos y casi nadie respondió. ¿Qué conviene revisar primero?","options":["Tu forma de vestir","Tu CV y si los avisos encajan con tu perfil","Tu foto de WhatsApp","Nada, es mala suerte"],"answer":1,"explanation":"Si no llegás a la entrevista, el filtro está antes: en el CV o en la elección de avisos."},{"q":"¿Para qué sirve la columna \"Próximo paso\" del tablero?","options":["Para nada","Para saber cuándo y cómo hacer seguimiento de cada postulación","Para anotar el salario","Para escribir quejas"],"answer":1,"explanation":"Te recuerda qué hacer y cuándo, así no se te pasa ningún seguimiento."}]$wk$::jsonb, $wk$["Llevá un tablero con cada postulación y su próximo paso.","Metas de actividad semanales, no solo de resultado.","Revisá tus números cada dos semanas y ajustá.","Un \"no\" no define tu valor."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu tablero y tu semana","type":"checklist","prompt":"Armá tu tablero y planificá tu próxima semana de búsqueda.","checklist":["Creé mi tablero con las columnas sugeridas","Cargué las postulaciones que ya hice","Escribí mis metas de actividad para la semana","Agendé mis bloques de búsqueda en el calendario del celular","Puse un recordatorio para revisar mis números en 2 semanas"]}$wk$::jsonb, null
from courses where slug = $wk$busca-empleo-con-estrategia$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

-- ── LinkedIn que trabaja por vos ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$linkedin-que-trabaja-por-vos$wk$, $wk$LinkedIn que trabaja por vos$wk$, $wk$Armá un perfil de LinkedIn que te encuentren los reclutadores, aunque tengas poca experiencia. Foto, titular, "Acerca de", contactos y cómo usarlo para postular.$wk$, $wk$Marca personal$wk$, $wk$Básico$wk$, 'publicado', 7, $wk$65 min$wk$, $wk$Cómo armar tu perfil de LinkedIn para conseguir trabajo — Curso gratis | Academia Worka$wk$, $wk$Aprendé a optimizar tu perfil de LinkedIn paso a paso, incluso sin experiencia - foto, titular, extracto, aptitudes, contactos y búsqueda de empleo. Curso gratis con certificado.$wk$, $wk$["Crear un titular y una sección \"Acerca de\" que te hagan encontrable","Cargar experiencia, formación y aptitudes con palabras clave","Construir una red de contactos útil desde cero","Usar LinkedIn para encontrar y postular a empleos"]$wk$::jsonb, null, null, null, 70, true, $wk${"title":"Perfil de LinkedIn completo y activo","prompt":"Dejá tu perfil listo y activo. Compartí el enlace con alguien de confianza para que lo revise con este checklist.","suggested_questions":[],"checklist":["Foto, portada, titular con palabras clave, ubicación y URL personalizada","\"Acerca de\" con los 4 bloques","Experiencia y proyectos con logros","Al menos 10 aptitudes y 1 recomendación o validación","Al menos 50 contactos relevantes","Alertas de empleo activas","Agregué el certificado de este curso en \"Licencias y certificaciones\""]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$foto-titular-y-enlace$wk$, $wk$Lecciones$wk$, $wk$La parte de arriba: foto, titular y enlace$wk$, $wk$LinkedIn es una red social profesional y, al mismo tiempo, un **buscador**: los reclutadores escriben palabras ("auxiliar contable Asunción", "community manager") y LinkedIn les muestra perfiles. Lo que aparece primero es la **parte de arriba de tu perfil**. Si eso está bien, ya ganaste mucho.

**Foto de perfil**

- Tu cara se ve clara, ocupando buena parte del círculo.
- Fondo simple, buena luz (cerca de una ventana).
- Ropa acorde a tu rubro. No hace falta traje: alcanza con algo prolijo.
- Sin lentes de sol, sin otras personas recortadas, sin filtros.
- Un celular actual alcanza perfectamente.

**Imagen de portada (el banner)**

Opcional, pero suma. Puede ser algo relacionado con tu área o una imagen simple con tu frase de búsqueda. Evitá la portada gris por defecto si podés.

**Titular: la línea más importante**

Es la frase que aparece debajo de tu nombre en todas partes (búsquedas, comentarios, mensajes). LinkedIn propone poner tu cargo actual, pero podés escribir lo que quieras en unos 220 caracteres. Usalo para decir **qué hacés o buscás + palabras clave + un diferencial**.

| Débil | Fuerte |
|---|---|
| Estudiante | Estudiante de Contabilidad (UNA) · Facturación electrónica · Excel intermedio · Busco primer empleo en administración |
| En búsqueda de nuevos desafíos | Atención al cliente y ventas · 3 años en retail · Manejo de caja y cobranzas · Asunción y Central |
| Desocupado | Diseñador gráfico junior · Canva, Illustrator, redes sociales · Portfolio en el enlace |

**Ubicación:** poné tu ciudad real. Los reclutadores filtran por zona.

**URL personalizada:** en la configuración del perfil podés cambiar el enlace de algo como `linkedin.com/in/ana-gimenez-8a7b6c5` a `linkedin.com/in/anagimenez`. Queda más prolijo para poner en tu CV.$wk$, 15, 1, $wk$[{"q":"¿Por qué el titular es tan importante?","options":["Porque es lo único que leen tus amigos","Porque aparece debajo de tu nombre en búsquedas, comentarios y mensajes","Porque LinkedIn lo traduce a otros idiomas","No es importante"],"answer":1,"explanation":"El titular acompaña tu nombre en toda la plataforma y ayuda a que te encuentren por palabras clave."},{"q":"¿Cuál es el mejor titular?","options":["En búsqueda de nuevos desafíos","Desocupado","Atención al cliente y ventas · 3 años en retail · Manejo de caja · Asunción","Hola, soy Ana"],"answer":2,"explanation":"Dice qué hace, tiene palabras clave que un reclutador buscaría y da contexto."},{"q":"¿Para qué sirve personalizar la URL del perfil?","options":["Para tener más seguidores","Para que el enlace sea más prolijo y fácil de compartir en tu CV","Es obligatorio para postular","Para ocultar tu perfil"],"answer":1,"explanation":"Un enlace limpio con tu nombre se ve mejor en el CV y en mensajes."}]$wk$::jsonb, $wk$["LinkedIn es un buscador: las palabras clave importan.","Foto clara, prolija y solo vos.","Titular = qué hacés o buscás + palabras clave + diferencial.","Ubicación real y URL personalizada."]$wk$::jsonb, $wk$[{"youtube_id":"TZGGqlizI2I","title":"📌 Qué poner en el titular de LinkedIn","channel":"Marta Fernández · Superando procesos de selección","why":"Video corto y práctico sobre cómo combinar puesto, sector y herramientas en el titular."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"La parte de arriba de tu perfil","type":"texto","prompt":"Escribí tu nuevo titular (máximo 220 caracteres) y aplicá los cambios de foto, ubicación y URL en tu perfil.","checklist":["Mi titular dice qué hago o busco y tiene al menos 2 palabras clave","Cambié o revisé mi foto según las recomendaciones","Puse mi ciudad real","Personalicé mi URL"]}$wk$::jsonb, null
from courses where slug = $wk$linkedin-que-trabaja-por-vos$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$acerca-de-experiencia-aptitudes$wk$, $wk$Lecciones$wk$, $wk$"Acerca de", experiencia y aptitudes$wk$, $wk$Si la parte de arriba hace que alguien entre a tu perfil, esta parte hace que **se quede y te escriba**.

**"Acerca de" (el extracto)**

Es tu presentación en primera persona. No es un CV en párrafo: es una conversación. Una estructura simple de 4 bloques cortos:

1. **Quién sos y qué hacés** (o qué estás aprendiendo).
2. **Qué sabés hacer**, con 2 o 3 ejemplos o logros.
3. **Qué te interesa o qué buscás.**
4. **Cómo contactarte.**

*Ejemplo:*
> Soy estudiante de último año de Contabilidad en la UNA y trabajé dos años en el negocio familiar, donde me encargaba de la facturación y el control de stock.
>
> Me gusta ordenar procesos: armé una planilla de Excel para el inventario que nos ayudó a detectar faltantes antes de que se acabaran los productos. Manejo facturación electrónica, Excel intermedio y atención a proveedores.
>
> Busco mi primer empleo formal como auxiliar contable o administrativa en Asunción o Central.
>
> Escribime por mensaje acá o a ana.gimenez@correo.com.

Usá las palabras clave de tus puestos objetivo de forma natural. Las primeras 2 o 3 líneas son las que se ven sin hacer clic en "ver más": que sean las mejores.

**Experiencia**

Cargá cada trabajo con el mismo criterio del CV: puesto, empresa, fechas y **logros** con la fórmula Verbo + Qué + Resultado. Si la empresa tiene página en LinkedIn, elegila de la lista para que aparezca su logo.

Sin empleo formal, podés cargar: emprendimientos propios, trabajo en el negocio familiar, pasantías, voluntariados (hay una sección propia) y **proyectos** (otra sección), como trabajos destacados de la facultad.

**Formación y certificaciones**

Cargá tu carrera y los cursos que sumen al puesto. Los certificados de la Academia Worka también podés sumarlos en "Licencias y certificaciones".

**Aptitudes (skills)**

Cargá entre 10 y 20 aptitudes, empezando por las que piden los avisos que te interesan (Excel, atención al cliente, facturación, Canva…). Pedile a 2 o 3 personas que te conocen que validen las más importantes.

**Recomendaciones**

Una recomendación escrita de un ex jefe, profesor o cliente pesa mucho. Pedila con un mensaje personal y, si querés, sugerí en qué enfocarse: *"¿Podrías comentar cómo fue mi trabajo en el control de stock?"*$wk$, 20, 2, $wk$[{"q":"¿Qué debería tener la sección \"Acerca de\"?","options":["Tu CV completo copiado","Quién sos, qué sabés hacer con ejemplos, qué buscás y cómo contactarte","Solo una frase motivacional","Tu historia familiar"],"answer":1,"explanation":"Es una presentación breve y concreta. Las frases motivacionales no dicen nada de vos."},{"q":"No tuviste empleo formal. ¿Qué podés cargar en LinkedIn?","options":["Nada","Emprendimientos, negocio familiar, pasantías, voluntariados y proyectos","Solo tus hobbies","Empleos inventados"],"answer":1,"explanation":"LinkedIn tiene secciones para todas estas experiencias. Contalas con logros concretos."},{"q":"¿Qué aptitudes conviene cargar primero?","options":["Las que piden los avisos de tus puestos objetivo","Las que suenan más difíciles","Las que tienen tus amigos","Ninguna, no sirven"],"answer":0,"explanation":"Las aptitudes ayudan a que te encuentren en búsquedas. Priorizá las que buscan las empresas de tu área."}]$wk$::jsonb, $wk$["\"Acerca de\": quién sos, qué sabés hacer, qué buscás, cómo contactarte.","Las primeras líneas son las que más se leen.","Experiencia con logros, igual que en el CV.","10 a 20 aptitudes alineadas a tus puestos objetivo."]$wk$::jsonb, $wk$[{"youtube_id":"gNOeEBgg-R8","title":"¿Cómo optimizar tu perfil de LinkedIn? - Guía paso a paso 2025","channel":"Ivan Keclach","why":"Recorre cada sección del perfil con ejemplos, ideal para ir aplicando mientras mirás."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu \"Acerca de\" y tus aptitudes","type":"texto","prompt":"Escribí tu sección \"Acerca de\" con los 4 bloques y listá tus 10 aptitudes principales. Después cargalos en tu perfil.","checklist":["Las 2 primeras líneas dicen quién soy y qué hago","Incluí al menos 2 logros o ejemplos concretos","Dije qué busco y cómo contactarme","Cargué al menos 10 aptitudes alineadas a mis puestos objetivo","Pedí al menos una recomendación o validación"]}$wk$::jsonb, null
from courses where slug = $wk$linkedin-que-trabaja-por-vos$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$conectar-y-participar$wk$, $wk$Lecciones$wk$, $wk$Tu red: conectar y participar$wk$, $wk$Un perfil perfecto con 15 contactos casi no aparece en búsquedas. LinkedIn muestra más los perfiles **conectados** a quien busca y los perfiles **activos**. No hace falta volverse influencer: con 15 minutos un par de veces por semana alcanza.

**A quién conectar (en este orden)**

1. **Gente que ya conocés:** compañeros de estudio, profesores, ex compañeros de trabajo, amigos que trabajan.
2. **Gente de tu área en Paraguay:** personas que trabajan en los puestos o empresas que te interesan.
3. **Reclutadores y personas de RR. HH.** de empresas que te gustan.

Meta inicial razonable: **llegar a 100 contactos relevantes** en el primer mes.

**Cómo invitar**

Con gente que conocés, la invitación sin nota está bien. Con desconocidos, **agregá una nota corta**:

> "Hola, Laura. Estoy empezando en el área administrativa y me interesa mucho el trabajo que hacen en [empresa]. Me gustaría sumarte a mi red. ¡Gracias!"

**No mandes tu CV en la primera interacción** ni pidas trabajo apenas te aceptan. Primero conectá; después, si hay una oportunidad, escribí.

**Participar sin miedo**

- **Comentá** publicaciones de tu área con algo que aporte ("Me pasó algo parecido cuando…", "¿Y en empresas chicas cómo lo hacen?"). Un buen comentario se ve más que muchos "me gusta".
- **Publicá de vez en cuando:** terminaste un curso (como este), aprendiste algo en un proyecto, fuiste a una feria de empleo. Contá qué aprendiste, no solo "estoy feliz de compartir".
- **Seguí empresas** donde te gustaría trabajar: vas a ver sus novedades y búsquedas.

**Lo que no:** discusiones políticas o personales, publicaciones quejándote de empleadores anteriores, mensajes masivos copiados.$wk$, 15, 3, $wk$[{"q":"¿Con quién conviene empezar a conectar?","options":["Con gente famosa","Con gente que ya conocés (estudios, trabajo, amigos)","Con cualquier perfil al azar","Solo con reclutadores"],"answer":1,"explanation":"Tu red cercana es la base. Después sumás gente de tu área y reclutadores."},{"q":"¿Qué es mejor para hacerte visible?","options":["Dar \"me gusta\" a todo","Comentar con aportes reales en publicaciones de tu área","Mandar tu CV a todos tus contactos","Publicar todos los días cualquier cosa"],"answer":1,"explanation":"Un comentario con aporte muestra cómo pensás y te pone frente a más personas del rubro."},{"q":"Una reclutadora aceptó tu invitación. ¿Qué hacés?","options":["Le mandás enseguida tu CV y le pedís trabajo","Le agradecés y seguís su contenido; si hay una búsqueda que encaja, le escribís","La ignorás","Le escribís todos los días"],"answer":1,"explanation":"Construir la relación primero hace que tu mensaje sea mejor recibido cuando haya una oportunidad."}]$wk$::jsonb, $wk$["Conectá primero con quienes ya conocés, después con tu área.","Con desconocidos, invitación con nota corta.","Comentar bien vale más que muchos \"me gusta\".","No pidas trabajo en el primer mensaje."]$wk$::jsonb, $wk$[{"youtube_id":"_LBpklozSzI","title":"Cómo hacer un BUEN PERFIL en LINKEDIN sin experiencia en 2024 💼 (Explicado paso a paso)","channel":"Junior Achievement Argentina","why":"Pensado para jóvenes sin experiencia - explica por qué usar LinkedIn y cómo empezar a construir tu red desde cero."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Plan de 2 semanas en LinkedIn","type":"checklist","prompt":"Hacé estas acciones durante las próximas 2 semanas.","checklist":["Conecté con al menos 30 personas que conozco","Envié al menos 10 invitaciones con nota a personas de mi área","Sigo al menos 10 empresas donde me gustaría trabajar","Dejé al menos 5 comentarios con aporte","Publiqué una vez sobre algo que aprendí (por ejemplo, este curso)"]}$wk$::jsonb, null
from courses where slug = $wk$linkedin-que-trabaja-por-vos$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$postular-en-linkedin$wk$, $wk$Lecciones$wk$, $wk$Encontrar y postular a empleos en LinkedIn$wk$, $wk$LinkedIn también es un portal de empleo. Usado junto con Worka y EmpleaPy, te da más alcance.

**Avisarle a LinkedIn que estás buscando**

En tu perfil hay una opción para indicar que estás **abierto/a a trabajar**, eligiendo puestos, ubicaciones y modalidad. Podés elegir que lo vean **solo los reclutadores** o **todos** (con el marco verde en la foto). Si tenés trabajo y buscás con discreción, elegí "solo reclutadores". Las opciones y nombres exactos pueden cambiar con las actualizaciones de la app.

**Alertas de empleo**

Buscá tu puesto objetivo + ciudad (por ejemplo, "recepcionista Asunción"), filtrá por fecha y modalidad, y **activá la alerta**. Te van a llegar avisos nuevos por notificación o correo. Postular en los primeros días suele dar mejores resultados.

**Solicitud sencilla vs. sitio de la empresa**

Algunos avisos permiten postular con un clic usando tu perfil. Es cómodo, pero también lo hace todo el mundo. Para los avisos que más te importan:

1. Adaptá tu CV (curso 1) y subí esa versión.
2. Respondé las preguntas del formulario con cuidado.
3. Buscá a la persona que publicó el aviso o a alguien del equipo y mandale un mensaje corto:

> "Hola, Martín. Me postulé al puesto de asistente administrativo en [empresa]. Tengo 2 años de experiencia en facturación y manejo el sistema que mencionan en el aviso. Me encantaría poder contarte más. ¡Gracias por tu tiempo!"

**Investigar empresas antes de la entrevista**

En la página de la empresa en LinkedIn podés ver qué publican, cuántas personas trabajan y quiénes están en el área donde postulaste. Combinalo con las opiniones de empleados en Worka para llegar a la entrevista sabiendo dónde te metés.

**Cuidado con perfiles falsos.** Si un "reclutador" sin foto, sin contactos en común y con perfil nuevo te ofrece un trabajo increíble y te pide datos o dinero, es una estafa (curso "Que no te estafen").$wk$, 15, 4, $wk$[{"q":"Tenés trabajo y buscás otro con discreción. ¿Qué visibilidad elegís para \"abierto a trabajar\"?","options":["Todos (marco verde en la foto)","Solo reclutadores","Ninguna, mejor no usarlo nunca","Publicarlo en tu muro"],"answer":1,"explanation":"La opción solo para reclutadores avisa a quienes contratan sin mostrarlo a toda tu red."},{"q":"¿Qué hacés para un aviso que te interesa mucho?","options":["Solo el clic de solicitud sencilla","CV adaptado, formulario cuidado y mensaje corto a quien publicó","Le escribís a toda la empresa","Esperás a que te encuentren"],"answer":1,"explanation":"El esfuerzo extra en los avisos clave te diferencia de quienes postulan con un clic."},{"q":"¿Cuál es una señal de perfil falso?","options":["Tiene foto y muchos contactos en común","Perfil nuevo, sin foto, sin contactos en común, con una oferta increíble y pedido de datos","Trabaja en una empresa conocida","Publica sobre su trabajo"],"answer":1,"explanation":"La combinación de perfil vacío, oferta demasiado buena y pedido de datos o dinero es típica de estafas."}]$wk$::jsonb, $wk$["Activá \"abierto a trabajar\" con la visibilidad que te convenga.","Alertas por puesto + ciudad, y postulá rápido.","Para avisos clave: CV adaptado + mensaje corto a quien publica.","Desconfiá de perfiles nuevos sin datos que ofrecen demasiado."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tus alertas y una postulación completa","type":"checklist","prompt":"Configurá tu búsqueda en LinkedIn y hacé una postulación completa.","checklist":["Activé \"abierto a trabajar\" con la visibilidad que me conviene","Creé al menos 2 alertas (puesto + ciudad)","Postulé a un aviso con CV adaptado","Mandé un mensaje corto a quien publicó el aviso o a alguien del equipo"]}$wk$::jsonb, null
from courses where slug = $wk$linkedin-que-trabaja-por-vos$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

-- ── Que no te estafen: ofertas de empleo falsas ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$que-no-te-estafen$wk$, $wk$Que no te estafen: ofertas de empleo falsas$wk$, $wk$Aprendé a reconocer ofertas de trabajo falsas, verificar empresas, cuidar tus datos y tu plata, y qué hacer si te pasó.$wk$, $wk$Seguridad$wk$, $wk$Básico$wk$, 'publicado', 8, $wk$55 min$wk$, $wk$Cómo detectar ofertas de trabajo falsas y estafas — Curso gratis | Academia Worka$wk$, $wk$Señales de alerta de ofertas de empleo falsas, cómo verificar una empresa en Paraguay, cómo proteger tus datos y qué hacer si fuiste víctima de una estafa laboral. Curso gratis.$wk$, $wk$["Reconocer las señales de alerta de una oferta falsa","Verificar una empresa antes de mandar datos o ir a una entrevista","Proteger tus datos personales, tu WhatsApp y tu dinero","Saber qué hacer y dónde denunciar si te estafaron"]$wk$::jsonb, null, null, null, 70, true, $wk${"title":"Tu guía antiestafas para compartir","prompt":"Escribí con tus palabras una guía de 5 consejos para no caer en estafas de empleo y compartila con al menos 3 personas que estén buscando trabajo (familia, amigos, grupo de la facultad).","suggested_questions":[],"checklist":["Mi guía tiene 5 consejos claros y concretos","Incluí al menos 2 señales de alerta y 2 formas de verificar","Incluí qué hacer si alguien ya cayó","La compartí con al menos 3 personas"]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$senales-de-alerta$wk$, $wk$Lecciones$wk$, $wk$Las señales de alerta$wk$, $wk$Quien busca trabajo suele estar apurado y con ganas de que algo salga. Los estafadores lo saben y lo aprovechan. Por eso conviene tener **un filtro mental** antes de responder cualquier oferta.

**Las 8 señales de alerta más comunes**

1. **Te piden plata para empezar.** Para "la capacitación", "el uniforme", "el kit de ventas", "el carnet", "la inscripción" o "asegurar tu lugar". **Una empresa seria no te cobra por darte trabajo.**
2. **Sueldo demasiado alto para lo que piden.** "Gs. 8.000.000 por mes, sin experiencia, desde tu casa, 2 horas por día."
3. **Urgencia y presión.** "Quedan 2 lugares, confirmá hoy", "si no mandás los datos ahora perdés el puesto".
4. **Todo por chat, nunca una persona real.** No hay entrevista, ni videollamada, ni dirección; solo mensajes.
5. **Te contactan sin que hayas postulado**, por WhatsApp o Telegram, desde números desconocidos o del extranjero.
6. **"Trabajo fácil" de dar "me gusta", seguir cuentas o mirar videos.** Te pagan un poco al principio para ganar tu confianza y después te piden que "inviertas" para seguir ganando. Esa plata no vuelve.
7. **Te piden datos sensibles muy pronto:** foto de tu cédula de los dos lados, selfie con la cédula, datos de tu cuenta bancaria o billetera, el código que te llega por SMS.
8. **Te ofrecen usar tu cuenta para recibir y transferir dinero** de "clientes" a cambio de una comisión. Eso no es un trabajo: te están usando para mover plata de otras estafas, y el problema legal queda a tu nombre.

**Una señal de peligro especial: ofertas en otro país**

Ofertas para trabajar en el exterior con **pasaje pagado**, poca información sobre la empresa y condiciones como "te guardamos el pasaporte" o "pagás la deuda del viaje con tu sueldo" pueden ser **trata de personas**. Antes de aceptar, verificá todo y contale a tu familia. Ante una situación de riesgo, llamá al **911**.

**Regla de oro:** si te pide plata, te apura o te pide datos que no corresponden, **frená y verificá**. Una oferta real resiste la verificación; una falsa, no.$wk$, 15, 1, $wk$[{"q":"Te ofrecen un puesto y te piden Gs. 150.000 para \"la capacitación obligatoria\". ¿Qué es?","options":["Algo normal en todas las empresas","Una señal de alerta clara de estafa","Una inversión en tu futuro","Un requisito legal"],"answer":1,"explanation":"Las empresas serias no cobran a los candidatos para trabajar. Pedir plata para empezar es la señal más común de estafa."},{"q":"Te pagan por dar \"me gusta\" a videos y después te piden que deposites para \"subir de nivel\". ¿Qué hacés?","options":["Depositás porque ya te pagaron antes","Cortás el contacto: es una estafa conocida","Depositás poco para probar","Invitás a tus amigos"],"answer":1,"explanation":"El pago inicial es para ganar tu confianza. El objetivo es que deposites y esa plata no vuelve."},{"q":"Una \"empresa\" te ofrece una comisión por recibir transferencias en tu cuenta y pasarlas a otra. ¿Qué pasa?","options":["Es un trabajo administrativo común","Te están usando para mover dinero de estafas y el problema legal queda a tu nombre","Es un beneficio del banco","No tiene riesgos"],"answer":1,"explanation":"Prestar tu cuenta para mover dinero de terceros puede involucrarte en delitos, aunque no lo sepas."}]$wk$::jsonb, $wk$["Nunca pagues para conseguir un trabajo.","Demasiado bueno + mucha urgencia = desconfiá.","Nadie serio te pide el código que te llega por SMS.","No prestes tu cuenta para mover plata de otros."]$wk$::jsonb, $wk$[{"youtube_id":"HfFPc41h6Pw","title":"Ofertas de empleo falsas: qué son y cómo detectarlas","channel":"Smowltech en Español","why":"Resume los tipos de ofertas falsas más comunes y las señales para reconocerlas."},{"youtube_id":"7_C-1Ecl--A","title":"Cómo reconocer estafas de empleo","channel":"Telemundo 47","why":"Nota corta de noticiero con un experto que explica cómo llegan estas ofertas al celular y cómo distinguirlas de las reales."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"¿Real o falsa?","type":"texto","prompt":"Leé este mensaje y marcá todas las señales de alerta que encuentres. Mensaje: 'Hola!! Vimos tu perfil y fuiste SELECCIONADA para trabajar desde casa. Sueldo Gs. 6.500.000, sin experiencia, 2 hs por día. Solo tenés que abonar Gs. 120.000 del kit de bienvenida HOY porque quedan 3 cupos. Mandanos foto de tu cédula de los dos lados y el código que te va a llegar por SMS para activar tu cuenta.'","checklist":["Encontré el pedido de plata","Encontré el sueldo desproporcionado","Encontré la urgencia","Encontré el pedido de datos sensibles (cédula y código SMS)","Encontré que me contactan sin que haya postulado"]}$wk$::jsonb, null
from courses where slug = $wk$que-no-te-estafen$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$como-verificar-una-empresa$wk$, $wk$Lecciones$wk$, $wk$Cómo verificar una oferta y una empresa$wk$, $wk$Verificar una oferta te lleva entre 5 y 15 minutos. Es poco tiempo comparado con lo que podés perder.

**1. ¿La empresa existe?**

- **Buscala en Google** con su nombre + "Paraguay". ¿Tiene sitio web, redes con historia (no creadas la semana pasada), dirección en Google Maps?
- **Buscá su RUC.** Las empresas formales en Paraguay tienen RUC. Podés pedírselo y verificar que exista en el servicio de consulta de RUC de la DNIT (Dirección Nacional de Ingresos Tributarios). Si se niegan a dártelo, mala señal.
- **Mirá opiniones** de empleados en Worka y la página de la empresa en LinkedIn.

**2. ¿El aviso es de esa empresa?**

Los estafadores usan nombres de empresas conocidas. Verificá que:

- El correo sea del dominio de la empresa (`rrhh@empresa.com.py`) y no un correo gratuito con un nombre parecido (`empresa.rrhh2026@gmail.com`).
- El aviso esté también en el sitio o redes oficiales de la empresa.
- Si dudás, **llamá al número público de la empresa** (el que aparece en su web o en Google Maps, **no el del mensaje**) y preguntá si la búsqueda es real.

**3. ¿El proceso tiene sentido?**

Un proceso real suele tener: aviso con tareas concretas, alguna entrevista (presencial o por videollamada con personas que se identifican), y recién al final, si te contratan, el pedido de documentación para el contrato y el IPS. Desconfiá de "contratados" sin entrevista.

**4. Si vas a una entrevista presencial**

- Que sea en una **oficina o local de la empresa**, en horario laboral.
- Avisale a alguien de confianza **dónde vas, con quién y a qué hora**, y mandale tu ubicación en tiempo real.
- Desconfiá de citas en casas particulares, lugares aislados o de noche.
- No firmes nada que no entiendas ni entregues documentos originales.

**5. Preguntá todo**

Una empresa real responde preguntas simples: dirección, nombre de quien te entrevista, horario, salario, si te inscriben en IPS. Si se molestan o esquivan, ya tenés tu respuesta.$wk$, 15, 2, $wk$[{"q":"Recibís una oferta de \"Empresa Conocida S.A.\" desde empresaconocida.rrhh@gmail.com. ¿Qué hacés?","options":["Respondés con todos tus datos","Verificás llamando al número público de la empresa, no al del mensaje","Lo reenviás a tus amigos","Respondés pidiendo que te paguen por adelantado"],"answer":1,"explanation":"Un correo gratuito con el nombre de una empresa conocida es sospechoso. Verificá por un canal oficial que encuentres vos."},{"q":"¿Qué podés pedirle a una empresa para verificar que es formal?","options":["Su RUC, para consultarlo en la DNIT","Su contraseña de wifi","El sueldo de sus gerentes","Nada, no se puede verificar"],"answer":0,"explanation":"Las empresas formales tienen RUC y no deberían tener problema en dártelo."},{"q":"Te citan a una entrevista en una casa particular a las 20:00. ¿Qué es lo más prudente?","options":["Ir solo/a sin avisar a nadie","Desconfiar, pedir que sea en una oficina en horario laboral y verificar a la empresa","Ir con documentos originales por si acaso","Aceptar porque es una oportunidad única"],"answer":1,"explanation":"Las entrevistas reales suelen ser en oficinas y en horario laboral. Un lugar privado y de noche es una señal de riesgo."}]$wk$::jsonb, $wk$["Google, Maps, redes con historia y opiniones en Worka.","Correo del dominio de la empresa, no uno gratuito parecido.","Si dudás, llamá al número público de la empresa, no al del mensaje.","Entrevistas presenciales: en oficinas, y siempre avisando a alguien."]$wk$::jsonb, $wk$[{"youtube_id":"AOiCLa0fAug","title":"Ofertas de empleo falsas: señales para evitar estafas al buscar trabajo","channel":"Entretenimiento Grupo Repretel","why":"Segmento de TV que muestra ejemplos de textos mal redactados, requisitos poco claros y correos con dominios sospechosos."}]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Verificá un aviso real","type":"checklist","prompt":"Elegí un aviso al que te gustaría postular y verificalo con estos pasos.","checklist":["Encontré el sitio web o redes de la empresa con historia","Encontré la dirección en Google Maps","Revisé opiniones en Worka o LinkedIn","El contacto usa un correo o número coherente con la empresa","Nada en el aviso me pide plata ni datos sensibles antes de una entrevista"]}$wk$::jsonb, null
from courses where slug = $wk$que-no-te-estafen$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$cuida-tus-datos$wk$, $wk$Lecciones$wk$, $wk$Cuidá tus datos, tu WhatsApp y tu plata$wk$, $wk$Muchas estafas laborales no buscan tu plata directamente sino **tus datos o tus cuentas**, para usarlos en otras estafas a tu nombre.

**Qué datos compartir y cuándo**

| Etapa | Qué es razonable compartir |
|---|---|
| Postulación | Nombre, ciudad, teléfono, correo, CV |
| Entrevistas | Lo mismo + referencias laborales (con permiso de esas personas) |
| Contratación (con oferta concreta y empresa verificada) | Cédula, datos para el contrato, IPS y cuenta para el salario |

Si te piden datos de la última fila **antes** de una entrevista y una oferta concreta, frená.

**Tu cédula**

- No mandes fotos de los dos lados de tu cédula por chat a desconocidos, ni selfies con tu cédula en la mano.
- Si tenés que mandar una copia en la etapa de contratación, podés ponerle una marca de agua encima: *"Copia para [empresa], contratación [fecha]"*. Así no sirve para otra cosa.

**Tu WhatsApp**

- **Nunca compartas el código de 6 dígitos que te llega por SMS.** Con ese código pueden robarte la cuenta de WhatsApp y escribirle a tus contactos pidiendo plata en tu nombre.
- Activá la **verificación en dos pasos** en WhatsApp (en Ajustes → Cuenta). Es un PIN que te protege aunque alguien consiga el código.

**Tu plata y tus cuentas**

- No pagues "kits", "cursos obligatorios", "seguros" ni "trámites" a personas para conseguir un trabajo.
- No compartas claves, PIN ni códigos de tu banco o billetera electrónica. **Nadie de un banco ni de una empresa te los va a pedir.**
- No prestes tu cuenta para recibir o mover dinero de terceros.

**Enlaces y archivos**

- No abras enlaces acortados ni descargues aplicaciones que te manden por chat "para completar la postulación".
- Postulá desde portales conocidos (Worka, EmpleaPy, LinkedIn) o desde el sitio oficial de la empresa.$wk$, 15, 3, $wk$[{"q":"Un \"reclutador\" te pide el código de 6 dígitos que te llegó por SMS \"para activar tu perfil\". ¿Qué hacés?","options":["Se lo pasás rápido","No se lo pasás nunca: pueden robarte tu WhatsApp","Se lo pasás si te promete un buen sueldo","Le pasás solo la mitad del código"],"answer":1,"explanation":"Ese código permite registrar tu WhatsApp en otro teléfono. Nunca se comparte."},{"q":"¿En qué etapa es razonable entregar copia de tu cédula?","options":["Apenas ves el aviso","En el primer mensaje de WhatsApp","En la contratación, con una oferta concreta y la empresa verificada","Nunca, en ningún caso"],"answer":2,"explanation":"Para el contrato y el IPS la empresa necesita tus datos, pero recién en esa etapa y con la empresa verificada."},{"q":"¿Qué es la verificación en dos pasos de WhatsApp?","options":["Un PIN extra que protege tu cuenta aunque alguien consiga el código SMS","Una forma de mandar mensajes dos veces","Un pago para tener WhatsApp premium","Algo que solo usan las empresas"],"answer":0,"explanation":"Es una capa de seguridad adicional que se activa en Ajustes → Cuenta."}]$wk$::jsonb, $wk$["Los datos sensibles se comparten recién en la contratación, con empresa verificada.","Marca de agua en las copias de tu cédula.","El código de WhatsApp no se comparte nunca. Activá la verificación en dos pasos.","Ni claves, ni PIN, ni tu cuenta para mover plata ajena."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Blindá tu búsqueda","type":"checklist","prompt":"Aplicá estas medidas de seguridad hoy.","checklist":["Activé la verificación en dos pasos en WhatsApp","Revisé mi CV y no tiene mi número de cédula completo","Preparé una forma de poner marca de agua a copias de mi cédula","Les conté a mi familia las señales de alerta de este curso"]}$wk$::jsonb, null
from courses where slug = $wk$que-no-te-estafen$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$si-te-paso-que-hacer$wk$, $wk$Lecciones$wk$, $wk$Si te pasó: qué hacer$wk$, $wk$Le puede pasar a cualquiera. Los estafadores son profesionales del engaño. **No es momento de culparte, es momento de actuar rápido.** Cuanto antes actúes, más podés limitar el daño.

**Paso 1 — Cortá el contacto**

No respondas más, no mandes más plata ni datos, aunque te amenacen o te prometan devolverte lo que pagaste "si pagás un poco más".

**Paso 2 — Guardá las pruebas**

Capturas de pantalla de los chats, números de teléfono, perfiles, enlaces, comprobantes de transferencias, nombres que usaron. No borres la conversación.

**Paso 3 — Protegé tus cuentas**

- Si diste datos de tu banco o billetera, **llamá enseguida a tu banco o billetera** para bloquear y avisar.
- Si te robaron el WhatsApp, volvé a registrar tu número en tu teléfono y avisá a tus contactos por otro medio que no respondan pedidos de plata en tu nombre.
- Cambiá contraseñas de correo y redes, y activá la verificación en dos pasos.
- Si mandaste foto de tu cédula, estate atento/a a movimientos extraños a tu nombre.

**Paso 4 — Denunciá**

- Hacé la denuncia en la **Policía Nacional** (comisaría más cercana) o ante el **Ministerio Público (Fiscalía)**. Llevá tus pruebas.
- **Reportá el aviso o el perfil** en la plataforma donde lo viste (Worka, Facebook, LinkedIn, WhatsApp). Así evitás que le pase a otra persona.
- En Worka, usá la opción de reportar o escribinos (ver enlace abajo).

**Paso 5 — Cuidado con la segunda estafa**

Después de una estafa, a veces aparecen personas que ofrecen "recuperar tu plata" a cambio de un pago. Es otra estafa. Las denuncias se hacen gratis ante las autoridades.

**Paso 6 — Contalo**

Hablalo con tu familia y amigos. Contar lo que te pasó ayuda a que otros no caigan y te ayuda a vos a soltar la culpa.

[[reportar-aviso]]$wk$, 10, 4, $wk$[{"q":"Pagaste un \"kit\" y ahora te piden más plata para devolverte lo anterior. ¿Qué hacés?","options":["Pagás para recuperar lo que diste","Cortás el contacto, guardás pruebas y denunciás","Negociás un descuento","Esperás a ver qué pasa"],"answer":1,"explanation":"Pagar más solo aumenta la pérdida. Lo correcto es cortar, guardar pruebas y denunciar."},{"q":"Diste datos de tu billetera electrónica. ¿Qué es lo primero?","options":["Llamar enseguida a tu banco o billetera para bloquear y avisar","Publicarlo en redes","Esperar una semana","Cambiar tu foto de perfil"],"answer":0,"explanation":"Actuar rápido con tu banco o billetera es lo que más puede limitar el daño."},{"q":"Alguien te ofrece \"recuperar tu dinero\" cobrándote una comisión. ¿Qué es?","options":["Un servicio oficial","Otra estafa","Un abogado del Estado","Un beneficio del banco"],"answer":1,"explanation":"Es una estafa común después de la primera. Las denuncias ante las autoridades no se cobran."}]$wk$::jsonb, $wk$["Cortá el contacto y no pagues más.","Guardá todas las pruebas.","Avisá a tu banco o billetera de inmediato.","Denunciá en la Policía o Fiscalía y reportá el aviso.","Nadie \"recupera tu plata\" cobrándote: es otra estafa."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk${"title":"Tu plan de emergencia","type":"checklist","prompt":"Prepará tu plan por si alguna vez lo necesitás.","checklist":["Tengo guardado el número de atención de mi banco o billetera","Sé cuál es la comisaría más cercana","Sé cómo hacer capturas de pantalla en mi celular","Sé cómo reportar un aviso en Worka"]}$wk$::jsonb, null
from courses where slug = $wk$que-no-te-estafen$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

-- ── Tus derechos al empezar a trabajar ──
insert into courses (slug, title, description, category, level, status, sort, duration_label, meta_title, meta_description, outcomes, suggested_course, legal_notice, review_before, cert_min_quiz, cert_requires_project, final_project, updated_at)
values ($wk$tus-derechos-laborales$wk$, $wk$Tus derechos al empezar a trabajar$wk$, $wk$Contrato, período de prueba, salario mínimo, IPS, aguinaldo y vacaciones explicados simple. Conocé tus derechos en Paraguay antes de firmar.$wk$, $wk$Derechos$wk$, $wk$Básico$wk$, 'publicado', 9, $wk$60 min$wk$, $wk$Derechos laborales en Paraguay al empezar a trabajar — Curso gratis | Academia Worka$wk$, $wk$Período de prueba, salario mínimo 2026, aportes al IPS, aguinaldo, vacaciones y dónde consultar o denunciar en Paraguay. Explicado simple, con ejemplos. Curso gratis.$wk$, $wk$["Qué incluye un contrato y cómo funciona el período de prueba","Cuál es el salario mínimo y cómo leer tu recibo","Qué son los aportes al IPS, el aguinaldo y las vacaciones","Dónde consultar y cómo reclamar si no se cumplen tus derechos"]$wk$::jsonb, null, $wk$Este curso es informativo y no reemplaza el asesoramiento de un profesional. Las cifras están vigentes a octubre de 2026 y pueden cambiar. Verificá siempre en mtess.gov.py e ips.gov.py.$wk$, $wk$2027-07-01$wk$::date, 70, true, $wk${"title":"Tu ficha de derechos","prompt":"Armá una ficha de una página con tus datos laborales clave. Si todavía no trabajás, armala con una oferta de ejemplo o con el salario mínimo.","suggested_questions":[],"checklist":["Puesto, fecha de inicio y tipo de contrato","Duración del período de prueba que me corresponde","Salario bruto, descuento de IPS y neto","Valor de mi hora y de una hora extra diurna","Aguinaldo estimado del año y fecha de mis primeras vacaciones","Dónde consultar si algo no se cumple (MTESS e IPS)"]}$wk$::jsonb, now())
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, level = excluded.level,
  sort = excluded.sort, duration_label = excluded.duration_label, meta_title = excluded.meta_title,
  meta_description = excluded.meta_description, outcomes = excluded.outcomes, suggested_course = excluded.suggested_course,
  legal_notice = excluded.legal_notice, review_before = excluded.review_before, cert_min_quiz = excluded.cert_min_quiz,
  cert_requires_project = excluded.cert_requires_project, final_project = excluded.final_project, updated_at = now();

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$contrato-y-periodo-de-prueba$wk$, $wk$Lecciones$wk$, $wk$Tu contrato y el período de prueba$wk$, $wk$En Paraguay, las relaciones de trabajo del sector privado se rigen por el **Código del Trabajo (Ley N° 213/93)** y sus modificaciones. No hace falta saberlo de memoria, pero sí conocer lo básico antes de empezar.

**El contrato de trabajo**

- Un contrato puede ser **escrito o verbal**. Aunque no hayas firmado nada, si trabajás bajo las órdenes de alguien y te pagan por eso, **existe una relación laboral con derechos**.
- Igual, **pedí siempre un contrato escrito**. Te protege a vos y deja claro lo acordado.
- Antes de firmar, leé que estén: **tu puesto y tareas, tu salario, tu horario y días de trabajo, el lugar de trabajo, la fecha de inicio** y si hay período de prueba.
- Si algo no entendés, preguntá. Pedí una copia firmada para vos.
- **Los derechos del Código no se pueden renunciar.** Una cláusula que diga "renuncio a mi aguinaldo" o "acepto trabajar sin IPS" no vale.

**El período de prueba**

Es la etapa del inicio en la que la empresa evalúa si te adaptás al puesto, y vos evaluás si te convienen las condiciones. Según los artículos 58 a 60 del Código del Trabajo:

| Tipo de trabajador | Duración máxima |
|---|---|
| Trabajadores no calificados y personal doméstico | 30 días |
| Trabajadores calificados y aprendices | 60 días |
| Técnicos altamente especializados | Las partes pueden acordar un período distinto |

**Lo que tenés que saber del período de prueba:**

- **Se paga**, y nunca por debajo del salario mínimo.
- **Tenés todos los derechos** (incluido el IPS desde el primer día), salvo dos: durante la prueba cualquiera de las partes puede terminar la relación **sin preaviso ni indemnización**.
- Si termina, igual te corresponden **los días trabajados y el aguinaldo proporcional**.
- Si pasa el plazo y nadie dice nada, **el contrato sigue** en las condiciones acordadas.
- **No se puede repetir:** si volvés a trabajar en la misma empresa para la misma clase de tarea, no corresponde un nuevo período de prueba.

**Señales de alerta:** "la primera semana es a prueba y no se paga", "te inscribimos al IPS después de los 3 meses", "firmá esta hoja en blanco". Ninguna de esas cosas es legal.$wk$, 15, 1, $wk$[{"q":"¿Cuánto dura como máximo el período de prueba para un trabajador calificado?","options":["15 días","30 días","60 días","6 meses"],"answer":2,"explanation":"El Código del Trabajo fija hasta 60 días para trabajadores calificados y aprendices, y hasta 30 para no calificados y personal doméstico."},{"q":"Durante el período de prueba, ¿tenés derecho a cobrar y a estar inscripto/a en el IPS?","options":["No, es gratis porque es de prueba","Sí, tenés todos los derechos salvo preaviso e indemnización","Solo si la empresa quiere","Solo al cobro, no al IPS"],"answer":1,"explanation":"El período de prueba se remunera y goza de todas las prestaciones, excepto preaviso e indemnización por despido."},{"q":"Firmaste un papel que dice que \"renunciás al aguinaldo\". ¿Es válido?","options":["Sí, porque lo firmaste","No, los derechos del Código del Trabajo son irrenunciables","Solo si fue ante escribano","Depende de la empresa"],"answer":1,"explanation":"Los derechos que reconoce el Código del Trabajo no pueden renunciarse ni limitarse por acuerdo."}]$wk$::jsonb, $wk$["Aunque sea verbal, hay relación laboral con derechos. Igual, pedí contrato escrito.","Período de prueba: hasta 30 o 60 días según el tipo de trabajo.","En la prueba se cobra, hay IPS y todos los derechos, salvo preaviso e indemnización.","Tus derechos no se pueden renunciar, aunque firmes."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[{"title":"Ministerio de Trabajo, Empleo y Seguridad Social (MTESS)","url":"https://www.mtess.gov.py"}]$wk$::jsonb, $wk${"title":"Checklist antes de firmar","type":"checklist","prompt":"Guardá este checklist para usarlo el día que te ofrezcan un contrato. Marcá cada ítem que ya sepas revisar.","checklist":["Sé que tengo que verificar puesto, tareas, salario, horario, lugar y fecha de inicio","Sé cuánto puede durar como máximo el período de prueba en mi caso","Sé que debo estar en el IPS desde el primer día","Sé que tengo que pedir una copia firmada","Sé que no tengo que firmar hojas en blanco"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$tus-derechos-laborales$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$salario-horario-y-recibo$wk$, $wk$Lecciones$wk$, $wk$Salario, horario y tu recibo$wk$, $wk$**El salario mínimo**

Desde el **1 de julio de 2026**, el salario mínimo legal para **actividades diversas no especificadas** es de **Gs. 3.044.000 por mes**, y el **jornal mínimo** (pago por día) es de **Gs. 117.077** (Decreto N° 6225/2026 y Resolución MTESS N° 670/2026). Se reajusta normalmente cada año en julio.

- Algunas actividades tienen **mínimos propios** (por ejemplo, ciertos oficios de la construcción). Si tu actividad tiene uno mayor, te corresponde ese.
- El personal **doméstico** cobra el 100% del salario mínimo desde la Ley N° 6338/2019.
- Si trabajás **medio tiempo**, el mínimo se calcula en proporción a la jornada. Por ejemplo, con 24 horas semanales (la mitad de 48), el mínimo es la mitad: Gs. 1.522.000.

**El horario (jornada)**

- La jornada diurna normal es de hasta **8 horas por día y 48 horas por semana**.
- Las **horas extra** se pagan con recargo: en general **50% más** si son diurnas y **100% más** si son nocturnas o en feriados.
- *Ejemplo con el mínimo:* una forma habitual de calcular el valor de tu hora es salario ÷ 240. Gs. 3.044.000 ÷ 240 ≈ Gs. 12.683 por hora. Una hora extra diurna con 50% de recargo ≈ **Gs. 19.025**.

**Tu recibo de salario**

Cada mes deberías recibir un recibo (en papel o digital) que muestre:

- Tu **salario bruto** y otros conceptos (horas extra, comisiones, bonificación familiar si corresponde).
- Los **descuentos**: el principal es el **9% de aporte obrero al IPS**.
- El **neto** que te depositan.

*Ejemplo:* salario bruto Gs. 3.044.000 − IPS 9% (Gs. 273.960) = **neto Gs. 2.770.040**.

**Descuentos permitidos.** El empleador no puede descontarte lo que quiera. Los descuentos permitidos son limitados: anticipos que te dieron, aportes al seguro social, cuotas sindicales o de cooperativa que autorizaste por escrito y órdenes judiciales, entre otros. Si ves descuentos por "faltante de caja", "uniforme" o "multas" que no entendés, preguntá por escrito y consultá.

**Bonificación familiar.** Si tenés hijos menores de 17 años (sin límite de edad si tienen discapacidad), el Código prevé una bonificación del **5% del salario mínimo por cada hijo**, con condiciones. Consultá en tu empresa o en el MTESS si te corresponde.

**Guardá tus recibos.** Son tu prueba si algún día tenés que reclamar.$wk$, 15, 2, $wk$[{"q":"Trabajás jornada completa en una actividad sin mínimo especial. ¿Cuál es el salario mínimo desde el 1 de julio de 2026?","options":["Gs. 2.899.048","Gs. 3.044.000","Gs. 2.770.040","Gs. 4.000.000"],"answer":1,"explanation":"Gs. 3.044.000 es el mínimo para actividades diversas no especificadas. Gs. 2.770.040 es lo que queda en mano después del 9% de IPS."},{"q":"¿Cuánto se recarga, en general, una hora extra diurna?","options":["Nada","25%","50%","200%"],"answer":2,"explanation":"Las horas extra diurnas se pagan con 50% de recargo; las nocturnas y en feriados, con 100%."},{"q":"Te descuentan \"uniforme\" del sueldo sin haberlo autorizado. ¿Qué hacés?","options":["Nada, la empresa puede descontar lo que quiera","Preguntás por escrito y consultás, porque los descuentos permitidos son limitados","Renunciás ese mismo día","Lo publicás en redes"],"answer":1,"explanation":"La ley limita qué se puede descontar. Preguntá por escrito y, si no se resuelve, consultá en el MTESS."}]$wk$::jsonb, $wk$["Mínimo desde el 1/7/2026: Gs. 3.044.000 al mes (actividades diversas).","Jornada diurna: hasta 8 h diarias y 48 h semanales.","Hora extra: +50% diurna, +100% nocturna o feriado.","Bruto − 9% IPS = neto. Guardá todos tus recibos."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[{"title":"MTESS — información sobre salario mínimo y calculadoras","url":"https://www.mtess.gov.py"}]$wk$::jsonb, $wk${"title":"Calculá tu neto","type":"texto","prompt":"Si tenés un trabajo o una oferta, calculá: 1) tu salario bruto, 2) el 9% de IPS, 3) tu neto, 4) el valor de tu hora (bruto ÷ 240) y 5) el valor de una hora extra diurna (+50%). Si no tenés oferta, usá Gs. 3.500.000 como ejemplo.","checklist":["Calculé el 9% de IPS","Calculé el neto","Calculé el valor de mi hora","Calculé el valor de una hora extra diurna","Verifiqué que mi salario no está por debajo del mínimo que me corresponde"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$tus-derechos-laborales$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$ips-aguinaldo-vacaciones$wk$, $wk$Lecciones$wk$, $wk$IPS, aguinaldo y vacaciones$wk$, $wk$**IPS: tu seguro social**

El **Instituto de Previsión Social (IPS)** es el seguro social de los trabajadores en relación de dependencia. Te da cobertura de salud (consultas, internación, medicamentos), subsidios por reposo, maternidad (18 semanas de permiso pagadas por el IPS), y aportes para tu jubilación.

- El empleador **tiene que inscribirte desde el primer día**, también durante el período de prueba.
- **Aportes:** vos aportás el **9%** de tu salario (se descuenta del recibo) y la empresa aporta el **16,5%** aparte, de su bolsillo. En total entra al IPS el 25,5% de tu salario.
- Si te descuentan el 9% pero la empresa no lo deposita, es una falta grave. **Revisá periódicamente tus aportes** en los servicios en línea del IPS.

**Aguinaldo (el "sueldo 13")**

- Es **la doceava parte (1/12) de todo lo que cobraste en el año** (salario, horas extra, comisiones).
- Se paga **a más tardar el 31 de diciembre**.
- Si trabajaste solo una parte del año, o si dejás el trabajo, te corresponde el **aguinaldo proporcional**.
- *Ejemplo 2026:* si cobraste el mínimo todo el año, como el mínimo cambió en julio, sumás 6 meses de Gs. 2.899.048 y 6 meses de Gs. 3.044.000 y dividís por 12: **aguinaldo ≈ Gs. 2.971.524**.

**Vacaciones**

Después de cumplir **un año** de trabajo continuo en la misma empresa, te corresponden vacaciones **pagadas** según tu antigüedad:

| Antigüedad | Días de vacaciones |
|---|---|
| Hasta 5 años | 12 días hábiles |
| Más de 5 y hasta 10 años | 18 días hábiles |
| Más de 10 años | 30 días hábiles |

Las fechas se acuerdan con el empleador. Si dejás el trabajo con vacaciones sin tomar, te las tienen que pagar en la liquidación.

**Y si se termina la relación**

Después del período de prueba, si la empresa te despide sin causa justificada, en general te corresponden **preaviso** (de 30 a 90 días según antigüedad, o su pago), **indemnización** (15 jornales por año trabajado o fracción de 6 meses), más aguinaldo proporcional y vacaciones pendientes. Si te pasa, pedí tu liquidación por escrito y consultá antes de firmar.$wk$, 15, 3, $wk$[{"q":"¿Cuánto aporta el empleador al IPS?","options":["Nada","9%","16,5%","25,5%"],"answer":2,"explanation":"El empleador aporta 16,5% aparte del salario. El 9% es el aporte del trabajador; juntos suman 25,5%."},{"q":"¿Cómo se calcula el aguinaldo?","options":["Un salario fijo para todos","La doceava parte de todo lo que cobraste en el año","El 50% del último salario","Lo decide la empresa"],"answer":1,"explanation":"Es 1/12 de lo percibido en el año, e incluye horas extra y comisiones."},{"q":"Cumpliste 2 años en la empresa. ¿Cuántos días de vacaciones te corresponden?","options":["6 días hábiles","12 días hábiles","18 días hábiles","30 días hábiles"],"answer":1,"explanation":"Hasta 5 años de antigüedad corresponden 12 días hábiles de vacaciones pagadas."}]$wk$::jsonb, $wk$["IPS desde el primer día: vos 9%, la empresa 16,5%.","Revisá tus aportes en el IPS de vez en cuando.","Aguinaldo = 1/12 de lo que cobraste en el año, hasta el 31 de diciembre.","Vacaciones: 12, 18 o 30 días hábiles según antigüedad."]$wk$::jsonb, $wk$[]$wk$::jsonb, $wk$[{"title":"Instituto de Previsión Social (IPS)","url":"https://www.ips.gov.py"}]$wk$::jsonb, $wk${"title":"Tu calendario de derechos","type":"texto","prompt":"Si estás trabajando (o cuando empieces), anotá: fecha de ingreso, fecha en que cumplís 1 año (vacaciones), cuánto te correspondería de aguinaldo este año aproximadamente, y cómo vas a verificar tus aportes al IPS.","checklist":["Anoté mi fecha de ingreso y la fecha de mis primeras vacaciones","Calculé mi aguinaldo aproximado","Sé dónde verificar mis aportes al IPS","Puse un recordatorio para revisar mis aportes cada 3 meses"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$tus-derechos-laborales$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;

insert into lessons (course_id, slug, section, title, content, duration_min, sort, quiz, key_points, videos, resources, practice, review_before)
select id, $wk$donde-consultar-y-reclamar$wk$, $wk$Lecciones$wk$, $wk$Dónde consultar y cómo reclamar$wk$, $wk$Conocer tus derechos sirve de poco si no sabés qué hacer cuando no se cumplen. La mayoría de los problemas se resuelven **hablando y por escrito**, pero si no, hay instituciones que te pueden ayudar **gratis**.

**Paso 1 — Juntá pruebas desde el primer día**

Aunque todo vaya bien, guardá: contrato, recibos de salario, mensajes con tu jefe sobre horarios o pagos, fotos o capturas de tus horarios, comprobantes de depósitos. Si trabajás sin contrato escrito, estas pruebas muestran que existe la relación laboral.

**Paso 2 — Preguntá y reclamá por escrito**

Si algo no está bien (no te inscribieron en el IPS, te pagan menos del mínimo, no te pagan horas extra), primero consultalo con tu empleador o RR. HH., **preferentemente por escrito** (correo o mensaje). Con respeto y con datos: *"Hola, revisé mi recibo de septiembre y no figuran las 6 horas extra del día 15. ¿Me podrían confirmar?"*. Muchas veces es un error y se corrige.

**Paso 3 — Consultá en el Ministerio de Trabajo (MTESS)**

El **MTESS** brinda orientación gratuita a trabajadores y recibe **denuncias laborales**. Cuenta con un sistema de atención de denuncias (SUAD) y con calculadoras para estimar salarios y beneficios. Podés consultar en **mtess.gov.py** o acercarte a sus oficinas. Llevá tus pruebas y una lista cronológica de lo que pasó.

**Paso 4 — Si el problema es con el IPS**

Si te descuentan el aporte pero no figura en el IPS, o no te inscribieron, consultá directamente en el **IPS** (ips.gov.py o sus oficinas). Llevá tus recibos.

**Otras ayudas**

- **Sindicatos:** si en tu empresa o rubro hay sindicato, puede asesorarte y representarte.
- **Consultorios jurídicos gratuitos** de universidades y la **Defensoría Pública** pueden orientarte en casos más complejos.
- Si tenés que firmar una liquidación o un acuerdo de salida y tenés dudas, **consultá antes de firmar**.

**Lo que conviene evitar**

- Reclamar solo de palabra, sin dejar nada escrito.
- Publicar el conflicto en redes antes de consultar: puede complicarte.
- Firmar papeles que no entendés "para cobrar más rápido".$wk$, 15, 4, $wk$[{"q":"Notás que en tu recibo faltan horas extra. ¿Qué conviene hacer primero?","options":["Renunciar","Consultar a tu empleador o RR. HH. por escrito, con los datos concretos","Publicarlo en redes","No decir nada"],"answer":1,"explanation":"Muchos problemas son errores que se corrigen rápido. Hacerlo por escrito deja constancia."},{"q":"¿Qué institución orienta gratis a trabajadores y recibe denuncias laborales?","options":["El Ministerio de Trabajo, Empleo y Seguridad Social (MTESS)","Tu banco","La municipalidad, siempre","Una empresa privada de abogados que te cobra por adelantado"],"answer":0,"explanation":"El MTESS brinda orientación y recibe denuncias laborales sin costo."},{"q":"Te descuentan el 9% del IPS pero no figuran tus aportes. ¿Dónde consultás?","options":["En el IPS, llevando tus recibos","En el supermercado","En ningún lado, no se puede hacer nada","Solo en redes sociales"],"answer":0,"explanation":"El IPS puede verificar tu situación. Tus recibos muestran que te descontaron el aporte."}]$wk$::jsonb, $wk$["Guardá pruebas desde el primer día.","Reclamá primero a la empresa, con respeto y por escrito.","El MTESS orienta gratis y recibe denuncias.","Problemas de aportes: consultá en el IPS.","No firmes lo que no entendés."]$wk$::jsonb, $wk$[{"youtube_id":"0V96FhOehq8","title":"SUAD: el sistema que transforma la atención de denuncias laborales en Paraguay","channel":"MTESS - Paraguay","why":"Video oficial del Ministerio de Trabajo que explica su sistema de atención de denuncias laborales individuales."}]$wk$::jsonb, $wk$[{"title":"MTESS — sitio oficial","url":"https://www.mtess.gov.py"},{"title":"Canal de YouTube del MTESS","url":"https://www.youtube.com/channel/UC7IX7pMfNy4xy1ZRUXr7cpg"},{"title":"IPS — sitio oficial","url":"https://www.ips.gov.py"}]$wk$::jsonb, $wk${"title":"Tu carpeta de pruebas","type":"checklist","prompt":"Armá una carpeta (física o en tu celular/Google Drive) para guardar todo lo de tu trabajo.","checklist":["Creé una carpeta para mi contrato y recibos","Guardé (o voy a guardar) cada recibo de salario","Sé cómo hacer capturas de mensajes importantes","Tengo guardados los sitios del MTESS y del IPS"]}$wk$::jsonb, $wk$2027-07-01$wk$::date
from courses where slug = $wk$tus-derechos-laborales$wk$
on conflict (course_id, slug) do update set
  section = excluded.section, title = excluded.title, content = excluded.content, duration_min = excluded.duration_min,
  sort = excluded.sort, quiz = excluded.quiz, key_points = excluded.key_points, videos = excluded.videos,
  resources = excluded.resources, practice = excluded.practice, review_before = excluded.review_before;
