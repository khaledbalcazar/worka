export interface LessonExercise {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  level1Simple: string; // En palabras simples
  level2Norm: string;   // El texto legal / números a memorizar
  level3DeskExample: string; // Ejemplo del mostrador de atención al público
  keyArticle?: string;
  memoryTips?: string[];
  deepDive?: string[]; // Desarrollo extendido: artículo por artículo, casos, excepciones
  exercises?: LessonExercise[]; // Autoevaluación al final de la lección
  // Secciones del Manual oficial cuyo contenido íntegro se muestra en esta
  // unidad (prefijos de encabezado, p. ej. ['4.3', '4.4']). Es el material
  // de estudio real; los campos de arriba son el resumen pedagógico.
  manualSections?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  partNumber: string; // e.g. "Parte 0", "Parte I", "Parte II"...
  description: string;
  lessons: Lesson[];
  // Parte del Manual oficial (lib/elearn/manual-data.json) de la que este
  // curso toma su material de estudio íntegro.
  manualPartId?: string;
}

export interface QuizQuestion {
  id: string;
  block: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  blockName: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  legalReference: string;
}

export interface HardDataItem {
  id: string;
  law: string;
  periodOrNumber: string;
  matter: string;
  article: string;
  category: 'plazo' | 'numero' | 'competencia' | 'sancion';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  articleRef?: string;
}

export interface GuaraniWord {
  guarani: string;
  spanish: string;
  category: 'saludo' | 'presentacion' | 'numero' | 'dia' | 'mes' | 'profesion' | 'trabajo' | 'frase_ventanilla';
  note?: string;
}

export interface OfimaticaItem {
  id: string;
  app: 'Word' | 'Excel' | 'PowerPoint' | 'Outlook';
  title: string;
  routeOrShortcut?: string;
  description: string;
  category: string;
}

export interface StudyDay {
  dayNumber: number;
  weekNumber: number;
  title: string;
  tasks: string[];
  objective: string;
}

export interface UserProgress {
  completedLessons: string[]; // lesson IDs
  masteredFlashcards: string[]; // flashcard IDs
  quizScores: { [blockId: string]: number }; // e.g. { 'A': 22, 'B': 24 }
  errorLog: { questionId: string; userNote: string; date: string }[];
  feynmanLogs: { topic: string; score: number; date: string }[];
  completedStudyDays: number[]; // day numbers
  bookmarkedQuestionIds: string[];
}
