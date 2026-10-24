# Mapa del sistema y cobertura real

## Capas

| Capa | Archivos | Rol |
|---|---|---|
| Páginas (RSC) | `app/evaluar/**` (landing, precios, recursos, panel `app/`, proceso `app/procesos/[id]`, tablero, informe `[pid]`, cierre, export, desempeño, `e/[token]`) | Leen con `lib/evaluar*` y pasan datos a componentes cliente |
| Acciones | `app/evaluar/actions.ts` (≈2.150 líneas), `app/evaluar/desempeno-actions.ts` | Todas las escrituras. Sesión de Supabase (anon + cookies) y, en 6 casos, cliente de servicio |
| Datos / dominio | `lib/evaluar.ts` (lectura de procesos, tablero, panel), `lib/evaluar/report.ts` (baremos, calidad de respuesta), `lib/evaluar/integridad.ts`, `lib/evaluar/templates.ts`, `lib/evaluar/puntaje.ts` (**nuevo**, cálculos puros con pruebas), `lib/evaluar-access.ts`, `lib/evaluar-plans.ts` | Reglas de negocio mezcladas con acceso a datos, salvo `puntaje.ts` y `evaluar-access.ts` |
| IA | `lib/evaluar/ai.ts` (Groq, rotación de claves), `components/evaluar/AiStageGenerator.tsx` | Genera una etapa en borrador |
| Corrección | Funciones SQL `security definer`: `evaluar_load`, `evaluar_start`, `evaluar_submit_stage`, `evaluar_save_draft`, `evaluar_save_profile` (migraciones 022–030) y, nueva, `evaluar_begin_stage` (053) | **El puntaje se calcula en la base.** El token del enlace es la credencial del candidato |
| Persistencia | Tablas `evaluar_accounts`, `_processes`, `_stages`, `_questions`, `_participants`, `_answers`, `_events`, `_notes`, `_process_members`, `_contacts`, `_ai_keys`, `_ciclos`, `_desempeno`; buckets `cvs` y `entrevistas` | RLS por empresa dueña (`company_id = auth.uid()`), y lectura para el equipo vía `fn_evaluar_can_access` (025) |

## Flujos

**Reclutador:** crear proceso → aplicar plantilla por puesto / test suelto / IA /
etapa manual → publicar (`updateProcess status=activo`, valida cupo del plan y,
desde ahora, que ninguna etapa esté vacía) → invitar (uno, lista, o vacante
enlazada) → tablero de decisión (ajuste, puntaje, rasgos, notas, descarte con
motivo) → informe por candidato (plan Profesional) → acta de cierre.

**Candidato:** `/evaluar/e/[token]` → `evaluar_load` → `evaluar_start` →
(053) `evaluar_begin_stage` por etapa → respuestas con borrador
(`evaluar_save_draft`) → `evaluar_submit_stage` corrige y avanza → resultado y
línea de tiempo.

## Dónde vive cada cálculo

| Número | Dónde se calcula | Base |
|---|---|---|
| `score` / `max_score` | SQL `evaluar_submit_stage` (acumulado por etapa) | Ítems con `correct` (peso) + ítems con `option_scores` respondidos. **No** incluye likert |
| Porcentaje del tablero | `percentOf` en `lib/evaluar/puntaje.ts` | `score / max_score` de lo rendido hasta ahora |
| Perfil por rasgo | SQL, en `participants.profile` | likert (1–5, inverso = 6−v, sin responder = 0/5) + SJT por opción + ítems con `correct` y `dimension` |
| Ajuste al puesto | `fitScore` en `puntaje.ts` | Promedio ponderado de `raw/max` de los rasgos con peso en `ideal_profile`, **solo los rendidos** |
| Percentil | `lib/evaluar/report.ts` `percentileOf` | Rango medio contra todos los `completado` de la plataforma, mínimo 30 |
| Señales de calidad | `qualityFlags` en `report.ts` | Respuesta plana, velocidad (`stage_times`), inconsistencia derecho/inverso |
| Integridad | `leerIntegridad` en `integridad.ts` | Bandas 70/45 sobre el % del rasgo |

## Cobertura real de esta revisión

| Área | Cómo se revisó | Cobertura |
|---|---|---|
| `actions.ts`, `lib/evaluar*.ts`, `report.ts`, `integridad.ts`, `ai.ts` | Lectura completa | Alta |
| Migraciones 022–038 (evaluar) | Lectura de tablas, policies y funciones vigentes | Alta para corrección y RLS; desempeño (033–038) solo por encima |
| `CandidateRunner`, `ProcessEditor`, `DecisionBoard`, `BoardMetrics`, `IntegrityReport` | Lectura completa o de las secciones relevantes | Media-alta |
| `ProcessSettings`, `TemplatePicker`, `PanelHome`, `CandidateBoard`, `LinkedJobPanel`, informe, cierre, desempeño | Lectura parcial y búsquedas | Baja-media |
| Landing, precios, recursos, SEO | Búsquedas puntuales | Baja |
| Ejecución real con Supabase | **No hecha** (sin credenciales) | Nula |
| Modo demo | `/evaluar`, `/evaluar/app` y `/evaluar/precios` responden 200 sin errores; proceso y token devuelven 404, como corresponde en demo | Solo humo |
| Accesibilidad y móvil | Lectura de marcado (labels, aria, tamaños) | Baja: no se usó lector de pantalla ni se midió contraste |
