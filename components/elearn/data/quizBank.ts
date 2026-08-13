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
  {
    id: 'q-a6',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: 'Según el Art. 106 de la Constitución, si un funcionario causa un daño en el ejercicio de sus funciones y no puede pagarlo, ¿qué ocurre?',
    options: [
      'El Estado no responde en ningún caso',
      'Responde el Estado en forma subsidiaria, con derecho a repetir contra el funcionario',
      'Responde otro funcionario de la misma oficina',
      'La víctima pierde el derecho a indemnización'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 106 CN establece responsabilidad personal del funcionario y, subsidiariamente, del Estado, que tiene derecho a repetir el pago contra el responsable.',
    legalReference: 'Art. 106 Constitución Nacional'
  },
  {
    id: 'q-a7',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Cuál es, según el Art. 47 inc. 3 de la Constitución, el único requisito para acceder a una función pública no electiva?',
    options: [
      'La afiliación política',
      'La idoneidad',
      'La antigüedad en el sector privado',
      'La recomendación de un funcionario en actividad'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 47 inc. 3 CN garantiza la igualdad de acceso a las funciones públicas no electivas, sin más requisito que la idoneidad.',
    legalReference: 'Art. 47 inc. 3 Constitución Nacional'
  },
  {
    id: 'q-a8',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Cuáles son las 7 carreras que reconoce expresamente el Art. 101 de la Constitución?',
    options: [
      'Judicial, Docente, Diplomática/Consular, Investigación Científica, Servicio Civil, Militar y Policial',
      'Judicial, Legislativa, Ejecutiva, Municipal, Departamental, Sindical y Cooperativa',
      'Docente, Médica, Bancaria, Notarial, Militar, Policial y Diplomática',
      'Servicio Civil, Municipal, Bancaria, Docente, Judicial, Sindical y Consular'
    ],
    correctAnswerIndex: 0,
    explanation: 'El Art. 101 CN enumera 7 carreras: Judicial, Docente, Diplomática y Consular, Investigación Científica y Tecnológica, Servicio Civil, Militar y Policial.',
    legalReference: 'Art. 101 Constitución Nacional'
  },
  {
    id: 'q-a9',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿Qué prohíbe expresamente el Art. 53 de la Constitución respecto de los hijos?',
    options: [
      'Inscribir hijos extramatrimoniales',
      'Cualquier calificación sobre la naturaleza de la filiación en los documentos personales',
      'El reconocimiento tardío de un hijo',
      'Que un hijo tenga más de un apellido'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 53 CN prohíbe cualquier calificación sobre la filiación (como "hijo natural" o "ilegítimo") en los documentos personales.',
    legalReference: 'Art. 53 Constitución Nacional'
  },
  {
    id: 'q-a10',
    block: 'A',
    blockName: 'Constitución Nacional',
    question: '¿A qué edad se adquiere la ciudadanía en Paraguay, según el Art. 152 CN, y en qué se diferencia de la nacionalidad?',
    options: [
      'A los 18 años; la nacionalidad se adquiere desde el nacimiento',
      'A los 21 años; son sinónimos con la nacionalidad',
      'Al nacer, igual que la nacionalidad',
      'A los 16 años, con autorización de los padres'
    ],
    correctAnswerIndex: 0,
    explanation: 'La nacionalidad se adquiere desde el nacimiento (Art. 146), mientras que la ciudadanía —que habilita derechos políticos— se adquiere a los 18 años (Art. 152).',
    legalReference: 'Arts. 146, 152 Constitución Nacional'
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
  {
    id: 'q-b6',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Cuáles son los siete principios rectores que enumera el Art. 10 de la Ley 7445?',
    options: [
      'Legalidad, Mérito, Igualdad de oportunidades, Transparencia, Probidad, Eficiencia y Estabilidad',
      'Legalidad, Antigüedad, Jerarquía, Puntualidad, Disciplina, Lealtad y Confidencialidad',
      'Mérito, Salario, Ascenso, Capacitación, Vacaciones, Descanso y Jubilación',
      'Transparencia, Publicidad, Gratuidad, Celeridad, Eficacia, Economía y Simplicidad'
    ],
    correctAnswerIndex: 0,
    explanation: 'El Art. 10 enumera siete principios rectores: Legalidad, Mérito, Igualdad de oportunidades, Transparencia, Probidad, Eficiencia y Estabilidad.',
    legalReference: 'Art. 10 Ley 7445/2025'
  },
  {
    id: 'q-b7',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Cuál es la vía general de ingreso a la función pública según el Art. 14 de la Ley 7445?',
    options: [
      'La designación directa de la máxima autoridad',
      'El concurso público',
      'La antigüedad en cargos privados',
      'La recomendación de un funcionario en actividad'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 14 establece el concurso público como la vía general de ingreso, salvo excepciones acotadas para cargos de confianza.',
    legalReference: 'Art. 14 Ley 7445/2025'
  },
  {
    id: 'q-b8',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: '¿Qué ocurre con las vacaciones no utilizadas de un funcionario público, según el Art. 43.c de la Ley 7445?',
    options: [
      'Se pagan en dinero al finalizar el año',
      'Se acumulan hasta un máximo de 2 años, sin compensación en dinero',
      'Se pierden automáticamente al finalizar el año',
      'Se acumulan sin límite alguno'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 43.c establece que las vacaciones no se compensan en dinero, pero pueden acumularse hasta un máximo de 2 años.',
    legalReference: 'Art. 43.c Ley 7445/2025'
  },
  {
    id: 'q-b9',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: 'Un funcionario falta injustificadamente 3 días consecutivos en el mes. ¿Qué tipo de falta comete según la Ley 7445?',
    options: [
      'Falta leve, porque son pocos días',
      'Falta grave, por ausencias consecutivas',
      'No es sancionable si avisa después',
      'Falta gravísima con destitución automática sin sumario'
    ],
    correctAnswerIndex: 1,
    explanation: 'Tres ausencias consecutivas (o cinco alternas en el trimestre) constituyen falta grave, que requiere sumario administrativo formal.',
    legalReference: 'Arts. 54, 58, 61 Ley 7445/2025'
  },
  {
    id: 'q-b10',
    block: 'B',
    blockName: 'Ley 7445/2025 Función Pública',
    question: 'Un funcionario promueve a su cuñado a un cargo dentro de su misma dependencia. ¿Qué prohibición del Art. 52 está infringiendo?',
    options: [
      'Conflicto de intereses genérico',
      'Nepotismo, porque el cuñado está dentro del 2° grado de afinidad',
      'Ninguna, porque el cuñado no es pariente consanguíneo',
      'Corrupción y beneficio indebido'
    ],
    correctAnswerIndex: 1,
    explanation: 'El cuñado es pariente por afinidad de 2° grado, dentro del límite que prohíbe el nepotismo según el Art. 52.u/v.',
    legalReference: 'Art. 52.u/v Ley 7445/2025'
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
  {
    id: 'q-c4',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿Cuál de las siguientes entidades está incluida como "fuente pública" según el Art. 2 de la Ley 5282?',
    options: [
      'Solo los ministerios nacionales',
      'Itaipú y Yacyretá, además de municipalidades y universidades públicas',
      'Solo empresas privadas con contrato estatal',
      'Solo el Poder Judicial'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 2 define como fuentes públicas a todas las reparticiones del Estado, incluidas entidades binacionales como Itaipú y Yacyretá.',
    legalReference: 'Art. 2 Ley 5282/2014'
  },
  {
    id: 'q-c5',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿Qué información exige publicar el Art. 8 inc. e) de la Ley 5282 sobre los funcionarios públicos?',
    options: [
      'Solo el nombre completo',
      'Cédula, cargo y salario mensual con viáticos',
      'Solo el número de legajo',
      'Ninguna, esa información es reservada'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 8 inc. e) exige publicar el listado actualizado de personas en función pública con cédula, cargo y salarios mensuales, incluidos viáticos.',
    legalReference: 'Art. 8 inc. e Ley 5282/2014'
  },
  {
    id: 'q-c6',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿Pueden entregarse los documentos ORIGINALES del archivo a quien solicita información pública?',
    options: [
      'Sí, siempre que lo pida por escrito',
      'No, los originales nunca salen del archivo; solo se entregan copias o certificaciones',
      'Solo si es un juez quien lo pide',
      'Sí, pero con cargo económico'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 18 protege los documentos originales: nunca salen del archivo, solo se entregan copias, fotocopias o certificaciones autenticadas.',
    legalReference: 'Art. 18 Ley 5282/2014'
  },
  {
    id: 'q-c7',
    block: 'C',
    blockName: 'Ley 5282/2014 Acceso a la Información',
    question: '¿En qué plazo procede la acción judicial ante la denegatoria (ficta o expresa) de un pedido de información pública?',
    options: [
      '15 días',
      '30 días',
      '60 días, ante el Juez de Primera Instancia',
      'No existe plazo, puede iniciarse en cualquier momento'
    ],
    correctAnswerIndex: 2,
    explanation: 'Los Arts. 23-24 fijan un plazo de 60 días para iniciar la acción judicial ante el Juez de Primera Instancia.',
    legalReference: 'Arts. 23-24 Ley 5282/2014'
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
  {
    id: 'q-d5',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Qué diferencia hay entre la DENUNCIA de un nacimiento y su DECLARACIÓN, según la Ley 1266?',
    options: [
      'Son sinónimos, ambas producen la inscripción',
      'La denuncia (médicos, 7 días) es un aviso que NO inscribe; la declaración (padres, 30/60 días) sí produce la inscripción',
      'La denuncia la hacen los padres y la declaración los médicos',
      'Ninguna tiene plazo legal'
    ],
    correctAnswerIndex: 1,
    explanation: 'El médico DENUNCIA el hecho biológico (7 días, no inscribe); los padres DECLARAN el nacimiento ante el Oficial, y esa declaración sí produce la inscripción.',
    legalReference: 'Arts. 52, 53 Ley 1266/1987'
  },
  {
    id: 'q-d6',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Qué elementos prohíbe expresamente el Art. 26 de la Ley 1266 en la redacción de las actas?',
    options: [
      'El uso del idioma guaraní',
      'Guarismos (números en cifra), abreviaturas, raspaduras y espacios en blanco',
      'Las firmas dobles',
      'Los sellos de la institución'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 26 prohíbe guarismos, abreviaturas, raspaduras y espacios en blanco, como medida anti-falsificación de los instrumentos públicos.',
    legalReference: 'Art. 26 Ley 1266/1987'
  },
  {
    id: 'q-d7',
    block: 'D',
    blockName: 'Ley 1266/1987 Registro del Estado Civil',
    question: '¿Qué consecuencia tiene inscribir un acta en un libro no rubricado, según el Art. 21?',
    options: [
      'Ninguna, es solo una irregularidad menor',
      'La inscripción es nula y el Oficial responsable es separado del cargo',
      'Se corrige con una nota marginal',
      'Se convalida automáticamente a los 30 días'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 21 sanciona con nulidad la inscripción hecha en libro no rubricado, y dispone la separación del Oficial responsable.',
    legalReference: 'Art. 21 Ley 1266/1987'
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
  {
    id: 'q-e5',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: '¿Cuál es el plazo mínimo y máximo para proceder a la inhumación de un cadáver, según el Art. 105?',
    options: ['6 y 24 horas', '12 y 36 horas', '24 y 48 horas', 'No hay plazos fijados'],
    correctAnswerIndex: 1,
    explanation: 'La inhumación debe realizarse como mínimo 12 horas después de la defunción (para verificarla) y como máximo 36 horas después.',
    legalReference: 'Art. 105 Ley 1266/1987'
  },
  {
    id: 'q-e6',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: 'En 2018 se detecta que el domicilio de la madre quedó mal escrito en una partida de nacimiento (error material). ¿Qué remedio corresponde?',
    options: [
      'Reconstitución del libro completo',
      'Rectificación administrativa, con dictamen previo de Asesoría Jurídica',
      'Convalidación por falta de firma',
      'No tiene solución posible'
    ],
    correctAnswerIndex: 1,
    explanation: 'Los errores u omisiones puramente materiales se corrigen por vía administrativa (Art. 118), con dictamen previo de Asesoría Jurídica.',
    legalReference: 'Art. 118 Ley 1266/1987'
  },
  {
    id: 'q-e7',
    block: 'E',
    blockName: 'Ley 1266: Defunciones y Remedios',
    question: '¿Qué remedio registral corresponde cuando un acta está completa pero le falta la firma del Oficial o de los testigos?',
    options: ['Reconstitución', 'Rectificación', 'Convalidación', 'Cancelación'],
    correctAnswerIndex: 2,
    explanation: 'La convalidación (Cap. XIII, Arts. 122-123) procede cuando el acta está completa pero falta la firma del Oficial o de los testigos.',
    legalReference: 'Arts. 122-123 Ley 1266/1987'
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
  {
    id: 'q-f3',
    block: 'F',
    blockName: 'Decretos Orgánicos',
    question: '¿Cuáles son los 6 requisitos para ser Oficial del Registro Civil, según el Art. 58 del Decreto 19.102?',
    options: [
      'Título universitario, 25 años, sin más requisitos',
      'Paraguayo/a natural, mayor de edad, residencia en el distrito, secundaria concluida, sin antecedentes y aprobar examen',
      'Solo aprobar un examen técnico',
      'Ser recomendado por el Director General'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 58 exige: paraguayo natural, mayoría de edad, residencia permanente en el distrito, secundaria concluida, sin antecedentes penales firmes y notoria honorabilidad, y aprobar examen teórico-práctico.',
    legalReference: 'Art. 58 Decreto 19.102/2002'
  },
  {
    id: 'q-f4',
    block: 'F',
    blockName: 'Decretos Orgánicos',
    question: '¿A qué bloque pertenece la Dirección de Gestión de Documentación Central según el Decreto 3080/2015?',
    options: ['Conducción', 'Apoyo', 'Misional', 'No está clasificada'],
    correctAnswerIndex: 2,
    explanation: 'Documentación Central (Dependencia N° 12) pertenece al bloque Misional, junto con las Oficinas del REC y el Centro de Estudios Registrales.',
    legalReference: 'Decreto 3080/2015'
  },
  {
    id: 'q-f5',
    block: 'F',
    blockName: 'Decretos Orgánicos',
    question: '¿Cuántas dependencias en total fijó el Decreto 3080/2015 para la estructura orgánica de la DGREC?',
    options: ['10', '12', '14', '16'],
    correctAnswerIndex: 2,
    explanation: 'El Decreto 3080/2015 estableció 14 dependencias distribuidas en 3 bloques: Conducción (2), Apoyo (9) y Misionales (3).',
    legalReference: 'Decreto 3080/2015'
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
  {
    id: 'q-g3',
    block: 'G',
    blockName: 'Código Civil (Ley 1183/85)',
    question: 'Se descubre que uno de los cónyuges ya tenía un matrimonio anterior no disuelto. ¿Qué tipo de nulidad corresponde según el Art. 179 CC?',
    options: [
      'Anulabilidad, con plazo de 60 días',
      'Nulidad absoluta, por impedimento dirimente, sin plazo',
      'No hay nulidad si pasaron más de 10 años',
      'Depende de si hay hijos'
    ],
    correctAnswerIndex: 1,
    explanation: 'El vínculo matrimonial anterior subsistente es un impedimento dirimente (Art. 179 CC): el matrimonio es nulo, sin plazo para reclamarlo.',
    legalReference: 'Art. 179 Código Civil'
  },
  {
    id: 'q-g4',
    block: 'G',
    blockName: 'Código Civil (Ley 1183/85)',
    question: 'Un matrimonio es declarado nulo, pero ambos cónyuges actuaron de mala fe. ¿Qué ocurre con los hijos, según el Art. 185 CC?',
    options: [
      'Pierden su calidad de hijos matrimoniales',
      'Conservan su calidad de hijos matrimoniales, aunque ambos padres sean de mala fe',
      'Solo la conservan si uno de los padres era de buena fe',
      'Deben reconocerse nuevamente por vía judicial'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 185 CC establece que, aunque ambos cónyuges sean de mala fe, no obsta a la calidad de los hijos: siguen siendo matrimoniales.',
    legalReference: 'Art. 185 Código Civil'
  },
  {
    id: 'q-g5',
    block: 'G',
    blockName: 'Código Civil (Ley 1183/85)',
    question: 'Un niño nace 250 días después de la celebración del matrimonio de sus padres. Según el Art. 225 CC, ¿qué se presume?',
    options: [
      'Que no es hijo matrimonial',
      'Que es hijo matrimonial, porque cae dentro de la ventana de 180 a 300 días',
      'Que hace falta un estudio de ADN obligatorio',
      'Que es hijo extramatrimonial automáticamente'
    ],
    correctAnswerIndex: 1,
    explanation: 'Al nacer después de los 180 días mínimos y dentro de los 300 días de vigencia del matrimonio, se presume hijo matrimonial (Art. 225 CC).',
    legalReference: 'Art. 225 Código Civil'
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
  {
    id: 'q-h3',
    block: 'H',
    blockName: 'Ley 1/1992 Reforma del Código Civil',
    question: '¿Qué establece textualmente el Art. 1 de la Ley 1/1992?',
    options: [
      'La mujer y el varón tienen igual capacidad de goce y de ejercicio de los derechos civiles, cualquiera sea su estado civil',
      'El matrimonio se rige exclusivamente por el Código Civil de 1985',
      'La mujer casada requiere autorización del marido para disponer de sus bienes',
      'Todos los bienes del matrimonio son administrados por el varón'
    ],
    correctAnswerIndex: 0,
    explanation: 'El Art. 1 Ley 1/92 establece la igualdad de capacidad de goce y ejercicio de derechos civiles entre mujer y varón, cualquiera sea su estado civil.',
    legalReference: 'Art. 1 Ley 1/1992'
  },
  {
    id: 'q-h4',
    block: 'H',
    blockName: 'Ley 1/1992 Reforma del Código Civil',
    question: '¿Cuáles son los tres principios de interpretación que fija el Art. 2 de la Ley 1/92?',
    options: [
      'La preferencia por el cónyuge de mayor edad, la propiedad y el ahorro',
      'La unidad de la familia, el bienestar de los hijos menores, y la igualdad entre cónyuges',
      'La prioridad económica, la eficiencia y la transparencia',
      'El régimen de gananciales, la separación de bienes y el divorcio'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 2 establece tres principios: la unidad de la familia, el bienestar de los hijos menores, y la igualdad de derechos y obligaciones de los cónyuges.',
    legalReference: 'Art. 2 Ley 1/1992'
  },
  {
    id: 'q-h5',
    block: 'H',
    blockName: 'Ley 1/1992 Reforma del Código Civil',
    question: '¿Qué protege la figura del "bien de familia" regulada en los Arts. 95-97 de la Ley 1/92?',
    options: [
      'El salario del titular',
      'La vivienda familiar frente a embargos por deudas posteriores a su constitución',
      'Los ahorros bancarios',
      'Los bienes muebles del hogar'
    ],
    correctAnswerIndex: 1,
    explanation: 'El bien de familia protege el inmueble destinado a vivienda o explotación familiar frente a embargos por deudas contraídas después de constituirlo.',
    legalReference: 'Arts. 95-97 Ley 1/1992'
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
  {
    id: 'q-i2',
    block: 'I',
    blockName: 'Ley 6618/2020 y Res. 983',
    question: 'Según el Art. 2 de la Ley 6618/2020, ¿frente a qué tres ámbitos se define la "situación jurídica" que constituye el estado civil?',
    options: [
      'El trabajo, la salud y la educación',
      'El Estado, la sociedad y la familia',
      'El banco, el municipio y la escuela',
      'Los padres, los hermanos y los hijos'
    ],
    correctAnswerIndex: 1,
    explanation: 'El Art. 2 define el Estado Civil como la situación jurídica que la persona tiene frente al Estado, la sociedad y la familia.',
    legalReference: 'Art. 2 Ley 6618/2020'
  },
  {
    id: 'q-i3',
    block: 'I',
    blockName: 'Ley 6618/2020 y Res. 983',
    question: '¿Cuál es el órgano responsable de la guarda y actualización del legajo de cada servidor público, según el Art. 9 de la RM 983/2017?',
    options: [
      'La Dirección General de Talento Humano (DGTH)',
      'La Asesoría Jurídica del Ministerio',
      'La Secretaría de la Función Pública',
      'El propio servidor público'
    ],
    correctAnswerIndex: 0,
    explanation: 'El Art. 9 de la RM 983/2017 asigna a la DGTH la responsabilidad de guardar y mantener actualizado el legajo de cada servidor.',
    legalReference: 'Art. 9 RM 983/2017'
  },
  {
    id: 'q-i4',
    block: 'I',
    blockName: 'Ley 6618/2020 y Res. 983',
    question: '¿En qué plazo debe un servidor recién ingresado entregar su documentación para conformar su legajo, según el Art. 10 de la RM 983/2017?',
    options: ['15 días', '30 días', '60 días', '90 días'],
    correctAnswerIndex: 1,
    explanation: 'El Art. 10 fija un plazo de 30 días desde el ingreso para entregar la documentación requerida para el legajo.',
    legalReference: 'Art. 10 RM 983/2017'
  },
  {
    id: 'q-i5',
    block: 'I',
    blockName: 'Ley 6618/2020 y Res. 983',
    question: '¿Cuántos artículos tiene en total la Ley 6618/2020?',
    options: ['5 artículos', '9 artículos', '15 artículos', '99 artículos'],
    correctAnswerIndex: 1,
    explanation: 'La Ley 6618/2020 tiene solo 9 artículos, la más corta de todo el temario del concurso.',
    legalReference: 'Ley 6618/2020'
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
  },
  {
    id: 'q-j3',
    block: 'J',
    blockName: 'Preguntas Cruzadas y Trampas',
    question: 'Un ciudadano pide el certificado de matrimonio de otra persona que no es familiar suyo (vía Ley 1266) y, por separado, pide la nómina salarial de la DGREC (vía Ley 5282). ¿En qué se diferencian ambos pedidos?',
    options: [
      'Ambos requieren acreditar interés legítimo',
      'El de la Ley 1266 requiere interés legítimo (protección de intimidad); el de la Ley 5282 es libre y sin justificar razones',
      'Ninguno requiere justificación',
      'Ambos son gratuitos e idénticos en trámite'
    ],
    correctAnswerIndex: 1,
    explanation: 'Los datos del Registro Civil sobre terceros requieren interés legítimo (Art. 33 CN, intimidad); la información pública general (Ley 5282) es de acceso libre sin justificar motivos.',
    legalReference: 'Ley 1266 vs Ley 5282/2014'
  },
  {
    id: 'q-j4',
    block: 'J',
    blockName: 'Preguntas Cruzadas y Trampas',
    question: 'El plazo de 15 días para presentar la declaración jurada de bienes (Art. 104 CN) reaparece en el Art. 11 de la RM 983/2017 como parte del legajo. ¿Qué demuestra esta repetición?',
    options: [
      'Que son obligaciones distintas y no relacionadas',
      'Que normas de menor jerarquía (resoluciones) suelen ser aplicaciones operativas de obligaciones que nacen en la Constitución',
      'Que la Constitución fue copiada de la resolución ministerial',
      'Que el plazo cambia según la norma que se consulte'
    ],
    correctAnswerIndex: 1,
    explanation: 'Es el mismo patrón que se repite en el temario: normas de menor jerarquía como una resolución ministerial aplican, en la práctica, obligaciones que ya nacen en la Constitución.',
    legalReference: 'Art. 104 CN + Art. 11 RM 983/2017'
  },
  {
    id: 'q-j5',
    block: 'J',
    blockName: 'Preguntas Cruzadas y Trampas',
    question: 'Un Oficial no puede inscribir el matrimonio de su cuñado. ¿Con qué otro artículo del temario comparte exactamente el mismo límite de parentesco (2° de afinidad)?',
    options: [
      'Solo con el Art. 30 de la Ley 1266',
      'Con el Art. 30 de la Ley 1266 (incompatibilidad del Oficial) y con el Art. 52.u de la Ley 7445 (nepotismo)',
      'No hay ninguna otra norma con ese límite',
      'Con el Art. 225 del Código Civil'
    ],
    correctAnswerIndex: 1,
    explanation: 'El límite de 4° de consanguinidad y 2° de afinidad se repite en el Art. 30 de la Ley 1266 (incompatibilidad del Oficial) y en el Art. 52.u de la Ley 7445 (nepotismo) — el mismo criterio aplicado a distintas normas.',
    legalReference: 'Art. 30 Ley 1266 + Art. 52.u Ley 7445'
  }
];
