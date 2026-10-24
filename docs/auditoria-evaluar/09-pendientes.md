# Pendientes, bloqueos y decisiones abiertas

## Bloqueos de esta sesión
- **Sin Supabase:** no se pudo ejecutar ninguna función SQL, policy, correo ni Storage. Todo lo marcado «corregido en 053» está **escrito y sin probar**.
- **Sin Postgres local:** no se pudo correr `supabase/tests/evaluar-053.sql`. Además, el bloque G usa `set local role` dentro de un `DO`. Si la base no lo acepta, hay que separar ese caso en una sentencia aparte.
- **Modo demo:** el panel no tiene procesos y `/evaluar/e/*` da 404, así que no se recorrió en el navegador ningún flujo del reclutador ni del candidato. Solo hubo prueba de humo.
- **Competencia:** se usaron resúmenes de búsqueda restringida a sitios oficiales, no la lectura completa de cada página (ver 04).

## Verificaciones pendientes (V)
- V-1: antecedente 1 (plantilla → 0 etapas) en staging.
- V-2: antecedente 2 (invitar sin correo) en staging.
- V-3: confirmar en la base de producción si existe una policy de insert de participantes o de eventos que no esté en el repo (EV-09, EV-11). Si existe, la 053 sigue siendo segura (crea policies nuevas sin borrar otras).
- V-4: los 9 pasos de 05-correcciones.

## Pendientes de implementación (P)
- P-1: EV-38, no devolver `error.message` crudo de la base.
- P-2: EV-16 y EV-17.
- P-3: script de reparación de videos. Para cada respuesta de una pregunta `video` cuyo `value` no sea un objeto con `video`, buscar en el bucket `entrevistas` el archivo `<participant_id>/<question_id>.(webm|mp4)` y restaurar `{video, type}`. Correrlo primero en seco y con un listado para revisar. **No se escribió** para no tocar datos reales.
- P-4: bloquear el asistente de IA en procesos activos (06).
- P-5: lista prohibida del lado del servidor para la IA y los filtros (06).

## Decisiones de producto (D) — opciones y recomendación

**D-1 · Editar un proceso con candidatos (EV-18).**
(a) Bloquear borrar y mover etapas, borrar preguntas y cambiar la correcta o el peso cuando hay alguien con `status ≠ invitado`, y ofrecer «duplicar como versión nueva». (b) Versionar etapas y preguntas, y que cada participante quede atado a su versión. (c) Permitir todo con un aviso.
**Recomendación:** (a) ya, porque es chico y ya existe `duplicateProcess`; (b) junto con I-7.
**Estado:** (a) implementada en la 2ª sesión (C-18). Falta verificarla en staging (pasos 10–12 de 05-correcciones). Como la vacante enlazada no se copia al duplicar, para pasarla a la versión nueva primero hay que desenlazarla del original desde Ajustes.

**D-2 · Escala likert (EV-21).** — **Decidido: (b).** Implementado en la 054 (sin aplicar).
(a) Dejarla como está y documentar el piso de 20%. (b) Pasar a `(v−1)/4` solo para participantes nuevos, con una marca de versión de cálculo. (c) Recalcular el histórico.
**Recomendación:** (b), recalibrando las bandas de integridad con datos reales. Nunca (c) sin avisar a las empresas.

**D-3 · Clave «integridad» compartida (EV-20).** — **Decidido: (a).** Implementado.
(a) Renombrar a `integridad_sjt` en el SJT y en el filtro de cajero, solo para etapas nuevas. (b) Migrar el histórico.
**Recomendación:** (a).

**D-4 · Entrega fuera de tiempo (EV-03).**
(a) Aceptarla y marcarla «excedida» en el informe. (b) Rechazarla después de un margen y corregir solo lo guardado en el borrador. (c) Corregir solo las respuestas guardadas antes del vencimiento.
**Recomendación:** (a) primero, porque no pierde datos del candidato, y medir cuánto pasa antes de endurecer.

**D-5 · Exportación (EV-15).** Ver las opciones en el hallazgo. **Recomendación:** CSV en todos los planes; datos de contacto solo para la dueña.
**Decidido:** solo desde Profesional. Implementado. Queda abierto si el equipo (no la dueña) puede exportar emails y teléfonos.

**D-6 · Terminología.**
Propuesta de glosario: **proceso** = la búsqueda completa; **etapa** = cada parte; **prueba** = el instrumento del catálogo; **evaluación** = lo que vive el candidato. «Concurso» queda solo para sector público, como opción de la cuenta.
**Recomendación:** adoptar el glosario y hacer un barrido de textos.

**D-7 · Sin responder (EV-22).** Excluir del máximo los ítems sin responder y mostrar «respondió 23 de 25». Cambia los números nuevos, así que va con la marca de versión de D-2.
