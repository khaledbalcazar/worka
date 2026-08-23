"use client";

import { useEffect, useRef } from "react";
import { incrementJobViews } from "@/app/actions";
import { rememberJob } from "@/lib/recent-jobs";

// Suma 1 vista al abrir el detalle, una sola vez por carga, y guarda la
// vacante en el historial local para el carrusel "Seguí donde estabas".
export default function JobViewTracker({
  jobId,
  title,
  company,
  external = false,
}: {
  jobId: string;
  title?: string;
  company?: string;
  external?: boolean;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    // El contador de vistas es solo de las vacantes de Worka; las externas
    // únicamente se recuerdan en el teléfono.
    if (!external) incrementJobViews(jobId);
    if (title && company) {
      rememberJob({ id: jobId, title, company, external });
    }
  }, [jobId, title, company, external]);
  return null;
}
