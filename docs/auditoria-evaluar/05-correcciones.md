# Correcciones y evidencia

Orden de prioridad aplicado: datos y permisos > estados y resultados >
recorridos bloqueados > UX > consistencia. **Nada está commiteado.**

## Línea base (antes de tocar nada)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit -p .` | exit 0, sin errores |
| `npx eslint app/evaluar lib/evaluar.ts lib/evaluar lib/evaluar-access.ts lib/evaluar-plans.ts components/evaluar` | exit 0, sin advertencias |
| Pruebas | No existían (no había script ni archivos de prueba) |

## Después de los cambios

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit -p .` | exit 0 |
| `npx eslint` (mismos paths + `tests/evaluar`) | exit 0 |
| `npm run test:evaluar` | **19 de 19 pasan** |
| Modo demo (`npm run dev:demo`) | `/evaluar`, `/evaluar/app` y `/evaluar/precios` → 200, sin errores en el log; `/evaluar/app/procesos/x` y `/evaluar/e/x` → 404, lo esperado sin base |
| `supabase/migration-053.sql` | **No ejecutada**: no hay Postgres local ni credenciales |
| `supabase/tests/evaluar-053.sql` | **No ejecutada** (misma razón) |

## Cambios

| # | Hallazgo | Archivos | Qué cambia | Verificación |
|---|---|---|---|---|
| C-1 | EV-01, 02, 03, 04, 05, 06, 07, 11, 26 | `supabase/migration-053.sql` (nueva) | Entrega idempotente y en orden con `FOR UPDATE`; proceso activo obligatorio; `evaluar_begin_stage` y reloj del servidor; el video no se pisa; likert 1–5; policy de insert de eventos; borra la sobrecarga de la 023; orden con desempate; plazo en la función | Revisión manual del SQL. Script de prueba con 7 casos (A–G) y resultados calculados a mano, **sin correr** |
| C-2 | EV-01 a 05 (modelo) | `lib/evaluar/puntaje.ts` (nuevo), `tests/evaluar/puntaje.test.mjs` (nuevo), `package.json` (`test:evaluar`) | Cálculos puros (`percentOf`, `fitScore`, `fitCoverage`, `csvCell`, `escapeHtml`, `mensajeParaEmpresa`, `modoCorreccion`) y un modelo de referencia de la corrección (`corregirEtapa`, `validarEntrega`) | 19 pruebas. `fitScore` se movió sin cambios desde `lib/evaluar.ts`, que lo reexporta |
| C-3 | EV-08 | `app/evaluar/actions.ts` (`setParticipantStatus`), `components/evaluar/DecisionBoard.tsx` | El detalle del descarte va a las notas internas, no a `outcome_note`; la pantalla lo aclara | tsc/eslint |
| C-4 | EV-14, EV-11 | `actions.ts` (`setParticipantStatus`) | Error explícito si el update afecta 0 filas; el error del insert de eventos se registra | tsc/eslint |
| C-5 | EV-09 | `actions.ts` (`joinProcessFromJob`) | Alta con la service role, con validación de proceso activo y enlazado; doble clic idempotente | tsc/eslint |
| C-6 | EV-10 | `actions.ts` (`uploadVideoAnswer`) | Valida el UUID, el estado del participante y del proceso, y que la pregunta sea de video y del mismo proceso | tsc/eslint |
| C-7 | EV-12 | `actions.ts` (tres correos) | `escapeHtml` en los datos interpolados | prueba `escapeHtml` |
| C-8 | EV-13 | `app/evaluar/app/procesos/[id]/export/route.ts` | `csvCell` neutraliza fórmulas | prueba `csvCell` |
| C-9 | EV-25 | `actions.ts` (`updateProcess`), `ProcessEditor.tsx` | No se publica con etapas vacías (servidor y UI) | tsc/eslint |
| C-10 | EV-06 | `actions.ts` (`nextStagePosition` en las 4 altas de etapa), `lib/evaluar.ts` (orden) | Posición máximo + 1; orden con desempate | tsc/eslint |
| C-11 | EV-02, 03, 30, 01 | `components/evaluar/CandidateRunner.tsx`, `actions.ts` (`beginStage`, `submitStage`) | Aviso de proceso no abierto o cerrado; confirmación antes de cada etapa; reloj desde la hora del servidor (con respaldo local si la 053 no está); un solo envío a la vez; el error de inicio se muestra; una entrega repetida no vuelve a mandar el correo de «completó» | tsc/eslint. **No se pudo recorrer**: en demo `/evaluar/e/*` da 404 |
| C-12 | EV-18 | `ProcessEditor.tsx` | Confirmación antes de borrar una etapa o una pregunta, avisando la pérdida de respuestas | tsc/eslint |
| C-13 | EV-27 | `lib/evaluar.ts` (`getPanelData`) | El historial pasa a tercera persona | prueba `mensajeParaEmpresa` |
| C-14 | EV-28, 23, 29 | `DecisionBoard.tsx`, `BoardMetrics.tsx`, `lib/evaluar.ts` (`fitCoverage`) | Explicación de ajuste y puntaje; «rindió X de Y»; sin trofeo para descartados; métricas del grupo después de los candidatos y solo con 2 o más personas | tsc/eslint |
| C-15 | EV-31 | `ProcessEditor.tsx`, `lib/evaluar.ts` (tipo) | Chips con nombre legible y modo de corrección real | prueba `modoCorreccion` |
| C-16 | EV-20, 33, 34 | `lib/evaluar/integridad.ts`, `IntegrityReport.tsx` | No se muestra integridad si solo hay el rasgo compartido; demo neutra; lenguaje de señal | tsc/eslint |
| C-18 | EV-18 (D-1 a) | `app/evaluar/actions.ts` (`structureLock`, `processOfStage`, `processOfQuestion` en 10 acciones; `duplicateProcess`), `components/evaluar/ProcessEditor.tsx`, `lib/evaluar/puntaje.ts` | Estructura fija con candidatos iniciados, en el servidor y en el editor; «Duplicar como versión nueva»; duplicado completo | 3 pruebas nuevas (22/22), tsc/eslint. Sin recorrido en el navegador (en demo no hay procesos) |
| C-19 | EV-40 | `actions.ts` (`updateQuestion`) | Las preguntas sin opciones conservan las que tenían | tsc/eslint |
| C-20 | EV-15 (D-5) | `export/route.ts`, `tablero/page.tsx`, `DecisionBoard.tsx` | Excel solo desde Profesional: 403 en la ruta; botón «Excel · Profesional» hacia precios | tsc/eslint |
| C-21 | EV-20 (D-3) | `lib/evaluar/templates.ts` | `integridad_sjt` en etapas nuevas del SJT y del filtro de cajero | tsc/eslint |
| C-22 | EV-21 (D-2) | `supabase/migration-054.sql` (nueva), `puntaje.ts`, `report.ts`, `integridad.ts`, `IntegrityReport.tsx`, informe, `BoardMetrics.tsx`, `DecisionBoard.tsx`, export, `templates.ts` (`LIKERT_DIMENSIONS`) | Escala 0–4 para candidatos nuevos; lectura con dos escalas | 4 pruebas (26/26); `supabase/tests/evaluar-054.sql` **sin correr** |
| C-23 | EV-24 | `lib/evaluar/report.ts` | Baremo con finalistas, contratados y descartados, en escala común y con el mismo redondeo; funciona antes de la 054 (reintenta sin la columna) | tsc/eslint |
| C-24 | EV-19 | `ProcessEditor.tsx`, `puntaje.ts`, `actions.ts` | «Opción múltiple» fuera del editor | tsc/eslint |
| C-25 | EV-39 | `CandidateRunner.tsx` | Accesibilidad de la evaluación | tsc/eslint; sin lector de pantalla |
| C-26 | EV-15 (D-5 c) | `lib/evaluar.ts` (`BoardData.esDueno`), `export/route.ts` | El Excel del equipo sale sin email ni teléfono | tsc/eslint |
| C-27 | EV-22 (D-7) | `supabase/migration-055.sql` (nueva), `puntaje.ts` (escala 3, `contarRespondidas`), `report.ts`, `DecisionBoard.tsx`, informe | Likert sin responder fuera del máximo para participantes nuevos; «respondió X de Y» | 3 pruebas (29/29); `supabase/tests/evaluar-055.sql` **sin correr** |
| C-28 | EV-36 (D-6) | `actions.ts`, `cierre/page.tsx`, `PanelHome.tsx`, `ProcessEditor.tsx`, `ProcessSettings.tsx`, `lib/evaluar.ts`, `10-glosario.md` | «Concurso» → «proceso» en los textos visibles; glosario | grep sin apariciones visibles |
| C-29 | I-7 (pedido) | `supabase/migration-056.sql` (nueva), `actions.ts`, `ProcessEditor.tsx`, `CandidateRunner.tsx`, `lib/evaluar.ts`, `puntaje.ts` (`sortearFormulario`) | Formulario propio por candidato: orden, opciones y sorteo estratificado del banco; el banco no viaja al navegador | 4 pruebas del sorteo; `supabase/tests/evaluar-056.sql` **sin correr** |
| C-30 | Pedido (figuras) | `lib/evaluar/figuras.ts`, `components/evaluar/Figura.tsx`, runner y demo | Tipo «figura»: matrices 3×3 y series dibujadas en SVG, con descripción para lector de pantalla | Revisado en el navegador con una página temporal (borrada); pruebas de bancos |
| C-31 | Pedido (bancos) | `lib/evaluar/bancos/*.ts`, `templates.ts`, `TemplatePicker.tsx`, landing, precios | 500 ítems nuevos en 8 pruebas; catálogo de 13; cifras contadas del catálogo | 8 pruebas de calidad de bancos (41/41 en total) |
| C-17 | EV-32 | `app/evaluar/precios/page.tsx` | «Las cinco pruebas del catálogo» | lectura |

## Compatibilidad del despliegue

El código funciona **antes y después** de aplicar la 053:

- `beginStage` reconoce la función ausente (`PGRST202`/`42883`) y devuelve `fallback`. El runner sigue midiendo en el navegador, como antes.
- `evaluar_load` sin la 053 no trae `server_now` ni `stage_started_*`. El runner los trata como opcionales.
- Hasta que se aplique la 053, el insert de eventos sigue fallando, pero ahora queda registrado en el log.
- Al aplicar la 053, un candidato que ya estaba en medio de una etapa no tiene `stage_started_for`. La base usa entonces el `p_seconds` del navegador una sola vez, para esa etapa.

## Verificación manual pendiente (en staging, con datos ficticios)

1. Correr `supabase/tests/evaluar-053.sql` → deben salir los avisos «A OK» a «G OK».
2. Candidato: abrir el enlace con el proceso en borrador → aviso «todavía no está abierta».
3. Etapa cronometrada: empezar, recargar → el reloj sigue desde donde estaba.
4. Doble clic en «Terminar etapa» con la red lenta (DevTools «Slow 3G») → `score` sin duplicar.
5. Pregunta de video → entregar la etapa → el video se ve en el tablero.
6. Descartar con detalle → el candidato **no** ve el detalle; la nota aparece en el tablero.
7. Miembro del equipo intenta pasar a finalista → error explícito.
8. Candidato de Worka entra desde la vacante enlazada → se crea la participación.
9. Exportar con un nombre `=1+1` → la celda se abre como texto.
10. Proceso con un candidato `en_curso`: el editor muestra el aviso y no ofrece mover, borrar ni agregar. Llamar a `deleteStage` desde la consola devuelve el mensaje de bloqueo.
11. En ese proceso, corregir el enunciado de una pregunta → se guarda. Cambiar el puntaje → error «No se puede cambiar el puntaje…».
12. «Duplicar como versión nueva» → abre un borrador con las mismas etapas, la explicación, el ejemplo y el tope de video, sin candidatos ni vacante.
13. Editar el enunciado de un ítem likert de plantilla → el candidato sigue viendo las 5 opciones.
14. Aplicar la 054 y correr `supabase/tests/evaluar-054.sql` → «A OK» a «C OK».
15. Cuenta Esencial (fuera de la prueba): el botón dice «Excel · Profesional» y `/export` responde 403. En Profesional descarga, con la columna «Escala de rasgos».
16. Proceso con candidatos de las dos escalas → los viejos muestran «Escala anterior»; el informe de integridad da la misma banda para las mismas respuestas.
18. Aplicar la 055 y correr `supabase/tests/evaluar-055.sql` → «A OK» a «D OK».
19. Un miembro del equipo con plan Profesional exporta → el archivo no trae email ni teléfono. La dueña sí los recibe.
20. Candidato nuevo deja una etapa con un likert sin responder por fin del reloj → el tablero dice «respondió X de Y» y el rasgo no baja por el vacío.
21. Aplicar la 056 y correr `supabase/tests/evaluar-056.sql` → «A OK» a «F OK».
22. Aplicar «Razonamiento abstracto con figuras» a un proceso, invitar a dos candidatos ficticios y comparar: reciben matrices distintas, en otro orden y con las opciones en otro lugar.
23. Recargar en medio de esa etapa → mismas preguntas, mismo orden y el reloj sigue.
17. Recorrer la evaluación solo con teclado y con NVDA (Windows) o VoiceOver: se anuncian la pregunta, las opciones y cuál está elegida, y el aviso del último minuto.
