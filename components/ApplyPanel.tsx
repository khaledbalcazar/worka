"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { JobWithCompany } from "@/lib/types";
import { whatsappShareUrl } from "@/lib/format";
import { applyToJob } from "@/app/actions";

// Postulación con 1 clic + preguntas de filtro de la vacante.
export default function ApplyPanel({
  job,
  alreadyApplied = false,
}: {
  job: JobWithCompany;
  alreadyApplied?: boolean;
}) {
  const [step, setStep] = useState<"idle" | "questions" | "done">(
    alreadyApplied ? "done" : "idle"
  );
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasQuestions = job.filter_questions.length > 0;
  const allAnswered = job.filter_questions.every(
    (q) => answers[q.id] !== undefined
  );

  function submit() {
    setError(null);
    startTransition(async () => {
      const payload = job.filter_questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] ?? false,
      }));
      const result = await applyToJob(job.id, payload);
      if (result.ok) setStep("done");
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  function startApply() {
    if (hasQuestions) setStep("questions");
    else submit();
  }

  return (
    <div className="card p-5 space-y-3">
      {step === "idle" && (
        <>
          <div className="text-center pb-1">
            <p className="font-semibold text-primary-dark">
              ¿Te interesa este puesto?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {job.filter_questions.length > 0
                ? `Solo ${job.filter_questions.length} pregunta${job.filter_questions.length > 1 ? "s" : ""} rápida${job.filter_questions.length > 1 ? "s" : ""} y listo.`
                : "Un clic y tu perfil llega a la empresa."}
            </p>
          </div>
          <button
            className="btn-primary w-full text-base py-3"
            onClick={startApply}
            disabled={pending}
          >
            {pending ? "Enviando…" : "Postularme ahora"}
          </button>
          <a
            href={whatsappShareUrl(job.title, job.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full"
          >
            💬 Compartir por WhatsApp
          </a>
          <p className="text-[11px] text-gray-400 text-center">
            {job.company.fast_responder
              ? "⚡ Esta empresa suele responder en menos de 72 h."
              : "Te avisamos por WhatsApp cuando revisen tu perfil."}
          </p>
        </>
      )}

      {step === "questions" && (
        <div className="space-y-3">
          <p className="font-semibold text-primary-dark text-sm">
            La empresa quiere saber:
          </p>
          {job.filter_questions.map((q) => (
            <div key={q.id}>
              <p className="text-sm text-gray-700 mb-1.5">{q.question}</p>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: val }))}
                    className={`flex-1 min-h-11 rounded-xl border text-sm font-medium ${
                      answers[q.id] === val
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {val ? "Sí" : "No"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn-primary w-full"
            disabled={!allAnswered || pending}
            onClick={submit}
          >
            {pending ? "Enviando…" : "Enviar postulación"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="py-3 animate-pop">
          <div className="text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-primary-dark">
              {alreadyApplied
                ? "Ya te postulaste a esta vacante"
                : "¡Postulación enviada!"}
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span> Tu perfil ya está en manos
              de {job.company.trade_name}.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span> Te avisamos por WhatsApp
              cuando lo revisen.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span> Mientras tanto, seguí
              postulándote: más postulaciones, más chances.
            </li>
          </ul>
          <Link href="/empleos" className="btn-primary w-full mt-4">
            Ver más vacantes
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-danger text-center">
          {error}{" "}
          {error.includes("sesión") || error.includes("Iniciá") ? (
            <Link href="/ingresar" className="underline font-medium">
              Ingresar
            </Link>
          ) : null}
        </p>
      )}
    </div>
  );
}
