import { Chapter } from '../types';

// Temario alineado 1:1 con la tabla oficial de la convocatoria (11
// normativas, en su orden y alcance exactos). La Parte 0 y 0-B son
// preparación metodológica: no forman parte del temario examinable, pero
// ayudan a estudiar mejor las 11 partes que sí lo son.
export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 'parte-0',
    partNumber: 'Preparación',
    title: 'Curso Express de Derecho para No Abogados',
    description: 'No es parte del temario oficial: son las bases para entender todo lo demás. Pirámide Kelseniana y glosario de términos clave.',
    lessons: [
      {
        id: 'p0-l1',
        title: '0.1 ¿Qué es una ley y cómo se sanciona en Paraguay?',
        summary: 'Definición de ley y el procedimiento bicameral en el Congreso paraguayo.',
        level1Simple: 'Una ley es una orden escrita del Estado que vale para todos y que se puede hacer cumplir por la fuerza si es necesario. No es un consejo ni una sugerencia.',
        level2Norm: 'Procedimiento: 1. Proyecto (Senador, Diputado, Presidente o Iniciativa Popular) -> 2. Cámara de Origen -> 3. Cámara Revisora -> 4. Sanción (aprobación bicameral) -> 5. Promulgación (Poder Ejecutivo) -> 6. Publicación en la Gaceta Oficial -> 7. Vigencia.',
        level3DeskExample: 'Cuando la Ley 6618/2020 dice "quedando sancionada por la Cámara de Diputados", significa que ambas cámaras la aprobaron y el Presidente la promulgó.',
        keyArticle: 'Cita Legal / Glosario',
        memoryTips: ['Sancionar = Aprobar en el Congreso (no es castigar)', 'Promulgar = El Presidente da el visto bueno', 'Vigencia = Desde cuándo obliga']
      },
      {
        id: 'p0-l2',
        title: '0.2 La Pirámide Kelseniana: Jerarquía de Normas',
        summary: 'El orden de jerarquía de las normas jurídicas en Paraguay (Art. 137 CN).',
        level1Simple: 'Las leyes están ordenadas como una pirámide. La de arriba manda sobre las de abajo. Si una norma de abajo contradice a la de arriba, no vale.',
        level2Norm: '1. Constitución Nacional (1992) -> 2. Tratados Internacionales aprobados -> 3. Leyes (Congreso, Ej: Ley 1266, Ley 7445) -> 4. Decretos (Presidente, Ej: Decreto 19.102) -> 5. Resoluciones (Ministros/Directores, Ej: RM 983/2017).',
        level3DeskExample: 'Si la Ley 1266/1987 dice algo y la Ley 1/1992 dice algo opuesto, la Ley 1/1992 prevalece por ser ley posterior (Art. 98 Ley 1/92). Si un decreto contradice a la ley, gana la ley.',
        keyArticle: 'Art. 137 CN',
        memoryTips: ['Constitución > Tratados > Leyes > Decretos > Resoluciones', 'A igual nivel de ley, la ley nueva deroga a la vieja']
      },
      {
        id: 'p0-l3',
        title: '0.3 ¿Qué significa "Reglamentar" una Ley?',
        summary: 'Cómo los decretos presidenciales desarrollan el contenido de las leyes.',
        level1Simple: 'La ley da la orden general ("hacé una torta"), y el reglamento (decreto) da la receta paso a paso ("precalentá el horno, usá 3 huevos").',
        level2Norm: 'La Ley 1266/1987 creó el Registro Civil y en su Art. 133 ordenó que el Ejecutivo la reglamente. En 2002, el Ejecutivo dictó el Decreto 19.102/2002 para detallar su funcionamiento, modificado en 2015 por el Decreto 3080.',
        level3DeskExample: 'La Ley 1266 dice que hay un Director General. El Decreto 19.102 detalla sus funciones exactas, departamentos y requisitos.',
        keyArticle: 'Art. 133 Ley 1266 / Dto 19.102 / Dto 3080',
        memoryTips: ['Ley 1266 -> Reglamentada por Dto 19.102 -> Modificada por Dto 3080']
      },
      {
        id: 'p0-l4',
        title: '0.4 Glosario Esencial de Palabras Raras (Parte I)',
        summary: 'Términos jurídicos explicados en castellano sencillo.',
        level1Simple: 'Aprender los conceptos fundamentales como derogación, de oficio, vía administrativa vs judicial, etc.',
        level2Norm: 'Derogar (eliminar norma/artículo). Abrogar (eliminar ley completa). Modificar (cambiar texto). Supletorio (aplica si falta otra cosa). De oficio (la autoridad actúa sola) vs A petición de parte (solicitud del ciudadano). Sumario administrativo (investigación interna a funcionario) vs Juicio sumario (juicio corto en tribunal). Nulo (nulidad absoluta, no se convalida) vs Anulable (nulidad relativa, se convalida si nadie reclama a tiempo).',
        level3DeskExample: 'Si el Oficial del Registro detecta un error de tipeo en un apellido ("Rodrígues"), se arregla por Vía Administrativa (Resolución de la Dirección). Si el ciudadano quiere cambiar su nombre de pila ("María" por "Sofía"), requiere Vía Judicial (Sentencia de Juez).',
        keyArticle: 'Glosario General',
        memoryTips: ['De oficio = solo el Estado', 'A petición = lo pide el interesado', 'Vía administrativa = Dirección General', 'Vía judicial = Juez']
      },
      {
        id: 'p0-l5',
        title: '0.5 Glosario Esencial: Parentesco, Imprescriptibilidad y Presunción',
        summary: 'Conceptos clave sobre consanguinidad, afinidad, notas marginales y presunciones.',
        level1Simple: 'Cálculo de grados de parentesco y diferencias entre instrumentos públicos y privados.',
        level2Norm: 'Consanguinidad (sangre): 1° Padres/Hijos, 2° Abuelos/Nietos/Hermanos, 3° Tíos/Sobrinos, 4° Primos Hermanos. Afinidad (matrimonio): 1° Suegros, 2° Cuñados. Regla 4° de consanguinidad y 2° de afinidad limita incompatibilidades del Oficial (Art. 30 Ley 1266) y Nepotismo (Art. 52.u Ley 7445). Instrumento Público: hace plena fe por sí solo (las partidas del REC son instrumentos públicos, Art. 31 Ley 1266). Presunción iure et de iure: no admite prueba en contrario.',
        level3DeskExample: 'Un oficial no puede inscribir el nacimiento del hijo de su primo hermano (4° consanguinidad) ni el matrimonio de su cuñado (2° afinidad).',
        keyArticle: 'Art. 30, 31, 38 Ley 1266 / Art. 52.u Ley 7445',
        memoryTips: ['4° consanguinidad = Primo hermano', '2° afinidad = Cuñado', 'Partida = Instrumento público con fe pública']
      }
    ]
  },
  {
    id: 'parte-0b',
    partNumber: 'Preparación',
    title: 'Laboratorio de Memoria: Cómo Aprender Rápido',
    description: 'Tampoco es examinable: son las técnicas de estudio para aprender las 11 partes oficiales en menos tiempo.',
    lessons: [
      {
        id: 'p0b-l1',
        title: 'Curva del Olvido y Recuerdo Activo (Active Recall)',
        summary: 'Por qué olvidamos el 40% en 20 minutos y cómo aplanar la curva con repetición espaciada.',
        level1Simple: 'Releer pasivamente te engaña haciéndote creer que sabes. El verdadero estudio es intentar recordar sin mirar el texto (volcado en blanco).',
        level2Norm: 'Esquema de repetición recomendado: Mismo día -> Al día siguiente -> A los 3 días -> A la semana -> A las 2 semanas. El estudio de 50 minutos de concentración y 10 minutos de descanso es el bloque óptimo.',
        level3DeskExample: 'Escribe en una hoja en blanco todo lo que recuerdes del Art. 27 de la Ley 1266, luego abre el manual y corrige en rojo. Lo que faltó es lo que debes repasar.',
        keyArticle: 'Método Científico de Estudio',
        memoryTips: ['Nunca releas pasivamente', 'Haz volcados en blanco', 'El cansancio falso es señal de consolidación neuronal']
      },
      {
        id: 'p0b-l2',
        title: 'Técnica Feynman, Interrogación Elaborativa y Agrupamiento',
        summary: 'Explica en voz alta, pregúntate el porqué de cada regla y agrupa listas largas.',
        level1Simple: 'Solo entiendes algo si puedes explicárselo a un chico de 12 años sin palabras técnicas. Pregúntate siempre: "¿Por qué el legislador puso esta regla?"',
        level2Norm: 'Ejemplo de "¿Por qué existe?": ¿Por qué prohibir guarismos y abreviaturas en las actas? Porque "1" se transforma en "7" con un trazo y "Fco." causa ambigüedad en el nombre. Escribir todo en letras previene falsificaciones.',
        level3DeskExample: 'Simula la entrevista oral respondiendo las preguntas clave en voz alta y grabándote con el celular en sesiones de 60 a 90 segundos.',
        keyArticle: 'Estrategias de Examen y Entrevista',
        memoryTips: ['Explicar en voz alta entrena para la entrevista', 'Los "por qué" deducen las respuestas si olvidas un detalle']
      }
    ]
  },

  // ── N° 1 — Constitución Nacional ──
  {
    id: 'oficial-1',
    partNumber: 'N° 1',
    title: 'Constitución Nacional de la República del Paraguay',
    description: 'Derechos y garantías fundamentales. Principios de la Administración Pública. Igualdad ante la ley. Acceso a la función pública. Derecho a la identidad y estado civil.',
    lessons: [
      {
        id: 'p1-l1',
        title: 'Derechos y garantías fundamentales (Arts. 1 a 45, 131-136)',
        summary: 'Forma del Estado, Derecho a la Vida, Libertad, Información veraz y Hábeas Data.',
        level1Simple: 'Paraguay es un Estado social de derecho, unitario, indivisible y descentralizado. La dictadura está fuera de la ley.',
        level2Norm: 'Art. 1: Estado social de derecho, unitario, indivisible y descentralizado. Democracia representativa, participativa y pluralista. Art. 4: Vida protegida desde la concepción (sin pena de muerte). Art. 9: Principio de legalidad ("Nadie está obligado a hacer lo que la ley no ordena ni privado de lo que no prohíbe"). Art. 28: Información veraz, responsable y ecuánime (fuentes públicas libres). Art. 40: Petición (silencio = denegado). Art. 135: Hábeas Data (actualización, rectificación o destrucción de datos en registros oficiales).',
        level3DeskExample: 'El Hábeas Data (Art. 135 CN) es la garantía constitucional directa que sustenta la rectificación de partidas en el Registro Civil.',
        keyArticle: 'Arts. 1, 4, 9, 28, 40, 135 CN',
        memoryTips: ['Estado: Social de derecho, unitario, indivisible, descentralizado', 'Información: veraz, responsable y ecuánime', 'Hábeas Data = corregir o actualizar mis datos oficiales'],
        deepDive: [
          'El Art. 1 no es una frase decorativa: cada palabra tiene consecuencia práctica. "Social de derecho" significa que el Estado no solo se limita a no violar derechos (Estado liberal clásico), sino que además debe promoverlos activamente (salud, educación, trabajo). "Unitario" se opone a "federal": Paraguay tiene un solo gobierno central, no estados con leyes propias como Argentina o Brasil. "Descentralizado" no contradice lo anterior: significa que existen gobiernos departamentales y municipales con competencias propias, pero siempre subordinados al orden jurídico nacional.',
          'El Art. 9 (principio de legalidad) tiene dos caras que no hay que confundir. Para el CIUDADANO: "nadie está obligado a hacer lo que la ley no ordena ni privado de lo que ella no prohíbe" — el ciudadano puede hacer todo lo que no esté prohibido. Para el FUNCIONARIO PÚBLICO la lógica se invierte (esto se ve en el Art. 106 y en toda la Ley 7445): el funcionario solo puede hacer lo que la ley expresamente lo autoriza a hacer. Esta inversión es la base de todo el derecho administrativo paraguayo.',
          'El Art. 135 (Hábeas Data) es la garantía constitucional más citada en el ámbito del Registro Civil, porque es el fundamento último del derecho de cualquier persona a pedir la rectificación de un dato erróneo en su partida. Cuando en la Parte N° 5 (Ley 1266) veas los "tres remedios registrales" (reconstituir, rectificar, convalidar), recordá que todos ellos son, en el fondo, aplicaciones concretas de este artículo constitucional.'
        ],
        exercises: [
          {
            question: '¿Qué forma de Estado establece el Art. 1 de la Constitución Nacional?',
            options: ['Federal, unitario y centralizado', 'Social de derecho, unitario, indivisible y descentralizado', 'Confederado y parlamentario', 'Liberal clásico y federal'],
            correctIndex: 1,
            explanation: 'El Art. 1 CN define a Paraguay como un Estado social de derecho, unitario, indivisible y descentralizado, con democracia representativa, participativa y pluralista.'
          },
          {
            question: 'Un ciudadano pide al Registro Civil que le muestren y corrijan un dato personal desactualizado en sus archivos. ¿Qué garantía constitucional está ejerciendo?',
            options: ['Principio de legalidad (Art. 9)', 'Hábeas Data (Art. 135)', 'Derecho de petición (Art. 40)', 'Libertad de información (Art. 28)'],
            correctIndex: 1,
            explanation: 'El Hábeas Data (Art. 135 CN) permite a toda persona acceder a la información sobre sí misma en registros oficiales y exigir su actualización, rectificación o destrucción si fuera errónea.'
          }
        ]
      },
      {
        id: 'p1-l2',
        title: 'Principios de la Administración Pública (Arts. 9, 101, 104, 105, 106, 128)',
        summary: 'Legalidad, Idoneidad, Responsabilidad del funcionario, Probidad e Interés General.',
        level1Simple: 'Un funcionario público solo puede hacer lo que la ley expresamente le autoriza. Además, responde con su propio dinero si comete un daño.',
        level2Norm: 'Art. 106: Responsabilidad personal del funcionario -> Responsabilidad subsidiaria del Estado -> Derecho del Estado a REPETIR el pago contra el funcionario culpable. Art. 104: Declaración jurada de bienes dentro de los 15 días de asumir y al cesar. Art. 105: Prohibida doble remuneración salvo la docencia. Art. 128: Primacía del interés general sobre el particular.',
        level3DeskExample: 'Si un Oficial pierde un libro por negligencia y el Estado indemniza al ciudadano dañado, el Estado inicia juicio de repetición al Oficial para cobrarle el dinero pagado.',
        keyArticle: 'Arts. 104, 105, 106, 128 CN',
        memoryTips: ['Responsabilidad: Personal -> Subsidiaria del Estado -> Derecho a repetir', 'DDJJ: 15 días al asumir y al cesar', 'Excepción doble sueldo: Docencia'],
        deepDive: [
          'El esquema de responsabilidad del Art. 106 tiene tres pasos que hay que memorizar en orden. Primero responde el FUNCIONARIO con su propio patrimonio por los daños causados en el ejercicio de sus funciones. Si el funcionario no puede pagar (o el afectado prefiere ir directo contra el Estado, que da más garantías de cobro), responde el ESTADO de forma SUBSIDIARIA. Pero el Estado no se queda con esa pérdida: tiene derecho a REPETIR — es decir, a iniciar un juicio contra el funcionario para recuperar lo que pagó. Es el mismo mecanismo, en espejo, que existe en cualquier relación de dependencia con seguro de responsabilidad civil.',
          'La Declaración Jurada de Bienes y Rentas (Art. 104) no es un trámite burocrático menor: es una herramienta anticorrupción central. Se presenta ante la Contraloría General de la República dentro de los 15 días de asumir el cargo, y también dentro de los 15 días de cesar. La comparación entre la declaración de entrada y la de salida permite detectar enriquecimientos ilícitos durante el ejercicio del cargo. Este mismo dato aparece después en el temario cuando estudies el ítem 4 del legajo personal (RM 983/2017, Parte N° 9): el comprobante de esa declaración jurada va directo al legajo del funcionario.',
          'El Art. 128 (primacía del interés general) es el principio que justifica, en última instancia, todas las restricciones que la Ley 7445 impone al funcionario: por qué no puede tener doble empleo remunerado, por qué no puede usar bienes institucionales para fines propios, por qué debe declarar sus bienes. Cada vez que una pregunta te plantee un conflicto entre lo que le conviene al funcionario y lo que le conviene al servicio público, la respuesta constitucional de fondo siempre remite a este artículo.'
        ],
        exercises: [
          {
            question: 'Si un funcionario causa un daño culposo en el ejercicio de sus funciones y no puede pagar la indemnización, ¿quién responde y con qué derecho posterior?',
            options: ['Responde solo el Estado, sin derecho a nada más', 'Responde el Estado de forma subsidiaria, con derecho a repetir contra el funcionario', 'No responde nadie si el funcionario es insolvente', 'Responde otro funcionario de la misma dependencia'],
            correctIndex: 1,
            explanation: 'Art. 106 CN: responde primero el funcionario; subsidiariamente el Estado; y el Estado tiene derecho a repetir (recuperar el pago) contra el funcionario responsable.'
          },
          {
            question: '¿En qué plazo debe presentarse la declaración jurada de bienes y rentas al asumir un cargo público?',
            options: ['30 días', '15 días', '60 días', 'No tiene plazo fijo'],
            correctIndex: 1,
            explanation: 'El Art. 104 CN exige presentar la declaración jurada de bienes dentro de los 15 días de asumir el cargo, y nuevamente dentro de los 15 días de cesar en él.'
          }
        ]
      },
      {
        id: 'p1-l3',
        title: 'Igualdad ante la ley (Arts. 46, 47, 48)',
        summary: 'Protecciones especiales igualitarias, las 4 garantías de igualdad y la igualdad hombre-mujer.',
        level1Simple: 'Tratar igual a quienes están en situación desigual perpetúa la desigualdad; por eso las medidas de protección a sectores vulnerables son igualitarias, no discriminatorias.',
        level2Norm: 'Art. 46: "Las protecciones que se establezcan sobre desigualdades injustas no serán consideradas discriminatorias sino igualitarias". Art. 47: 1) Acceso a la justicia, 2) Igualdad ante la ley, 3) Igualdad de acceso a funciones públicas no electivas sin más requisito que la IDONEIDAD, 4) Igualdad de oportunidades en beneficios. Art. 48: Iguales derechos civiles, políticos, sociales, económicos y culturales entre hombre y mujer.',
        level3DeskExample: 'El concurso público se basa en el Art. 47 inc. 3 CN: el único requisito constitucional para el puesto es la idoneidad evaluada objetivamente.',
        keyArticle: 'Arts. 46, 47, 48 CN',
        memoryTips: ['4 Garantías: Justicia, Leyes, Funciones (idoneidad), Beneficios', 'Igualdad de género en 5 ámbitos: civiles, políticos, sociales, económicos, culturales'],
        deepDive: [
          'El Art. 46 resuelve una paradoja aparente: si la Constitución dice que todos son iguales, ¿cómo se justifica que haya leyes que dan beneficios especiales a personas con discapacidad, mujeres embarazadas o pueblos indígenas? La respuesta está en la distinción entre igualdad FORMAL (tratar a todos exactamente igual) e igualdad MATERIAL (compensar desigualdades de partida para que el resultado sea justo). El Art. 46 constitucionaliza la igualdad material: las medidas de protección a sectores vulnerables no violan la igualdad, la realizan.',
          'El Art. 47 inciso 3 es, para este concurso, el más importante de los cuatro: establece que el único requisito para acceder a una función pública no electiva es la IDONEIDAD. Esto significa que cualquier otro criterio de selección (afinidad política, parentesco, recomendación personal) es inconstitucional. El concurso público al que te estás presentando es, precisamente, el mecanismo diseñado para medir esa idoneidad de forma objetiva y verificable.',
          'El Art. 48 va más allá de una declaración general: enumera expresamente cinco ámbitos de igualdad entre hombre y mujer (civiles, políticos, sociales, económicos y culturales). Esta enumeración no es casual — fue la base jurídica directa que, cinco días después de sancionada la Constitución, permitió sancionar la Ley 1/1992, que reformó el Código Civil para eliminar todas las normas que subordinaban jurídicamente a la mujer casada.'
        ],
        exercises: [
          {
            question: 'Según el Art. 47 inc. 3 de la Constitución, ¿cuál es el único requisito para acceder a una función pública no electiva?',
            options: ['Ser miembro de un partido político', 'La idoneidad', 'Tener recomendación de un superior', 'Antigüedad en el sector privado'],
            correctIndex: 1,
            explanation: 'El Art. 47 inc. 3 CN garantiza la igualdad de acceso a las funciones públicas no electivas, sin más requisito que la idoneidad.'
          },
          {
            question: '¿Por qué las medidas de protección a sectores vulnerables (Art. 46 CN) no se consideran discriminatorias?',
            options: ['Porque la ley lo dice expresamente, sin importar el fundamento', 'Porque compensan desigualdades injustas y buscan una igualdad material, no solo formal', 'Porque solo aplican a extranjeros', 'Porque son de carácter transitorio'],
            correctIndex: 1,
            explanation: 'El Art. 46 CN aclara que las protecciones sobre desigualdades injustas no son discriminatorias, sino igualitarias: buscan compensar puntos de partida desiguales.'
          }
        ]
      },
      {
        id: 'p1-l4',
        title: 'Acceso a la función pública (Arts. 101 a 106)',
        summary: 'Las 7 carreras del Estado paraguayo y el régimen laboral público.',
        level1Simple: 'Los funcionarios están al servicio del país, no del gobierno ni del jefe de turno.',
        level2Norm: 'Art. 101: Las 7 carreras expresas son: 1) Judicial, 2) Docente, 3) Diplomática y Consular, 4) Investigación Científica y Tecnológica, 5) Servicio Civil, 6) Militar, 7) Policial. La carrera del Servicio Civil se rige por la Ley 7445/2025.',
        level3DeskExample: 'El puesto de Auxiliar/Asistente en la Dirección de Documentación Central del REC pertenece a la carrera del Servicio Civil.',
        keyArticle: 'Arts. 101-106 CN',
        memoryTips: ['Acróstico 7 carreras: J-D-D-C-C-M-P (Juez, Docente, Diplomático, Científico, Civil, Militar, Policía)'],
        deepDive: [
          'La Constitución no deja que "función pública" sea un concepto único e indiferenciado: reconoce siete carreras especiales, cada una regulada por su propio estatuto especial, porque las exigencias de un juez no son las de un policía ni las de un investigador científico. Esto explica por qué la Ley 7445/2025 no rige para TODOS los que trabajan para el Estado: rige específicamente para la carrera del Servicio Civil, mientras que jueces, docentes, militares y policías tienen sus propias leyes orgánicas.',
          'El puesto al que te presentás en este concurso (Auxiliar/Asistente Administrativo en la Dirección de Documentación Central del REC) es un cargo de la Administración Pública central, encuadrado en la carrera del Servicio Civil regulada por la Ley 7445. Es importante para la entrevista poder ubicar tu futuro puesto dentro de esta clasificación constitucional: no sos "empleado de una oficina", sos parte de la carrera del Servicio Civil, con las garantías y obligaciones que eso implica.',
          'Detrás del Art. 101 hay un principio más profundo: la Constitución busca que el Estado funcione con cuadros profesionales estables (de ahí el nombre "carrera"), no con personal que cambia según quién gane las elecciones. La estabilidad del funcionario de carrera —a diferencia de un cargo de confianza política— es la garantía de que el servicio público sigue funcionando aunque cambien los gobiernos.'
        ],
        exercises: [
          {
            question: '¿Cuál de las siguientes NO es una de las siete carreras que enumera el Art. 101 de la Constitución?',
            options: ['Carrera Judicial', 'Carrera del Servicio Civil', 'Carrera Sindical', 'Carrera Docente'],
            correctIndex: 2,
            explanation: 'Las 7 carreras son: Judicial, Docente, Diplomática y Consular, Investigación Científica y Tecnológica, Servicio Civil, Militar y Policial. "Carrera Sindical" no existe como categoría constitucional.'
          },
          {
            question: 'Un puesto administrativo en la Dirección General del Registro del Estado Civil, ¿bajo qué carrera constitucional se encuadra?',
            options: ['Carrera Judicial', 'Carrera del Servicio Civil', 'Carrera Diplomática y Consular', 'Carrera Militar'],
            correctIndex: 1,
            explanation: 'Los cargos administrativos de dependencias del Poder Ejecutivo, como la DGREC, pertenecen a la carrera del Servicio Civil, regulada hoy por la Ley 7445/2025.'
          }
        ]
      },
      {
        id: 'p1-l5',
        title: 'Derecho a la identidad y estado civil (Arts. 49-55, 140, 146-153)',
        summary: 'Protección de la familia, igualdad de los hijos, derechos del niño prevalecientes y nacionalidad natural.',
        level1Simple: 'El Registro Civil es el organismo que materializa el derecho constitucional a la identidad. Sin inscripción no hay cédula, ni escuela, ni voto.',
        level2Norm: 'Art. 49-51: Familia y unión de hecho (estable y singular). Art. 53: Todos los hijos son iguales ante la ley. Se prohíbe cualquier calificación sobre la filiación en documentos personales. Art. 54: Los derechos del niño tienen carácter PREVALECIENTE. Art. 140: Bilingüismo oficial (castellano y guaraní). Art. 146: Nacionalidad paraguaya natural (ius soli, hijos de paraguayos al servicio estatal, expósitos). Art. 152: Ciudadanía desde los 18 años.',
        level3DeskExample: 'Está prohibido por la Constitución que un certificado del Registro Civil diga "hijo natural", "ilegítimo" o "adoptivo". Sólo dice de quién es hijo.',
        keyArticle: 'Arts. 53, 54, 140, 146 CN',
        memoryTips: ['Prohibida la calificación de filiación en documentos', 'Derechos del niño = carácter prevaleciente', 'Nacionalidad desde nacimiento, Ciudadanía desde los 18'],
        deepDive: [
          'El Art. 53 contiene una de las normas más relevantes para tu trabajo diario en el Registro Civil: prohíbe cualquier calificación sobre la naturaleza de la filiación en los documentos de identidad. Antes de esta norma, existían categorías como "hijo legítimo", "hijo natural" o "hijo adoptivo" que aparecían en los papeles y estigmatizaban a las personas según el tipo de vínculo con sus padres. Hoy, un certificado del Registro Civil dice simplemente de quién es hijo una persona, sin adjetivos.',
          'El Art. 54 introduce el concepto de "interés superior del niño" bajo la fórmula de que sus derechos tienen "carácter prevaleciente". Esto no es solo una declaración ética: es un criterio de interpretación jurídica obligatorio. Cuando una norma admite dos lecturas posibles y una involucra a un niño, la autoridad (incluido el Oficial del Registro Civil) debe elegir la interpretación que mejor proteja al menor. Este principio reaparece en el Código Civil (Art. 185, matrimonio putativo) y en la Ley 1/1992 (Art. 2).',
          'La distinción entre nacionalidad y ciudadanía del Art. 146 y 152 se confunde con frecuencia y es un clásico de examen. NACIONALIDAD es el vínculo jurídico-político con el Estado paraguayo, que se adquiere desde el nacimiento (por ius soli, por ser hijo de paraguayos al servicio del Estado en el exterior, o por ser expósito hallado en territorio nacional). CIUDADANÍA es la capacidad política derivada de esa nacionalidad, que se adquiere recién a los 18 años y habilita, por ejemplo, a votar.'
        ],
        exercises: [
          {
            question: '¿Qué prohíbe expresamente el Art. 53 de la Constitución respecto de los hijos?',
            options: ['Prohíbe inscribir hijos extramatrimoniales', 'Prohíbe cualquier calificación sobre la filiación en los documentos personales', 'Prohíbe el reconocimiento tardío de un hijo', 'Prohíbe que un hijo tenga más de un apellido'],
            correctIndex: 1,
            explanation: 'El Art. 53 CN establece que todos los hijos son iguales ante la ley y prohíbe cualquier calificación sobre la naturaleza de la filiación en los documentos personales.'
          },
          {
            question: '¿A partir de qué edad se adquiere la ciudadanía en Paraguay, según el Art. 152 CN?',
            options: ['Desde el nacimiento, igual que la nacionalidad', 'A los 16 años', 'A los 18 años', 'A los 21 años'],
            correctIndex: 2,
            explanation: 'La nacionalidad se adquiere desde el nacimiento, pero la ciudadanía —que habilita derechos políticos como el voto— se adquiere recién a los 18 años (Art. 152 CN).'
          }
        ]
      }
    ]
  },

  // ── N° 2 — Ley 7445/2025 ──
  {
    id: 'oficial-2',
    partNumber: 'N° 2',
    title: 'Ley N° 7445/2025 — De la Función Pública y del Servicio Civil',
    description: 'Principios del servicio civil. Derechos y obligaciones del funcionario. Prohibiciones. Responsabilidad administrativa. Régimen disciplinario. Acceso mediante concursos públicos.',
    lessons: [
      {
        id: 'p2-l1',
        title: 'Principios del servicio civil y autoridad de aplicación (Arts. 1-10)',
        summary: 'Objeto, finalidad de la ley y los siete principios rectores del Art. 10.',
        level1Simple: 'Esta ley reemplazó a la vieja Ley 1626/00. Define cómo se entra, se trabaja y se sale de un cargo público, y qué principios rigen todo eso.',
        level2Norm: 'Art. 10 — LOS SIETE PRINCIPIOS RECTORES: 1) Legalidad, 2) Mérito, 3) Igualdad de oportunidades, 4) Transparencia, 5) Probidad, 6) Eficiencia, 7) Estabilidad. Autoridad de aplicación: la Secretaría de la Función Pública (SFP).',
        level3DeskExample: 'Si dos candidatos empatan en un concurso, el principio de mérito exige elegir por evaluación objetiva, no por conocidos ni recomendaciones.',
        keyArticle: 'Art. 10 Ley 7445',
        memoryTips: ['7 principios: Legalidad, Mérito, Igualdad, Transparencia, Probidad, Eficiencia, Estabilidad'],
        deepDive: [
          'La Ley 7445/2025 es la ley general que regula al Servicio Civil paraguayo y reemplazó a la antigua Ley 1626/00, que estuvo vigente 25 años. Es importante saber esto porque muchas fuentes en internet (libros, artículos, sitios de estudio) todavía citan artículos de la Ley 1626 sin aclarar que fue derogada: siempre verificá que el artículo que estás estudiando corresponda a la Ley 7445/2025 vigente.',
          'Los siete principios rectores del Art. 10 no son una lista aislada de valores: cada uno se traduce después en normas concretas de la propia ley. El principio de MÉRITO se traduce en el Art. 14 (concurso público obligatorio). El principio de TRANSPARENCIA se traduce en las obligaciones de publicidad activa que después vas a ver conectadas con la Ley 5282/2014. El principio de PROBIDAD se traduce en las 18 obligaciones del Art. 51 y las 23 prohibiciones del Art. 52.',
          'La Secretaría de la Función Pública (SFP) es la autoridad de aplicación de la ley: el órgano rector que dicta las políticas generales de recursos humanos del Estado, aunque cada institución (como el Ministerio de Justicia y la DGREC) gestiona internamente su propio personal a través de su Dirección de Talento Humano, respetando siempre el marco general que fija la SFP.'
        ],
        exercises: [
          {
            question: '¿Qué ley reemplazó la Ley 7445/2025?',
            options: ['La Ley 1266/1987', 'La Ley 1626/00', 'La Ley 5282/2014', 'La Ley 1/1992'],
            correctIndex: 1,
            explanation: 'La Ley 7445/2025 derogó y reemplazó a la antigua Ley de la Función Pública N° 1626/00, que estuvo vigente 25 años.'
          },
          {
            question: '¿Cuál de estos NO es uno de los siete principios rectores del Art. 10 de la Ley 7445?',
            options: ['Mérito', 'Probidad', 'Antigüedad', 'Transparencia'],
            correctIndex: 2,
            explanation: 'Los 7 principios son: Legalidad, Mérito, Igualdad de oportunidades, Transparencia, Probidad, Eficiencia y Estabilidad. La "antigüedad" no es uno de ellos.'
          }
        ]
      },
      {
        id: 'p2-l2',
        title: 'Acceso mediante concursos públicos: la única vía (Arts. 12-20)',
        summary: 'Requisitos, inhabilidades, y el concurso público como único mecanismo de ingreso.',
        level1Simple: 'A un cargo público se entra por concurso, no por conocidos. Es la regla constitucional (idoneidad, Art. 47 CN) traducida a esta ley.',
        level2Norm: 'Art. 14 — EL CONCURSO PÚBLICO COMO ÚNICA VÍA de ingreso a la función pública, salvo cargos de confianza expresamente exceptuados. Requisitos generales: nacionalidad paraguaya, mayoría de edad, idoneidad. Inhabilidades: condena penal firme, quiebra fraudulenta, destitución previa. Tres etapas: ingreso -> período de prueba -> estabilidad.',
        level3DeskExample: 'El concurso MJRC-CPIEP-08-2026 al que te presentás es exactamente la vía que exige el Art. 14: concurso público abierto, con evaluación de idoneidad.',
        keyArticle: 'Arts. 14, 17 Ley 7445',
        memoryTips: ['Concurso público = única vía general de ingreso', 'Del ingreso a la estabilidad: 3 etapas'],
        deepDive: [
          'El Art. 14 traduce directamente el Art. 47 inc. 3 de la Constitución (idoneidad como único requisito) en una regla operativa concreta: el concurso público es LA VÍA de ingreso a la función pública. La ley admite excepciones acotadas —cargos de confianza expresamente designados como tales, como asesores directos de una máxima autoridad— pero la regla general y el default es siempre el concurso abierto.',
          'Las tres etapas del recorrido laboral (ingreso, período de prueba, estabilidad) tienen consecuencias jurídicas distintas en cada tramo. Durante el INGRESO, se verifica que el postulante cumpla los requisitos formales. Durante el PERÍODO DE PRUEBA (generalmente los primeros meses), el funcionario puede ser desvinculado con mayor flexibilidad si no demuestra idoneidad. Una vez alcanzada la ESTABILIDAD, el funcionario solo puede ser removido por las causales tasadas de la propia ley (falta grave comprobada en sumario, por ejemplo), no por decisión discrecional de un superior.',
          'Es importante distinguir "concurso público" de "proceso de selección interno": el primero está abierto a cualquier ciudadano que cumpla los requisitos, mientras que ciertos ascensos o promociones pueden regirse por procesos internos entre funcionarios ya en carrera. El concurso al que te presentás (MJRC-CPIEP-08-2026) es un concurso público de ingreso, es decir, abierto a toda la ciudadanía.'
        ],
        exercises: [
          {
            question: 'Según el Art. 14 de la Ley 7445, ¿cuál es la vía general de ingreso a la función pública?',
            options: ['La designación directa de la máxima autoridad', 'El concurso público', 'La antigüedad en otro cargo estatal', 'La recomendación de un funcionario en actividad'],
            correctIndex: 1,
            explanation: 'El Art. 14 establece el concurso público como la vía general y prioritaria de ingreso a la función pública, salvo excepciones acotadas para cargos de confianza.'
          },
          {
            question: '¿Cuáles son las tres etapas que describe la ley desde el ingreso hasta la consolidación laboral del funcionario?',
            options: ['Ingreso, período de prueba, estabilidad', 'Contratación, ascenso, jubilación', 'Selección, capacitación, evaluación', 'Postulación, entrevista, nombramiento'],
            correctIndex: 0,
            explanation: 'La ley describe el recorrido en tres etapas: ingreso, período de prueba y estabilidad, cada una con reglas distintas sobre la permanencia del funcionario.'
          }
        ]
      },
      {
        id: 'p2-l3',
        title: 'Derechos y obligaciones del funcionario (Arts. 43, 51)',
        summary: 'Los catorce derechos individuales y las dieciocho obligaciones.',
        level1Simple: 'El funcionario tiene derechos (estabilidad, sueldo, vacaciones) y obligaciones (puntualidad, probidad, obediencia a la ley).',
        level2Norm: 'Art. 43 — LOS CATORCE DERECHOS: incluyen estabilidad (43.a), remuneración (43.b), vacaciones que no se compensan en dinero y se acumulan hasta 2 años (43.c), descanso semanal de 24 horas consecutivas mínimo (43.e), capacitación. Art. 51 — LAS DIECIOCHO OBLIGACIONES: puntualidad y asistencia (51.d), probidad administrativa (51.g), velar por la conservación del patrimonio institucional (51.r).',
        level3DeskExample: 'Si un funcionario no usa sus vacaciones en 2 años, las pierde a partir del tercero: no se pagan en dinero, solo se acumulan hasta ese límite.',
        keyArticle: 'Arts. 43, 51 Ley 7445',
        memoryTips: ['14 derechos, 18 obligaciones', 'Vacaciones: no se cobran, se acumulan máx. 2 años', 'Descanso semanal: 24 horas mínimo'],
        deepDive: [
          'El Art. 43 lista los catorce derechos individuales del funcionario. Los más preguntados son: (a) estabilidad, (b) remuneración justa, (c) vacaciones anuales no compensables en dinero y acumulables hasta 2 años, (e) descanso semanal mínimo de 24 horas consecutivas, y el derecho a capacitación permanente. Una lógica útil para memorizarlos: se agrupan en derechos ECONÓMICOS (remuneración, viáticos), derechos de BIENESTAR (vacaciones, descanso, salud) y derechos de CARRERA (estabilidad, capacitación, ascenso).',
          'El Art. 51 lista dieciocho obligaciones. Las más citadas en exámenes son la puntualidad y asistencia (51.d), la probidad administrativa —actuar con honestidad y transparencia— (51.g), y velar por la conservación del patrimonio institucional (51.r). Nota importante: las obligaciones no son solo prohibiciones "en negativo": incluyen deberes activos, como cumplir las instrucciones de los superiores dentro del marco legal, y capacitarse.',
          'Sobre las vacaciones: el detalle más preguntado es que NO se compensan en dinero si no se usan, sino que se acumulan hasta un máximo de 2 años. Esto significa que un funcionario que no toma sus vacaciones durante 3 años consecutivos pierde el excedente: no puede cobrarlas ni seguir acumulando indefinidamente. Es una diferencia importante respecto del régimen laboral privado (Código del Trabajo), donde en ciertos casos sí se compensan económicamente.'
        ],
        exercises: [
          {
            question: '¿Qué ocurre con las vacaciones no utilizadas de un funcionario público, según la Ley 7445?',
            options: ['Se pagan en dinero al finalizar el año', 'Se acumulan sin límite', 'Se acumulan hasta un máximo de 2 años, sin compensación en dinero', 'Se pierden automáticamente al finalizar el año'],
            correctIndex: 2,
            explanation: 'El Art. 43.c establece que las vacaciones no se compensan en dinero, pero pueden acumularse hasta un máximo de 2 años.'
          },
          {
            question: '¿Cuál es el descanso semanal mínimo que garantiza el Art. 43.e de la Ley 7445?',
            options: ['12 horas consecutivas', '24 horas consecutivas', '48 horas consecutivas', 'No hay un mínimo fijado'],
            correctIndex: 1,
            explanation: 'El Art. 43.e garantiza un descanso semanal de al menos 24 horas consecutivas.'
          }
        ]
      },
      {
        id: 'p2-l4',
        title: 'Prohibiciones (Art. 52): nepotismo, conflicto de intereses y conducta laboral',
        summary: 'Las veintitrés prohibiciones agrupadas por bloques temáticos.',
        level1Simple: 'Hay 23 cosas que un funcionario tiene prohibido hacer: desde usar recursos del Estado para fines propios hasta contratar a un pariente cercano.',
        level2Norm: 'Bloques del Art. 52: Político-electoral, Corrupción y beneficio indebido, Uso indebido de recursos (52.d — no usar recursos para fines ajenos), Conflicto de intereses, Conducta y ambiente laboral, Nepotismo (52.u y 52.v — no contratar/promover a parientes hasta 4° consanguinidad / 2° afinidad). También prohíbe retirar documentos u objetos institucionales sin autorización (52.o).',
        level3DeskExample: 'Un funcionario no puede promover a su cuñado (2° afinidad) a un cargo de la misma dependencia: es nepotismo prohibido por el Art. 52.u.',
        keyArticle: 'Art. 52 incs. d, o, u, v Ley 7445',
        memoryTips: ['23 prohibiciones en 6 bloques', 'Nepotismo: hasta 4° consanguinidad y 2° afinidad'],
        deepDive: [
          'Las 23 prohibiciones del Art. 52 se agrupan en 6 bloques temáticos: (1) político-electoral (no hacer campaña usando el cargo), (2) corrupción y beneficio indebido (no recibir dádivas), (3) uso indebido de recursos (no usar bienes del Estado para fines personales), (4) conflicto de intereses (no intervenir en asuntos donde tenga interés personal), (5) conducta y ambiente laboral (no acosar, no discriminar), (6) nepotismo (no contratar ni promover parientes cercanos).',
          'El nepotismo (52.u y 52.v) usa exactamente el mismo criterio de parentesco que ya viste en la Parte 0 (glosario): 4° grado de consanguinidad (hasta primos hermanos) y 2° grado de afinidad (hasta cuñados). Este mismo límite de parentesco reaparece en el Art. 30 de la Ley 1266 para las incompatibilidades del Oficial del Registro Civil — es un criterio uniforme que el legislador reutiliza en distintas leyes para resolver el mismo problema: evitar que vínculos familiares interfieran con decisiones públicas.',
          'El inciso 52.o (no retirar documentos u objetos institucionales sin autorización) tiene una conexión directa con tu futuro puesto: trabajarás con libros, actas y expedientes que son propiedad del Estado y patrimonio documental protegido. Sacar un expediente de la oficina sin autorización, aunque sea con buena intención (por ejemplo, para "ayudar" a un ciudadano fuera de horario), es una prohibición expresa que puede derivar en sanción disciplinaria.'
        ],
        exercises: [
          {
            question: 'Un funcionario promueve a su cuñado a un cargo dentro de su misma dependencia. ¿Qué prohibición está infringiendo?',
            options: ['Conflicto de intereses genérico', 'Nepotismo (Art. 52.u/v), porque el cuñado está dentro del 2° grado de afinidad', 'Ninguna, porque el cuñado no es pariente consanguíneo', 'Corrupción y beneficio indebido'],
            correctIndex: 1,
            explanation: 'El cuñado es pariente por afinidad de 2° grado, dentro del límite que prohíbe el nepotismo según el Art. 52.u/v de la Ley 7445.'
          },
          {
            question: '¿En cuántos bloques temáticos se agrupan las 23 prohibiciones del Art. 52?',
            options: ['3 bloques', '6 bloques', '9 bloques', '12 bloques'],
            correctIndex: 1,
            explanation: 'Las 23 prohibiciones se agrupan en 6 bloques: político-electoral, corrupción, uso indebido de recursos, conflicto de intereses, conducta laboral, y nepotismo.'
          }
        ]
      },
      {
        id: 'p2-l5',
        title: 'Responsabilidad administrativa y régimen disciplinario (Arts. 54 a 76)',
        summary: 'Faltas leves vs. faltas graves, y la tabla maestra de sanciones.',
        level1Simple: 'Si el funcionario incumple la ley, responde: desde un llamado de atención (falta leve) hasta la destitución (falta grave).',
        level2Norm: 'Art. 54 y 58: la responsabilidad administrativa nace del incumplimiento de las obligaciones o de una prohibición. Faltas leves: p. ej. dos ausencias injustificadas en el mes. Faltas graves: tres ausencias consecutivas o cinco alternas en el trimestre. Art. 59: falta leve por tardanzas reiteradas. Art. 61: falta grave por ausencias.',
        level3DeskExample: 'Si un funcionario falta injustificadamente 3 días seguidos, incurre en falta grave (Art. 61) y arriesga sanciones que llegan hasta la destitución.',
        keyArticle: 'Arts. 54, 58, 59, 61 Ley 7445',
        memoryTips: ['2 ausencias/mes = falta leve', '3 consecutivas o 5 alternas/trimestre = falta grave'],
        deepDive: [
          'El régimen disciplinario distingue entre FALTAS LEVES y FALTAS GRAVES, y la diferencia no es solo de nombre: tiene consecuencias en el tipo de proceso y en la sanción aplicable. Las faltas leves suelen sancionarse con llamado de atención o apercibimiento escrito, mediante un procedimiento simplificado. Las faltas graves requieren un sumario administrativo formal (con derecho a defensa del funcionario) y pueden derivar en suspensión o destitución.',
          'Los números de ausencias son un clásico de examen: DOS ausencias injustificadas en el mismo mes constituyen falta leve; TRES ausencias consecutivas o CINCO alternas en el trimestre constituyen falta grave. Fijate en el patrón: la gravedad aumenta con la reiteración y con la consecutividad. Faltar tres días seguidos es más grave que faltar tres días separados, porque afecta más la continuidad del servicio.',
          'Es importante no confundir "responsabilidad administrativa" (la que estudiás acá, dentro de la relación laboral con el Estado) con "responsabilidad penal" (por delitos) o "responsabilidad civil" (por daños patrimoniales, la del Art. 106 CN). Un mismo hecho puede generar las tres responsabilidades a la vez —por ejemplo, un funcionario que falsifica una partida puede ser sancionado administrativamente (destitución), penalmente (delito de falsificación de documento público) y civilmente (indemnizar el daño causado)— y son independientes entre sí.'
        ],
        exercises: [
          {
            question: 'Un funcionario falta injustificadamente 3 días seguidos en el mismo mes. ¿Qué tipo de falta comete?',
            options: ['Falta leve, porque son pocos días', 'Falta grave, por ausencias consecutivas', 'No es sancionable si avisa después', 'Falta gravísima automática con destitución inmediata'],
            correctIndex: 1,
            explanation: 'Tres ausencias consecutivas (o cinco alternas en el trimestre) constituyen falta grave según el criterio de la Ley 7445.'
          },
          {
            question: '¿Qué diferencia principal existe entre una falta leve y una falta grave en el régimen disciplinario?',
            options: ['Ninguna, se sancionan igual', 'La falta grave requiere sumario administrativo formal con derecho a defensa; la leve, un procedimiento simplificado', 'La falta leve nunca se sanciona', 'Solo la falta grave se registra en el legajo'],
            correctIndex: 1,
            explanation: 'Las faltas graves requieren un sumario administrativo con garantías de defensa; las leves suelen resolverse con un procedimiento más simple, como un llamado de atención.'
          }
        ]
      }
    ]
  },

  // ── N° 3 — Código Civil (Ley 1183/1985) ──
  {
    id: 'oficial-3',
    partNumber: 'N° 3',
    title: 'Ley N° 1183/1985 — Código Civil de la República del Paraguay',
    description: 'Art. 35 — Prueba del nacimiento y la defunción. Arts. 42 al 51 — Nombre y apellido. Arts. 132 al 190 — Matrimonio y nulidad. Arts. 225 al 243 — Filiación.',
    lessons: [
      {
        id: 'p3c-l1',
        title: 'Art. 35 — Prueba del nacimiento y la defunción',
        summary: 'La escalera de tres escalones para probar que naciste o moriste.',
        level1Simple: 'Primero se prueba con la partida del Registro Civil. Si la persona nació antes de que existiera el Registro, sirve el registro parroquial. Si no hay nada de eso, sirve cualquier otro medio de prueba.',
        level2Norm: 'Art. 35: El nacimiento y la muerte se prueban por: 1° Partidas y certificados del REGISTRO DEL ESTADO CIVIL; 2° si la persona nació/murió antes de que existiera el Registro (antes del 1/8/1889), por certificaciones de REGISTROS PARROQUIALES; 3° a falta de esos registros, o no estando en debida forma, por OTROS MEDIOS DE PRUEBA (testigos, documentos).',
        level3DeskExample: 'Alguien nacido en 1870 prueba su nacimiento con el registro parroquial. Alguien cuyo libro de 1990 se quemó, prueba su nacimiento con otros medios y luego reconstituye la partida (Art. 114 Ley 1266).',
        keyArticle: 'Art. 35 CC',
        memoryTips: ['3 escalones: Partidas del REC -> Registros parroquiales -> Otros medios', 'Se conecta con la reconstitución de libros (Arts. 114-116 Ley 1266)'],
        deepDive: [
          'El Art. 35 organiza un sistema de prueba en cascada, no de opción libre: primero hay que agotar el escalón 1, y solo si es imposible se pasa al escalón 2, y así sucesivamente. Esto refleja una jerarquía de confiabilidad: la partida del Registro Civil es la prueba más fuerte porque nace de un sistema estatal con controles estrictos (formalidades, fe pública, custodia); el registro parroquial es una prueba históricamente aceptada para hechos anteriores a 1889; y "otros medios de prueba" es la válvula de escape para cuando ni siquiera eso existe.',
          'El fundamento histórico del escalón 2 es clave para entenderlo: hasta el 1° de agosto de 1889, Paraguay no tenía un Registro Civil estatal, por lo que los nacimientos, matrimonios y defunciones se documentaban en los libros parroquiales de la Iglesia. El Código no podía dejar sin prueba a millones de personas nacidas antes de esa fecha, así que reconoció esos registros eclesiásticos como prueba válida.',
          'Este artículo conecta directamente con tu trabajo diario: cuando en la Ley 1266 estudies la RECONSTITUCIÓN de libros (Arts. 114-116), vas a ver que ese procedimiento existe precisamente para los casos donde ni siquiera hay partida disponible (se quemó, se perdió, se destruyó) — ahí es donde entra en juego el escalón 3 del Art. 35: "otros medios de prueba" como testigos o documentos indirectos, que sirven de base para reconstruir la partida perdida.'
        ],
        exercises: [
          {
            question: 'Una persona nacida en 1875 necesita probar su nacimiento. Como no existía el Registro Civil estatal en esa fecha, ¿qué prueba corresponde según el Art. 35 del Código Civil?',
            options: ['Solo puede probarlo con testigos', 'Con certificaciones de los registros parroquiales', 'No puede probarse de ninguna forma', 'Con la partida del Registro Civil actual'],
            correctIndex: 1,
            explanation: 'El Art. 35 CC prevé que, para personas nacidas antes del establecimiento del Registro Civil (1889), la prueba válida son las certificaciones de los registros parroquiales.'
          },
          {
            question: '¿En qué orden establece el Art. 35 CC los medios de prueba del nacimiento y la muerte?',
            options: ['Otros medios, registros parroquiales, partidas del REC', 'Partidas del REC, registros parroquiales, otros medios de prueba', 'Solo partidas del REC, sin alternativas', 'Testigos, después partidas del REC'],
            correctIndex: 1,
            explanation: 'El orden de la "escalera de prueba" es: 1° partidas y certificados del Registro del Estado Civil, 2° registros parroquiales (para antes de 1889), 3° otros medios de prueba.'
          }
        ]
      },
      {
        id: 'p3c-l2',
        title: 'Arts. 42 al 51 — Nombre y apellido',
        summary: 'El nombre como derecho y como deber: quién puede cambiarlo y cuándo.',
        level1Simple: 'El nombre es tuyo, pero no podés cambiarlo cuando quieras: solo un juez puede autorizarlo, por una causa justa.',
        level2Norm: 'Art. 42: Toda persona tiene derecho a un nombre y apellido inscriptos en el Registro del Estado Civil. SOLO EL JUEZ puede autorizar, por justa causa, cambios o adiciones. Art. 43: Derecho a suscribir actos con su nombre y adoptar la firma que prefiera. Art. 44: Acción contra el uso indebido del propio nombre, con derecho a indemnización; ejercible también por los parientes en grado sucesible tras el fallecimiento. Art. 45: El cambio o adición del nombre NO altera el estado civil ni prueba la filiación.',
        level3DeskExample: 'Un ciudadano que quiere pasar de "Francisco" a "Fran" en todos sus documentos necesita una sentencia judicial, no basta con pedirlo en el Registro.',
        keyArticle: 'Arts. 42, 43, 44, 45 CC',
        memoryTips: ['Nombre: derecho de la persona + deber hacia la sociedad', 'Solo el JUEZ autoriza cambios', 'Cambiar el nombre no cambia la filiación'],
        deepDive: [
          'El nombre tiene una naturaleza jurídica dual que explica todo este bloque de artículos: es simultáneamente un DERECHO de la persona (nadie puede usurparlo, Art. 44) y un DEBER hacia la sociedad (no puede cambiarse libremente, porque los demás necesitan poder identificar a cada persona de forma estable). Esta tensión entre lo individual y lo social es la que justifica que el cambio de nombre no dependa de la sola voluntad del titular, sino que requiera intervención judicial.',
          'El Art. 44 es más amplio de lo que parece a primera vista: no solo protege contra la usurpación del nombre por otra persona física, sino también contra el uso indebido por personas jurídicas (por ejemplo, una empresa que usa el nombre de alguien sin autorización en publicidad). Además, la acción no muere con el titular: sus parientes en grado sucesible pueden ejercerla después de su fallecimiento, protegiendo así la memoria y el honor del difunto.',
          'El Art. 45 resuelve una duda frecuente: cambiar de nombre NO altera el estado civil ni sirve como prueba de filiación. Esto significa que el nombre es, jurídicamente, independiente del vínculo de filiación: alguien puede cambiar su nombre de pila (con autorización judicial) sin que eso implique ningún cambio en quién es su padre o madre legalmente reconocidos.'
        ],
        exercises: [
          {
            question: '¿Quién es la única autoridad que puede autorizar un cambio o adición en el nombre de una persona, según el Art. 42 CC?',
            options: ['El Oficial del Registro Civil', 'El Director General del REC', 'El Juez, por justa causa', 'La Secretaría de la Función Pública'],
            correctIndex: 2,
            explanation: 'El Art. 42 CC establece que solo el Juez puede autorizar, por justa causa, cambios o adiciones en el nombre y apellido de una persona.'
          },
          {
            question: '¿Qué efecto tiene el cambio o adición del nombre sobre el estado civil de una persona, según el Art. 45 CC?',
            options: ['Lo modifica automáticamente', 'No lo altera, ni constituye prueba de la filiación', 'Lo anula por completo', 'Depende de la edad de la persona'],
            correctIndex: 1,
            explanation: 'El Art. 45 CC aclara que el cambio de nombre no altera el estado ni la condición civil, ni constituye prueba de la filiación.'
          }
        ]
      },
      {
        id: 'p3c-l3',
        title: 'Arts. 132 al 190 — Matrimonio y nulidad',
        summary: 'Impedimentos, matrimonio nulo vs. anulable, y el "matrimonio putativo".',
        level1Simple: 'Un matrimonio puede ser NULO (defecto grave, como un auto sin motor) o ANULABLE (defecto menor, como una rueda pinchada). Si es nulo, no se convalida nunca; si es anulable, se convalida si nadie reclama a tiempo.',
        level2Norm: 'Art. 179: NULO cuando hay impedimento dirimente (parentesco, vínculo anterior subsistente, crimen contra el cónyuge); lo declara el Ministerio Público o cualquier interesado, sin plazo. Art. 181: ANULABLE por falta de edad legal, incapacidad, vicios del consentimiento (error, dolo, violencia) o impotencia; solo a instancia de parte, plazo de 60 DÍAS (Art. 182). Art. 184-185 (matrimonio putativo): la nulidad produce efectos civiles a favor del cónyuge de buena fe y de los hijos; aunque AMBOS cónyuges sean de mala fe, los hijos conservan su calidad. Art. 188: la acción de nulidad solo procede EN VIDA de los esposos. Arts. 189-190 (régimen de bienes): derogados y reemplazados por la Ley 1/1992.',
        level3DeskExample: 'Si se descubre 20 años después que uno de los cónyuges ya estaba casado, el matrimonio es nulo, pero los hijos siguen siendo matrimoniales por el Art. 185 (interés superior del niño).',
        keyArticle: 'Arts. 179, 181, 182, 184, 185, 188 CC',
        memoryTips: ['NULO: grave, sin plazo, cualquiera reclama', 'ANULABLE: 60 días, solo la parte afectada', 'Los hijos nunca pierden su calidad, aunque el matrimonio sea nulo'],
        deepDive: [
          'La distinción NULO/ANULABLE es la misma que viste en el glosario de la Parte 0 (nulidad absoluta vs. relativa), aplicada al matrimonio. Un matrimonio NULO tiene un defecto tan grave (impedimento dirimente: parentesco cercano, vínculo matrimonial anterior no disuelto, o crimen contra el cónyuge anterior) que el orden público exige que cualquier interesado, o el propio Ministerio Público, pueda pedir la nulidad, sin límite de tiempo. Un matrimonio ANULABLE tiene un defecto menor que solo afecta a los cónyuges (falta de edad legal, vicios del consentimiento, impotencia), así que solo ellos pueden reclamar, y con un plazo acotado de 60 días.',
          'La figura del "matrimonio putativo" (Arts. 184-185) es una de las construcciones más elegantes del derecho de familia: protege a quienes actuaron de buena fe frente a una nulidad que no provocaron. Si uno de los cónyuges no sabía del impedimento, el matrimonio anulado sigue produciendo efectos civiles a su favor (como si hubiera sido válido) hasta el momento de la anulación. Y lo más fuerte: incluso si AMBOS cónyuges actuaron de mala fe, los hijos nunca pierden su condición de hijos matrimoniales — es una aplicación directa del interés superior del niño que viste en la Constitución (Art. 54 CN).',
          'El Art. 188 (la acción de nulidad solo procede en vida de los esposos) tiene una razón práctica: si se permitiera anular un matrimonio después de la muerte de uno de los cónyuges, cualquier heredero descontento con el reparto de la herencia podría intentar anular el matrimonio del difunto para excluir al viudo o viuda de la sucesión. La regla protege la estabilidad de las situaciones jurídicas ya consolidadas por el paso del tiempo y la muerte.'
        ],
        exercises: [
          {
            question: 'Se descubre que uno de los cónyuges ya tenía un matrimonio anterior no disuelto al momento de casarse nuevamente. ¿Qué tipo de nulidad corresponde?',
            options: ['Anulabilidad, con plazo de 60 días', 'Nulidad absoluta, por impedimento dirimente, sin plazo', 'No hay nulidad si pasaron más de 10 años', 'Depende de si hay hijos'],
            correctIndex: 1,
            explanation: 'El vínculo matrimonial anterior subsistente es un impedimento dirimente (Art. 179 CC): el matrimonio es nulo (nulidad absoluta), sin plazo para reclamarla.'
          },
          {
            question: 'Un matrimonio es declarado nulo, pero ambos cónyuges actuaron de mala fe. ¿Qué ocurre con los hijos nacidos durante ese matrimonio, según el Art. 185 CC?',
            options: ['Pierden su calidad de hijos matrimoniales', 'Conservan su calidad de hijos matrimoniales, aunque ambos padres sean de mala fe', 'Solo la conservan si uno de los padres era de buena fe', 'Deben reconocerse nuevamente por vía judicial'],
            correctIndex: 1,
            explanation: 'El Art. 185 CC establece que la anulación del matrimonio, aunque ambos cónyuges sean de mala fe, no obsta a la calidad de los hijos: siguen siendo hijos matrimoniales.'
          }
        ]
      },
      {
        id: 'p3c-l4',
        title: 'Arts. 225 al 243 — La filiación',
        summary: 'Los números 180 y 300 días, la posesión de estado y la acción de filiación.',
        level1Simple: 'El derecho no puede saber con certeza quién es el padre biológico, así que usa reglas de plazos para presumirlo: 180 días es el mínimo de un embarazo, 300 días el máximo.',
        level2Norm: 'Art. 225: son hijos matrimoniales los nacidos después de 180 DÍAS de la celebración del matrimonio y dentro de los 300 DÍAS siguientes a su disolución o anulación. Arts. 227-228: las presunciones sobre en cuál de dos matrimonios sucesivos fue concebido el hijo NO ADMITEN PRUEBA EN CONTRARIO (presunción iure et de iure). Posesión de estado: se prueba con NOMEN, TRACTATUS y FAMA (nombre, trato y fama pública como hijo) y puede suplir el reconocimiento expreso. Art. 242: la filiación se prueba con la inscripción del nacimiento en el Registro Civil. Impugnación de paternidad: 60 DÍAS desde que se conoce el hecho.',
        level3DeskExample: 'Si un chico nace 200 días después del casamiento de sus padres, se presume hijo matrimonial: cae dentro de la ventana de 180 a 300 días.',
        keyArticle: 'Arts. 225, 227, 228, 242 CC',
        memoryTips: ['180 días = mínimo embarazo viable', '300 días = máximo embarazo posible', 'Posesión de estado = Nomen + Tractatus + Fama', 'La filiación se prueba con la inscripción del nacimiento (Art. 242)'],
        deepDive: [
          'El sistema de los 180/300 días existía porque, antes de los estudios de ADN, la única forma de determinar la paternidad era una presunción basada en plazos biológicos. La lógica es simple: un embarazo dura como mínimo 180 días (unos 6 meses) y como máximo 300 días (10 meses). Si un hijo nace dentro de la ventana entre 180 días desde la boda y 300 días desde el fin del matrimonio, se presume concebido dentro de ese matrimonio y, por tanto, hijo del marido.',
          'La presunción de los Arts. 227-228 (matrimonios sucesivos de la madre) es "iure et de iure": NO ADMITE PRUEBA EN CONTRARIO. Esto puede parecer injusto en un caso individual, pero tiene una razón de política legislativa: si se permitiera discutir eternamente en cuál de dos matrimonios fue concebido un hijo, quedaría en un limbo jurídico sin padre determinado. La ley prefiere una regla clara y previsible, aunque en algún caso excepcional pueda no coincidir con la verdad biológica.',
          'La "posesión de estado" (nomen, tractatus, fama) es un concepto que aparece también fuera del Código Civil: es la prueba de que alguien ha sido tratado públicamente como hijo de una persona, aunque falte el reconocimiento formal. NOMEN significa que lleva el apellido; TRACTATUS significa que fue tratado como hijo (educación, cuidados, presentación social); FAMA significa que la comunidad lo reconoce como tal. Los tres elementos juntos pueden suplir el reconocimiento expreso en ciertos casos del Art. 225.'
        ],
        exercises: [
          {
            question: 'Un niño nace 250 días después de la celebración del matrimonio de sus padres. Según la lógica de los plazos del Art. 225 CC, ¿qué se presume?',
            options: ['Que no es hijo matrimonial, por ser un plazo raro', 'Que es hijo matrimonial, porque cae dentro de la ventana de 180 a 300 días', 'Que hace falta un estudio de ADN obligatorio', 'Que es hijo extramatrimonial automáticamente'],
            correctIndex: 1,
            explanation: 'Al nacer después de los 180 días mínimos y dentro de los 300 días posteriores (en este caso, durante el matrimonio), se presume hijo matrimonial conforme al Art. 225.'
          },
          {
            question: '¿Qué significa que las presunciones de los Arts. 227 y 228 del Código Civil sean "iure et de iure"?',
            options: ['Que se pueden discutir libremente con cualquier prueba', 'Que no admiten prueba en contrario', 'Que solo aplican si hay acuerdo entre las partes', 'Que caducan a los 60 días'],
            correctIndex: 1,
            explanation: 'Una presunción "iure et de iure" no admite prueba en contrario: es una regla absoluta que la ley impone para evitar que un hijo quede sin filiación determinada.'
          }
        ]
      }
    ]
  },

  // ── N° 4 — Ley 1/1992 ──
  {
    id: 'oficial-4',
    partNumber: 'N° 4',
    title: 'Ley N° 1/1992 — De la Reforma Parcial del Código Civil',
    description: 'Art. 1 — Igualdad de capacidad civil. Art. 2 — Principios generales. Arts. 4 al 21 — Matrimonio. Arts. 75 al 94 — Unión de hecho (concubinato). Arts. 95 al 97 — Bien de familia.',
    lessons: [
      {
        id: 'p4a-l1',
        title: 'Art. 1 — Igualdad de capacidad civil',
        summary: 'La ley que tradujo el Art. 48 de la Constitución al derecho de familia.',
        level1Simple: 'Antes de esta ley, casarse le reducía derechos a la mujer. La Ley 1/92, sancionada 5 días después de la Constitución de 1992, terminó con eso.',
        level2Norm: 'Art. 1: "La mujer y el varón tienen igual capacidad de goce y de ejercicio de los derechos civiles, cualquiera sea su estado civil." Capacidad de GOCE: poder ser titular de un derecho. Capacidad de EJERCICIO: poder ejercerlo por sí mismo, sin representante. Antes de la ley, la mujer casada tenía capacidad de goce pero no de ejercicio pleno (el marido administraba los bienes).',
        level3DeskExample: 'Antes de 1992, una mujer casada podía ser dueña de una casa (goce) pero no venderla sin autorización del marido (ejercicio). Hoy puede hacer ambas cosas libremente.',
        keyArticle: 'Art. 1 Ley 1/92',
        memoryTips: ['Memorizar textual: "igual capacidad de goce y de ejercicio... cualquiera sea su estado civil"', 'Goce = ser titular / Ejercicio = poder actuar sin autorización'],
        deepDive: [
          'La Ley 1/1992 fue sancionada el 25 de junio de 1992, apenas 5 días después de la Constitución (20 de junio de 1992). Esto no es casualidad: la Constitución proclamó en su Art. 48 la igualdad de derechos civiles entre hombre y mujer, pero el Código Civil de 1985 seguía diciendo otra cosa — la mujer casada tenía capacidad limitada, el marido administraba los bienes de la sociedad conyugal, y llevar su apellido era obligatorio. La Ley 1/92 es, literalmente, la traducción del Art. 48 constitucional al derecho de familia.',
          'La distinción entre capacidad de GOCE y capacidad de EJERCICIO es la clave técnica de todo el artículo. Antes de la ley, el problema no era que la mujer casada no pudiera ser dueña de bienes (eso sí lo era: tenía capacidad de goce). El problema era que no podía disponer de ellos libremente sin autorización del marido (le faltaba capacidad de ejercicio plena). La ley iguala ambas capacidades entre hombre y mujer.',
          'El remate del artículo — "cualquiera sea su estado civil" — es tan importante como la igualdad de género en sí: antes de 1992, el solo hecho de CASARSE reducía la capacidad jurídica de la mujer. Con esta ley, una mujer soltera, casada, viuda o divorciada tiene exactamente la misma capacidad civil: el matrimonio dejó de ser una causa de restricción de derechos.'
        ],
        exercises: [
          {
            question: '¿Cuántos días después de la sanción de la Constitución de 1992 se sancionó la Ley 1/1992?',
            options: ['5 días', '30 días', '90 días', '1 año'],
            correctIndex: 0,
            explanation: 'La Constitución fue sancionada el 20 de junio de 1992 y la Ley 1/1992, apenas 5 días después, el 25 de junio de 1992, traduciendo el Art. 48 CN al derecho de familia.'
          },
          {
            question: 'Antes de la Ley 1/1992, ¿qué tipo de capacidad le faltaba a la mujer casada respecto de sus bienes?',
            options: ['Capacidad de goce (no podía ser dueña de nada)', 'Capacidad de ejercicio (no podía disponer de ellos sin autorización del marido)', 'Ninguna: tenía capacidad plena', 'Solo le faltaba capacidad para heredar'],
            correctIndex: 1,
            explanation: 'La mujer casada sí tenía capacidad de goce (podía ser titular de bienes), pero le faltaba capacidad de ejercicio plena: necesitaba autorización del marido para disponer de ellos.'
          }
        ]
      },
      {
        id: 'p4a-l2',
        title: 'Art. 2 — Principios generales de interpretación',
        summary: 'Los tres principios que guían la aplicación de la ley de familia.',
        level1Simple: 'Ante cualquier duda al aplicar esta ley, hay que priorizar la unidad familiar y el bienestar de los hijos menores.',
        level2Norm: 'Art. 2 — Principios fundamentales de interpretación: 1) La unidad de la familia. 2) El bienestar y protección de los hijos menores. 3) La igualdad de derechos y obligaciones de los cónyuges.',
        level3DeskExample: 'Si una norma de esta ley admite dos lecturas posibles, el Oficial y el juez deben elegir la que mejor proteja a los hijos menores.',
        keyArticle: 'Art. 2 Ley 1/92',
        memoryTips: ['3 principios: Unidad familiar, Bienestar de los hijos, Igualdad entre cónyuges'],
        deepDive: [
          'El Art. 2 no regula una situación concreta: establece los criterios de interpretación que deben guiar a jueces, oficiales del Registro Civil y cualquier operador jurídico cuando aplican esta ley. Es un artículo "de segundo piso": no dice qué hacer en un caso específico, sino cómo decidir cuando la norma específica admite más de una lectura posible.',
          'El principio del bienestar de los hijos menores conecta directamente con lo que ya viste en la Constitución (Art. 54, carácter prevaleciente de los derechos del niño) y en el Código Civil (Art. 185, matrimonio putativo). Es el mismo hilo conductor que atraviesa las tres normas: cuando hay conflicto entre el interés de los adultos y el de los niños involucrados, el sistema jurídico paraguayo prioriza sistemáticamente a los niños.',
          'El tercer principio (igualdad de derechos y obligaciones de los cónyuges) es el que da coherencia a toda la reforma de 1992: no basta con declarar la igualdad en el Art. 1, hace falta que esa igualdad se aplique como criterio rector en cada duda de interpretación posterior sobre matrimonio, régimen de bienes, o cualquier otro instituto regulado por la ley.'
        ],
        exercises: [
          {
            question: '¿Cuál de los siguientes es uno de los tres principios de interpretación del Art. 2 de la Ley 1/92?',
            options: ['La preferencia por el cónyuge de mayor edad', 'El bienestar y protección de los hijos menores', 'La preferencia por el régimen de separación de bienes', 'La prioridad del interés económico sobre el familiar'],
            correctIndex: 1,
            explanation: 'El Art. 2 establece tres principios: la unidad de la familia, el bienestar y protección de los hijos menores, y la igualdad de derechos y obligaciones de los cónyuges.'
          },
          {
            question: '¿Para qué sirve, en la práctica, el Art. 2 de la Ley 1/92?',
            options: ['Para fijar el régimen de bienes por defecto', 'Para guiar la interpretación de la ley cuando admite más de una lectura posible', 'Para definir los impedimentos matrimoniales', 'Para regular el divorcio'],
            correctIndex: 1,
            explanation: 'El Art. 2 no regula un caso concreto: fija los principios que deben orientar la interpretación de toda la ley ante dudas o vacíos.'
          }
        ]
      },
      {
        id: 'p4a-l3',
        title: 'Arts. 4 al 21 — El matrimonio: disposiciones, capacidad e impedimentos',
        summary: 'Requisitos, edad mínima y régimen patrimonial supletorio.',
        level1Simple: 'Para casarse hace falta ser mayor de 18 años (16 con dispensa) y no tener impedimentos. Si los novios no eligen régimen de bienes, se aplica automáticamente el de comunidad de gananciales.',
        level2Norm: 'Arts. 3-16: disposiciones generales del matrimonio. Arts. 17-21: capacidad e impedimentos (edad matrimonial: 18 años, 16 con dispensa judicial). Régimen patrimonial supletorio (Arts. 22-29 y 30-59): si los cónyuges no pactan otro régimen antes de casarse, se aplica la COMUNIDAD DE GANANCIALES bajo administración conjunta. El Oficial tiene la obligación de informar esto antes de celebrar la boda.',
        level3DeskExample: 'Una pareja que se casa sin firmar convenio prenupcial queda automáticamente bajo comunidad de gananciales: lo que ganen durante el matrimonio se reparte por mitades si se divorcian.',
        keyArticle: 'Arts. 17, 22, 24, 25 Ley 1/92',
        memoryTips: ['Edad matrimonio: 18 años (16 con dispensa)', 'Sin pacto = régimen supletorio de comunidad de gananciales'],
        deepDive: [
          'Los impedimentos matrimoniales del bloque de capacidad (Arts. 17-21) son las condiciones que deben cumplirse para casarse válidamente: edad mínima, ausencia de vínculo matrimonial anterior no disuelto, ausencia de parentesco prohibido, y capacidad mental para consentir. La edad de 18 años es la regla general, pero existe la posibilidad de dispensa judicial para menores de entre 16 y 18 años en casos justificados.',
          'El régimen patrimonial del matrimonio es uno de los temas más preguntados de esta ley porque tiene una regla "por defecto" muy importante: si los novios NO firman una convención prenupcial eligiendo otro régimen (separación de bienes, por ejemplo), automáticamente se aplica el régimen SUPLETORIO de comunidad de gananciales, con administración conjunta de los bienes adquiridos durante el matrimonio.',
          'El Oficial del Registro Civil tiene una obligación activa en este punto: debe INFORMAR a los futuros contrayentes sobre las opciones de régimen patrimonial antes de la celebración del matrimonio, porque muchas parejas desconocen que existe una alternativa al régimen supletorio y que, una vez casados sin pacto, quedan automáticamente bajo comunidad de gananciales.'
        ],
        exercises: [
          {
            question: '¿Qué régimen patrimonial se aplica automáticamente a un matrimonio que no firmó ningún convenio prenupcial?',
            options: ['Separación total de bienes', 'Comunidad de gananciales bajo administración conjunta', 'No existe régimen si no se pactó nada', 'El régimen lo decide el Juez caso por caso'],
            correctIndex: 1,
            explanation: 'A falta de pacto, se aplica el régimen supletorio de comunidad de gananciales con administración conjunta (Arts. 22-29 y 30-59 Ley 1/92).'
          },
          {
            question: '¿Cuál es la edad mínima general para contraer matrimonio según la Ley 1/92, y qué excepción existe?',
            options: ['21 años, sin excepciones', '18 años, con posibilidad de dispensa judicial desde los 16', '16 años, sin excepciones', '18 años, sin ninguna excepción posible'],
            correctIndex: 1,
            explanation: 'La edad matrimonial general es 18 años, pero se admite dispensa judicial para contraer matrimonio desde los 16 años en casos justificados.'
          }
        ]
      },
      {
        id: 'p4a-l4',
        title: 'Arts. 75 al 94 — Unión de hecho o concubinato',
        summary: 'Los requisitos y los plazos de 4 y 10 años que la definen.',
        level1Simple: 'Una pareja que convive de forma estable, pública y con un solo compañero (no varios a la vez) tiene, con el tiempo, casi los mismos derechos que un matrimonio.',
        level2Norm: 'Arts. 83-94: la unión de hecho debe ser estable, pública y singular (entre un hombre y una mujer sin impedimento para casarse). A los 4 AÑOS de convivencia (o antes si hay hijos comunes), genera derechos sobre bienes gananciales y sucesorios equivalentes al matrimonio. A los 10 AÑOS, puede inscribirse y equipararse plenamente al matrimonio para todos los efectos legales.',
        level3DeskExample: 'Una pareja que convive 6 años sin casarse ya tiene derecho a los bienes gananciales adquiridos juntos, aunque todavía no llegó a los 10 años para la equiparación total.',
        keyArticle: 'Arts. 83, 86 Ley 1/92',
        memoryTips: ['Unión de hecho: estable + pública + singular', '4 años = derechos patrimoniales/sucesorios', '10 años = equiparación total al matrimonio'],
        deepDive: [
          'Los tres requisitos de la unión de hecho —estable, pública y singular— filtran qué convivencias tienen protección legal. ESTABLE excluye relaciones ocasionales o intermitentes. PÚBLICA excluye relaciones clandestinas u ocultas. SINGULAR excluye la simultaneidad: no puede reconocerse como concubinato si uno de los convivientes mantiene, al mismo tiempo, otra unión o matrimonio vigente.',
          'Los plazos de 4 y 10 años marcan dos niveles distintos de protección jurídica. A los 4 AÑOS de convivencia (o antes, si hay hijos comunes que aceleran el reconocimiento), la pareja ya genera derechos sobre bienes gananciales adquiridos durante la unión y derechos sucesorios equivalentes a los de un cónyuge. A los 10 AÑOS, la unión puede inscribirse formalmente y equipararse en TODOS los efectos legales al matrimonio civil — es el nivel más alto de reconocimiento que otorga esta figura.',
          'Esta regulación conecta con la Ley 6618/2020 que estudiarás más adelante: el "concubino" es uno de los cinco estados civiles legales reconocidos en Paraguay, y su definición remite exactamente a estos artículos de la Ley 1/92 (83 y siguientes). También conecta con el Art. 51 de la Constitución, que ya reconoce a la familia formada por unión de hecho estable y singular como merecedora de protección constitucional.'
        ],
        exercises: [
          {
            question: '¿Cuáles son los tres requisitos que debe cumplir una unión de hecho para ser reconocida legalmente?',
            options: ['Ser estable, pública y singular', 'Tener hijos, ser registrada y durar más de 5 años', 'Ser secreta, breve y sin hijos', 'Solo requiere convivencia, sin más condiciones'],
            correctIndex: 0,
            explanation: 'La unión de hecho debe ser estable (no ocasional), pública (no oculta) y singular (sin simultaneidad con otra unión o matrimonio).'
          },
          {
            question: 'Una pareja convive en unión de hecho estable y singular durante 10 años. ¿Qué efecto jurídico alcanza según la Ley 1/92?',
            options: ['Ningún efecto especial, sigue igual que a los 2 años', 'Solo derechos sobre bienes gananciales', 'Puede inscribirse y equipararse plenamente al matrimonio en todos sus efectos', 'Automáticamente se convierte en matrimonio sin trámite alguno'],
            correctIndex: 2,
            explanation: 'A los 10 años de unión de hecho, la pareja puede inscribirla y equipararla en todos los efectos legales al matrimonio civil.'
          }
        ]
      },
      {
        id: 'p4a-l5',
        title: 'Arts. 95 al 97 — Bien de familia',
        summary: 'La protección legal de la vivienda familiar frente a los acreedores.',
        level1Simple: 'La casa donde vive la familia puede protegerse legalmente para que no se la puedan quitar por deudas.',
        level2Norm: 'Arts. 95-97: el "bien de familia" es un inmueble destinado a vivienda o explotación familiar que, una vez constituido conforme a la ley, queda protegido de embargos y ejecuciones por deudas posteriores a su constitución (con excepciones como deudas por impuestos del propio inmueble).',
        level3DeskExample: 'Una familia inscribe su casa como bien de familia; si el padre contrae una deuda comercial después, esa deuda no puede cobrarse rematando la vivienda familiar.',
        keyArticle: 'Arts. 95-97 Ley 1/92',
        memoryTips: ['Bien de familia = protección de la vivienda contra embargos', 'Debe constituirse formalmente, no es automático'],
        deepDive: [
          'El "bien de familia" es una figura protectora que existe en casi todos los sistemas de derecho civil latinoamericanos, con distintos nombres (homestead en el derecho anglosajón, patrimonio familiar en otros países). La idea central es simple: la vivienda donde vive una familia no debería poder rematarse por deudas comerciales o personales del titular, para que un problema económico no derive en la pérdida del techo.',
          'Es fundamental entender que esta protección NO ES AUTOMÁTICA: el inmueble debe constituirse formalmente como bien de familia siguiendo el procedimiento que marca la ley (generalmente inscripción registral especial). Una casa cualquiera, sin ese trámite, no goza de esta protección y puede ser embargada como cualquier otro bien del patrimonio del deudor.',
          'La protección tiene excepciones importantes que conviene conocer: no protege frente a deudas que graven específicamente el propio inmueble (por ejemplo, impuestos inmobiliarios impagos, o un crédito hipotecario tomado para construir esa misma vivienda), porque en esos casos la deuda está directamente vinculada al bien protegido, no es una deuda externa.'
        ],
        exercises: [
          {
            question: '¿Qué protege la figura del "bien de familia" regulada en los Arts. 95-97 de la Ley 1/92?',
            options: ['El salario del titular', 'La vivienda familiar frente a embargos por deudas posteriores a su constitución', 'Los ahorros bancarios', 'Los bienes muebles del hogar'],
            correctIndex: 1,
            explanation: 'El bien de familia protege el inmueble destinado a vivienda o explotación familiar frente a embargos y ejecuciones por deudas contraídas después de su constitución.'
          },
          {
            question: '¿La protección del bien de familia es automática para cualquier vivienda?',
            options: ['Sí, automáticamente desde que la familia se muda a vivir ahí', 'No, requiere constituirse formalmente conforme al procedimiento legal', 'Solo si la familia tiene más de 3 hijos', 'Solo para viviendas rurales'],
            correctIndex: 1,
            explanation: 'La protección no es automática: el inmueble debe constituirse formalmente como bien de familia siguiendo el procedimiento legal correspondiente.'
          }
        ]
      }
    ]
  },

  // ── N° 5 — Ley 1266/1987 ──
  {
    id: 'oficial-5',
    partNumber: 'N° 5',
    title: 'Ley N° 1266/1987 — Del Registro del Estado Civil',
    description: 'Organización del Registro. Funciones de la Dirección General. Competencias de los Oficiales Registrales. Libros registrales. Inscripción de nacimientos, matrimonios y defunciones. Rectificaciones, cancelaciones y archivo. Expedición de certificados.',
    lessons: [
      {
        id: 'p5l-l1',
        title: 'Organización, autoridad y días hábiles (Arts. 1 a 13)',
        summary: 'De quién depende la DGREC, requisitos del Director General y el Art. 6 de días hábiles.',
        level1Simple: 'El Registro Civil es la institución que convierte los hechos de la vida (nacer, casarse, morir) en derechos jurídicos exigibles.',
        level2Norm: 'Art. 1: Depende del Ministerio de Justicia. Art. 6: "Todos los días son considerados HÁBILES para las inscripciones en el Registro del Estado Civil". Se establecen turnos para feriados. Art. 7: Director General debe ser ABOGADO y tener mínimo 30 AÑOS. Art. 9.d: Atribuciones del Director (Reconstituir, Rectificar admin y Convalidar con dictamen previo de Asesoría Jurídica). Art. 13: El Oficial NO puede dejar el cargo sin entregar los libros bajo inventario.',
        level3DeskExample: 'Aunque las oficinas administrativas cierren el domingo, el servicio de inscripciones del REC tiene turnos porque la gente nace y muere todos los días.',
        keyArticle: 'Arts. 6, 7, 9.d, 13 Ley 1266',
        memoryTips: ['Para inscripciones: TODOS LOS DÍAS SON HÁBILES', 'Director General: Abogado, min 30 años', 'Entrega de libros bajo inventario es obligatoria antes de irse'],
        deepDive: [
          'El Art. 6 (todos los días son hábiles para inscripciones) es una excepción notable a la regla general de "días hábiles" que rige la mayoría de los trámites administrativos del Estado. La razón es evidente: los nacimientos y las defunciones no respetan fines de semana ni feriados, así que el servicio de inscripciones debe estar disponible siempre, mediante un sistema de turnos que garantiza cobertura incluso en días no laborables para el resto de la administración pública.',
          'El requisito de que el Director General sea ABOGADO con al menos 30 años de edad no es casual: refleja que el cargo implica tomar decisiones jurídicas complejas —como resolver rectificaciones administrativas de partidas, con dictamen de Asesoría Jurídica— que requieren formación legal específica. Es un requisito más exigente que el de un Oficial de Registro Civil común (que solo necesita secundaria concluida, según verás en el Decreto 19.102).',
          'El Art. 13 (entrega de libros bajo inventario) es una norma de control patrimonial: ningún Oficial puede dejar su cargo sin entregar formalmente, mediante inventario detallado, todos los libros y documentos bajo su custodia. Esto protege contra la pérdida o sustracción de documentos en los momentos de transición entre un funcionario saliente y su reemplazo, que son precisamente los momentos de mayor riesgo de irregularidades.'
        ],
        exercises: [
          {
            question: '¿Qué días son considerados hábiles para las inscripciones en el Registro del Estado Civil, según el Art. 6 de la Ley 1266?',
            options: ['Solo de lunes a viernes', 'Todos los días, incluidos fines de semana y feriados, mediante turnos', 'Solo los días de atención al público', 'Depende de cada oficina regional'],
            correctIndex: 1,
            explanation: 'El Art. 6 establece que todos los días son considerados hábiles para las inscripciones, con un sistema de turnos para feriados, porque los hechos vitales no respetan calendario.'
          },
          {
            question: '¿Qué requisitos exige la ley para ser Director General del Registro del Estado Civil?',
            options: ['Ser mayor de 18 años y tener secundaria', 'Ser abogado y tener al menos 30 años', 'Ser paraguayo natural, sin más requisitos', 'No hay requisitos específicos'],
            correctIndex: 1,
            explanation: 'El Art. 7 de la Ley 1266 exige que el Director General sea abogado y tenga como mínimo 30 años de edad.'
          }
        ]
      },
      {
        id: 'p5l-l2',
        title: 'De los libros del Registro Civil y formalidades de las actas (Arts. 18 a 31)',
        summary: '4 Libros separados, por duplicado, prohibiciones formales del Art. 26 y los 5 elementos del Art. 27.',
        level1Simple: 'Las partidas del Registro Civil son instrumentos públicos con fe pública. Para evitar fraudes, está estrictamente prohibido usar números, abreviaturas o tachaduras.',
        level2Norm: 'Art. 18: Libros SEPARADOS (Nacimientos, Adopciones -solo Dirección General-, Matrimonios, Defunciones) por DUPLICADO y en el mismo acto. Cierre anual a fin de año (Art. 20). Art. 21: Inscripción en libro NO rubricado = NULA + SEPARACIÓN del Oficial. Art. 26: Prohibidos guarismos (números en cifra), abreviaturas, raspaduras y espacios en blanco. Art. 27 (LOS 5 ELEMENTOS): 1. Lugar/día/mes/año/hora, 2. Nombre/apellido/domicilio de comparecientes, 3. Naturaleza de inscripción, 4. Forma de acreditar identidad, 5. Firmas en ambos libros. Art. 30: Incompatibilidad del oficial (4° consanguinidad / 2° afinidad). Art. 31: Las partidas son INSTRUMENTOS PÚBLICOS.',
        level3DeskExample: 'En un acta se escribe "ocho de agosto del año dos mil veintiséis" y NO "08/08/2026". Las cifras numéricas son guarismos prohibidos.',
        keyArticle: 'Arts. 18, 21, 26, 27, 30, 31 Ley 1266',
        memoryTips: ['4 Libros: Nacimiento, Adopción (solo Dir Gen), Matrimonio, Defunción', 'Prohibidos: Guarismos, Abreviaturas, Raspaduras, Espacios en blanco', 'Inscripto en libro no rubricado = NULO'],
        deepDive: [
          'La prohibición de guarismos (números en cifra), abreviaturas, raspaduras y espacios en blanco (Art. 26) no es un capricho formalista: cada una previene un tipo específico de fraude. Un "1" escrito en cifra se convierte fácilmente en "7" con un trazo adicional; una abreviatura como "Fco." puede generar ambigüedad sobre si el nombre completo es "Francisco" o "Francisca"; una raspadura permite borrar y reescribir sin dejar rastro visible; y un espacio en blanco permite insertar texto después de la firma. Escribir todo en letras, sin abreviar y sin espacios, es la técnica clásica anti-falsificación de los instrumentos públicos.',
          'Los "5 elementos" del Art. 27 son la estructura obligatoria de cualquier acta: (1) lugar, día, mes, año y hora del acto; (2) nombre, apellido y domicilio de los comparecientes; (3) naturaleza jurídica de la inscripción (qué hecho se está registrando); (4) forma en que se acreditó la identidad de los comparecientes; (5) firmas, que deben constar en AMBOS ejemplares del libro (recordá que se lleva por duplicado, Art. 18).',
          'La sanción del Art. 21 es severa a propósito: una inscripción hecha en un libro no rubricado es NULA, y además implica la SEPARACIÓN del Oficial responsable. Esto se explica porque la rúbrica (firma y sello de habilitación en cada página del libro por parte de la autoridad competente) es la que garantiza que ese libro es auténtico y que nadie pudo sustituirlo por uno falso. Sin rúbrica, no hay garantía de autenticidad, así que la ley no permite ninguna excepción: la nulidad es automática.'
        ],
        exercises: [
          {
            question: '¿Por qué el Art. 26 de la Ley 1266 prohíbe usar guarismos (números en cifra) en las actas del Registro Civil?',
            options: ['Por tradición, sin razón práctica', 'Porque un número en cifra se puede alterar fácilmente (ej: "1" a "7")', 'Porque los números ocupan más espacio', 'Porque la ley exige que todo se escriba en guaraní'],
            correctIndex: 1,
            explanation: 'Los números en cifra son fácilmente alterables con un trazo adicional, por eso se exige escribir todo en letras, como medida anti-falsificación.'
          },
          {
            question: '¿Qué consecuencia tiene inscribir un acta en un libro que no fue debidamente rubricado, según el Art. 21?',
            options: ['Ninguna, es solo una irregularidad menor', 'La inscripción es nula y el Oficial responsable es separado del cargo', 'Se debe corregir con una nota marginal', 'Se convalida automáticamente a los 30 días'],
            correctIndex: 1,
            explanation: 'El Art. 21 sanciona con nulidad la inscripción hecha en libro no rubricado, y además dispone la separación del Oficial responsable.'
          }
        ]
      },
      {
        id: 'p5l-l3',
        title: 'Inscripción de nacimientos: denuncia vs. declaración y plazos (Arts. 50 a 63)',
        summary: 'Diferencia crucial entre denuncia médica y declaración de los padres, inscripciones oportunas y tardías.',
        level1Simple: 'El médico DENUNCIA el hecho biológico (no inscribe). Los padres DECLARAN el nacimiento ante el Oficial (produce la inscripción).',
        level2Norm: 'DENUNCIA (Art. 52): Médicos, parteras, directores de hospitales a los 7 DÍAS. NO tiene valor como inscripción. DECLARACIÓN (Art. 53): Padres o parientes mayores. Produce la inscripción. Plazos Oportunos (Art. 54): Hasta 30 DÍAS en Capital / 60 DÍAS en el interior. INSCRIPCIÓN TARDÍA (Art. 54): Desde 30/60 días HASTA LOS 15 AÑOS. Art. 56: Límites al nombre (Máximo 3 nombres, no ridículos, no inductores a error de sexo). Art. 57: Requisito ("que el nacido haya vivido siquiera un instante después de la separación de la madre"). Art. 65: Poner el nombre del padre/madre en la partida a su indicación es SUFICIENTE RECONOCIMIENTO.',
        level3DeskExample: 'Si un niño tiene 10 años y nunca fue inscripto, se realiza una Inscripción Tardía Administrativa. Si tiene 16 años, ya requiere trámite judicial.',
        keyArticle: 'Arts. 52, 53, 54, 56, 57, 65 Ley 1266',
        memoryTips: ['Denuncia = Médicos (7 días, NO inscribe)', 'Declaración = Padres (30/60 días, SÍ inscribe)', 'Tardía = hasta los 15 años', 'Máximo 3 nombres', 'Siquiera un instante con vida'],
        deepDive: [
          'La diferencia entre DENUNCIA y DECLARACIÓN es una de las más preguntadas de todo el temario, porque son dos actos distintos hechos por personas distintas, con efectos jurídicos distintos. El médico, la partera o el director del hospital DENUNCIAN el hecho biológico del nacimiento dentro de 7 días — es un aviso informativo, pero NO produce por sí mismo la inscripción. Son los PADRES (o parientes mayores en su ausencia) quienes DECLARAN el nacimiento ante el Oficial, y es esa declaración la que efectivamente genera la inscripción en el libro.',
          'Los plazos de inscripción oportuna (30 días en Capital, 60 en el interior) reflejan una realidad geográfica: en el interior del país, las distancias hasta la oficina del Registro Civil más cercana pueden ser mayores, así que la ley da el doble de tiempo. Pasados esos plazos, no se pierde el derecho a inscribir: se entra en el régimen de INSCRIPCIÓN TARDÍA, que sigue siendo administrativa hasta los 15 años de edad del niño — recién después de esa edad el trámite requiere intervención judicial.',
          'El requisito del Art. 57 ("que el nacido haya vivido siquiera un instante después de la separación de la madre") distingue el nacimiento con vida (que se inscribe como nacimiento, y eventualmente como defunción si el bebé fallece después) del "nacido muerto" (que, según verás en la Ley 1266 sobre defunciones, NO se inscribe como tal). Es una distinción jurídica sutil pero con enorme importancia práctica para la familia, incluyendo efectos sucesorios.'
        ],
        exercises: [
          {
            question: 'Un médico informa el nacimiento de un bebé dentro de las 48 horas. ¿Este acto produce la inscripción del nacimiento?',
            options: ['Sí, automáticamente', 'No: es una denuncia, no tiene valor de inscripción; la inscripción requiere la declaración de los padres', 'Solo si el médico es también Oficial del Registro Civil', 'Sí, pero solo en el interior del país'],
            correctIndex: 1,
            explanation: 'La denuncia médica (Art. 52) no tiene valor de inscripción. La inscripción se produce recién con la declaración de los padres o parientes ante el Oficial (Art. 53).'
          },
          {
            question: 'Un niño de 10 años nunca fue inscripto en el Registro Civil. ¿Qué tipo de trámite corresponde?',
            options: ['Inscripción tardía administrativa, porque tiene menos de 15 años', 'Trámite judicial obligatorio', 'No puede inscribirse después de los 5 años', 'Inscripción oportuna con multa'],
            correctIndex: 0,
            explanation: 'Hasta los 15 años, la inscripción tardía es administrativa. Recién superada esa edad se requiere trámite judicial.'
          }
        ]
      },
      {
        id: 'p5l-l4',
        title: 'Inscripción de matrimonios: oposición, testigos e in extremis (Arts. 71 a 93)',
        summary: 'Trámite de oposición, matrimonios por poder, cantidad de testigos y matrimonio en peligro de muerte.',
        level1Simple: 'Un matrimonio en la oficina lleva 2 testigos. Fuera de la oficina lleva 4 testigos. En peligro de muerte (in extremis) lleva 3 testigos.',
        level2Norm: 'Oposición (Art. 75): Vista por 3 DÍAS a los contrayentes. Si niegan la causal, se suspende la boda y pasa al Juez de 1ª Instancia en lo Civil. Matrimonio por Poder (Art. 80.i): Poder determina la persona, caduca a los 90 DÍAS, 1 contrayente presente. Lectura inicial (Art. 82): Se lee el Art. 6° de la Ley 236/54. Testigos: Oficina = 2 testigos (Art. 27/81), Fuera de oficina = 4 testigos (Art. 81), Matrimonio IN EXTREMIS con peligro en la demora = 3 TESTIGOS no emparentados (4°/2°), al menos 1 alfabetizado + publicación por 8 días (Art. 85). Regularización de concubinato tras 5 AÑOS (Art. 86).',
        level3DeskExample: 'Si el Oficial celebra un matrimonio siendo incompetente territorialmente pero sin impedimentos legales, el Oficial es DESTITUIDO, pero el matrimonio SIGUE SIENDO VÁLIDO para proteger la buena fe de los esposos (Art. 78).',
        keyArticle: 'Arts. 75, 78, 80.i, 81, 82, 85, 86 Ley 1266',
        memoryTips: ['Testigos: 2 en oficina, 4 fuera, 3 in extremis', 'Poder caduca en 90 días', 'Oposición: Vista 3 días', 'En bodas se lee Art. 6 Ley 236/54'],
        deepDive: [
          'La cantidad de testigos varía según el nivel de control que la ley considera necesario en cada situación. En la OFICINA del Registro Civil (el lugar más controlado, con el Oficial en su ámbito habitual), bastan 2 testigos. Fuera de la oficina (un domicilio particular, un salón de eventos), donde hay menos control institucional, se exigen 4 testigos. Y en el matrimonio IN EXTREMIS (peligro de muerte inminente de uno de los contrayentes), donde no hay tiempo para las formalidades habituales, se exigen 3 testigos no emparentados, con al menos uno alfabetizado, más una publicación posterior de 8 días para dar oportunidad de oposición tardía.',
          'El trámite de oposición (Art. 75) es una garantía procesal: cualquier persona con un interés legítimo (por ejemplo, un cónyuge de un matrimonio anterior no disuelto) puede oponerse a la celebración de una boda antes de que se realice. Los contrayentes tienen una vista de 3 días para responder a la oposición; si niegan la causal alegada, el caso pasa al Juez de 1ª Instancia en lo Civil para que decida si el matrimonio puede celebrarse o no.',
          'El Art. 78 resuelve un caso interesante de tensión entre la validez del acto y la responsabilidad del funcionario: si un Oficial celebra un matrimonio siendo INCOMPETENTE territorialmente (por ejemplo, un Oficial de Asunción casa a una pareja que debía casarse en Encarnación) pero sin que exista ningún impedimento legal real entre los contrayentes, el Oficial es destituido por actuar fuera de su competencia, pero el MATRIMONIO SIGUE SIENDO VÁLIDO. La ley protege la buena fe de los esposos, que no tienen por qué conocer los límites de competencia territorial del funcionario que los casó.'
        ],
        exercises: [
          {
            question: '¿Cuántos testigos se requieren para un matrimonio celebrado en la oficina del Registro Civil?',
            options: ['2 testigos', '3 testigos', '4 testigos', '6 testigos'],
            correctIndex: 0,
            explanation: 'En la oficina del Registro Civil se requieren 2 testigos; fuera de la oficina, 4; y en matrimonio in extremis, 3 no emparentados.'
          },
          {
            question: 'Un Oficial celebra un matrimonio fuera de su competencia territorial, pero sin impedimentos legales entre los contrayentes. ¿Qué ocurre según el Art. 78?',
            options: ['El matrimonio es nulo y el Oficial no recibe sanción', 'El matrimonio sigue siendo válido, pero el Oficial es destituido', 'El matrimonio y el Oficial quedan sin consecuencias', 'Se anula automáticamente a los 60 días'],
            correctIndex: 1,
            explanation: 'El Art. 78 protege la buena fe de los esposos: el matrimonio sigue siendo válido, aunque el Oficial sea destituido por actuar fuera de su competencia territorial.'
          }
        ]
      },
      {
        id: 'p5l-l5',
        title: 'Defunciones, rectificación, cancelación y archivo: los tres remedios registrales (Arts. 94-124)',
        summary: 'Plazo de 24h para declarar defunción, inhumación 12-36h y la distinción Reconstituir / Rectificar / Convalidar.',
        level1Simple: 'Una defunción se declara en 24 horas. Para inhumar hay que esperar mínimo 12 horas y máximo 36 horas. Y si algo sale mal en una partida: se Reconstituye (si se perdió), se Rectifica (si tiene error), o se Convalida (si falta firma).',
        level2Norm: 'Defunciones (Art. 95): Declarar en 24 HORAS. Inhumación (Art. 105): Mínimo 12 HORAS, máximo 36 HORAS. Sin médico: 2 TESTIGOS (Art. 98). Muerte violenta (Art. 100): Se inscribe igual, pero avisa al Juez quien autoriza la inhumación. Nacido muerto (Art. 104): NO se inscribe defunción. LOS TRES REMEDIOS: 1) RECONSTITUIR (Cap. XI): El libro se perdió/destruyó -> Resolución fundada de la Dirección o vía judicial. 2) RECTIFICAR (Cap. XII): Error u omisión -> Regla general: Sentencia Judicial. Excepción: Inmediata en el acto (Art. 117) o Administrativa por la Dirección con dictamen de Asesoría Jurídica para errores/omisiones materiales (Art. 118). 3) CONVALIDAR (Cap. XIII): Falta solo firma del Oficial (Art. 122) o de testigos (Art. 123) -> Resolución del Director.',
        level3DeskExample: 'Si en el certificado de nacimiento de 2018 notan que faltó poner el domicilio de la madre (error material), la Dirección lo arregla por vía administrativa. Si la persona quiere llamarse "Fernando" en vez de "Carlos", va al Juez.',
        keyArticle: 'Arts. 95, 105, 114, 118, 122 Ley 1266',
        memoryTips: ['Defunción: 24h declarar, 12-36h inhumar', 'RECONSTITUIR = se perdió/destruyó', 'RECTIFICAR = error u omisión de dato', 'CONVALIDAR = falta firma'],
        deepDive: [
          'Los "tres remedios registrales" son la parte más operativa de la ley, porque son los procedimientos que un funcionario de Documentación Central maneja con más frecuencia en la práctica. La clave para no confundirlos es preguntarse qué le pasó al documento: si el LIBRO ENTERO se perdió o destruyó, se RECONSTITUYE; si el acta existe pero tiene un ERROR U OMISIÓN de dato, se RECTIFICA; si el acta está completa mas le FALTA UNA FIRMA (del Oficial o de los testigos), se CONVALIDA.',
          'Dentro de la rectificación hay una distinción crucial entre la regla y la excepción. La REGLA GENERAL es que solo un Juez, mediante sentencia, puede ordenar la rectificación de una partida (porque implica modificar un instrumento público con fe pública absoluta). La EXCEPCIÓN administrativa (Art. 118) permite que la propia Dirección corrija errores u omisiones puramente MATERIALES (como un domicilio mal escrito, sin afectar la identidad ni el estado civil de la persona), siempre con dictamen previo de Asesoría Jurídica.',
          'Los plazos de defunción (24 horas para declarar, entre 12 y 36 horas para inhumar) equilibran dos necesidades opuestas: por un lado, dar tiempo a la familia para verificar que la muerte es real antes de la inhumación (mínimo 12 horas); por otro lado, evitar demoras excesivas por razones de salud pública y respeto (máximo 36 horas). Cuando no hay certificado médico disponible, la ley permite sustituirlo por la declaración de 2 testigos.'
        ],
        exercises: [
          {
            question: 'En 2018 se detecta que el domicilio de la madre quedó mal escrito en una partida de nacimiento (error material, sin afectar la identidad de nadie). ¿Qué remedio corresponde?',
            options: ['Reconstitución del libro completo', 'Rectificación administrativa, con dictamen previo de Asesoría Jurídica', 'Convalidación por falta de firma', 'No tiene solución posible'],
            correctIndex: 1,
            explanation: 'Los errores u omisiones puramente materiales pueden corregirse por vía administrativa (Art. 118), con dictamen previo de Asesoría Jurídica, sin necesidad de ir a un Juez.'
          },
          {
            question: '¿Cuál es el plazo mínimo y máximo, respectivamente, para proceder a la inhumación de un cadáver según el Art. 105?',
            options: ['6 y 24 horas', '12 y 36 horas', '24 y 48 horas', 'No hay plazos fijados'],
            correctIndex: 1,
            explanation: 'La inhumación debe realizarse como mínimo 12 horas después de la defunción (para verificarla) y como máximo 36 horas después.'
          }
        ]
      },
      {
        id: 'p5l-l6',
        title: 'Mapa de los 16 capítulos y expedición de certificados (Arts. 111-137)',
        summary: 'El esqueleto completo de la ley y las reglas de expedición de copias y certificados.',
        level1Simple: 'La ley tiene 137 artículos organizados en 16 capítulos que siguen el ciclo de vida: primero la institución, después las herramientas (libros), después nacer-vivir-casarse-morir, y al final los remedios y sanciones.',
        level2Norm: 'Caps. I-III: la institución (disposiciones generales, organización, recursos). Caps. IV-V: las herramientas (libros, reglas de inscripción). Caps. VI-IX: el ciclo de vida (nacimientos, reconocimientos/adopciones, matrimonio, defunciones). Cap. X (Arts. 111-113): certificados o copias de inscripción — se expiden a solicitud, acreditando interés legítimo cuando corresponde. Caps. XI-XIV: remedios (reconstitución, rectificación/cancelación, convalidación, estadísticas vitales). Cap. XV (Arts. 129-132): sanciones. Cap. XVI (Arts. 133-137): disposiciones finales — la ley entró en vigencia a los 90 días de su promulgación (Art. 136) y derogó la Ley 58/1914 (Art. 134).',
        level3DeskExample: 'Cuando alguien pide un certificado de matrimonio de un tercero (no propio), el Oficial exige que acredite interés legítimo, a diferencia de un pedido de información pública general (Ley 5282), que no requiere justificación.',
        keyArticle: 'Arts. 111-113, 134, 136 Ley 1266',
        memoryTips: ['16 capítulos siguen el ciclo de vida', 'Certificados a terceros: requieren interés legítimo', 'Ley 1266 derogó a la Ley 58/1914'],
        deepDive: [
          'Tener el mapa completo de los 16 capítulos en la cabeza es la mejor herramienta para no perderse en los 137 artículos de la ley: los tres primeros capítulos hablan de la INSTITUCIÓN (quién es, cómo se organiza, con qué recursos cuenta); los capítulos IV y V dan las HERRAMIENTAS (los libros y las reglas generales de cualquier inscripción); los capítulos VI a IX siguen el CICLO DE VIDA de la persona (nacer, ser reconocido o adoptado, casarse, morir); y los capítulos X a XVI regulan los PRODUCTOS Y REMEDIOS del sistema (certificados, reconstitución, rectificación, convalidación, estadísticas y sanciones).',
          'La diferencia entre pedir un certificado propio y pedir el de un tercero es un punto de examen recurrente, porque conecta esta ley con la Ley 5282/2014 que verás después. Cuando alguien pide SU PROPIO certificado (o el de alguien que representa legalmente, como un hijo menor), no necesita justificar nada especial. Cuando pide el certificado de un TERCERO ajeno (por ejemplo, la partida de matrimonio de un vecino), el Oficial debe exigir que acredite un interés legítimo, porque esos datos también están protegidos por el derecho a la intimidad (Art. 33 CN).',
          'El Art. 136 (entrada en vigencia a los 90 días de la promulgación) es un dato técnico que se pregunta con frecuencia porque contrasta con la regla general de vigencia inmediata: muchas leyes entran en vigencia el mismo día de su publicación, pero la Ley 1266 se dio un período de "vacatio legis" de 90 días para que la nueva estructura institucional pudiera organizarse antes de empezar a operar formalmente.'
        ],
        exercises: [
          {
            question: 'Un ciudadano pide el certificado de matrimonio de otra persona que no es familiar suyo. ¿Qué debe acreditar?',
            options: ['Nada, el pedido es libre como cualquier información pública', 'Interés legítimo, porque los datos del Registro Civil están protegidos por el derecho a la intimidad', 'Solo debe pagar una tasa', 'Debe presentar autorización del Ministerio de Justicia'],
            correctIndex: 1,
            explanation: 'A diferencia de la información pública general (Ley 5282), pedir datos del Registro Civil sobre un tercero requiere acreditar interés legítimo, por la protección constitucional de la intimidad (Art. 33 CN).'
          },
          {
            question: '¿A los cuántos días de su promulgación entró en vigencia la Ley 1266/1987, según su Art. 136?',
            options: ['Inmediatamente', '30 días', '90 días', '1 año'],
            correctIndex: 2,
            explanation: 'El Art. 136 fijó un período de vacatio legis de 90 días desde la promulgación antes de que la ley entrara en vigencia.'
          }
        ]
      }
    ]
  },

  // ── N° 6 — Ley 5282/2014 ──
  {
    id: 'oficial-6',
    partNumber: 'N° 6',
    title: 'Ley N° 5282/2014 — De Libre Acceso Ciudadano a la Información Pública y Transparencia',
    description: 'Transparencia. Publicidad de los actos administrativos. Acceso a la información pública.',
    lessons: [
      {
        id: 'p6l-l1',
        title: 'Transparencia, objeto y gratuidad (Arts. 1 a 5)',
        summary: 'Todo lo que hace el Estado es público por regla y secreto por excepción legal.',
        level1Simple: 'Cualquier persona puede pedir información pública al Estado, es gratis y NO necesita explicar ni justificar para qué la quiere.',
        level2Norm: 'Art. 1: Reglamenta el Art. 28 CN. Art. 2: Fuentes públicas son todas las reparticiones del Estado (incluidas municipalidades, universidades y entidades binacionales como Itaipú y Yacyretá). Art. 4: Acceso GRATUITO, sin discriminación y SIN NECESIDAD DE JUSTIFICAR RAZONES. Art. 5: Responsabilidad personal por ocultar, alterar o destruir información pública.',
        level3DeskExample: 'Diferencia clave: Para pedir la nómina de sueldos de la DGREC (Ley 5282) NO justificas nada. Para pedir la partida de matrimonio de un tercero (Ley 1266) SÍ debes acreditar interés legítimo (protección de intimidad Art. 33 CN).',
        keyArticle: 'Arts. 2, 4, 5 Ley 5282',
        memoryTips: ['Acceso a info pública: Cualquier persona, GRATIS, SIN JUSTIFICAR', 'Fuentes públicas incluyen Itaipú, Yacyretá y Universidades'],
        deepDive: [
          'La Ley 5282/2014 reglamenta directamente el Art. 28 de la Constitución (derecho a información veraz, responsable y ecuánime, con fuentes públicas de libre acceso). El principio rector es la MÁXIMA PUBLICIDAD: todo lo que produce el Estado es público por regla general, y el secreto es la excepción que debe estar expresamente prevista en la ley (por ejemplo, información que comprometa la seguridad nacional o datos personales protegidos).',
          'La definición amplia de "fuente pública" (Art. 2) es un punto de examen frecuente: no se limita a los ministerios y organismos centrales, sino que abarca también municipalidades, gobernaciones, universidades públicas, y hasta entidades binacionales como Itaipú y Yacyretá, que muchas personas no asocian intuitivamente con el concepto de "Estado paraguayo" por su carácter compartido con otro país.',
          'El Art. 4 (gratuidad y sin necesidad de justificar razones) es la piedra angular de toda la ley: cualquier persona, sin distinción ni obligación de explicar para qué quiere la información, puede solicitarla de forma gratuita. Esto contrasta deliberadamente con el régimen de la Ley 1266 que acabás de ver, donde SÍ se exige acreditar interés legítimo para acceder a datos de terceros del Registro Civil — son dos lógicas distintas para dos tipos de información distintos.'
        ],
        exercises: [
          {
            question: '¿Qué debe justificar una persona para pedir información pública general, según el Art. 4 de la Ley 5282?',
            options: ['Debe explicar detalladamente el motivo', 'No necesita justificar ninguna razón', 'Solo si es periodista', 'Solo si es funcionario público'],
            correctIndex: 1,
            explanation: 'El Art. 4 garantiza el acceso gratuito y sin discriminación, sin necesidad de justificar las razones del pedido.'
          },
          {
            question: '¿Cuál de estas entidades está incluida como "fuente pública" según el Art. 2 de la Ley 5282?',
            options: ['Solo los ministerios nacionales', 'Itaipú y Yacyretá, además de municipalidades y universidades públicas', 'Solo empresas privadas con contrato estatal', 'Solo el Poder Judicial'],
            correctIndex: 1,
            explanation: 'El Art. 2 define como fuentes públicas a todas las reparticiones del Estado, incluidas municipalidades, universidades públicas y entidades binacionales como Itaipú y Yacyretá.'
          }
        ]
      },
      {
        id: 'p6l-l2',
        title: 'Publicidad de los actos administrativos: información mínima obligatoria (Art. 8 - 17 incisos)',
        summary: 'Información que el Estado debe publicar activamente sin que nadie se lo pida.',
        level1Simple: 'Toda institución pública debe tener publicada en su web su organigrama, contrataciones, presupuestos y el listado de funcionarios con sus salarios.',
        level2Norm: 'Art. 8 inc. e: Listado actualizado de todas las personas en función pública, cédula, cargo y salarios mensuales con viáticos. Inc. o: Índice y sistema de mantenimiento de documentos. Inc. p: Lugar de archivo y nombre del funcionario responsable. Conservación de contrataciones públicas: al menos 5 años (Art. 10.e).',
        level3DeskExample: 'Los incisos o y p del Art. 8 conectan directamente con la Dirección de Gestión de Documentación Central de la DGREC.',
        keyArticle: 'Art. 8 inc. e, o, p Ley 5282',
        memoryTips: ['Art 8.e = Nómina de funcionarios con salarios', 'Información activa = Publicada en la web de forma permanente'],
        deepDive: [
          'La ley distingue implícitamente entre "información pasiva" (la que se entrega solo si alguien la pide, como estudiarás en la lección siguiente) e "información activa" (la que la institución debe publicar por su propia iniciativa, sin que nadie la solicite). El Art. 8 regula precisamente esta segunda categoría: es una obligación de transparencia proactiva, no reactiva.',
          'El inciso e) del Art. 8 exige publicar el listado completo de personas en función pública con cédula, cargo y remuneración mensual (incluidos viáticos). Esta norma tiene un objetivo de control ciudadano directo: cualquier persona puede verificar en la web institucional cuánto gana cada funcionario público, sin necesidad de hacer un pedido formal.',
          'Los incisos o) y p) —índice y sistema de mantenimiento de documentos, y lugar de archivo con el nombre del responsable— son los que conectan más directamente con tu futuro puesto en Documentación Central: la ley exige que la institución publique de forma transparente cómo organiza y quién custodia su archivo documental, lo cual da un marco de rendición de cuentas a tu trabajo diario.'
        ],
        exercises: [
          {
            question: '¿Qué información exige publicar el Art. 8 inc. e) de la Ley 5282 sobre los funcionarios públicos?',
            options: ['Solo el nombre completo', 'Cédula, cargo y salario mensual con viáticos', 'Solo el número de legajo', 'Nada, esa información es reservada'],
            correctIndex: 1,
            explanation: 'El Art. 8 inc. e) exige publicar el listado actualizado de personas en función pública con cédula, cargo y salarios mensuales, incluidos viáticos.'
          },
          {
            question: '¿Qué diferencia hay entre "información activa" e "información pasiva" en el marco de esta ley?',
            options: ['No hay ninguna diferencia', 'La activa se publica por iniciativa propia de la institución; la pasiva se entrega solo si alguien la solicita', 'La activa es solo para periodistas', 'La pasiva es gratuita y la activa se paga'],
            correctIndex: 1,
            explanation: 'La información activa (Art. 8) debe publicarse proactivamente por la institución; la información pasiva se entrega en respuesta a una solicitud puntual del ciudadano.'
          }
        ]
      },
      {
        id: 'p6l-l3',
        title: 'Acceso a la información pública: el procedimiento y la vía judicial (Arts. 12 a 27)',
        summary: 'Flujo paso a paso, plazo de 15 días hábiles, resolución ficta y acción judicial.',
        level1Simple: 'El Estado tiene 15 días hábiles para responder. Si no responde en plazo, se entiende que dijo NO (resolución ficta) y puedes demandar ante un juez en 60 días.',
        level2Norm: 'Presentación (Art. 12): Escrita, correo electrónico o verbal (se labra acta). Plazo de respuesta (Art. 16): 15 DÍAS HÁBILES contados desde el día siguiente a la presentación. Rechazo (Art. 15): Prohibido rechazar por defectuosa o incompetente (debe enviarse al competente). Denegatoria (Art. 19): Solo por Resolución Fundada de la MÁXIMA AUTORIDAD. Silencio (Art. 20): Resolución ficta denegatoria. Reconsideración (Art. 21): Opcional. Acción Judicial (Arts. 23-24): 60 DÍAS ante Juez de 1ª Instancia. Sanción por incumplimiento judicial: Multa hasta 300 días-multa e inhabilitación hasta 2 años.',
        level3DeskExample: 'Los documentos originales NO salen del archivo (Art. 18). Tampoco se puede exigir al funcionario que elabore estudios, análisis o informes que no forman parte de sus funciones.',
        keyArticle: 'Arts. 16, 18, 19, 20, 24, 26 Ley 5282',
        memoryTips: ['Plazo respuesta: 15 DÍAS HÁBILES desde el día siguiente', 'Silencio = Dijo NO (Resolución ficta)', 'Acción judicial: 60 días', 'Originales NUNCA salen del archivo'],
        deepDive: [
          'El procedimiento completo sigue una secuencia lógica de garantías crecientes para el ciudadano. Primero, la PRESENTACIÓN es flexible (escrita, por correo electrónico o incluso verbal con acta) para no poner barreras de acceso. Segundo, está PROHIBIDO rechazar el pedido por estar mal presentado o por incompetencia del funcionario que lo recibe — la propia institución debe reenviarlo a quien sea competente. Tercero, el plazo de respuesta es de 15 DÍAS HÁBILES, contados desde el día SIGUIENTE a la presentación (no desde el mismo día).',
          'La figura del "silencio administrativo" (Art. 20) es un mecanismo de protección al ciudadano frente a la inacción del Estado: si pasan los 15 días hábiles sin respuesta, se entiende que hubo una RESOLUCIÓN FICTA DENEGATORIA — es decir, la ley interpreta el silencio como un "no", lo que habilita al ciudadano a avanzar a la siguiente etapa (reconsideración opcional o acción judicial) sin quedar indefinidamente esperando una respuesta que nunca llega.',
          'La acción judicial (Arts. 23-24) tiene un plazo de 60 días ante el Juez de Primera Instancia, y la ley prevé sanciones severas para la autoridad que incumple una orden judicial de entregar la información: multa de hasta 300 días-multa e inhabilitación de hasta 2 años. Es importante notar también la protección al archivo: los documentos ORIGINALES nunca salen de su lugar de custodia (Art. 18) — solo se entregan copias, fotocopias o certificaciones.'
        ],
        exercises: [
          {
            question: 'Pasan 20 días hábiles desde la presentación de un pedido de información pública y la institución no responde. ¿Qué se entiende que ocurrió?',
            options: ['Que la información fue entregada tácitamente', 'Una resolución ficta denegatoria (silencio = "no")', 'Que el pedido caducó y debe presentarse de nuevo', 'Que la institución tiene 15 días más automáticamente'],
            correctIndex: 1,
            explanation: 'El Art. 20 establece que el silencio de la administración pasado el plazo de 15 días hábiles se interpreta como una resolución ficta denegatoria.'
          },
          {
            question: '¿Pueden entregarse los documentos ORIGINALES del archivo a quien solicita información pública?',
            options: ['Sí, siempre que lo pida por escrito', 'No, los originales nunca salen del archivo; solo se entregan copias o certificaciones', 'Solo si es un juez quien lo pide', 'Sí, pero con cargo económico'],
            correctIndex: 1,
            explanation: 'El Art. 18 protege los documentos originales: nunca salen del archivo, solo se entregan copias, fotocopias o certificaciones autenticadas.'
          }
        ]
      }
    ]
  },

  // ── N° 7 — Decreto 19.102/2002 ──
  {
    id: 'oficial-7',
    partNumber: 'N° 7',
    title: 'Decreto N° 19.102/2002 (Reglamenta la Ley 1266/87)',
    description: 'Organización administrativa de la DGREC. Funciones de cada dependencia. Competencias del Director General. Procedimientos internos.',
    lessons: [
      {
        id: 'p7d-l1',
        title: 'Jurisdicción vs. competencia y la Dirección General',
        summary: 'Diferencia conceptual entre Jurisdicción y Competencia y rol del Director General.',
        level1Simple: 'Jurisdicción es el PODER legal que tienes para inscribir. Competencia es el TERRITORIO o límite donde puedes ejercer ese poder.',
        level2Norm: 'Jurisdicción (Art. 3.i Dto 19.102): Atribución legal de la Oficina/Oficial para el ejercicio de su potestad. Competencia (Art. 3.j): Extensión y límite TERRITORIAL. El Director General actúa también como Oficial del REC con competencia en TODO EL TERRITORIO nacional (Arts. 7 y 9.g). El Secretario General actúa como Oficial del REC con competencia en LA CAPITAL (Art. 13).',
        level3DeskExample: 'Un oficial de Areguá tiene jurisdicción para inscribir nacimientos, pero su competencia termina en los límites del distrito de Areguá.',
        keyArticle: 'Arts. 3, 7, 13 Dto 19.102/2002',
        memoryTips: ['Jurisdicción = Poder/Facultad', 'Competencia = Límite territorial', 'Director General = Oficial en TODO el país', 'Secretario General = Oficial en la CAPITAL'],
        deepDive: [
          'Esta distinción conceptual se aplica constantemente en el derecho administrativo, no solo en el Registro Civil: JURISDICCIÓN responde a la pregunta "¿tengo la facultad legal de hacer esto?" y COMPETENCIA responde a la pregunta "¿puedo hacerlo AQUÍ, en este lugar específico?". Un Oficial puede tener plena jurisdicción para inscribir nacimientos (es su función legal), pero su competencia territorial limita el lugar donde puede ejercer válidamente esa facultad.',
          'El caso del Director General es una excepción notable al principio de competencia territorial limitada: por su cargo, tiene competencia en TODO el territorio nacional (Arts. 7 y 9.g), lo que le permite intervenir, supervisar o incluso actuar directamente como Oficial en cualquier punto del país si la situación lo requiere. El Secretario General, en cambio, tiene una competencia más acotada: actúa como Oficial del REC solo dentro de la Capital.',
          'Esta jerarquía de competencias territoriales explica también por qué existe el concepto de "incompetencia territorial" que viste en la Ley 1266 (Art. 78): un Oficial de distrito que celebra un matrimonio fuera de los límites de su distrito está actuando sin competencia territorial, aunque sí tenga jurisdicción (la facultad genérica de celebrar matrimonios como Oficial del Registro Civil).'
        ],
        exercises: [
          {
            question: '¿Cuál es la diferencia central entre "jurisdicción" y "competencia" según el Decreto 19.102?',
            options: ['Son sinónimos exactos', 'Jurisdicción es la facultad legal; competencia es el límite territorial de esa facultad', 'Jurisdicción es solo para jueces; competencia es solo para oficiales', 'No existe esa distinción en el decreto'],
            correctIndex: 1,
            explanation: 'Jurisdicción (Art. 3.i) es la atribución legal para ejercer la potestad; competencia (Art. 3.j) es la extensión y límite territorial de esa atribución.'
          },
          {
            question: '¿En qué territorio tiene competencia el Director General como Oficial del Registro del Estado Civil?',
            options: ['Solo en la Capital', 'Solo en su distrito de residencia', 'En todo el territorio nacional', 'Solo en oficinas que él designe'],
            correctIndex: 2,
            explanation: 'El Director General actúa como Oficial del REC con competencia en todo el territorio nacional (Arts. 7 y 9.g Dto. 19.102).'
          }
        ]
      },
      {
        id: 'p7d-l2',
        title: 'Funciones de la Dirección de Documentación Central y cadena de localización',
        summary: 'La dependencia donde está tu puesto y cómo se ubica un acta entre millones de folios.',
        level1Simple: 'Tu puesto está en esta dirección. Para buscar un acta entre millones de folios se usa una cadena exacta de 5 eslabones.',
        level2Norm: 'CADENA DE LOCALIZACIÓN DOCUMENTAL (Art. 39.h Dto 19.102): CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA. Funciones del Archivo/Documentación Central (Art. 39): Resguardar la integridad e inviolabilidad de los libros, inscribir notas marginales de resoluciones/sentencias con dictamen de Asesoría Jurídica, expedir certificados y fotocopias autenticadas dentro de las 48 horas.',
        level3DeskExample: 'En la entrevista, al explicar el flujo de trabajo de Documentación Central, recita la cadena: "Localizamos la solicitud en el inventario general por Caja, Volumen, Tomo, Folio y Acta".',
        keyArticle: 'Art. 39 inc. h Dto 19.102',
        memoryTips: ['Cadena: CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA', 'Certificados y fotocopias autenticadas: dentro de 48 horas'],
        deepDive: [
          'La cadena de localización documental (CAJA → VOLUMEN → TOMO → FOLIO → ACTA) es, en la práctica, el sistema de coordenadas que permite encontrar un acta específica entre millones de documentos acumulados desde 1889. Es exactamente análogo a un sistema de direcciones postales: sin cada uno de esos cinco niveles jerárquicos, sería imposible ubicar un documento puntual en un archivo de ese volumen.',
          'Las funciones del Art. 39 no son solo de "guardado pasivo": incluyen resguardar la integridad e inviolabilidad de los libros (custodia activa contra pérdida, robo o alteración), inscribir notas marginales derivadas de resoluciones o sentencias judiciales (con dictamen previo de Asesoría Jurídica, para asegurar que la anotación tiene respaldo legal), y expedir certificados y fotocopias autenticadas dentro de un plazo máximo de 48 horas — un compromiso de servicio al ciudadano con plazo concreto.',
          'Esta dependencia es la sucesora funcional de lo que antes se llamaba "Archivo Central": el cambio de nombre a "Dirección de Gestión de Documentación Central" (formalizado en el Decreto 3080/2015, que verás en la próxima parte) refleja una evolución de concepto: de ser un simple depósito de documentos pasó a ser una dirección con gestión activa, procedimientos y responsabilidades propias dentro de la estructura de la DGREC.'
        ],
        exercises: [
          {
            question: 'Ordená correctamente los cinco eslabones de la cadena de localización documental del Art. 39.h.',
            options: ['Acta -> Folio -> Tomo -> Volumen -> Caja', 'Caja -> Volumen -> Tomo -> Folio -> Acta', 'Tomo -> Caja -> Acta -> Folio -> Volumen', 'Volumen -> Acta -> Caja -> Tomo -> Folio'],
            correctIndex: 1,
            explanation: 'La cadena de localización documental sigue el orden: Caja -> Volumen -> Tomo -> Folio -> Acta, de lo más general a lo más específico.'
          },
          {
            question: '¿En qué plazo debe expedirse un certificado o fotocopia autenticada solicitada al Archivo/Documentación Central, según el Art. 39?',
            options: ['24 horas', '48 horas', '5 días hábiles', 'No hay plazo fijado'],
            correctIndex: 1,
            explanation: 'El Art. 39 establece un plazo máximo de 48 horas para expedir certificados y fotocopias autenticadas.'
          }
        ]
      },
      {
        id: 'p7d-l3',
        title: 'Procedimientos internos y requisitos para ser Oficial del REC',
        summary: 'Los 6 requisitos estrictos para ejercer como Oficial del Registro Civil.',
        level1Simple: 'Ser Oficial del Registro Civil tiene requisitos más estrictos que un cargo público común: hay que ser paraguayo de nacimiento y vivir en el distrito.',
        level2Norm: 'LOS 6 REQUISITOS DEL OFICIAL (Art. 58 Dto 19.102): 1) Paraguayo/a NATURAL, 2) Mayor de edad, 3) Residencia permanente comprobada en el distrito, 4) Secundaria concluida, 5) Sin antecedentes penales firmes + notoria honorabilidad, 6) Aprobar examen teórico y práctico.',
        level3DeskExample: 'Diferencia con el servidor público general: El Oficial del REC EXIGE ser paraguayo NATURAL (no naturalizado), residir en el distrito y haber concluido la secundaria.',
        keyArticle: 'Art. 58 Dto 19.102',
        memoryTips: ['Oficial del REC: Paraguayo NATURAL + Residencia en el distrito + Secundaria concluida + Examen'],
        deepDive: [
          'Los requisitos para ser Oficial del Registro Civil son notoriamente más estrictos que los de un funcionario público genérico, y cada uno tiene su lógica. Ser PARAGUAYO NATURAL (no naturalizado) refleja que el Oficial ejerce una función de fe pública especialmente sensible, vinculada a la identidad nacional de las personas. Exigir RESIDENCIA PERMANENTE en el distrito garantiza conocimiento del territorio y de la comunidad a la que sirve. Exigir SECUNDARIA CONCLUIDA es un piso educativo mínimo para manejar documentación legal compleja.',
          'El requisito de "notoria honorabilidad" combinado con la ausencia de antecedentes penales firmes es una doble garantía: no basta con no tener condenas (criterio objetivo y verificable), también se exige una reputación pública de integridad (criterio más cualitativo, evaluado por la comunidad y la institución). Esto se conecta con el rol de fe pública del Oficial: sus actas tienen valor de instrumento público (Art. 31 Ley 1266), así que la sociedad necesita confiar en la honestidad de quien las produce.',
          'El sexto requisito —aprobar un examen teórico y práctico— es exactamente el tipo de proceso al que te estás sometiendo con este concurso. No basta con cumplir los requisitos formales (edad, residencia, estudios, antecedentes limpios): también hace falta demostrar, mediante evaluación objetiva, el conocimiento técnico necesario para desempeñar la función. Es la aplicación concreta del principio de idoneidad del Art. 47 inc. 3 de la Constitución.'
        ],
        exercises: [
          {
            question: '¿Qué tipo de nacionalidad exige el Decreto 19.102 para ser Oficial del Registro Civil?',
            options: ['Cualquier nacionalidad, con residencia legal', 'Paraguaya, natural o naturalizada, sin distinción', 'Paraguaya natural (no naturalizada)', 'No se exige nacionalidad específica'],
            correctIndex: 2,
            explanation: 'El Art. 58 del Decreto 19.102 exige ser paraguayo/a NATURAL —no naturalizado— para ejercer como Oficial del Registro Civil.'
          },
          {
            question: '¿Cuál es el nivel educativo mínimo exigido para ser Oficial del Registro Civil?',
            options: ['Primaria completa', 'Secundaria concluida', 'Título universitario', 'No se exige nivel educativo específico'],
            correctIndex: 1,
            explanation: 'El Art. 58 exige tener la secundaria concluida como requisito educativo mínimo para el cargo de Oficial.'
          }
        ]
      }
    ]
  },

  // ── N° 8 — Decreto 3080/2015 ──
  {
    id: 'oficial-8',
    partNumber: 'N° 8',
    title: 'Decreto N° 3080/2015 (Modifica el Decreto 19.102/2002)',
    description: 'Nueva estructura organizacional. Funciones actualizadas de las dependencias. Competencias administrativas.',
    lessons: [
      {
        id: 'p8d-l1',
        title: 'La nueva estructura orgánica: 14 dependencias en 3 bloques',
        summary: 'Cómo el Decreto 3080/2015 reorganizó la DGREC en 14 direcciones.',
        level1Simple: 'El Decreto 3080/2015 fijó 14 direcciones en 3 bloques: quienes conducen la institución, quienes le dan apoyo interno, y quienes hacen el trabajo misional (el core del Registro Civil).',
        level2Norm: 'Las 14 Dependencias: Conducción (1. Dir. General, 2. Sec. General), Apoyo (3. Admin. y Finanzas, 4. Asesoría Jurídica, 5. Asesoría Técnica, 6. Planificación, 7. Auditoría Interna, 8. Comunicación, 9. Género/Juventud/Indígenas, 10. Talento Humano, 11. Informática), Misionales (12. Gestión de Documentación Central, 13. Oficinas del REC, 14. Centro de Estudios Registrales).',
        level3DeskExample: 'Tu dirección, Documentación Central, es la N° 12 y pertenece al bloque Misional: es el trabajo central del Registro Civil, no un área de apoyo.',
        keyArticle: 'Art. 1° Dto 3080/2015',
        memoryTips: ['14 Dependencias = 2 Conducción + 9 Apoyo + 3 Misionales', 'Documentación Central es la N° 12, bloque Misional'],
        deepDive: [
          'La lógica de clasificar las 14 dependencias en 3 bloques (Conducción, Apoyo, Misionales) es un criterio organizacional estándar en administración pública. CONDUCCIÓN son quienes dirigen la institución (Dirección General, Secretaría General). APOYO son las áreas que sostienen el funcionamiento interno sin ser el "producto final" de la institución (Finanzas, Jurídica, Informática, Talento Humano, etc.). MISIONALES son las áreas que ejecutan directamente la razón de ser de la institución: en el caso de la DGREC, eso es literalmente producir, custodiar y certificar los hechos vitales de las personas.',
          'Que Documentación Central sea una dependencia MISIONAL (N° 12) y no de Apoyo tiene una implicancia conceptual importante para tu identidad profesional: tu trabajo no es "administrativo periférico", es parte del núcleo de la función pública que cumple el Registro Civil. Junto con las Oficinas del REC (N° 13) y el Centro de Estudios Registrales (N° 14), forman el bloque que efectivamente produce el servicio que la ciudadanía necesita.',
          'Memorizar la lista completa de las 14 dependencias con su número exacto es un clásico de examen tipo "completar la lista" o "identificar a qué bloque pertenece tal dependencia". Una estrategia útil es agruparlas mentalmente por función: dos dirigen, cinco dan soporte técnico-administrativo (Finanzas, Jurídica, Técnica, Planificación, Auditoría), cuatro dan soporte institucional-humano (Comunicación, Género/Juventud/Indígenas, Talento Humano, Informática), y tres ejecutan la misión.'
        ],
        exercises: [
          {
            question: '¿A qué bloque pertenece la Dirección de Gestión de Documentación Central según el Decreto 3080/2015?',
            options: ['Conducción', 'Apoyo', 'Misional', 'No está clasificada en ningún bloque'],
            correctIndex: 2,
            explanation: 'Documentación Central (Dependencia N° 12) pertenece al bloque Misional, junto con las Oficinas del REC y el Centro de Estudios Registrales.'
          },
          {
            question: '¿Cuántas dependencias en total fijó el Decreto 3080/2015 para la estructura orgánica de la DGREC?',
            options: ['10', '12', '14', '16'],
            correctIndex: 2,
            explanation: 'El Decreto 3080/2015 estableció 14 dependencias distribuidas en 3 bloques: Conducción (2), Apoyo (9) y Misionales (3).'
          }
        ]
      },
      {
        id: 'p8d-l2',
        title: 'Funciones actualizadas y competencias administrativas',
        summary: 'Qué cambió respecto al Decreto 19.102/2002 original.',
        level1Simple: 'El Decreto 3080 no reemplazó todo el Decreto 19.102: lo actualizó, sobre todo en la estructura y las funciones de cada dirección.',
        level2Norm: 'El Decreto 3080/2015 reorganiza la estructura orgánica fijada originalmente por el Decreto 19.102/2002, actualiza las funciones y atribuciones de cada dependencia, y precisa las competencias administrativas de cada dirección conforme a la práctica institucional acumulada desde 2002.',
        level3DeskExample: 'Cuando un manual de procedimientos internos cita ambos decretos juntos ("conforme Dto. 19.102/2002 y su modificatorio Dto. 3080/2015"), es porque el segundo actualiza al primero sin derogarlo por completo.',
        keyArticle: 'Dto 3080/2015 (modificatorio del Dto 19.102/2002)',
        memoryTips: ['Dto 3080/2015 = actualiza, no reemplaza, al Dto 19.102/2002'],
        deepDive: [
          'Un error frecuente en el estudio de estos dos decretos es tratarlos como si el segundo hubiera derogado por completo al primero. En realidad, la relación es de MODIFICACIÓN PARCIAL: el Decreto 19.102/2002 sigue siendo la norma reglamentaria base de la Ley 1266 (define jurisdicción, competencia, requisitos del Oficial, funciones detalladas de cada área), mientras que el Decreto 3080/2015 actualiza específicamente la ESTRUCTURA ORGANIZACIONAL, adaptándola a 13 años de evolución institucional.',
          'Esta relación de "ley base + decreto modificatorio" es un patrón que se repite en el derecho paraguayo: cuando surge la necesidad de actualizar solo una parte de una reglamentación, es más eficiente dictar un decreto modificatorio específico que reescribir todo el texto original. Por eso, cuando estudies procedimientos internos de la DGREC, muchas veces vas a encontrar referencias conjuntas a "Dto. 19.102/2002 y su modificatorio Dto. 3080/2015".',
          'En la práctica administrativa, esto significa que para entender completamente cómo funciona una dependencia específica de la DGREC, a veces hace falta consultar AMBOS decretos: el 19.102 para las funciones detalladas artículo por artículo, y el 3080 para confirmar la denominación y ubicación actual de esa dependencia dentro del organigrama vigente.'
        ],
        exercises: [
          {
            question: '¿El Decreto 3080/2015 derogó por completo al Decreto 19.102/2002?',
            options: ['Sí, lo reemplazó totalmente', 'No, lo modifica y actualiza parcialmente, principalmente en su estructura organizacional', 'Sí, pero solo en materia de sanciones', 'No tienen ninguna relación entre sí'],
            correctIndex: 1,
            explanation: 'El Decreto 3080/2015 es modificatorio del Decreto 19.102/2002: actualiza la estructura orgánica y las funciones, pero no deroga la totalidad del decreto base.'
          },
          {
            question: '¿Por qué en los procedimientos internos de la DGREC suelen citarse juntos ambos decretos?',
            options: ['Porque son idénticos', 'Porque el Dto. 19.102 da las funciones detalladas y el Dto. 3080 actualiza la estructura vigente', 'Es un error de redacción común, no tiene fundamento', 'Porque uno rige en Asunción y el otro en el interior'],
            correctIndex: 1,
            explanation: 'Se citan juntos porque el Dto. 19.102 sigue vigente como base reglamentaria detallada, mientras que el Dto. 3080 actualiza específicamente la estructura orgánica.'
          }
        ]
      },
      {
        id: 'p8d-l3',
        title: 'Funciones del bloque de conducción: dirigir, representar y supervisar',
        summary: 'Qué hace concretamente la Dirección General según las funciones que le asigna el decreto.',
        level1Simple: 'La Dirección General no solo "manda": tiene funciones concretas y enumeradas, como dirigir el servicio, representar legalmente a la institución y supervisar a todas las oficinas del país.',
        level2Norm: 'Bloque de conducción — funciones típicas de la Dirección General: a) Dirigir, planificar, organizar, fiscalizar, administrar y supervisar el servicio; b) Ejercer la representación legal de la institución; c) Ejercer la potestad de superintendencia sobre las Direcciones Departamentales, Oficinas y demás dependencias; y, entre otras, reestructurar oficinas y reorganizar dependencias cuando la gestión lo requiera.',
        level3DeskExample: 'Cuando la Dirección General firma un convenio con otra institución del Estado, está ejerciendo su función de representación legal (inciso b), no una facultad "extra" que se inventó para la ocasión.',
        keyArticle: 'Bloque de Conducción, Decreto 3080/2015',
        memoryTips: ['Conducción = dirigir + representar + supervisar (superintendencia)', 'La superintendencia alcanza a TODAS las Direcciones Departamentales y Oficinas'],
        deepDive: [
          'La "potestad de superintendencia" es un concepto técnico que vale la pena distinguir de la simple jerarquía: no es solo que la Dirección General esté "arriba" en el organigrama, sino que tiene facultades concretas de control, inspección y corrección sobre todas las oficinas del país, incluidas las departamentales. Esto le permite, por ejemplo, ordenar auditorías o corregir procedimientos irregulares detectados en cualquier oficina registral.',
          'La función de representación legal (inciso b) es la que explica por qué es la Dirección General —y no cualquier funcionario— quien firma convenios institucionales, comparece en instancias oficiales, o asume compromisos formales en nombre de la DGREC ante otros organismos del Estado o entidades externas.',
          'La facultad de reestructurar oficinas y reorganizar dependencias es la base jurídica que permitió, en su momento, el propio dictado del Decreto 3080/2015: es una potestad organizativa que la ley reconoce a la conducción de la institución para adaptar su estructura interna a las necesidades del servicio, sin necesidad de una nueva ley del Congreso para cada ajuste administrativo.'
        ],
        exercises: [
          {
            question: '¿Qué significa que la Dirección General tenga "potestad de superintendencia" sobre las oficinas del REC?',
            options: ['Que solo puede dar sugerencias no vinculantes', 'Que tiene facultades concretas de control, inspección y corrección sobre todas las Direcciones Departamentales y Oficinas', 'Que únicamente supervisa la oficina de la Capital', 'Que delega toda la supervisión en el Ministerio de Justicia'],
            correctIndex: 1,
            explanation: 'La superintendencia es una facultad real de control, inspección y corrección sobre todas las dependencias del Registro Civil en el país, no una jerarquía meramente simbólica.'
          },
          {
            question: '¿Qué función del bloque de conducción explica que sea la Dirección General quien firma convenios institucionales?',
            options: ['La función de custodia documental', 'La representación legal de la institución', 'La función de certificación', 'La función de archivo'],
            correctIndex: 1,
            explanation: 'La representación legal (inciso b del bloque de conducción) es la que habilita a la Dirección General a firmar convenios y comprometer institucionalmente a la DGREC.'
          }
        ]
      }
    ]
  },

  // ── N° 9 — Resolución Ministerial 983/2017 ──
  {
    id: 'oficial-9',
    partNumber: 'N° 9',
    title: 'Resolución Ministerial N° 983/2017 (Reglamento Interno del Ministerio de Justicia)',
    description: 'Jornada laboral. Horario de trabajo. Asistencia y puntualidad. Permisos y licencias. Derechos y obligaciones de los funcionarios. Régimen disciplinario. Prohibiciones. Uso de bienes institucionales. Conducta y responsabilidades del personal.',
    lessons: [
      {
        id: 'p9r-l1',
        title: 'Qué es la RM 983/2017 y los tres artículos publicados (Capítulo III)',
        summary: 'Aprobó el Reglamento Interno de Personal y dejó sin efecto la RM 226/2015. Solo se publicaron 3 artículos: 9, 10 y 11.',
        level1Simple: 'Es una resolución ministerial (el escalón más bajo de la pirámide), del 29 de diciembre de 2017. De todo lo que pide el acta, lo único públicamente disponible son los artículos 9 a 11, sobre el legajo del personal.',
        level2Norm: 'Fecha: 29/12/2017. Aprobó el Reglamento Interno para Funcionarios del Ministerio de Justicia y dejó sin efecto la RM 226/2015. Art. 9: la DGTH (Dirección General de Talento Humano) es responsable de la guarda y actualización del legajo de cada servidor (físico o electrónico). Art. 10: en los primeros 30 DÍAS de ingreso, el servidor debe proveer a la Dirección de Gestión Documental y Procedimientos de la DGTH toda la documentación para su legajo.',
        level3DeskExample: 'Si un nuevo funcionario ingresa el 1 de marzo, tiene hasta el 30 de marzo para entregar toda su documentación de legajo, según el Art. 10.',
        keyArticle: 'Arts. 9, 10 RM 983/2017',
        memoryTips: ['RM 983/2017 reemplazó a la RM 226/2015', 'DGTH = responsable del legajo', 'Plazo para entregar documentación: 30 días de ingreso'],
        deepDive: [
          'Es importante entender POR QUÉ solo hay 3 artículos disponibles de esta norma: el enlace que da el acta oficial del concurso no remite al texto completo de la RM 983/2017, sino al Informe D.A.I.I. N° 44/2025 (una auditoría interna de legajos), que en su desarrollo transcribe únicamente los artículos 9, 10 y 11 del Capítulo III. Esto significa que, de los nueve temas que pide el acta (jornada, horario, asistencia, permisos, derechos, obligaciones, régimen disciplinario, prohibiciones, uso de bienes), solo uno —el del legajo personal— tiene texto oficial publicado y accesible.',
          'Precisamente porque es lo único publicado y verificable, estos tres artículos son "lo más probable que caiga" en el examen dentro de esta parte del temario. El Art. 9 fija quién es responsable del legajo (la DGTH, en formato físico o electrónico) y el Art. 10 fija el plazo para que un nuevo servidor entregue su documentación: 30 DÍAS desde su ingreso, ante la Dirección de Gestión Documental y Procedimientos de la DGTH.',
          'Si el texto completo de la resolución no está disponible, la estrategia recomendada por el propio manual es estudiar los EQUIVALENTES de estos temas en la Ley 7445/2025 (que verás en la próxima lección), porque los reglamentos internos ministeriales suelen replicar casi textualmente las disposiciones de la ley general del Servicio Civil.'
        ],
        exercises: [
          {
            question: '¿Qué órgano es responsable de la guarda y actualización del legajo de cada servidor público, según el Art. 9 de la RM 983/2017?',
            options: ['La Dirección General de Talento Humano (DGTH)', 'La Asesoría Jurídica del Ministerio', 'La Secretaría de la Función Pública', 'El propio servidor público'],
            correctIndex: 0,
            explanation: 'El Art. 9 asigna a la DGTH la responsabilidad de guardar y mantener actualizado el legajo de cada servidor, en formato físico o electrónico.'
          },
          {
            question: '¿En qué plazo debe un servidor recién ingresado entregar su documentación para conformar su legajo, según el Art. 10?',
            options: ['15 días', '30 días', '60 días', '90 días'],
            correctIndex: 1,
            explanation: 'El Art. 10 fija un plazo de 30 días desde el ingreso para que el servidor provea toda la documentación requerida a la Dirección de Gestión Documental y Procedimientos de la DGTH.'
          }
        ]
      },
      {
        id: 'p9r-l2',
        title: 'Art. 11 — El contenido del legajo (los 12 ítems)',
        summary: 'Los doce documentos mínimos que debe contener el legajo personal de cada servidor.',
        level1Simple: 'El legajo es la carpeta oficial de cada funcionario. Debe tener, como mínimo, 12 documentos exactos.',
        level2Norm: 'Art. 11 — los 12 ítems mínimos del legajo: 1) Ficha de legajo personal completa, 2) Currículum Vitae actualizado y firmado con respaldo documental, 3) Fotocopia de cédula autenticada por escribanía, 4) Comprobante de declaración jurada de Bienes y Rentas ante la Contraloría, 5) Foto tipo carnet, 6) Certificados de antecedentes policiales y judiciales actualizados, 7) Decreto/Resolución de nombramiento (o contrato para personal contratado), 8) Resultados de evaluaciones de desempeño, 9) Promociones y capacitaciones, 10) Vacaciones, 11) Permiso por reposo médico, 12) Resoluciones de traslados, movimientos y sanciones.',
        level3DeskExample: 'El ítem 4 (declaración jurada de bienes) es la misma obligación del Art. 104 de la Constitución: se presenta dentro de los 15 días de asumir, y su comprobante va al legajo.',
        keyArticle: 'Art. 11 RM 983/2017',
        memoryTips: ['12 ítems agrupados: 5 al entrar, 4 durante la carrera, 1 obligación constitucional (DDJJ), 1 de nombramiento, 1 de movimientos/sanciones'],
        deepDive: [
          'Una forma útil de memorizar los 12 ítems es agruparlos por MOMENTO en que se generan, en vez de memorizarlos como una lista plana. Al ENTRAR (5 ítems): ficha personal, CV firmado, cédula autenticada, foto carnet, antecedentes policiales/judiciales. Al momento del NOMBRAMIENTO (1 ítem): decreto o resolución de nombramiento (o contrato, si es personal contratado). DURANTE LA CARRERA (4 ítems, se van sumando con el tiempo): evaluaciones de desempeño, promociones/capacitaciones, vacaciones, reposo médico. Y por SEPARADO, movimientos y sanciones (1 ítem) que se acumulan a lo largo de toda la trayectoria.',
          'El ítem 4 (declaración jurada de bienes y rentas) merece atención especial porque no es solo un requisito del reglamento interno: es la MISMA obligación que ya viste en el Art. 104 de la Constitución Nacional, con el mismo plazo de 15 días. Esto demuestra un patrón que se repite en todo el temario: normas de menor jerarquía (como esta resolución ministerial) suelen ser una aplicación operativa de obligaciones que ya nacen en la Constitución.',
          'El propio manual de estudio destaca que estos 12 ítems tienen un "doble uso" práctico: además de ser materia de examen, coinciden casi exactamente con la documentación que vos mismo vas a necesitar preparar para tu carpeta de postulación a este concurso. Conviene identificar cuáles de esos documentos tardan más en tramitarse (los antecedentes policiales y judiciales suelen ser los más lentos) para empezar a gestionarlos con anticipación.'
        ],
        exercises: [
          {
            question: '¿Cuál de los siguientes documentos forma parte de los 12 ítems mínimos del legajo, según el Art. 11 de la RM 983/2017?',
            options: ['Certificado de estudios secundarios', 'Comprobante de declaración jurada de bienes y rentas', 'Partida de nacimiento', 'Libreta de ahorro'],
            correctIndex: 1,
            explanation: 'El ítem 4 del Art. 11 exige el comprobante de la declaración jurada de bienes y rentas presentada ante la Contraloría General de la República.'
          },
          {
            question: '¿Con qué artículo constitucional se conecta directamente el ítem 4 (declaración jurada de bienes) del legajo?',
            options: ['Art. 47 CN (idoneidad)', 'Art. 104 CN (declaración jurada de bienes en 15 días)', 'Art. 135 CN (Hábeas Data)', 'Art. 9 CN (principio de legalidad)'],
            correctIndex: 1,
            explanation: 'La declaración jurada de bienes y rentas del legajo es la misma obligación constitucional del Art. 104 CN, que exige presentarla dentro de los 15 días de asumir el cargo.'
          }
        ]
      },
      {
        id: 'p9r-l3',
        title: 'Jornada, horario, asistencia y permisos: los equivalentes en la Ley 7445',
        summary: 'Como el reglamento interno replica la Ley 7445, estos temas se estudian por sus artículos equivalentes.',
        level1Simple: 'El reglamento interno del Ministerio suele copiar casi textual la Ley 7445 en estos temas, así que se estudian ahí mientras se consigue el texto completo.',
        level2Norm: 'Jornada laboral: Art. 27 Ley 7445 (jornada ordinaria máxima). Horario de trabajo: Arts. 27-28 (trabajo extraordinario). Asistencia y puntualidad: Art. 51.d (obligación) + Art. 59 (falta leve por tardanzas) + Art. 61 (falta grave por ausencias). Permisos y licencias: Art. 29 (sin goce de sueldo), Art. 30 (con goce para capacitación), Art. 31 (ausencias por salud). Descanso semanal: mínimo 24 horas consecutivas (Art. 43.e). Vacaciones: no se compensan en dinero, se acumulan hasta 2 años (Art. 43.c).',
        level3DeskExample: 'Si te preguntan por el horario de trabajo según la RM 983/2017 y no tenés el texto completo a mano, respondé con el criterio de la Ley 7445 (jornada ordinaria y extraordinaria del Art. 27-28), aclarando que el reglamento interno la replica.',
        keyArticle: 'Arts. 27-31, 43, 51.d, 59, 61 Ley 7445 (equivalentes)',
        memoryTips: ['2 ausencias injustificadas/mes = falta leve', '3 consecutivas o 5 alternas/trimestre = falta grave', 'Descanso semanal: 24h mínimo'],
        deepDive: [
          'La técnica de estudiar por "equivalentes" es una estrategia deliberada del propio manual, no una improvisación: como el reglamento interno del Ministerio no está públicamente disponible más allá de los 3 artículos ya vistos, y como los reglamentos internos suelen replicar casi textualmente las normas generales de la Ley 7445 (porque no pueden contradecirla ni establecer condiciones menos favorables), estudiar los artículos equivalentes de la ley general te prepara para responder correctamente aunque la pregunta cite formalmente la RM 983/2017.',
          'La distinción entre jornada ordinaria y jornada extraordinaria (Art. 27-28 Ley 7445) es relevante porque el trabajo extraordinario (fuera del horario habitual) suele tener un régimen de compensación distinto, ya sea en tiempo libre o en remuneración adicional, según lo que fije la reglamentación específica de cada institución.',
          'Vale la pena memorizar también los datos numéricos "sueltos" que aporta este bloque: el descanso semanal mínimo es de 24 horas consecutivas (Art. 43.e), y las vacaciones no se compensan en dinero, sino que se acumulan hasta un máximo de 2 años (Art. 43.c) — ambos datos ya los viste en la Parte N° 2, pero acá adquieren relevancia adicional porque son, específicamente, los que responden a la pregunta "jornada laboral y horario de trabajo" que pide el acta para esta resolución.'
        ],
        exercises: [
          {
            question: 'Si no se dispone del texto completo de la RM 983/2017 sobre jornada laboral, ¿qué estrategia recomienda el manual de estudio?',
            options: ['No estudiar ese tema', 'Estudiar los artículos equivalentes de la Ley 7445, que el reglamento interno suele replicar', 'Inventar una respuesta genérica', 'Consultar solo fuentes extranjeras'],
            correctIndex: 1,
            explanation: 'El manual recomienda estudiar los artículos equivalentes en la Ley 7445 (Arts. 27-31, 43, 51, 59, 61), porque los reglamentos internos suelen replicarla casi textualmente.'
          },
          {
            question: 'Según los equivalentes en la Ley 7445, ¿qué constituye falta grave por ausencias en el régimen laboral del funcionario público?',
            options: ['Una sola ausencia injustificada', 'Tres ausencias consecutivas o cinco alternas en el trimestre', 'Diez ausencias en el año', 'No existe esa categoría'],
            correctIndex: 1,
            explanation: 'Conforme al Art. 61 (equivalente), tres ausencias consecutivas o cinco alternas en el trimestre constituyen falta grave.'
          }
        ]
      },
      {
        id: 'p9r-l4',
        title: 'Derechos, obligaciones, régimen disciplinario, prohibiciones y uso de bienes institucionales',
        summary: 'El resto de los temas pedidos por el acta y sus equivalentes en la Ley 7445.',
        level1Simple: 'Derechos, obligaciones y prohibiciones del personal del Ministerio se estudian con los mismos artículos que ya viste en la Ley 7445.',
        level2Norm: 'Derechos: Art. 43 Ley 7445 (los catorce derechos individuales). Obligaciones: Art. 51 (las dieciocho obligaciones). Régimen disciplinario: Arts. 54 a 76. Prohibiciones: Art. 52 (las veintitrés prohibiciones). Uso de bienes institucionales: Art. 51.r (velar por la conservación del patrimonio) + Art. 52.d y .o (no usar recursos para fines ajenos, no retirar documentos u objetos sin autorización). Conducta y responsabilidades: Art. 51.g (probidad administrativa) + Arts. 54 y 58 (responsabilidad administrativa).',
        level3DeskExample: 'Un funcionario que se lleva a su casa un expediente sin autorización incumple el Art. 52.o de la Ley 7445, aplicable también como uso indebido de bienes institucionales bajo la RM 983/2017.',
        keyArticle: 'Arts. 43, 51, 52, 54-76 Ley 7445 (equivalentes)',
        memoryTips: ['Los 9 temas del acta se estudian con los artículos equivalentes de la Ley 7445, salvo los Arts. 9-11 que sí están publicados'],
        deepDive: [
          'Este bloque cierra la lógica de "estudio por equivalentes" cubriendo los cinco temas restantes que pide el acta: derechos, obligaciones, régimen disciplinario, prohibiciones y uso de bienes institucionales. Todos remiten a los mismos artículos de la Ley 7445 que ya trabajaste en profundidad en la Parte N° 2 — la diferencia es que ahora los repasás bajo la óptica específica de "reglamento interno del Ministerio de Justicia".',
          'El uso de bienes institucionales merece atención particular por tu futuro puesto: trabajarás directamente con documentos, libros y expedientes que son patrimonio del Estado. El Art. 51.r (velar por la conservación del patrimonio) es tu obligación POSITIVA (cuidar activamente lo que tenés a cargo), mientras que el Art. 52.d y .o son tus prohibiciones NEGATIVAS (no usar recursos para fines ajenos, no retirar documentos sin autorización) — juntas forman el marco completo de tu responsabilidad sobre los bienes que manejás.',
          'La conducta y responsabilidad del personal (Art. 51.g, probidad administrativa, combinado con los Arts. 54 y 58 sobre responsabilidad administrativa) es el paraguas que engloba todo lo anterior: actuar con probidad significa, en la práctica, cumplir cada una de las obligaciones específicas y evitar cada una de las prohibiciones específicas que ya estudiaste. No es un concepto abstracto adicional, sino la síntesis de todo el comportamiento esperado del funcionario público.'
        ],
        exercises: [
          {
            question: 'Un funcionario se lleva a su casa un expediente sin autorización "para adelantar trabajo". ¿Qué norma está incumpliendo?',
            options: ['Ninguna, si la intención es buena', 'El Art. 52.o de la Ley 7445, que prohíbe retirar documentos u objetos institucionales sin autorización', 'Solo una norma interna sin consecuencia', 'El Art. 43 sobre derechos del funcionario'],
            correctIndex: 1,
            explanation: 'El Art. 52.o prohíbe expresamente retirar documentos u objetos institucionales sin autorización, aplicable también bajo la RM 983/2017 como uso indebido de bienes.'
          },
          {
            question: '¿Qué artículo de la Ley 7445 sintetiza el deber general de "conducta y responsabilidad" del funcionario?',
            options: ['Art. 14 (concurso público)', 'Art. 51.g (probidad administrativa)', 'Art. 10 (principios rectores)', 'Art. 106 CN (responsabilidad civil)'],
            correctIndex: 1,
            explanation: 'El Art. 51.g (probidad administrativa), combinado con los Arts. 54 y 58 sobre responsabilidad, es el que mejor sintetiza el deber de conducta del funcionario.'
          }
        ]
      },
      {
        id: 'p9r-l5',
        title: 'El Informe D.A.I.I. N° 44/2025: contexto de la auditoría de legajos',
        summary: 'Qué encontró la Auditoría Interna al revisar el cumplimiento del Art. 11 en los legajos reales.',
        level1Simple: 'El documento al que remite el acta del concurso no es el reglamento completo, sino una auditoría interna de 2025 que revisó si los legajos del personal cumplían con los 12 ítems del Art. 11. Vale la pena conocerlo porque es material publicado y puede preguntarse.',
        level2Norm: 'El Informe D.A.I.I. N° 44/2025 es una auditoría interna del 16 de setiembre de 2025. Antecedentes normativos citados: Resolución N° 469/2014 (reorganiza el Ministerio; su Art. 6° inc. m establece la Dirección de Auditoría como órgano de apoyo dependiente de la Máxima Autoridad Institucional); Resolución N° 842/2015 (aprueba el Manual de Funciones de la Dirección de Auditoría Interna); Resolución N° 983/2017 (aprueba el Reglamento Interno vigente). Hallazgos: el archivo físico estaba en buen estado de conservación, pero varios legajos tenían documentación incompleta respecto al Art. 11 — faltaban sobre todo formularios de vacaciones y reposo médico en la totalidad de los legajos revisados.',
        level3DeskExample: 'Si te preguntan en la entrevista sobre gestión documental, podés mencionar que la auditoría de 2025 distinguió el estado físico del archivo (bueno) de la completitud documental (deficiente) — una distinción fina que muestra criterio profesional.',
        keyArticle: 'Informe D.A.I.I. N° 44/2025',
        memoryTips: ['La Auditoría Interna es un órgano de apoyo dependiente de la Máxima Autoridad Institucional (Res. 469/2014)', 'Hallazgo más citado: faltaba documentación de vacaciones y reposo médico en TODOS los legajos revisados'],
        deepDive: [
          'Es importante situar correctamente este informe dentro de la jerarquía normativa que ya conocés de la Parte 0: no es una ley ni un decreto, es un informe de auditoría interna, el escalón más bajo y más operativo de todos. Su valor para el examen no está en que cree obligaciones nuevas, sino en que aplica y verifica el cumplimiento de una obligación que ya existe (el Art. 11 de la RM 983/2017).',
          'La cadena de resoluciones que cita el informe (469/2014 → 842/2015 → 983/2017) muestra cómo se fue construyendo, paso a paso, el marco de auditoría interna del Ministerio: primero se creó el órgano (Dirección de Auditoría, dependiente directamente de la Máxima Autoridad Institucional, lo que le da independencia funcional), después se aprobó su manual de funciones, y finalmente se aprobó el reglamento que la propia auditoría terminó verificando en 2025.',
          'El hallazgo más citado (falta de documentación sobre vacaciones y reposo médico en la totalidad de los legajos revisados) es útil para memorizar precisamente porque es un dato concreto y verificable: demuestra que, incluso en instituciones con procedimientos formales bien diseñados, la implementación práctica puede quedar rezagada — y ese es exactamente el tipo de "brecha entre la norma y la práctica" que un buen funcionario de Documentación Central debe ayudar a cerrar.'
        ],
        exercises: [
          {
            question: '¿Qué tipo de norma es el Informe D.A.I.I. N° 44/2025 dentro de la jerarquía normativa?',
            options: ['Una ley del Congreso', 'Un decreto presidencial', 'Un informe de auditoría interna que verifica el cumplimiento de una resolución existente', 'Una reforma constitucional'],
            correctIndex: 2,
            explanation: 'El Informe D.A.I.I. N° 44/2025 es un informe de auditoría interna: no crea obligaciones nuevas, verifica el cumplimiento del Art. 11 de la RM 983/2017.'
          },
          {
            question: '¿Cuál fue el hallazgo más citado de la auditoría respecto a los legajos revisados?',
            options: ['Los legajos estaban perfectos, sin ninguna falencia', 'El archivo físico estaba deteriorado', 'Faltaba documentación de vacaciones y reposo médico en la totalidad de los legajos revisados', 'Faltaban las fotos carnet únicamente'],
            correctIndex: 2,
            explanation: 'El hallazgo más fuerte de la auditoría fue que la totalidad de los legajos revisados carecía de documentación sobre vacaciones y reposo médico, aunque el archivo físico estaba en buen estado.'
          }
        ]
      }
    ]
  },

  // ── N° 10 — Ley 6618/2020 ──
  {
    id: 'oficial-10',
    partNumber: 'N° 10',
    title: 'Ley N° 6618/2020 — Del Estado Civil en los Documentos Personales',
    description: 'Concepto de estado civil. Certificación del estado civil. Consignación en documentos públicos.',
    lessons: [
      {
        id: 'p10l-l1',
        title: 'Concepto de estado civil (Arts. 1 a 4)',
        summary: 'La definición legal de estado civil y los cinco estados civiles posibles.',
        level1Simple: 'La ley define con precisión qué es el estado civil (tu situación jurídica frente al Estado, la sociedad y la familia) y cuáles son las cinco categorías posibles.',
        level2Norm: 'Art. 1: Objeto — reglar la certificación y consignación del estado civil en documentos personales. Art. 2: "El Estado Civil es la SITUACIÓN JURÍDICA que la persona tiene frente al ESTADO, la SOCIEDAD y la FAMILIA en la cual se desenvuelve." Art. 3: el estado familiar tiene como fuentes el matrimonio, el concubinato y el parentesco por consanguinidad o afinidad. Art. 4 — LOS CINCO ESTADOS CIVILES: a) Soltero (incluye a quien tuvo matrimonio/concubinato disuelto, anulado o terminado), b) Casado, c) Viudo (disuelto por muerte del cónyuge), d) Divorciado (disuelto por sentencia judicial), e) Concubino.',
        level3DeskExample: 'Jurídicamente, una persona divorciada también encaja en la definición de "soltera" del inciso a), salvo que elija conservar el estado de divorciada según el Art. 6.',
        keyArticle: 'Arts. 2, 3, 4 Ley 6618/2020',
        memoryTips: ['3 frentes del estado civil: Estado, Sociedad, Familia', '5 estados: Soltero, Casado, Viudo, Divorciado, Concubino', 'La definición del inciso a) "soltero" es la trampa más preguntada'],
        deepDive: [
          'La Ley 6618/2020 es, según el propio manual, "la más corta del temario" (solo 9 artículos), pero eso no la hace menos importante: al contrario, precisamente por ser corta y concreta, es terreno fértil para preguntas de precisión textual. Fue publicada en la Gaceta Oficial N° 216 del 4 de noviembre de 2020, aprobada por el Senado el 11 de junio de 2020 (cámara de origen) y sancionada por Diputados el 9 de setiembre de 2020 (cámara revisora) — el mismo esquema bicameral que estudiaste en la Parte 0.',
          'La definición legal del Art. 2 (situación jurídica frente al Estado, la sociedad y la familia) se pregunta de forma textual porque es precisamente eso: una definición que hay que memorizar palabra por palabra, no parafrasear. Los "tres frentes" explican por qué el estado civil importa jurídicamente en tantos ámbitos distintos — determina tu situación fiscal y de derechos frente al Estado, tu identificación social, y tus vínculos y responsabilidades familiares.',
          'La "trampa" del inciso a) es el punto más sofisticado de esta lección: la definición legal de "soltero" no es simplemente "quien nunca se casó". Incluye TAMBIÉN a quien tuvo un matrimonio o concubinato que se disolvió, anuló o terminó. Esto significa que, en sentido estrictamente legal, una persona divorciada también encaja en la definición de "soltera" — la diferencia está en que el Art. 6 (que verás en la próxima lección) le da la opción de CONSERVAR el estado de "divorciado/a" si así lo prefiere.'
        ],
        exercises: [
          {
            question: 'Según el Art. 2 de la Ley 6618/2020, ¿frente a qué tres ámbitos se define la "situación jurídica" que constituye el estado civil?',
            options: ['El trabajo, la salud y la educación', 'El Estado, la sociedad y la familia', 'El banco, el municipio y la escuela', 'Los padres, los hermanos y los hijos'],
            correctIndex: 1,
            explanation: 'El Art. 2 define el Estado Civil como la situación jurídica que la persona tiene frente al Estado, la sociedad y la familia en la cual se desenvuelve.'
          },
          {
            question: 'Según la definición del inciso a) del Art. 4, ¿una persona divorciada puede encajar también en la categoría de "soltera"?',
            options: ['No, nunca, son categorías excluyentes', 'Sí, porque la definición de soltero incluye a quien tuvo un matrimonio disuelto, anulado o terminado', 'Solo si no tiene hijos', 'Solo después de 5 años del divorcio'],
            correctIndex: 1,
            explanation: 'El inciso a) define como soltero también a quien tuvo un matrimonio o concubinato disuelto, anulado o terminado — salvo que elija conservar el estado de divorciado, según el Art. 6.'
          }
        ]
      },
      {
        id: 'p10l-l2',
        title: 'Certificación del estado civil (Arts. 5 a 7)',
        summary: 'Cómo se constituyen, modifican y prueban los estados civiles.',
        level1Simple: 'Los estados civiles solo pueden nacer, cambiar o terminar por los actos que la ley prevé, y sus derechos y obligaciones no se pueden renunciar.',
        level2Norm: 'Art. 5: los estados civiles derivados del matrimonio, concubinato o parentesco solo pueden constituirse, disolverse, terminarse o modificarse a través de los hechos o actos previstos en las disposiciones legales vigentes. Los derechos y obligaciones derivados son IRRENUNCIABLES, salvo excepciones legales. Art. 7: el estado civil se prueba exclusivamente con certificados expedidos por el Registro del Estado Civil.',
        level3DeskExample: 'Nadie puede "renunciar" a ser padre o cónyuge para librarse de una obligación: el estado civil y sus efectos son irrenunciables por regla general.',
        keyArticle: 'Arts. 5, 7 Ley 6618/2020',
        memoryTips: ['Derechos y obligaciones del estado civil: IRRENUNCIABLES', 'Se prueba SOLO con certificados del Registro Civil'],
        deepDive: [
          'La irrenunciabilidad del Art. 5 es un principio general de orden público en el derecho de familia: ninguna persona puede "renunciar" contractualmente a los efectos de su estado civil para evadir una obligación. Por ejemplo, un cónyuge no puede firmar un acuerdo privado renunciando a la obligación alimentaria hacia su cónyuge o hijos, porque esos derechos y deberes derivan del estado civil mismo, no de la voluntad individual, y la ley los protege precisamente porque involucran a terceros (el otro cónyuge, los hijos) que no participaron en ese acuerdo.',
          'El Art. 7 (prueba exclusiva por certificados del Registro Civil) cierra el círculo con todo lo que ya viste antes: conecta con el Art. 35 del Código Civil (prueba del nacimiento y la muerte) y con el Art. 152 (prueba del matrimonio) y el Art. 242 (prueba de la filiación), formando lo que el manual llama "las cuatro normas que dicen lo mismo": todas apuntan al mismo lugar, el Registro del Estado Civil, como la fuente exclusiva y confiable de prueba de estos hechos.',
          'Esta exclusividad probatoria tiene una razón práctica evidente: si el estado civil pudiera probarse con cualquier documento o testimonio, el sistema perdería toda su seguridad jurídica. Al concentrar la prueba en un único organismo con procedimientos formales estrictos (como los que estudiaste en la Ley 1266: prohibición de guarismos, firmas dobles, libros por duplicado), se garantiza que cualquier certificado del Registro Civil tenga el mismo valor probatorio confiable en todo el país.'
        ],
        exercises: [
          {
            question: '¿Puede una persona renunciar voluntariamente a los derechos y obligaciones derivados de su estado civil?',
            options: ['Sí, siempre que lo firme por escrito', 'No, son irrenunciables, salvo las excepciones que señale la ley', 'Sí, pero solo con autorización judicial', 'Depende del estado civil específico'],
            correctIndex: 1,
            explanation: 'El Art. 5 establece que los derechos y obligaciones derivados de los diferentes estados civiles son irrenunciables, salvo excepciones expresamente señaladas por la ley.'
          },
          {
            question: '¿Con qué medio se prueba exclusivamente el estado civil de una persona, según el Art. 7?',
            options: ['Con la declaración jurada de la propia persona', 'Con certificados expedidos por el Registro del Estado Civil', 'Con testigos que conozcan a la persona', 'Con cualquier documento oficial vigente'],
            correctIndex: 1,
            explanation: 'El Art. 7 establece que el estado civil se prueba exclusivamente con certificados expedidos por el Registro del Estado Civil.'
          }
        ]
      },
      {
        id: 'p10l-l3',
        title: 'Consignación en documentos públicos (Arts. 6, 8, 9)',
        summary: 'Qué se escribe realmente en la cédula, el pasaporte y otros documentos.',
        level1Simple: 'Aunque hay 5 estados civiles legales, en los documentos cotidianos solo se escribe "soltero/a" o "casado/a", salvo que la persona pida conservar viudo o divorciado.',
        level2Norm: 'Art. 6: en los documentos personales se consigna SOLTERO/A o CASADO/A por regla general, salvo que la persona desee conservar el estado de VIUDO/A o DIVORCIADO/A, en cuyo caso puede solicitarlo expresamente. Arts. 8-9: disposiciones complementarias y de aplicación de la ley (vigencia y coordinación con el Registro Civil).',
        level3DeskExample: 'Una persona viuda que no dice nada al tramitar su cédula figura, por defecto, como "soltera" en el documento, a menos que pida expresamente conservar "viuda".',
        keyArticle: 'Art. 6 Ley 6618/2020',
        memoryTips: ['Regla general en documentos: Soltero/a o Casado/a', 'Viudo/a y Divorciado/a se conservan solo si la persona lo pide'],
        deepDive: [
          'El problema que resuelve el Art. 6 es muy concreto: antes de esta ley, no había claridad sobre qué debía figurar en los formularios y documentos cotidianos de alguien que había pasado por un divorcio o enviudado. ¿Debía declararse "divorciado/a" para siempre? ¿"Viudo/a" el resto de su vida? La ley simplifica esto estableciendo una regla por defecto (soltero/a o casado/a) con una opción de conservar los otros dos estados si la persona expresamente lo solicita.',
          'Esta simplificación tiene un fundamento práctico y también uno de dignidad personal: reduce la carga de tener que explicar constantemente una historia personal (como un divorcio) en cada trámite administrativo, mientras preserva el derecho de quien SÍ quiera identificarse como viudo o divorciado (por ejemplo, por razones de memoria de un cónyuge fallecido, o por claridad en trámites sucesorios) a hacerlo expresamente.',
          'Es importante para tu trabajo en el Registro Civil distinguir entre el ESTADO CIVIL REAL de una persona (que puede ser cualquiera de los 5 definidos en el Art. 4) y lo que se CONSIGNA en el documento (que, por regla general, se simplifica a solo dos opciones salvo pedido expreso). Esta distinción entre "lo que es" y "lo que se escribe por defecto" es exactamente el tipo de matiz que un examinador puede usar para construir una pregunta capciosa.'
        ],
        exercises: [
          {
            question: 'Una persona viuda tramita su cédula de identidad sin hacer ningún pedido especial sobre su estado civil. ¿Qué figura por defecto en el documento, según el Art. 6?',
            options: ['Viudo/a, automáticamente', 'Soltero/a, salvo que pida expresamente conservar "viudo/a"', 'Casado/a, por error administrativo', 'El documento queda en blanco en ese campo'],
            correctIndex: 1,
            explanation: 'El Art. 6 establece que, por regla general, se consigna soltero/a o casado/a, salvo que la persona pida expresamente conservar el estado de viudo/a o divorciado/a.'
          },
          {
            question: '¿Cuántos artículos tiene en total la Ley 6618/2020?',
            options: ['5 artículos', '9 artículos', '15 artículos', '99 artículos'],
            correctIndex: 1,
            explanation: 'La Ley 6618/2020 tiene solo 9 artículos, lo que la convierte en la más corta de todo el temario del concurso.'
          }
        ]
      }
    ]
  },

  // ── N° 11 — Misión, Visión, Historia y Organigrama ──
  {
    id: 'oficial-11',
    partNumber: 'N° 11',
    title: 'Misión, Visión, Historia y Organigrama del Registro del Estado Civil',
    description: 'Reseña histórica del Registro del Estado Civil. Misión, visión y valores. Organigrama.',
    lessons: [
      {
        id: 'p11h-l1',
        title: 'Reseña histórica: de los libros parroquiales a la Ley 1266',
        summary: 'La línea de tiempo completa, desde antes de 1889 hasta hoy.',
        level1Simple: 'Antes de 1889, los nacimientos se anotaban en los libros de las iglesias. El Estado recién asumió el registro civil ese año.',
        level2Norm: 'Antes de 1889: libros parroquiales (bautismos, matrimonios, defunciones). 1° de agosto de 1889: entra en vigencia la Ley de Matrimonio Civil — nace el registro civil estatal en Paraguay. 1914 (Ley N° 58, 17/1/1914): primera ley orgánica del Registro Civil, rigió 73 años. 1987 (Ley N° 1266): ley orgánica vigente, deroga expresamente la Ley 58 (Art. 134) y entra en vigencia a los 90 días de su promulgación (Art. 136). 1992: la Constitución Nacional. 2002 (Decreto 19.102): reglamenta la Ley 1266. 2014 (Decreto 1796): la DGREC pasa a depender directamente del Ministro de Justicia. 2015 (Decreto 3080): estructura orgánica vigente, 14 dependencias.',
        level3DeskExample: 'Por eso el Art. 35 del Código Civil admite las certificaciones de registros parroquiales como prueba: son válidas para personas nacidas o muertas antes de 1889.',
        keyArticle: 'Línea de tiempo institucional',
        memoryTips: ['1889: nace el registro civil estatal', '1914: Ley 58 (primera ley orgánica)', '1987: Ley 1266 (ley orgánica vigente)', '2015: Decreto 3080 (estructura actual)'],
        deepDive: [
          'Entender esta línea de tiempo te da una ventaja enorme para toda la entrevista: te permite conectar cada norma del temario con un momento histórico concreto, en vez de memorizarlas como fechas sueltas. Antes de 1889, la Iglesia registraba los hechos vitales porque no existía alternativa estatal — de ahí que el Art. 35 del Código Civil todavía reconozca esos registros parroquiales como prueba válida para personas nacidas en esa época.',
          'La Ley N° 58 de 1914 fue la primera ley orgánica del Registro Civil paraguayo y rigió durante 73 años, un período larguísimo que refleja la estabilidad institucional (aunque con las limitaciones tecnológicas y organizativas de su época). Fue expresamente derogada por el Art. 134 de la Ley 1266/1987, que la reemplazó con una estructura más moderna y detallada.',
          'El período 2014-2015 marca la configuración institucional que sigue vigente hoy: el Decreto 1796/2014 estableció que la DGREC depende directamente del Ministro de Justicia (con facultad de diseñar políticas propias sobre el estado civil), y el Decreto 3080/2015 fijó la estructura orgánica de 14 dependencias, incluida la Dirección de Gestión de Documentación Central donde se ubica el puesto al que te presentás.'
        ],
        exercises: [
          {
            question: '¿Qué fecha marca el nacimiento del Registro Civil estatal en Paraguay?',
            options: ['17 de enero de 1914', '1° de agosto de 1889', '4 de noviembre de 2020', '20 de junio de 1992'],
            correctIndex: 1,
            explanation: 'El 1° de agosto de 1889 entró en vigencia la Ley de Matrimonio Civil, marcando el nacimiento del registro civil estatal en Paraguay.'
          },
          {
            question: '¿Qué norma fijó la estructura orgánica de 14 dependencias que rige actualmente en la DGREC?',
            options: ['Ley 1266/1987', 'Decreto 19.102/2002', 'Decreto 3080/2015', 'Ley 58/1914'],
            correctIndex: 2,
            explanation: 'El Decreto 3080/2015 estableció la estructura orgánica vigente de 14 dependencias, incluida la Dirección de Gestión de Documentación Central.'
          }
        ]
      },
      {
        id: 'p11h-l2',
        title: 'Misión, visión y valores',
        summary: 'La formulación oficial del Ministerio de Justicia y de la DGREC.',
        level1Simple: 'La misión del Ministerio empieza diciendo "Garantizar el acceso a la identidad", y el Registro Civil es precisamente el organismo que cumple esa parte de la misión.',
        level2Norm: 'VISIÓN del Ministerio de Justicia: "Ministerio moderno, confiable y comprometido; que asegure el cumplimiento de los objetivos institucionales." MISIÓN del Ministerio de Justicia: "Garantizar el acceso a la identidad y a la justicia de todos los paraguayos con énfasis en la promoción de los derechos humanos; brindar atención integral a las personas privadas de libertad y adolescentes en conflicto con la ley penal para su reinserción social." Definición operativa de la DGREC (Decretos 19.102 y 3080): órgano especializado, de ámbito nacional, eje articulador de los esfuerzos de la administración pública para un servicio público oportuno y eficiente que asegure la legalidad y seguridad jurídica de los hechos y actos del estado civil.',
        level3DeskExample: 'Para la entrevista: "La misión del Ministerio empieza por garantizar el acceso a la identidad, y el Registro del Estado Civil es el organismo a través del cual el Ministerio cumple esa parte de su misión."',
        keyArticle: 'Misión y Visión institucionales (Decretos 19.102/2002 y 3080/2015)',
        memoryTips: ['Misión: empieza con "Garantizar el acceso a la identidad..."', 'Conectar siempre identidad = Registro Civil'],
        deepDive: [
          'El acta del concurso pide expresamente memorizar la formulación textual de misión y visión, así que conviene practicarla literalmente, no solo entender su sentido general. La misión del Ministerio de Justicia comienza con la frase "Garantizar el acceso a la identidad y a la justicia de todos los paraguayos" — dos conceptos que, en apariencia, son distintos (identidad vs. justicia), pero que en la práctica institucional convergen en el mismo Ministerio.',
          'La definición operativa de la DGREC (extraída de los considerandos de los Decretos 19.102 y 3080) usa un lenguaje más técnico: "órgano especializado, de ámbito nacional, eje articulador de los esfuerzos de la administración pública" para un servicio "oportuno y eficiente" que asegure "la legalidad y seguridad jurídica de los hechos y actos" del estado civil. Esta formulación conecta el trabajo cotidiano del Registro Civil con conceptos constitucionales de fondo: legalidad (Art. 9 CN) y seguridad jurídica.',
          'Para la entrevista, la conexión más poderosa que podés hacer es esta: la misión del Ministerio empieza hablando de "acceso a la identidad", y el Registro del Estado Civil es, literalmente, el organismo a través del cual esa misión se materializa en la vida de cada ciudadano. No es una coincidencia retórica: es la razón de ser institucional de tu futuro puesto de trabajo.'
        ],
        exercises: [
          {
            question: '¿Con qué concepto comienza la formulación oficial de la misión del Ministerio de Justicia?',
            options: ['"Fiscalizar el cumplimiento de las leyes"', '"Garantizar el acceso a la identidad y a la justicia"', '"Administrar los recursos del Estado"', '"Promover la seguridad ciudadana"'],
            correctIndex: 1,
            explanation: 'La misión oficial del Ministerio de Justicia comienza: "Garantizar el acceso a la identidad y a la justicia de todos los paraguayos...".'
          },
          {
            question: 'Según la definición operativa de los Decretos 19.102 y 3080, ¿qué debe asegurar la DGREC a través de sus políticas?',
            options: ['El crecimiento económico del país', 'La legalidad y seguridad jurídica de los hechos y actos del estado civil', 'La recaudación de impuestos municipales', 'La organización de elecciones'],
            correctIndex: 1,
            explanation: 'La definición operativa establece que la DGREC debe asegurar la plena vigencia del principio de legalidad y la seguridad jurídica de los hechos y actos relacionados al estado civil.'
          }
        ]
      },
      {
        id: 'p11h-l3',
        title: 'Los nueve verbos del Registro Civil y el organigrama',
        summary: 'La definición operativa que resume qué hace la institución, en 9 verbos.',
        level1Simple: 'La mejor respuesta a "¿qué hace el Registro Civil?" son sus 9 verbos: 5 del ciclo normal, 3 de los remedios registrales, y 1 de resultado final.',
        level2Norm: 'LOS 9 VERBOS (Decreto 19.102/2002): la institución encargada de la RECOPILACIÓN, DOCUMENTACIÓN, ARCHIVO, CUSTODIA, INSCRIPCIÓN, RECTIFICACIÓN, RECONSTITUCIÓN, CONVALIDACIÓN y CERTIFICACIÓN de todos los hechos vitales y actos jurídicos relacionados al estado civil de los ciudadanos. Organigrama: 2 dependencias de Conducción (Dirección General, Secretaría General), 9 de Apoyo, 3 Misionales (incluida Documentación Central, Dependencia N° 12), según el Decreto 3080/2015.',
        level3DeskExample: 'En la entrevista: "El Registro Civil recopila, documenta, archiva, custodia e inscribe los hechos vitales; cuando algo falla, rectifica, reconstituye o convalida; y el producto final siempre es certificar."',
        keyArticle: 'Considerandos Dto 19.102/2002 y Dto 3080/2015',
        memoryTips: ['5 ciclo normal: Recopilar, Documentar, Archivar, Custodiar, Inscribir', '3 remedios: Rectificar, Reconstituir, Convalidar', '1 producto final: Certificar'],
        deepDive: [
          'Los nueve verbos del Registro Civil son la respuesta perfecta —y muy citable en la entrevista oral— a la pregunta "¿qué hace el Registro del Estado Civil?". Se organizan en tres grupos con lógica temporal: primero el CICLO NORMAL de trabajo con un documento nuevo (recopilar la información, documentarla, archivarla, custodiarla e inscribirla en los libros correspondientes); después los REMEDIOS que se aplican cuando algo salió mal (rectificar un error, reconstituir un libro perdido, convalidar una firma faltante — exactamente los "tres remedios registrales" que estudiaste en la Ley 1266); y finalmente el PRODUCTO FINAL que la ciudadanía efectivamente recibe (certificar, es decir, expedir el documento que prueba el hecho registrado).',
          'El organigrama de 14 dependencias que estudiaste en la Parte N° 8 (Decreto 3080/2015) es la traducción estructural de estos 9 verbos: cada dependencia misional se especializa en una parte de ese ciclo. Documentación Central (N° 12) se concentra especialmente en los verbos de archivo, custodia y certificación; las Oficinas del REC (N° 13) se concentran en recopilación, documentación e inscripción; y el Centro de Estudios Registrales (N° 14) aporta la capacitación técnica que sostiene la calidad de todo el proceso.',
          'Para preparar bien esta última parte del temario antes de la entrevista, practicá decir en voz alta —sin mirar apuntes— la línea de tiempo completa (1889 → 1914 → 1987 → 1992 → 2002 → 2014 → 2015), la misión textual del Ministerio, y los 9 verbos en orden. Esta es exactamente la clase de contenido "de memoria literal" que un entrevistador puede pedir directamente, y tenerlo automatizado te da seguridad para el resto de la conversación.'
        ],
        exercises: [
          {
            question: '¿Cuáles de los siguientes son los "tres remedios registrales" incluidos entre los nueve verbos del Registro Civil?',
            options: ['Recopilar, documentar, archivar', 'Rectificar, reconstituir, convalidar', 'Inscribir, custodiar, certificar', 'Notificar, sancionar, apelar'],
            correctIndex: 1,
            explanation: 'Los tres remedios registrales son: rectificar (corregir un error), reconstituir (rehacer un libro perdido) y convalidar (suplir una firma faltante).'
          },
          {
            question: '¿Cuál es el "producto final" que resume la función del Registro Civil frente al ciudadano, según los nueve verbos?',
            options: ['Sancionar', 'Certificar', 'Archivar', 'Recopilar'],
            correctIndex: 1,
            explanation: 'Certificar es el verbo que representa el producto final: el documento que la ciudadanía recibe como prueba oficial de un hecho vital registrado.'
          }
        ]
      }
    ]
  }
];
