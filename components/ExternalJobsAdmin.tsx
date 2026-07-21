"use client";

import { useState, useTransition } from "react";
import type { ExternalJob, JobSource } from "@/lib/types";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import {
  deleteExternalJob,
  deleteJobSource,
  runImport,
  saveExternalJob,
  saveJobSource,
  setExternalJobsEnabled,
} from "@/app/actions";

const EMPTY_SOURCE = {
  id: undefined as string | undefined,
  name: "",
  kind: "serpapi" as "auto" | "feed" | "html" | "serpapi",
  url: "",
  enabled: true,
  expire_days: 30,
  max_age_hours: 24,
  sel_item: "",
  sel_title: "",
  sel_company: "",
  sel_city: "",
  sel_link: "",
  sel_description: "",
  default_city: "",
  default_industry: "",
};

const EMPTY_JOB = {
  id: undefined as string | undefined,
  title: "",
  company_name: "",
  company_logo_url: "",
  description: "",
  city: "",
  industry: "",
  salary_range: "",
  apply_email: "",
  apply_url: "",
  source_name: "",
  source_url: "",
  status: "activa" as "activa" | "oculta",
};

export default function ExternalJobsAdmin({
  enabled: initialEnabled,
  sources: initialSources,
  jobs: initialJobs,
}: {
  enabled: boolean;
  sources: JobSource[];
  jobs: ExternalJob[];
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [sources, setSources] = useState(initialSources);
  const [jobs, setJobs] = useState(initialJobs);
  const [sourceDraft, setSourceDraft] = useState({ ...EMPTY_SOURCE });
  const [jobDraft, setJobDraft] = useState({ ...EMPTY_JOB });
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(msg: string) {
    setNotice(msg);
    setError(null);
    setTimeout(() => setNotice(null), 5000);
  }

  function toggleGlobal(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const r = await setExternalJobsEnabled(next);
      if (!r.ok) {
        setEnabled(!next);
        setError(r.error ?? "No pudimos cambiar el interruptor.");
      } else {
        flash(
          next
            ? "✅ Vacantes externas activadas: ya aparecen en el feed."
            : "⏸️ Vacantes externas apagadas: desaparecieron del feed."
        );
      }
    });
  }

  function saveSource() {
    setError(null);
    startTransition(async () => {
      const r = await saveJobSource(sourceDraft);
      if (!r.ok) return setError(r.error ?? "No pudimos guardar.");
      flash("💾 Fuente guardada. Tocá «Importar» para traer las vacantes.");
      setShowSourceForm(false);
      setSourceDraft({ ...EMPTY_SOURCE });
      location.reload();
    });
  }

  function importNow(source: JobSource) {
    setError(null);
    startTransition(async () => {
      const r = await runImport(source.id);
      if (!r.ok) return setError(r.error ?? "Falló la importación.");
      flash(
        `✅ Importadas ${r.count} vacantes de ${source.name}${
          r.method ? ` — método: ${r.method}` : ""
        }.`
      );
      location.reload();
    });
  }

  function removeSource(id: string) {
    setSources((s) => s.filter((x) => x.id !== id));
    startTransition(() => {
      deleteJobSource(id);
    });
  }

  function saveJob() {
    setError(null);
    startTransition(async () => {
      const r = await saveExternalJob(jobDraft);
      if (!r.ok) return setError(r.error ?? "No pudimos guardar.");
      flash("💾 Vacante guardada.");
      setShowJobForm(false);
      setJobDraft({ ...EMPTY_JOB });
      location.reload();
    });
  }

  function removeJob(id: string) {
    setJobs((j) => j.filter((x) => x.id !== id));
    startTransition(() => {
      deleteExternalJob(id);
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {notice && (
        <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="card px-5 py-3 bg-red-50 border-red-100 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Interruptor general */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-primary-dark">
            Vacantes externas {enabled ? "activadas" : "apagadas"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cuando lo apagás, ninguna vacante externa se muestra en el sitio.
            Los datos quedan guardados: al reactivarlo vuelven a aparecer.
          </p>
        </div>
        <button
          onClick={() => toggleGlobal(!enabled)}
          disabled={pending}
          className={enabled ? "btn-danger-outline" : "btn-success"}
        >
          {enabled ? "Apagar" : "Activar"}
        </button>
      </div>

      {/* Aviso legal */}
      <div className="card p-5 bg-amber-50 border-amber-100">
        <p className="text-sm text-amber-900 leading-relaxed">
          <b>Antes de agregar una fuente:</b> importar avisos de otro portal
          suele estar prohibido por sus términos de uso, y el texto de cada
          aviso tiene derechos de su autor. Usá esto con fuentes que te dieron
          permiso, con feeds públicos pensados para ser distribuidos, o con las
          webs de las propias empresas. Worka guarda solo un resumen y siempre
          enlaza al aviso original.
        </p>
      </div>

      {/* Fuentes */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-primary-dark">
            Fuentes automáticas ({sources.length})
          </h2>
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              setSourceDraft({ ...EMPTY_SOURCE });
              setShowSourceForm((v) => !v);
            }}
          >
            {showSourceForm ? "Cancelar" : "➕ Nueva fuente"}
          </button>
        </div>

        {showSourceForm && (
          <div className="border border-gray-100 rounded-2xl p-4 mb-4 space-y-3 bg-surface">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre de la fuente</label>
                <input
                  className="input"
                  placeholder="Ej: Bolsa de empleo X"
                  value={sourceDraft.name}
                  onChange={(e) =>
                    setSourceDraft((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select
                  className="input"
                  value={sourceDraft.kind}
                  onChange={(e) =>
                    setSourceDraft((s) => ({
                      ...s,
                      kind: e.target.value as
                        | "auto"
                        | "feed"
                        | "html"
                        | "serpapi",
                    }))
                  }
                >
                  <option value="serpapi">
                    🤖 Agente Google Jobs (LinkedIn y más · recomendado)
                  </option>
                  <option value="auto">Automático por link (JSON-LD/feed)</option>
                  <option value="feed">Feed XML / RSS puntual</option>
                  <option value="html">Manual, por selectores CSS</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">
                {sourceDraft.kind === "serpapi"
                  ? "Qué buscar"
                  : "URL"}
              </label>
              <input
                className="input"
                placeholder={
                  sourceDraft.kind === "serpapi"
                    ? "Ej: ventas, cajero, administrativo…"
                    : "https://… (la página que lista los empleos)"
                }
                value={sourceDraft.url}
                onChange={(e) =>
                  setSourceDraft((s) => ({ ...s, url: e.target.value }))
                }
              />
              {sourceDraft.kind === "serpapi" && (
                <p className="text-xs text-gray-500 mt-1">
                  El agente busca eso en Google Jobs (incluye avisos de
                  LinkedIn, Computrabajo, etc.), limitado a Paraguay. Creá una
                  fuente por rubro para cubrir más. Necesita la variable{" "}
                  <b>SERPAPI_KEY</b> cargada en Vercel.
                </p>
              )}
              {sourceDraft.kind === "auto" && (
                <p className="text-xs text-gray-500 mt-1">
                  Detecta solo de dónde sacar los avisos: primero busca datos
                  estructurados (JSON-LD), después un feed RSS, después el
                  sitemap, y como último recurso los enlaces de la página.
                </p>
              )}
            </div>

            {sourceDraft.kind === "serpapi" && (
              <div>
                <label className="label">Traer avisos publicados en…</label>
                <select
                  className="input"
                  value={sourceDraft.max_age_hours}
                  onChange={(e) =>
                    setSourceDraft((s) => ({
                      ...s,
                      max_age_hours: Number(e.target.value),
                    }))
                  }
                >
                  <option value={24}>Las últimas 24 horas</option>
                  <option value={72}>Los últimos 3 días</option>
                  <option value={168}>La última semana</option>
                </select>
              </div>
            )}

            {sourceDraft.kind === "html" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-gray-500">
                  Selectores CSS. Abrí la página, inspeccioná un aviso y copiá
                  las clases. Solo el bloque y el título son obligatorios.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      ["sel_item", "Bloque de cada aviso *", ".job-card"],
                      ["sel_title", "Título *", "h2"],
                      ["sel_company", "Empresa", ".company"],
                      ["sel_city", "Ciudad", ".location"],
                      ["sel_link", "Link", "a"],
                      ["sel_description", "Descripción", ".summary"],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        className="input"
                        placeholder={ph}
                        value={sourceDraft[key]}
                        onChange={(e) =>
                          setSourceDraft((s) => ({
                            ...s,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Ciudad por defecto</label>
                <select
                  className="input"
                  value={sourceDraft.default_city}
                  onChange={(e) =>
                    setSourceDraft((s) => ({
                      ...s,
                      default_city: e.target.value,
                    }))
                  }
                >
                  <option value="">Sin definir</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Rubro por defecto</label>
                <select
                  className="input"
                  value={sourceDraft.default_industry}
                  onChange={(e) =>
                    setSourceDraft((s) => ({
                      ...s,
                      default_industry: e.target.value,
                    }))
                  }
                >
                  <option value="">Sin definir</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Los avisos caducan a los…</label>
                <select
                  className="input"
                  value={sourceDraft.expire_days}
                  onChange={(e) =>
                    setSourceDraft((s) => ({
                      ...s,
                      expire_days: Number(e.target.value),
                    }))
                  }
                >
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={pending}
                onClick={saveSource}
              >
                {pending ? "Guardando…" : "Guardar fuente"}
              </button>
            </div>
          </div>
        )}

        {sources.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Todavía no configuraste ninguna fuente.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sources.map((s) => (
              <div
                key={s.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary-dark truncate">
                    {s.name}{" "}
                    <span className="chip bg-surface text-gray-500 ml-1">
                      {s.kind === "feed" ? "feed" : "html"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 truncate">{s.url}</p>
                  {s.last_run_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Última corrida: {s.last_result}
                      {s.last_method ? ` · ${s.last_method}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    className="btn-secondary text-xs"
                    disabled={pending}
                    onClick={() => importNow(s)}
                  >
                    ⬇️ Importar
                  </button>
                  <button
                    className="text-sm text-gray-400 hover:text-danger"
                    onClick={() => removeSource(s.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Carga manual */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-primary-dark">
              Vacantes externas ({jobs.length})
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Cargá una a mano para una empresa que no está registrada en Worka.
            </p>
          </div>
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              setJobDraft({ ...EMPTY_JOB });
              setShowJobForm((v) => !v);
            }}
          >
            {showJobForm ? "Cancelar" : "➕ Cargar vacante"}
          </button>
        </div>

        {showJobForm && (
          <div className="border border-gray-100 rounded-2xl p-4 mb-4 space-y-3 bg-surface">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Puesto *</label>
                <input
                  className="input"
                  placeholder="Ej: Cajero/a"
                  value={jobDraft.title}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Empresa *</label>
                <input
                  className="input"
                  placeholder="Nombre de la empresa"
                  value={jobDraft.company_name}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, company_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <select
                  className="input"
                  value={jobDraft.city}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, city: e.target.value }))
                  }
                >
                  <option value="">Sin definir</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Rubro</label>
                <select
                  className="input"
                  value={jobDraft.industry}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, industry: e.target.value }))
                  }
                >
                  <option value="">Sin definir</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Salario (opcional)</label>
                <input
                  className="input"
                  placeholder="Ej: 2.800.000 Gs"
                  value={jobDraft.salary_range}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, salary_range: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Logo de la empresa (URL)</label>
                <input
                  className="input"
                  placeholder="https://…"
                  value={jobDraft.company_logo_url}
                  onChange={(e) =>
                    setJobDraft((j) => ({
                      ...j,
                      company_logo_url: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea
                className="input min-h-24"
                value={jobDraft.description}
                onChange={(e) =>
                  setJobDraft((j) => ({ ...j, description: e.target.value }))
                }
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Correo para postularse</label>
                <input
                  className="input"
                  placeholder="rrhh@empresa.com.py"
                  value={jobDraft.apply_email}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, apply_email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">o Link del aviso original</label>
                <input
                  className="input"
                  placeholder="https://…"
                  value={jobDraft.apply_url}
                  onChange={(e) =>
                    setJobDraft((j) => ({ ...j, apply_url: e.target.value }))
                  }
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Hace falta al menos uno de los dos. Solo se le muestra a quien ya
              tiene cuenta en Worka.
            </p>
            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={pending}
                onClick={saveJob}
              >
                {pending ? "Guardando…" : "Guardar vacante"}
              </button>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No hay vacantes externas cargadas.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {jobs.map((j) => (
              <div
                key={j.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary-dark truncate">
                    {j.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {j.company_name}
                    {j.city ? ` · ${j.city}` : ""} · vía {j.source_name}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`chip ${
                      j.status === "activa"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {j.status}
                  </span>
                  <button
                    className="text-sm text-gray-400 hover:text-danger"
                    onClick={() => removeJob(j.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
