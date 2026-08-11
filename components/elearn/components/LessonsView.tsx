import React, { useState } from 'react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { Lesson, UserProgress } from '../types';
import { BookOpen, CheckCircle2, Circle, Search, Sparkles, AlertCircle, Bookmark, ChevronRight, ScrollText, ListChecks, XCircle } from 'lucide-react';

// Ejercicios de autoevaluación al pie de cada lección: elegir opción y ver
// al instante si es correcta, con la explicación.
const LessonExercises: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  if (!lesson.exercises || lesson.exercises.length === 0) return null;

  return (
    <div className="bg-[#0e0e11] border border-violet-500/30 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-widest">
        <ListChecks className="w-4 h-4" />
        <span>Ejercicios de Autoevaluación</span>
      </div>
      {lesson.exercises.map((ex, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined;
        return (
          <div key={qi} className="bg-[#121216] border border-[#27272a] rounded-lg p-3.5 space-y-2">
            <p className="text-sm text-[#e4e4e7] font-medium">{qi + 1}. {ex.question}</p>
            <div className="space-y-1.5">
              {ex.options.map((opt, oi) => {
                const isCorrect = oi === ex.correctIndex;
                const isChosen = chosen === oi;
                let cls = 'border-[#3f3f46] text-[#d4d4d8] hover:border-[#d4af37]/40';
                if (answered && isCorrect) cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
                else if (answered && isChosen && !isCorrect) cls = 'border-red-500/60 bg-red-500/10 text-red-300';
                return (
                  <button
                    key={oi}
                    onClick={() => !answered && setAnswers((p) => ({ ...p, [qi]: oi }))}
                    disabled={answered}
                    className={`w-full text-left text-xs sm:text-sm px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${cls}`}
                  >
                    {answered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    {answered && isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className="text-xs text-[#a1a1aa] bg-[#0e0e11] border border-[#27272a] rounded-lg p-2.5 leading-relaxed">
                {ex.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface LessonsViewProps {
  progress: UserProgress;
  onToggleLessonComplete: (lessonId: string) => void;
  onOpenAiTutorWithContext: (context: string) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  progress,
  onToggleLessonComplete,
  onOpenAiTutorWithContext
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(CHAPTERS_DATA[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(CHAPTERS_DATA[0].lessons[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentChapter = CHAPTERS_DATA.find((c) => c.id === selectedChapterId) || CHAPTERS_DATA[0];
  const currentLesson = currentChapter.lessons.find((l) => l.id === selectedLessonId) || currentChapter.lessons[0];

  // Search filtering
  const filteredChapters = CHAPTERS_DATA.map((ch) => ({
    ...ch,
    lessons: ch.lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.level1Simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.level2Norm.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((ch) => ch.lessons.length > 0);

  const isCompleted = progress.completedLessons.includes(currentLesson.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Sidebar: Chapters & Lessons List */}
      <div className="lg:col-span-4 bg-[#121216] border border-[#27272a] rounded-xl p-4 space-y-4 h-fit shadow-md">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#d4af37]" />
            Syllabus del Temario Oficial
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Selecciona un capítulo y lección para estudiar los 3 niveles.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Buscar artículo, tema o palabra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Chapters Accordion / List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 text-xs">
          {filteredChapters.map((chapter) => (
            <div key={chapter.id} className="border border-[#27272a] rounded-lg overflow-hidden bg-[#0e0e11]">
              <button
                onClick={() => {
                  setSelectedChapterId(chapter.id);
                  if (chapter.lessons.length > 0) {
                    setSelectedLessonId(chapter.lessons[0].id);
                  }
                }}
                className={`w-full text-left p-3 font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedChapterId === chapter.id
                    ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]'
                    : 'text-[#a1a1aa] hover:bg-[#18181b]'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#d4af37] block">
                    {chapter.partNumber}
                  </span>
                  <span className="text-white">{chapter.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedChapterId === chapter.id ? 'rotate-90 text-[#d4af37]' : 'text-[#71717a]'}`} />
              </button>

              {/* Lessons inside chapter */}
              {selectedChapterId === chapter.id && (
                <div className="bg-[#121216] divide-y divide-[#27272a] border-t border-[#27272a]">
                  {chapter.lessons.map((lesson) => {
                    const done = progress.completedLessons.includes(lesson.id);
                    const isSelected = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left p-2.5 flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#18181b] text-white font-medium border-l-2 border-[#d4af37]'
                            : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLessonComplete(lesson.id);
                          }}
                          className="mt-0.5 text-[#71717a] hover:text-[#d4af37] cursor-pointer"
                          title={done ? 'Marcar como no leído' : 'Marcar como leído'}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#71717a]" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className={done ? 'line-through text-[#71717a]' : ''}>{lesson.title}</div>
                          {lesson.keyArticle && (
                            <span className="text-[10px] text-[#d4af37]/80 font-mono mt-0.5 inline-block">
                              {lesson.keyArticle}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area: Current Lesson Viewer */}
      <div className="lg:col-span-8 space-y-6">
        {currentLesson ? (
          <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 space-y-6 shadow-xl">
            {/* Lesson Header */}
            <div className="border-b border-[#27272a] pb-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded border border-[#d4af37]/20">
                  {currentChapter.partNumber} • {currentChapter.title}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleLessonComplete(currentLesson.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#3f3f46]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-[#a1a1aa]" />}
                    <span>{isCompleted ? 'Lección Completada' : 'Marcar como Completada'}</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenAiTutorWithContext(
                        `Lección: ${currentLesson.title}. Ref: ${currentLesson.keyArticle || ''}. Resumen: ${currentLesson.summary}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preguntar al Tutor IA</span>
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentLesson.title}
              </h2>
              <p className="text-[#a1a1aa] text-xs sm:text-sm">
                {currentLesson.summary}
              </p>
            </div>

            {/* Level 1: En palabras simples */}
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-widest">
                <Bookmark className="w-4 h-4" />
                <span>Nivel 1: En Palabras Simples</span>
              </div>
              <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed">
                {currentLesson.level1Simple}
              </p>
            </div>

            {/* Level 2: El Texto Legal y Números a Memorizar */}
            <div className="bg-[#0e0e11] border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nivel 2: El Texto Legal y Datos a Memorizar</span>
                </div>
                {currentLesson.keyArticle && (
                  <span className="font-mono text-emerald-300 text-[11px]">
                    {currentLesson.keyArticle}
                  </span>
                )}
              </div>
              <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed font-mono bg-[#121216] p-3 rounded-lg border border-[#27272a]">
                {currentLesson.level2Norm}
              </p>
            </div>

            {/* Level 3: Ejemplo del Mostrador de Atención al Público */}
            <div className="bg-[#0e0e11] border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                <span>Nivel 3: Ejemplo Práctico del Mostrador</span>
              </div>
              <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed italic bg-[#121216] p-3 rounded-lg border border-[#27272a]">
                "{currentLesson.level3DeskExample}"
              </p>
            </div>

            {/* Memory Tips / Claves de Memorización */}
            {currentLesson.memoryTips && currentLesson.memoryTips.length > 0 && (
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trucos de Memorización Fina
                </h4>
                <ul className="list-disc list-inside text-xs sm:text-sm text-[#e4e4e7] space-y-1">
                  {currentLesson.memoryTips.map((tip, idx) => (
                    <li key={idx} className="leading-snug">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Desarrollo extendido: artículo por artículo, casos, excepciones */}
            {currentLesson.deepDive && currentLesson.deepDive.length > 0 && (
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#a78bfa] font-bold text-xs uppercase tracking-widest">
                  <ScrollText className="w-4 h-4" />
                  <span>Desarrollo Extendido</span>
                </div>
                <div className="space-y-3">
                  {currentLesson.deepDive.map((para, idx) => (
                    <p key={idx} className="text-[#d4d4d8] text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Ejercicios de autoevaluación */}
            <LessonExercises lesson={currentLesson} />
          </div>
        ) : (
          <div className="bg-[#121216] border border-[#27272a] rounded-xl p-12 text-center text-[#a1a1aa]">
            Selecciona una lección del menú lateral para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};
