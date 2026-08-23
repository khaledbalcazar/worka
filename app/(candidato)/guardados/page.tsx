import Link from "next/link";
import { Bookmark } from "lucide-react";
import JobCard from "@/components/JobCard";
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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
          Guardadas
        </h1>
        {savedJobs.length > 0 && (
          <span className="text-sm text-gray-400">
            {savedJobs.length}{" "}
            {savedJobs.length === 1 ? "vacante" : "vacantes"}
          </span>
        )}
      </div>

      {savedJobs.length === 0 ? (
        <div className="card p-10 text-center animate-rise">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-3 text-primary">
            <Bookmark size={24} />
          </div>
          <p className="font-semibold text-primary-dark">
            Todavía no guardaste ninguna vacante
          </p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Tocá la estrella de cualquier vacante para dejarla acá y decidir con
            calma. No se avisa a la empresa.
          </p>
          <Link href="/empleos" className="btn-primary press mt-5">
            Buscar empleos
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 stagger">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              alreadyApplied={appliedIds.has(job.id)}
              initiallySaved
            />
          ))}
        </div>
      )}
    </div>
  );
}
