# Auditoría de Worka Evaluar — 23/10/2026

Registro persistente para continuar la auditoría en otra sesión. Cubre Worka
Evaluar (`/evaluar`, panel `/evaluar/app`, rendición `/evaluar/e/[token]`) en el
commit base `3fba1d5` y los cambios sin commitear de esta sesión.

**No es una auditoría completa.** Todo lo que depende de la base de datos real
(RLS efectiva, funciones SQL, correos, Storage) se revisó **leyendo el código y
las migraciones**, no ejecutándolo: sin credenciales de Supabase la app corre en
modo demo, donde los procesos, el tablero y la rendición del candidato no tienen
datos y devuelven 404. Ver [09-pendientes.md](09-pendientes.md).

| Documento | Contenido |
|---|---|
| [01-mapa-sistema.md](01-mapa-sistema.md) | Arquitectura, flujo de datos y cobertura real de esta revisión |
| [02-hallazgos.md](02-hallazgos.md) | Hallazgos con ID, severidad, evidencia, causa, solución y estado |
| [03-antecedentes.md](03-antecedentes.md) | Los 12 antecedentes de la revisión del 22/10/2026, clasificados |
| [04-matriz-competitiva.md](04-matriz-competitiva.md) | TestGorilla, ClassMarker y Testportal con fuentes y fechas |
| [05-correcciones.md](05-correcciones.md) | Qué se cambió, por qué y cómo se verificó |
| [06-ia-y-calidad.md](06-ia-y-calidad.md) | Calidad de evaluación, IA e integridad |
| [07-innovacion.md](07-innovacion.md) | 10 oportunidades y las 3 apuestas |
| [08-roadmap.md](08-roadmap.md) | Orden propuesto de trabajo |
| [09-pendientes.md](09-pendientes.md) | Pendientes, bloqueos y decisiones de producto abiertas |

## Resumen ejecutivo

- **Lo más grave estaba en la corrección del lado de la base**
  (`evaluar_submit_stage`, migración 024). Una etapa se podía entregar más de
  una vez y cada entrega **sumaba** al puntaje y avanzaba de etapa, así que un
  doble clic o el reloj que vence junto con el botón contaban doble y salteaban
  la etapa siguiente. Tampoco se miraba si el proceso estaba publicado, el reloj
  era solo del navegador y la entrega pisaba la ruta del video. Todo eso se
  corrige en `supabase/migration-053.sql`, que **no se ejecutó**.
- **Privacidad:** el detalle que el reclutador escribía al descartar, que la
  pantalla presenta como interno, se guardaba en `outcome_note`, el texto que el
  candidato ve en su enlace. Ya está corregido en el código.
- **Recorridos rotos:** entrar a la evaluación desde una vacante de Worka
  fallaba siempre por RLS. Las decisiones de la empresa no llegaban a la línea de
  tiempo del candidato porque falta una policy de insert. Además, una etapa sin
  preguntas dejaba al candidato trabado.
- **Pruebas:** no había ninguna. Se agregaron 19 casos de referencia con
  resultados calculados a mano (`npm run test:evaluar`), y todos pasan.
  `tsc` y `eslint` daban 0 errores antes de los cambios y siguen en 0 después.

## Cómo seguir

1. Aplicar la 053 en una base **local o de staging** y correr
   `supabase/tests/evaluar-053.sql` (termina en ROLLBACK).
2. Resolver las decisiones abiertas de [09-pendientes.md](09-pendientes.md)
   (versionado de procesos publicados, escala likert, baremos y plan de la
   exportación).
3. Recorrer en staging los flujos de [05-correcciones.md](05-correcciones.md)
   § «Verificación manual pendiente».
