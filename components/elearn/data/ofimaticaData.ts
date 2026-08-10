import { OfimaticaItem } from '../types';

export const OFIMATICA_ITEMS: OfimaticaItem[] = [
  // WORD
  { id: 'ofi-1', app: 'Word', title: 'Guardar vs. Guardar como', routeOrShortcut: 'Ctrl + G (Guardar) / F12 (Guardar como)', description: 'Guardar actualiza el archivo existente. Guardar como permite cambiar la ubicación, el nombre o el formato (.pdf, .docx, .odt, .rtf).', category: 'Archivos' },
  { id: 'ofi-2', app: 'Word', title: 'Formatos de Texto básicos', routeOrShortcut: 'Ctrl + N (Negrita) / Ctrl + K (Cursiva) / Ctrl + S (Subrayado)', description: 'Modificadores de fuente para resaltar texto en actas e informes administrativos.', category: 'Formato' },
  { id: 'ofi-3', app: 'Word', title: 'Salto de página vs. Salto de sección', routeOrShortcut: 'Ctrl + Enter (Salto página)', description: 'Salto de página pasa al folio siguiente. Salto de sección permite cambiar orientación (A4 vertical a horizontal) o encabezados independientes.', category: 'Diseño' },
  { id: 'ofi-4', app: 'Word', title: 'Alineación de Párrafo', routeOrShortcut: 'Ctrl + J (Justificar) / Ctrl + T (Centrar) / Ctrl + Q (Izquierda)', description: 'Las notas oficiales y textos de actas se redactan con texto Justificado para alineación limpia en ambos márgenes.', category: 'Párrafos' },
  { id: 'ofi-5', app: 'Word', title: 'Buscar y Reemplazar', routeOrShortcut: 'Ctrl + B (Buscar) / Ctrl + L (Reemplazar)', description: 'Herramienta clave para corregir términos erróneos en documentos extensos o plantillas.', category: 'Revisión' },
  { id: 'ofi-6', app: 'Word', title: 'Revisión Ortográfica y Gramatical', routeOrShortcut: 'F7', description: 'Comprobación de ortografía en idioma Español (Paraguay). Recuerda que las actas exigen la mayor escrupulosidad.', category: 'Revisión' },

  // EXCEL
  { id: 'ofi-7', app: 'Excel', title: 'Referencias Relativas (A1) vs. Absolutas ($A$1)', routeOrShortcut: 'Tecla F4 al editar celda', description: 'Una referencia relativa cambia al copiar la fórmula. Una absoluta ($A$1) fija la celda para que no se mueva al arrastrar.', category: 'Fórmulas' },
  { id: 'ofi-8', app: 'Excel', title: 'Fórmula de Búsqueda Documental', routeOrShortcut: '=BUSCARV(valor, tabla, indicador_col, FALSO)', description: 'Permite buscar el número de Caja o Tomo correspondiente a una cédula o nombre en el inventario general.', category: 'Búsqueda' },
  { id: 'ofi-9', app: 'Excel', title: 'Fórmulas de Conteo y Suma Condicional', routeOrShortcut: '=CONTAR.SI(rango, criterio) / =SUMAR.SI()', description: 'Cuenta cuántas solicitudes o partidas cumplen con un criterio específico (ej. cuántas inscripciones son de este mes).', category: 'Estadística' },
  { id: 'ofi-10', app: 'Excel', title: 'Filtrar Datos y Autofiltro', routeOrShortcut: 'Ctrl + Shift + L', description: 'Activa las flechas en los encabezados para filtrar inscripciones por año, distrito o tipo de acto registral.', category: 'Datos' },

  // POWERPOINT & OUTLOOK
  { id: 'ofi-11', app: 'PowerPoint', title: 'Iniciar Presentación con Diapositivas', routeOrShortcut: 'F5 (desde el inicio) / Shift + F5 (desde actual)', description: 'Modo pantalla completa para exposiciones o inducción institucional.', category: 'Presentación' },
  { id: 'ofi-12', app: 'Outlook', title: 'Copia Informativa (CC) vs. Copia Oculta (CCO)', routeOrShortcut: 'Campos CC y CCO al enviar correo', description: 'CC envía copia visible a todos. CCO oculta las direcciones de correo para proteger la privacidad de los destinatarios (Art. 33 CN).', category: 'Correo' }
];
