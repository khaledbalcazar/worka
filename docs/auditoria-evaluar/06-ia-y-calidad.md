# Calidad de evaluación, IA e integridad

## Asistente de IA (`generateStageWithAi`, `lib/evaluar/ai.ts`, `AiStageGenerator.tsx`)

| Aspecto | Estado | Evidencia y riesgo | Recomendación |
|---|---|---|---|
| No se publica solo | **Bien** | Crea una etapa en el proceso, con la descripción «Borrador armado con el asistente. Revisalo antes de publicar.». La publicación sigue siendo manual | Además, si el proceso **ya está activo**, la etapa entra en vivo de inmediato. Bloquear la IA en procesos publicados (o crear la etapa oculta) |
| Validación de la salida | **Parcial** | Se filtran preguntas sin texto, con menos de 2 opciones o con una correcta que no está entre ellas. No se detectan opciones duplicadas, varias respuestas correctas posibles, ni ítems triviales | Agregar la deduplicación de opciones y una revisión obligatoria pregunta por pregunta (marcar «revisada») antes de publicar |
| Inyección de instrucciones | **Riesgo bajo, no mitigado** | El pedido de la empresa va como mensaje de usuario (`actions.ts`, `user: texto`). El único afectado es quien lo escribe; la salida se parsea como JSON y se filtra, y no hay herramientas ni datos de terceros en el contexto. El riesgo real es que el modelo ignore las reglas antidiscriminación del sistema | Revisar la salida con una lista de términos prohibidos (edad, sexo, religión, estado civil, embarazo, salud, nacionalidad, afiliación política) **del lado del servidor**, no solo en el prompt |
| Rúbricas | **Ausente** | La IA solo arma preguntas de opción con una correcta | Para las respuestas abiertas, generar una rúbrica (criterios + niveles) que el evaluador apruebe (I-2) |
| Trazabilidad | **Ausente** | No se guarda qué modelo ni qué prompt generó la etapa | Guardar `ai_model`, `ai_prompt_hash` y `ai_generated_at` en la etapa |
| Validez | **No afirmada, correcto** | El texto de la IA no promete validez | Mantenerlo así. Rotular «generada con IA, sin validar» en el informe |
| Claves | **Bien** | La tabla es de lectura exclusiva del admin y se usa con la service role; la clave nunca viaja al navegador (`migration-030.sql`) | EV-17 |

## Límites de las comparaciones

- **Ajuste al puesto:** es un promedio de rasgos elegido por la empresa, sin validación de criterio. Hay que presentarlo como «coincidencia con lo que marcaste», no como predicción de desempeño. El tablero ya lo dice en el texto agregado en esta sesión.
- **Percentiles:** el baremo mezcla procesos, puestos e instrumentos que comparten la clave de rasgo (EV-20) y excluye a los que avanzaron (EV-24). Hasta corregirlo, mostrar la muestra (`n`) y la frase «comparado con quienes rindieron esta prueba en Worka», nunca «comparado con la población».
- **Tests propios** («Instrumento original de Worka», en `integridad.ts`, `templates.ts`): **no hay estudios de confiabilidad ni de validez** en el repo. El comentario de `integridad.ts` dice que «la investigación muestra que la vía actitudinal predice tan bien o mejor». Esa afirmación es sobre la literatura general y **no** valida este instrumento. No debería aparecer en la landing ni en los informes como propiedad del test.
- **Recomendación mínima:** calcular el alfa de Cronbach por rasgo con los datos reales (ya están en `evaluar_answers`) y no mostrar percentiles de un rasgo con alfa < 0,6.

## Señales de integridad: que no se conviertan en acusaciones

Lo que está bien: `IntegrityReport` no tiene veredictos, las bandas apuntan a
conversar, las escalas de validez van primero y aclara que «un resultado bajo
no alcanza para descartar». Lo que se corrigió:

- «Las respuestas parecen sinceras / armadas» → «Sin señales de respuesta complaciente / Patrón de respuesta muy favorable», con causas alternativas (nervios, lectura literal). EV-34.
- La demo marcaba en verde la respuesta deseable de un ítem del propio constructo, lo que entrena al candidato. Se cambió por un ejemplo neutro. EV-33.
- El informe de integridad ya no se dibuja si el único dato es el rasgo compartido con el SJT. EV-20.

Pendiente:

- `qualityFlags` («Contestó demasiado rápido», «Respuestas que se contradicen») usa la palabra «alerta». Sugerencia: «señal», con el número al lado y la frase «revisalo con la persona». Además, hasta aplicar la 053 la velocidad depende de segundos que manda el navegador (EV-03).
- No existe un registro de que se descartó a alguien **por** una señal de integridad. Conviene impedir el motivo de descarte «integridad» si el único dato es el cuestionario, o pedir un detalle obligatorio.
- Las bandas (70/45) dependen de la escala con piso de 20% (EV-21).
