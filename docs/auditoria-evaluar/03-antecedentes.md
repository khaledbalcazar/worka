# Antecedentes de la revisión del 22/10/2026

Clasificación: **confirmado** (se ve en el código), **corregido previamente**,
**no reproducido** (no se encontró la causa en el código y sin base no se pudo
probar), **pendiente** (confirmado y sin corregir).

| # | Antecedente | Clasificación | Evidencia y qué se hizo |
|---|---|---|---|
| 1 | Aplicar plantilla deja 0 etapas hasta recargar | **No reproducido** | `applyTemplate` llama a `revalidatePath` y el editor a `router.refresh()` después de un `ok` (`ProcessEditor.tsx`, función `run`). Según la guía de Next 16 (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`, «A single response carries data and UI»), la respuesta trae el árbol actualizado. Sin base no se pudo reproducir. Hay una hipótesis compatible: si falla el insert de preguntas, la etapa se borra y el error se muestra arriba, fuera de la vista de la pestaña. Verificar en staging (09-pendientes, V-1). |
| 2 | Invitar sin correo no actualiza lista ni contador | **No reproducido** | `inviteParticipant` revalida y el cliente refresca en los dos caminos, con y sin email. No se encontró estado local que tape la lista. Verificar en staging (V-2). |
| 3 | Un proceso en borrador permitió completar una etapa | **Confirmado → corregido** | EV-02. El runner ahora bloquea la etapa y la 053 bloquea la base. |
| 4 | 32% de ajuste, 45% y 19/42 sin relación explicada | **Confirmado → corregido** | EV-28. Son tres números con bases distintas: el ajuste sale de los rasgos del perfil ideal; el 45% es 19/42, con el puntaje de las preguntas autocorregidas, sin likert. Hay una prueba que lo fija (`fitScore y percent miden cosas distintas`) y textos explicativos en el tablero. |
| 5 | Tableros de avance y de decisión separados | **Confirmado → pendiente** | El proceso tiene una vista «Tablero» (`CandidateBoard`, por estado) y otra página, «Tablero de decisión» (`DecisionBoard`). Propuesta en 08-roadmap: una sola vista con las columnas por estado y la comparación al costado. No se cambió porque es rediseño, no corrección. |
| 6 | Métricas grupales antes de los candidatos, aun con una persona | **Confirmado → corregido** | EV-29. `BoardMetrics` va después de la comparación y no se dibuja con menos de dos personas evaluadas. |
| 7 | Al terminar una etapa empieza la siguiente cronometrada sin confirmación | **Confirmado → corregido** | EV-30. La explicación solo aparecía si la etapa tenía `intro` (las etapas manuales no la tienen). Ahora hay confirmación antes de cada etapa, y el reloj arranca en el servidor (EV-03). |
| 8 | Ajustes concentra demasiado y tiene varios botones de guardar | **Confirmado → pendiente** | EV-35. Hay cinco bloques con guardado propio en la misma pestaña (organización, perfil ideal, diseño, equipo, datos generales). Propuesta: separar en «Puesto y perfil», «Marca» y «Equipo», con un solo guardado por sección y aviso de cambios sin guardar. |
| 9 | Terminología inconsistente; «unica», «la juzga el evaluador» | **Confirmado → parcial** | Chips corregidos (EV-31). «Concurso», «proceso» y «evaluación» siguen mezclados (EV-36). El glosario propuesto está en 09-pendientes, D-6. |
| 10 | El catálogo mezcla procesos por puesto y pruebas sueltas | **Confirmado parcialmente → pendiente** | `TemplatePicker` los separa con dos rótulos («Proceso completo por puesto» / «O un test suelto»), pero en la misma lista y con la misma tarjeta. Propuesta: dos pasos, primero el puesto y después «sumar una prueba». |
| 11 | Portada: cinco pruebas; Esencial: cuatro | **Confirmado → corregido** | EV-32. `TEMPLATES` tiene 5 y ningún plan limita el catálogo, así que el texto de precios estaba desactualizado. |
| 12 | El historial usa segunda persona para acciones de candidatos | **Confirmado → corregido** | EV-27. `getPanelData` mostraba el mensaje escrito para el candidato. Ahora `mensajeParaEmpresa` lo pasa a tercera persona con el nombre (tiene prueba). |
