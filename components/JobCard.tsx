"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { JobWithCompany } from "@/lib/types";
import { timeAgo, whatsappShareUrl } from "@/lib/format";
import { applyToJob, reportJob, toggleSaveJob } from "@/app/actions";
import {
  FastResponderBadge,
  FirstJobBadge,
  ModalityChip,
  UrgentBadge,
  VerifiedBadge,
} from "./Badges";

const REPORT_REASONS = [
  "Piden dinero o inversión inicial",
  "Parece una estafa",
  "Información falsa o engañosa",
  "Contenido discriminatorio",
  "Otro motivo",
];

export default function JobCard({
  job,
  alreadyApplied = false,
  initiallySaved = false,
}: {
  job: JobWithCompany;
  alreadyApplied?: boolean;
  initiallySaved?: boolean;
}) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [saved, setSaved] = useState(initiallySaved);
  const [menuOpen, setMenuOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allAnswered = job.filter_questions.every(
    (q) => answers[q.id] !== undefined
  );

  function submitApplication() {
    setError(null);
    startTransition(async () => {
      const payload = job.filter_questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] ?? false,
      }));
      const result = await applyToJob(job.id, payload);
      if (result.ok) {
        setApplied(true);
        setApplyDone(true);
      } else setError(result.error ?? "Ocurrió un error.");
    });
  }

  function handleReport(reason: string) {
    startTransition(async () => {
      const result = await reportJob(job.id, reason);
      if (result.ok) setReported(true);
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  return (
    <article className="card p-4 relative flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/empleo/${job.id}`} className="min-w-0 flex items-start gap-3">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">
            {job.company.trade_name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </span>
          <span className="min-w-0 block">
            <h3 className="font-semibold text-primary-dark leading-snug hover:text-primary">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {job.company.trade_name} · {job.company.location_city}
            </p>
          </span>
        </Link>
        <div className="relative shrink-0 flex items-start">
          <button
            aria-label={saved ? "Quitar de guardadas" : "Guardar vacante"}
            title={saved ? "Quitar de guardadas" : "Guardar para después"}
            onClick={() => {
              const next = !saved;
              setSaved(next);
              toggleSaveJob(job.id, next);
            }}
            className={`w-11 h-11 -mt-2 flex items-center justify-center rounded-full hover:bg-surface text-lg ${
              saved ? "text-amber-500" : "text-gray-300"
            }`}
          >
            {saved ? "★" : "☆"}
          </button>
          <button
            aria-label="Opciones de la vacante"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-full text-gray-400 hover:bg-surface"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-52 card p-1 shadow-lg">
              <a
                href={whatsappShareUrl(job.title, job.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-surface"
                onClick={() => setMenuOpen(false)}
              >
                💬 Compartir por WhatsApp
              </a>
              <button
                className="block w-full text-left px-3 py-2.5 text-sm text-danger rounded-lg hover:bg-red-50"
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
              >
                🚩 Denunciar esta vacante
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <ModalityChip modality={job.modality} />
        {!job.requires_experience && <FirstJobBadge />}
        {job.urgent && <UrgentBadge />}
        {job.company.is_verified && <VerifiedBadge />}
        {job.company.fast_responder && <FastResponderBadge />}
      </div>

      {job.salary_range && (
        <p className="text-sm font-semibold text-emerald-700 mt-3">
          💰 {job.salary_range}
        </p>
      )}

      {job.nearby_transit && (
        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
          <span aria-hidden>🚌</span>
          <span className="truncate">
            <span className="font-medium text-gray-700">Colectivos:</span>{" "}
            {job.nearby_transit}
          </span>
        </p>
      )}

      {error && !applyOpen && (
        <p className="text-xs text-danger mt-2">{error}</p>
      )}

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-50 mt-auto">
        <span className="text-xs text-gray-400">
          {timeAgo(job.created_at)}
          {job.vacancies_count > 1 && ` · ${job.vacancies_count} puestos`}
        </span>
        <button
          className={applied ? "btn-success" : "btn-primary"}
          onClick={() => !applied && setApplyOpen(true)}
          disabled={applied}
        >
          {applied ? "✓ Postulado" : "Postularme"}
        </button>
      </div>

      {/* Modal de postulación: resumen + preguntas de la empresa */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 animate-fade-up max-h-[85vh] overflow-y-auto">
            {applyDone ? (
              <div className="text-center py-6 animate-pop">
                <p className="text-5xl mb-3">🎉</p>
                <p className="font-bold text-primary-dark text-lg">
                  ¡Postulación enviada!
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  {job.company.trade_name} ya tiene tu perfil. Te avisamos por
                  WhatsApp apenas lo revisen.
                </p>
                <div className="flex gap-2 mt-5">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setApplyOpen(false)}
                  >
                    Seguir buscando
                  </button>
                  <Link href="/postulaciones" className="btn-primary flex-1">
                    Ver mis postulaciones
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">
                    {job.company.trade_name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div>
                    <h4 className="font-semibold text-primary-dark leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {job.company.trade_name}
                      {job.salary_range && ` · ${job.salary_range}`}
                    </p>
                  </div>
                </div>

                {job.filter_questions.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      {job.company.trade_name} quiere saber:
                    </p>
                    {job.filter_questions.map((q) => (
                      <div key={q.id}>
                        <p className="text-sm text-gray-700 mb-1.5">
                          {q.question}
                        </p>
                        <div className="flex gap-2">
                          {[true, false].map((val) => (
                            <button
                              key={String(val)}
                              onClick={() =>
                                setAnswers((a) => ({ ...a, [q.id]: val }))
                              }
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
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">
                    Tu perfil y tu CV se envían a la empresa con un clic. ¿Confirmás
                    la postulación?
                  </p>
                )}

                {error && (
                  <p className="text-sm text-danger mt-3">
                    {error}{" "}
                    {(error.includes("sesión") || error.includes("Iniciá")) && (
                      <Link href="/ingresar" className="underline font-medium">
                        Ingresar
                      </Link>
                    )}
                  </p>
                )}

                <div className="flex gap-2 mt-5">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setApplyOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary flex-1"
                    disabled={!allAnswered || pending}
                    onClick={submitApplication}
                  >
                    {pending ? "Enviando…" : "Enviar postulación"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de denuncia */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 animate-fade-up">
            {reported ? (
              <div className="text-center py-4 animate-pop">
                <p className="text-3xl mb-2">✅</p>
                <p className="font-semibold text-primary-dark">
                  Gracias por avisarnos
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Nuestro equipo va a revisar esta vacante.
                </p>
                <button
                  className="btn-primary w-full mt-4"
                  onClick={() => {
                    setReportOpen(false);
                    setReported(false);
                  }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h4 className="font-semibold text-primary-dark mb-1">
                  Denunciar vacante
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  ¿Qué problema encontraste con esta oferta?
                </p>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      disabled={pending}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm hover:border-danger hover:bg-red-50"
                      onClick={() => handleReport(reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button
                  className="btn-secondary w-full mt-3"
                  onClick={() => setReportOpen(false)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
