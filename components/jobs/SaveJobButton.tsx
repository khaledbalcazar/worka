"use client";
import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { toggleSaveJob } from "@/app/actions";

export default function SaveJobButton({ jobId, saved, loggedIn, onChange, withLabel = false }: {
  jobId: string; saved: boolean; loggedIn: boolean; onChange: (saved: boolean) => void; withLabel?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const label = saved ? "Quitar de guardados" : "Guardar empleo";
  const className = withLabel ? "btn-secondary" : "job-save";
  if (!loggedIn) return <Link href={`/ingresar?next=${encodeURIComponent(`/empleo/${jobId}`)}`} aria-label={label} className={className}><Bookmark size={19} />{withLabel && "Guardar empleo"}</Link>;
  return <div className="relative shrink-0">
    <button className={className} disabled={pending} aria-label={label} aria-pressed={saved} onClick={() => {
      setError(""); start(async () => {
        try { const result = await toggleSaveJob(jobId, !saved); if (result.ok) onChange(!saved); else setError(result.error ?? "No pudimos guardar el empleo."); }
        catch { setError("No pudimos conectar. Volvé a intentar."); }
      });
    }}><Bookmark size={19} fill={saved ? "currentColor" : "none"} />{withLabel && (saved ? "Guardado" : "Guardar empleo")}</button>
    {error && <p role="alert" className="job-save-error">{error}</p>}
  </div>;
}
