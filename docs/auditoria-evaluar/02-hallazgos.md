# Hallazgos

Severidad: **crítico** (resultados o datos incorrectos o expuestos sin esfuerzo),
**alto**, **medio**, **bajo**. Confianza: **alta** (leído en el código, sin
ambigüedad), **media** (depende de datos o configuración de la base que no se
pudo ver), **baja** (indicio).

Estado: **corregido** (código cambiado y verificado con tsc, eslint y pruebas),
**corregido en 053** (SQL escrito y no ejecutado), **propuesto** (requiere
decisión de producto), **pendiente**.

Las líneas citadas son las de `supabase/migration-0NN.sql` (archivos que no
cambian) y las de los `.ts/.tsx` **después** de esta sesión.

---

## Datos, permisos y privacidad

### EV-08 · El detalle interno del descarte le llegaba al candidato — alto · confianza alta · **corregido**
- **Evidencia:** `components/evaluar/DecisionBoard.tsx` (textarea del descarte: «Contá brevemente qué pasó», «Detalle, si querés dejarlo asentado»). La acción lo guardaba como `outcome_note` (`app/evaluar/actions.ts`, `setParticipantStatus`, antes línea ~1373) y además lo usaba como mensaje del evento. `evaluar_load` devuelve `outcome_note` al candidato (`migration-030.sql:96`), y `CandidateRunner` lo muestra en la tarjeta «Tu proceso terminó acá».
- **Reproducción:** descartar con detalle «no le dio la talla en la entrevista» y abrir el enlace del candidato.
- **Impacto:** se expone un comentario interno, potencialmente ofensivo o con riesgo legal, a la persona descartada.
- **Causa:** la misma columna cumple dos papeles: el comentario interno y el mensaje para el candidato.
- **Solución:** al descartar, el detalle va a `evaluar_notes` («Descarte: …») y el candidato recibe el mensaje estándar (más el motivo, solo si es compartible). El texto de la pantalla ahora aclara que el candidato no lo ve.
- **Validación:** tsc y eslint. No se probó contra la base.

### EV-09 · La entrada desde la vacante fallaba siempre — alto · confianza media · **corregido**
- **Evidencia:** `joinProcessFromJob` insertaba en `evaluar_participants` con la sesión del candidato. La única policy de insert es `ev_participants_company` (`migration-022.sql:237-250`), cuyo `with check` exige `p.company_id = auth.uid()`. No hay ninguna otra policy de insert en el repo.
- **Impacto:** el «diferencial» (rendir desde el aviso sin otra cuenta) terminaba en «No pudimos abrir tu evaluación». La confianza es media porque la base en producción podría tener una policy que no está en el repo.
- **Solución:** alta con la service role después de validar que el proceso está `activo`, que está enlazado a una vacante y que el candidato es el de la sesión. El doble clic (`23505`) devuelve el token existente.

### EV-10 · Subida de video sin validar pregunta ni estado — medio · confianza alta · **corregido**
- **Evidencia:** `uploadVideoAnswer` usaba la service role y solo validaba el token. Escribía la respuesta para cualquier `questionId` y en cualquier estado.
- **Impacto:** con un token se podía reemplazar el video después de terminar la evaluación, o escribir filas de respuesta sobre preguntas de otro proceso.
- **Solución:** ahora valida que el `questionId` tenga formato UUID, que el participante no esté cerrado, que el proceso esté activo y que la pregunta sea de video y del mismo proceso.

### EV-11 · Las decisiones nunca llegaban a la línea de tiempo del candidato — alto · confianza media · **corregido en 053** (y error ya no silenciado)
- **Evidencia:** `evaluar_events` solo tiene la policy `ev_events_read` (`for select`, `migration-022.sql:276`). El insert de `setParticipantStatus` con la sesión de la empresa queda rechazado por RLS, y el error se ignoraba.
- **Impacto:** la promesa de que «nadie queda esperando sin saber en qué terminó» no se cumplía. El candidato solo veía el `outcome_note`.
- **Solución:** policy `ev_events_company_insert` en la 053. Mientras tanto, el error se registra en el log.

### EV-12 · Inyección de HTML en los correos — medio · confianza alta · **corregido**
- **Evidencia:** `notifyParticipants`, `notifyTeamMember` y `notifyCompanyOfCompletion` interpolaban `full_name`, el título del proceso y el nombre de la empresa en HTML sin escapar. El `full_name` de un candidato de Worka lo escribe el propio candidato, y va al correo de la empresa.
- **Impacto:** un enlace falso dentro de un correo legítimo de Worka.
- **Solución:** `escapeHtml` (`lib/evaluar/puntaje.ts`, con prueba) en las tres plantillas.

### EV-13 · Inyección de fórmulas en el Excel exportado — medio · confianza alta · **corregido**
- **Evidencia:** `app/evaluar/app/procesos/[id]/export/route.ts` solo escapaba comillas. El email, el teléfono (`evaluar_save_profile`, sin validación) y el nombre los escribe el candidato.
- **Solución:** `csvCell` antepone `'` a las celdas que empiezan con `= + - @ \t \r` (prueba en `tests/evaluar`).

### EV-14 · El equipo veía «listo» al cambiar estados que no cambiaban — medio · confianza alta · **corregido**
- **Evidencia:** la policy de update de participantes es solo para la dueña (`migration-022.sql:237`, `migration-025.sql:101` es solo de lectura). Con RLS, el update sin permiso afecta 0 filas y no da error.
- **Solución:** `.select("id")` después del update. Con 0 filas, la acción devuelve un error explícito.

### EV-15 · Plan y rol en la exportación — medio · confianza alta · **propuesto**
- **Evidencia:** `lib/evaluar-plans.ts` define `reports: «Informe por candidato y exportación a Excel»` solo desde Profesional, pero la ruta de exportación no chequea el plan. Tampoco distingue entre la dueña y el equipo, que puede descargar emails y teléfonos.
- **Opciones:** (a) aplicar el plan en la ruta y ocultar el botón en Esencial; (b) dejar el CSV en todos los planes y corregir la promesa de precios; (c) exportar los datos de contacto solo para la dueña. **Recomendación:** (b) y (c). El CSV es portabilidad de datos y conviene que siga abierto, pero el contacto es dato personal y no necesita salir con el equipo.

### EV-16 · `findUserIdByEmail` recorre hasta 4.000 usuarios con la service role — bajo · confianza alta · **pendiente**
- `lib/evaluar.ts:697`. Es costoso y, aunque está detrás de una cuenta activa, sirve como oráculo de existencia de correos. Conviene una función SQL acotada o un índice en una tabla espejo.

### EV-17 · Las claves de IA se leen enteras para enmascararlas — bajo · confianza alta · pendiente
- `getAiKeys` hace `select("*")` (incluye `api_key`) con la sesión de un admin y enmascara en el servidor. No llega al navegador, pero conviene una vista o columna `masked` para no cargar la clave en memoria de cada render del backoffice.

---

## Estados, integridad y resultados

### EV-01 · Una etapa se podía entregar varias veces y cada entrega sumaba — **crítico** · confianza alta · **corregido en 053**
- **Evidencia:** `migration-024.sql:70-74` solo valida que la etapa sea del proceso; no compara su posición con `stage_index`. Las líneas 147-171 hacen `score = score + v_total`, `max_score = max_score + v_max` y `stage_index + 1`. No hay `FOR UPDATE`.
- **Reproducción:** (1) doble envío. El reloj vence (`enviarRef.current()`) mientras está en vuelo el toque en «Terminar etapa»: las Server Actions se despachan en serie, así que la segunda corre después de la primera y vuelve a corregir. (2) Desde la consola: `rpc('evaluar_submit_stage', {p_stage_id: <etapa fácil>})` repetido N veces suma puntos, infla el máximo y marca la evaluación como completada sin rendir las demás etapas.
- **Impacto:** puntajes, porcentajes, perfiles y estados incorrectos. Se puede saltear etapas y diluir una etapa mala con una buena.
- **Causa:** la corrección es acumulativa y no es idempotente.
- **Solución (053):** `FOR UPDATE` sobre el participante. La posición de la etapa se calcula con `(position, created_at, id)`: si es anterior a `stage_index`, o si la evaluación ya está cerrada, se devuelve el estado sin corregir (`repeated: true`), y si es posterior se rechaza («Primero terminá la etapa anterior»). En el navegador, `enviandoRef` impide el segundo envío. Modelo y casos en `lib/evaluar/puntaje.ts` (`validarEntrega`) y `supabase/tests/evaluar-053.sql` (casos C y D).

### EV-02 · Se podía rendir un proceso en borrador o cerrado — alto · confianza alta · **corregido** (UI) **y en 053** (base)
- **Evidencia:** ni `evaluar_load`, ni `evaluar_start`, ni `evaluar_submit_stage` miran `evaluar_processes.status`. `CandidateRunner` tampoco lo miraba. El panel dice «Está armado pero sin publicar: nadie puede rendirlo todavía» (`lib/evaluar.ts`, `getPanelData`), y el enlace se copia desde el borrador.
- **Solución:** el runner muestra «todavía no está abierta» o «ya cerró». La 053 rechaza `start`, `begin`, `submit` y `save_draft` si el proceso no está `activo`.
- Antecedente 3 → **confirmado**.

### EV-03 · Cronómetro controlado por el navegador — alto · confianza alta · **corregido en 053 + runner**
- **Evidencia:** `CandidateRunner` tomaba `inicio = Date.now()` al montar el efecto, con dependencia `[stage]`. Recargar la página, o cualquier `router.refresh()` (guardar los datos de contacto, subir el CV), reiniciaba el reloj. `p_seconds` lo envía el cliente y se guardaba tal cual (`migration-024.sql:79-83`).
- **Impacto:** las etapas cronometradas no tienen límite real. Las señales de velocidad (`qualityFlags`) dependen de un número que manda el candidato.
- **Solución:** columnas `stage_started_at/for` y `evaluar_begin_stage`, que devuelve la hora original si ya empezó. `evaluar_load` entrega `server_now`, el runner calcula el restante con el desfase del servidor y la entrega guarda los segundos medidos por la base. Antes de aplicar la 053, `beginStage` devuelve `fallback` y se mantiene el comportamiento anterior.
- **Pendiente de producto:** la base registra el tiempo real, pero no rechaza una entrega pasada de tiempo (ver 09-pendientes, D-4).

### EV-04 · La entrega pisaba la ruta del video — alto · confianza alta · **corregido en 053**
- **Evidencia:** al grabar, `CandidateRunner` llama `responder("video")`. La entrega manda `{qid: "video"}` y `evaluar_submit_stage` hace `on conflict do update set value = excluded.value` (`migration-024.sql:135-141`), lo que reemplaza `{video: path}` por `"video"`. `getVideoUrl` lee `value.video` y responde «Todavía no hay video».
- **Impacto:** se pierden en la práctica todas las respuestas en video de etapas que se entregan.
- **Solución:** la 053 no toca las respuestas de preguntas `video` (`on conflict do nothing`). El caso F de `evaluar-053.sql` lo cubre.
- **Datos históricos:** los archivos siguen en el bucket bajo `<participant_id>/<question_id>.webm|mp4`, así que la ruta se puede reconstruir. Se propone un script de reparación (09-pendientes, P-3), que no se escribió para no tocar datos.

### EV-05 · Likert sin validación de rango — alto · confianza alta · **corregido en 053**
- **Evidencia:** `migration-024.sql:92-99` acepta cualquier número. Un 9 suma 9 al rasgo, cuyo máximo es 5 por ítem, y el ajuste puede pasar de 100%.
- **Solución:** solo cuentan los enteros del 1 al 5. Cualquier otro valor se trata como sin responder (0 de 5), igual que una pregunta vacía. Prueba: `likertValido`, más el caso E del SQL.

### EV-06 · Orden de etapas con empates — medio · confianza alta · **corregido**
- **Evidencia:** `addStage`, `applyTemplate` y la IA usaban `count` como posición. Si se borra una etapa del medio y se agrega otra, quedan dos en la misma posición. `evaluar_load` y `getProcessDetail` ordenaban solo por `position`, así que con un empate el orden no está definido y el candidato podía ver una etapa distinta de la que espera la base.
- **Solución:** `nextStagePosition` (máximo + 1) en las cuatro altas, y orden `(position, created_at, id)` en el panel y en la base (053).

### EV-07 · Sigue viva la corrección de 3 argumentos de la 023 — medio · confianza alta · **corregido en 053**
- `create or replace` con otra firma crea una sobrecarga: la versión de la `023:50` sigue ejecutable por `anon` (`023:299`). La 053 la borra.

### EV-18 · Editar un proceso publicado cambia o borra resultados — **crítico** · confianza alta · **corregido** (bloqueo, opción D-1 a) / **propuesto** (versionado, D-1 b)
- **Evidencia:** no hay bloqueo de edición por estado. `deleteStage` y `deleteQuestion` borran en cascada las respuestas (`migration-022.sql:134`) sin recalcular `score/max_score`. `moveStage` reordena, pero `stage_index` es un índice: quien estaba en la etapa 2 pasa a rendir otra. `updateQuestion` cambia la correcta o el peso sin recorregir, y `setIdealProfile` cambia el ajuste de todos retroactivamente. No había ninguna confirmación (`confirm(` no aparecía en todo Evaluar).
- **Impacto:** resultados no comparables entre candidatos del mismo proceso, y pérdida de datos con un toque.
- **Hecho (1ª sesión):** confirmación antes de borrar una etapa o una pregunta.
- **Hecho (2ª sesión, D-1 a):** con al menos una persona en un estado distinto de `invitado`, el servidor rechaza agregar, borrar o mover etapas; agregar o borrar preguntas; aplicar plantillas o la IA; cambiar opciones, correcta, puntaje o excluyente; y cambiar minutos o cronómetro. Se puede seguir corrigiendo el enunciado, el nombre, la descripción y la explicación de cada etapa. El proceso real se lee de la base (`processOfStage` / `processOfQuestion`), no del id que manda el navegador. El editor oculta esos controles, muestra el aviso y ofrece «Duplicar como versión nueva». `duplicateProcess` ahora copia también la explicación, el ejemplo, el tope de video y los datos de la unidad, y renumera las posiciones. Reglas en `iniciados`, `mensajeBloqueo` y `cambioDeCorreccion` (`lib/evaluar/puntaje.ts`), con 3 pruebas.
- **Queda:** `setIdealProfile` sigue cambiando el ajuste retroactivamente. Es una lente de lectura y no un resultado guardado, así que se dejó libre a propósito. El versionado de verdad (D-1 b) llega con I-7.

### EV-19 · «Opción múltiple» es en realidad opción única — medio · confianza alta · **propuesto**
- **Evidencia:** el editor ofrece «Opción múltiple» (`ProcessEditor.tsx:762`), pero solo deja marcar una correcta. El runner trata `multiple` igual que `unica` y guarda un solo valor (`CandidateRunner.tsx:515`). La base compara igualdad de JSON.
- **Opciones:** (a) renombrar a «Opción única (lista larga)» o quitarla; (b) implementar la selección múltiple de verdad, con un arreglo ordenado y crédito parcial. **Recomendación:** (a) ahora y (b) solo si hay demanda.

### EV-20 · «integridad» es el nombre de tres rasgos distintos — medio · confianza alta · **parcial**
- **Evidencia:** `dimension: "integridad"` en el juicio situacional (`templates.ts:298`, `:366`), en el filtro del cajero (`:538`) y en el instrumento de integridad. El perfil los suma en un solo rasgo, `ALL_DIMENSIONS` toma la etiqueta del último y los baremos mezclan instrumentos.
- **Hecho:** `IntegrityReport` ya no se dibuja si solo existe «integridad», porque eso indica que vino del SJT o del filtro y no del instrumento.
- **Propuesto:** renombrar la clave en las plantillas nuevas (`integridad_sjt`) sin tocar el histórico (D-3).

### EV-21 · Escala likert con piso de 20% — medio · confianza alta · **propuesto**
- `raw/max` con ítems de 1 a 5 hace que la respuesta mínima dé 20% y la neutral 60%. Las bandas de integridad (70/45) y el umbral de lectura (`>= 60`) se calibraron sobre esa escala: respondiendo «ni acuerdo ni desacuerdo» a todo, cada factor queda en «Conviene repreguntar». Pasar a `(v−1)/4` cambia todos los números históricos (D-2).

### EV-22 · Sin responder: likert penaliza y SJT no cuenta — medio · confianza alta · **propuesto**
- Un likert vacío suma 0 de 5, peor que contestar «1». Un ítem SJT vacío directamente no entra al máximo. La asimetría está fijada en las pruebas (`likert con ítem inverso…` y `juicio situacional…`). Hoy el impacto es acotado porque el runner no deja avanzar sin responder, salvo cuando el reloj vence. Recomendación: excluir del máximo los ítems sin responder y registrar cuántos faltaron.

### EV-23 · El ajuste compara bases distintas — medio · confianza alta · **parcial**
- `fitScore` usa solo los rasgos rendidos. Alguien con 1 de 3 rasgos queda ordenado junto a quien rindió los 3, y alguien descartado por un excluyente podía aparecer primero con el trofeo.
- **Hecho:** el tablero muestra «rindió X de Y» y no da el trofeo a un descartado. **Propuesto:** separar «en curso» de «completos» en el orden.

### EV-24 · Los baremos solo usan `completado` — medio · confianza alta · **propuesto**
- `lib/evaluar/report.ts:78`. Cuando a alguien lo pasan a finalista o contratado sale del baremo, que queda sesgado hacia abajo (los mejores salen primero). Además, el percentil compara un valor redondeado con valores sin redondear (`percentileOf`). Recomendación: incluir `finalista` y `contratado` y redondear igual en los dos lados.

### EV-25 · Etapa sin preguntas bloquea al candidato — alto · confianza alta · **corregido**
- `canPublish` solo pedía que hubiera al menos una pregunta en todo el proceso, y el servidor no validaba nada. Ahora el panel y `updateProcess` exigen que todas las etapas tengan preguntas.

### EV-26 · Plazo vencido con excluyente — bajo · confianza alta · **corregido en 053**
- El trigger de la 025 solo se dispara cuando cambia `stage_index`, y un excluyente no lo cambia. La 053 vuelve a chequear el plazo en la función.

---

## UX y consistencia

| ID | Hallazgo | Sev. | Estado |
|---|---|---|---|
| EV-27 | El historial del panel usaba la voz del candidato («Completaste la etapa…») | bajo | **corregido** (`mensajeParaEmpresa`) |
| EV-28 | Ajuste, % y puntos sin explicación | medio | **corregido** (textos en el tablero) |
| EV-29 | Métricas del grupo con una sola persona y antes de los candidatos | bajo | **corregido** |
| EV-30 | Al terminar una etapa, la siguiente cronometrada arrancaba sin confirmación si no tenía intro | alto | **corregido** (confirmación siempre) |
| EV-31 | Chips con el tipo crudo («unica») y «la juzga el evaluador» en ítems autocorregidos | bajo | **corregido** |
| EV-32 | Precios: «Los cuatro tests» con cinco en el catálogo | bajo | **corregido** |
| EV-33 | La demo de integridad marcaba en verde la respuesta deseable de un ítem del propio constructo | medio | **corregido** (ejemplo neutro, solo en etapas nuevas) |
| EV-34 | «Las respuestas parecen sinceras / armadas» suena a veredicto | medio | **corregido** (lenguaje de señal) |
| EV-35 | Ajustes: cinco botones de guardar en una pestaña (`ProcessSettings.tsx:166, 376, 506`; `ProcessEditor.tsx:1207`) | medio | propuesto |
| EV-36 | Terminología: «concurso» (18 apariciones) y «proceso» (138) para lo mismo | bajo | propuesto (glosario en 09) |
| EV-37 | Corrección manual: no hay dónde poner nota a una respuesta escrita o a un video; solo la nota libre del equipo | medio | propuesto (innovación I-2) |
| EV-38 | `submitStage` devuelve `error.message` de la base al navegador | bajo | pendiente |
| EV-40 | Editar el enunciado de un ítem likert de plantilla le borraba la escala (`updateQuestion` guardaba `options = []` en todo lo que no fuera de opciones), y el candidato veía la frase sin nada para elegir | alto | **corregido** (se conservan las opciones, la correcta, el peso y el excluyente que tenía) |
| EV-39 | Accesibilidad: opciones del runner sin `role="radio"` ni `aria-checked`, y escala 1–5 sin etiqueta textual; no se midió contraste | medio | pendiente (confianza media) |
