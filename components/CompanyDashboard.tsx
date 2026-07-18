"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Company, JobStatus, JobWithCompany } from "@/lib/types";
import { BOOST_PLANS } from "@/lib/types";
import { StatusChip } from "@/components/Badges";
import { formatDate } from "@/lib/format";
import {
  deleteJob,
  duplicateJob,
  requestBoost,
  setJobStatus,
  updateJobExpiry,
} from "@/app/actions";

const TIPS = [
  "Las vacantes que indican el rango salarial reciben en promedio 2,4 veces más postulaciones.",
  "Agregá hasta 3 preguntas de filtro: vas a leer solo los perfiles que realmente aplican.",
  "Respondé en menos de 72 h para conservar tu sello ⚡ Responde rápido: los candidatos filtran por él.",
  "Las vacantes con líneas de colectivo reciben más postulaciones de candidatos que sí pueden llegar.",
  "Publicá novedades en tu perfil de empresa: los candidatos las ven antes de postularse.",
  "¿Buscás el mismo puesto cada tanto? Usá «Duplicar» y publicá en 1 clic.",
];

interface DashStats {
  activeJobs: number;
  applicationsThisWeek: number;
  totalViews: number;
  avgResponseHours: number | null;
  applicationsPerJob?: { title: string; count: number }[];
}

export default function CompanyDashboard({
  company,
  jobs: initialJobs,
  paymentLink = "",
  stats: realStats,
}: {
  company: Company;
  jobs: JobWithCompany[];
  paymentLink?: string;
  stats?: DashStats;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [expiryValue, setExpiryValue] = useState("");
  const [boosting, setBoosting] = useState<JobWithCompany | null>(null);
  const [boostSent, setBoostSent] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  function handleBoost(plan: string, priceGs: number) {
    if (!boosting) return;
    startTransition(async () => {
      const result = await requestBoost(boosting.id, plan, priceGs);
      if (result.ok) setBoostSent(true);
      else {
        setBoosting(null);
        flash(result.error ?? "No pudimos registrar la solicitud.");
      }
    });
  }

  const stats = [
    {
      label: "Vacantes activas",
      value: realStats?.activeJobs ?? jobs.filter((j) => j.status === "Activo").length,
    },
    {
      label: "Postulaciones esta semana",
      value: realStats?.applicationsThisWeek ?? 0,
    },
    {
      label: "Vistas totales",
      value: realStats?.totalViews ?? jobs.reduce((s, j) => s + j.views_count, 0),
    },
    {
      label: "Tiempo medio de respuesta",
      value:
        realStats?.avgResponseHours != null
          ? `${realStats.avgResponseHours} h`
          : "—",
      highlight: true,
    },
  ];

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 5000);
  }

  function handleDuplicate(job: JobWithCompany) {
    startTransition(async () => {
      const result = await duplicateJob(job.id);
      if (!result.ok) {
        flash(result.error ?? "No pudimos duplicar la vacante.");
        return;
      }
      // Reflejo local inmediato (en modo live el revalidate lo confirma).
      const copy: JobWithCompany = {
        ...job,
        id: `${job.id}-copy-${Date.now()}`,
        status: "Pausado",
        views_count: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      setJobs((prev) => [copy, ...prev]);
      flash(
        "✅ Vacante duplicada como borrador (en pausa). Activala cuando quieras."
      );
    });
  }

  function handleStatus(jobId: string, status: JobStatus) {
    startTransition(async () => {
      const result = await setJobStatus(jobId, status);
      if (!result.ok) {
        flash(result.error ?? "No pudimos cambiar el estado.");
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status } : j))
      );
      flash(
        status === "Pausado"
          ? "⏸️ Vacante pausada: dejó de aparecer en el feed."
          : status === "Activo"
            ? "▶️ Vacante activa de nuevo."
            : "🔒 Búsqueda cerrada. Mirá el resumen en la página de candidatos."
      );
    });
  }

  function handleDelete(jobId: string) {
    setConfirmDelete(null);
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (!result.ok) {
        flash(result.error ?? "No pudimos eliminar la vacante.");
        return;
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      flash("🗑️ Vacante eliminada definitivamente.");
    });
  }

  function handleExpiry(jobId: string) {
    if (!expiryValue) return;
    setEditingExpiry(null);
    startTransition(async () => {
      const result = await updateJobExpiry(jobId, expiryValue);
      if (!result.ok) {
        flash(result.error ?? "No pudimos actualizar la vigencia.");
        return;
      }
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, expires_at: new Date(expiryValue).toISOString() }
            : j
        )
      );
      flash(`📅 Vigencia actualizada al ${formatDate(expiryValue)}.`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Hola, {company.trade_name} 👋
          </h1>
          <p className="text-sm text-gray-500">
            Así van tus búsquedas esta semana.
          </p>
        </div>
        <Link href="/empresa/vacantes/nueva" className="btn-primary">
          ➕ Publicar nueva vacante
        </Link>
      </div>

      {notice && (
        <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800 flex items-center justify-between animate-fade-up">
          <span>{notice}</span>
          <button className="font-medium underline" onClick={() => setNotice(null)}>
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-primary-dark">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            {s.highlight && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                ⚡ Mantené menos de 72 h para conservar tu sello
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Postulaciones por vacante (datos reales) */}
      {(realStats?.applicationsPerJob?.length ?? 0) > 0 && (
        <section className="card p-5">
          <h2 className="font-semibold text-primary-dark mb-4">
            📈 Postulaciones por vacante
          </h2>
          <div className="space-y-2.5">
            {realStats!.applicationsPerJob!.map((row) => {
              const max = Math.max(
                ...realStats!.applicationsPerJob!.map((r) => r.count),
                1
              );
              return (
                <div key={row.title} className="flex items-center gap-3">
                  <span
                    className="w-40 lg:w-56 text-xs text-gray-600 truncate shrink-0"
                    title={row.title}
                  >
                    {row.title}
                  </span>
                  <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.max((row.count / max) * 100, row.count > 0 ? 6 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold text-primary-dark text-right shrink-0">
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-primary-dark">Mis vacantes</h2>
          <span className="text-xs text-gray-400">
            {jobs.length} en total
          </span>
        </div>
        {jobs.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
            Todavía no publicaste ninguna vacante.{" "}
            <Link
              href="/empresa/vacantes/nueva"
              className="text-primary font-medium"
            >
              Publicá la primera →
            </Link>
          </div>
        )}
        {jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Puesto</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Vistas</th>
                  <th className="px-5 py-3 font-medium">Vence</th>
                  <th className="px-5 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface/60 align-middle">
                    <td className="px-5 py-3">
                      <Link
                        href={`/empresa/vacantes/${job.id}`}
                        className="font-medium text-primary-dark hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-400">
                        Publicada {formatDate(job.created_at)} ·{" "}
                        {job.views_count} vistas
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={job.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {job.views_count}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {editingExpiry === job.id ? (
                        <span className="flex items-center gap-1.5">
                          <input
                            type="date"
                            className="input py-1.5 px-2 text-xs w-36"
                            value={expiryValue}
                            onChange={(e) => setExpiryValue(e.target.value)}
                          />
                          <button
                            className="text-primary font-medium text-xs"
                            onClick={() => handleExpiry(job.id)}
                          >
                            OK
                          </button>
                          <button
                            className="text-gray-400 text-xs"
                            onClick={() => setEditingExpiry(null)}
                          >
                            ✕
                          </button>
                        </span>
                      ) : (
                        <button
                          className="hover:text-primary underline decoration-dotted underline-offset-2"
                          title="Cambiar fecha de vigencia"
                          onClick={() => {
                            setEditingExpiry(job.id);
                            setExpiryValue(job.expires_at.slice(0, 10));
                          }}
                        >
                          {formatDate(job.expires_at)} ✏️
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap space-x-2.5">
                      <Link
                        href={`/empresa/vacantes/${job.id}`}
                        className="text-primary font-medium"
                      >
                        Candidatos
                      </Link>
                      <Link
                        href={`/empresa/vacantes/${job.id}/editar`}
                        className="text-gray-500 hover:text-primary font-medium"
                      >
                        Editar
                      </Link>
                      {job.status === "Activo" && (
                        <button
                          className="text-gray-500 hover:text-amber-600 font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => handleStatus(job.id, "Pausado")}
                        >
                          Pausar
                        </button>
                      )}
                      {job.status === "Pausado" && (
                        <button
                          className="text-gray-500 hover:text-emerald-600 font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => handleStatus(job.id, "Activo")}
                        >
                          Activar
                        </button>
                      )}
                      {(job.status === "Activo" || job.status === "Pausado") && (
                        <button
                          className="text-gray-500 hover:text-primary font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => handleStatus(job.id, "Cerrado")}
                        >
                          Cerrar
                        </button>
                      )}
                      {job.status === "Activo" && !job.featured && (
                        <button
                          className="text-amber-500 hover:text-amber-600 font-medium disabled:opacity-50"
                          disabled={pending}
                          onClick={() => {
                            setBoostSent(false);
                            setBoosting(job);
                          }}
                        >
                          ⚡ Potenciar
                        </button>
                      )}
                      {job.featured && (
                        <span className="chip bg-amber-50 text-amber-700">
                          ⭐ Destacada
                        </span>
                      )}
                      <button
                        className="text-gray-500 hover:text-primary font-medium disabled:opacity-50"
                        disabled={pending}
                        onClick={() => handleDuplicate(job)}
                      >
                        Duplicar
                      </button>
                      <button
                        className="text-gray-400 hover:text-danger font-medium disabled:opacity-50"
                        disabled={pending}
                        onClick={() => setConfirmDelete(job.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Consejos rotativos */}
      <section className="card p-5 bg-blue-50 border-blue-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-primary-dark">
            💡 Consejo para recibir más postulaciones
          </h3>
          <p className="text-sm text-gray-600 mt-1">{TIPS[tipIndex]}</p>
        </div>
        <button
          className="btn-secondary text-xs shrink-0"
          onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
        >
          Otro consejo →
        </button>
      </section>

      {/* Potenciar empleo */}
      {boosting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-up">
            {boostSent ? (
              <div className="text-center py-4 animate-pop">
                <p className="text-4xl mb-2">⚡</p>
                <p className="font-bold text-primary-dark">
                  ¡Solicitud registrada!
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {paymentLink
                    ? "Completá el pago con el botón de abajo. Apenas lo confirmemos, tu vacante aparece destacada arriba del feed."
                    : "Nuestro equipo te contacta para coordinar el pago. Apenas se confirme, tu vacante aparece destacada arriba del feed."}
                </p>
                {paymentLink && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full mt-4"
                  >
                    💳 Ir a pagar
                  </a>
                )}
                <button
                  className="btn-secondary w-full mt-2"
                  onClick={() => setBoosting(null)}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h4 className="font-semibold text-primary-dark">
                  ⚡ Potenciar &ldquo;{boosting.title}&rdquo;
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Tu vacante aparece <strong>destacada arriba del feed</strong>{" "}
                  con la etiqueta ⭐ y recibe en promedio 3 veces más vistas.
                </p>
                <div className="space-y-2 mt-4">
                  {BOOST_PLANS.map((p) => (
                    <button
                      key={p.plan}
                      disabled={pending}
                      onClick={() => handleBoost(p.plan, p.price_gs)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-sm"
                    >
                      <span className="font-medium text-gray-700">
                        {p.plan}
                      </span>
                      <span className="font-bold text-primary-dark">
                        Gs. {p.price_gs.toLocaleString("es-PY")}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  className="btn-secondary w-full mt-3"
                  onClick={() => setBoosting(null)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 animate-fade-up">
            <h4 className="font-semibold text-primary-dark">
              ¿Eliminar esta vacante?
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Se borra definitivamente junto con sus postulaciones. Si solo
              terminaste la búsqueda, usá &ldquo;Cerrar&rdquo;: conservás las
              métricas y podés duplicarla más adelante.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="btn bg-danger text-white hover:bg-red-600 flex-1"
                onClick={() => handleDelete(confirmDelete)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
