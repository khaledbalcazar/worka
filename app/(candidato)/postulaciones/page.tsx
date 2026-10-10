import Link from "next/link";
import { getMyApplications, getMyExternalApplications, getMyInterviews } from "@/lib/data";
import ExternalApplicationsList from "@/components/jobs/ExternalApplicationsList";
import { ClipboardList, PartyPopper } from "lucide-react";
import MyJobsShell from "@/components/MyJobsShell";
import { StatusChip } from "@/components/Badges";
import EntityAvatar from "@/components/EntityAvatar";
import InterviewCard from "@/components/InterviewCard";
import { formatDate } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";

// Línea de tiempo simple: el candidato siempre sabe en qué está su postulación.
const TIMELINE: { key: ApplicationStatus; label: string }[] = [
  { key: "Pendiente", label: "Enviada" },
  { key: "Revisado", label: "Revisada" },
  { key: "Contactado", label: "Contactado" },
];

function stepIndex(status: ApplicationStatus): number {
  if (status === "Rechazado") return -1;
  return TIMELINE.findIndex((t) => t.key === status);
}

export default async function ApplicationsPage() {
  const [apps, interviews, externalApps] = await Promise.all([
    getMyApplications(),
    getMyInterviews(),
    getMyExternalApplications(),
  ]);
  const inProcess = apps.filter(
    (a) => a.status === "Revisado" || a.status === "Contactado"
  ).length;
  const contacted = apps.filter((a) => a.status === "Contactado").length;

  // Lo que necesita acción va arriba. Antes las postulaciones salían en orden
  // de envío, así que un "te contactaron" podía quedar sepultado bajo veinte
  // pendientes y la persona se enteraba tarde.
  const PRIORITY: Record<string, number> = {
    Contactado: 0,
    Revisado: 1,
    Pendiente: 2,
    Rechazado: 3,
  };
  const ordered = [...apps].sort(
    (a, b) =>
      (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9) ||
      +new Date(b.applied_at) - +new Date(a.applied_at)
  );

  return (
    <MyJobsShell active="postulaciones">
      <section className="myjobs-card">
        <header className="myjobs-card-head">
          <h1>Mis postulaciones</h1>
          {apps.length > 0 ? (
            <p>
              {apps.length} {apps.length === 1 ? "enviada" : "enviadas"} · {inProcess} en proceso · {contacted}{" "}
              {contacted === 1 ? "contacto" : "contactos"}
            </p>
          ) : (
            <p>Seguí el estado de cada postulación: acá no se postula al vacío.</p>
          )}
        </header>

        {contacted > 0 && (
          <div className="myjobs-highlight">
            <PartyPopper size={18} />
            <div>
              <strong>
                {contacted === 1 ? "Una empresa te contactó" : `${contacted} empresas te contactaron`}
              </strong>
              <span>Revisá tu WhatsApp. Están arriba de todo en la lista.</span>
            </div>
          </div>
        )}

        {apps.length === 0 && externalApps.length === 0 ? (
          <div className="myjobs-empty">
            <ClipboardList size={28} />
            <h2>Todavía no te postulaste a nada</h2>
            <p>Cuando te postules, acá vas a ver si la empresa vio tu perfil y si te contactó.</p>
            <Link href="/empleos" className="btn-primary">Buscar empleos</Link>
          </div>
        ) : (
          <ul className="li-items">
            {ordered.map((app) => {
              const idx = stepIndex(app.status);
              return (
                <li key={app.id} className={`li-item app-item ${app.status === "Contactado" ? "is-contacted" : ""}`}>
                  <EntityAvatar url={app.job.company.logo_url} name={app.job.company.trade_name} className="li-logo" />
                  <div className="li-item-body">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="li-item-title"><Link href={`/empleo/${app.job.id}`}>{app.job.title}</Link></h2>
                        <p className="li-item-company">{app.job.company.trade_name}</p>
                        <p className="li-item-location">Postulada el {formatDate(app.applied_at)}</p>
                      </div>
                      <span className="relative z-[1] shrink-0"><StatusChip status={app.status} /></span>
                    </div>

                    {app.status === "Rechazado" ? (
                      <p className="app-closed">
                        La empresa cerró tu postulación
                        {app.rejection_reason && <>: <strong>{app.rejection_reason}</strong></>}. No te desanimes, seguí postulando.
                      </p>
                    ) : (
                      <ol className="app-timeline" aria-label="Avance de la postulación">
                        {TIMELINE.map((step, i) => (
                          <li key={step.key} className={i <= idx ? "is-reached" : ""} aria-current={i === idx ? "step" : undefined}>
                            <span aria-hidden>{i <= idx ? "✓" : i + 1}</span>
                            {step.label}
                          </li>
                        ))}
                      </ol>
                    )}
                    {interviews[app.id] && (
                      <div className="relative z-[1]">
                        <InterviewCard
                          interview={interviews[app.id]}
                          jobTitle={app.job.title}
                          companyName={app.job.company.trade_name}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <ExternalApplicationsList applications={externalApps} />
      </section>
    </MyJobsShell>
  );
}
