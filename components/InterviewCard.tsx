"use client";

import { useState, useTransition } from "react";
import type { Interview } from "@/lib/types";
import { respondInterview } from "@/app/actions";
import { formatDate } from "@/lib/format";

// Formato de fecha para Google Calendar: YYYYMMDDTHHMMSSZ (UTC).
function gcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Propuesta de entrevista dentro de la tarjeta de postulación.
export default function InterviewCard({
  interview,
  jobTitle = "Entrevista",
  companyName = "",
}: {
  interview: Interview;
  jobTitle?: string;
  companyName?: string;
}) {
  const [status, setStatus] = useState(interview.status);
  const [pending, startTransition] = useTransition();

  const when = new Date(interview.proposed_at);
  const time = when.toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Evento de 1 hora en Google Calendar (el origen abre con la cuenta del usuario).
  const end = new Date(when.getTime() + 60 * 60000);
  const calendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`Entrevista: ${jobTitle}${companyName ? ` — ${companyName}` : ""}`)}` +
    `&dates=${gcalDate(when)}/${gcalDate(end)}` +
    `&details=${encodeURIComponent("Entrevista coordinada por Worka. ¡Éxitos! 🍀")}` +
    `&location=${encodeURIComponent(interview.location ?? "")}`;

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `¡Tengo entrevista${companyName ? ` en ${companyName}` : ""}! 🎉 ${formatDate(interview.proposed_at)} a las ${time}${interview.location ? ` — ${interview.location}` : ""}. Conseguida por Worka: worka.click`
  )}`;

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

      {status !== "rechazada" && (
        <div className="flex gap-2 mt-2">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1 text-xs min-h-9"
          >
            🗓️ Agregar al calendario
          </a>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex-1 text-xs min-h-9"
          >
            💬 Compartir
          </a>
        </div>
      )}
    </div>
  );
}
