import { ShieldAlert } from "lucide-react";
import ReportJobButton from "./ReportJobButton";

export default function SafetyNotice({ jobId, external = false }: { jobId: string; external?: boolean }) {
  return (
    <aside className="job-safety" aria-label="Seguridad">
      <ShieldAlert size={24} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <strong>Tu seguridad es nuestra prioridad</strong>
        <p>{external ? "Ninguna empresa seria te pide dinero por trámites, exámenes ni uniformes. Si este aviso lo hace, denuncialo." : "Ninguna empresa en Worka puede pedirte dinero por trámites, exámenes ni uniformes."}</p>
      </div>
      <ReportJobButton jobId={jobId} external={external} label="Denunciar oferta" className="job-safety-report" />
    </aside>
  );
}
