"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { joinProcessFromJob } from "@/app/evaluar/actions";

// El diferencial de Worka Evaluar, visto desde el lado del candidato: la
// vacante tiene evaluación y se arranca acá mismo, en el momento en que la
// persona está interesada. Sin otra cuenta, sin esperar un correo.
export default function JobEvaluationCta({
  processId,
  stageCount,
  loggedIn,
  jobId,
  alreadyStarted,
}: {
  processId: string;
  stageCount: number;
  loggedIn: boolean;
  jobId: string;
  alreadyStarted?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const backHere = `next=${encodeURIComponent(`/empleo/${jobId}`)}`;

  function empezar() {
    setError(null);
    startTransition(async () => {
      const result = await joinProcessFromJob(processId);
      if (result.ok && result.token) router.push(`/evaluar/e/${result.token}`);
      else setError(result.error ?? "No pudimos abrir tu evaluación.");
    });
  }

  return (
    <div className="card p-4 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 rounded-2xl bg-white text-primary grid place-items-center">
          <ClipboardCheck size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-primary-dark text-sm">
            Esta empresa evalúa online
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {stageCount === 1
              ? "Una etapa corta"
              : `${stageCount} etapas cortas`}{" "}
            y quedás en carrera. Vas viendo tu avance en todo momento.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-danger mt-3">{error}</p>}

      {alreadyStarted ? (
        <Link
          href={`/evaluar/e/${alreadyStarted}`}
          className="btn-primary press w-full mt-3"
        >
          Seguir mi evaluación
        </Link>
      ) : loggedIn ? (
        <button
          onClick={empezar}
          disabled={pending}
          className="btn-primary press w-full mt-3"
        >
          {pending ? "Abriendo…" : "Empezar la evaluación"}
        </button>
      ) : (
        <Link
          href={`/ingresar?modo=registro&${backHere}`}
          className="btn-primary press w-full mt-3"
        >
          Crear cuenta y empezar
        </Link>
      )}
    </div>
  );
}
