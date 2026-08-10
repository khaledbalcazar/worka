import { HardDataItem } from '../types';

export const HARD_DATA_ITEMS: HardDataItem[] = [
  // PLAZOS CLAVE LEY 1266
  { id: 'hd-1', law: 'Ley 1266', periodOrNumber: '24 horas', matter: 'Declarar la defunción ante el Oficial o Policía', article: 'Art. 95', category: 'plazo' },
  { id: 'hd-2', law: 'Ley 1266', periodOrNumber: '48 horas', matter: 'Expedición de certificados y testimonios de partidas', article: 'Art. 37', category: 'plazo' },
  { id: 'hd-3', law: 'Ley 1266', periodOrNumber: '12 a 36 horas', matter: 'Ventana temporal obligatoria para la inhumación del cadáver (mínimo 12h, máximo 36h)', article: 'Art. 105', category: 'plazo' },
  { id: 'hd-4', law: 'Ley 1266', periodOrNumber: '7° día', matter: 'Plazo para la DENUNCIA médica/hospitalaria de nacimiento (no inscribe)', article: 'Art. 52', category: 'plazo' },
  { id: 'hd-5', law: 'Ley 1266', periodOrNumber: '30 días Capital / 60 días Interior', matter: 'DECLARACIÓN oportuna de nacimiento por los padres (sí inscribe)', article: 'Art. 53, 54', category: 'plazo' },
  { id: 'hd-6', law: 'Ley 1266', periodOrNumber: 'Hasta 15 años', matter: 'Límite de la Inscripción Tardía administrativa de nacimiento', article: 'Art. 54', category: 'plazo' },
  { id: 'hd-7', law: 'Ley 1266', periodOrNumber: '3 días', matter: 'Vista a los contrayentes de la oposición al matrimonio', article: 'Art. 75', category: 'plazo' },
  { id: 'hd-8', law: 'Ley 1266', periodOrNumber: '90 días', matter: 'Caducidad del poder especial para contraer matrimonio', article: 'Art. 80.i', category: 'plazo' },
  { id: 'hd-9', law: 'Ley 1266', periodOrNumber: '8 días', matter: 'Publicación de avisos en puertas de la oficina para matrimonio in extremis', article: 'Art. 85', category: 'plazo' },
  { id: 'hd-10', law: 'Ley 1266', periodOrNumber: '15 días', matter: 'Remisión de reconocimientos de hijos al Archivo Central', article: 'Art. 67', category: 'plazo' },
  { id: 'hd-11', law: 'Ley 1266', periodOrNumber: '3 meses', matter: 'Frecuencia con que Cónsules envían copias de inscripciones a la Dirección General', article: 'Art. 42', category: 'plazo' },
  { id: 'hd-12', law: 'Ley 1266', periodOrNumber: '5 años', matter: 'Unión concubinaria previa para casarse con dispensa de formalidades', article: 'Art. 86', category: 'plazo' },
  { id: 'hd-13', law: 'Ley 1266', periodOrNumber: '1 a 15 de cada mes', matter: 'Depósito de las recaudaciones de tasas por los Oficiales', article: 'Art. 16', category: 'plazo' },

  // PLAZOS LEY 7445 / 5282 / CN
  { id: 'hd-14', law: 'Constitución Nacional', periodOrNumber: '15 días', matter: 'Presentación de Declaración Jurada de Bienes al asumir y cesar', article: 'Art. 104', category: 'plazo' },
  { id: 'hd-15', law: 'Ley 7445', periodOrNumber: '6 meses', matter: 'Período de prueba laboral con nombramiento provisorio', article: 'Art. 18', category: 'plazo' },
  { id: 'hd-16', law: 'Ley 7445', periodOrNumber: '2 años ininterrumpidos', matter: 'Requisito de tiempo + concurso público para la Estabilidad Laboral', article: 'Art. 20', category: 'plazo' },
  { id: 'hd-17', law: 'Ley 7445', periodOrNumber: '30 días corridos', matter: 'Permanencia obligatoria en el puesto tras presentar renuncia', article: 'Art. 51.j', category: 'plazo' },
  { id: 'hd-18', law: 'Ley 7445', periodOrNumber: '10 días hábiles', matter: 'Recurso de reconsideración por sanción de falta leve', article: 'Art. 63', category: 'plazo' },
  { id: 'hd-19', law: 'Ley 5282', periodOrNumber: '15 días hábiles', matter: 'Plazo para que la fuente pública responda solicitud de información', article: 'Art. 16', category: 'plazo' },
  { id: 'hd-20', law: 'Ley 5282', periodOrNumber: '60 días', matter: 'Plazo para interponer acción judicial por denegación de información', article: 'Art. 24', category: 'plazo' },

  // PLAZOS CÓDIGO CIVIL Y LEY 1/92
  { id: 'hd-21', law: 'Código Civil', periodOrNumber: '180 días', matter: 'Piso mínimo desde la boda para presumir hijo matrimonial', article: 'Art. 225', category: 'numero' },
  { id: 'hd-22', law: 'Código Civil', periodOrNumber: '300 días', matter: 'Techo máximo desde disolución de matrimonio para presumir hijo matrimonial / Plazo de viudez', article: 'Art. 225, Ley 1/92 Art. 19', category: 'numero' },
  { id: 'hd-23', law: 'Código Civil', periodOrNumber: '60 días', matter: 'Impugnación de paternidad desde conocimiento del parto / Nulidad por vicio del consentimiento / Error o fraude en reconocimiento', article: 'Arts. 182, 239, 243', category: 'numero' },
  { id: 'hd-24', law: 'Ley 1/1992', periodOrNumber: '4 años', matter: 'Concubinato continuo para nacimiento de comunidad de gananciales y derechos hereditarios', article: 'Arts. 84, 91', category: 'plazo' },
  { id: 'hd-25', law: 'Ley 1/1992', periodOrNumber: '10 años', matter: 'Concubinato continuo para INSCRIBIR la unión y equipararla a matrimonio', article: 'Art. 86', category: 'plazo' },

  // COMPETENCIAS
  { id: 'hd-26', law: 'Ley 1266', periodOrNumber: 'Director General', matter: 'Competencia exclusiva para Convalidar actas, ordenar Reconstitución y Rectificación administrativa con dictamen previo', article: 'Art. 9.d', category: 'competencia' },
  { id: 'hd-27', law: 'Código Civil', periodOrNumber: 'Juez de 1ª Instancia', matter: 'Unico competente para autorizar cambios o adiciones en el nombre o apellido', article: 'Art. 42 CC', category: 'competencia' },
  { id: 'hd-28', law: 'Decreto 19.102', periodOrNumber: 'Director General', matter: 'Oficial del REC con jurisdicción y competencia en TODO EL TERRITORIO nacional', article: 'Arts. 7, 9.g', category: 'competencia' },
  { id: 'hd-29', law: 'Decreto 19.102', periodOrNumber: 'Secretario General', matter: 'Oficial del REC con jurisdicción y competencia en la CAPITAL de la República', article: 'Art. 13', category: 'competencia' },

  // SANACIONES Y SANCIONES
  { id: 'hd-30', law: 'Ley 1266', periodOrNumber: 'Separación del cargo + Nulidad', matter: 'Sanción por efectuar inscripciones en libros NO rubricados por la Dirección General', article: 'Art. 21', category: 'sancion' },
  { id: 'hd-31', law: 'Ley 1266', periodOrNumber: 'Destitución', matter: 'Sanción al Oficial que celebra matrimonio conociendo impedimento o siendo incompetente', article: 'Arts. 78, 88', category: 'sancion' },
  { id: 'hd-32', law: 'Ley 7445', periodOrNumber: 'Multa 1 a 5 días', matter: 'Sanción disciplinaria por falta leve (ej. 2 ausencias injustificadas al mes)', article: 'Art. 60', category: 'sancion' },
  { id: 'hd-33', law: 'Ley 7445', periodOrNumber: 'Destitución e inhabilitación hasta 5 años', matter: 'Sanción máxima por falta grave (ej. 3 ausencias consecutivas, corrupción, violencia laboral, nepotismo)', article: 'Art. 62', category: 'sancion' }
];

export const COMPETENCIA_MAP = [
  { act: 'Convalidar acta sin firma de oficial', authority: 'Director General del REC', rule: 'Art. 122 Ley 1266' },
  { act: 'Rectificación administrativa por error material', authority: 'Dirección General por resolución fundada con dictamen de Asesoría Jurídica', rule: 'Art. 118 Ley 1266' },
  { act: 'Cambio de nombre de pila o apellido', authority: 'Juez de 1ª Instancia en lo Civil (Solo por justa causa)', rule: 'Art. 42 Código Civil' },
  { act: 'Resolver oposición al matrimonio contestada', authority: 'Juez de 1ª Instancia en lo Civil (Juicio sumario)', rule: 'Art. 75 Ley 1266' },
  { act: 'Nombrar Oficial del Registro Civil', authority: 'Decreto del Poder Ejecutivo (Presidente de la República)', rule: 'Art. 50 Dto. 19.102' },
  { act: 'Inscribir unión de hecho tras 10 años', authority: 'Encargado del Registro del Estado Civil o Juez de Paz', rule: 'Art. 86 Ley 1/1992' },
  { act: 'Firmar providencias de mero trámite', authority: 'Secretario General de la DGREC', rule: 'Art. 15 Dto. 19.102' },
  { act: 'Aplicar sanciones por faltas graves en función pública', authority: 'Máxima Autoridad Institucional previo sumario administrativo', rule: 'Art. 64 Ley 7445' }
];
