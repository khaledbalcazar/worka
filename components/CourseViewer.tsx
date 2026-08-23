"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Circle,
  PlayCircle,
  ChevronLeft,
  Award,
  X as XIcon,
} from "lucide-react";
import type { CourseWithLessons, Lesson } from "@/lib/types";
import BlogContent from "@/components/BlogContent";
import { toggleLessonComplete } from "@/app/actions";

// Visor de curso estilo Moodle: barra lateral con secciones y lecciones,
// contenido de la lección seleccionada y progreso.
export default function CourseViewer({
  course,
  initialCompleted,
}: {
  course: CourseWithLessons;
  initialCompleted: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  const [activeId, setActiveId] = useState(course.lessons[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  // Agrupa las lecciones por sección, respetando el orden.
  const sections = useMemo(() => {
    const map = new Map<string, typeof course.lessons>();
    for (const l of course.lessons) {
      const key = l.section || "Contenido";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return [...map.entries()];
  }, [course.lessons]);

  const active = course.lessons.find((l) => l.id === activeId);
  const total = course.lessons.length;
  const doneCount = completed.size;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const activeIndex = course.lessons.findIndex((l) => l.id === activeId);
  const next = course.lessons[activeIndex + 1];

  function toggle(lessonId: string, done: boolean) {
    setCompleted((prev) => {
      const s = new Set(prev);
      if (done) s.add(lessonId);
      else s.delete(lessonId);
      return s;
    });
    startTransition(() => {
      toggleLessonComplete(lessonId, course.id, done);
    });
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Barra lateral */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Link
          href="/academia"
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-3"
        >
          <ChevronLeft size={16} /> Academia
        </Link>
        <h1 className="text-xl font-extrabold text-primary-dark leading-tight">
          {course.title}
        </h1>

        {/* Progreso */}
        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {doneCount} de {total} lecciones
            </span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          {pct === 100 && total > 0 && (
            <Link
              href={`/academia/${course.slug}/certificado`}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-2.5 text-sm hover:from-amber-500 hover:to-amber-600 transition-colors"
            >
              <Award size={16} /> Ver mi certificado
            </Link>
          )}
        </div>

        <div className="card divide-y divide-gray-100 overflow-hidden">
          {sections.map(([section, lessons]) => (
            <div key={section} className="py-2">
              <p className="px-4 py-1.5 text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                {section}
              </p>
              {lessons.map((l) => {
                const isDone = completed.has(l.id);
                const isActive = l.id === activeId;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveId(l.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-gray-600 hover:bg-surface"
                    }`}
                  >
                    {isDone ? (
                      <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                        <Check size={13} />
                      </span>
                    ) : (
                      <Circle size={20} className="text-gray-300 shrink-0" />
                    )}
                    <span className="flex-1 leading-snug">{l.title}</span>
                    <span className="text-[0.65rem] text-gray-400 shrink-0">
                      {l.duration_min}′
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Contenido de la lección */}
      <div>
        {active ? (
          <div className="card p-6 sm:p-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              {active.section}
            </p>
            <h2 className="text-2xl font-extrabold text-primary-dark mt-1 mb-4">
              {active.title}
            </h2>

            {active.video_url && (
              <a
                href={active.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium mb-4"
              >
                <PlayCircle size={18} /> Ver el video de la lección
              </a>
            )}

            <BlogContent content={active.content} />

            {/* Ejercicio de la lección */}
            {active.quiz && active.quiz.length > 0 && (
              <Quiz
                key={active.id}
                lesson={active}
                onPass={() => {
                  if (!completed.has(active.id)) toggle(active.id, true);
                }}
              />
            )}

            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              {(!active.quiz || active.quiz.length === 0) && (
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={completed.has(active.id)}
                    onChange={(e) => toggle(active.id, e.target.checked)}
                    disabled={pending}
                    className="w-5 h-5 accent-primary"
                  />
                  Marcar como completada
                </label>
              )}
              {active.quiz && active.quiz.length > 0 && (
                <span className="text-sm text-gray-500">
                  {completed.has(active.id)
                    ? "✅ Lección aprobada"
                    : "Resolvé el ejercicio para completar la lección"}
                </span>
              )}
              {next && (
                <button
                  onClick={() => {
                    if (!completed.has(active.id)) toggle(active.id, true);
                    setActiveId(next.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn-primary"
                >
                  Siguiente lección →
                </button>
              )}
              {!next && doneCount === total && (
                <span className="chip bg-emerald-50 text-emerald-700">
                  🎉 ¡Curso completado!
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center text-gray-400">
            Este curso todavía no tiene lecciones.
          </div>
        )}
      </div>
    </div>
  );
}

// Ejercicio de opción múltiple. Al responder todo bien, marca la lección.
function Quiz({ lesson, onPass }: { lesson: Lesson; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const allAnswered = lesson.quiz.every((_, i) => answers[i] !== undefined);
  const correctCount = lesson.quiz.filter(
    (q, i) => answers[i] === q.answer
  ).length;
  const passed = correctCount === lesson.quiz.length;

  function check() {
    setChecked(true);
    if (passed) onPass();
  }

  return (
    <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.03] p-5">
      <h3 className="font-bold text-primary-dark mb-4 flex items-center gap-2">
        📝 Ejercicio
      </h3>
      <div className="space-y-5">
        {lesson.quiz.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium text-primary-dark text-[0.925rem] mb-2">
              {qi + 1}. {q.q}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = q.answer === oi;
                let cls = "border-gray-200 bg-white";
                if (checked && isCorrect)
                  cls = "border-success bg-emerald-50 text-emerald-800";
                else if (checked && selected && !isCorrect)
                  cls = "border-danger bg-red-50 text-danger";
                else if (selected) cls = "border-primary bg-primary/5";
                return (
                  <button
                    key={oi}
                    onClick={() => {
                      if (!checked)
                        setAnswers((a) => ({ ...a, [qi]: oi }));
                    }}
                    disabled={checked}
                    className={`w-full text-left flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${cls}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current/30 flex items-center justify-center shrink-0 text-xs">
                      {checked && isCorrect ? (
                        <Check size={13} />
                      ) : checked && selected && !isCorrect ? (
                        <XIcon size={13} />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {checked ? (
          <p
            className={`text-sm font-medium ${
              passed ? "text-emerald-700" : "text-danger"
            }`}
          >
            {passed
              ? "🎉 ¡Correcto! Lección aprobada."
              : `Acertaste ${correctCount} de ${lesson.quiz.length}. Repasá y volvé a intentar.`}
          </p>
        ) : (
          <span className="text-xs text-gray-400">
            Elegí una opción en cada pregunta.
          </span>
        )}
        {checked && !passed ? (
          <button
            className="btn-secondary"
            onClick={() => {
              setChecked(false);
              setAnswers({});
            }}
          >
            Reintentar
          </button>
        ) : !checked ? (
          <button
            className="btn-primary"
            disabled={!allAnswered}
            onClick={check}
          >
            Comprobar
          </button>
        ) : null}
      </div>
    </div>
  );
}
