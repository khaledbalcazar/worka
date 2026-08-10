import { QuizQuestion } from '../types';

export const QUIZ_BANK: QuizQuestion[] = [
  // BLOQUE A - CONSTITUCIÓN NACIONAL
  {
    id: 'q-a1',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Cómo define el Artículo 1 de la Constitución Nacional al Estado paraguayo?',
    options: [
      'Estado federal, unitario y representativo',
      'Estado social de derecho, unitario, indivisible y descentralizado',
      'Estado democrático, centralizado y confesional',
      'República parlamentaria, soberana y corporativa'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 1 CN establece literalmente que la República del Paraguay se constituye en Estado social de derecho, unitario, indivisible y descentralizado.',
    legalReference: 'Art. 1 Constitución Nacional 1992'
  },
  {
    id: 'q-a2',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Desde qué momento se garantiza la protección del derecho a la vida según el Artículo 4 de la Constitución?',
    options: [
      'Desde la inscripción en el Registro Civil',
      'Desde el nacimiento con vida comprobado',
      'En general, desde la concepción',
      'Desde las 24 horas posteriores al parto'
    ],
    correctAnswerIndex: 2,
    explanation: 'El Art. 4 CN establece que el derecho a la vida es inherente a la persona humana y se garantiza su protección, en general, desde la concepción.',
    legalReference: 'Art. 4 Constitución Nacional'
  },
  {
    id: 'q-a3',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Qué garantía constitucional permite solicitar la actualización, rectificación o destrucción de datos erróneos en registros oficiales?',
    options: [
      'El Hábeas Corpus',
      'El Amparo',
      'El Hábeas Data',
      'La Acción de Inconstitucionalidad'
    ],
    correctAnswerIndex: 2,
    explanation: 'El Art. 135 CN establece el Hábeas Data como la garantía específica para acceder a datos en registros oficiales y exigir su actualización, rectificación o destrucción.',
    legalReference: 'Art. 135 Constitución Nacional'
  },
  {
    id: 'q-a4',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿En qué plazo debe presentarse la Declaración Jurada de Bienes y Rentas según el Artículo 104 de la Constitución?',
    options: [
      'Dentro de los 30 días hábiles de ingresar',
      'Dentro de los 15 días de haber tomado posesión y al cesar en el cargo',
      'Anualmente cada mes de enero',
      'Dentro de los 60 días de la notificación'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 104 CN impone la obligación de prestar declaración jurada dentro de los 15 días de asumir y en igual término al cesar.',
    legalReference: 'Art. 104 Constitución Nacional'
  },
  {
    id: 'q-a5',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Cuál es la única excepción constitucional a la prohibición de doble remuneración en la función pública?',
    options: [
      'Las comisiones en entes autárquicos',
      'El ejercicio de la docencia',
      'Las consultorías técnicas privadas',
      'El cobro de viáticos extraordinarios'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 105 CN prohíbe percibir más de un sueldo del Estado, con excepción de los que provengan del ejercicio de la docencia.',
    legalReference: 'Art. 105 Constitución Nacional'
  },

  // BLOQUE B - LEY 7445/2025 FUNCIÓN PÚBLICA
  {
    id: 'q-b1',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Cuál es la autoridad de aplicación de la Ley 7445/2025 en el ámbito del Poder Ejecutivo?',
    options: [
      'El Ministerio de Justicia',
      'El Ministerio de Economía y Finanzas (MEF) a través del VCHGO',
      'La Contraloría General de la República',
      'La Secretaría de la Función Pública autárquica'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 4 de la Ley 7445 otorga la competencia regulatoria sobre el Poder Ejecutivo al Ministerio de Economía y Finanzas (MEF).',
    legalReference: 'Art. 4 Ley 7445/2025'
  },
  {
    id: 'q-b2',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Qué condiciones se exigen conjuntamente para adquirir la Estabilidad Laboral según el Artículo 20 de la Ley 7445?',
    options: [
      'Tener 5 años de antigüedad continua únicamente',
      'Ingreso por concurso público + haber cumplido al menos 2 años ininterrumpidos de servicio',
      'Aprobar la evaluación de desempeño durante 1 año',
      'Ser nombrado por decreto presidencial sin importar la vía'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 20 exige las dos condiciones: 1. Haber ingresado por concurso público, y 2. Haber cumplido al menos 2 años ininterrumpidos de servicio.',
    legalReference: 'Art. 20 Ley 7445/2025'
  },
  {
    id: 'q-b3',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: 'Respecto al uso de Inteligencia Artificial en el trabajo, ¿qué establece el Artículo 51.b de la Ley 7445?',
    options: [
      'Prohíbe totalmente el uso de herramientas de IA en la administración pública',
      'No viola la obligación de trabajo personal si es informado y el servidor se hace personalmente responsable del contenido',
      'Sanciona con destitución a quien use herramientas digitales generativas',
      'Sustituye la firma del funcionario por una firma generada por IA'
    ],
    correctAnswerIndex: 1,
    explanation: 'Novedad de la Ley 7445: El uso de IA no viola el trabajo personal si el servidor lo informa y asume personalmente la responsabilidad del contenido.',
    legalReference: 'Art. 51.b Ley 7445/2025'
  },
  {
    id: 'q-b4',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Hasta qué grado de parentesco alcanza la prohibición de Nepotismo en puestos de confianza (Art. 52.u)?',
    options: [
      'Hasta el 2° grado de consanguinidad únicamente',
      'Hasta el 4° grado de consanguinidad y 2° de afinidad, salvo que sea mediante concurso público',
      'Hasta el 3° grado de consanguinidad y 3° de afinidad sin excepciones',
      'Solo al cónyuge e hijos directos'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 52.u prohíbe nombrar en puestos de confianza a cónyuge, concubino o parientes hasta el 4° de consanguinidad y 2° de afinidad, salvo concurso público.',
    legalReference: 'Art. 52.u Ley 7445/2025'
  },
  {
    id: 'q-b5',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Quién aplica las sanciones por faltas LEVES y qué recurso procede según la Ley 7445?',
    options: [
      'El Juez Penal previo sumario administrativo',
      'El titular de la Unidad de Gestión de Personas sin sumario / Recurso de Reconsideración en 10 días hábiles',
      'La Máxima Autoridad tras sumario de 60 días',
      'El Ministerio de Economía y Finanzas sin recurso'
    ],
    correctAnswerIndex: 1,
    explanation: 'Arts. 60 y 63: Las faltas leves las aplica el titular de la UGDDP sin sumario previo; procede recurso de reconsideración dentro de 10 días hábiles.',
    legalReference: 'Arts. 60, 63 Ley 7445/2025'
  },

  // BLOQUE C - LEY 5282/2014 ACCESO A INFORMACIÓN
  {
    id: 'q-c1',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿En qué plazo debe responder la fuente pública a una solicitud de información según el Artículo 16 de la Ley 5282?',
    options: [
      '10 días corridos desde la recepción',
      '15 días hábiles, contados a partir del día siguiente de la presentación',
      '30 días naturales prorrogables',
      '48 horas hábiles'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 16 fija el plazo de quince (15) días hábiles, contados a partir del día siguiente de la presentación.',
    legalReference: 'Art. 16 Ley 5282/2014'
  },
  {
    id: 'q-c2',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: 'Si la fuente pública no responde dentro del plazo legal, ¿cómo se interpreta su silencio (Art. 20)?',
    options: [
      'Resolución ficta positiva (se considera aceptada)',
      'Resolución ficta denegatoria (se entiende denegada)',
      'Se prorroga automáticamente por 15 días más',
      'Se archiva la solicitud por abandono'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 20: Si no existe respuesta dentro del plazo, se entenderá que la solicitud fue DENEGADA (resolución ficta denegatoria), permitiendo la vía judicial.',
    legalReference: 'Art. 20 Ley 5282/2014'
  },
  {
    id: 'q-c3',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿Se requiere justificar las razones o motivos por los que se solicita información pública (Art. 4)?',
    options: [
      'Sí, debe acreditarse un interés legítimo fundamentado',
      'No. Se accede en forma gratuita y sin necesidad de justificar las razones',
      'Solo si el solicitante es persona jurídica o periodista',
      'Sí, pagando un arancel proporcional al trámite'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 4: Cualquier persona puede acceder a la información pública en forma gratuita y SIN necesidad alguna de justificar las razones.',
    legalReference: 'Art. 4 Ley 5282/2014'
  },

  // BLOQUE D - LEY 1266/1987 REGISTRO CIVIL
  {
    id: 'q-d1',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Qué establece el Artículo 6 de la Ley 1266 sobre los días para realizar inscripciones?',
    options: [
      'Se atienden únicamente de lunes a viernes en horario de oficina',
      'Todos los días son considerados HÁBILES para las inscripciones en el Registro Civil',
      'Los sábados y domingos son inhábiles salvo orden judicial',
      'Se requieren días hábiles procesales de lunes a sábado'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 6 Ley 1266: "Todos los días son considerados hábiles para las inscripciones en el Registro del Estado Civil". Se organizan turnos.',
    legalReference: 'Art. 6 Ley 1266/1987'
  },
  {
    id: 'q-d2',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Cuáles son las prohibiciones formales expresas que impone el Artículo 26 al labrar un acta?',
    options: [
      'No usar tinta negra ni papel sellado',
      'No usar guarismos (cifras), no usar abreviaturas, no hacer raspaduras y no dejar espacios en blanco',
      'No escribir en letra imprenta ni usar sellos secos',
      'No incluir nombres de testigos ni hora de firma'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 26 prohibiciones formales: No usar guarismos (números en cifras), no usar abreviaturas, no hacer raspaduras, y no dejar espacios en blanco.',
    legalReference: 'Art. 26 Ley 1266/1987'
  },
  {
    id: 'q-d3',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Cuál es la diferencia entre DENUNCIA y DECLARACIÓN de nacimiento en la Ley 1266?',
    options: [
      'Son exactamente lo mismo con dos nombres distintos',
      'La Denuncia la hace el personal médico (7 días, NO inscribe); la Declaración la hacen los padres (30/60 días, SÍ produce la inscripción)',
      'La Denuncia se hace ante el Juez; la Declaración ante la Comisaría',
      'La Declaración vence a los 7 días y la Denuncia a los 15 años'
    ],
    correctAnswerIndex: 1,
    explanation: 'Arts. 52 y 53: La denuncia médica (7 días) no tiene valor como inscripción. La declaración de los padres/parientes (30d Capital / 60d interior) es la que produce la inscripción.',
    legalReference: 'Arts. 52, 53, 54 Ley 1266/1987'
  },
  {
    id: 'q-d4',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Cuántos testigos se requieren cuando un matrimonio se celebra FUERA de la oficina registral (Art. 81)?',
    options: ['2 testigos', '3 testigos', '4 testigos', '5 testigos'],
    correctAnswerIndex: 2,
    explanation: 'Art. 81: Si el matrimonio se celebra fuera de la oficina registral, se requiere la presencia de CUATRO (4) TESTIGOS.',
    legalReference: 'Art. 81 Ley 1266/1987'
  },

  // BLOQUE E - DEFUNCIONES, CERTIFICADOS Y REMEDIOS
  {
    id: 'q-e1',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: '¿En qué plazo debe declararse una defunción según el Artículo 95 de la Ley 1266?',
    options: ['Dentro de las 12 horas', 'Dentro de las 24 HORAS de ocurrida o de tener conocimiento', 'Dentro de los 3 días hábiles', 'Dentro de las 48 horas'],
    correctAnswerIndex: 1,
    explanation: 'Art. 95: La defunción debe declararse obligatoriamente dentro de las veinticuatro (24) horas.',
    legalReference: 'Art. 95 Ley 1266/1987'
  },
  {
    id: 'q-e2',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: '¿Cuál es la ventana temporal obligatoria para la inhumación del cadáver (Art. 105)?',
    options: ['Inmediatamente tras el fallecimiento', 'No antes de 12 HORAS ni después de 36 HORAS del fallecimiento', 'Entre las 24 y las 48 horas', 'A las 6 horas de ocurrido el deceso'],
    correctAnswerIndex: 1,
    explanation: 'Art. 105: El permiso de inhumación no podrá ejecutarse antes de 12 horas ni después de 36 horas del fallecimiento.',
    legalReference: 'Art. 105 Ley 1266/1987'
  },
  {
    id: 'q-e3',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: '¿Cuándo procede el remedio de la RECONSTITUCIÓN de libros o partidas (Capítulo XI)?',
    options: [
      'Cuando un dato del acta está mal escrito',
      'Cuando el libro o la partida se perdió, alteró, inutilizó o destruyó total o parcialmente',
      'Cuando falta la firma del Oficial del Registro',
      'Cuando el ciudadano desea cambiar su apellido'
    ],
    correctAnswerIndex: 1,
    explanation: 'Cap. XI (Arts. 114-116): La reconstitución procede cuando los libros o partidas se hayan perdido, destruido, alterado o inutilizado.',
    legalReference: 'Arts. 114-116 Ley 1266/1987'
  },

  // BLOQUE F - DECRETOS 19.102 Y 3080
  {
    id: 'q-f1',
    block: 'F',
    blockName: 'Decretos Orgánicos',
    question: '¿Quién actúa como Oficial del Registro del Estado Civil con jurisdicción y competencia en TODO EL TERRITORIO de la República (Dto. 19.102)?',
    options: ['El Ministro de Justicia', 'El Director General de la DGREC', 'El Secretario General únicamente', 'Cualquier Oficial de la Capital'],
    correctAnswerIndex: 1,
    explanation: 'Arts. 7 y 9.g del Dto. 19.102: La Dirección General es también Oficina Registral y su titularidad recae en el Director General en todo el país.',
    legalReference: 'Arts. 7, 9.g Decreto 19.102/2002'
  },
  {
    id: 'q-f2',
    block: 'F',
    blockName: 'Decretos Orgánicos',
    question: '¿Cuál es la cadena exacta de localización documental para ubicar un acta en el Archivo Central (Art. 39.h)?',
    options: [
      'Folio -> Tomo -> Caja -> Acta -> Volumen',
      'CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA',
      'Tomo -> Libro -> Sección -> Folio -> Registro',
      'Año -> Distrito -> Número -> Cédula -> Firma'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 39.h Dto. 19.102: La localización se realiza en la secuencia exacta: Caja -> Volumen -> Tomo -> Folio -> Acta.',
    legalReference: 'Art. 39 inc. h Decreto 19.102/2002'
  },

  // BLOQUE G - CÓDIGO CIVIL
  {
    id: 'q-g1',
    block: 'G',
    blockName: 'Código Civil (Ley 1183/85)',
    question: '¿Quién es la única autoridad que puede autorizar cambios o adiciones en el nombre y apellido según el Artículo 42 del Código Civil?',
    options: ['El Director General del Registro Civil', 'Solo el JUEZ, por justa causa', 'El Ministro de Justicia por resolución', 'El Oficial inscriptor del distrito'],
    correctAnswerIndex: 1,
    explanation: 'Art. 42 CC: "SOLO EL JUEZ podrá autorizar, por justa causa, que se introduzcan cambios o adiciones en el nombre y apellido".',
    legalReference: 'Art. 42 Código Civil'
  },
  {
    id: 'q-g2',
    block: 'G',
    blockName: 'Código Civil (Ley 1183/85)',
    question: '¿Cuáles son los tres elementos concurrentes que constituyen la Posesión de Estado de Hijo (Art. 235 CC)?',
    options: [
      'Nomen, Tractatus y Fama (Uso del apellido, trato de hijo recíproco y consideración de la familia/sociedad)',
      'Partida de nacimiento, ADN y fe bautismal',
      'Cédula de identidad, herencia y convivencia',
      'Certificado médico, padrinos y escuela'
    ],
    correctAnswerIndex: 0,
    explanation: 'Art. 235 CC exige la concurrencia de los tres elementos conocidos en doctrina como Nomen, Tractatus y Fama.',
    legalReference: 'Art. 235 Código Civil'
  },

  // BLOQUE H - LEY 1/1992
  {
    id: 'q-h1',
    block: 'H',
    blockName: 'Ley 1/1992 Reforma del Código Civil',
    question: '¿Cuál es el régimen patrimonial SUPLETORIO en el matrimonio si los novios no firman capitulaciones (Art. 24 Ley 1/92)?',
    options: ['Separación de bienes', 'Comunidad de gananciales bajo administración conjunta', 'Participación diferida', 'Régimen de bienes reservados'],
    correctAnswerIndex: 1,
    explanation: 'Art. 24 Ley 1/92: A falta de capitulaciones, el régimen es la Comunidad de Gananciales bajo administración conjunta.',
    legalReference: 'Art. 24 Ley 1/1992'
  },
  {
    id: 'q-h2',
    block: 'H',
    blockName: 'Ley 1/1992 Reforma del Código Civil',
    question: '¿A los cuántos años de unión de hecho (concubinato) continua se puede INSCRIBIR la unión para equipararla al matrimonio (Art. 86 Ley 1/92)?',
    options: ['A los 2 años', 'A los 4 años', 'A los 5 años', 'A los 10 AÑOS (o desde el nacimiento del primer hijo)'],
    correctAnswerIndex: 3,
    explanation: 'Art. 86 Ley 1/92: Transcurridos 10 AÑOS de unión continua (o desde el nacimiento de hijos comunes, Art. 85), se puede inscribir la unión equiparándola a matrimonio.',
    legalReference: 'Arts. 85, 86 Ley 1/1992'
  },

  // BLOQUE I - LEY 6618/2020 Y RESOLUCIÓN 983
  {
    id: 'q-i1',
    block: 'I',
    blockName: 'Ley 6618/2020 y Res. 983',
    question: '¿Cuáles son los dos únicos estados civiles que se consignan por regla general en cualquier documento personal según la Ley 6618/2020?',
    options: [
      'Soltero/a, Casado/a, Viudo/a o Divorciado/a obligatoriamente',
      'SOLTERO/A o CASADO/A (a excepción de quienes deseen conservar viudo/a o divorciado/a)',
      'Únicamente el estado civil de nacimiento',
      'Casado/a o Concubino/a'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 6 Ley 6618/2020: El uso del estado civil en cualquier documentación será de SOLTERO/A o CASADO/A, salvo que la persona desee conservar el de viudo/a o divorciado/a.',
    legalReference: 'Art. 6 Ley 6618/2020'
  },

  // BLOQUE J - PREGUNTAS CRUZADAS Y TRAMPAS
  {
    id: 'q-j1',
    block: 'J',
    blockName: 'Preguntas Cruzadas y Trampas',
    question: '¿En qué se diferencian los requisitos para ser Oficial del REC (Dto. 19.102 Art. 58) frente a los de Servidor Público General (Ley 7445 Art. 12)?',
    options: [
      'No hay ninguna diferencia',
      'El Oficial del REC exige ser paraguayo NATURAL, residir en el distrito y secundaria concluida',
      'El Servidor público exige título universitario de abogado obligatoriamente',
      'El Oficial del REC debe ser menor de 30 años'
    ],
    correctAnswerIndex: 1,
    explanation: 'Art. 58 Dto. 19.102 exige paraguayo NATURAL (no naturalizado), residencia en el distrito y secundaria concluida, requisitos más específicos que la Ley 7445 general.',
    legalReference: 'Art. 58 Dto 19.102 vs Art. 12 Ley 7445'
  },
  {
    id: 'q-j2',
    block: 'J',
    blockName: 'Preguntas Cruzadas y Trampas',
    question: 'Si la Ley 1266/1987 entra en conflicto o contradicción con la Ley 1/1992, ¿cuál prevalece y por qué?',
    options: [
      'Prevalece la Ley 1266 por ser la ley orgánica especial del Registro Civil',
      'Prevalece la Ley 1/1992 por ser ley posterior y porque su Art. 98 deroga expresamente las disposiciones contrarias de la Ley 1266',
      'Ninguna, debe dictarse un decreto reglamentario para desempatar',
      'Prevalece la resolución del Ministerio de Justicia'
    ],
    correctAnswerIndex: 1,
    explanation: 'La Ley 1/1992 es posterior a la Ley 1266 y su Art. 98 establece expresamente la derogación de toda norma previa contraria.',
    legalReference: 'Art. 98 Ley 1/1992'
  }
];
