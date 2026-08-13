// Mapa entre los cursos del Temario Oficial y el Manual de Estudio oficial.
//
// Cada curso corresponde a una PARTE del manual (lib/elearn/manual-data.json),
// y cada unidad del curso toma como material de estudio una o más SECCIONES
// de esa parte (identificadas por el prefijo numérico de su encabezado H2,
// p. ej. "4.3"). Así el curso muestra el desarrollo íntegro del manual —no un
// resumen— organizado según lo que pide la tabla oficial del concurso.

// chapterId (chaptersData) -> partId (manual-data.json)
export const CHAPTER_TO_MANUAL_PART: Record<string, string> = {
  'parte-0': 'parte-1',    // PARTE 0 — Curso express de derecho
  'parte-0b': 'parte-2',   // PARTE 0-B — Laboratorio de memoria
  'oficial-1': 'parte-3',  // PARTE I — Constitución Nacional
  'oficial-2': 'parte-4',  // PARTE II — Ley 7445/2025
  'oficial-3': 'parte-10', // PARTE VIII — Código Civil
  'oficial-4': 'parte-11', // PARTE IX — Ley 1/1992
  'oficial-5': 'parte-6',  // PARTE IV — Ley 1266/1987
  'oficial-6': 'parte-5',  // PARTE III — Ley 5282/2014
  'oficial-7': 'parte-7',  // PARTE V — Decreto 19.102/2002
  'oficial-8': 'parte-8',  // PARTE VI — Decreto 3080/2015
  'oficial-9': 'parte-9',  // PARTE VII — RM 983/2017
  'oficial-10': 'parte-12',// PARTE X — Ley 6618/2020
  'oficial-11': 'parte-13' // PARTE XI — Misión, visión, historia y organigrama
};

// lessonId -> prefijos de sección del manual que desarrollan esa unidad.
// Entre todas las unidades de un curso se cubren todas las secciones de su
// parte, para que no se pierda contenido del manual.
export const LESSON_TO_MANUAL_SECTIONS: Record<string, string[]> = {
  // Preparación — Curso express de derecho
  'p0-l1': ['0.1'],
  'p0-l2': ['0.2'],
  'p0-l3': ['0.3', '0.4'],
  'p0-l4': ['0.5'],
  'p0-l5': ['0.6', '0.7'],

  // Preparación — Laboratorio de memoria
  'p0b-l1': ['0-B.1', '0-B.2', '0-B.3', '0-B.4'],
  'p0b-l2': ['0-B.5', '0-B.6', '0-B.7', '0-B.8', '0-B.9', '0-B.10', '0-B.11', '0-B.12'],

  // N° 1 — Constitución Nacional
  'p1-l1': ['1.1', '1.2', '1.3'],
  'p1-l2': ['1.4'],
  'p1-l3': ['1.5'],
  'p1-l4': ['1.6'],
  'p1-l5': ['1.7', '1.8', '1.9'],

  // N° 2 — Ley 7445/2025
  'p2-l1': ['2.1', '2.2', '2.3'],
  'p2-l2': ['2.4', '2.5', '2.6'],
  'p2-l3': ['2.7', '2.8'],
  'p2-l4': ['2.9'],
  'p2-l5': ['2.10', '2.11', '2.12', '2.13'],

  // N° 3 — Código Civil
  'p3c-l1': ['8.1', '8.2', '8.3'],
  'p3c-l2': ['8.4'],
  'p3c-l3': ['8.5'],
  'p3c-l4': ['8.6', '8.7'],

  // N° 4 — Ley 1/1992
  'p4a-l1': ['9.1', '9.2'],
  'p4a-l2': [],
  'p4a-l3': ['9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9'],
  'p4a-l4': ['9.10'],
  'p4a-l5': ['9.11', '9.12', '9.13'],

  // N° 5 — Ley 1266/1987
  'p5l-l1': ['4.1', '4.2', '4.3', '4.4', '4.5'],
  'p5l-l2': ['4.6', '4.7'],
  'p5l-l3': ['4.8', '4.9'],
  'p5l-l4': ['4.10'],
  'p5l-l5': ['4.11', '4.13'],
  'p5l-l6': ['4.12', '4.14', '4.15', '4.16', '4.17'],

  // N° 6 — Ley 5282/2014
  'p6l-l1': ['3.1', '3.2', '3.3', '3.4'],
  'p6l-l2': ['3.5'],
  'p6l-l3': ['3.6', '3.7', '3.8'],

  // N° 7 — Decreto 19.102/2002
  'p7d-l1': ['5.1', '5.2', '5.3', '5.4'],
  'p7d-l2': ['5.5', '5.6'],
  'p7d-l3': ['5.7', '5.8', '5.9', '5.10'],

  // N° 8 — Decreto 3080/2015
  'p8d-l1': ['6.1', '6.3', '6.4'],
  'p8d-l2': ['6.2', '6.5', '6.6'],
  'p8d-l3': [],

  // N° 9 — Resolución Ministerial 983/2017
  'p9r-l1': ['7.1', '7.2'],
  'p9r-l2': ['7.3', '7.4'],
  'p9r-l3': ['7.5'],
  'p9r-l4': [],
  'p9r-l5': ['7.6'],

  // N° 10 — Ley 6618/2020
  'p10l-l1': ['10.1', '10.2', '10.3'],
  'p10l-l2': [],
  'p10l-l3': ['10.4'],

  // N° 11 — Misión, visión, historia y organigrama
  'p11h-l1': ['11.1'],
  'p11h-l2': ['11.2', '11.3'],
  'p11h-l3': ['11.4', '11.5']
};
