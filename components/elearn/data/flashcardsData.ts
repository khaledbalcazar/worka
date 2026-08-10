import { Flashcard } from '../types';

export const FLASHCARDS_DATA: Flashcard[] = [
  { id: 'fc-1', front: '¿Cómo define el Artículo 1 de la Constitución al Estado paraguayo?', back: 'Estado social de derecho, unitario, indivisible y descentralizado.', category: 'Constitución', articleRef: 'Art. 1 CN' },
  { id: 'fc-2', front: '¿Cuáles son los 4 términos del sistema de poderes (Art. 3 CN)?', back: 'Separación, equilibrio, coordinación y recíproco control.', category: 'Constitución', articleRef: 'Art. 3 CN' },
  { id: 'fc-3', front: '¿Desde cuándo se protege el derecho a la vida en Paraguay?', back: 'En general, desde la concepción.', category: 'Constitución', articleRef: 'Art. 4 CN' },
  { id: 'fc-4', front: '¿Qué dice el Principio de Legalidad (Art. 9 CN)?', back: 'Nadie está obligado a hacer lo que la ley no ordena ni privado de lo que ella no prohíbe. Para el funcionario público: solo puede hacer lo autorizado por ley.', category: 'Constitución', articleRef: 'Art. 9 CN' },
  { id: 'fc-5', front: '¿Qué tres adjetivos debe tener la información según el Art. 28 CN?', back: 'Veraz, responsable y ecuánime.', category: 'Constitución', articleRef: 'Art. 28 CN' },
  { id: 'fc-6', front: '¿Qué garantía constitucional protege los datos en registros oficiales?', back: 'El Hábeas Data (Art. 135 CN), que permite pedir actualización, rectificación o destrucción.', category: 'Constitución', articleRef: 'Art. 135 CN' },
  { id: 'fc-7', front: '¿En qué plazo debe presentarse la DDJJ de Bienes (Art. 104 CN)?', back: 'Dentro de los 15 días de haber tomado posesión del cargo y al cesar en el mismo.', category: 'Constitución', articleRef: 'Art. 104 CN' },
  { id: 'fc-8', front: '¿Cuáles son los 3 eslabones de la responsabilidad del funcionario (Art. 106 CN)?', back: 'Responsabilidad personal -> Responsabilidad subsidiaria del Estado -> Derecho a repetir el pago.', category: 'Constitución', articleRef: 'Art. 106 CN' },

  { id: 'fc-9', front: '¿Cuáles son las condiciones para adquirir la Estabilidad Laboral (Art. 20 Ley 7445)?', back: '1) Ingreso por Concurso Público + 2) 2 años ininterrumpidos de servicio.', category: 'Ley 7445', articleRef: 'Art. 20 Ley 7445' },
  { id: 'fc-10', front: '¿Se pagan en dinero las vacaciones no gozadas en la función pública?', back: 'NO. No se compensan en dinero, pero son acumulables por 2 años (Art. 43.c).', category: 'Ley 7445', articleRef: 'Art. 43.c Ley 7445' },
  { id: 'fc-11', front: '¿Viola el trabajo personal el uso de Inteligencia Artificial (Art. 51.b)?', back: 'NO, siempre que se informe al superior y el servidor asuma la responsabilidad del contenido.', category: 'Ley 7445', articleRef: 'Art. 51.b Ley 7445' },
  { id: 'fc-12', front: '¿Cuáles son los límites de parentesco del Nepotismo (Art. 52.u)?', back: '4° de consanguinidad y 2° de afinidad. Excepción: si ingresa por Concurso Público.', category: 'Ley 7445', articleRef: 'Art. 52.u Ley 7445' },
  { id: 'fc-13', front: 'Diferencia entre Reiteración y Reincidencia en faltas leves (Ley 7445)', back: 'Reiteración = faltas leves DISTINTAS en 1 año. Reincidencia = la MISMA falta leve otra vez. Ambas se convierten en falta grave.', category: 'Ley 7445', articleRef: 'Arts. 59-61 Ley 7445' },

  { id: 'fc-14', front: '¿Cuál es el plazo para responder una solicitud de Información Pública (Ley 5282)?', back: '15 días hábiles, contados a partir del día siguiente de la presentación.', category: 'Ley 5282', articleRef: 'Art. 16 Ley 5282' },
  { id: 'fc-15', front: '¿Qué es la Resolución Ficta en la Ley 5282 (Art. 20)?', back: 'Si no responden en el plazo de 15 días hábiles, se entiende DENEGADA la solicitud.', category: 'Ley 5282', articleRef: 'Art. 20 Ley 5282' },
  { id: 'fc-16', front: '¿Pueden salir del archivo los libros u originales en la Ley 5282?', back: 'NUNCA. Los originales no salen; solo se entregan certificados o fotocopias autenticadas.', category: 'Ley 5282', articleRef: 'Art. 18 Ley 5282' },

  { id: 'fc-17', front: '¿Todos los días son hábiles en el Registro Civil (Art. 6 Ley 1266)?', back: 'SÍ. Todos los días son considerados hábiles para las inscripciones registrales.', category: 'Ley 1266', articleRef: 'Art. 6 Ley 1266' },
  { id: 'fc-18', front: '¿Qué requisitos debe reunir el Director General del REC (Art. 7 Ley 1266)?', back: 'Ser Abogado y tener edad mínima de 30 años.', category: 'Ley 1266', articleRef: 'Art. 7 Ley 1266' },
  { id: 'fc-19', front: '¿Qué sanción tiene inscribir un acta en un libro NO rubricado (Art. 21 Ley 1266)?', back: 'El acta es NULA y el Oficial es SEPARADO de su cargo.', category: 'Ley 1266', articleRef: 'Art. 21 Ley 1266' },
  { id: 'fc-20', front: '¿Qué 3 cosas prohíbe expresamente el Art. 26 al labrar un acta?', back: '1. Guarismos (cifras), 2. Abreviaturas, 3. Raspaduras (y no dejar espacios en blanco).', category: 'Ley 1266', articleRef: 'Art. 26 Ley 1266' },
  { id: 'fc-21', front: '¿Cuáles son los 5 elementos del Art. 27 presentes en TODA inscripción?', back: '1. Lugar/fecha/hora, 2. Comparecientes, 3. Naturaleza del acto, 4. Acreditación de identidad, 5. Firmas.', category: 'Ley 1266', articleRef: 'Art. 27 Ley 1266' },
  { id: 'fc-22', front: 'Diferencia entre Denuncia y Declaración de nacimiento (Ley 1266)', back: 'Denuncia = médicos/hospitales a los 7 días (NO inscribe). Declaración = padres a los 30d/60d (SÍ inscribe).', category: 'Ley 1266', articleRef: 'Arts. 52-53 Ley 1266' },
  { id: 'fc-23', front: '¿Hasta qué edad se permite la Inscripción Tardía administrativa de nacimiento?', back: 'Hasta los 15 AÑOS (Art. 54).', category: 'Ley 1266', articleRef: 'Art. 54 Ley 1266' },
  { id: 'fc-24', front: '¿En qué plazo debe declararse una defunción (Art. 95 Ley 1266)?', back: 'Dentro de las 24 HORAS de ocurrida o conocida.', category: 'Ley 1266', articleRef: 'Art. 95 Ley 1266' },
  { id: 'fc-25', front: 'Ventana de tiempo obligatoria para inhumar un cadáver (Art. 105 Ley 1266)', back: 'Mínimo 12 HORAS, máximo 36 HORAS del fallecimiento.', category: 'Ley 1266', articleRef: 'Art. 105 Ley 1266' },
  { id: 'fc-26', front: 'Diferenciá los 3 Remedios Registrales (Ley 1266 Cap. XI, XII, XIII)', back: 'RECONSTITUIR = el libro se perdió o destruyó. RECTIFICAR = hay un error o dato omitido. CONVALIDAR = falta una firma.', category: 'Ley 1266', articleRef: 'Arts. 114, 118, 122 Ley 1266' },

  { id: 'fc-27', front: 'Cadena de localización documental en el Archivo (Dto 19.102)', back: 'CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA.', category: 'Decretos', articleRef: 'Art. 39.h Dto 19.102' },
  { id: 'fc-28', front: '¿Cuántas dependencias orgánicas tiene la DGREC según el Decreto 3080/2015?', back: '14 dependencias (2 Conducción, 9 Apoyo, 3 Misionales).', category: 'Decretos', articleRef: 'Art. 1 Dto 3080/2015' },
  { id: 'fc-29', front: 'Requisitos específicos para ser Oficial del REC (Art. 58 Dto 19.102)', back: '1. Paraguayo NATURAL, 2. Mayoría de edad, 3. Residencia en el distrito, 4. Secundaria concluida, 5. Sin antecedentes penales, 6. Aprobar examen.', category: 'Decretos', articleRef: 'Art. 58 Dto 19.102' },

  { id: 'fc-30', front: '¿Cuáles son los 3 elementos de la Posesión de Estado de hijo (Art. 235 CC)?', back: 'Nomen, Tractatus y Fama (Uso del apellido, trato recíproco de hijo/padre y consideración social/familiar). Los 3 juntos.', category: 'Código Civil', articleRef: 'Art. 235 Código Civil' },
  { id: 'fc-31', front: '¿Qué 3 adjetivos definen la Unión de Hecho protegida en la Ley 1/1992 (Art. 83)?', back: 'ESTABLE, PÚBLICA y SINGULAR.', category: 'Ley 1/1992', articleRef: 'Art. 83 Ley 1/1992' },
  { id: 'fc-32', front: '¿Cuáles son los 5 Estados Civiles según la Ley 6618/2020?', back: '1. Soltero, 2. Casado, 3. Viudo, 4. Divorciado, 5. Concubino.', category: 'Ley 6618', articleRef: 'Art. 4 Ley 6618/2020' },
  { id: 'fc-33', front: '¿Cuáles son los 9 verbos operativos del Registro Civil?', back: 'Recopilar, Documentar, Archivar, Custodiar, Inscribir, Rectificar, Reconstituir, Convalidar, Certificar.', category: 'DGREC', articleRef: 'Considerandos Dto 19.102' }
];
