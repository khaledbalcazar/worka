import { Chapter } from '../types';

export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 'parte-0',
    partNumber: 'Parte 0',
    title: 'Curso Express de Derecho para No Abogados',
    description: 'Bases fundamentales del sistema jurídico paraguayo, la Pirámide Kelseniana y el glosario de términos clave.',
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
        level2Norm: '1. Constitución Nacional (1992) -> 2. Tratados Internacionales aprobados -> 3. Leyes (Congreso, Ej: Ley 1266, Ley 7445) -> 4. Decretos (Presidente, Ej: Decreto 19.102) -> 5. Resoluciones (Ministros/Directores).',
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
        level2Norm: 'Derogar (eliminar norma/artículo). Abrogar (eliminar ley completa). Modificar (cambiar texto). Supletorio (aplica si falta otra cosa). De oficio (la autoridad actúa sola) vs A petición de parte (solicitud del ciudadano). Sumario administrativo (investigación interna a funcionario) vs Juicio sumario (juicio corto en tribunal).',
        level3DeskExample: 'Si el Oficial del Registro detecta un error de tipeo en un apellido ("Rodrígues"), se arregla por Vía Administrativa (Resolución de la Dirección). Si el ciudadano quiere cambiar su nombre de pila ("María" por "Sofía"), requiere Vía Judicial (Sentencia de Juez).',
        keyArticle: 'Glosario General',
        memoryTips: ['De oficio = solo el Estado', 'A petición = lo pide el interesado', 'Vía administrativa = Dirección General', 'Vía judicial = Juez']
      },
      {
        id: 'p0-l5',
        title: '0.5 Glosario Esencial: Parentesco, Imprescriptibilidad y Presunción',
        summary: 'Conceptos clave sobre consanguinidad, afinidad, notas marginales y presunciones.',
        level1Simple: 'Cálculo de grados de parentesco y diferencias entre instrumentos públicos y privados.',
        level2Norm: 'Consanguinidad (sangre): 1° Padres/Hijos, 2° Abuelos/Nietos/Hermanos, 3° Tíos/Sobrinos, 4° Primos Hermanos. Afinidad (matrimonio): 1° Suegros, 2° Cuñados. Regla 4° de consanguinidad y 2° de afinidad limita incompatibilidades del Oficial (Art. 30 Ley 1266) y Nepotismo (Art. 52.u Ley 7445). Instrumento Público: hace plena fe por sí solo (las partidas del REC son instrumentos públicos, Art. 31 Ley 1266).',
        level3DeskExample: 'Un oficial no puede inscribir el nacimiento del hijo de su primo hermano (4° consanguinidad) ni el matrimonio de su cuñado (2° afinidad).',
        keyArticle: 'Art. 30, 31, 38 Ley 1266 / Art. 52.u Ley 7445',
        memoryTips: ['4° consanguinidad = Primo hermano', '2° afinidad = Cuñado', 'Partida = Instrumento público con fe pública']
      }
    ]
  },
  {
    id: 'parte-0b',
    partNumber: 'Parte 0-B',
    title: 'Laboratorio de Memoria: Cómo Aprender Rápido',
    description: 'Técnicas de estudio científico: Curva del Olvido, Repetición Espaciada, Recuerdo Activo, Sistema Leitner y Técnica Feynman.',
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
  {
    id: 'parte-1',
    partNumber: 'Parte I',
    title: 'Constitución Nacional de la República del Paraguay (1992)',
    description: 'Análisis minucioso de los 5 ejes requeridos por el acta oficial de convocatoria.',
    lessons: [
      {
        id: 'p1-l1',
        title: 'Eje 1: Declaraciones Fundamentales, Derechos y Garantías (Arts. 1 a 45, 131-136)',
        summary: 'Forma del Estado, Derecho a la Vida, Libertad, Información veraz y Hábeas Data.',
        level1Simple: 'Paraguay es un Estado social de derecho, unitario, indivisible y descentralizado. La dictadura está fuera de la ley.',
        level2Norm: 'Art. 1: Estado social de derecho, unitario, indivisible y descentralizado. Democracia representativa, participativa y pluralista. Art. 4: Vida protegida desde la concepción (sin pena de muerte). Art. 9: Principio de legalidad ("Nadie está obligado a hacer lo que la ley no ordena ni privado de lo que no prohíbe"). Art. 28: Información veraz, responsable y ecuánime (fuentes públicas libres). Art. 40: Petición (silencio = denegado). Art. 135: Hábeas Data (actualización, rectificación o destrucción de datos en registros oficiales).',
        level3DeskExample: 'El Hábeas Data (Art. 135 CN) es la garantía constitucional directa que sustenta la rectificación de partidas en el Registro Civil.',
        keyArticle: 'Arts. 1, 4, 9, 28, 40, 135 CN',
        memoryTips: ['Estado: Social de derecho, unitario, indivisible, descentralizado', 'Información: veraz, responsable y ecuánime', 'Hábeas Data = corregir o actualizar mis datos oficiales']
      },
      {
        id: 'p1-l2',
        title: 'Eje 2: Principios de la Administración Pública (Arts. 9, 101, 104, 105, 106, 128)',
        summary: 'Legalidad, Igualdad, Idoneidad, Responsabilidad del funcionario, Probidad e Interés General.',
        level1Simple: 'Un funcionario público solo puede hacer lo que la ley expresamente le autoriza. Además, responde con su propio dinero si comete un daño.',
        level2Norm: 'Art. 106: Responsabilidad personal del funcionario -> Responsabilidad subsidiaria del Estado -> Derecho del Estado a REPETIR el pago contra el funcionario culpable. Art. 104: Declaración jurada de bienes dentro de los 15 días de asumir y al cesar. Art. 105: Prohibida doble remuneración salvo la docencia. Art. 128: Primacía del interés general sobre el particular.',
        level3DeskExample: 'Si un Oficial pierde un libro por negligencia y el Estado indemniza al ciudadano dañado, el Estado inicia juicio de repetición al Oficial para cobrarle el dinero pagado.',
        keyArticle: 'Arts. 104, 105, 106, 128 CN',
        memoryTips: ['Responsabilidad: Personal -> Subsidiaria del Estado -> Derecho a repetir', 'DDJJ: 15 días al asumir y al cesar', 'Excepción doble sueldo: Docencia']
      },
      {
        id: 'p1-l3',
        title: 'Eje 3: Igualdad ante la Ley (Arts. 46, 47, 48)',
        summary: 'Protecciones especiales igualitarias, las 4 garantías de igualdad y la igualdad hombre-mujer.',
        level1Simple: 'Tratar igual a quienes están en situación desigual perpetúa la desigualdad; por eso las medidas de protección a sectores vulnerables son igualitarias, no discriminatorias.',
        level2Norm: 'Art. 46: "Las protecciones que se establezcan sobre desigualdades injustas no serán consideradas discriminatorias sino igualitarias". Art. 47: 1) Acceso a la justicia, 2) Igualdad ante la ley, 3) Igualdad de acceso a funciones públicas no electivas sin más requisito que la IDONEIDAD, 4) Igualdad de oportunidades en beneficios. Art. 48: Iguales derechos civiles, políticos, sociales, económicos y culturales entre hombre y mujer.',
        level3DeskExample: 'El concurso público se basa en el Art. 47 inc. 3 CN: el único requisito constitucional para el puesto es la idoneidad evaluada objetivamente.',
        keyArticle: 'Arts. 46, 47, 48 CN',
        memoryTips: ['4 Garantías: Justicia, Leyes, Funciones (idoneidad), Beneficios', 'Igualdad de género en 5 ámbitos: civiles, políticos, sociales, económicos, culturales']
      },
      {
        id: 'p1-l4',
        title: 'Eje 4: Acceso a la Función Pública (Arts. 101 a 106)',
        summary: 'Las 7 carreras del Estado paraguayo y el régimen laboral público.',
        level1Simple: 'Los funcionarios están al servicio del país, no del gobierno ni del jefe de turno.',
        level2Norm: 'Art. 101: Las 7 carreras expresas son: 1) Judicial, 2) Docente, 3) Diplomática y Consular, 4) Investigación Científica y Tecnológica, 5) Servicio Civil, 6) Militar, 7) Policial. La carrera del Servicio Civil se rige por la Ley 7445/2025.',
        level3DeskExample: 'El puesto de Auxiliar/Asistente en la Dirección de Documentación Central del REC pertenece a la carrera del Servicio Civil.',
        keyArticle: 'Arts. 101-106 CN',
        memoryTips: ['Acróstico 7 carreras: J-D-D-C-C-M-P (Juez, Docente, Diplomático, Científico, Civil, Militar, Policía)']
      },
      {
        id: 'p1-l5',
        title: 'Eje 5: Derecho a la Identidad, Familia y Nacionalidad (Arts. 49-55, 140, 146-153)',
        summary: 'Protección de la familia, igualdad de los hijos, derechos del niño prevalecientes y nacionalidad natural.',
        level1Simple: 'El Registro Civil es el organismo que materializa el derecho constitucional a la identidad. Sin inscripción no hay cédula, ni escuela, ni voto.',
        level2Norm: 'Art. 49-51: Familia y unión de hecho (estable y singular). Art. 53: Todos los hijos son iguales ante la ley. Se prohíbe cualquier calificación sobre la filiación en documentos personales. Art. 54: Los derechos del niño tienen carácter PREVALECIENTE. Art. 140: Bilingüismo oficial (castellano y guaraní). Art. 146: Nacionalidad paraguaya natural (ius soli, hijos de paraguayos al servicio estatal, expósitos). Art. 152: Ciudadanía desde los 18 años.',
        level3DeskExample: 'Está prohibido por la Constitución que un certificado del Registro Civil diga "hijo natural", "ilegítimo" o "adoptivo". Sólo dice de quién es hijo.',
        keyArticle: 'Arts. 53, 54, 140, 146 CN',
        memoryTips: ['Prohibida la calificación de filiación en documentos', 'Derechos del niño = carácter prevaleciente', 'Nacionalidad desde nacimiento, Ciudadanía desde los 18']
      }
    ]
  },
  {
    id: 'parte-2',
    partNumber: 'Parte II',
    title: 'Ley N° 7445/2025 de la Función Pública y Servicio Civil',
    description: 'Nueva ley de función pública en Paraguay que reemplazó a la Ley 1626/2000. Regula el ingreso por concurso, la estabilidad, los derechos, obligaciones, prohibiciones y el régimen disciplinario.',
    lessons: [
      {
        id: 'p2-l1',
        title: '2.1-2.3 Principios Rectores y Autoridad de Aplicación (Arts. 1-10)',
        summary: 'Los 7 principios rectores de la función pública y el rol del MEF / VCHGO.',
        level1Simple: 'La Ley 7445/2025 busca la profesionalización del servidor público para que los cargos se ocupen por capacidad y no por favores políticos.',
        level2Norm: 'Autoridad de aplicación en el Poder Ejecutivo: Ministerio de Economía y Finanzas (MEF) a través del Viceministerio de Capital Humano y Gestión Organizacional (VCHGO). Art. 10 - Los 7 Principios Rectores: 1) Legalidad, 2) Igualdad de derechos, 3) Igualdad de oportunidades, 4) Previsión presupuestaria, 5) Eficiencia y Eficacia, 6) Mérito, 7) Probidad y Ética.',
        level3DeskExample: 'Tu concurso se evalúa bajo la Resolución VCHGO N° 33/2026, emitida por la autoridad de aplicación de la Ley 7445.',
        keyArticle: 'Arts. 4, 10 Ley 7445/2025',
        memoryTips: ['7 Principios: Legalidad, 2 Igualdades, Previsión Presupuestaria, Eficiencia/Eficacia, Mérito, Probidad', 'MEF/VCHGO es la autoridad de aplicación']
      },
      {
        id: 'p2-l2',
        title: '2.4-2.6 Requisitos, Concurso Único y Estabilidad Laboral (Arts. 12-20)',
        summary: '4 Requisitos para ser servidor público, 7 inhabilidades, concurso como única vía y línea de tiempo hacia la estabilidad.',
        level1Simple: 'El concurso público es la ÚNICA forma legal de entrar al Estado. Quien entra sin concurso es nulo sin importar cuántos años pasen.',
        level2Norm: '4 Requisitos (Art. 12): Nacionalidad paraguaya, Mayoría de edad, Idoneidad y capacidad, Pleno goce de derechos civiles/políticos. Art. 14: Concurso público es la única vía. Ingreso en transgresión es NULO. Línea de tiempo (Arts. 18-20): 0 a 6 meses = Período de Prueba (nombramiento provisorio, despido sin indemnización) -> 6 meses a 2 años = Período de Evaluación (despido con preaviso e indemnización) -> Cumplidos 2 AÑOS ininterrumpidos + ingreso por concurso = ESTABILIDAD LABORAL.',
        level3DeskExample: 'Si alguien trabaja hace 15 años pero nunca rindió un concurso público, NUNCA adquiere estabilidad laboral.',
        keyArticle: 'Arts. 12, 14, 18, 20 Ley 7445',
        memoryTips: ['Estabilidad = Concurso Público + 2 años ininterrumpidos', 'Período de prueba = 6 meses provisorio', 'Nulidad de nombramiento ilegal no prescribe']
      },
      {
        id: 'p2-l3',
        title: '2.7-2.8 Derechos, Obligaciones e Inteligencia Artificial (Arts. 43, 51)',
        summary: '14 Derechos individuales, acumulación de vacaciones por 2 años, y regulación del uso de IA en el trabajo.',
        level1Simple: 'Tus vacaciones no se pagan en dinero si no las tomas, pero se acumulan hasta por 2 años. Además, puedes usar Inteligencia Artificial si lo informas y te haces responsable.',
        level2Norm: 'Art. 43.c: Las vacaciones no gozadas NO generan compensación monetaria, pero se acumulan por 2 años. Descanso semanal mínimo: 24 horas consecutivas (Art. 43.e). Art. 51.b: La obligación de realizar personalmente el trabajo NO se viola por usar Inteligencia Artificial, si: 1) Se informa al superior, 2) El servidor asume la responsabilidad personal del contenido. Art. 51.j: Renuncia obliga a permanecer hasta 30 días corridos.',
        level3DeskExample: 'Si usas una herramienta de IA para redactar un informe en tu oficina, debes informar que la usaste y revisar que la información sea 100% verídica, siendo tú el único responsable.',
        keyArticle: 'Arts. 43.c, 51.b, 51.j Ley 7445',
        memoryTips: ['Vacaciones: no se pagan en dinero, acumulables 2 años', 'Uso de IA es legal si se informa y se asume responsabilidad', 'Renuncia = permanecer hasta 30 días corridos']
      },
      {
        id: 'p2-l4',
        title: '2.9 Prohibiciones, Nepotismo y Violencia Laboral (Art. 52)',
        summary: 'Las 23 prohibiciones estructuradas en 6 bloques lógicos.',
        level1Simple: 'Está prohibido cobrar propinas "para el cafecito", hacer política en la oficina, o nombrar parientes a dedo.',
        level2Norm: 'Bloques: 1) Político-electoral, 2) Corrupción (prohibido recibir obsequios/propinas ni para ejecutar con más esmero ni con retardo, Art. 52.f), 3) Recursos (retirar documentos sin anuencia), 4) Conflictos de interés, 5) Violencia laboral (vertical u horizontal, Art. 52.t), 6) Nepotismo (Art. 52.u: prohibido nombrar en puestos de confianza a cónyuge, concubino o parientes hasta el 4° de consanguinidad y 2° de afinidad, SALVO que sea por concurso público).',
        level3DeskExample: 'Si tu primo hermano gana el concurso público nacional, SÍ puede trabajar en tu misma institución, porque el concurso limpia el nepotismo.',
        keyArticle: 'Art. 52 incisos f, t, u Ley 7445',
        memoryTips: ['Nepotismo = Puestos de confianza a parientes (4°/2°)', 'Excepción al nepotismo = Concurso Público', 'Propinas para "agilizar" son corrupción sancionable']
      },
      {
        id: 'p2-l5',
        title: '2.10 Régimen Disciplinario: Faltas Leves vs. Faltas Graves (Arts. 54 a 76)',
        summary: 'Tabla Maestra del régimen disciplinario, sanciones, autoridades y sumario administrativo.',
        level1Simple: 'Llegar tarde o faltar 2 veces al mes es falta leve. Faltar 3 días seguidos o cometer acoso/corrupción es falta grave con sumario y destitución.',
        level2Norm: 'Faltas Leves (Art. 59): 2 ausencias injustificadas al mes, tardanzas. Sanción: Apercibimiento escrito o Multa 1 a 5 días sueldo (Art. 60). Aplica: Jefe de Gestión de Personas SIN sumario. Recurso: Reconsideración en 10 días hábiles. Faltas Graves (Art. 61): Ausencia 3 días consecutivos o 5 alternos en el trimestre, violencia, acoso, nepotismo, corrupción. Sanción: Suspensión progresión hasta 3 años, Suspensión sin sueldo hasta 90 días, Destitución con inhabilitación hasta 5 años (Art. 62). Aplica: Máxima Autoridad CON SUMARIO PREVIO (Art. 64).',
        level3DeskExample: 'Reiteración = Cometer faltas leves DISTINTAS en 1 año. Reincidencia = Cometer la MISMA falta leve. Ambas convierten la acumulación en Falta Grave.',
        keyArticle: 'Arts. 59, 60, 61, 62, 63, 64 Ley 7445',
        memoryTips: ['Falta Leve: Multa 1-5 días, sin sumario', 'Falta Grave: Suspensión hasta 90 días o destitución hasta 5 años, con sumario', 'Reiteración = distintas / Reincidencia = la misma']
      }
    ]
  },
  {
    id: 'parte-3',
    partNumber: 'Parte III',
    title: 'Ley N° 5282/2014 de Libre Acceso Ciudadano a la Información Pública',
    description: 'Norma de transparencia que reglamenta el Art. 28 CN. Principio de máxima publicidad, procedimiento de 15 días hábiles e información mínima obligatoria.',
    lessons: [
      {
        id: 'p3-l1',
        title: '3.1-3.3 Objeto, Fuentes Públicas y Gratuidad (Arts. 1 a 5)',
        summary: 'Todo lo que hace el Estado es público por regla y secreto por excepción legal.',
        level1Simple: 'Cualquier persona puede pedir información pública al Estado, es gratis y NO necesita explicar ni justificar para qué la quiere.',
        level2Norm: 'Art. 1: Reglamenta el Art. 28 CN. Art. 2: Fuentes públicas son todas las reparticiones del Estado (incluidas municipalidades, universidades y entidades binacionales como Itaipú y Yacyretá). Art. 4: Acceso GRATUITO, sin discriminación y SIN NECESIDAD DE JUSTIFICAR RAZONES. Art. 5: Responsabilidad personal por ocultar, alterar o destruir información pública.',
        level3DeskExample: 'Diferencia clave: Para pedir la nómina de sueldos de la DGREC (Ley 5282) NO justificas nada. Para pedir la partida de matrimonio de un tercero (Ley 1266) SÍ debes acreditar interés legítimo (protección de intimidad Art. 33 CN).',
        keyArticle: 'Arts. 2, 4, 5 Ley 5282',
        memoryTips: ['Acceso a info pública: Cualquier persona, GRATIS, SIN JUSTIFICAR', 'Fuentes públicas incluyen Itaipú, Yacyretá y Universidades']
      },
      {
        id: 'p3-l2',
        title: '3.5 Información Mínima Obligatoria (Art. 8 - 17 incisos)',
        summary: 'Información que el Estado debe publicar activamente sin que nadie se lo pida.',
        level1Simple: 'Toda institución pública debe tener publicada en su web su organigrama, contrataciones, presupuestos y el listado de funcionarios con sus salarios.',
        level2Norm: 'Art. 8 inc. e: Listado actualizado de todas las personas en función pública, cédula, cargo y salarios mensuales con viáticos. Inc. o: Índice y sistema de mantenimiento de documentos. Inc. p: Lugar de archivo y nombre del funcionario responsable. Conservación de contrataciones públicas: al menos 5 años (Art. 10.e).',
        level3DeskExample: 'Los incisos o y p del Art. 8 conectan directamente con la Dirección de Gestión de Documentación Central de la DGREC.',
        keyArticle: 'Art. 8 inc. e, o, p Ley 5282',
        memoryTips: ['Art 8.e = Nómina de funcionarios con salarios', 'Información activa = Publicada en la web de forma permanente']
      },
      {
        id: 'p3-l3',
        title: '3.6-3.8 El Procedimiento de Solicitud y Vía Judicial (Arts. 12 a 27)',
        summary: 'Flujo paso a paso, plazo de 15 días hábiles, resolución ficta y acción judicial.',
        level1Simple: 'El Estado tiene 15 días hábiles para responder. Si no responde en plazo, se entiende que dijo NO (resolución ficta) y puedes demandar ante un juez en 60 días.',
        level2Norm: 'Presentación (Art. 12): Escrita, correo electrónico o verbal (se labra acta). Plazo de respuesta (Art. 16): 15 DÍAS HÁBILES contados desde el día siguiente a la presentación. Rechazo (Art. 15): Prohibido rechazar por defectuosa o incompetente (debe enviarse al competente). Denegatoria (Art. 19): Solo por Resolución Fundada de la MÁXIMA AUTORIDAD. Silencio (Art. 20): Resolución ficta denegatoria. Reconsideración (Art. 21): Opcional. Acción Judicial (Arts. 23-24): 60 DÍAS ante Juez de 1ª Instancia. Sanción por incumplimiento judicial: Multa hasta 300 días-multa e inhabilitación hasta 2 años.',
        level3DeskExample: 'Los documentos originales NO salen del archivo (Art. 18). Tampoco se puede exigir al funcionario que elabore estudios, análisis o informes que no forman parte de sus funciones.',
        keyArticle: 'Arts. 16, 18, 19, 20, 24, 26 Ley 5282',
        memoryTips: ['Plazo respuesta: 15 DÍAS HÁBILES desde el día siguiente', 'Silencio = Dijo NO (Resolución ficta)', 'Acción judicial: 60 días', 'Originales NUNCA salen del archivo']
      }
    ]
  },
  {
    id: 'parte-4',
    partNumber: 'Parte IV',
    title: 'Ley N° 1266/1987 del Registro del Estado Civil',
    description: 'La Ley Orgánica fundamental del Registro del Estado Civil. 137 artículos y 16 capítulos que estructuran los libros, actas, nacimientos, matrimonios, defunciones y remedios registrales.',
    lessons: [
      {
        id: 'p4-l1',
        title: '4.1-4.4 Organización, Autoridad y Días Hábiles (Arts. 1 a 13)',
        summary: 'De quién depende la DGREC, requisitos del Director General y el Art. 6 de días hábiles.',
        level1Simple: 'El Registro Civil es la institución que convierte los hechos de la vida (nacer, casarse, morir) en derechos jurídicos exigibles.',
        level2Norm: 'Art. 1: Depende del Ministerio de Justicia. Art. 6: "Todos los días son considerados HÁBILES para las inscripciones en el Registro del Estado Civil". Se establecen turnos para feriados. Art. 7: Director General debe ser ABOGADO y tener mínimo 30 AÑOS. Art. 9.d: Atribuciones del Director (Reconstituir, Rectificar admin y Convalidar con dictamen previo de Asesoría Jurídica). Art. 13: El Oficial NO puede dejar el cargo sin entregar los libros bajo inventario.',
        level3DeskExample: 'Aunque las oficinas administrativas cierren el domingo, el servicio de inscripciones del REC tiene turnos porque la gente nace y muere todos los días.',
        keyArticle: 'Arts. 6, 7, 9.d, 13 Ley 1266',
        memoryTips: ['Para inscripciones: TODOS LOS DÍAS SON HÁBILES', 'Director General: Abogado, min 30 años', 'Entrega de libros bajo inventario es obligatoria antes de irse']
      },
      {
        id: 'p4-l2',
        title: '4.5-4.6 De los Libros y Formalidades de las Actas (Arts. 18 a 31)',
        summary: '4 Libros separados, por duplicado, prohibiciones formales del Art. 26 y los 5 elementos del Art. 27.',
        level1Simple: 'Las partidas del Registro Civil son instrumentos públicos con fe pública. Para evitar fraudes, está estrictamente prohibido usar números, abreviaturas o tachaduras.',
        level2Norm: 'Art. 18: Libros SEPARADOS (Nacimientos, Adopciones -solo Dirección General-, Matrimonios, Defunciones) por DUPLICADO y en el mismo acto. Cierre anual a fin de año (Art. 20). Art. 21: Inscripción en libro NO rubricado = NULA + SEPARACIÓN del Oficial. Art. 26: Prohibidos guarismos (números en cifra), abreviaturas, raspaduras y espacios en blanco. Art. 27 (LOS 5 ELEMENTOS): 1. Lugar/día/mes/año/hora, 2. Nombre/apellido/domicilio de comparecientes, 3. Naturaleza de inscripción, 4. Forma de acreditar identidad, 5. Firmas en ambos libros. Art. 30: Incompatibilidad del oficial (4° consanguinidad / 2° afinidad). Art. 31: Las partidas son INSTRUMENTOS PÚBLICOS.',
        level3DeskExample: 'En un acta se escribe "ocho de agosto del año dos mil veintiséis" y NO "08/08/2026". Las cifras numéricas son guarismos prohibidos.',
        keyArticle: 'Arts. 18, 21, 26, 27, 30, 31 Ley 1266',
        memoryTips: ['4 Libros: Nacimiento, Adopción (solo Dir Gen), Matrimonio, Defunción', 'Prohibidos: Guarismos, Abreviaturas, Raspaduras, Espacios en blanco', 'Inscripto en libro no rubricado = NULO']
      },
      {
        id: 'p4-l3',
        title: '4.8 Nacimientos: Denuncia vs. Declaración y Plazos (Arts. 50 a 63)',
        summary: 'Diferencia crucial entre denuncia médica y declaración de los padres, inscripciones oportunas y tardías.',
        level1Simple: 'El médico DENUNCIA el hecho biológico (no inscribe). Los padres DECLARAN el nacimiento ante el Oficial (produce la inscripción).',
        level2Norm: 'DENUNCIA (Art. 52): Médicos, parteras, directores de hospitales a los 7 DÍAS. NO tiene valor como inscripción. DECLARACIÓN (Art. 53): Padres o parientes mayores. Produce la inscripción. Plazos Oportunos (Art. 54): Hasta 30 DÍAS en Capital / 60 DÍAS en el interior. INSCRIPCIÓN TARDÍA (Art. 54): Desde 30/60 días HASTA LOS 15 AÑOS. Art. 56: Límites al nombre (Máximo 3 nombres, no ridículos, no inductores a error de sexo). Art. 57: Requisito ("que el nacido haya vivido siquiera un instante después de la separación de la madre"). Art. 65: Poner el nombre del padre/madre en la partida a su indicación es SUFICIENTE RECONOCIMIENTO.',
        level3DeskExample: 'Si un niño tiene 10 años y nunca fue inscripto, se realiza una Inscripción Tardía Administrativa. Si tiene 16 años, ya requiere trámite judicial.',
        keyArticle: 'Arts. 52, 53, 54, 56, 57, 65 Ley 1266',
        memoryTips: ['Denuncia = Médicos (7 días, NO inscribe)', 'Declaración = Padres (30/60 días, SÍ inscribe)', 'Tardía = hasta los 15 años', 'Máximo 3 nombres', 'Siquiera un instante con vida']
      },
      {
        id: 'p4-l4',
        title: '4.10 Matrimonio: Oposición, Testigos e In Extremis (Arts. 71 a 93)',
        summary: 'Trámite de oposición, matrimonios por poder, cantidad de testigos y matrimonio en peligro de muerte.',
        level1Simple: 'Un matrimonio en la oficina lleva 2 testigos. Fuera de la oficina lleva 4 testigos. En peligro de muerte (in extremis) lleva 3 testigos.',
        level2Norm: 'Oposición (Art. 75): Vista por 3 DÍAS a los contrayentes. Si niegan la causal, se suspende la boda y pasa al Juez de 1ª Instancia en lo Civil. Matrimonio por Poder (Art. 80.i): Poder determina la persona, caduca a los 90 DÍAS, 1 contrayente presente. Lectura inicial (Art. 82): Se lee el Art. 6° de la Ley 236/54. Testigos: Oficina = 2 testigos (Art. 27/81), Fuera de oficina = 4 testigos (Art. 81), Matrimonio IN EXTREMIS con peligro en la demora = 3 TESTIGOS no emparentados (4°/2°), al menos 1 alfabetizado + publicación por 8 días (Art. 85). Regularización de concubinato tras 5 AÑOS (Art. 86).',
        level3DeskExample: 'Si el Oficial celebra un matrimonio siendo incompetente territorialmente pero sin impedimentos legales, el Oficial es DESTITUIDO, pero el matrimonio SIGUE SIENDO VÁLIDO para proteger la buena fe de los esposos (Art. 78).',
        keyArticle: 'Arts. 75, 78, 80.i, 81, 82, 85, 86 Ley 1266',
        memoryTips: ['Testigos: 2 en oficina, 4 fuera, 3 in extremis', 'Poder caduca en 90 días', 'Oposición: Vista 3 días', 'En bodas se lee Art. 6 Ley 236/54']
      },
      {
        id: 'p4-l5',
        title: '4.11-4.13 Defunciones y Los Tres Remedios Registrales (Arts. 94-124)',
        summary: 'Plazo de 24h para declarar defunción, inhumación 12-36h y la distinción Reconstituir / Rectificar / Convalidar.',
        level1Simple: 'Una defunción se declara en 24 horas. Para inhumar hay que esperar mínimo 12 horas y máximo 36 horas. Y si algo sale mal en una partida: se Reconstituye (si se perdió), se Rectifica (si tiene error), o se Convalida (si falta firma).',
        level2Norm: 'Defunciones (Art. 95): Declarar en 24 HORAS. Inhumación (Art. 105): Mínimo 12 HORAS, máximo 36 HORAS. Sin médico: 2 TESTIGOS (Art. 98). Muerte violenta (Art. 100): Se inscribe igual, pero avisa al Juez quien autoriza la inhumación. Nacido muerto (Art. 104): NO se inscribe defunción. LOS TRES REMEDIOS: 1) RECONSTITUIR (Cap. XI): El libro se perdió/destruyó -> Resolución fundada de la Dirección o vía judicial. 2) RECTIFICAR (Cap. XII): Error u omisión -> Regla general: Sentencia Judicial. Excepción: Inmediata en el acto (Art. 117) o Administrativa por la Dirección con dictamen de Asesoría Jurídica para errores/omisiones materiales (Art. 118). 3) CONVALIDAR (Cap. XIII): Falta solo firma del Oficial (Art. 122) o de testigos (Art. 123) -> Resolución del Director.',
        level3DeskExample: 'Si en el certificado de nacimiento de 2018 notan que faltó poner el domicilio de la madre (error material), la Dirección lo arregla por vía administrativa. Si la persona quiere llamarse "Fernando" en vez de "Carlos", va al Juez.',
        keyArticle: 'Arts. 95, 105, 114, 118, 122 Ley 1266',
        memoryTips: ['Defunción: 24h declarar, 12-36h inhumar', 'RECONSTITUIR = se perdió/destruyó', 'RECTIFICAR = error u omisión de dato', 'CONVALIDAR = falta firma']
      }
    ]
  },
  {
    id: 'parte-5-6',
    partNumber: 'Partes V y VI',
    title: 'Decretos N° 19.102/2002 y N° 3080/2015',
    description: 'Reglamentación de la Ley 1266, estructura orgánica de 14 dependencias, competencias del Oficial y cadena de localización documental.',
    lessons: [
      {
        id: 'p5-l1',
        title: 'Jurisdicción vs. Competencia y La Dirección General (Dto. 19.102)',
        summary: 'Diferencia conceptual entre Jurisdicción y Competencia y rol del Director General.',
        level1Simple: 'Jurisdicción es el PODER legal que tienes para inscribir. Competencia es el TERRITORIO o límite donde puedes ejercer ese poder.',
        level2Norm: 'Jurisdicción (Art. 3.i Dto 19.102): Atribución legal de la Oficina/Oficial para el ejercicio de su potestad. Competencia (Art. 3.j): Extensión y límite TERRITORIAL. El Director General actúa también como Oficial del REC con competencia en TODO EL TERRITORIO nacional (Arts. 7 y 9.g). El Secretario General actúa como Oficial del REC con competencia en LA CAPITAL (Art. 13).',
        level3DeskExample: 'Un oficial de Areguá tiene jurisdicción para inscribir nacimientos, pero su competencia termina en los límites del distrito de Areguá.',
        keyArticle: 'Arts. 3, 7, 13 Dto 19.102/2002',
        memoryTips: ['Jurisdicción = Poder/Facultad', 'Competencia = Límite territorial', 'Director General = Oficial en TODO el país', 'Secretario General = Oficial en la CAPITAL']
      },
      {
        id: 'p5-l2',
        title: 'Dirección de Gestión de Documentación Central y Cadena de Localización',
        summary: 'Sucesora del Archivo Central (Dependencia N° 12 en Dto. 3080/2015) y cómo se ubica un acta.',
        level1Simple: 'Tu puesto está en la Dirección N° 12. Para buscar un acta entre millones de folios se usa una cadena exacta de 5 eslabones.',
        level2Norm: 'CADENA DE LOCALIZACIÓN DOCUMENTAL (Art. 39.h Dto 19.102): CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA. Funciones del Archivo Central / Documentación Central (Art. 39): Resguardar la integridad e inviolabilidad de los libros, inscribir notas marginales de resoluciones/sentencias con dictamen de Asesoría Jurídica, expedir certificados y fotocopias autenticadas dentro de las 48 horas.',
        level3DeskExample: 'En la entrevista, al explicar el flujo de trabajo de Documentación Central, recita la cadena: "Localizamos la solicitud en el inventario general por Caja, Volumen, Tomo, Folio y Acta".',
        keyArticle: 'Art. 39 inc. h Dto 19.102 / Dto 3080 N° 12',
        memoryTips: ['Cadena: CAJA -> VOLUMEN -> TOMO -> FOLIO -> ACTA', 'Documentación Central es la Dependencia N° 12']
      },
      {
        id: 'p5-l3',
        title: 'Estructura de 14 Dependencias y Requisitos para ser Oficial (Dto. 3080 y 19.102)',
        summary: 'Las 14 dependencias orgánicas y los 6 requisitos estrictos para ser Oficial del REC.',
        level1Simple: 'El Decreto 3080/2015 fijó 14 direcciones en 3 bloques (Conducción, Apoyo e Misionales).',
        level2Norm: 'Las 14 Dependencias: Conducción (1. Dir. General, 2. Sec. General), Apoyo (3. Admin. y Finanzas, 4. Asesoría Jurídica, 5. Asesoría Técnica, 6. Planificación, 7. Auditoría Interna, 8. Comunicación, 9. Género/Juventud/Indígenas, 10. Talento Humano, 11. Informática), Misionales (12. Gestión de Documentación Central, 13. Oficinas del REC, 14. Centro de Estudios Registrales). LOS 6 REQUISITOS DEL OFICIAL (Art. 58 Dto 19.102): 1) Paraguayo/a NATURAL, 2) Mayor de edad, 3) Residencia permanente comprobada en el distrito, 4) Secundaria concluida, 5) Sin antecedentes penales firmes + notoria honorabilidad, 6) Aprobar examen teórico y práctico.',
        level3DeskExample: 'Diferencia con el servidor público general: El Oficial del REC EXIGE ser paraguayo NATURAL (no naturalizado), residir en el distrito y haber concluido la secundaria.',
        keyArticle: 'Art. 1° Dto 3080/2015 / Art. 58 Dto 19.102',
        memoryTips: ['14 Dependencias (2 Conducción + 9 Apoyo + 3 Misionales)', 'Oficial del REC: Paraguayo NATURAL + Residencia en el distrito + Secundaria concluida']
      }
    ]
  },
  {
    id: 'parte-7-11',
    partNumber: 'Partes VII a XI',
    title: 'Normativa Complementaria: Código Civil, Ley 1/92, Ley 6618 y Guaraní',
    description: 'Resumen integrado de las normas de familia, estado civil en documentos personales, historia y el idioma guaraní oficial.',
    lessons: [
      {
        id: 'p7-l1',
        title: 'Código Civil (Arts. 35, 42, 179-188, 225-243) y Ley 1/1992',
        summary: 'Prueba del estado civil, matrimonio nulo vs. anulable, filiación y régimen de bienes.',
        level1Simple: 'El Código Civil fue reformado en 1992 para garantizar la igualdad total entre hombres y mujeres en el matrimonio, la administración de bienes y los apellidos.',
        level2Norm: 'Art. 35 CC: Escalones de prueba (1. Partidas REC, 2. Registros Parroquiales antes de 1889, 3. Otros medios). Art. 42 CC: Nombre/Apellido inscriptos en el REC; solo el Juez autoriza cambios por justa causa. Nulidad Matrimonial (Arts. 179/181): Nulo por impedimento dirimente; Anulable por vicio del consentimiento en 60 días. Filiación (Arts. 225-243): Números 180 días mínimo embarazo viable, 300 días máximo disolución. Posesión de estado: NOMEN, TRACTATUS, FAMA (Nombre, trato y fama). Impugnación de paternidad: 60 DÍAS desde conocimiento del parto. Ley 1/1992: Apellido marital opcional (Art. 10). Apellidos de hijos por acuerdo (Art. 12). Edad matrimonio: 18 años (16 con dispensa). Unión de Hecho (Arts. 83-94): Estable, pública y singular; 4 años para bienes/herencia, 10 años para inscripción y equiparación a matrimonio.',
        level3DeskExample: 'Si los novios no eligen régimen patrimonial antes de casarse, el Oficial aplica el régimen SUPLETORIO: Comunidad de gananciales bajo administración conjunta (Art. 24 y 25 Ley 1/92). El Oficial tiene la obligación de INFORMAR esto antes de celebrar la boda.',
        keyArticle: 'Arts. 35, 42, 225, 235 CC / Arts. 1, 10, 12, 25, 83, 86 Ley 1/92',
        memoryTips: ['Prueba del nacimiento/fallecimiento = Partidas del REC', 'Posesión de estado = Nomen + Tractatus + Fama', 'Unión de hecho = 4 años gananciales, 10 años inscripción/equiparación']
      },
      {
        id: 'p7-l2',
        title: 'Ley 6618/2020: Estado Civil en Documentos Personales',
        summary: 'Los 5 estados civiles legales y la simplificación de uso documental.',
        level1Simple: 'La ley define 5 estados civiles, pero en los documentos cotidianos solo se escribe SOLTERO/A o CASADO/A, salvo que la persona pida conservar viudo o divorciado.',
        level2Norm: 'Art. 2: Estado Civil es la situación jurídica frente al Estado, la Sociedad y la Familia. Art. 3: Fuentes del estado familiar son Matrimonio, Concubinato y Parentesco. Art. 4: LOS 5 ESTADOS CIVILES son: 1) Soltero (incluye a quien tuvo matrimonio o concubinato disuelto/anulado), 2) Casado, 3) Viudo (disuelto por muerte), 4) Divorciado (disuelto por sentencia judicial), 5) Concubino. Art. 6: En documentos personales se consigna SOLTERO/A o CASADO/A (salvo deseo de conservar viudo/a o divorciado/a). Art. 7: Se prueba con Certificados expedidos por el Registro Civil.',
        level3DeskExample: 'Una persona divorciada, si no especifica nada en un formulario, figurará jurídicamente como soltera conforme al Art. 6 de la Ley 6618.',
        keyArticle: 'Arts. 2, 4, 6, 7 Ley 6618/2020',
        memoryTips: ['5 Estados: Soltero, Casado, Viudo, Divorciado, Concubino', 'Documentos: Soltero/a o Casado/a por regla general', 'Se prueba exclusivamente con Certificados del REC']
      },
      {
        id: 'p7-l3',
        title: 'Los 9 Verbos del Registro Civil, Reseña Histórica y Misión',
        summary: 'Definición operativa de la función institucional y línea del tiempo.',
        level1Simple: 'El Registro Civil cumple 9 funciones verbales clave en el ciclo de vida de los documentos.',
        level2Norm: 'LOS 9 VERBOS (Dto 19.102/3080): 1. Recopilar, 2. Documentar, 3. Archivar, 4. Custodiar, 5. Inscribir, 6. Rectificar, 7. Reconstituir, 8. Convalidar, 9. Certificar. Reseña Histórica: 1881-1889 Libros Parroquiales -> 1 de agosto de 1889 Ley de Matrimonio Civil (nace el REC estatal) -> Ley 58 de 1914 -> Ley 1266 de 1987 -> Constitución de 1992 -> Ley 7445 de 2025. Misión institucional: Garantizar el acceso a la identidad y a la seguridad jurídica de los hechos vitales.',
        level3DeskExample: 'Si te preguntan en la entrevista "¿Qué hace el Registro Civil?", responde recitando los 9 verbos organizados en ciclo normal, remedios y producto final.',
        keyArticle: 'Considerandos Dto 19.102 / Dto 3080 / Reseña Histórica',
        memoryTips: ['5 Ciclo normal: Recopilar, Documentar, Archivar, Custodiar, Inscribir', '3 Remedios: Rectificar, Reconstituir, Convalidar', '1 Producto final: Certificar']
      }
    ]
  }
];
