'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LessonsView } from './components/LessonsView';
import { HardDataView } from './components/HardDataView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizSimulatorView } from './components/QuizSimulatorView';
import { GuaraniLabView } from './components/GuaraniLabView';
import { OfimaticaView } from './components/OfimaticaView';
import { FeynmanTutorView } from './components/FeynmanTutorView';
import { StudyPlanView } from './components/StudyPlanView';
import { ManualView } from './components/ManualView';
import { FocusWidget } from './components/FocusWidget';
import { loadUserProgress, saveUserProgress } from './lib/storage';
import { UserProgress } from './types';
import { CHAPTERS_DATA } from './data/chaptersData';

// Aula Virtual DGREC — módulo de aprendizaje integrado en Worka (solo admin).
// Portado del proyecto original de Google AI Studio; el tutor IA usa Claude.
export default function ELearnApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [tutorContext, setTutorContext] = useState<string>('');

  const totalLessonsCount = CHAPTERS_DATA.reduce(
    (acc, chap) => acc + chap.lessons.length,
    0
  );
  const completedCount = progress.completedLessons.length;
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  const handleToggleLessonComplete = (lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(lessonId);
      const updated = exists
        ? prev.completedLessons.filter((id) => id !== lessonId)
        : [...prev.completedLessons, lessonId];
      return { ...prev, completedLessons: updated };
    });
  };

  const handleMarkFlashcardMastered = (cardId: string) => {
    setProgress((prev) => {
      if (prev.masteredFlashcards.includes(cardId)) return prev;
      return { ...prev, masteredFlashcards: [...prev.masteredFlashcards, cardId] };
    });
  };

  const handleSaveQuizScore = (blockId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: { ...prev.quizScores, [blockId]: score },
    }));
  };

  const handleAddErrorToLog = (questionId: string, userNote: string) => {
    setProgress((prev) => {
      if (prev.errorLog.some((e) => e.questionId === questionId)) return prev;
      return {
        ...prev,
        errorLog: [
          ...prev.errorLog,
          { questionId, userNote, date: new Date().toISOString() },
        ],
      };
    });
  };

  const handleToggleStudyDayComplete = (dayNumber: number) => {
    setProgress((prev) => {
      const exists = prev.completedStudyDays.includes(dayNumber);
      const updated = exists
        ? prev.completedStudyDays.filter((d) => d !== dayNumber)
        : [...prev.completedStudyDays, dayNumber];
      return { ...prev, completedStudyDays: updated };
    });
  };

  const handleOpenAiTutorWithContext = (context: string) => {
    setTutorContext(context);
    setActiveTab('feynman');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#e4e4e7] font-sans flex flex-col antialiased selection:bg-[#d4af37] selection:text-black">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progressPercent={progressPercent}
        completedLessonsCount={completedCount}
        totalLessonsCount={totalLessonsCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            progress={progress}
            setActiveTab={setActiveTab}
            totalLessonsCount={totalLessonsCount}
          />
        )}
        {activeTab === 'manual' && <ManualView />}
        {activeTab === 'lessons' && (
          <LessonsView
            progress={progress}
            onToggleLessonComplete={handleToggleLessonComplete}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
          />
        )}
        {activeTab === 'harddata' && <HardDataView />}
        {activeTab === 'flashcards' && (
          <FlashcardsView
            progress={progress}
            onMarkFlashcardMastered={handleMarkFlashcardMastered}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizSimulatorView
            progress={progress}
            onSaveQuizScore={handleSaveQuizScore}
            onAddErrorToLog={handleAddErrorToLog}
          />
        )}
        {activeTab === 'guarani' && <GuaraniLabView />}
        {activeTab === 'ofimatica' && <OfimaticaView />}
        {activeTab === 'feynman' && <FeynmanTutorView initialContext={tutorContext} />}
        {activeTab === 'plan' && (
          <StudyPlanView
            progress={progress}
            onToggleStudyDayComplete={handleToggleStudyDayComplete}
          />
        )}
      </main>

      <footer className="border-t border-[#27272a] bg-[#0e0e11] text-[#71717a] py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="text-[#a1a1aa]">
            Plataforma de Estudio para el Concurso Público MJRC-CPIEP-08-2026 • Dirección
            General del Registro del Estado Civil • Ministerio de Justicia, República del
            Paraguay
          </p>
        </div>
      </footer>

      <FocusWidget />
    </div>
  );
}
