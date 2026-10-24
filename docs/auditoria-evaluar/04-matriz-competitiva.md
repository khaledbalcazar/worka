# Matriz competitiva

**Método y límites.** Las búsquedas se hicieron el 23/10/2026 y se
restringieron a los dominios oficiales de cada proveedor (`testgorilla.com`,
`support.testgorilla.com`, `classmarker.com`, `testportal.net`). Lo que sigue
sale de los resúmenes de esas páginas que devolvió el buscador: **no se leyó
cada página entera**. Antes de usar algo en una decisión comercial o en una
página pública, hay que abrir la fuente. Varias páginas de ClassMarker son
antiguas (el buscador las fecha hace 5 a 7 años).

Tipo de evidencia: **D** = documentado en el centro de ayuda o en el manual
(cómo se usa); **C** = afirmación comercial o de blog del propio proveedor;
**P** = anunciado como «próximamente».

## Fuentes

| Id | URL | Tipo |
|---|---|---|
| TG1 | https://support.testgorilla.com/hc/en-us/articles/9028486941979-Guide-to-analyzing-results | D |
| TG2 | https://support.testgorilla.com/hc/en-us/articles/9028021150491-Using-custom-questions | D |
| TG3 | https://support.testgorilla.com/hc/en-us/articles/41929161638939-Release-notes-September-2025 | D |
| TG4 | https://support.testgorilla.com/hc/en-us/articles/9025312232731-TestGorilla-s-API-documentation | D |
| TG5 | https://support.testgorilla.com/hc/en-us/articles/30054006666011-Understanding-percentile-scoring | D |
| TG6 | https://support.testgorilla.com/hc/en-us/articles/30469832839451-FAQ-Analyzing-results-questions | D |
| TG7 | https://www.testgorilla.com/blog/impossible-prevent-cheating/ | C |
| CM1 | https://www.classmarker.com/online-testing/quiz-features/ | C |
| CM2 | https://www.classmarker.com/online-testing/manual/testsettings | D (antigua) |
| CM3 | https://www.classmarker.com/online-testing/faq/ | D (antigua) |
| CM4 | https://www.classmarker.com/docs/ClassMarker-Essentials.pdf | C |
| TP1 | https://www.testportal.net/en/help-center/after-the-test/statistics/ | D |
| TP2 | https://testportal.net/en/help-center/how-to-ensure-results-reliability-when-using-testportal | D |
| TP3 | https://testportal.net/detailed-online-tests-pricing.html | C/P |
| TP4 | https://www.testportal.net/en/help-center/test-configuration/time-parameters/ | D |
| TP5 | https://testportal.net/en/help-center/what-is-honest-respondent-technology | D |

## Matriz

Estado en Worka: **completo**, **parcial**, **ausente**, **no verificado** (existe
en el código, pero no se pudo ejecutar). Prioridad: P1 (resolver ahora), P2
(próximo trimestre), P3 (cuando haya demanda).

| Capacidad | Necesidad de la empresa | Evidencia de mercado | Worka | Brecha | Conveniencia | Prio |
|---|---|---|---|---|---|---|
| Reloj del lado del servidor | Que el tiempo límite sea real | TP2, TP4 (D): el reloj corre en el servidor y no se reinicia al reconectar. CM2 (D): al vencer, el test se cierra solo | **No verificado**. Escrito en la 053 (EV-03); antes era solo del navegador | Aplicar la 053 y decidir qué hacer con la entrega fuera de tiempo | Alta: sin esto los tests cognitivos no miden lo que dicen | P1 |
| Entrega única e idempotente | Que el puntaje no se duplique | Se da por supuesto en todos | **No verificado** (053) | Aplicar la 053 | Imprescindible | P1 |
| Bloqueo de edición con candidatos | Resultados comparables | TG2 (D): las preguntas propias solo se editan si todavía no se invitó a nadie | **Ausente**: solo hay confirmación al borrar (EV-18) | Bloqueo o versionado | Alta | P1 |
| Aleatorización de preguntas y opciones | Menos copia entre candidatos | CM3 (D): orden de preguntas y respuestas, sorteo desde un banco. TG7 (C). TP2 (D) | **Ausente** (el orden es fijo) | Mezclar preguntas y opciones por participante con una semilla guardada. La corrección por texto (`correct` = texto de la opción) ya lo soporta | Media-alta | P2 |
| Señales de integridad durante la prueba | Detectar copia sin acusar | TG1/TG4 (D): salir de pantalla completa, mouse fuera de la pantalla y misma IP; no descartar solo por eso. TP5 (D): clics fuera de la pestaña y corte por exceso | **Parcial**: señales posteriores (respuesta plana, velocidad, inconsistencia) en `report.ts`. Nada durante la prueba | Contar cambios de pestaña y mostrarlos como «señal», nunca como veredicto | Media | P2 |
| Webcam o proctoring | Prueba de identidad en evaluaciones de alto impacto | TG1 (D): fotos periódicas. TP3 (P): «advanced proctoring» próximamente. CM (C): IA en planes altos | **Ausente** | Costo de privacidad alto en Paraguay; no recomendado como primera opción | Baja | P3 |
| Percentil contra baremo | Saber contra quién se compara | TG5 (D): grupo de referencia = todos los que rindieron el test, ajuste por dificultad, actualización periódica; TG6 (D): explica por qué un 40 parece bajo | **Parcial**: rango medio y mínimo 30, pero solo `completado` (EV-24) y mezcla de instrumentos (EV-20) | Corregir la población, mostrar n y fecha del baremo | Alta: es la base del informe | P1 |
| Corrección con rúbrica de respuestas abiertas | Puntuar respuestas escritas y videos | TG2 (D): rúbrica de hasta 4 criterios, ajuste manual por criterio y recálculo | **Ausente** (EV-37) | Rúbrica por pregunta con nota manual que entre al puntaje | Alta | P2 |
| Embudo y analítica de proceso | Saber dónde abandona la gente | TG1 (D): invitado → abrió → empezó → completó; exportación masiva | **Completo** para invitado → empezó → terminó (`DecisionBoard`); falta «abrió el enlace» | Registrar la primera apertura | Media | P2 |
| Analítica por pregunta | Detectar preguntas rotas o demasiado fáciles | TP1 (D): dificultad por pregunta, distribución de respuestas, tiempo medio por pregunta, histograma. No documentan índices de discriminación | **Ausente** (solo la dispersión del grupo en `BoardMetrics`) | Dificultad y discriminación por ítem; tiempo por pregunta | Alta (diferencial si se agrega discriminación) | P2 |
| Exportación | Trabajar en planillas | TG1 (D) masiva; CM (D) CSV; TP1 (D) PDF, CSV, Excel, matriz de respuestas | **Completo** (CSV con BOM, neutralizado) | Matriz de respuestas por pregunta | Media | P3 |
| Preguntas en video asincrónicas | Cribado sin agenda | TG2 (D): disponibles según plan | **No verificado**: existe, pero la entrega borraba la ruta (EV-04) | Aplicar la 053 y reparar las rutas | Alta | P1 |
| IA para armar pruebas | Velocidad de armado | TG3 (D, sep. 2025): bloquea agentes de navegador automatizados | **Parcial**: genera una etapa en borrador; no revisa calidad ni sesgo de los ítems (06) | Revisión de ítems y etiqueta «generado por IA» | Media | P2 |
| Integración con la bolsa de empleo propia | Rendir sin otra cuenta | No es foco de los tres (son herramientas independientes con API, TG4) | **No verificado**: la entrada desde la vacante fallaba por RLS (EV-09), corregido | — | **Diferencial de Worka** | P1 |
| Devolución al candidato | Experiencia y marca empleadora | No aparece documentado como foco en las fuentes consultadas | **Parcial**: línea de tiempo; las decisiones no llegaban (EV-11) | Aplicar la 053 | Diferencial | P1 |

**Lectura.** Worka no compite en volumen de catálogo ni en proctoring. Sus
ventajas reales son la integración con el aviso, la devolución al candidato y
el idioma y contexto local. Hoy las tres estaban rotas o parcialmente rotas por
defectos de permisos (EV-09, EV-11), así que lo primero no es agregar
funciones, sino que las que ya existen funcionen.
