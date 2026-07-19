"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import type { JobWithCompany, Modality } from "@/lib/types";

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
}) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [industry, setIndustry] = useState(initialIndustry);
  const [modality, setModality] = useState("");
  const [firstJobOnly, setFirstJobOnly] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [withSalary, setWithSalary] = useState(false);

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
      if (
        query &&
        !`${job.title} ${job.company.trade_name} ${job.industry}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [jobs, query, city, industry, modality, firstJobOnly, onlyVerified, withSalary]);

  const hasActiveFilter =
    query || city || industry || modality || firstJobOnly || onlyVerified || withSalary;
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
    [city, industry, modality].filter(Boolean).length +
    Number(firstJobOnly) +
    Number(onlyVerified) +
    Number(withSalary);

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
                onClick={() => {
                  setCity("");
                  setIndustry("");
                  setModality("");
                  setFirstJobOnly(false);
                  setOnlyVerified(false);
                  setWithSalary(false);
                }}
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
        {/* Búsqueda + filtros compactos en móvil */}
        <div className="space-y-2">
          <input
            type="search"
            className="input bg-white"
            placeholder="Buscar puesto, empresa o rubro…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2 lg:hidden">
            <select
              className="input flex-1"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Toda ciudad</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className="input flex-1"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Todo rubro</option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="lg:hidden flex gap-2 overflow-x-auto scroll-thin pb-1">
            <button
              onClick={() => setFirstJobOnly((v) => !v)}
              className={`chip min-h-9 px-4 shrink-0 ${
                firstJobOnly
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-700 border border-purple-200"
              }`}
            >
              ✨ Primer empleo {firstJobOnly ? "✓" : ""}
            </button>
            <Link
              href="/salarios"
              className="chip min-h-9 px-4 shrink-0 bg-white text-gray-600 border border-gray-200"
            >
              💰 Salarios
            </Link>
            <Link
              href="/juegos"
              className="chip min-h-9 px-4 shrink-0 bg-white text-gray-600 border border-gray-200"
            >
              🎮 Worka Play
            </Link>
          </div>
        </div>

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
            <div className="grid gap-3 xl:grid-cols-2">
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
            <div className="grid gap-3 xl:grid-cols-2">
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
            <div className="grid gap-3 xl:grid-cols-2">
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
      </div>
    </div>
  );
}
