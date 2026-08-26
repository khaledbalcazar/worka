"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { getParticipantCvUrl } from "@/app/evaluar/actions";

// Enlace al CV que el candidato adjuntó durante la evaluación.
//
// La URL se firma recién al tocarlo y dura diez minutos, igual que el video:
// el informe se imprime y se reenvía, y un enlace permanente al CV de alguien
// buscando trabajo no puede viajar dentro de un PDF.
export default function CvLink({
  participantId,
  compact,
}: {
  participantId: string;
  /** Versión chica, para las filas de la lista de candidatos. */
  compact?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function abrir() {
    setCargando(true);
    setError(null);
    const r = await getParticipantCvUrl(participantId);
    setCargando(false);
    if (r.ok && r.url) window.open(r.url, "_blank", "noopener,noreferrer");
    else setError(r.error ?? "No pudimos abrir el CV.");
  }

  return (
    <>
      <button
        onClick={abrir}
        disabled={cargando}
        className={
          compact
            ? "chip press bg-slate-100 text-slate-600"
            : "btn-secondary press text-sm print:hidden"
        }
      >
        <FileText size={compact ? 12 : 14} />
        {cargando ? "Abriendo…" : compact ? "CV" : "Ver el CV adjunto"}
      </button>
      {error && <span className="text-xs text-danger ml-2">{error}</span>}
    </>
  );
}
