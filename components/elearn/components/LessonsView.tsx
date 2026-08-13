import React, { useMemo, useState } from 'react';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { Chapter, Lesson, UserProgress } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Search,
  Sparkles,
  AlertCircle,
  Bookmark,
  ScrollText,
  ListChecks,
  XCircle,
  ArrowLeft,
  Megaphone,
  GraduationCap
} from 'lucide-react';

// Paleta de "cursos" al estilo Canvas: un color sólido por curso, cíclico.
const COURSE_COLORS = [
  '#2f7d4f', '#4a2f5c', '#1f3a4d', '#b3651f', '#6b3fa0',
  '#1f5c4a', '#5c2f4a', '#2f4d7a', '#5c4a2f', '#1f5c5c',
  '#7a2f2f', '#3d5c1f', '#4a1f5c'
];

function courseColor(index: number): string {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

function courseProgress(chapter: Chapter, progress: UserProgress): { done: number; total: number } {
  const total = chapter.lessons.length;
  const done = chapter.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  return { done, total };
}

// ── Ejercicios de autoevaluación al pie de cada unidad ──
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

// ── Una unidad = una lección, con sus 3 niveles + trucos + desarrollo + ejercicios ──
const UnitSection: React.FC<{
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onAskTutor: (context: string) => void;
  color: string;
}> = ({ lesson, index, isCompleted, onToggleComplete, onAskTutor, color }) => (
  <section id={lesson.id} className="scroll-mt-24 bg-[#121216] border border-[#27272a] rounded-xl p-5 sm:p-6 space-y-5">
    <div className="border-b border-[#27272a] pb-4 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border"
          style={{ color, backgroundColor: `${color}22`, borderColor: `${color}55` }}
        >
          Unidad {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleComplete(lesson.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#3f3f46]'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-[#a1a1aa]" />}
            <span>{isCompleted ? 'Completada' : 'Marcar completada'}</span>
          </button>
          <button
            onClick={() =>
              onAskTutor(`Lección: ${lesson.title}. Ref: ${lesson.keyArticle || ''}. Resumen: ${lesson.summary}`)
            }
            className="inline-flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preguntar al Tutor IA</span>
          </button>
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-serif font-bold text-white">{lesson.title}</h3>
      <p className="text-[#a1a1aa] text-xs sm:text-sm">{lesson.summary}</p>
    </div>

    <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-2">
      <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-widest">
        <Bookmark className="w-4 h-4" />
        <span>Nivel 1: En Palabras Simples</span>
      </div>
      <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed">{lesson.level1Simple}</p>
    </div>

    <div className="bg-[#0e0e11] border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-2">
      <div className="flex items-center justify-between gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Nivel 2: El Texto Legal y Datos a Memorizar</span>
        </div>
        {lesson.keyArticle && <span className="font-mono text-emerald-300 text-[11px]">{lesson.keyArticle}</span>}
      </div>
      <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed font-mono bg-[#121216] p-3 rounded-lg border border-[#27272a]">
        {lesson.level2Norm}
      </p>
    </div>

    <div className="bg-[#0e0e11] border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-2">
      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
        <AlertCircle className="w-4 h-4" />
        <span>Nivel 3: Ejemplo Práctico del Mostrador</span>
      </div>
      <p className="text-[#e4e4e7] text-sm sm:text-base leading-relaxed italic bg-[#121216] p-3 rounded-lg border border-[#27272a]">
        &ldquo;{lesson.level3DeskExample}&rdquo;
      </p>
    </div>

    {lesson.memoryTips && lesson.memoryTips.length > 0 && (
      <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Trucos de Memorización Fina
        </h4>
        <ul className="list-disc list-inside text-xs sm:text-sm text-[#e4e4e7] space-y-1">
          {lesson.memoryTips.map((tip, idx) => (
            <li key={idx} className="leading-snug">{tip}</li>
          ))}
        </ul>
      </div>
    )}

    {lesson.deepDive && lesson.deepDive.length > 0 && (
      <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-[#a78bfa] font-bold text-xs uppercase tracking-widest">
          <ScrollText className="w-4 h-4" />
          <span>Desarrollo Extendido</span>
        </div>
        <div className="space-y-3">
          {lesson.deepDive.map((para, idx) => (
            <p key={idx} className="text-[#d4d4d8] text-sm leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
    )}

    <LessonExercises lesson={lesson} />
  </section>
);

// ── Página de detalle de un curso: todas sus unidades en una sola vista ──
const CourseDetail: React.FC<{
  chapter: Chapter;
  index: number;
  progress: UserProgress;
  onBack: () => void;
  onToggleComplete: (id: string) => void;
  onAskTutor: (context: string) => void;
}> = ({ chapter, index, progress, onBack, onToggleComplete, onAskTutor }) => {
  const color = courseColor(index);
  const { done, total } = courseProgress(chapter, progress);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-5 pb-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#d4af37] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a Cursos
      </button>

      {/* Banner del curso */}
      <div className="rounded-xl overflow-hidden border border-[#27272a]">
        <div className="h-24 sm:h-28 flex items-end p-4" style={{ backgroundColor: color }}>
          <GraduationCap className="w-8 h-8 text-white/40" />
        </div>
        <div className="bg-[#121216] p-4 sm:p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color }}>
            {chapter.partNumber}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">{chapter.title}</h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa]">{chapter.description}</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden max-w-xs">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-semibold text-[#d4d4d8]">{done}/{total} unidades · {pct}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mini índice sticky */}
        <nav className="lg:col-span-3 bg-[#121216] border border-[#27272a] rounded-xl p-3 h-fit lg:sticky lg:top-24 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] px-2 pb-1">Unidades</p>
          {chapter.lessons.map((l, i) => {
            const isDone = progress.completedLessons.includes(l.id);
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs text-[#a1a1aa] hover:bg-[#18181b] hover:text-white transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#71717a] shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{i + 1}. {l.title}</span>
              </a>
            );
          })}
        </nav>

        {/* Unidades unificadas */}
        <div className="lg:col-span-9 space-y-5">
          {chapter.lessons.map((lesson, i) => (
            <UnitSection
              key={lesson.id}
              lesson={lesson}
              index={i}
              isCompleted={progress.completedLessons.includes(lesson.id)}
              onToggleComplete={onToggleComplete}
              onAskTutor={onAskTutor}
              color={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Tarjeta de curso, estilo tablero de Canvas ──
const CourseCard: React.FC<{
  chapter: Chapter;
  index: number;
  progress: UserProgress;
  onOpen: () => void;
}> = ({ chapter, index, progress, onOpen }) => {
  const color = courseColor(index);
  const { done, total } = courseProgress(chapter, progress);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const exerciseCount = chapter.lessons.reduce((acc, l) => acc + (l.exercises?.length ?? 0), 0);
  const isPrep = chapter.partNumber === 'Preparación';

  return (
    <button
      onClick={onOpen}
      className="text-left bg-[#121216] border border-[#27272a] rounded-xl overflow-hidden hover:border-[#3f3f46] hover:shadow-lg transition-all group"
    >
      <div className="h-24 relative flex items-start justify-end p-2.5" style={{ backgroundColor: color }}>
        {exerciseCount > 0 && (
          <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <Megaphone className="w-2.5 h-2.5" />
            {exerciseCount}
          </span>
        )}
      </div>
      <div className="p-3.5 space-y-1.5">
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: isPrep ? '#a1a1aa' : color }}>
          {chapter.partNumber}
        </span>
        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-2">
          {chapter.title}
        </h3>
        <p className="text-[11px] text-[#71717a]">{total} unidad{total === 1 ? '' : 'es'}</p>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <span className="text-[10px] font-semibold text-[#a1a1aa]">{pct}%</span>
        </div>
      </div>
    </button>
  );
};

interface LessonsViewProps {
  progress: UserProgress;
  onToggleLessonComplete: (lessonId: string) => void;
  onOpenAiTutorWithContext: (context: string) => void;
}

// Vista principal: tablero tipo Canvas (grilla de cursos) que abre en el
// detalle unificado de cada curso al hacer clic — cada norma del temario
// oficial es un curso propio, con todas sus unidades en una sola página.
export const LessonsView: React.FC<LessonsViewProps> = ({
  progress,
  onToggleLessonComplete,
  onOpenAiTutorWithContext
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedIndex = CHAPTERS_DATA.findIndex((c) => c.id === selectedChapterId);
  const selectedChapter = selectedIndex >= 0 ? CHAPTERS_DATA[selectedIndex] : null;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CHAPTERS_DATA;
    return CHAPTERS_DATA.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.lessons.some((l) => l.title.toLowerCase().includes(q) || l.level1Simple.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (selectedChapter) {
    return (
      <CourseDetail
        chapter={selectedChapter}
        index={selectedIndex}
        progress={progress}
        onBack={() => setSelectedChapterId(null)}
        onToggleComplete={onToggleLessonComplete}
        onAskTutor={onOpenAiTutorWithContext}
      />
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-[#d4af37]" />
          Tablero de Cursos — Temario Oficial
        </h2>
        <p className="text-xs text-[#a1a1aa]">
          Cada normativa del concurso es un curso propio. Entrá a cualquiera para estudiar todas sus unidades, con
          ejercicios incluidos.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
        <input
          type="text"
          placeholder="Buscar curso, artículo o tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filtered.map((chapter) => {
          const idx = CHAPTERS_DATA.findIndex((c) => c.id === chapter.id);
          return (
            <CourseCard
              key={chapter.id}
              chapter={chapter}
              index={idx}
              progress={progress}
              onOpen={() => setSelectedChapterId(chapter.id)}
            />
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-[#71717a] py-8">Sin resultados para tu búsqueda.</p>
        )}
      </div>
    </div>
  );
};
