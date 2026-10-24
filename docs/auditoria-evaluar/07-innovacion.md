# Innovación: 10 oportunidades y 3 apuestas

No se implementó ninguna. Cada idea apoya sobre datos que Worka ya tiene
(postulaciones, vacantes, respuestas, línea de tiempo) o sobre su diferencial
(la integración con la bolsa de empleo y la devolución al candidato).

Confianza = qué tan seguros estamos de que el problema existe y de que la idea
lo resuelve. Esfuerzo: S (≤1 semana), M (2–4), L (>1 mes).

---

### I-1 · Calibración con desempeño real («¿acertó la evaluación?») ★ apuesta
- **Usuario y problema:** la empresa no sabe si su evaluación predice algo; la elige a ojo.
- **Ejemplo:** a los 90 días de contratar a Ana, Evaluar pregunta «¿cómo le va?» (1–5). Con 15 contrataciones muestra: «el razonamiento numérico se relaciona con el desempeño; el estilo de trabajo, no».
- **Diferencia:** los tres competidores muestran resultados de la prueba (TG1, TP1), pero en las fuentes consultadas ninguno cierra el circuito con el desempeño. Worka ya tiene el módulo de desempeño (`evaluar_ciclos`, `evaluar_desempeno`).
- **Confianza:** media (alta en el problema, baja en el volumen de datos por empresa).
- **MVP:** una pregunta a los 90 días del estado `contratado` y una correlación simple por rasgo, con `n` visible y sin conclusiones cuando `n < 10`.
- **Datos:** `participants.profile`, `status=contratado`, `evaluar_desempeno`.
- **Dependencias:** 053 aplicada (puntajes confiables), corrección de EV-20.
- **Riesgos:** sobrelectura de correlaciones con `n` chico; sesgo de supervivencia (solo se observa a los contratados).
- **Esfuerzo:** M. **Experimento:** 10 empresas con 5 o más contrataciones en 6 meses.
- **Métrica:** % de empresas que cambian el perfil ideal después de ver la calibración.
- **Abandono:** si menos del 30% responde la pregunta de los 90 días.

### I-2 · Rúbrica asistida para respuestas abiertas y video ★ apuesta
- **Usuario y problema:** las respuestas escritas y los videos no puntúan («Sin corrección automática»), así que se miran poco y no entran al orden.
- **Ejemplo:** para «Contá cómo resolverías un reclamo», la IA propone 3 criterios con 4 niveles; el evaluador elige el nivel en un clic y el puntaje entra al total.
- **Diferencia:** TestGorilla tiene una rúbrica de hasta 4 criterios con ajuste manual (TG2), solo para preguntas abiertas propias. Worka podría aplicarla al video, en español local y con **varios evaluadores** (el equipo ya existe) y su acuerdo entre ellos.
- **Confianza:** alta.
- **MVP:** tabla `evaluar_scores_manual(answer_id, rater_id, criterion, level)`; el total se recalcula con una función SQL.
- **Datos:** respuestas `texto` y `video`, `evaluar_process_members`.
- **Riesgos:** la IA no debe puntuar sola; sesgo del evaluador (mitigar con corrección ciega del nombre).
- **Esfuerzo:** M. **Experimento:** 5 procesos con preguntas abiertas.
- **Métrica:** % de respuestas abiertas con nota en menos de 72 h.
- **Abandono:** si el tiempo de corrección no baja frente a la nota libre.

### I-3 · Postulación con prueba corta en la propia vacante ★ apuesta
- **Usuario y problema:** el candidato abandona entre «me postulo» y «rindo la evaluación», y la empresa recibe 300 CV sin filtro.
- **Ejemplo:** en el aviso de cajero, 3 preguntas excluyentes y 5 de juicio situacional, dentro del mismo formulario de postulación, en el celular.
- **Diferencia:** es el diferencial estructural de Worka. Los competidores son herramientas externas al aviso (TG4, API).
- **Confianza:** alta (el flujo ya existe; estaba roto por EV-09).
- **MVP:** reutilizar la etapa de filtro de la plantilla del puesto como «mini etapa» del aviso.
- **Datos:** postulaciones, `evaluar_participants.source = worka`.
- **Riesgos:** filtros discriminatorios cargados por la empresa (revisarlos con la misma lista prohibida que la IA).
- **Esfuerzo:** M. **Experimento:** A/B en vacantes con evaluación enlazada.
- **Métrica:** tasa de postulación → evaluación completa.
- **Abandono:** si la tasa de postulación cae más del 15% sin una mejora en la calidad (finalistas por postulante).

### I-4 · Devolución formativa al candidato
- **Usuario y problema:** el candidato descartado no aprende nada; el que rindió bien no lo puede mostrar.
- **Ejemplo:** «Tu fortaleza: atención al cliente. Para mejorar: cálculo rápido → curso de la Academia Worka».
- **Diferencia:** la marca empleadora y la Academia (migraciones 051–052) en un solo lugar.
- **Confianza:** media. **MVP:** texto por rasgo alto o bajo, enlazado a un curso. **Datos:** `profile`, catálogo de la Academia.
- **Riesgos:** revelar las claves de los tests; ansiedad del candidato. **Esfuerzo:** S.
- **Experimento:** opt-in por empresa. **Métrica:** cursos iniciados desde la devolución. **Abandono:** menos del 5% de clics.

### I-5 · Analítica de ítems con discriminación
- **Usuario y problema:** la empresa no sabe qué preguntas sobran o están mal.
- **Ejemplo:** «La pregunta 7 la acierta el 98%: no separa a nadie. La 12 la aciertan más los peores: revisá la clave».
- **Diferencia:** Testportal muestra la dificultad y la distribución de respuestas (TP1), pero no la discriminación.
- **Confianza:** alta. **MVP:** dificultad, correlación ítem-total y alerta de clave dudosa. **Datos:** `evaluar_answers.score`.
- **Riesgos:** `n` chico (mostrar desde 20). **Esfuerzo:** S. **Experimento:** procesos con 20+ candidatos.
- **Métrica:** preguntas editadas tras la alerta. **Abandono:** si nadie entra a la vista en 2 meses.

### I-6 · Evaluación por WhatsApp
- **Usuario y problema:** en Paraguay, mucha gente se postula solo desde el celular y con datos limitados.
- **Ejemplo:** «Respondé 1, 2 o 3» para la etapa de filtro, sin abrir el navegador.
- **Diferencia:** canal local. **Confianza:** media. **MVP:** solo la etapa de filtro (opción única) vía la API de WhatsApp Business.
- **Dependencias:** la cuenta de Meta y el costo por conversación. **Riesgos:** suplantación (el token pasa a ser el número). **Esfuerzo:** L.
- **Experimento:** una empresa de alto volumen (call center). **Métrica:** tasa de finalización frente al enlace web. **Abandono:** si no supera al enlace en +20 pp.

### I-7 · Banco de preguntas con versión y aleatorización — **implementado** (ver [11-azar-y-bancos.md](11-azar-y-bancos.md))
- **Usuario y problema:** los candidatos se pasan las respuestas, y editar rompe la comparabilidad (EV-18).
- **Ejemplo:** cada etapa sortea 10 de 30 preguntas equivalentes; el proceso publicado congela una «versión 3».
- **Diferencia:** ClassMarker sortea desde un banco (CM3); Worka sumaría el versionado visible en el informe.
- **Confianza:** alta. **MVP:** `stage_version` y orden por semilla por participante. **Riesgos:** formas no equivalentes. **Esfuerzo:** M.
- **Métrica:** quejas por filtración y re-ediciones de procesos activos. **Abandono:** si menos del 10% de los procesos usa el banco.

### I-8 · Copiloto de entrevista desde el informe
- **Usuario y problema:** el informe dice «conviene repreguntar», pero no qué preguntar.
- **Ejemplo:** tres preguntas conductuales para el factor bajo, con qué escuchar en la respuesta.
- **Diferencia:** de resultado a acción. **Confianza:** media. **MVP:** banco fijo por rasgo (sin IA). **Riesgos:** que se use como guion rígido.
- **Esfuerzo:** S. **Métrica:** uso en el informe. **Abandono:** menos del 10% de los informes abiertos lo usan.

### I-9 · Accesibilidad y ajustes razonables
- **Usuario y problema:** las personas con discapacidad o con mala conexión quedan afuera de las etapas cronometradas.
- **Ejemplo:** el candidato pide «tiempo extra» y la empresa lo aprueba; el informe lo marca y lo excluye del baremo (como TG5, que recomienda no comparar percentiles con tiempo extra).
- **Confianza:** media. **MVP:** campo `time_multiplier` en el participante, respetado por `evaluar_begin_stage`. **Esfuerzo:** S.
- **Riesgos:** abuso del pedido. **Métrica:** pedidos y finalización. **Abandono:** si nadie lo pide en 3 meses (mantenerlo igual por cumplimiento).

### I-10 · Cribado ciego verificable
- **Usuario y problema:** el «cribado ciego» actual es solo visual y se apaga con un clic.
- **Ejemplo:** el proceso se configura «ciego hasta el finalista»; el sistema registra quién destapó qué y cuándo.
- **Diferencia:** auditoría de equidad, útil para sector público y concursos. **Confianza:** media.
- **MVP:** bandera en el proceso + evento «destapó identidad». **Riesgos:** fricción. **Esfuerzo:** S.
- **Métrica:** procesos que lo activan. **Abandono:** menos del 5% de los procesos.

---

## Las 3 apuestas

1. **I-3 · Prueba corta en la vacante.** Explota el único diferencial que nadie puede copiar (la bolsa de empleo propia), y gran parte del trabajo ya existe. Antes hay que tener EV-09 en producción.
2. **I-2 · Rúbrica para respuestas abiertas y video.** Cierra la brecha más visible frente a TestGorilla y le da valor al video, que hoy se pierde (EV-04).
3. **I-1 · Calibración con desempeño.** Es el diferencial de largo plazo: convierte a Evaluar de «tests» en «aprendizaje de qué funciona en mi empresa». Depende de tener puntajes confiables (053).
