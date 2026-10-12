"use client";

import { useState, useTransition } from "react";
import { ArrowRight, MessageSquareText, RotateCcw, Star } from "lucide-react";
import { interviewFeedback, startInterview, type InterviewFeedback } from "@/app/plans-actions";

type Step = { question: string; answer: string; feedback: InterviewFeedback | null };

// Entrevista de práctica: 5 preguntas del puesto, una a la vez, con
// devolución de la IA después de cada respuesta.
export default function InterviewSimulator({ suggestions }: { suggestions: string[] }) {
  const [role, setRole] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const done = steps.length > 0 && steps.every((s) => s.feedback);
  const step = steps[current];

  function begin(r = role) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await startInterview({ role: r });
        if (!res.ok || !res.questions) return setError(res.error ?? "No pudimos armar la entrevista.");
        setRole(r);
        setSteps(res.questions.map((q) => ({ question: q, answer: "", feedback: null })));
        setCurrent(0);
        setDraft("");
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  function answer() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await interviewFeedback({ role, question: step.question, answer: draft });
        if (!res.ok || !res.feedback) return setError(res.error ?? "No pudimos evaluar tu respuesta.");
        setSteps((list) => list.map((s, i) => (i === current ? { ...s, answer: draft, feedback: res.feedback! } : s)));
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  if (steps.length === 0) {
    return (
      <section className="card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <MessageSquareText size={22} className="text-primary shrink-0" />
          <div>
            <h2 className="font-semibold text-lg">¿Para qué puesto te preparás?</h2>
            <p className="text-sm text-muted">Te hacemos 5 preguntas como en una entrevista real y te decimos cómo mejorar cada respuesta.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" value={role} maxLength={100} onChange={(e) => setRole(e.target.value)} placeholder="Ej: Cajera de supermercado" />
          <button type="button" className="btn-primary" disabled={pending || !role.trim()} onClick={() => begin()}>
            {pending ? "Preparando…" : "Empezar"} <ArrowRight size={16} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted self-center">De tus postulaciones:</span>
            {suggestions.map((s) => (
              <button key={s} type="button" className="cvb-suggestion" disabled={pending} onClick={() => begin(s)}>{s}</button>
            ))}
          </div>
        )}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </section>
    );
  }

  if (done) {
    const avg = steps.reduce((a, s) => a + (s.feedback?.rating ?? 0), 0) / steps.length;
    return (
      <section className="card p-5 space-y-4">
        <h2 className="font-semibold text-lg">Terminaste la entrevista de {role}</h2>
        <p className="text-sm">Promedio: <strong>{avg.toFixed(1)} de 5</strong>. {avg >= 4 ? "¡Muy bien! Estás listo para la entrevista real." : "Repasá las sugerencias y volvé a practicar las que más te costaron."}</p>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="rounded-lg border border-line p-3 text-sm">
              <p className="font-semibold">{i + 1}. {s.question}</p>
              <p className="text-muted mt-1">{"★".repeat(s.feedback!.rating)}{"☆".repeat(5 - s.feedback!.rating)} · {s.feedback!.improve}</p>
            </li>
          ))}
        </ol>
        <button type="button" className="btn-secondary" onClick={() => setSteps([])}><RotateCcw size={15} /> Practicar otra</button>
      </section>
    );
  }

  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{role}</span>
        <span>Pregunta {current + 1} de {steps.length}</span>
      </div>
      <div className="plan-meter !mt-0"><span style={{ width: `${((current + (step.feedback ? 1 : 0)) / steps.length) * 100}%` }} /></div>
      <h2 className="text-lg font-semibold">{step.question}</h2>
      {!step.feedback ? (
        <>
          <textarea className="input min-h-32" value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} placeholder="Respondé como lo harías en la entrevista." />
          <p className="text-xs text-muted">Tip: contá una situación concreta, qué hiciste y qué resultado tuvo.</p>
          <button type="button" className="btn-primary" disabled={pending || draft.trim().length < 10} onClick={answer}>
            {pending ? "Evaluando…" : "Enviar respuesta"}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="flex items-center gap-1 text-amber-500" aria-label={`${step.feedback.rating} de 5`}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill={i < step.feedback!.rating ? "currentColor" : "none"} />)}
          </p>
          <p className="text-sm"><strong>Bien:</strong> {step.feedback.good}</p>
          <p className="text-sm"><strong>Para mejorar:</strong> {step.feedback.improve}</p>
          <div className="rounded-lg bg-[#f6f8fa] p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Una respuesta más fuerte</p>
            <p className="mt-1 whitespace-pre-line">{step.feedback.betterAnswer}</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setCurrent((c) => Math.min(c + 1, steps.length - 1));
              setDraft("");
            }}
          >
            {current + 1 < steps.length ? "Siguiente pregunta" : "Ver resumen"} <ArrowRight size={16} />
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </section>
  );
}
