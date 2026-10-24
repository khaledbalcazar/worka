# Azar por candidato y bancos de ítems

Pedido del 23/10/2026: que las preguntas dejen de ser rígidas y no se puedan
copiar entre postulantes, sumar unos 500 ítems psicométricos y conductuales, y
que los tests de razonamiento se vean con figuras y no con texto. Es la
oportunidad I-7 de [07-innovacion.md](07-innovacion.md), ya implementada.

## Cómo funciona

| Pieza | Dónde | Qué hace |
|---|---|---|
| Opciones por etapa | `evaluar_stages.shuffle_questions`, `shuffle_options`, `draw_count` (migración 056) | Orden distinto por persona, opciones mezcladas, y sorteo de N preguntas del banco de la etapa |
| Formulario de cada candidato | `evaluar_participants.stage_forms` | Se arma **una vez**, al empezar la etapa (`evaluar_begin_stage`), y queda guardado: qué preguntas, en qué orden y con qué orden de opciones. Recargar no lo cambia |
| Sorteo | `evaluar_begin_stage` | Estratificado por rasgo, así cada rasgo aporta en proporción a su tamaño. Las excluyentes entran siempre. Modelo en TypeScript: `sortearFormulario` (`lib/evaluar/puntaje.ts`), con 4 pruebas |
| Corrección | `evaluar_submit_stage` (056) | Cuenta solo las preguntas del formulario: el máximo de cada uno sale de lo que le tocó. Compara la opción elegida por texto, así que mezclar opciones no cambia puntajes |
| Qué viaja al navegador | `evaluar_load` (056) | Las etapas con azar que la persona todavía no empezó mandan solo `question_count`: el banco completo nunca llega al navegador |
| Editor | `ProcessEditor` → «Para que no se copien» | Tres opciones por etapa. Con candidatos rindiendo, la cantidad sorteada queda fija; el orden y la mezcla se pueden cambiar, porque los formularios ya armados no cambian |
| Escalas | — | Las opciones de una escala likert **nunca** se mezclan: el orden es parte de la pregunta |

**Etapas existentes:** no cambian. Todo viene apagado por defecto. Las
plantillas que se apliquen desde ahora ya vienen con el azar prendido.

## Ítems con figuras

- Tipo de pregunta nuevo, `figura`. La consigna (8 casillas de una matriz 3×3, o 4 de una serie) va en `evaluar_questions.figure`, y las opciones son códigos de figura, por ejemplo `triangulo.rayado.0.1.cruz.ii.g`.
- `lib/evaluar/figuras.ts` define los códigos, la descripción en palabras para el lector de pantalla y los generadores. `components/evaluar/Figura.tsx` los dibuja en SVG con el color del texto, así se ven bien en los tres temas.
- Cada ítem nace de una regla explícita, con semilla fija, así que hay una sola respuesta que la cumple. Las distractoras repiten una casilla vecina o cambian un atributo que la regla fija.
  - **Matrices:** siete reglas. Forma por fila y relleno por columna; forma y cantidad; línea que gira; cuadrado latino de formas; marca que recorre las esquinas; y dos reglas de tres atributos.
  - **Series:** siete reglas, del giro de una línea a dos atributos que cambian a la vez.
- Se revisó en el navegador con una página temporal, ya borrada: se ven como el ejemplo enviado (matriz con casilla «?» y opciones a–d dibujadas).
- Las preguntas de figuras no se editan desde el editor, porque tocar los códigos rompería el dibujo y la clave.

## Bancos nuevos: 500 ítems

| Prueba (`key`) | Ítems nuevos | Cada candidato recibe | Tipo | Cómo se hizo |
|---|---|---|---|---|
| Razonamiento abstracto con figuras (`matrices`) | 120 | 12 | figura, con correcta | Generado por regla |
| Series de figuras (`series_figuras`) | 60 | 10 | figura, con correcta | Generado por regla |
| Razonamiento numérico (`numerico_banco`) | 60 | 12 | opción, con correcta | Generado; la respuesta sale de la cuenta |
| Atención y precisión (`atencion_detalle`) | 60 | 15 | opción, con correcta | Generado (facturas, RUC, celulares, chapas, códigos y nombres casi iguales) |
| Cinco Grandes, versión ampliada (`big5_banco`) | 60, más los 25 de la corta | 40 (8 por rasgo) | likert | Redactados, mitad inversos |
| Competencias conductuales (`competencias`) | 60 | 36 (6 por competencia) | likert | Redactados, mitad inversos |
| Juicio situacional, versión ampliada (`sjt_banco`) | 40, más los 8 del corto | 12 | opción con puntos 3/2/1/0 | Redactados, con la mejor rotada de lugar |
| Entrevista por competencias, escrita (`entrevista_conductual`) | 40 | 4 | abierta | Redactados (situación, acción y resultado) |
| **Total** | **500** | | | |

Las cinco pruebas que ya existían también mezclan el orden (y las opciones,
donde corresponde) cuando se aplican desde ahora. El catálogo pasa de 5 a 13
pruebas. La landing y precios cuentan pruebas e ítems directamente del
catálogo.

### Control de calidad (`tests/evaluar/bancos.test.mjs`, 8 pruebas)

- Al menos 500 ítems nuevos.
- Figuras: 4 opciones distintas, una correcta, todos los códigos se pueden dibujar y describir, las tres dificultades presentes y ninguna matriz repetida.
- Numérico: **cada respuesta se recalcula desde el enunciado** (series, descuentos y reglas de tres).
- Atención: exactamente una opción idéntica al dato.
- Likert: al menos 4 ítems derechos y 4 inversos por rasgo, sin frases repetidas.
- Juicio situacional: cuatro opciones con 3, 2, 1 y 0 puntos, y la mejor en las cuatro posiciones a lo largo del banco.

## Límites y pendientes

- **Sin validación psicométrica.** Ningún banco nuevo tiene estudios de confiabilidad, validez ni baremo propio. Los textos de las plantillas lo dicen. Con datos reales, calcular el alfa por rasgo y la discriminación por ítem (I-5) antes de mostrar percentiles de estas pruebas.
- **Formas equivalentes:** el sorteo reparte por rasgo, pero no equilibra dificultad. En matrices, dos candidatos pueden recibir proporciones distintas de ítems de una, dos o tres reglas. Mejora propuesta: estratificar también por dificultad, guardándola en la pregunta.
- **Migración 056 sin aplicar.** Hasta aplicarla: las plantillas sin figuras se aplican sin azar (el código reintenta sin las columnas nuevas); las de figuras avisan que falta la 056; y el editor guarda las opciones de azar sin efecto.
- **SQL sin ejecutar:** `supabase/tests/evaluar-056.sql` (casos A a F).
- **Baremos:** `numerico` se comparte con el razonamiento corto, y los rasgos del Cinco Grandes ampliado con la versión corta. Es el mismo constructo con ítems distintos; con sorteo, cada persona ya responde ítems distintos de todos modos.
