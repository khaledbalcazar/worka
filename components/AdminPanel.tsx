"use client";

import { useState, useTransition } from "react";
import type {
  BadgeId,
  BoostRequest,
  Candidate,
  Company,
  JobWithCompany,
  Report,
  WorkReference,
} from "@/lib/types";
import { BADGE_CATALOG } from "@/lib/types";
import { StatusChip } from "@/components/Badges";
import { formatDate, timeAgo } from "@/lib/format";
import {
  resolveBoost,
  resolveModeration,
  saveSiteSettings,
  setIdentityStatus,
  toggleCompanyBadge,
  verifyCompany,
} from "@/app/actions";

export type IdentityQueueItem = Candidate & {
  docs: { label: string; url: string }[];
};

export default function AdminPanel({
  moderationQueue,
  reports,
  pendingCompanies,
  allCompanies,
  activeJobsCount,
  identityQueue = [],
  references = [],
  boosts = [],
  settings = {},
}: {
  moderationQueue: JobWithCompany[];
  reports: Report[];
  pendingCompanies: Company[];
  allCompanies: Company[];
  activeJobsCount: number;
  identityQueue?: IdentityQueueItem[];
  references?: (WorkReference & { candidate_name?: string })[];
  boosts?: (BoostRequest & { job_title?: string; company_name?: string })[];
  settings?: Record<string, string>;
}) {
  const [resolved, setResolved] = useState<
    Record<string, "aprobada" | "eliminada">
  >({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [badgeState, setBadgeState] = useState<Record<string, BadgeId[]>>(
    Object.fromEntries(allCompanies.map((c) => [c.id, c.badges]))
  );
  const [identityDone, setIdentityDone] = useState<Record<string, string>>({});
  const [boostDone, setBoostDone] = useState<Record<string, string>>({});
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleIdentity(candidateId: string, approve: boolean) {
    startTransition(async () => {
      const result = await setIdentityStatus(
        candidateId,
        approve ? "verified" : "none"
      );
      if (result.ok)
        setIdentityDone((s) => ({
          ...s,
          [candidateId]: approve ? "aprobada" : "rechazada",
        }));
    });
  }

  function handleBoost(boostId: string, approve: boolean) {
    startTransition(async () => {
      const result = await resolveBoost(boostId, approve);
      if (result.ok)
        setBoostDone((s) => ({
          ...s,
          [boostId]: approve ? "activo" : "rechazado",
        }));
    });
  }

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

      {/* Verificación de identidad (cédulas) */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🪪 Verificación de identidad
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Frente y dorso de cédula + selfie sosteniéndola. Aprobá solo si los
          tres coinciden.
        </p>
        {identityQueue.length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay solicitudes de identidad pendientes.
          </div>
        )}
        {identityQueue.map((c) => {
          const state = identityDone[c.id];
          return (
            <div key={c.id} className="card p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-primary-dark">
                    {c.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {c.location_city} · {c.phone_whatsapp}
                  </p>
                </div>
                {state ? (
                  <span
                    className={`chip ${
                      state === "aprobada"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {state === "aprobada" ? "✓ Aprobada" : "✕ Rechazada"}
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="btn-success text-xs"
                      disabled={pending}
                      onClick={() => handleIdentity(c.id, true)}
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      className="btn-danger-outline text-xs"
                      disabled={pending}
                      onClick={() => handleIdentity(c.id, false)}
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                )}
              </div>
              {c.docs.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {c.docs.map((d) => (
                    <a
                      key={d.label}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.url}
                        alt={d.label}
                        className="w-full h-28 object-cover rounded-xl border border-gray-200"
                      />
                      <p className="text-[11px] text-gray-500 text-center mt-1">
                        {d.label} ↗
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ No se encontraron las fotos en el bucket
                  &lsquo;identidad&rsquo;.
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* Referencias laborales */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🤝 Referencias laborales
        </h2>
        {references.length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            Todavía no hay referencias cargadas.
          </div>
        )}
        {references.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Candidato</th>
                  <th className="px-5 py-3 font-medium">Referencia</th>
                  <th className="px-5 py-3 font-medium">Relación</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {references.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-primary-dark">
                      {r.candidate_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.referrer_name}
                      <span className="block text-xs text-gray-400">
                        {r.referrer_phone}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-56 truncate">
                      {r.relationship}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`chip ${
                          r.status === "confirmada"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Potenciar empleo (pagos) */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          ⚡ Vacantes potenciadas
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Al confirmar el pago, la vacante pasa a ⭐ destacada por los días del
          plan. El link de pago se configura abajo en el sitio.
        </p>
        {boosts.length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay solicitudes de potenciación.
          </div>
        )}
        {boosts.map((b) => {
          const state = boostDone[b.id] ?? b.status;
          return (
            <div
              key={b.id}
              className="card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-semibold text-primary-dark">
                  {b.job_title ?? "Vacante"}
                </h3>
                <p className="text-sm text-gray-500">
                  {b.company_name ?? "Empresa"} · {b.plan} · Gs.{" "}
                  {b.price_gs.toLocaleString("es-PY")} ·{" "}
                  {timeAgo(b.created_at)}
                </p>
              </div>
              {state !== "pendiente_pago" ? (
                <span
                  className={`chip ${
                    state === "activo"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {state === "activo" ? "⭐ Activa" : "✕ Rechazada"}
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="btn-success text-xs"
                    disabled={pending}
                    onClick={() => handleBoost(b.id, true)}
                  >
                    ✓ Pago confirmado
                  </button>
                  <button
                    className="btn-danger-outline text-xs"
                    disabled={pending}
                    onClick={() => handleBoost(b.id, false)}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Configuración del sitio */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🎨 Configuración del sitio
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Estos textos y datos se aplican en toda la web al guardar.
        </p>
        <div className="card p-5 grid lg:grid-cols-2 gap-4">
          {(
            [
              ["site_name", "Nombre del sitio"],
              ["logo_url", "URL del logo (bucket 'publico' o externa)"],
              ["hero_title", "Título de la portada"],
              ["hero_subtitle", "Subtítulo de la portada"],
              ["contact_email", "Email de contacto"],
              ["contact_whatsapp", "WhatsApp de contacto"],
              ["payment_link", "Link de pago (potenciar empleo)"],
              ["help_text", "Texto de ayuda"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === "hero_subtitle" || key === "help_text" ? "lg:col-span-2" : ""}>
              <label className="label">{label}</label>
              {key === "hero_subtitle" || key === "help_text" ? (
                <textarea
                  className="input min-h-20"
                  value={settingsDraft[key] ?? ""}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({ ...s, [key]: e.target.value }))
                  }
                />
              ) : (
                <input
                  className="input"
                  value={settingsDraft[key] ?? ""}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({ ...s, [key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
          <div className="lg:col-span-2 flex items-center justify-between gap-3">
            {settingsSaved ? (
              <p className="text-sm text-emerald-700">
                ✅ Guardado. Los cambios ya están en la web.
              </p>
            ) : (
              <span />
            )}
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await saveSiteSettings(settingsDraft);
                  if (result.ok) setSettingsSaved(true);
                })
              }
            >
              {pending ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </div>
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
