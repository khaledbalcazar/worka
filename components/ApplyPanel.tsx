"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { JobWithCompany } from "@/lib/types";
import { whatsappShareUrl } from "@/lib/format";
import { applyToJob } from "@/app/actions";

// Postulación con 1 clic + preguntas de filtro de la vacante.
export default function ApplyPanel({
  job,
  alreadyApplied = false,
  loggedIn = true,
}: {
  job: JobWithCompany;
  alreadyApplied?: boolean;
  loggedIn?: boolean;
}) {
  const [step, setStep] = useState<"idle" | "questions" | "done">(
    alreadyApplied ? "done" : "idle"
  );
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Solo en celular: la hoja con el detalle de la postulación.
  const [sheetOpen, setSheetOpen] = useState(false);

  // Con la hoja abierta el fondo no debe correrse al arrastrar.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  // Mucha gente llega a la vacante desde Google, sin cuenta. Antes el botón
  // disparaba la postulación igual y devolvía un "Iniciá sesión" en letra
  // chica, con un link que además perdía la vacante. Ahora el camino se ofrece
  // de entrada y el destino viaja para volver acá después.
  const backHere = `next=${encodeURIComponent(`/empleo/${job.id}`)}`;

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

  const panel = (
    <div className="space-y-3">
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
          {loggedIn ? (
            <button
              className="btn-primary w-full text-base py-3"
              onClick={startApply}
              disabled={pending}
            >
              {pending ? "Enviando…" : "Postularme ahora"}
            </button>
          ) : (
            <>
              <Link
                href={`/ingresar?modo=registro&${backHere}`}
                className="btn-primary w-full text-base py-3"
              >
                Crear cuenta y postularme
              </Link>
              <Link
                href={`/ingresar?${backHere}`}
                className="btn-secondary w-full"
              >
                Ya tengo cuenta
              </Link>
              <p className="text-[11px] text-gray-400 text-center">
                Es gratis y te toma 2 minutos. Volvés a esta vacante apenas
                termines.
              </p>
            </>
          )}
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
          {/* Todo error que se pueda resolver necesita su salida a mano. */}
          {error.includes("Completá tu perfil") ? (
            <Link
              href={`/onboarding?${backHere}`}
              className="underline font-medium"
            >
              Completar mi perfil
            </Link>
          ) : error.includes("sesión") || error.includes("Iniciá") ? (
            <Link
              href={`/ingresar?${backHere}`}
              className="underline font-medium"
            >
              Ingresar
            </Link>
          ) : null}
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Escritorio: el panel vive en la columna derecha, como hasta ahora. */}
      <div className="hidden lg:block card p-5">{panel}</div>

      {/* Celular: la acción no puede estar al final de una página larga. La
          persona decide postularse mientras lee, así que el botón viaja con
          ella y el detalle se abre en una hoja, sin perder el lugar de lectura. */}
      <div className="lg:hidden">
        {sheetOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
        )}
        <div
          role="dialog"
          aria-label="Postularme"
          aria-hidden={!sheetOpen}
          className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-200 ease-out max-h-[85vh] overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
            sheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
          {panel}
        </div>

        {/* Va justo encima de la barra de navegación, no encima de ella. */}
        <div className="fixed inset-x-0 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary-dark truncate">
                {job.salary_range ?? job.title}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {job.company.trade_name} · {job.company.location_city}
              </p>
            </div>
            {step === "done" ? (
              <span className="btn-secondary text-sm shrink-0 pointer-events-none">
                ✓ Postulado
              </span>
            ) : (
              <button
                className="btn-primary text-sm shrink-0 px-5"
                onClick={() => setSheetOpen(true)}
              >
                {loggedIn ? "Postularme" : "Postularme gratis"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
