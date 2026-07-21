"use client";

import { useRef, useState, useTransition } from "react";
import type {
  BadgeId,
  BoostRequest,
  Candidate,
  Company,
  JobWithCompany,
  Report,
  WorkReference,
} from "@/lib/types";
import type { CustomBadge } from "@/lib/types";
import { BADGE_CATALOG } from "@/lib/types";
import { StatusChip } from "@/components/Badges";
import { formatDate, timeAgo } from "@/lib/format";
import {
  adminDeleteJob,
  adminDeleteUser,
  adminSendRecovery,
  adminSetJobFeatured,
  adminSetJobStatus,
  approveIndustryTag,
  broadcastNotification,
  createCustomBadge,
  deleteCustomBadge,
  dismissReport,
  hideJobForReview,
  indexNowSubmitAll,
  warnCompany,
  resolveBoost,
  resolveModeration,
  saveSiteSettings,
  setIdentityStatus,
  toggleCompanyBadge,
  uploadSiteLogo,
  verifyCompany,
} from "@/app/actions";
import type { AdminUser, DetailedReport, GlobalStats } from "@/lib/data";

// Ajustes del CMS que se editan como texto multilínea
const TEXTAREA_SETTINGS = new Set<string>([
  "hero_subtitle",
  "help_text",
  "site_description",
  "custom_industries",
  "custom_cities",
  "landing_differentiators",
  "landing_steps",
  "landing_faqs",
  "landing_categories",
  "landing_stats",
  "landing_testimonials",
  "landing_activity",
  "landing_company_features",
  "legal_terms",
  "legal_privacy",
]);

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
  pendingIndustries = [],
  adminUsers = { users: [], fullAccess: false },
  globalStats,
  detailedReports = [],
  allJobs = [],
  customBadges = [],
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
  pendingIndustries?: string[];
  adminUsers?: { users: AdminUser[]; fullAccess: boolean };
  globalStats?: GlobalStats;
  detailedReports?: DetailedReport[];
  allJobs?: JobWithCompany[];
  customBadges?: CustomBadge[];
}) {
  const [resolved, setResolved] = useState<
    Record<string, "aprobada" | "eliminada">
  >({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [approvedTags, setApprovedTags] = useState<Record<string, boolean>>({});
  const [deletedUsers, setDeletedUsers] = useState<Record<string, boolean>>({});
  const [recoverySent, setRecoverySent] = useState<Record<string, boolean>>({});
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);
  const [confirmUserDelete, setConfirmUserDelete] = useState<AdminUser | null>(
    null
  );
  // Notificación masiva
  const [broadcastAudience, setBroadcastAudience] = useState<
    "candidates" | "companies" | "all"
  >("all");
  const [broadcastIcon, setBroadcastIcon] = useState("📢");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastHref, setBroadcastHref] = useState("");
  const [broadcastSent, setBroadcastSent] = useState<number | null>(null);
  // Gestión de vacantes
  const [jobState, setJobState] = useState<
    Record<string, { featured: boolean; status: string; deleted?: boolean }>
  >(
    Object.fromEntries(
      allJobs.map((j) => [j.id, { featured: j.featured, status: j.status }])
    )
  );
  const [jobFilter, setJobFilter] = useState("");
  const [indexNowResult, setIndexNowResult] = useState<string | null>(null);

  function toggleFeatured(job: JobWithCompany) {
    const next = !jobState[job.id]?.featured;
    setJobState((s) => ({ ...s, [job.id]: { ...s[job.id], featured: next } }));
    startTransition(async () => {
      await adminSetJobFeatured(job.id, next);
    });
  }

  function closeJob(job: JobWithCompany) {
    setJobState((s) => ({ ...s, [job.id]: { ...s[job.id], status: "Cerrado" } }));
    startTransition(async () => {
      await adminSetJobStatus(job.id, "Cerrado");
    });
  }

  function removeJob(job: JobWithCompany) {
    setJobState((s) => ({ ...s, [job.id]: { ...s[job.id], deleted: true } }));
    startTransition(async () => {
      await adminDeleteJob(job.id);
    });
  }

  // Bandeja de denuncias
  const [dismissedReports, setDismissedReports] = useState<
    Record<string, boolean>
  >({});
  const [reportActionDone, setReportActionDone] = useState<
    Record<string, string>
  >({});

  function handleReportAction(
    report: DetailedReport,
    action: "ocultar" | "advertir" | "descartar"
  ) {
    startTransition(async () => {
      if (action === "descartar") {
        await dismissReport(report.id);
        setDismissedReports((s) => ({ ...s, [report.id]: true }));
      } else if (action === "ocultar") {
        await hideJobForReview(report.job_id);
        setReportActionDone((s) => ({ ...s, [report.id]: "🚫 Vacante oculta" }));
      } else {
        await warnCompany(report.company_id, report.job_title);
        setReportActionDone((s) => ({ ...s, [report.id]: "⚠️ Empresa advertida" }));
      }
    });
  }

  function handleRecovery(email: string, key: string) {
    setRecoverySent((s) => ({ ...s, [key]: true }));
    startTransition(async () => {
      await adminSendRecovery(email);
    });
  }

  function handleDeleteUser(user: AdminUser) {
    setConfirmUserDelete(null);
    setDeletedUsers((s) => ({ ...s, [user.id]: true }));
    startTransition(async () => {
      await adminDeleteUser(user.id);
    });
  }
  const [badgeState, setBadgeState] = useState<Record<string, string[]>>(
    Object.fromEntries(allCompanies.map((c) => [c.id, c.badges]))
  );
  const [identityDone, setIdentityDone] = useState<Record<string, string>>({});
  const [boostDone, setBoostDone] = useState<Record<string, string>>({});
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleSiteLogo(file: File | undefined, kind: "logo" | "favicon") {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    startTransition(async () => {
      const result = await uploadSiteLogo(fd, kind);
      if (result.ok && result.url)
        setSettingsDraft((s) => ({
          ...s,
          [kind === "logo" ? "logo_url" : "favicon_url"]: result.url!,
        }));
    });
  }

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

  // Catálogo fijo + insignias personalizadas creadas por el admin.
  const [localBadges, setLocalBadges] = useState<CustomBadge[]>(customBadges);
  const allBadges = [...BADGE_CATALOG, ...localBadges];
  const [badgeDraft, setBadgeDraft] = useState({
    emoji: "🏅",
    label: "",
    description: "",
  });

  function addCustomBadge() {
    if (!badgeDraft.label.trim()) return;
    const draft = { ...badgeDraft };
    startTransition(async () => {
      const result = await createCustomBadge(draft);
      if (result.ok) {
        setLocalBadges((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            ...draft,
            created_at: new Date().toISOString(),
          },
        ]);
        setBadgeDraft({ emoji: "🏅", label: "", description: "" });
      }
    });
  }

  function removeCustomBadge(id: string) {
    setLocalBadges((prev) => prev.filter((b) => b.id !== id));
    startTransition(() => {
      deleteCustomBadge(id);
    });
  }

  function handleBadge(companyId: string, badge: string) {
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

      {/* Estadísticas globales del negocio */}
      {globalStats && (
        <section className="space-y-3">
          <h2 className="font-bold text-primary-dark text-lg">
            📊 Estadísticas globales
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Candidatos", value: globalStats.candidates, icon: "👤" },
              { label: "Empresas", value: globalStats.companies, icon: "🏢" },
              {
                label: "Vacantes activas",
                value: `${globalStats.activeJobs}/${globalStats.totalJobs}`,
                icon: "💼",
              },
              {
                label: "Postulaciones",
                value: globalStats.applications,
                icon: "📨",
              },
              {
                label: "Postulaciones (7 días)",
                value: globalStats.applicationsThisWeek,
                icon: "🗓️",
              },
              {
                label: "% que llega a Contactado",
                value: `${globalStats.contactedRate}%`,
                icon: "✅",
                highlight: true,
              },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <p className="text-2xl font-bold text-primary-dark">
                  {s.icon} {s.value}
                </p>
                <p
                  className={`text-sm mt-0.5 ${s.highlight ? "text-emerald-600 font-medium" : "text-gray-500"}`}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Registros por día (últimos 14) */}
          <div className="card p-5">
            <h3 className="font-semibold text-primary-dark text-sm mb-4">
              Registros por día (últimos 14)
            </h3>
            <div className="flex items-end gap-1.5 h-32">
              {globalStats.signupsByDay.map((d) => {
                const max = Math.max(
                  ...globalStats.signupsByDay.map((x) => x.count),
                  1
                );
                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">
                      {d.count}
                    </span>
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary-dark"
                      style={{
                        height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 2)}%`,
                      }}
                      title={`${d.day}: ${d.count}`}
                    />
                    <span className="text-[9px] text-gray-400 rotate-45 origin-left whitespace-nowrap mt-1">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Notificación masiva */}
      <section className="card p-5 space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          📢 Enviar notificación masiva
        </h2>
        <p className="text-sm text-gray-500 -mt-1">
          Cae en la campanita 🔔 de la audiencia elegida. Ideal para novedades,
          nuevas funciones o avisos importantes.
        </p>
        {broadcastSent !== null ? (
          <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between animate-pop">
            <p className="text-sm text-emerald-700">
              ✅ Notificación enviada a {broadcastSent} usuario
              {broadcastSent === 1 ? "" : "s"}.
            </p>
            <button
              className="text-sm text-emerald-700 font-medium underline"
              onClick={() => {
                setBroadcastSent(null);
                setBroadcastTitle("");
                setBroadcastBody("");
              }}
            >
              Enviar otra
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3">
            <div>
              <label className="label">Audiencia</label>
              <select
                className="input"
                value={broadcastAudience}
                onChange={(e) =>
                  setBroadcastAudience(e.target.value as typeof broadcastAudience)
                }
              >
                <option value="all">Todos</option>
                <option value="candidates">Solo candidatos</option>
                <option value="companies">Solo empresas</option>
              </select>
            </div>
            <div>
              <label className="label">Ícono (emoji)</label>
              <input
                className="input"
                value={broadcastIcon}
                onChange={(e) => setBroadcastIcon(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="label">Título</label>
              <input
                className="input"
                placeholder="Ej: ¡Nueva función en Worka!"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="label">Mensaje</label>
              <textarea
                className="input min-h-20"
                placeholder="Contales la novedad en pocas líneas…"
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="label">Link (opcional)</label>
              <input
                className="input"
                placeholder="Ej: /empleos"
                value={broadcastHref}
                onChange={(e) => setBroadcastHref(e.target.value)}
              />
            </div>
            <div className="lg:col-span-2 flex justify-end">
              <button
                className="btn-primary"
                disabled={pending || !broadcastTitle || !broadcastBody}
                onClick={() =>
                  startTransition(async () => {
                    const result = await broadcastNotification({
                      audience: broadcastAudience,
                      title: broadcastTitle,
                      body: broadcastBody,
                      href: broadcastHref || undefined,
                      icon: broadcastIcon || undefined,
                    });
                    if (result.ok) setBroadcastSent(result.sent ?? 0);
                  })
                }
              >
                {pending ? "Enviando…" : "📢 Enviar a todos"}
              </button>
            </div>
          </div>
        )}
      </section>

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
              ["site_title", "Título de la pestaña (SEO)"],
              ["site_description", "Descripción para Google (SEO)"],
              ["logo_url", "Logo del sitio"],
              ["favicon_url", "Ícono de la pestaña (favicon)"],
              ["hero_badge", "Chip de la portada"],
              ["hero_title", "Título de la portada"],
              ["hero_subtitle", "Subtítulo de la portada"],
              ["contact_email", "Email de contacto"],
              ["contact_whatsapp", "WhatsApp de contacto"],
              ["payment_link", "Link de pago (potenciar empleo)"],
              ["help_text", "Texto de ayuda"],
              ["custom_industries", "Rubros extra (separados por coma)"],
              ["custom_cities", "Ciudades extra (separadas por coma)"],
              ["banner_enabled", "Banner global activo (escribí 'true' o dejá vacío)"],
              ["banner_text", "Texto del banner global"],
              ["banner_link", "Link del banner (opcional, ej: /empleos)"],
              ["maintenance_mode", "Modo mantenimiento (escribí 'true' para activar)"],
              ["maintenance_text", "Texto de la pantalla de mantenimiento"],
              [
                "landing_differentiators",
                "Portada: diferenciadores (1 por línea: emoji|título|texto)",
              ],
              [
                "landing_steps",
                "Portada: pasos de cómo funciona (1 por línea: título|texto)",
              ],
              [
                "landing_faqs",
                "Portada: preguntas frecuentes (1 por línea: pregunta|respuesta)",
              ],
              [
                "landing_categories",
                "Portada: rubros (1 por línea: icono|nombre|rubro|color). Iconos: ventas, gastronomia, atencion, logistica, administracion, produccion, salud, construccion",
              ],
              [
                "landing_stats",
                "Portada: estadísticas de la franja (1 por línea: valor|etiqueta). Vacío = usa las vacantes activas reales",
              ],
              [
                "landing_testimonials",
                "Portada: historias reales (1 por línea: nombre|rol|testimonio|url de foto opcional). Vacío = la sección no se muestra",
              ],
              [
                "landing_activity",
                "Portada: feed EN VIVO (1 por línea: tipo|texto). Tipos: registro, vista, vacante, verificado, mensaje, destacado",
              ],
              [
                "landing_company_features",
                "Portada: beneficios para empresas (1 por línea)",
              ],
              ["legal_terms", "Términos y condiciones (texto legal)"],
              ["legal_privacy", "Política de privacidad (texto legal)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={TEXTAREA_SETTINGS.has(key) ? "lg:col-span-2" : ""}>
              <label className="label">{label}</label>
              {TEXTAREA_SETTINGS.has(key) ? (
                <textarea
                  className="input min-h-20"
                  value={settingsDraft[key] ?? ""}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({ ...s, [key]: e.target.value }))
                  }
                />
              ) : key === "logo_url" || key === "favicon_url" ? (
                <div className="flex items-center gap-2">
                  {settingsDraft[key] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settingsDraft[key]}
                      alt={label}
                      className="h-9 w-9 rounded object-contain bg-surface"
                    />
                  )}
                  <input
                    className="input flex-1"
                    placeholder="Pegá una URL o subí una imagen →"
                    value={settingsDraft[key] ?? ""}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        [key]: e.target.value,
                      }))
                    }
                  />
                  <input
                    ref={key === "logo_url" ? logoInput : faviconInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleSiteLogo(
                        e.target.files?.[0],
                        key === "logo_url" ? "logo" : "favicon"
                      )
                    }
                  />
                  <button
                    className="btn-secondary shrink-0 text-xs"
                    disabled={pending}
                    onClick={() =>
                      (key === "logo_url" ? logoInput : faviconInput).current?.click()
                    }
                  >
                    📤 Subir
                  </button>
                </div>
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

      {/* SEO / IndexNow */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🔎 Indexación (Bing / Yandex)
        </h2>
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Envía el catálogo completo (vacantes activas + empresas
            verificadas) a IndexNow para que Bing y Yandex lo indexen ya, sin
            esperar el rastreo normal. Las vacantes nuevas se avisan solas al
            publicarlas.
          </p>
          <button
            className={indexNowResult ? "btn-success shrink-0" : "btn-primary shrink-0"}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await indexNowSubmitAll();
                setIndexNowResult(
                  r.ok ? `✓ ${r.sent} URLs enviadas` : r.error ?? "Error"
                );
              })
            }
          >
            {indexNowResult ?? "📡 Enviar catálogo ahora"}
          </button>
        </div>
      </section>

      {/* Gestión de vacantes */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          💼 Gestión de vacantes
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Todas las vacantes de la plataforma. Destacalas en el feed, cerralas o
          eliminalas.
        </p>
        <input
          className="input max-w-sm"
          placeholder="Buscar por puesto o empresa…"
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        />
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Puesto</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Vistas</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allJobs
                .filter(
                  (j) =>
                    !jobState[j.id]?.deleted &&
                    `${j.title} ${j.company.trade_name}`
                      .toLowerCase()
                      .includes(jobFilter.toLowerCase())
                )
                .slice(0, 60)
                .map((j) => {
                  const st = jobState[j.id] ?? {
                    featured: j.featured,
                    status: j.status,
                  };
                  return (
                    <tr key={j.id} className="hover:bg-surface/60">
                      <td className="px-4 py-2.5">
                        <a
                          href={`/empleo/${j.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary-dark hover:text-primary"
                        >
                          {j.title}
                        </a>
                        {st.featured && (
                          <span className="chip bg-amber-50 text-amber-700 ml-2">
                            ⭐ Destacada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {j.company.trade_name}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusChip status={st.status as never} />
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {j.views_count}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-3">
                        <button
                          className="text-amber-600 font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => toggleFeatured(j)}
                        >
                          {st.featured ? "Quitar ⭐" : "Destacar"}
                        </button>
                        {st.status !== "Cerrado" && (
                          <button
                            className="text-gray-500 hover:text-primary font-medium disabled:opacity-50"
                            disabled={pending}
                            onClick={() => closeJob(j)}
                          >
                            Cerrar
                          </button>
                        )}
                        <button
                          className="text-gray-400 hover:text-danger font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => removeJob(j)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bandeja de denuncias */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🗂️ Bandeja de denuncias
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Todas las denuncias de la comunidad, con acción directa. (Con 3+, la
          vacante ya se oculta sola.)
        </p>
        {detailedReports.filter((r) => !dismissedReports[r.id]).length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay denuncias pendientes. 🎉
          </div>
        )}
        {detailedReports
          .filter((r) => !dismissedReports[r.id])
          .map((r) => (
            <div
              key={r.id}
              className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-700">
                  🚩 &ldquo;{r.reason}&rdquo;
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  <span className="font-medium">{r.job_title}</span> ·{" "}
                  {r.company_name} ·{" "}
                  <span className="text-gray-400">{timeAgo(r.created_at)}</span>
                </p>
                <StatusChip status={r.job_status as never} />
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {reportActionDone[r.id] ? (
                  <span className="chip bg-emerald-50 text-emerald-700">
                    {reportActionDone[r.id]}
                  </span>
                ) : (
                  <>
                    {r.job_status === "Activo" && (
                      <button
                        className="btn-danger-outline text-xs"
                        disabled={pending}
                        onClick={() => handleReportAction(r, "ocultar")}
                      >
                        🚫 Ocultar vacante
                      </button>
                    )}
                    <button
                      className="btn-secondary text-xs"
                      disabled={pending}
                      onClick={() => handleReportAction(r, "advertir")}
                    >
                      ⚠️ Advertir empresa
                    </button>
                  </>
                )}
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2"
                  disabled={pending}
                  onClick={() => handleReportAction(r, "descartar")}
                >
                  Descartar
                </button>
              </div>
            </div>
          ))}
      </section>

      {/* Gestión de usuarios */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">👥 Usuarios</h2>
        {!adminUsers.fullAccess && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
            ⚠️ Para ver los emails y eliminar cuentas completas, agregá la
            variable <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            en Vercel (Supabase → Settings → API → service_role) y redeployá.
            Mientras tanto podés enviar recuperaciones escribiendo el email.
          </p>
        )}

        {/* Recuperación manual por email (funciona siempre) */}
        <div className="card p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <p className="text-sm text-gray-600 shrink-0">
            🔑 Enviar recuperación de contraseña a:
          </p>
          <input
            className="input flex-1"
            type="email"
            placeholder="email@delusuario.com"
            value={recoveryEmail}
            onChange={(e) => {
              setRecoveryEmail(e.target.value);
              setRecoveryEmailSent(false);
            }}
          />
          <button
            className={recoveryEmailSent ? "btn-success" : "btn-primary"}
            disabled={!recoveryEmail || pending}
            onClick={() => {
              handleRecovery(recoveryEmail, "__manual");
              setRecoveryEmailSent(true);
            }}
          >
            {recoveryEmailSent ? "✓ Enviado" : "Enviar"}
          </button>
        </div>

        {adminUsers.users.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Alta</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminUsers.users
                  .filter((u) => !deletedUsers[u.id])
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-surface/60">
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {u.name}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {u.email ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`chip ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700"
                              : u.role === "company"
                                ? "bg-blue-50 text-primary"
                                : "bg-surface text-gray-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-3">
                        {u.email && (
                          <button
                            className="text-primary font-medium disabled:opacity-50"
                            disabled={pending || recoverySent[u.id]}
                            onClick={() => handleRecovery(u.email!, u.id)}
                          >
                            {recoverySent[u.id] ? "✓ Enviada" : "🔑 Recuperación"}
                          </button>
                        )}
                        {u.role !== "admin" && (
                          <button
                            className="text-gray-400 hover:text-danger font-medium"
                            disabled={pending}
                            onClick={() => setConfirmUserDelete(u)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rubros propuestos por empresas */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🏷️ Rubros propuestos
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Rubros escritos a mano al publicar una vacante. Aprobalos para que
          se vuelvan etiqueta oficial del buscador.
        </p>
        {pendingIndustries.filter((t) => !approvedTags[t]).length === 0 && (
          <div className="card p-6 text-center text-sm text-gray-400">
            No hay rubros pendientes de revisión.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {pendingIndustries.map((tag) => (
            <div
              key={tag}
              className={`card px-4 py-2.5 flex items-center gap-3 ${
                approvedTags[tag] ? "opacity-60" : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-700">{tag}</span>
              {approvedTags[tag] ? (
                <span className="chip bg-emerald-50 text-emerald-700">
                  ✓ Aprobado
                </span>
              ) : (
                <button
                  className="btn-success text-xs"
                  disabled={pending}
                  onClick={() => {
                    setApprovedTags((s) => ({ ...s, [tag]: true }));
                    startTransition(async () => {
                      await approveIndustryTag(tag);
                    });
                  }}
                >
                  Aprobar como tag
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Crear insignias personalizadas */}
      <section className="space-y-3">
        <h2 className="font-bold text-primary-dark text-lg">
          🎖️ Crear insignias
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Además de las 5 fijas, creá las tuyas. Aparecen abajo para otorgarlas
          a cualquier empresa.
        </p>
        <div className="card p-4 flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="w-20">
            <label className="label">Emoji</label>
            <input
              className="input text-center text-xl"
              maxLength={4}
              value={badgeDraft.emoji}
              onChange={(e) =>
                setBadgeDraft((d) => ({ ...d, emoji: e.target.value }))
              }
            />
          </div>
          <div className="flex-1">
            <label className="label">Nombre</label>
            <input
              className="input"
              placeholder="Ej: Empresa del mes"
              value={badgeDraft.label}
              onChange={(e) =>
                setBadgeDraft((d) => ({ ...d, label: e.target.value }))
              }
            />
          </div>
          <div className="flex-1">
            <label className="label">Descripción</label>
            <input
              className="input"
              placeholder="Ej: Destacada por la comunidad"
              value={badgeDraft.description}
              onChange={(e) =>
                setBadgeDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </div>
          <button
            className="btn-primary shrink-0"
            disabled={!badgeDraft.label.trim() || pending}
            onClick={addCustomBadge}
          >
            Crear
          </button>
        </div>
        {localBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {localBadges.map((b) => (
              <span
                key={b.id}
                className="chip bg-amber-50 text-amber-700 border border-amber-200"
                title={b.description}
              >
                {b.emoji} {b.label}
                <button
                  className="ml-1.5 text-amber-400 hover:text-danger"
                  onClick={() => removeCustomBadge(b.id)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
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
                <div className="flex flex-wrap gap-1.5 items-center">
                  <button
                    className="chip min-h-9 px-3 border border-gray-200 text-gray-400 hover:border-danger hover:text-danger"
                    disabled={pending}
                    onClick={() =>
                      setConfirmUserDelete({
                        id: c.id,
                        email: null,
                        role: "company",
                        name: c.trade_name,
                        created_at: c.created_at,
                      })
                    }
                  >
                    🗑️ Eliminar empresa
                  </button>
                  {allBadges.map((badge) => {
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
      {/* Confirmación de eliminación de cuenta */}
      {confirmUserDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 animate-fade-up">
            <h4 className="font-semibold text-primary-dark">
              ¿Eliminar la cuenta de {confirmUserDelete.name}?
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Se borran su perfil, postulaciones, vacantes y archivos de forma
              permanente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmUserDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="btn bg-danger text-white hover:bg-red-600 flex-1"
                onClick={() => handleDeleteUser(confirmUserDelete)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
