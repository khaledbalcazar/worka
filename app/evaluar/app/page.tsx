import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import {
  getLinkableJobs,
  getMyEvaluarAccess,
  getPanelData,
} from "@/lib/evaluar";
import StartTrial from "@/components/evaluar/StartTrial";
import PanelHome from "@/components/evaluar/PanelHome";

export const metadata = { title: "Mi panel" };

export default async function EvaluarAppPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    // El panel no está en PROTECTED_PREFIXES del proxy porque ahí la ruta
    // llega como "/app" (el dominio se traduce después): se protege acá.
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp");
  }

  const access = await getMyEvaluarAccess();

  // Sin cuenta todavía: ofrecemos la prueba.
  if (!access.account) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <StartTrial />
      </div>
    );
  }

  const [panel, jobs] = await Promise.all([getPanelData(), getLinkableJobs()]);

  return <PanelHome access={access} panel={panel} jobs={jobs} />;
}
