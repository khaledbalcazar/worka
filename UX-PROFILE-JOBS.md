# Mi perfil y Empleos: mejoras y próximos pasos

## Implementado

### Mi perfil

- Una sola medida de completitud, actualizada tras guardar presentación,
  datos, foto, CV o referencias confirmadas. Cada paso lleva a su sección.
- Accesos a Datos, Mi CV, Preferencias, Referencias y Configuración.
- Presentación con guardado explícito, contador de caracteres, estado de
  cambios pendientes y opción de descartar. Un fallo de conexión conserva el
  borrador y no anuncia éxito.
- Edición de datos con etiquetas accesibles, validación básica y actualización
  inmediata de la tarjeta de presentación.
- Preferencias de modalidad y disponibilidad para trabajar en otras ciudades,
  utilizando campos existentes en la base de datos.
- Preferencias y eliminaciones de CV/referencias solo se reflejan cuando la
  operación confirma éxito. No se descarta el formulario de referencia si falla.
- Reemplazar CV mantiene el documento anterior hasta que la subida tiene éxito.
  Valida PDF y límite de 5 MB antes de enviar.
- Referencias creadas con su identificador real; el enlace de WhatsApp queda a
  mano para enviarlo. Se evita abrir WhatsApp automáticamente tras una operación
  asíncrona, que los navegadores pueden bloquear.
- Diálogos accesibles en móvil y escritorio; el enlace de perfil público usa
  el dominio configurado de Worka. Ayudas sin estadísticas no sustentadas.

### Empleos

- Búsqueda y filtros en la URL: sobreviven a recarga y navegación al detalle;
  se pueden copiar para compartir.
- Búsqueda tolerante a espacios, mayúsculas y tildes.
- Orden por recomendaciones/destacadas, fecha o urgencia.
- Filtro para ocultar vacantes de Worka ya postuladas y contratos Pasantía/Freelance.
- Contador total con desglose entre Worka y fuentes externas.
- Las vacantes externas respetan modalidad y contrato; se excluyen cuando no
  pueden confirmar requisitos de primer empleo o empresa verificada.
- Estado vacío con acciones para limpiar la búsqueda completa o crear una alerta.
- Alertas con palabra clave, ciudad, rubro y modalidad precargados desde la
  búsqueda. Se explicita cuáles filtros admite la alerta actual.
- Hoja de filtros con cierre por Escape y foco controlado.

## Funciones que conviene agregar después

| Prioridad | Función | Beneficio | Trabajo necesario |
| --- | --- | --- | --- |
| 1 | Experiencia, educación y habilidades estructuradas | Completar el perfil por etapas, generar el CV con esos datos y mejorar la búsqueda de talento. | Definir campos y tablas, migración de Supabase, permisos RLS, formularios y actualización del generador de CV. |
| 2 | Comparar vacantes guardadas | Ver salario, modalidad, ubicación, horario y requisitos de 2–3 opciones lado a lado. | Vista de comparación, manejo de datos faltantes y selección desde Guardadas. |
| 3 | Explicar recomendaciones | Mostrar motivos concretos como “en tu ciudad” o “del rubro que elegiste”, en lugar de depender de un porcentaje. | Compartir criterios de afinidad y mostrarlos en la tarjeta y detalle; medir utilidad antes de ampliar el ranking. |

## Validación y límites

- Compilación de producción y TypeScript: correctos.
- ESLint de los componentes, páginas y pruebas modificados: sin errores.

- Cinco pruebas de regresión de búsqueda: normalización, filtros de externas,
  primer empleo/verificación, postulaciones y salario ausente.
- Chromium en móvil y escritorio: URL y persistencia de filtros, orden, alerta
  precargada, recuperación del estado vacío, un solo progreso, guardado/descarte,
  actualización de datos, preferencias y diálogos. Sin desborde horizontal ni
  errores JavaScript en los flujos probados.
- Fallo de red simulado al guardar la presentación: el borrador se conserva y
  no aparece confirmación falsa.
- El entorno de demostración no prueba persistencia real en Supabase ni entrega
  de alertas. Las nuevas preferencias usan columnas existentes; no requieren
  migración. No se implementaron las funciones de la tabla de próximos pasos.
