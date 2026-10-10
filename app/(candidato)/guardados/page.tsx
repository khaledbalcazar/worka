import Link from "next/link";
import { Bookmark } from "lucide-react";
import MyJobsShell from "@/components/MyJobsShell";
import SavedJobsList from "@/components/jobs/SavedJobsList";
import { getMyAppliedJobIds, getMySavedJobs } from "@/lib/data";

export const metadata = {
  title: "Guardadas",
  robots: { index: false, follow: false },
};

// Las vacantes guardadas vivían al final de Postulaciones, debajo de toda la
// lista: quien guardaba algo "para pensarlo" difícilmente lo volvía a
// encontrar. Ahora tienen su propia pantalla, accesible desde la hoja "Más".
export default async function SavedJobsPage() {
  const [savedJobs, appliedIds] = await Promise.all([
    getMySavedJobs(),
    getMyAppliedJobIds(),
  ]);

  return (
    <MyJobsShell active="guardados">
      <section className="myjobs-card">
        <header className="myjobs-card-head">
          <h1>Empleos guardados</h1>
          {savedJobs.length > 0 && (
            <p>{savedJobs.length} {savedJobs.length === 1 ? "vacante" : "vacantes"} · La empresa no se entera de que guardaste su aviso.</p>
          )}
        </header>
        {savedJobs.length === 0 ? (
          <div className="myjobs-empty">
            <Bookmark size={28} />
            <h2>Todavía no guardaste ninguna vacante</h2>
            <p>Tocá el marcador de cualquier vacante para dejarla acá y decidir con calma.</p>
            <Link href="/empleos" className="btn-primary">Buscar empleos</Link>
          </div>
        ) : (
          <SavedJobsList jobs={savedJobs} appliedIds={[...appliedIds]} />
        )}
      </section>
    </MyJobsShell>
  );
}
