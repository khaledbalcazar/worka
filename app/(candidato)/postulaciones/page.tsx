import Link from "next/link";
import {
  getMyApplications,
  getMyInterviews,
  getMySavedJobs,
} from "@/lib/data";
import { Bookmark, ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/Badges";
import EntityAvatar from "@/components/EntityAvatar";
import InterviewCard from "@/components/InterviewCard";
import { formatDate } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";

// Línea de tiempo simple: el candidato siempre sabe en qué está su postulación.
const TIMELINE: { key: ApplicationStatus; label: string }[] = [
  { key: "Pendiente", label: "Enviada" },
  { key: "Revisado", label: "Vista por la empresa" },
  { key: "Contactado", label: "Contactado" },
];

function stepIndex(status: ApplicationStatus): number {
  if (status === "Rechazado") return -1;
  return TIMELINE.findIndex((t) => t.key === status);
}

export default async function ApplicationsPage() {
  const [apps, savedJobs, interviews] = await Promise.all([
    getMyApplications(),
    getMySavedJobs(),
    getMyInterviews(),
  ]);
  const savedCount = savedJobs.length;
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
            Mis postulaciones
          </h1>
          <p className="text-sm text-gray-500">
            Seguí el estado de cada una: acá no se postula al vacío.
          </p>
        </div>
        <Link href="/empleos" className="btn-primary self-start sm:self-auto">
          Buscar más empleos
        </Link>
      </div>

      {apps.length > 0 && (
        <div className="grid grid-cols-3 gap-3 stagger">
          {[
            { value: apps.length, label: "Enviadas", cls: "text-primary-dark" },
            { value: inProcess, label: "En proceso", cls: "text-primary" },
            { value: contacted, label: "Contactado", cls: "text-success" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {contacted > 0 && (
        <div className="card p-3.5 bg-emerald-50 border-emerald-200 animate-beat">
          <p className="text-sm font-semibold text-emerald-800">
            🎉 {contacted === 1
              ? "Una empresa te contactó"
              : `${contacted} empresas te contactaron`}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Revisá tu WhatsApp. Están arriba de todo en la lista.
          </p>
        </div>
      )}

      {apps.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-primary-dark">
            Todavía no te postulaste a nada
          </p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Cuando te postules, acá vas a ver el estado de cada postulación:
            enviada, vista por la empresa y contactado.
          </p>
          <Link href="/empleos" className="btn-primary mt-4">
            Ver empleos
          </Link>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 items-start stagger">
      {ordered.map((app) => {
        const idx = stepIndex(app.status);
        const needsAttention = app.status === "Contactado";
        return (
          <div
            key={app.id}
            className={
              needsAttention
                ? "card p-4 border-emerald-300 ring-1 ring-emerald-200"
                : "card p-4"
            }
          >
            <div className="flex items-start justify-between gap-2">
              <Link href={`/empleo/${app.job.id}`} className="min-w-0 flex items-start gap-3">
                <EntityAvatar
                  url={app.job.company.logo_url}
                  name={app.job.company.trade_name}
                  className="w-10 h-10 rounded-xl text-xs"
                />
                <span className="block min-w-0">
                  <h3 className="font-semibold text-primary-dark leading-snug hover:text-primary">
                    {app.job.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {app.job.company.trade_name} · Postulada el{" "}
                    {formatDate(app.applied_at)}
                  </p>
                </span>
              </Link>
              <StatusChip status={app.status} />
            </div>

            {app.status === "Rechazado" ? (
              <div className="mt-3 bg-red-50 rounded-xl p-3 text-sm text-red-700">
                La empresa cerró tu postulación
                {app.rejection_reason && (
                  <>
                    : <span className="font-medium">{app.rejection_reason}</span>
                  </>
                )}
                . ¡No te desanimes, seguí postulando!
              </div>
            ) : (
              <ol className="mt-4 flex items-center">
                {TIMELINE.map((step, i) => {
                  const reached = i <= idx;
                  return (
                    <li key={step.key} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <>
                          {/* Riel gris de fondo y, encima, el tramo de color
                              que se dibuja al entrar: el avance se ve, no hay
                              que deducirlo comparando círculos. */}
                          <span
                            className="absolute top-3 right-1/2 w-full h-0.5 bg-gray-200"
                            aria-hidden
                          />
                          {reached && (
                            <span
                              className="absolute top-3 right-1/2 w-full h-0.5 bg-primary animate-fill"
                              aria-hidden
                            />
                          )}
                        </>
                      )}
                      <span
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          reached
                            ? "bg-primary text-white animate-pop"
                            : "bg-gray-200 text-gray-400"
                        } ${reached && i === idx ? "ring-4 ring-primary/15" : ""}`}
                      >
                        {reached ? "✓" : i + 1}
                      </span>
                      <span
                        className={`mt-1.5 text-[11px] text-center leading-tight ${
                          reached ? "text-primary-dark font-medium" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
            {app.status === "Contactado" && (
              <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                🎉 ¡La empresa te contactó! Revisá tu WhatsApp.
              </p>
            )}
            {interviews[app.id] && (
              <InterviewCard
                interview={interviews[app.id]}
                jobTitle={app.job.title}
                companyName={app.job.company.trade_name}
              />
            )}
          </div>
        );
      })}
      </div>

      {/* Las guardadas ahora tienen pantalla propia: acá abajo, después de
          toda la lista de postulaciones, no las encontraba nadie. */}
      {savedCount > 0 && (
        <Link
          href="/guardados"
          className="card press flex items-center gap-3 p-4 mt-2"
        >
          <span className="w-10 h-10 shrink-0 rounded-2xl bg-surface flex items-center justify-center text-primary">
            <Bookmark size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-800">
              Guardadas para después
            </span>
            <span className="block text-xs text-gray-400">
              {savedCount} {savedCount === 1 ? "vacante" : "vacantes"} esperando
              tu decisión
            </span>
          </span>
          <ChevronRight size={18} className="text-gray-300 shrink-0" />
        </Link>
      )}
    </div>
  );
}
