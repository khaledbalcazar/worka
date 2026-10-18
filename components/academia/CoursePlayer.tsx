"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Check, ChevronLeft, Circle, Clock, ExternalLink, Info, Lightbulb, Target } from "lucide-react";
import type { CourseProgress, CourseWithLessons } from "@/lib/types";
import LessonContent from "@/components/academia/LessonContent";
import { FinalProjectPanel, GradedQuiz, PracticeBox, YouTubeLazy } from "@/components/academia/LessonExtras";
import { saveCourseProject, saveLessonPractice, saveQuizResult } from "@/app/actions";

// Visor de los cursos con el formato nuevo (migración 051): lectura, «Para
// recordar», videos, quiz con puntaje, práctica y proyecto final. Mismo
// esqueleto que CourseViewer (barra lateral + lección) para que se vean
// iguales; los cursos viejos siguen usando CourseViewer sin cambios.

const PROJECT = "__proyecto";

type LessonState = { best: number | null; total: number; practiceDone: boolean; practiceText: string; practiceChecks: number[] };

export default function CoursePlayer({
  course,
  initialCompleted,
  progress,
  suggested,
}: {
  course: CourseWithLessons;
  initialCompleted: string[];
  progress: CourseProgress;
  suggested: { slug: string; title: string } | null;
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [lessons, setLessons] = useState<Record<string, LessonState>>(() =>
    Object.fromEntries(
      course.lessons.map((l) => {
        const p = progress.lessons[l.id];
        return [
          l.id,
          {
            best: p?.quiz_score ?? null,
            total: l.quiz.length,
            practiceDone: !!p?.practice_done,
            practiceText: p?.practice_text ?? "",
            practiceChecks: p?.practice_checks ?? [],
          },
        ];
      })
    )
  );
  const [projectDone, setProjectDone] = useState(!!progress.project?.done);
  const [activeId, setActiveId] = useState(course.lessons[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const total = course.lessons.length;
  const doneCount = course.lessons.filter((l) => completed.has(l.id)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  // Promedio de ejercicios: una lección sin hacer cuenta como 0 (igual que
  // la regla de la base para el certificado).
  const avg = useMemo(() => {
    const withQuiz = course.lessons.filter((l) => l.quiz.length > 0);
    if (withQuiz.length === 0) return 100;
    const sum = withQuiz.reduce((s, l) => s + (lessons[l.id]?.best ?? 0) / l.quiz.length, 0);
    return Math.round((sum / withQuiz.length) * 100);
  }, [course.lessons, lessons]);

  const minQuiz = course.cert_min_quiz ?? null;
  const needsProject = !!course.cert_requires_project && !!course.final_project;
  const certReady = doneCount === total && total > 0 && (minQuiz === null || avg >= minQuiz) && (!needsProject || projectDone);

  const active = course.lessons.find((l) => l.id === activeId) ?? null;
  const index = course.lessons.findIndex((l) => l.id === activeId);
  const next = index >= 0 ? course.lessons[index + 1] : undefined;

  // Una lección está completa con el quiz hecho y la práctica tildada.
  function localComplete(lessonId: string, s: LessonState) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson) return false;
    return (lesson.quiz.length === 0 || s.best !== null) && (!lesson.practice?.checklist.length || s.practiceDone);
  }

  function markIfDone(lessonId: string, s: LessonState, serverSays?: boolean) {
    if (serverSays ?? localComplete(lessonId, s)) setCompleted((prev) => new Set(prev).add(lessonId));
  }

  function go(id: string) {
    setActiveId(id);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const reviewNote = (active?.review_before || course.review_before) && (
    <p className="mb-4 flex gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-sm text-amber-900">
      <Info size={16} className="shrink-0 mt-0.5" />
      Datos vigentes a octubre de 2026. Verificá siempre en{" "}
      <a href="https://www.mtess.gov.py" target="_blank" rel="noopener" className="underline font-medium">mtess.gov.py</a> e{" "}
      <a href="https://www.ips.gov.py" target="_blank" rel="noopener" className="underline font-medium">ips.gov.py</a>.
    </p>
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Barra lateral */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Link href="/academia" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-3">
          <ChevronLeft size={16} /> Academia
        </Link>
        <h1 className="text-xl font-extrabold text-primary-dark leading-tight">{course.title}</h1>
        <p className="text-xs text-gray-500 mt-1">
          {course.level}
          {course.duration_label && ` · ${course.duration_label}`} · {total} lecciones
        </p>

        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {doneCount} de {total} lecciones
            </span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>

          {/* Requisitos del certificado */}
          <ul className="mt-3 space-y-1 text-xs">
            <li className={doneCount === total ? "text-emerald-700" : "text-gray-500"}>
              {doneCount === total ? "✓" : "○"} Todas las lecciones completas
            </li>
            {minQuiz !== null && (
              <li className={avg >= minQuiz ? "text-emerald-700" : "text-gray-500"}>
                {avg >= minQuiz ? "✓" : "○"} Promedio de ejercicios: {avg}% (mínimo {minQuiz}%)
              </li>
            )}
            {needsProject && (
              <li className={projectDone ? "text-emerald-700" : "text-gray-500"}>{projectDone ? "✓" : "○"} Proyecto final hecho</li>
            )}
          </ul>

          {certReady && (
            <>
              <Link
                href={`/academia/${course.slug}/certificado`}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-2.5 text-sm hover:from-amber-500 hover:to-amber-600 transition-colors"
              >
                <Award size={16} /> Ver mi certificado
              </Link>
              <Link href="/perfil#cursos" className="mt-2 block text-center text-xs text-primary font-medium py-1.5">
                Tu insignia ya se muestra en tu perfil →
              </Link>
            </>
          )}
        </div>

        <div className="card divide-y divide-gray-100 overflow-hidden">
          <div className="py-2">
            <p className="px-4 py-1.5 text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Lecciones</p>
            {course.lessons.map((l, i) => {
              const isDone = completed.has(l.id);
              const isActive = l.id === activeId;
              return (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                    isActive ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-surface"
                  }`}
                >
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                      <Check size={13} />
                    </span>
                  ) : (
                    <Circle size={20} className="text-gray-300 shrink-0" />
                  )}
                  <span className="flex-1 leading-snug">
                    {i + 1}. {l.title}
                  </span>
                  <span className="text-[0.65rem] text-gray-400 shrink-0">{l.duration_min}′</span>
                </button>
              );
            })}
          </div>
          {course.final_project && (
            <div className="py-2">
              <button
                onClick={() => go(PROJECT)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                  activeId === PROJECT ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-surface"
                }`}
              >
                {projectDone ? (
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                    <Check size={13} />
                  </span>
                ) : (
                  <Target size={20} className="text-gray-300 shrink-0" />
                )}
                <span className="flex-1 leading-snug">Proyecto final: {course.final_project.title}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido */}
      <div className="min-w-0">
        {error && <p className="mb-4 text-sm text-danger bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        {activeId === PROJECT && course.final_project ? (
          <FinalProjectPanel
            project={course.final_project}
            initialAnswer={progress.project?.answer ?? ""}
            initialChecks={progress.project?.checks ?? []}
            onSave={async (answer, checks) => {
              const r = await saveCourseProject(course.id, answer, checks);
              if (!r.ok) setError(r.error ?? null);
              const done = r.demo ? checks.length === course.final_project!.checklist.length : !!r.done;
              setProjectDone(done);
              return r;
            }}
          />
        ) : active ? (
          <div className="card p-6 sm:p-8">
            {course.legal_notice && (
              <p className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">{course.legal_notice}</p>
            )}
            {reviewNote}
            {index === 0 && suggested && (
              <p className="mb-4 text-sm text-gray-600">
                Te recomendamos hacer antes:{" "}
                <Link href={`/academia/${suggested.slug}`} className="text-primary font-semibold underline underline-offset-2">
                  {suggested.title}
                </Link>
              </p>
            )}

            <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              Lección {index + 1} de {total} · <Clock size={12} /> {active.duration_min} min
            </p>
            <h2 className="text-2xl font-extrabold text-primary-dark mt-1 mb-4">{active.title}</h2>

            <LessonContent content={active.content} />

            {active.resources && active.resources.length > 0 && (
              <div className="mt-5">
                <p className="font-semibold text-primary-dark text-sm mb-1.5">Enlaces útiles</p>
                <ul className="space-y-1">
                  {active.resources.map((r) => (
                    <li key={r.url + r.title}>
                      <a href={r.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium underline underline-offset-2">
                        {r.title} <ExternalLink size={13} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {active.key_points && active.key_points.length > 0 && (
              <div className="mt-6 rounded-2xl bg-primary/[0.05] border border-primary/15 p-5">
                <p className="font-bold text-primary-dark flex items-center gap-2 mb-2">
                  <Lightbulb size={18} className="text-primary" /> Para recordar
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {active.key_points.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            )}

            {active.videos?.map((v) => <YouTubeLazy key={v.youtube_id} video={v} />)}

            {active.quiz.length > 0 && (
              <GradedQuiz
                key={`quiz-${active.id}`}
                questions={active.quiz}
                best={lessons[active.id]?.best ?? null}
                onSubmit={async (score) => {
                  const prev = lessons[active.id];
                  const nextState = { ...prev, best: Math.max(score, prev.best ?? 0) };
                  setLessons((s) => ({ ...s, [active.id]: nextState }));
                  const r = await saveQuizResult(active.id, score);
                  if (!r.ok) return setError(r.error ?? null);
                  markIfDone(active.id, nextState, r.demo ? undefined : r.completed);
                }}
              />
            )}

            {active.practice && (
              <PracticeBox
                key={`practice-${active.id}`}
                practice={active.practice}
                initialText={lessons[active.id]?.practiceText ?? ""}
                initialChecks={lessons[active.id]?.practiceChecks ?? []}
                onSave={async (text, checks) => {
                  const done = checks.length === active.practice!.checklist.length;
                  const nextState = { ...lessons[active.id], practiceDone: done, practiceText: text, practiceChecks: checks };
                  setLessons((s) => ({ ...s, [active.id]: nextState }));
                  const r = await saveLessonPractice(active.id, text, checks);
                  if (!r.ok) setError(r.error ?? null);
                  else markIfDone(active.id, nextState, r.demo ? undefined : r.completed);
                  return r;
                }}
              />
            )}

            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                {completed.has(active.id) ? "✅ Lección completa" : "Hacé el ejercicio y la práctica para completar la lección"}
              </span>
              {next ? (
                <button onClick={() => go(next.id)} className="btn-primary">
                  Siguiente lección →
                </button>
              ) : course.final_project ? (
                <button onClick={() => go(PROJECT)} className="btn-primary">
                  Ir al proyecto final →
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center text-gray-400">Este curso todavía no tiene lecciones.</div>
        )}
      </div>
    </div>
  );
}
