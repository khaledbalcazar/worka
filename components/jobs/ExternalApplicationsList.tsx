"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import type { ExternalApplication, ExternalApplicationStatus } from "@/lib/types";
import { deleteExternalApplication, updateExternalApplicationStatus } from "@/app/actions";
import { formatDate } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import { EXTERNAL_STATUS_LABELS } from "./ExternalApplyPanel";

// Postulaciones a avisos de otros portales, dentro de Mis postulaciones. El
// estado lo anota la persona: la empresa no está en Worka para cambiarlo.
export default function ExternalApplicationsList({ applications }: { applications: ExternalApplication[] }) {
  const [items, setItems] = useState(applications);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setStatus(id: string, status: ExternalApplicationStatus) {
    const before = items;
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateExternalApplicationStatus(id, status);
        if (!result.ok) { setItems(before); setError(result.error ?? "No pudimos actualizar el estado."); }
      } catch { setItems(before); setError("No pudimos conectar. Probá de nuevo."); }
    });
  }

  function remove(id: string) {
    if (!window.confirm("¿Quitar esta postulación de tu lista? No cambia nada en el otro portal.")) return;
    const before = items;
    setItems((list) => list.filter((a) => a.id !== id));
    startTransition(async () => {
      try {
        const result = await deleteExternalApplication(id);
        if (!result.ok) { setItems(before); setError(result.error ?? "No pudimos quitarla."); }
      } catch { setItems(before); setError("No pudimos conectar. Probá de nuevo."); }
    });
  }

  if (items.length === 0) return null;
  return (
    <>
      <div className="li-divider">
        <strong>En otros portales</strong>
        <span>Te postulaste fuera de Worka. Anotá cómo va cada una.</span>
      </div>
      {error && <p role="alert" className="text-sm text-danger px-4 pt-3">{error}</p>}
      <ul className="li-items">
        {items.map((a) => (
          <li key={a.id} className="li-item">
            <EntityAvatar url={null} name={a.company_name} className="li-logo" />
            <div className="li-item-body">
              <h2 className="li-item-title">
                {a.external_job_id ? <Link href={`/empleo/externo/${a.external_job_id}`}>{a.job_title}</Link> : a.job_title}
              </h2>
              <p className="li-item-company">{a.company_name}</p>
              <p className="li-item-location">
                Postulada el {formatDate(a.applied_at)} · {a.method === "email" ? "por correo" : `en ${a.source_name}`}
              </p>
              <div className="flex items-center gap-2 mt-2 relative z-[1]">
                <label className="sr-only" htmlFor={`xstatus-${a.id}`}>Estado de la postulación</label>
                <select
                  id={`xstatus-${a.id}`}
                  className="ext-status-select"
                  data-status={a.status}
                  value={a.status}
                  disabled={pending}
                  onChange={(e) => setStatus(a.id, e.target.value as ExternalApplicationStatus)}
                >
                  {(Object.keys(EXTERNAL_STATUS_LABELS) as ExternalApplicationStatus[]).map((s) => (
                    <option key={s} value={s}>{EXTERNAL_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <span className="li-item-foot !mt-0"><span className="is-external inline-flex items-center gap-1"><ExternalLink size={11} /> Fuera de Worka</span></span>
              </div>
            </div>
            <button type="button" className="job-save relative z-[1]" aria-label={`Quitar ${a.job_title} de la lista`} disabled={pending} onClick={() => remove(a.id)}>
              <Trash2 size={17} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
