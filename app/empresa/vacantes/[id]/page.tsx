import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicantsForJob, getCurrentCompany, getJobById } from "@/lib/data";
import { StatusChip } from "@/components/Badges";
import ApplicantsKanban from "@/components/ApplicantsKanban";

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, applicants, company] = await Promise.all([
    getJobById(id),
    getApplicantsForJob(id),
    getCurrentCompany(),
  ]);
  if (!job) notFound();

  const closed = job.status === "Cerrado";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/empresa" className="text-sm text-primary font-medium">
          ← Volver al panel
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">{job.title}</h1>
            <p className="text-sm text-gray-500">
              {applicants.length} postulantes · {job.views_count} vistas
            </p>
          </div>
          <StatusChip status={job.status} />
        </div>
      </div>

      {closed && (
        <section className="card p-5 bg-primary-dark text-white">
          <h2 className="font-semibold">📈 Resumen de la búsqueda cerrada</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            {[
              { label: "Vistas", value: job.views_count },
              { label: "Postulaciones", value: applicants.length },
              {
                label: "Contactados",
                value: applicants.filter((a) => a.status === "Contactado")
                  .length,
              },
              { label: "Días activa", value: 30 },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-blue-300">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-blue-200 mt-3">
            ¿Volvés a buscar este puesto? Duplicá la vacante desde el panel y
            publicala en 1 clic.
          </p>
        </section>
      )}

      <ApplicantsKanban
        job={job}
        applicants={applicants}
        companyName={company?.trade_name ?? "tu empresa"}
      />
    </div>
  );
}
