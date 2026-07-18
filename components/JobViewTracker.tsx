"use client";

import { useEffect, useRef } from "react";
import { incrementJobViews } from "@/app/actions";

// Suma 1 vista al abrir el detalle, una sola vez por carga.
export default function JobViewTracker({ jobId }: { jobId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    incrementJobViews(jobId);
  }, [jobId]);
  return null;
}
