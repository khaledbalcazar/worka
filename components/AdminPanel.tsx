"use client";

import { useState, useTransition } from "react";
import type { BadgeId, Company, JobWithCompany, Report } from "@/lib/types";
import { BADGE_CATALOG } from "@/lib/types";
import { StatusChip } from "@/components/Badges";
import { formatDate, timeAgo } from "@/lib/format";
import {
  resolveModeration,
  toggleCompanyBadge,
  verifyCompany,
} from "@/app/actions";

export default function AdminPanel({
  moderationQueue,
  reports,
  pendingCompanies,
  allCompanies,
  activeJobsCount,
}: {
  moderationQueue: JobWithCompany[];
  reports: Report[];
  pendingCompanies: Company[];
  allCompanies: Company[];
  activeJobsCount: number;
}) {
  const [resolved, setResolved] = useState<
    Record<string, "aprobada" | "eliminada">
  >({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [badgeState, setBadgeState] = useState<Record<string, BadgeId[]>>(
    Object.fromEntries(allCompanies.map((c) => [c.id, c.badges]))
  );
  const [pending, startTransition] = useTransition();

  function handleBadge(companyId: string, badge: BadgeId) {
    const current = badgeState[companyId] ?? [];
    const grant = !current.includes(badge);
    setBadgeState((s) => ({
      ...s,
      [companyId]: grant
        ? [...current, badge]
        : current.filter((b) => b !== badge),
    }));
    startTransition(async () => {
      await toggleCompanyBadge(companyId, badge, grant);
    });
  }

  const visiblePending = pendingCompanies.filter((c) => !verified[c.id]);

  function handleModeration(jobId: string, decision: "aprobar" | "eliminar") {
    startTransition(async () => {
      const result = await resolveModeration(jobId, decision);
      if (result.ok)
        setResolved((r) => ({
          ...r,
          [jobId]: decision === "aprobar" ? "aprobada" : "eliminada",
        }));
    });
  }

  function handleVerify(companyId: string) {
    startTransition(async () => {
      const result = await verifyCompany(companyId);
      if (result.ok) setVerified((v) => ({ ...v, [companyId]: true }));
    });
  }

  return (
    <main className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Vacantes en moderación", value: moderationQueue.length },
          { label: "Denuncias registradas", value: reports.length },
          { label: "Empresas por verificar", value: visiblePending.length },
          { label: "Vacantes activas", value: activeJobsCount },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-primary-dark">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🚩 Cola de moderación
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Vacantes ocultadas automáticamente al acumular 3 o más denuncias.
        </p>
        {moderationQueue.length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay vacantes pendientes de revisión. 🎉
          </div>
        )}
        {moderationQueue.map((job) => {
          const jobReports = reports.filter((r) => r.job_id === job.id);
          const state = resolved[job.id];
          return (
            <div key={job.id} className="card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary-dark">
                      {job.title}
                    </h3>
                    <StatusChip status={job.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {job.company.trade_name} ({job.company.company_name}) · RUC{" "}
                    {job.company.ruc} · Publicada {formatDate(job.created_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {jobReports.map((r) => (
                      <p
                        key={r.id}
                        className="text-sm bg-red-50 text-red-700 rounded-lg px-3 py-1.5"
                      >
                        🚩 &ldquo;{r.reason}&rdquo;{" "}
                        <span className="text-red-400">
                          · {timeAgo(r.created_at)}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex lg:flex-col gap-2">
                  {state ? (
                    <span
                      className={`chip ${
                        state === "aprobada"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {state === "aprobada" ? "✓ Reactivada" : "✕ Eliminada"}
                    </span>
                  ) : (
                    <>
                      <button
                        className="btn-success text-xs"
                        disabled={pending}
                        onClick={() => handleModeration(job.id, "aprobar")}
                      >
                        Reactivar
                      </button>
                      <button
                        className="btn-danger-outline text-xs"
                        disabled={pending}
                        onClick={() => handleModeration(job.id, "eliminar")}
                      >
                        Eliminar y advertir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🏢 Verificación de empresas
        </h2>
        {visiblePending.length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay empresas pendientes de verificación.
          </div>
        )}
        {visiblePending.map((c) => (
          <div
            key={c.id}
            className="card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-semibold text-primary-dark">
                {c.trade_name}
              </h3>
              <p className="text-sm text-gray-500">
                {c.company_name} · RUC {c.ruc} · {c.location_city}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                ⏳ Consulta DNIT: pendiente de contraste manual
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href="https://www.dnit.gov.py/web/portal-institucional/consultar-ruc"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                Consultar RUC en DNIT ↗
              </a>
              <button
                className="btn-success text-xs"
                disabled={pending}
                onClick={() => handleVerify(c.id)}
              >
                ✓ Verificar
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Insignias por empresa */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🏅 Insignias de empresas
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Otorgá o quitá insignias con un clic. Aparecen al instante en el
          perfil público y en las vacantes de la empresa.
        </p>
        {allCompanies.map((c) => {
          const current = badgeState[c.id] ?? [];
          return (
            <div key={c.id} className="card p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-primary-dark">
                    {c.trade_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {c.company_name} · {current.length} insignia
                    {current.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_CATALOG.map((badge) => {
                    const has = current.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        title={badge.description}
                        disabled={pending}
                        onClick={() => handleBadge(c.id, badge.id)}
                        className={`chip min-h-9 px-3 border transition-colors ${
                          has
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-white text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-600"
                        }`}
                      >
                        {badge.emoji} {badge.label} {has ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
