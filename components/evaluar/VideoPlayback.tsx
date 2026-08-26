"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getVideoUrl } from "@/app/evaluar/actions";

// Reproductor de una respuesta en video, del lado de la empresa.
//
// La URL se pide recién al tocar play y dura diez minutos. Cargarlas todas al
// abrir el informe dejaría media docena de enlaces directos a los videos de
// gente buscando trabajo en el HTML de una página que se imprime y se
// reenvía; así el enlace nace cuando alguien lo mira y se muere solo.
export default function VideoPlayback({
  participantId,
  questionId,
  text,
}: {
  participantId: string;
  questionId: string;
  text: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function abrir() {
    setCargando(true);
    setError(null);
    const r = await getVideoUrl(participantId, questionId);
    setCargando(false);
    if (r.ok && r.url) setUrl(r.url);
    else setError(r.error ?? "No pudimos abrir el video.");
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3.5">
      <p className="text-sm font-medium text-slate-700">{text}</p>

      {url ? (
        <video src={url} controls playsInline className="w-full rounded-lg mt-2.5" />
      ) : (
        <button
          onClick={abrir}
          disabled={cargando}
          className="btn-secondary press text-sm mt-2.5 print:hidden"
        >
          <Play size={14} /> {cargando ? "Abriendo…" : "Ver la respuesta"}
        </button>
      )}

      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {/* En papel no hay video que mostrar, así que se dice qué falta. */}
      <p className="hidden print:block text-xs text-slate-500 mt-1">
        Respuesta en video: se ve desde el informe en pantalla.
      </p>
    </div>
  );
}
