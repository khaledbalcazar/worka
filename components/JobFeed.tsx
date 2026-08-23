"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
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
  initialQuery = "",
  initialCity = "",
  initialIndustry = "",
  initialModality = "",
  initialContract = "",
  initialFirstJob = false,
  externalJobs = [],
}: {
  jobs: JobWithCompany[];
  appliedJobIds: string[];
  savedJobIds?: string[];
  recommendedJobIds?: string[];
  matchScores?: Record<string, number>;
  industries?: string[];
  cities?: string[];
  initialQuery?: string;
  initialCity?: string;
  initialIndustry?: string;
  initialModality?: string;
  initialContract?: string;
  initialFirstJob?: boolean;
  externalJobs?: ExternalJob[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [industry, setIndustry] = useState(initialIndustry);
  const [modality, setModality] = useState(initialModality);
  const [contract, setContract] = useState(initialContract);
  const [firstJobOnly, setFirstJobOnly] = useState(initialFirstJob);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [withSalary, setWithSalary] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Con la hoja abierta el fondo no debe correrse al arrastrar.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  const applied = useMemo(() => new Set(appliedJobIds), [appliedJobIds]);
  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (firstJobOnly && job.requires_experience) return false;
      if (onlyVerified && !job.company.is_verified) return false;
      if (withSalary && !job.salary_range) return false;
      if (city && job.company.location_city !== city) return false;
      if (industry && job.industry !== industry) return false;
      if (modality && job.modality !== modality) return false;
      if (contract && job.contract_type !== contract) return false;
      if (
        query &&
        !`${job.title} ${job.company.trade_name} ${job.industry}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [jobs, query, city, industry, modality, contract, firstJobOnly, onlyVerified, withSalary]);

  // Las externas solo respetan los filtros que realmente tienen datos.
  // Si el usuario pide "solo verificadas", desaparecen (no lo están).
  const filteredExternal = useMemo(() => {
    if (onlyVerified) return [];
    return externalJobs.filter((job) => {
      if (city && job.city !== city) return false;
      if (industry && job.industry !== industry) return false;
      if (withSalary && !job.salary_range) return false;
      if (
        query &&
        !`${job.title} ${job.company_name} ${job.industry ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [externalJobs, query, city, industry, onlyVerified, withSalary]);

  const hasActiveFilter =
    query || city || industry || modality || contract || firstJobOnly || onlyVerified || withSalary;
  // "Para vos" solo se muestra sin filtros activos (es el punto de partida).
  const recommendedSet = new Set(hasActiveFilter ? [] : recommendedJobIds);
  const recommended = recommendedJobIds
    .map((id) => filtered.find((j) => j.id === id))
    .filter((j): j is JobWithCompany => !!j && recommendedSet.has(j.id));
  const featured = filtered.filter(
    (j) => j.featured && !recommendedSet.has(j.id)
  );
  const rest = filtered.filter(
    (j) => !j.featured && !recommendedSet.has(j.id)
  );
  const activeFilters =
    [city, industry, modality, contract].filter(Boolean).length +
    Number(firstJobOnly) +
    Number(onlyVerified) +
    Number(withSalary);

  function clearAll() {
    setCity("");
    setIndustry("");
    setModality("");
    setContract("");
    setFirstJobOnly(false);
    setOnlyVerified(false);
    setWithSalary(false);
  }

  // Cada filtro activo se muestra arriba y se quita tocándolo: así se ve de un
  // vistazo por qué aparecen pocas vacantes, sin tener que abrir la hoja.
  const activeChips: { label: string; clear: () => void }[] = [
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
          {["Tiempo completo", "Medio tiempo", "Por turnos"].map((c) => (
            <button
              key={c}
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
        {/* Buscador fijo + acceso a filtros. Antes los dos selectores y la
            fila de chips ocupaban un tercio de la pantalla antes de la primera
            vacante; ahora todo eso vive en una hoja y arriba solo quedan los
            filtros realmente activos. */}
        <div className="lg:hidden sticky top-[60px] z-20 -mx-4 px-4 py-2 bg-surface/95 backdrop-blur space-y-2">
          <div className="flex gap-2">
            <input
              type="search"
              className="input bg-white flex-1"
              placeholder="Buscar puesto, empresa o rubro…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Filtros"
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

          {activeFilters > 0 && (
            <div className="flex gap-1.5 overflow-x-auto scroll-thin pb-0.5">
              {activeChips.map((c) => (
                <button
                  key={c.label}
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
          className="input bg-white hidden lg:block"
          placeholder="Buscar puesto, empresa o rubro…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <RecentJobs />

        <p className="text-sm text-gray-500">
          {filtered.length === 1
            ? "1 vacante encontrada"
            : `${filtered.length} vacantes encontradas`}
        </p>

        {filtered.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold text-primary-dark">
              No encontramos vacantes con esos filtros
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Probá quitar algún filtro o activá las alertas por WhatsApp en tu
              perfil para avisarte cuando haya algo nuevo.
            </p>
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
              {filteredExternal.map((job) => (
                <ExternalJobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Hoja de filtros (solo celular). El escritorio los tiene siempre a la
          vista en la barra lateral. */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setSheetOpen(false)}
          aria-hidden
        />
      )}
      <div
        role="dialog"
        aria-label="Filtros"
        aria-hidden={!sheetOpen}
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl transition-transform duration-200 ease-out max-h-[88vh] flex flex-col ${
          sheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
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
      </div>
    </div>
  );
}
