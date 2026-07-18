"use client";

import { useState, useTransition } from "react";
import type { Interview } from "@/lib/types";
import { respondInterview } from "@/app/actions";
import { formatDate } from "@/lib/format";

// Propuesta de entrevista dentro de la tarjeta de postulación.
export default function InterviewCard({ interview }: { interview: Interview }) {
  const [status, setStatus] = useState(interview.status);
  const [pending, startTransition] = useTransition();

  const when = new Date(interview.proposed_at);
  const time = when.toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function respond(accept: boolean) {
    setStatus(accept ? "confirmada" : "rechazada");
    startTransition(async () => {
      await respondInterview(interview.id, accept);
    });
  }

  return (
    <div
      className={`mt-3 rounded-xl px-4 py-3 ${
        status === "confirmada"
          ? "bg-emerald-50"
          : status === "rechazada"
            ? "bg-gray-100"
            : "bg-blue-50"
      }`}
    >
      <p className="text-sm font-semibold text-primary-dark">
        📅 {status === "propuesta" ? "Te proponen una entrevista" : "Entrevista"}
      </p>
      <p className="text-sm text-gray-700 mt-0.5">
        {formatDate(interview.proposed_at)} a las {time}
        {interview.location && ` · ${interview.location}`}
      </p>
      {status === "propuesta" ? (
        <div className="flex gap-2 mt-2">
          <button
            className="btn-primary flex-1 text-xs min-h-9"
            disabled={pending}
            onClick={() => respond(true)}
          >
            ✓ Confirmar asistencia
          </button>
          <button
            className="btn-secondary flex-1 text-xs min-h-9"
            disabled={pending}
            onClick={() => respond(false)}
          >
            No puedo
          </button>
        </div>
      ) : (
        <p
          className={`text-xs font-medium mt-1 ${
            status === "confirmada" ? "text-emerald-700" : "text-gray-500"
          }`}
        >
          {status === "confirmada"
            ? "✓ Confirmaste tu asistencia. ¡Éxitos! 🍀"
            : "Avisaste que no podés. La empresa puede proponer otra fecha."}
        </p>
      )}
    </div>
  );
}
