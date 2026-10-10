"use client";
import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportJob } from "@/app/actions";
import MobileSheet from "@/components/MobileSheet";

export default function ReportJobButton({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  return <>
    <button className="flex items-center gap-1 text-xs text-gray-500 py-2" onClick={() => setOpen(true)}><Flag size={13} /> Reportar un problema</button>
    <MobileSheet desktop open={open} onClose={() => setOpen(false)} label="Reportar vacante" className="p-5">
      <h2 className="text-lg font-semibold">{done ? "Recibimos tu reporte" : "¿Qué problema encontraste?"}</h2>
      {done ? <p className="text-sm text-gray-600 mt-3">El equipo de Worka revisará la vacante. Gracias por ayudarnos a cuidar la comunidad.</p> : <>
        <label className="block mt-4"><span className="label">Motivo del reporte</span><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Seleccioná un motivo</option>{["Piden dinero o inversión inicial", "Parece una estafa", "Información falsa o engañosa", "Contenido discriminatorio", "Otro motivo"].map((value) => <option key={value}>{value}</option>)}</select></label>
        {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
      </>}
      <div className="flex gap-2 mt-5"><button className="btn-secondary flex-1" onClick={() => setOpen(false)}>{done ? "Cerrar" : "Cancelar"}</button>{!done && <button className="btn-primary flex-1" disabled={pending || !reason} onClick={() => { setError(""); start(async () => { try { const result = await reportJob(jobId, reason); if (result.ok) setDone(true); else setError(result.error ?? "No pudimos enviar el reporte."); } catch { setError("No pudimos conectar. Volvé a intentar."); } }); }}>{pending ? "Enviando…" : "Enviar reporte"}</button>}</div>
    </MobileSheet>
  </>;
}
