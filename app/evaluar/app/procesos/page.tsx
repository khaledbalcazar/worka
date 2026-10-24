import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getMyProcesses, getPanelData } from "@/lib/evaluar";
import ProcessList from "@/components/evaluar/ProcessList";

export const metadata = { title: "Procesos" };

export default async function ProcessesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp%2Fprocesos");
  }
  const [{ q }, processes, panel] = await Promise.all([searchParams, getMyProcesses(), getPanelData()]);
  // Solo los propios: los compartidos por otra empresa viven en el inicio.
  const propios = processes.filter((p) => p.esDueno !== false);
  return (
    <div>
      <div className="ev-page-head">
        <div>
          <h1>Procesos</h1>
          <p>Todas tus búsquedas, con el avance de los candidatos en cada una.</p>
        </div>
      </div>
      <ProcessList key={q ?? ""} processes={propios} progress={panel.charts.perProcess} initialQuery={q ?? ""} />
    </div>
  );
}
