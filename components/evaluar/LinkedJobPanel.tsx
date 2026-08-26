"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, Lock } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import type { MyParticipation } from "@/lib/evaluar";
import { applyToJob } from "@/app/actions";
import { joinProcessFromJob } from "@/app/evaluar/actions";
import { celebrate } from "@/lib/celebrate";

// Vacante con evaluación enlazada: un solo camino, en orden.
//
// Antes se mostraban dos paneles a la vez —postularse por un lado y la
// evaluación por otro— así que se podía mandar la postulación salteando los
// tests, que es justamente lo que la empresa quiere evitar al enlazar el
// proceso. Acá cada paso se habilita cuando termina el anterior.
type Paso = { n: number; titulo: string; detalle: string };

export default function LinkedJobPanel({
  job,
  alreadyApplied,
  loggedIn,
  processId,
  stageCount,
  participation,
}: {
  job: JobWithCompany;
  alreadyApplied: boolean;
  loggedIn: boolean;
  processId: string;
  stageCount: number;
  participation: MyParticipation | null;
}) {
  const router = useRouter();
  const [applied, setApplied] = useState(alreadyApplied);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [preguntando, setPreguntando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const evaluado =
    participation?.status === "completado" ||
    participation?.status === "finalista" ||
    participation?.status === "contratado";
  const descartado = participation?.status === "descartado";
  const evaluando = !!participation && !evaluado && !descartado;

  const backHere = `next=${encodeURIComponent(`/empleo/${job.id}`)}`;

  const pasos: Paso[] = [
    {
      n: 1,
      titulo: "Postulate",
      detalle: "Tu perfil llega a la empresa.",
    },
    {
      n: 2,
      titulo: "Hacé la evaluación",
      detalle: `${stageCount} ${stageCount === 1 ? "etapa corta" : "etapas cortas"}. Se guarda cada respuesta.`,
    },
    {
      n: 3,
      titulo: "La empresa revisa",
      detalle: "Compara tu resultado con el del resto.",
    },
    {
      n: 4,
      titulo: "Te responden",
      detalle: "Te avisamos por acá y por WhatsApp, pase lo que pase.",
    },
  ];

  // Paso actual: 1 sin postular, 2 postulado sin evaluar, 3 evaluado.
  const actual = !applied ? 1 : !evaluado ? 2 : 3;

  const hasQuestions = job.filter_questions.length > 0;
  const allAnswered = job.filter_questions.every(
    (q) => answers[q.id] !== undefined
  );

  function postular() {
    setError(null);
    startTransition(async () => {
      const payload = job.filter_questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] ?? false,
      }));
      const r = await applyToJob(job.id, payload);
      if (r.ok) {
        setApplied(true);
        setPreguntando(false);
        celebrate();
        router.refresh();
      } else setError(r.error ?? "Ocurrió un error.");
    });
  }

  function empezarEvaluacion() {
    setError(null);
    startTransition(async () => {
      const r = await joinProcessFromJob(processId);
      if (r.ok && r.token) router.push(`/evaluar/e/${r.token}`);
      else setError(r.error ?? "No pudimos abrir tu evaluación.");
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
        <span className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 text-primary grid place-items-center">
          <ClipboardCheck size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-primary-dark text-sm">
            Esta empresa evalúa online
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            El proceso tiene 4 pasos y vas viendo tu avance en todo momento.
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        {pasos.map((p) => {
          const hecho = p.n < actual || (p.n === 3 && evaluado);
          const activo = p.n === actual;
          return (
            <li key={p.n} className="flex items-start gap-3">
              <span
                className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-bold ${
                  hecho
                    ? "bg-success text-white"
                    : activo
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {hecho ? <Check size={14} /> : p.n}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm ${
                    activo
                      ? "font-semibold text-primary-dark"
                      : hecho
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
                >
                  {p.titulo}
                </p>
                <p className="text-xs text-gray-400">{p.detalle}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="text-sm text-danger mt-4">
          {error}{" "}
          {error.includes("Completá tu perfil") ? (
            <Link href={`/onboarding?${backHere}`} className="underline font-medium">
              Completar mi perfil
            </Link>
          ) : error.includes("sesión") || error.includes("Iniciá") ? (
            <Link href={`/ingresar?${backHere}`} className="underline font-medium">
              Ingresar
            </Link>
          ) : null}
        </p>
      )}

      <div className="mt-5">
        {/* Sin cuenta: el camino entero empieza por crearla. */}
        {!loggedIn ? (
          <>
            <Link
              href={`/ingresar?modo=registro&${backHere}`}
              className="btn-primary press w-full text-base py-3"
            >
              Crear cuenta y empezar
            </Link>
            <Link
              href={`/ingresar?${backHere}`}
              className="btn-secondary press w-full mt-2"
            >
              Ya tengo cuenta
            </Link>
          </>
        ) : descartado ? (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            Tu proceso se cerró en la evaluación. Gracias por tomarte el tiempo.
          </p>
        ) : evaluado ? (
          <>
            <p className="text-sm text-emerald-800 bg-emerald-50 rounded-xl px-4 py-3">
              🎉 Listo: te postulaste y completaste la evaluación. Ahora le toca
              a la empresa.
            </p>
            {participation && (
              <Link
                href={`/evaluar/e/${participation.token}`}
                className="btn-secondary press w-full mt-2"
              >
                Ver mi evaluación
              </Link>
            )}
          </>
        ) : !applied ? (
          preguntando && hasQuestions ? (
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
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [q.id]: val }))
                        }
                        className={`flex-1 min-h-11 rounded-xl border text-sm font-medium press ${
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
                onClick={postular}
                disabled={!allAnswered || pending}
                className="btn-primary press w-full disabled:opacity-40"
              >
                {pending ? "Enviando…" : "Enviar postulación"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => (hasQuestions ? setPreguntando(true) : postular())}
              disabled={pending}
              className="btn-primary press w-full text-base py-3"
            >
              {pending ? "Enviando…" : "Paso 1: postularme"}
            </button>
          )
        ) : (
          <>
            <button
              onClick={empezarEvaluacion}
              disabled={pending}
              className="btn-primary press w-full text-base py-3"
            >
              {pending
                ? "Abriendo…"
                : evaluando
                  ? "Seguir mi evaluación"
                  : "Paso 2: hacer la evaluación"}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Tu postulación ya está enviada. Sin la evaluación, la empresa no
              puede compararte con el resto.
            </p>
          </>
        )}
      </div>

      {/* El paso 2 bloqueado se muestra, no se esconde: así la persona sabe
          desde el principio que hay una evaluación y no la sorprende. */}
      {loggedIn && !applied && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-3">
          <Lock size={11} /> La evaluación se habilita apenas te postules.
        </p>
      )}
    </div>
  );
}
