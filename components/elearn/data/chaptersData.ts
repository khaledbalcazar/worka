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
        memoryTips: ['Estado: Social de derecho, unitario, indivisible, descentralizado', 'Información: veraz, responsable y ecuánime', 'Hábeas Data = corregir o actualizar mis datos oficiales']
      },
      {
        id: 'p1-l2',
        title: 'Principios de la Administración Pública (Arts. 9, 101, 104, 105, 106, 128)',
        summary: 'Legalidad, Idoneidad, Responsabilidad del funcionario, Probidad e Interés General.',
        level1Simple: 'Un funcionario público solo puede hacer lo que la ley expresamente le autoriza. Además, responde con su propio dinero si comete un daño.',
        level2Norm: 'Art. 106: Responsabilidad personal del funcionario -> Responsabilidad subsidiaria del Estado -> Derecho del Estado a REPETIR el pago contra el funcionario culpable. Art. 104: Declaración jurada de bienes dentro de los 15 días de asumir y al cesar. Art. 105: Prohibida doble remuneración salvo la docencia. Art. 128: Primacía del interés general sobre el particular.',
        level3DeskExample: 'Si un Oficial pierde un libro por negligencia y el Estado indemniza al ciudadano dañado, el Estado inicia juicio de repetición al Oficial para cobrarle el dinero pagado.',
        keyArticle: 'Arts. 104, 105, 106, 128 CN',
        memoryTips: ['Responsabilidad: Personal -> Subsidiaria del Estado -> Derecho a repetir', 'DDJJ: 15 días al asumir y al cesar', 'Excepción doble sueldo: Docencia']
      },
      {
        id: 'p1-l3',
        title: 'Igualdad ante la ley (Arts. 46, 47, 48)',
        summary: 'Protecciones especiales igualitarias, las 4 garantías de igualdad y la igualdad hombre-mujer.',
        level1Simple: 'Tratar igual a quienes están en situación desigual perpetúa la desigualdad; por eso las medidas de protección a sectores vulnerables son igualitarias, no discriminatorias.',
        level2Norm: 'Art. 46: "Las protecciones que se establezcan sobre desigualdades injustas no serán consideradas discriminatorias sino igualitarias". Art. 47: 1) Acceso a la justicia, 2) Igualdad ante la ley, 3) Igualdad de acceso a funciones públicas no electivas sin más requisito que la IDONEIDAD, 4) Igualdad de oportunidades en beneficios. Art. 48: Iguales derechos civiles, políticos, sociales, económicos y culturales entre hombre y mujer.',
        level3DeskExample: 'El concurso público se basa en el Art. 47 inc. 3 CN: el único requisito constitucional para el puesto es la idoneidad evaluada objetivamente.',
        keyArticle: 'Arts. 46, 47, 48 CN',
        memoryTips: ['4 Garantías: Justicia, Leyes, Funciones (idoneidad), Beneficios', 'Igualdad de género en 5 ámbitos: civiles, políticos, sociales, económicos, culturales']
      },
      {
        id: 'p1-l4',
        title: 'Acceso a la función pública (Arts. 101 a 106)',
        summary: 'Las 7 carreras del Estado paraguayo y el régimen laboral público.',
        level1Simple: 'Los funcionarios están al servicio del país, no del gobierno ni del jefe de turno.',
        level2Norm: 'Art. 101: Las 7 carreras expresas son: 1) Judicial, 2) Docente, 3) Diplomática y Consular, 4) Investigación Científica y Tecnológica, 5) Servicio Civil, 6) Militar, 7) Policial. La carrera del Servicio Civil se rige por la Ley 7445/2025.',
        level3DeskExample: 'El puesto de Auxiliar/Asistente en la Dirección de Documentación Central del REC pertenece a la carrera del Servicio Civil.',
        keyArticle: 'Arts. 101-106 CN',
        memoryTips: ['Acróstico 7 carreras: J-D-D-C-C-M-P (Juez, Docente, Diplomático, Científico, Civil, Militar, Policía)']
      },
      {
        id: 'p1-l5',
        title: 'Derecho a la identidad y estado civil (Arts. 49-55, 140, 146-153)',
        summary: 'Protección de la familia, igualdad de los hijos, derechos del niño prevalecientes y nacionalidad natural.',
        level1Simple: 'El Registro Civil es el organismo que materializa el derecho constitucional a la identidad. Sin inscripción no hay cédula, ni escuela, ni voto.',
        level2Norm: 'Art. 49-51: Familia y unión de hecho (estable y singular). Art. 53: Todos los hijos son iguales ante la ley. Se prohíbe cualquier calificación sobre la filiación en documentos personales. Art. 54: Los derechos del niño tienen carácter PREVALECIENTE. Art. 140: Bilingüismo oficial (castellano y guaraní). Art. 146: Nacionalidad paraguaya natural (ius soli, hijos de paraguayos al servicio estatal, expósitos). Art. 152: Ciudadanía desde los 18 años.',
        level3DeskExample: 'Está prohibido por la Constitución que un certificado del Registro Civil diga "hijo natural", "ilegítimo" o "adoptivo". Sólo dice de quién es hijo.',
        keyArticle: 'Arts. 53, 54, 140, 146 CN',
        memoryTips: ['Prohibida la calificación de filiación en documentos', 'Derechos del niño = carácter prevaleciente', 'Nacionalidad desde nacimiento, Ciudadanía desde los 18']
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
        memoryTips: ['7 principios: Legalidad, Mérito, Igualdad, Transparencia, Probidad, Eficiencia, Estabilidad']
      },
      {
        id: 'p2-l2',
        title: 'Acceso mediante concursos públicos: la única vía (Arts. 12-20)',
        summary: 'Requisitos, inhabilidades, y el concurso público como único mecanismo de ingreso.',
        level1Simple: 'A un cargo público se entra por concurso, no por conocidos. Es la regla constitucional (idoneidad, Art. 47 CN) traducida a esta ley.',
        level2Norm: 'Art. 14 — EL CONCURSO PÚBLICO COMO ÚNICA VÍA de ingreso a la función pública, salvo cargos de confianza expresamente exceptuados. Requisitos generales: nacionalidad paraguaya, mayoría de edad, idoneidad. Inhabilidades: condena penal firme, quiebra fraudulenta, destitución previa. Tres etapas: ingreso -> período de prueba -> estabilidad.',
        level3DeskExample: 'El concurso MJRC-CPIEP-08-2026 al que te presentás es exactamente la vía que exige el Art. 14: concurso público abierto, con evaluación de idoneidad.',
        keyArticle: 'Arts. 14, 17 Ley 7445',
        memoryTips: ['Concurso público = única vía general de ingreso', 'Del ingreso a la estabilidad: 3 etapas']
      },
      {
        id: 'p2-l3',
        title: 'Derechos y obligaciones del funcionario (Arts. 43, 51)',
        summary: 'Los catorce derechos individuales y las dieciocho obligaciones.',
        level1Simple: 'El funcionario tiene derechos (estabilidad, sueldo, vacaciones) y obligaciones (puntualidad, probidad, obediencia a la ley).',
        level2Norm: 'Art. 43 — LOS CATORCE DERECHOS: incluyen estabilidad (43.a), remuneración (43.b), vacaciones que no se compensan en dinero y se acumulan hasta 2 años (43.c), descanso semanal de 24 horas consecutivas mínimo (43.e), capacitación. Art. 51 — LAS DIECIOCHO OBLIGACIONES: puntualidad y asistencia (51.d), probidad administrativa (51.g), velar por la conservación del patrimonio institucional (51.r).',
        level3DeskExample: 'Si un funcionario no usa sus vacaciones en 2 años, las pierde a partir del tercero: no se pagan en dinero, solo se acumulan hasta ese límite.',
        keyArticle: 'Arts. 43, 51 Ley 7445',
        memoryTips: ['14 derechos, 18 obligaciones', 'Vacaciones: no se cobran, se acumulan máx. 2 años', 'Descanso semanal: 24 horas mínimo']
      },
      {
        id: 'p2-l4',
        title: 'Prohibiciones (Art. 52): nepotismo, conflicto de intereses y conducta laboral',
        summary: 'Las veintitrés prohibiciones agrupadas por bloques temáticos.',
        level1Simple: 'Hay 23 cosas que un funcionario tiene prohibido hacer: desde usar recursos del Estado para fines propios hasta contratar a un pariente cercano.',
        level2Norm: 'Bloques del Art. 52: Político-electoral, Corrupción y beneficio indebido, Uso indebido de recursos (52.d — no usar recursos para fines ajenos), Conflicto de intereses, Conducta y ambiente laboral, Nepotismo (52.u y 52.v — no contratar/promover a parientes hasta 4° consanguinidad / 2° afinidad). También prohíbe retirar documentos u objetos institucionales sin autorización (52.o).',
        level3DeskExample: 'Un funcionario no puede promover a su cuñado (2° afinidad) a un cargo de la misma dependencia: es nepotismo prohibido por el Art. 52.u.',
        keyArticle: 'Art. 52 incs. d, o, u, v Ley 7445',
        memoryTips: ['23 prohibiciones en 6 bloques', 'Nepotismo: hasta 4° consanguinidad y 2° afinidad']
      },
      {
        id: 'p2-l5',
        title: 'Responsabilidad administrativa y régimen disciplinario (Arts. 54 a 76)',
        summary: 'Faltas leves vs. faltas graves, y la tabla maestra de sanciones.',
        level1Simple: 'Si el funcionario incumple la ley, responde: desde un llamado de atención (falta leve) hasta la destitución (falta grave).',
        level2Norm: 'Art. 54 y 58: la responsabilidad administrativa nace del incumplimiento de las obligaciones o de una prohibición. Faltas leves: p. ej. dos ausencias injustificadas en el mes. Faltas graves: tres ausencias consecutivas o cinco alternas en el trimestre. Art. 59: falta leve por tardanzas reiteradas. Art. 61: falta grave por ausencias.',
        level3DeskExample: 'Si un funcionario falta injustificadamente 3 días seguidos, incurre en falta grave (Art. 61) y arriesga sanciones que llegan hasta la destitución.',
        keyArticle: 'Arts. 54, 58, 59, 61 Ley 7445',
        memoryTips: ['2 ausencias/mes = falta leve', '3 consecutivas o 5 alternas/trimestre = falta grave']
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
        memoryTips: ['3 escalones: Partidas del REC -> Registros parroquiales -> Otros medios', 'Se conecta con la reconstitución de libros (Arts. 114-116 Ley 1266)']
      },
      {
        id: 'p3c-l2',
        title: 'Arts. 42 al 51 — Nombre y apellido',
        summary: 'El nombre como derecho y como deber: quién puede cambiarlo y cuándo.',
        level1Simple: 'El nombre es tuyo, pero no podés cambiarlo cuando quieras: solo un juez puede autorizarlo, por una causa justa.',
        level2Norm: 'Art. 42: Toda persona tiene derecho a un nombre y apellido inscriptos en el Registro del Estado Civil. SOLO EL JUEZ puede autorizar, por justa causa, cambios o adiciones. Art. 43: Derecho a suscribir actos con su nombre y adoptar la firma que prefiera. Art. 44: Acción contra el uso indebido del propio nombre, con derecho a indemnización; ejercible también por los parientes en grado sucesible tras el fallecimiento. Art. 45: El cambio o adición del nombre NO altera el estado civil ni prueba la filiación.',
        level3DeskExample: 'Un ciudadano que quiere pasar de "Francisco" a "Fran" en todos sus documentos necesita una sentencia judicial, no basta con pedirlo en el Registro.',
        keyArticle: 'Arts. 42, 43, 44, 45 CC',
        memoryTips: ['Nombre: derecho de la persona + deber hacia la sociedad', 'Solo el JUEZ autoriza cambios', 'Cambiar el nombre no cambia la filiación']
      },
      {
        id: 'p3c-l3',
        title: 'Arts. 132 al 190 — Matrimonio y nulidad',
        summary: 'Impedimentos, matrimonio nulo vs. anulable, y el "matrimonio putativo".',
        level1Simple: 'Un matrimonio puede ser NULO (defecto grave, como un auto sin motor) o ANULABLE (defecto menor, como una rueda pinchada). Si es nulo, no se convalida nunca; si es anulable, se convalida si nadie reclama a tiempo.',
        level2Norm: 'Art. 179: NULO cuando hay impedimento dirimente (parentesco, vínculo anterior subsistente, crimen contra el cónyuge); lo declara el Ministerio Público o cualquier interesado, sin plazo. Art. 181: ANULABLE por falta de edad legal, incapacidad, vicios del consentimiento (error, dolo, violencia) o impotencia; solo a instancia de parte, plazo de 60 DÍAS (Art. 182). Art. 184-185 (matrimonio putativo): la nulidad produce efectos civiles a favor del cónyuge de buena fe y de los hijos; aunque AMBOS cónyuges sean de mala fe, los hijos conservan su calidad. Art. 188: la acción de nulidad solo procede EN VIDA de los esposos. Arts. 189-190 (régimen de bienes): derogados y reemplazados por la Ley 1/1992.',
        level3DeskExample: 'Si se descubre 20 años después que uno de los cónyuges ya estaba casado, el matrimonio es nulo, pero los hijos siguen siendo matrimoniales por el Art. 185 (interés superior del niño).',
        keyArticle: 'Arts. 179, 181, 182, 184, 185, 188 CC',
        memoryTips: ['NULO: grave, sin plazo, cualquiera reclama', 'ANULABLE: 60 días, solo la parte afectada', 'Los hijos nunca pierden su calidad, aunque el matrimonio sea nulo']
      },
      {
        id: 'p3c-l4',
        title: 'Arts. 225 al 243 — La filiación',
        summary: 'Los números 180 y 300 días, la posesión de estado y la acción de filiación.',
        level1Simple: 'El derecho no puede saber con certeza quién es el padre biológico, así que usa reglas de plazos para presumirlo: 180 días es el mínimo de un embarazo, 300 días el máximo.',
        level2Norm: 'Art. 225: son hijos matrimoniales los nacidos después de 180 DÍAS de la celebración del matrimonio y dentro de los 300 DÍAS siguientes a su disolución o anulación. Arts. 227-228: las presunciones sobre en cuál de dos matrimonios sucesivos fue concebido el hijo NO ADMITEN PRUEBA EN CONTRARIO (presunción iure et de iure). Posesión de estado: se prueba con NOMEN, TRACTATUS y FAMA (nombre, trato y fama pública como hijo) y puede suplir el reconocimiento expreso. Art. 242: la filiación se prueba con la inscripción del nacimiento en el Registro Civil. Impugnación de paternidad: 60 DÍAS desde que se conoce el hecho.',
        level3DeskExample: 'Si un chico nace 200 días después del casamiento de sus padres, se presume hijo matrimonial: cae dentro de la ventana de 180 a 300 días.',
        keyArticle: 'Arts. 225, 227, 228, 242 CC',
        memoryTips: ['180 días = mínimo embarazo viable', '300 días = máximo embarazo posible', 'Posesión de estado = Nomen + Tractatus + Fama', 'La filiación se prueba con la inscripción del nacimiento (Art. 242)']
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
        memoryTips: ['Memorizar textual: "igual capacidad de goce y de ejercicio... cualquiera sea su estado civil"', 'Goce = ser titular / Ejercicio = poder actuar sin autorización']
      },
      {
        id: 'p4a-l2',
        title: 'Art. 2 — Principios generales de interpretación',
        summary: 'Los tres principios que guían la aplicación de la ley de familia.',
        level1Simple: 'Ante cualquier duda al aplicar esta ley, hay que priorizar la unidad familiar y el bienestar de los hijos menores.',
        level2Norm: 'Art. 2 — Principios fundamentales de interpretación: 1) La unidad de la familia. 2) El bienestar y protección de los hijos menores. 3) La igualdad de derechos y obligaciones de los cónyuges.',
        level3DeskExample: 'Si una norma de esta ley admite dos lecturas posibles, el Oficial y el juez deben elegir la que mejor proteja a los hijos menores.',
        keyArticle: 'Art. 2 Ley 1/92',
        memoryTips: ['3 principios: Unidad familiar, Bienestar de los hijos, Igualdad entre cónyuges']
      },
      {
        id: 'p4a-l3',
        title: 'Arts. 4 al 21 — El matrimonio: disposiciones, capacidad e impedimentos',
        summary: 'Requisitos, edad mínima y régimen patrimonial supletorio.',
        level1Simple: 'Para casarse hace falta ser mayor de 18 años (16 con dispensa) y no tener impedimentos. Si los novios no eligen régimen de bienes, se aplica automáticamente el de comunidad de gananciales.',
        level2Norm: 'Arts. 3-16: disposiciones generales del matrimonio. Arts. 17-21: capacidad e impedimentos (edad matrimonial: 18 años, 16 con dispensa judicial). Régimen patrimonial supletorio (Arts. 22-29 y 30-59): si los cónyuges no pactan otro régimen antes de casarse, se aplica la COMUNIDAD DE GANANCIALES bajo administración conjunta. El Oficial tiene la obligación de informar esto antes de celebrar la boda.',
        level3DeskExample: 'Una pareja que se casa sin firmar convenio prenupcial queda automáticamente bajo comunidad de gananciales: lo que ganen durante el matrimonio se reparte por mitades si se divorcian.',
        keyArticle: 'Arts. 17, 22, 24, 25 Ley 1/92',
        memoryTips: ['Edad matrimonio: 18 años (16 con dispensa)', 'Sin pacto = régimen supletorio de comunidad de gananciales']
      },
      {
        id: 'p4a-l4',
        title: 'Arts. 75 al 94 — Unión de hecho o concubinato',
        summary: 'Los requisitos y los plazos de 4 y 10 años que la definen.',
        level1Simple: 'Una pareja que convive de forma estable, pública y con un solo compañero (no varios a la vez) tiene, con el tiempo, casi los mismos derechos que un matrimonio.',
        level2Norm: 'Arts. 83-94: la unión de hecho debe ser estable, pública y singular (entre un hombre y una mujer sin impedimento para casarse). A los 4 AÑOS de convivencia (o antes si hay hijos comunes), genera derechos sobre bienes gananciales y sucesorios equivalentes al matrimonio. A los 10 AÑOS, puede inscribirse y equipararse plenamente al matrimonio para todos los efectos legales.',
        level3DeskExample: 'Una pareja que convive 6 años sin casarse ya tiene derecho a los bienes gananciales adquiridos juntos, aunque todavía no llegó a los 10 años para la equiparación total.',
        keyArticle: 'Arts. 83, 86 Ley 1/92',
        memoryTips: ['Unión de hecho: estable + pública + singular', '4 años = derechos patrimoniales/sucesorios', '10 años = equiparación total al matrimonio']
      },
      {
        id: 'p4a-l5',
        title: 'Arts. 95 al 97 — Bien de familia',
        summary: 'La protección legal de la vivienda familiar frente a los acreedores.',
        level1Simple: 'La casa donde vive la familia puede protegerse legalmente para que no se la puedan quitar por deudas.',
        level2Norm: 'Arts. 95-97: el "bien de familia" es un inmueble destinado a vivienda o explotación familiar que, una vez constituido conforme a la ley, queda protegido de embargos y ejecuciones por deudas posteriores a su constitución (con excepciones como deudas por impuestos del propio inmueble).',
        level3DeskExample: 'Una familia inscribe su casa como bien de familia; si el padre contrae una deuda comercial después, esa deuda no puede cobrarse rematando la vivienda familiar.',
        keyArticle: 'Arts. 95-97 Ley 1/92',
        memoryTips: ['Bien de familia = protección de la vivienda contra embargos', 'Debe constituirse formalmente, no es automático']
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
        memoryTips: ['Para inscripciones: TODOS LOS DÍAS SON HÁBILES', 'Director General: Abogado, min 30 años', 'Entrega de libros bajo inventario es obligatoria antes de irse']
      },
      {
        id: 'p5l-l2',
        title: 'De los libros del Registro Civil y formalidades de las actas (Arts. 18 a 31)',
        summary: '4 Libros separados, por duplicado, prohibiciones formales del Art. 26 y los 5 elementos del Art. 27.',
        level1Simple: 'Las partidas del Registro Civil son instrumentos públicos con fe pública. Para evitar fraudes, está estrictamente prohibido usar números, abreviaturas o tachaduras.',
        level2Norm: 'Art. 18: Libros SEPARADOS (Nacimientos, Adopciones -solo Dirección General-, Matrimonios, Defunciones) por DUPLICADO y en el mismo acto. Cierre anual a fin de año (Art. 20). Art. 21: Inscripción en libro NO rubricado = NULA + SEPARACIÓN del Oficial. Art. 26: Prohibidos guarismos (números en cifra), abreviaturas, raspaduras y espacios en blanco. Art. 27 (LOS 5 ELEMENTOS): 1. Lugar/día/mes/año/hora, 2. Nombre/apellido/domicilio de comparecientes, 3. Naturaleza de inscripción, 4. Forma de acreditar identidad, 5. Firmas en ambos libros. Art. 30: Incompatibilidad del oficial (4° consanguinidad / 2° afinidad). Art. 31: Las partidas son INSTRUMENTOS PÚBLICOS.',
        level3DeskExample: 'En un acta se escribe "ocho de agosto del año dos mil veintiséis" y NO "08/08/2026". Las cifras numéricas son guarismos prohibidos.',
        keyArticle: 'Arts. 18, 21, 26, 27, 30, 31 Ley 1266',
        memoryTips: ['4 Libros: Nacimiento, Adopción (solo Dir Gen), Matrimonio, Defunción', 'Prohibidos: Guarismos, Abreviaturas, Raspaduras, Espacios en blanco', 'Inscripto en libro no rubricado = NULO']
      },
      {
        id: 'p5l-l3',
        title: 'Inscripción de nacimientos: denuncia vs. declaración y plazos (Arts. 50 a 63)',
        summary: 'Diferencia crucial entre denuncia médica y declaración de los padres, inscripciones oportunas y tardías.',
        level1Simple: 'El médico DENUNCIA el hecho biológico (no inscribe). Los padres DECLARAN el nacimiento ante el Oficial (produce la inscripción).',
        level2Norm: 'DENUNCIA (Art. 52): Médicos, parteras, directores de hospitales a los 7 DÍAS. NO tiene valor como inscripción. DECLARACIÓN (Art. 53): Padres o parientes mayores. Produce la inscripción. Plazos Oportunos (Art. 54): Hasta 30 DÍAS en Capital / 60 DÍAS en el interior. INSCRIPCIÓN TARDÍA (Art. 54): Desde 30/60 días HASTA LOS 15 AÑOS. Art. 56: Límites al nombre (Máximo 3 nombres, no ridículos, no inductores a error de sexo). Art. 57: Requisito ("que el nacido haya vivido siquiera un instante después de la separación de la madre"). Art. 65: Poner el nombre del padre/madre en la partida a su indicación es SUFICIENTE RECONOCIMIENTO.',
        level3DeskExample: 'Si un niño tiene 10 años y nunca fue inscripto, se realiza una Inscripción Tardía Administrativa. Si tiene 16 años, ya requiere trámite judicial.',
        keyArticle: 'Arts. 52, 53, 54, 56, 57, 65 Ley 1266',
        memoryTips: ['Denuncia = Médicos (7 días, NO inscribe)', 'Declaración = Padres (30/60 días, SÍ inscribe)', 'Tardía = hasta los 15 años', 'Máximo 3 nombres', 'Siquiera un instante con vida']
      },
      {
        id: 'p5l-l4',
        title: 'Inscripción de matrimonios: oposición, testigos e in extremis (Arts. 71 a 93)',
        summary: 'Trámite de oposición, matrimonios por poder, cantidad de testigos y matrimonio en peligro de muerte.',
        level1Simple: 'Un matrimonio en la oficina lleva 2 testigos. Fuera de la oficina lleva 4 testigos. En peligro de muerte (in extremis) lleva 3 testigos.',
        level2Norm: 'Oposición (Art. 75): Vista por 3 DÍAS a los contrayentes. Si niegan la causal, se suspende la boda y pasa al Juez de 1ª Instancia en lo Civil. Matrimonio por Poder (Art. 80.i): Poder determina la persona, caduca a los 90 DÍAS, 1 contrayente presente. Lectura inicial (Art. 82): Se lee el Art. 6° de la Ley 236/54. Testigos: Oficina = 2 testigos (Art. 27/81), Fuera de oficina = 4 testigos (Art. 81), Matrimonio IN EXTREMIS con peligro en la demora = 3 TESTIGOS no emparentados (4°/2°), al menos 1 alfabetizado + publicación por 8 días (Art. 85). Regularización de concubinato tras 5 AÑOS (Art. 86).',
        level3DeskExample: 'Si el Oficial celebra un matrimonio siendo incompetente territorialmente pero sin impedimentos legales, el Oficial es DESTITUIDO, pero el matrimonio SIGUE SIENDO VÁLIDO para proteger la buena fe de los esposos (Art. 78).',
        keyArticle: 'Arts. 75, 78, 80.i, 81, 82, 85, 86 Ley 1266',
        memoryTips: ['Testigos: 2 en oficina, 4 fuera, 3 in extremis', 'Poder caduca en 90 días', 'Oposición: Vista 3 días', 'En bodas se lee Art. 6 Ley 236/54']
      },
      {
        id: 'p5l-l5',
        title: 'Defunciones, rectificación, cancelación y archivo: los tres remedios registrales (Arts. 94-124)',
        summary: 'Plazo de 24h para declarar defunción, inhumación 12-36h y la distinción Reconstituir / Rectificar / Convalidar.',
        level1Simple: 'Una defunción se declara en 24 horas. Para inhumar hay que esperar mínimo 12 horas y máximo 36 horas. Y si algo sale mal en una partida: se Reconstituye (si se perdió), se Rectifica (si tiene error), o se Convalida (si falta firma).',
        level2Norm: 'Defunciones (Art. 95): Declarar en 24 HORAS. Inhumación (Art. 105): Mínimo 12 HORAS, máximo 36 HORAS. Sin médico: 2 TESTIGOS (Art. 98). Muerte violenta (Art. 100): Se inscribe igual, pero avisa al Juez quien autoriza la inhumación. Nacido muerto (Art. 104): NO se inscribe defunción. LOS TRES REMEDIOS: 1) RECONSTITUIR (Cap. XI): El libro se perdió/destruyó -> Resolución fundada de la Dirección o vía judicial. 2) RECTIFICAR (Cap. XII): Error u omisión -> Regla general: Sentencia Judicial. Excepción: Inmediata en el acto (Art. 117) o Administrativa por la Dirección con dictamen de Asesoría Jurídica para errores/omisiones materiales (Art. 118). 3) CONVALIDAR (Cap. XIII): Falta solo firma del Oficial (Art. 122) o de testigos (Art. 123) -> Resolución del Director.',
        level3DeskExample: 'Si en el certificado de nacimiento de 2018 notan que faltó poner el domicilio de la madre (error material), la Dirección lo arregla por vía administrativa. Si la persona quiere llamarse "Fernando" en vez de "Carlos", va al Juez.',
        keyArticle: 'Arts. 95, 105, 114, 118, 122 Ley 1266',
        memoryTips: ['Defunción: 24h declarar, 12-36h inhumar', 'RECONSTITUIR = se perdió/destruyó', 'RECTIFICAR = error u omisión de dato', 'CONVALIDAR = falta firma']
      },
      {
        id: 'p5l-l6',
        title: 'Mapa de los 16 capítulos y expedición de certificados (Arts. 111-137)',
        summary: 'El esqueleto completo de la ley y las reglas de expedición de copias y certificados.',
        level1Simple: 'La ley tiene 137 artículos organizados en 16 capítulos que siguen el ciclo de vida: primero la institución, después las herramientas (libros), después nacer-vivir-casarse-morir, y al final los remedios y sanciones.',
        level2Norm: 'Caps. I-III: la institución (disposiciones generales, organización, recursos). Caps. IV-V: las herramientas (libros, reglas de inscripción). Caps. VI-IX: el ciclo de vida (nacimientos, reconocimientos/adopciones, matrimonio, defunciones). Cap. X (Arts. 111-113): certificados o copias de inscripción — se expiden a solicitud, acreditando interés legítimo cuando corresponde. Caps. XI-XIV: remedios (reconstitución, rectificación/cancelación, convalidación, estadísticas vitales). Cap. XV (Arts. 129-132): sanciones. Cap. XVI (Arts. 133-137): disposiciones finales — la ley entró en vigencia a los 90 días de su promulgación (Art. 136) y derogó la Ley 58/1914 (Art. 134).',
        level3DeskExample: 'Cuando alguien pide un certificado de matrimonio de un tercero (no propio), el Oficial exige que acredite interés legítimo, a diferencia de un pedido de información pública general (Ley 5282), que no requiere justificación.',
        keyArticle: 'Arts. 111-113, 134, 136 Ley 1266',
        memoryTips: ['16 capítulos siguen el ciclo de vida', 'Certificados a terceros: requieren interés legítimo', 'Ley 1266 derogó a la Ley 58/1914']
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
        memoryTips: ['Acceso a info pública: Cualquier persona, GRATIS, SIN JUSTIFICAR', 'Fuentes públicas incluyen Itaipú, Yacyretá y Universidades']
      },
      {
        id: 'p6l-l2',
        title: 'Publicidad de los actos administrativos: información mínima obligatoria (Art. 8 - 17 incisos)',
        summary: 'Información que el Estado debe publicar activamente sin que nadie se lo pida.',
        level1Simple: 'Toda institución pública debe tener publicada en su web su organigrama, contrataciones, presupuestos y el listado de funcionarios con sus salarios.',
        level2Norm: 'Art. 8 inc. e: Listado actualizado de todas las personas en función pública, cédula, cargo y salarios mensuales con viáticos. Inc. o: Índice y sistema de mantenimiento de documentos. Inc. p: Lugar de archivo y nombre del funcionario responsable. Conservación de contrataciones públicas: al menos 5 años (Art. 10.e).',
        level3DeskExample: 'Los incisos o y p del Art. 8 conectan directamente con la Dirección de Gestión de Documentación Central de la DGREC.',
        keyArticle: 'Art. 8 inc. e, o, p Ley 5282',
        memoryTips: ['Art 8.e = Nómina de funcionarios con salarios', 'Información activa = Publicada en la web de forma permanente']
      },
      {
        id: 'p6l-l3',
        title: 'Acceso a la información pública: el procedimiento y la vía judicial (Arts. 12 a 27)',
        summary: 'Flujo paso a paso, plazo de 15 días hábiles, resolución ficta y acción judicial.',
        level1Simple: 'El Estado tiene 15 días hábiles para responder. Si no responde en plazo, se entiende que dijo NO (resolución ficta) y puedes demandar ante un juez en 60 días.',
        level2Norm: 'Presentación (Art. 12): Escrita, correo electrónico o verbal (se labra acta). Plazo de respuesta (Art. 16): 15 DÍAS HÁBILES contados desde el día siguiente a la presentación. Rechazo (Art. 15): Prohibido rechazar por defectuosa o incompetente (debe enviarse al competente). Denegatoria (Art. 19): Solo por Resolución Fundada de la MÁXIMA AUTORIDAD. Silencio (Art. 20): Resolución ficta denegatoria. Reconsideración (Art. 21): Opcional. Acción Judicial (Arts. 23-24): 60 DÍAS ante Juez de 1ª Instancia. Sanción por incumplimiento judicial: Multa hasta 300 días-multa e inhabilitación hasta 2 años.',
        level3DeskExample: 'Los documentos originales NO salen del archivo (Art. 18). Tampoco se puede exigir al funcionario que elabore estudios, análisis o informes que no forman parte de sus funciones.',
        keyArticle: 'Arts. 16, 18, 19, 20, 24, 26 Ley 5282',
        memoryTips: ['Plazo respuesta: 15 DÍAS HÁBILES desde el día siguiente', 'Silencio = Dijo NO (Resolución ficta)', 'Acción judicial: 60 días', 'Originales NUNCA salen del archivo']
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
        memoryTips: ['Jurisdicción = Poder/Facultad', 'Competencia = Límite territorial', 'Director General = Oficial en TODO el país', 'Secretario General = Oficial en la CAPITAL']
      },
      {
        id: 'p7d-l2',
        title: 'Funciones de la Dirección de Documentación Central y cadena de localización',
        summary: 'La dependencia donde está tu puesto y cómo se ubica un acta entre millones de folios.',
        level1Simple: 'Tu puesto está en esta dirección. Para buscar un acta entre millones de folios se usa una cadena exacta de 5 eslabones.',
        level2Norm: 'CADENA DE LOCALIZACIÓN DOCUMENTAL (Art. 39.h Dto 19.102): CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA. Funciones del Archivo/Documentación Central (Art. 39): Resguardar la integridad e inviolabilidad de los libros, inscribir notas marginales de resoluciones/sentencias con dictamen de Asesoría Jurídica, expedir certificados y fotocopias autenticadas dentro de las 48 horas.',
        level3DeskExample: 'En la entrevista, al explicar el flujo de trabajo de Documentación Central, recita la cadena: "Localizamos la solicitud en el inventario general por Caja, Volumen, Tomo, Folio y Acta".',
        keyArticle: 'Art. 39 inc. h Dto 19.102',
        memoryTips: ['Cadena: CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA', 'Certificados y fotocopias autenticadas: dentro de 48 horas']
      },
      {
        id: 'p7d-l3',
        title: 'Procedimientos internos y requisitos para ser Oficial del REC',
        summary: 'Los 6 requisitos estrictos para ejercer como Oficial del Registro Civil.',
        level1Simple: 'Ser Oficial del Registro Civil tiene requisitos más estrictos que un cargo público común: hay que ser paraguayo de nacimiento y vivir en el distrito.',
        level2Norm: 'LOS 6 REQUISITOS DEL OFICIAL (Art. 58 Dto 19.102): 1) Paraguayo/a NATURAL, 2) Mayor de edad, 3) Residencia permanente comprobada en el distrito, 4) Secundaria concluida, 5) Sin antecedentes penales firmes + notoria honorabilidad, 6) Aprobar examen teórico y práctico.',
        level3DeskExample: 'Diferencia con el servidor público general: El Oficial del REC EXIGE ser paraguayo NATURAL (no naturalizado), residir en el distrito y haber concluido la secundaria.',
        keyArticle: 'Art. 58 Dto 19.102',
        memoryTips: ['Oficial del REC: Paraguayo NATURAL + Residencia en el distrito + Secundaria concluida + Examen']
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
        memoryTips: ['14 Dependencias = 2 Conducción + 9 Apoyo + 3 Misionales', 'Documentación Central es la N° 12, bloque Misional']
      },
      {
        id: 'p8d-l2',
        title: 'Funciones actualizadas y competencias administrativas',
        summary: 'Qué cambió respecto al Decreto 19.102/2002 original.',
        level1Simple: 'El Decreto 3080 no reemplazó todo el Decreto 19.102: lo actualizó, sobre todo en la estructura y las funciones de cada dirección.',
        level2Norm: 'El Decreto 3080/2015 reorganiza la estructura orgánica fijada originalmente por el Decreto 19.102/2002, actualiza las funciones y atribuciones de cada dependencia, y precisa las competencias administrativas de cada dirección conforme a la práctica institucional acumulada desde 2002.',
        level3DeskExample: 'Cuando un manual de procedimientos internos cita ambos decretos juntos ("conforme Dto. 19.102/2002 y su modificatorio Dto. 3080/2015"), es porque el segundo actualiza al primero sin derogarlo por completo.',
        keyArticle: 'Dto 3080/2015 (modificatorio del Dto 19.102/2002)',
        memoryTips: ['Dto 3080/2015 = actualiza, no reemplaza, al Dto 19.102/2002']
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
        memoryTips: ['RM 983/2017 reemplazó a la RM 226/2015', 'DGTH = responsable del legajo', 'Plazo para entregar documentación: 30 días de ingreso']
      },
      {
        id: 'p9r-l2',
        title: 'Art. 11 — El contenido del legajo (los 12 ítems)',
        summary: 'Los doce documentos mínimos que debe contener el legajo personal de cada servidor.',
        level1Simple: 'El legajo es la carpeta oficial de cada funcionario. Debe tener, como mínimo, 12 documentos exactos.',
        level2Norm: 'Art. 11 — los 12 ítems mínimos del legajo: 1) Ficha de legajo personal completa, 2) Currículum Vitae actualizado y firmado con respaldo documental, 3) Fotocopia de cédula autenticada por escribanía, 4) Comprobante de declaración jurada de Bienes y Rentas ante la Contraloría, 5) Foto tipo carnet, 6) Certificados de antecedentes policiales y judiciales actualizados, 7) Decreto/Resolución de nombramiento (o contrato para personal contratado), 8) Resultados de evaluaciones de desempeño, 9) Promociones y capacitaciones, 10) Vacaciones, 11) Permiso por reposo médico, 12) Resoluciones de traslados, movimientos y sanciones.',
        level3DeskExample: 'El ítem 4 (declaración jurada de bienes) es la misma obligación del Art. 104 de la Constitución: se presenta dentro de los 15 días de asumir, y su comprobante va al legajo.',
        keyArticle: 'Art. 11 RM 983/2017',
        memoryTips: ['12 ítems agrupados: 5 al entrar, 4 durante la carrera, 1 obligación constitucional (DDJJ), 1 de nombramiento, 1 de movimientos/sanciones']
      },
      {
        id: 'p9r-l3',
        title: 'Jornada, horario, asistencia y permisos: los equivalentes en la Ley 7445',
        summary: 'Como el reglamento interno replica la Ley 7445, estos temas se estudian por sus artículos equivalentes.',
        level1Simple: 'El reglamento interno del Ministerio suele copiar casi textual la Ley 7445 en estos temas, así que se estudian ahí mientras se consigue el texto completo.',
        level2Norm: 'Jornada laboral: Art. 27 Ley 7445 (jornada ordinaria máxima). Horario de trabajo: Arts. 27-28 (trabajo extraordinario). Asistencia y puntualidad: Art. 51.d (obligación) + Art. 59 (falta leve por tardanzas) + Art. 61 (falta grave por ausencias). Permisos y licencias: Art. 29 (sin goce de sueldo), Art. 30 (con goce para capacitación), Art. 31 (ausencias por salud). Descanso semanal: mínimo 24 horas consecutivas (Art. 43.e). Vacaciones: no se compensan en dinero, se acumulan hasta 2 años (Art. 43.c).',
        level3DeskExample: 'Si te preguntan por el horario de trabajo según la RM 983/2017 y no tenés el texto completo a mano, respondé con el criterio de la Ley 7445 (jornada ordinaria y extraordinaria del Art. 27-28), aclarando que el reglamento interno la replica.',
        keyArticle: 'Arts. 27-31, 43, 51.d, 59, 61 Ley 7445 (equivalentes)',
        memoryTips: ['2 ausencias injustificadas/mes = falta leve', '3 consecutivas o 5 alternas/trimestre = falta grave', 'Descanso semanal: 24h mínimo']
      },
      {
        id: 'p9r-l4',
        title: 'Derechos, obligaciones, régimen disciplinario, prohibiciones y uso de bienes institucionales',
        summary: 'El resto de los temas pedidos por el acta y sus equivalentes en la Ley 7445.',
        level1Simple: 'Derechos, obligaciones y prohibiciones del personal del Ministerio se estudian con los mismos artículos que ya viste en la Ley 7445.',
        level2Norm: 'Derechos: Art. 43 Ley 7445 (los catorce derechos individuales). Obligaciones: Art. 51 (las dieciocho obligaciones). Régimen disciplinario: Arts. 54 a 76. Prohibiciones: Art. 52 (las veintitrés prohibiciones). Uso de bienes institucionales: Art. 51.r (velar por la conservación del patrimonio) + Art. 52.d y .o (no usar recursos para fines ajenos, no retirar documentos u objetos sin autorización). Conducta y responsabilidades: Art. 51.g (probidad administrativa) + Arts. 54 y 58 (responsabilidad administrativa).',
        level3DeskExample: 'Un funcionario que se lleva a su casa un expediente sin autorización incumple el Art. 52.o de la Ley 7445, aplicable también como uso indebido de bienes institucionales bajo la RM 983/2017.',
        keyArticle: 'Arts. 43, 51, 52, 54-76 Ley 7445 (equivalentes)',
        memoryTips: ['Los 9 temas del acta se estudian con los artículos equivalentes de la Ley 7445, salvo los Arts. 9-11 que sí están publicados']
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
        memoryTips: ['3 frentes del estado civil: Estado, Sociedad, Familia', '5 estados: Soltero, Casado, Viudo, Divorciado, Concubino', 'La definición del inciso a) "soltero" es la trampa más preguntada']
      },
      {
        id: 'p10l-l2',
        title: 'Certificación del estado civil (Arts. 5 a 7)',
        summary: 'Cómo se constituyen, modifican y prueban los estados civiles.',
        level1Simple: 'Los estados civiles solo pueden nacer, cambiar o terminar por los actos que la ley prevé, y sus derechos y obligaciones no se pueden renunciar.',
        level2Norm: 'Art. 5: los estados civiles derivados del matrimonio, concubinato o parentesco solo pueden constituirse, disolverse, terminarse o modificarse a través de los hechos o actos previstos en las disposiciones legales vigentes. Los derechos y obligaciones derivados son IRRENUNCIABLES, salvo excepciones legales. Art. 7: el estado civil se prueba exclusivamente con certificados expedidos por el Registro del Estado Civil.',
        level3DeskExample: 'Nadie puede "renunciar" a ser padre o cónyuge para librarse de una obligación: el estado civil y sus efectos son irrenunciables por regla general.',
        keyArticle: 'Arts. 5, 7 Ley 6618/2020',
        memoryTips: ['Derechos y obligaciones del estado civil: IRRENUNCIABLES', 'Se prueba SOLO con certificados del Registro Civil']
      },
      {
        id: 'p10l-l3',
        title: 'Consignación en documentos públicos (Arts. 6, 8, 9)',
        summary: 'Qué se escribe realmente en la cédula, el pasaporte y otros documentos.',
        level1Simple: 'Aunque hay 5 estados civiles legales, en los documentos cotidianos solo se escribe "soltero/a" o "casado/a", salvo que la persona pida conservar viudo o divorciado.',
        level2Norm: 'Art. 6: en los documentos personales se consigna SOLTERO/A o CASADO/A por regla general, salvo que la persona desee conservar el estado de VIUDO/A o DIVORCIADO/A, en cuyo caso puede solicitarlo expresamente. Arts. 8-9: disposiciones complementarias y de aplicación de la ley (vigencia y coordinación con el Registro Civil).',
        level3DeskExample: 'Una persona viuda que no dice nada al tramitar su cédula figura, por defecto, como "soltera" en el documento, a menos que pida expresamente conservar "viuda".',
        keyArticle: 'Art. 6 Ley 6618/2020',
        memoryTips: ['Regla general en documentos: Soltero/a o Casado/a', 'Viudo/a y Divorciado/a se conservan solo si la persona lo pide']
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
        memoryTips: ['1889: nace el registro civil estatal', '1914: Ley 58 (primera ley orgánica)', '1987: Ley 1266 (ley orgánica vigente)', '2015: Decreto 3080 (estructura actual)']
      },
      {
        id: 'p11h-l2',
        title: 'Misión, visión y valores',
        summary: 'La formulación oficial del Ministerio de Justicia y de la DGREC.',
        level1Simple: 'La misión del Ministerio empieza diciendo "Garantizar el acceso a la identidad", y el Registro Civil es precisamente el organismo que cumple esa parte de la misión.',
        level2Norm: 'VISIÓN del Ministerio de Justicia: "Ministerio moderno, confiable y comprometido; que asegure el cumplimiento de los objetivos institucionales." MISIÓN del Ministerio de Justicia: "Garantizar el acceso a la identidad y a la justicia de todos los paraguayos con énfasis en la promoción de los derechos humanos; brindar atención integral a las personas privadas de libertad y adolescentes en conflicto con la ley penal para su reinserción social." Definición operativa de la DGREC (Decretos 19.102 y 3080): órgano especializado, de ámbito nacional, eje articulador de los esfuerzos de la administración pública para un servicio público oportuno y eficiente que asegure la legalidad y seguridad jurídica de los hechos y actos del estado civil.',
        level3DeskExample: 'Para la entrevista: "La misión del Ministerio empieza por garantizar el acceso a la identidad, y el Registro del Estado Civil es el organismo a través del cual el Ministerio cumple esa parte de su misión."',
        keyArticle: 'Misión y Visión institucionales (Decretos 19.102/2002 y 3080/2015)',
        memoryTips: ['Misión: empieza con "Garantizar el acceso a la identidad..."', 'Conectar siempre identidad = Registro Civil']
      },
      {
        id: 'p11h-l3',
        title: 'Los nueve verbos del Registro Civil y el organigrama',
        summary: 'La definición operativa que resume qué hace la institución, en 9 verbos.',
        level1Simple: 'La mejor respuesta a "¿qué hace el Registro Civil?" son sus 9 verbos: 5 del ciclo normal, 3 de los remedios registrales, y 1 de resultado final.',
        level2Norm: 'LOS 9 VERBOS (Decreto 19.102/2002): la institución encargada de la RECOPILACIÓN, DOCUMENTACIÓN, ARCHIVO, CUSTODIA, INSCRIPCIÓN, RECTIFICACIÓN, RECONSTITUCIÓN, CONVALIDACIÓN y CERTIFICACIÓN de todos los hechos vitales y actos jurídicos relacionados al estado civil de los ciudadanos. Organigrama: 2 dependencias de Conducción (Dirección General, Secretaría General), 9 de Apoyo, 3 Misionales (incluida Documentación Central, Dependencia N° 12), según el Decreto 3080/2015.',
        level3DeskExample: 'En la entrevista: "El Registro Civil recopila, documenta, archiva, custodia e inscribe los hechos vitales; cuando algo falla, rectifica, reconstituye o convalida; y el producto final siempre es certificar."',
        keyArticle: 'Considerandos Dto 19.102/2002 y Dto 3080/2015',
        memoryTips: ['5 ciclo normal: Recopilar, Documentar, Archivar, Custodiar, Inscribir', '3 remedios: Rectificar, Reconstituir, Convalidar', '1 producto final: Certificar']
      }
    ]
  }
];
