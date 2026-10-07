"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileSheet from "@/components/MobileSheet";
import { matchesJob, matchesExternalJob } from "@/lib/job-search";
import JobCard from "@/components/JobCard";
import ExternalJobCard from "@/components/ExternalJobCard";
import RecentJobs from "@/components/RecentJobs";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import type { ExternalJob, JobWithCompany, Modality } from "@/lib/types";

const MODALITIES: Modality[] = ["Presencial", "Híbrido", "Remoto"];

export default function JobFeed({
  jobs,
  appliedJobIds,
  savedJobIds = [],
  recommendedJobIds = [],
  matchScores = {},
  industries = INDUSTRIES,
  cities = CITIES,
  externalJobs = [],
}: {
  jobs: JobWithCompany[];
  appliedJobIds: string[];
  savedJobIds?: string[];
  recommendedJobIds?: string[];
  matchScores?: Record<string, number>;
  industries?: string[];
  cities?: string[];
  externalJobs?: ExternalJob[];
}) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const city = params.get("ciudad") ?? "";
  const industry = params.get("rubro") ?? "";
  const modality = params.get("modalidad") ?? "";
  const contract = params.get("contrato") ?? "";
  const firstJobOnly = params.get("primerEmpleo") === "1";
  const onlyVerified = params.get("verificadas") === "1";
  const withSalary = params.get("salario") === "1";
  const hideApplied = params.get("sinPostuladas") === "1";
  const sort = ["recientes", "urgentes"].includes(params.get("orden") ?? "") ? params.get("orden")! : "recomendadas";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  function updateFilter(key: string, value: string | boolean) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value === true ? "1" : String(value));
    else next.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
    setShareStatus("");
  }
  const setQuery = (value: string) => updateFilter("q", value);
  const setCity = (value: string) => updateFilter("ciudad", value);
  const setIndustry = (value: string) => updateFilter("rubro", value);
  const setModality = (value: string) => updateFilter("modalidad", value);
  const setContract = (value: string) => updateFilter("contrato", value);
  const setFirstJobOnly = (value: boolean) => updateFilter("primerEmpleo", value);
  const setOnlyVerified = (value: boolean) => updateFilter("verificadas", value);
  const setWithSalary = (value: boolean) => updateFilter("salario", value);
  const setHideApplied = (value: boolean) => updateFilter("sinPostuladas", value);

  async function shareSearch() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Enlace copiado. Podés compartir esta búsqueda.");
    } catch {
      setShareStatus("No pudimos copiar. Podés compartir la dirección de esta página.");
    }
  }

  const applied = useMemo(() => new Set(appliedJobIds), [appliedJobIds]);
  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);

  const filters = { query, city, industry, modality, contract, firstJobOnly, onlyVerified, withSalary, hideApplied };
  const filtered = jobs.filter((job) => matchesJob(job, filters, applied));
  const filteredExternal = externalJobs.filter((job) => matchesExternalJob(job, filters));
  const total = filtered.length + filteredExternal.length;
  const ordered = [...filtered].sort((a, b) =>
    (sort === "urgentes" ? Number(b.urgent) - Number(a.urgent) : 0) ||
    Date.parse(b.created_at) - Date.parse(a.created_at)
  );
  const orderedExternal = [...filteredExternal].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const alertParams = new URLSearchParams();
  if (query.trim()) alertParams.set("q", query.trim());
  if (city) alertParams.set("ciudad", city);
  if (industry) alertParams.set("rubro", industry);
  if (modality) alertParams.set("modalidad", modality);
  const alertHref = `/alertas${alertParams.size ? `?${alertParams}` : ""}`;

  const hasActiveFilter =
    query || city || industry || modality || contract || firstJobOnly || onlyVerified || withSalary || hideApplied;
  // "Para vos" solo se muestra sin filtros activos (es el punto de partida).
  const recommendedSet = new Set(hasActiveFilter || sort !== "recomendadas" ? [] : recommendedJobIds);
  const recommended = recommendedJobIds
    .map((id) => filtered.find((j) => j.id === id))
    .filter((j): j is JobWithCompany => !!j && recommendedSet.has(j.id));
  const featured = filtered.filter(
    (j) => sort === "recomendadas" && j.featured && !recommendedSet.has(j.id)
  );
  const rest = (sort === "recomendadas" ? filtered : ordered).filter(
    (j) => (sort !== "recomendadas" || !j.featured) && !recommendedSet.has(j.id)
  );
  const activeFilters =
    [city, industry, modality, contract].filter(Boolean).length +
    Number(firstJobOnly) +
    Number(onlyVerified) +
    Number(withSalary) + Number(hideApplied);

  function clearAll() {
    const next = new URLSearchParams(window.location.search);
    for (const key of ["q", "ciudad", "rubro", "modalidad", "contrato", "primerEmpleo", "verificadas", "salario", "sinPostuladas"]) next.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
    setShareStatus("");
  }

  // Cada filtro activo se muestra arriba y se quita tocándolo: así se ve de un
  // vistazo por qué aparecen pocas vacantes, sin tener que abrir la hoja.
  const activeChips: { label: string; clear: () => void }[] = [
    query ? { label: `“${query}”`, clear: () => setQuery("") } : null,
    hideApplied ? { label: "Sin postuladas", clear: () => setHideApplied(false) } : null,
    city ? { label: city, clear: () => setCity("") } : null,
    industry ? { label: industry, clear: () => setIndustry("") } : null,
    modality ? { label: modality, clear: () => setModality("") } : null,
    contract ? { label: contract, clear: () => setContract("") } : null,
    firstJobOnly
      ? { label: "Primer empleo", clear: () => setFirstJobOnly(false) }
      : null,
    onlyVerified
      ? { label: "Verificadas", clear: () => setOnlyVerified(false) }
      : null,
    withSalary
      ? { label: "Con salario", clear: () => setWithSalary(false) }
      : null,
  ].filter((c): c is { label: string; clear: () => void } => c !== null);

  const filterControls = (
    <>
      <div>
        <label className="label">Ciudad</label>
        <select
          className="input"
          aria-label="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Toda ciudad</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Rubro</label>
        <select
          className="input"
          aria-label="Rubro"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">Todo rubro</option>
          {industries.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Modalidad</label>
        <div className="flex flex-wrap gap-1.5">
          {MODALITIES.map((m) => (
            <button
              key={m}
              aria-pressed={modality === m}
              onClick={() => setModality(modality === m ? "" : m)}
              className={`chip min-h-9 px-3 border ${
                modality === m
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Tipo de contrato</label>
        <div className="flex flex-wrap gap-1.5">
          {["Tiempo completo", "Medio tiempo", "Por turnos", "Pasantía", "Freelance"].map((c) => (
            <button
              key={c}
              aria-pressed={contract === c}
              onClick={() => setContract(contract === c ? "" : c)}
              className={`chip min-h-9 px-3 border ${
                contract === c
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 pt-1">
        {[
          { checked: hideApplied, set: setHideApplied, label: "Ocultar mis postulaciones", hint: "Solo vacantes de Worka" },
          {
            checked: firstJobOnly,
            set: setFirstJobOnly,
            label: "✨ Modo primer empleo",
            hint: "Sin requisito de experiencia",
          },
          {
            checked: onlyVerified,
            set: setOnlyVerified,
            label: "✓ Solo empresas verificadas",
            hint: null,
          },
          {
            checked: withSalary,
            set: setWithSalary,
            label: "💰 Con salario visible",
            hint: null,
          },
        ].map((f) => (
          <label
            key={f.label}
            className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={f.checked}
              onChange={(e) => f.set(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span>
              {f.label}
              {f.hint && (
                <span className="block text-xs text-gray-400">{f.hint}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:items-start">
      {/* Filtros: sidebar fija en escritorio */}
      <aside className="hidden lg:block space-y-4 sticky top-20">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-primary-dark text-sm flex items-center justify-between">
            Filtros
            {activeFilters > 0 && (
              <button
                className="text-xs text-primary font-medium"
                onClick={clearAll}
              >
                Limpiar ({activeFilters})
              </button>
            )}
          </h2>
          {filterControls}
        </div>
        <div className="card p-4 space-y-1">
          <Link
            href="/test-perfil"
            className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-surface"
          >
            🎯 Test de perfil: afiná tu match
          </Link>
          <Link
            href="/salarios"
            className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-surface"
          >
            💰 ¿Cuánto se paga en tu rubro?
          </Link>
          <Link
            href="/juegos"
            className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-surface"
          >
            🎮 Worka Play: juegos y tips
          </Link>
          <Link
            href="/cv"
            className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-surface"
          >
            📄 Generar mi CV gratis
          </Link>
        </div>
      </aside>

      <div className="space-y-4">
        <div className="card p-5">
          <h1 className="text-xl lg:text-2xl font-bold text-primary-dark">Encontrá tu próximo empleo</h1>
          <p className="text-sm text-gray-500 mt-1">Buscá a tu ritmo: filtrá, guardá vacantes y recibí avisos de nuevas oportunidades.</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm font-medium text-primary">
            <Link href="/guardados">Mis guardadas</Link>
            <Link href="/postulaciones">Mis postulaciones</Link>
            <Link href="/alertas">Mis alertas</Link>
          </div>
        </div>
        {/* Buscador fijo + acceso a filtros. Antes los dos selectores y la
            fila de chips ocupaban un tercio de la pantalla antes de la primera
            vacante; ahora todo eso vive en una hoja y arriba solo quedan los
            filtros realmente activos. */}
        <div className="lg:hidden sticky top-[60px] z-20 -mx-4 px-4 py-2 bg-surface/95 backdrop-blur space-y-2">
          <div className="flex gap-2">
            <input
              type="search"
              aria-label="Buscar empleos"
              className="input bg-white flex-1"
              placeholder="Buscar puesto, empresa o rubro…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Filtros"
              aria-expanded={sheetOpen}
              className="btn-secondary press shrink-0 relative px-4"
            >
              <SlidersHorizontal size={18} />
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center animate-pop">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {activeChips.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto scroll-thin pb-0.5">
              {activeChips.map((c) => (
                <button
                  key={c.label}
                  aria-label={`Quitar filtro ${c.label}`}
                  onClick={c.clear}
                  className="chip min-h-8 px-3 shrink-0 bg-primary text-white press animate-pop"
                >
                  {c.label} <X size={12} />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="chip min-h-8 px-3 shrink-0 bg-white text-gray-500 border border-gray-200 press"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Buscador de escritorio (en celular vive en la barra fija de arriba) */}
        <input
          type="search"
              aria-label="Buscar empleos"
          className="input bg-white hidden lg:block"
          placeholder="Buscar puesto, empresa o rubro…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <RecentJobs />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-gray-600">
            {total} {total === 1 ? "vacante encontrada" : "vacantes encontradas"}
            <span className="block text-xs text-gray-500">{filtered.length} en Worka · {filteredExternal.length} de otras fuentes</span>
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Ordenar
            <select aria-label="Ordenar vacantes" className="input w-auto" value={sort} onChange={(e) => updateFilter("orden", e.target.value === "recomendadas" ? "" : e.target.value)}>
              <option value="recomendadas">Para vos y destacadas</option>
              <option value="recientes">Más recientes</option>
              <option value="urgentes">Urgentes primero</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={alertHref} className="btn-secondary">Crear alerta de búsqueda</Link>
          <button className="btn-secondary" onClick={shareSearch}>Copiar búsqueda</button>
        </div>
        {(contract || firstJobOnly || onlyVerified || withSalary || hideApplied) && (
          <p className="text-xs text-gray-500">La alerta usará el puesto, ciudad, rubro y modalidad. Los demás filtros se conservan en el enlace de búsqueda.</p>
        )}
        {shareStatus && <p role="status" className="text-sm text-primary">{shareStatus}</p>}

        {total === 0 && (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2" aria-hidden>🔍</p>
            <h2 className="font-semibold text-primary-dark">No encontramos vacantes con esta búsqueda</h2>
            <p className="text-sm text-gray-500 mt-1">Probá otro puesto o ampliá la ciudad. También podés crear una alerta para recibir novedades.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button className="btn-primary" onClick={clearAll}>Ver todas las vacantes</button>
              <Link href={alertHref} className="btn-secondary">Avisarme de nuevas vacantes</Link>
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              ✨ Para vos
            </h2>
            <p className="text-xs text-gray-400 -mt-2">
              Según tus rubros, tu ciudad y tu perfil.{" "}
              <Link href="/test-perfil" className="text-primary font-medium">
                Afinalo con el test 🎯
              </Link>
            </p>
            <div className="grid gap-3 xl:grid-cols-2 stagger">
              {recommended.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  alreadyApplied={applied.has(job.id)}
                  initiallySaved={savedSet.has(job.id)}
                  matchPercent={matchScores[job.id]}
                />
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              ⭐ Destacadas
            </h2>
            <div className="grid gap-3 xl:grid-cols-2 stagger">
              {featured.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  alreadyApplied={applied.has(job.id)}
                  initiallySaved={savedSet.has(job.id)}
                />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="space-y-3">
            {featured.length > 0 && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Recientes
              </h2>
            )}
            <div className="grid gap-3 xl:grid-cols-2 stagger">
              {rest.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  alreadyApplied={applied.has(job.id)}
                  initiallySaved={savedSet.has(job.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Vacantes de otras fuentes. Van al final y separadas a propósito:
            las de Worka (empresas verificadas) tienen prioridad. */}
        {filteredExternal.length > 0 && (
          <section className="space-y-3 pt-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Otras vacantes de la zona
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Avisos de otras fuentes. Estas empresas no están verificadas por
                Worka.
              </p>
            </div>
            <div className="grid gap-3 xl:grid-cols-2 stagger">
              {orderedExternal.map((job) => (
                <ExternalJobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Hoja de filtros (solo celular). El escritorio los tiene siempre a la
          vista en la barra lateral. */}
      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} label="Filtros" className="overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0 border-b border-gray-100">
          <h2 className="font-bold text-primary-dark">Filtros</h2>
          <button
            onClick={() => setSheetOpen(false)}
            aria-label="Cerrar"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 press"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4">{filterControls}</div>

        <div className="shrink-0 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
          <button
            onClick={clearAll}
            disabled={activeFilters === 0}
            className="btn-secondary press flex-1 disabled:opacity-40"
          >
            Limpiar
          </button>
          <button
            onClick={() => setSheetOpen(false)}
            className="btn-primary press flex-[2]"
          >
            Ver {filtered.length + filteredExternal.length}{" "}
            {filtered.length + filteredExternal.length === 1
              ? "vacante"
              : "vacantes"}
          </button>
        </div>
      </MobileSheet>
    </div>
  );
}
