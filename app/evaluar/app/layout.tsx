import "../../empresa/company.css";
import "./evaluar-app.css";
import EvaluarShell, { type ShellInfo } from "@/components/evaluar/EvaluarShell";
import { getCurrentCompany } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLinkableJobs, getMyEvaluarAccess, getMyProcesses } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";

// Marco del panel de trabajo de Worka Evaluar.
//
// Trae lo que el marco muestra en todas las pantallas: la empresa (nombre,
// logo, verificación), la cuenta, el uso del plan y las vacantes para crear
// un proceso desde la barra lateral. Es la misma cuenta de Worka Empresas.
export default async function EvaluarAppLayout({ children }: { children: React.ReactNode }) {
  const [company, user, access, processes, jobs] = await Promise.all([
    getCurrentCompany().catch(() => null),
    getCurrentUser().catch(() => null),
    getMyEvaluarAccess(),
    getMyProcesses().catch(() => []),
    getLinkableJobs().catch(() => []),
  ]);
  const plan = planOf(access);
  const propios = processes.filter((p) => p.esDueno !== false && !p.archived);

  const info: ShellInfo = {
    companyName: company?.trade_name || company?.company_name || "Tu empresa",
    logoUrl: company?.logo_url ?? null,
    email: user?.email ?? "",
    verified: !!company?.is_verified,
    plan: {
      label: plan.label,
      inTrial: access.inTrial,
      active: access.active,
      daysLeft: access.daysLeft,
      limit: plan.activeProcesses,
      activeCount: propios.filter((p) => p.status === "activo").length,
    },
    processCount: propios.length,
    jobs,
  };

  return <EvaluarShell info={info}>{children}</EvaluarShell>;
}
