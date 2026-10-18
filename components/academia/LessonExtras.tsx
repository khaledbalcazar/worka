"use client";

import { useState, useTransition } from "react";
import { Check, ClipboardList, Lightbulb, Play, Target, X as XIcon } from "lucide-react";
import type { FinalProject, LessonPractice, LessonVideo, QuizQuestion } from "@/lib/types";

// Piezas de las lecciones con el formato nuevo de la Academia (migración
// 051): video diferido, quiz con explicación y puntaje, práctica con
// checklist y proyecto final. Mismos tokens y estilos que el resto del
// visor de cursos.

/* ── Video de YouTube con carga diferida ──────────────────────────────── */

// Solo la miniatura hasta que la persona toca «play»: el iframe de YouTube
// pesa más de 1 MB y empeoraba la carga de la página del curso.
export function YouTubeLazy({ video }: { video: LessonVideo }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="my-5">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
        {playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Reproducir el video: ${video.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="w-16 h-16 rounded-full bg-black/70 text-white grid place-items-center group-hover:bg-red-600 transition-colors">
                <Play size={28} className="ml-1" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2.5 text-sm">
        <p className="font-semibold text-primary-dark">{video.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{video.channel}</p>
        <p className="text-gray-700 mt-1.5">{video.why}</p>
        <p className="text-[11px] text-gray-400 mt-1.5">Video externo de YouTube. Worka no es responsable de su contenido.</p>
      </figcaption>
    </figure>
  );
}

/* ── Quiz con explicación y puntaje ───────────────────────────────────── */

export function GradedQuiz({
  questions,
  best,
  onSubmit,
}: {
  questions: QuizQuestion[];
  // Mejor puntaje guardado (respuestas correctas), si ya lo hizo.
  best: number | null;
  onSubmit: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const total = questions.length;
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = (n: number) => Math.round((n / Math.max(total, 1)) * 100);

  return (
    <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-primary-dark flex items-center gap-2">📝 Ejercicio</h3>
        {best !== null && (
          <span className="chip bg-white text-primary-dark border border-gray-200">
            Tu mejor resultado: {best} de {total} ({pct(best)}%)
          </span>
        )}
      </div>
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium text-primary-dark text-[0.925rem] mb-2">
              {qi + 1}. {q.q}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = q.answer === oi;
                let cls = "border-gray-200 bg-white";
                if (checked && isCorrect) cls = "border-success bg-emerald-50 text-emerald-800";
                else if (checked && selected && !isCorrect) cls = "border-danger bg-red-50 text-danger";
                else if (selected) cls = "border-primary bg-primary/5";
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => !checked && setAnswers((a) => ({ ...a, [qi]: oi }))}
                    disabled={checked}
                    aria-pressed={selected}
                    className={`w-full text-left flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${cls}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current/30 flex items-center justify-center shrink-0 text-xs">
                      {checked && isCorrect ? <Check size={13} /> : checked && selected && !isCorrect ? <XIcon size={13} /> : String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {checked && q.explanation && (
              <p
                className={`mt-2 text-sm rounded-xl px-3.5 py-2.5 flex gap-2 ${
                  answers[qi] === q.answer ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                }`}
              >
                <Lightbulb size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong>{answers[qi] === q.answer ? "¡Correcto! " : "La correcta es la marcada en verde. "}</strong>
                  {q.explanation}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {checked ? (
          <p className={`text-sm font-medium ${pct(correct) >= 70 ? "text-emerald-700" : "text-amber-800"}`}>
            Acertaste {correct} de {total} ({pct(correct)}%).
            {pct(correct) < 70 && " Repasá la lectura y volvé a intentar: se guarda tu mejor resultado."}
          </p>
        ) : (
          <span className="text-xs text-gray-400">Elegí una opción en cada pregunta.</span>
        )}
        {checked ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setChecked(false);
              setAnswers({});
            }}
          >
            Volver a intentar
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={!allAnswered}
            onClick={() => {
              setChecked(true);
              onSubmit(correct);
            }}
          >
            Comprobar
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Checklist reutilizable ───────────────────────────────────────────── */

function Checklist({
  items,
  checked,
  onToggle,
  disabled,
}: {
  items: string[];
  checked: number[];
  onToggle: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const on = checked.includes(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              disabled={disabled}
              aria-pressed={on}
              className="w-full flex items-start gap-3 text-left text-sm text-gray-700"
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded border-2 grid place-items-center shrink-0 transition-colors ${
                  on ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"
                }`}
              >
                {on && <Check size={13} strokeWidth={3} />}
              </span>
              <span className={on ? "text-gray-500 line-through decoration-gray-300" : ""}>{it}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Práctica ─────────────────────────────────────────────────────────── */

export function PracticeBox({
  practice,
  initialText,
  initialChecks,
  onSave,
}: {
  practice: LessonPractice;
  initialText: string;
  initialChecks: number[];
  onSave: (text: string, checks: number[]) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [text, setText] = useState(initialText);
  const [checks, setChecks] = useState<number[]>(initialChecks);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const done = practice.checklist.length > 0 && checks.length === practice.checklist.length;

  function save(nextText = text, nextChecks = checks) {
    start(async () => {
      const r = await onSave(nextText, nextChecks);
      setSaved(r.ok ? "Guardado" : r.error ?? "No pudimos guardar.");
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
      <h3 className="font-bold text-primary-dark flex items-center gap-2">
        <ClipboardList size={18} className="text-amber-600" /> Práctica: {practice.title}
      </h3>
      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{practice.prompt}</p>

      {practice.type === "texto" && (
        <div className="mt-3">
          <textarea
            className="input min-h-36 bg-white"
            placeholder="Escribí acá tu respuesta. Solo la ves vos."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(null);
            }}
            onBlur={() => text !== initialText && save()}
          />
          <p className="text-[11px] text-gray-500 mt-1">Lo que escribís queda guardado en tu progreso y es privado.</p>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-5 mb-2.5">Autoevaluación</p>
      <Checklist
        items={practice.checklist}
        checked={checks}
        disabled={pending}
        onToggle={(i) => {
          const next = checks.includes(i) ? checks.filter((x) => x !== i) : [...checks, i];
          setChecks(next);
          save(text, next);
        }}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className={done ? "text-emerald-700 font-medium" : "text-gray-500"}>
          {done ? "✅ Práctica completa" : `${checks.length} de ${practice.checklist.length} ítems tildados`}
        </span>
        {pending ? <span className="text-xs text-gray-400">Guardando…</span> : saved && <span className="text-xs text-gray-500">{saved}</span>}
      </div>
    </div>
  );
}

/* ── Proyecto final ───────────────────────────────────────────────────── */

export function FinalProjectPanel({
  project,
  initialAnswer,
  initialChecks,
  onSave,
}: {
  project: FinalProject;
  initialAnswer: string;
  initialChecks: number[];
  onSave: (answer: string, checks: number[]) => Promise<{ ok: boolean; error?: string; done?: boolean }>;
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [checks, setChecks] = useState<number[]>(initialChecks);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const done = checks.length === project.checklist.length && project.checklist.length > 0;

  function save(nextAnswer = answer, nextChecks = checks) {
    start(async () => {
      const r = await onSave(nextAnswer, nextChecks);
      setMsg(r.ok ? "Guardado" : r.error ?? "No pudimos guardar.");
    });
  }

  return (
    <div className="card p-6 sm:p-8">
      <p className="text-xs text-gray-400 uppercase tracking-widest">Proyecto final</p>
      <h2 className="text-2xl font-extrabold text-primary-dark mt-1 mb-3 flex items-center gap-2">
        <Target size={22} className="text-primary" /> {project.title}
      </h2>
      <p className="text-gray-700 leading-relaxed">{project.prompt}</p>

      {project.suggested_questions.length > 0 && (
        <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
          <p className="font-semibold text-primary-dark text-sm mb-2">Preguntas sugeridas</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
            {project.suggested_questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      <label className="block mt-5">
        <span className="label">Notas de tu proyecto (opcional, privadas)</span>
        <textarea
          className="input min-h-28"
          placeholder="Anotá lo que hiciste, enlaces o lo que querés mejorar."
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setMsg(null);
          }}
          onBlur={() => answer !== initialAnswer && save()}
        />
      </label>

      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-6 mb-2.5">Checklist</p>
      <Checklist
        items={project.checklist}
        checked={checks}
        disabled={pending}
        onToggle={(i) => {
          const next = checks.includes(i) ? checks.filter((x) => x !== i) : [...checks, i];
          setChecks(next);
          save(answer, next);
        }}
      />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className={done ? "text-emerald-700 font-medium" : "text-gray-500"}>
          {done ? "✅ Proyecto final hecho" : `${checks.length} de ${project.checklist.length} ítems cumplidos`}
        </span>
        {pending ? <span className="text-xs text-gray-400">Guardando…</span> : msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>
    </div>
  );
}
