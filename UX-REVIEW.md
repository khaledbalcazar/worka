# Revisión de UX de Worka

Fecha: 7 de octubre de 2026.

Revisión acotada al buscador de inicio, ingreso/registro, navegación móvil,
postulación y campana de notificaciones. Se inspeccionó el código y se probaron
los flujos principales en Chromium, en modo demostración, a 390 × 844 y
1440 × 1000. No representa una auditoría completa de todos los módulos.

| Prioridad | Problema verificado | Corrección |
| --- | --- | --- |
| Alta | El buscador permitía seleccionar contratos o modalidades incompatibles; la URL conservaba solo el último valor aunque ambos filtros parecían activos. | Selección exclusiva dentro de cada categoría; las categorías diferentes se pueden combinar. |
| Media | Las sugerencias se elegían con `mousedown`, sin funcionar al activarlas con Enter. | Selección con clic y teclado; cierre al salir del buscador y con Escape desde el campo. |
| Alta | Las hojas móviles estaban fuera de pantalla pero sus controles seguían en el recorrido del teclado. No contenían el foco ni cerraban con Escape. | Diálogo modal nativo compartido, recorrido de foco contenido, restauración al disparador, cierre con Escape y fondo inactivo. También se cierran al cambiar a escritorio. |
| Media | La hoja de postulación no tenía un cierre visible; las respuestas Sí/No no comunicaban su selección a lectores de pantalla. | Botón Cerrar y estado `aria-pressed`; respuestas bloqueadas mientras se envía. |
| Alta | El ingreso dependía de placeholders, carecía de formulario y permitía enviar correos inválidos. | Etiquetas visibles, envío nativo con Enter, validación de campos, autocompletado de contraseñas y errores anunciados. |
| Media | La postulación prometía notificaciones por WhatsApp aunque la integración está pendiente en el código. | Mensajes que dirigen al seguimiento de postulaciones en Worka. Compartir por WhatsApp se conserva. |
| Media | La campana borraba el contador antes de confirmar la escritura e ignoraba errores de base de datos. El panel no cerraba con Escape ni clic exterior. | Confirmación antes de borrar el contador, mensaje de error con reintento al reabrir, cierre exterior/Escape y estado expandido accesible. |
| Media | Las notificaciones sin destino usaban `href="#"`, lo que podía saltar al inicio. | Se presentan como contenido sin enlace. El panel ajusta su ancho a la pantalla. |

## Validación

- TypeScript: `npx tsc --noEmit`, correcto.
- ESLint sobre los componentes modificados: sin errores ni advertencias.
- ESLint sobre `app/actions.ts`: sin errores; advertencia previa por `BadgeId` no utilizado.
- Chromium: filtros exclusivos y URL coherente, sugerencias por teclado,
  apertura/cierre de ambas hojas, recorrido con Tab, Escape y restauración de
  foco, etiquetas y autocompletado de ingreso/registro, rechazo de formato de
  email inválido y ausencia de hojas visibles en escritorio. Sin errores JavaScript.
- `git diff --check`: correcto.

## Límites de la revisión

No se verificaron autenticación real, OAuth, entrega de correos ni persistencia
real de notificaciones: el entorno de demostración no tiene Supabase conectado.
La longitud mínima de contraseña se indica para el registro; una política de
contraseñas personalizada en Supabase deberá reflejarse también en esa ayuda.
No se publicaron los cambios.
