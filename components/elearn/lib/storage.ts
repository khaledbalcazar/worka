import { UserProgress } from '../types';

const STORAGE_KEY = 'dgrec_learning_progress_v1';

const defaultProgress: UserProgress = {
  completedLessons: [],
  masteredFlashcards: [],
  quizScores: {},
  errorLog: [],
  feynmanLogs: [],
  completedStudyDays: [],
  bookmarkedQuestionIds: []
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading progress from localStorage', e);
    return defaultProgress;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
}
