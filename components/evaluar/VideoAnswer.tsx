"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, RotateCcw, Square, Upload, Video } from "lucide-react";

// Grabación de la respuesta en video, del lado del candidato.
//
// Tres decisiones que valen la pena explicar:
//
// 1. Se pide la cámara recién cuando la persona toca "Encender cámara", no al
//    abrir la pregunta. Un permiso que salta solo asusta, y el que lo rechaza
//    de puro reflejo ya no lo puede volver a dar sin entrar a la configuración
//    del navegador.
// 2. Se puede regrabar. La primera toma de alguien que nunca se grabó nunca es
//    la que lo representa, y una sola oportunidad mide nervios, no respuesta.
// 3. El tiempo se corta solo. Sin tope, la comparación entre candidatos deja
//    de ser justa y el que habla diez minutos parece más completo.

type Estado = "inicio" | "listo" | "grabando" | "grabado" | "subiendo" | "hecho";

export default function VideoAnswer({
  maxSeconds,
  onUpload,
  saved,
}: {
  maxSeconds: number;
  onUpload: (blob: Blob) => Promise<{ ok: boolean; error?: string }>;
  saved?: boolean;
}) {
  const [estado, setEstado] = useState<Estado>(saved ? "hecho" : "inicio");
  const [error, setError] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);

  // Soltar cámara y micrófono. Se llama al desmontar y al terminar: dejar la
  // luz de la cámara prendida después de responder es alarmante.
  const soltar = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      soltar();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [soltar]);

  async function encender() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
      setEstado("listo");
    } catch {
      setError(
        "No pudimos usar tu cámara. Revisá que le hayas dado permiso al navegador y que ninguna otra aplicación la esté usando."
      );
    }
  }

  function grabar() {
    const stream = streamRef.current;
    if (!stream) return;

    // webm es lo que graba Chrome y Firefox; Safari devuelve mp4. Se deja que
    // el navegador elija y se guarda el tipo que haya salido.
    const mime = MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      blobRef.current = blob;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = urlRef.current;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
      setEstado("grabado");
    };

    recorderRef.current = rec;
    rec.start();
    setSegundos(0);
    setEstado("grabando");
  }

  // Cronómetro y corte automático.
  useEffect(() => {
    if (estado !== "grabando") return;
    const t = setInterval(() => {
      setSegundos((s) => {
        if (s + 1 >= maxSeconds) {
          recorderRef.current?.stop();
          return maxSeconds;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [estado, maxSeconds]);

  function detener() {
    recorderRef.current?.stop();
  }

  async function regrabar() {
    blobRef.current = null;
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.controls = false;
    }
    setSegundos(0);
    await encender();
  }

  async function subir() {
    const blob = blobRef.current;
    if (!blob) return;
    setEstado("subiendo");
    setError(null);
    const r = await onUpload(blob);
    if (r.ok) {
      soltar();
      setEstado("hecho");
    } else {
      setError(r.error ?? "No pudimos subir el video.");
      setEstado("grabado");
    }
  }

  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (estado === "hecho") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="font-semibold text-emerald-900">Video enviado</p>
        <p className="text-sm text-emerald-800 mt-1">
          Tu respuesta quedó guardada. La empresa la va a ver junto al resto de
          tu evaluación.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <div className="relative bg-slate-900 aspect-video grid place-items-center">
        <video
          ref={videoRef}
          playsInline
          className={`w-full h-full object-cover ${estado === "inicio" ? "hidden" : ""}`}
        />

        {estado === "inicio" && (
          <div className="text-center px-6 py-8">
            <Video size={30} className="mx-auto text-slate-400" />
            <p className="text-sm text-slate-300 mt-3">
              Vas a grabarte respondiendo. Tenés hasta {mmss(maxSeconds)} y
              podés repetirlo las veces que quieras antes de enviarlo.
            </p>
          </div>
        )}

        {estado === "grabando" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
            <Circle size={9} className="fill-red-500 text-red-500 animate-beat" />
            <span className="text-xs font-medium text-white tabular-nums">
              {mmss(segundos)} / {mmss(maxSeconds)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 bg-white">
        {error && (
          <p className="text-sm text-danger bg-red-50 rounded-xl px-3.5 py-2.5 mb-3">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5 justify-center">
          {estado === "inicio" && (
            <button onClick={encender} className="btn-primary press">
              <Video size={16} /> Encender cámara
            </button>
          )}

          {estado === "listo" && (
            <button onClick={grabar} className="btn-primary press">
              <Circle size={14} className="fill-current" /> Empezar a grabar
            </button>
          )}

          {estado === "grabando" && (
            <button onClick={detener} className="btn-secondary press">
              <Square size={14} className="fill-current" /> Detener
            </button>
          )}

          {estado === "grabado" && (
            <>
              <button onClick={regrabar} className="btn-secondary press">
                <RotateCcw size={15} /> Grabar de nuevo
              </button>
              <button onClick={subir} className="btn-primary press">
                <Upload size={15} /> Enviar esta respuesta
              </button>
            </>
          )}

          {estado === "subiendo" && (
            <p className="text-sm text-slate-500 py-2">Subiendo tu video…</p>
          )}
        </div>

        {estado === "grabado" && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Mirate antes de enviar. Una vez enviado no se puede cambiar.
          </p>
        )}
      </div>
    </div>
  );
}
