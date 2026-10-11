"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, SlidersHorizontal, X, Bell, GraduationCap, Wallet, BadgeCheck, List, Map as MapIcon, ChevronDown } from "lucide-react";
import type { ExternalJob, JobWithCompany } from "@/lib/types";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import { matchesJob, matchesExternalJob } from "@/lib/job-search";
import { isJobFeatured } from "@/lib/job-visibility";
import MobileSheet from "@/components/MobileSheet";
import ExternalJobRow from "@/components/jobs/ExternalJobRow";
import JobResultCard from "@/components/jobs/JobResultCard";
import JobPreview from "@/components/jobs/JobPreview";
import type { MatchCandidate } from "@/lib/job-match";

// Leaflet usa window: el mapa se carga solo en el navegador y solo si se pide.
const JobMap = dynamic(() => import("@/components/jobs/JobMap"), {
  ssr: false,
  loading: () => <div className="job-map-loading">Cargando mapa…</div>,
});

export default function JobFeed({ jobs, appliedJobIds, savedJobIds = [], evaluationJobIds = [], industries = INDUSTRIES, cities = CITIES, externalJobs = [], loggedIn = true, matchProfile = null, regionName = "tu país" }: {
  jobs: JobWithCompany[]; appliedJobIds: string[]; savedJobIds?: string[]; evaluationJobIds?: string[];
  industries?: string[]; cities?: string[]; externalJobs?: ExternalJob[]; loggedIn?: boolean; matchProfile?: MatchCandidate | null; regionName?: string;
}) {
  const params = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedChanges, setSavedChanges] = useState<Record<string, boolean>>({});
  const [newApplications, setNewApplications] = useState<string[]>([]);
  const [limit, setLimit] = useState(12);
  const query = params.get("q") ?? "";
  const city = params.get("ciudad") ?? "";
  const industry = params.get("rubro") ?? "";
  const modality = params.get("modalidad") ?? "";
  const contract = params.get("contrato") ?? "";
  const firstJobOnly = params.get("primerEmpleo") === "1";
  const onlyVerified = params.get("verificadas") === "1";
  const withSalary = params.get("salario") === "1";
  const hideApplied = params.get("sinPostuladas") === "1";
  const sort = params.get("orden") === "urgentes" ? "urgentes" : "recientes";
  const view = params.get("vista") === "mapa" ? "mapa" : "lista";
  const applied = new Set([...appliedJobIds, ...newApplications]);
  const isSaved = (id: string) => savedChanges[id] ?? savedJobIds.includes(id);
  const filters = { query, city, industry, modality, contract, firstJobOnly, onlyVerified, withSalary, hideApplied };
  // Las destacadas (destaque pago vigente) van arriba; después, el orden elegido.
  const filtered = jobs.filter((job) => matchesJob(job, filters, applied)).sort((a, b) =>
    (sort === "urgentes" ? Number(b.urgent) - Number(a.urgent) : 0) ||
    Number(isJobFeatured(b)) - Number(isJobFeatured(a)) ||
    Date.parse(b.created_at) - Date.parse(a.created_at));
  const external = externalJobs.filter((job) => matchesExternalJob(job, filters)).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const total = filtered.length + external.length;
  const shownJobs = filtered.slice(0, limit);
  const shownExternal = external.slice(0, Math.max(0, limit - shownJobs.length));
  const selected = filtered.find((job) => job.id === selectedId) ?? filtered[0];
  const filterKeys = ["ciudad", "rubro", "modalidad", "contrato", "primerEmpleo", "verificadas", "salario", "sinPostuladas"];
  const activeCount = filterKeys.filter((key) => params.get(key)).length;
  const alertSupported = !contract && !firstJobOnly && !onlyVerified && !withSalary && !hideApplied;
  const alertParams = new URLSearchParams();
  for (const key of ["q", "ciudad", "rubro", "modalidad"]) if (params.get(key)?.trim()) alertParams.set(key, params.get(key)!.trim());
  const alertHref = `/alertas${alertParams.size ? `?${alertParams}` : ""}`;

  function update(key: string, value: string | boolean) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value === true ? "1" : value); else next.delete(key);
    window.history.replaceState(null, "", `/empleos${next.size ? `?${next}` : ""}`);
    setLimit(12);
  }
  // Limpiar filtros no cambia entre lista y mapa.
  function reset() { window.history.replaceState(null, "", view === "mapa" ? "/empleos?vista=mapa" : "/empleos"); setLimit(12); }
  const sharedJobProps = (job: JobWithCompany) => ({
    job, loggedIn, matchProfile, requiresEvaluation: evaluationJobIds.includes(job.id), saved: isSaved(job.id), applied: applied.has(job.id),
    onSaved: (value: boolean) => setSavedChanges((current) => ({ ...current, [job.id]: value })),
    onApplied: () => setNewApplications((current) => [...current, job.id]),
  });

  const heading = `${query.trim() ? `Empleos de “${query.trim()}”` : industry ? `Empleos de ${industry}` : "Empleos"} en ${city || regionName}`;
  const resultsHead = <div className="li-results-head">
    <div className="min-w-0">
      <h2>{heading}</h2>
      <p role="status">{total} {total === 1 ? "resultado" : "resultados"}{external.length > 0 && ` · ${filtered.length} en Worka`}</p>
    </div>
    <div className="li-results-actions">
      <div className="li-view-toggle" role="group" aria-label="Ver resultados como">
        <button aria-pressed={view === "lista"} onClick={() => update("vista", "")}><List size={15} /> Lista</button>
        <button aria-pressed={view === "mapa"} onClick={() => update("vista", "mapa")}><MapIcon size={15} /> Mapa</button>
      </div>
      {view === "lista" && <label className="li-sort"><span className="sr-only">Ordenar vacantes</span><select value={sort} onChange={(e) => update("orden", e.target.value)}><option value="recientes">Más recientes</option><option value="urgentes">Urgentes primero</option></select></label>}
    </div>
  </div>;

  return <div className="li-jobs">
    <h1 className="sr-only">Buscar empleos</h1>
    <div className="li-searchband">
      <div className="li-searchband-inner">
        <div className="li-search">
          <label className="li-field"><Search size={18} /><span className="sr-only">Cargo, empresa o rubro</span><input type="search" enterKeyHint="search" value={query} onChange={(e) => update("q", e.target.value)} placeholder="Cargo, empresa o rubro" /></label>
          <label className="li-field"><MapPin size={18} /><span className="sr-only">Ciudad</span><select value={city} onChange={(e) => update("ciudad", e.target.value)}><option value="">Todas las ciudades</option>{[...new Set([...cities, ...(city ? [city] : [])])].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="li-pills" aria-label="Filtros">
          <PillSelect label="Ciudad" value={city} options={cities} onChange={(v) => update("ciudad", v)} className="is-mobile" />
          <PillSelect label="Modalidad" value={modality} options={["Presencial", "Híbrido", "Remoto"]} onChange={(v) => update("modalidad", v)} />
          <PillSelect label="Jornada" value={contract} options={["Tiempo completo", "Medio tiempo", "Por turnos", "Pasantía", "Freelance"]} onChange={(v) => update("contrato", v)} />
          <PillSelect label="Rubro" value={industry} options={industries} onChange={(v) => update("rubro", v)} />
          <button className="li-pill" aria-pressed={firstJobOnly} onClick={() => update("primerEmpleo", !firstJobOnly)}><GraduationCap size={15} /> Sin experiencia</button>
          <button className="li-pill" aria-pressed={withSalary} onClick={() => update("salario", !withSalary)}><Wallet size={14} /> Con salario</button>
          <button className="li-pill" aria-pressed={onlyVerified} onClick={() => update("verificadas", !onlyVerified)}><BadgeCheck size={15} /> Verificadas</button>
          <span className="li-pills-divider" aria-hidden />
          <button className="li-pill is-plain" onClick={() => setFilterOpen(true)} aria-expanded={filterOpen}><SlidersHorizontal size={15} /> Todos los filtros{activeCount > 0 && <b>{activeCount}</b>}</button>
          {(activeCount > 0 || query) && <button className="li-pill is-link" onClick={reset}>Restablecer</button>}
        </div>
      </div>
    </div>

    {total === 0 ? <>{resultsHead}<div className="job-empty"><Search size={32} /><h2>No hay resultados con estos filtros</h2><p>Probá otro cargo o ampliá la ciudad para ver más oportunidades.</p><div className="flex flex-wrap gap-2 justify-center"><button className="btn-primary" onClick={reset}>Ver todas las vacantes</button>{alertSupported && <Link href={alertHref} className="btn-secondary"><Bell size={15} /> Avisarme cuando haya</Link>}</div></div></> :
      view === "mapa" ? <>{resultsHead}<JobMap jobs={filtered} homeCity={matchProfile?.location_city ?? null} country={jobs[0]?.company.country ?? "py"} /></> :
      <div className={`li-split ${!selected ? "is-single" : ""}`}>
        <section className="li-list" aria-label="Resultados de empleo">
          {resultsHead}
          {alertSupported && <Link href={alertHref} className="li-alert-row"><Bell size={16} /><span><strong>Crear alerta para esta búsqueda</strong><small>Te avisamos cuando aparezcan vacantes nuevas.</small></span></Link>}
          <ul className="li-items">
            {shownJobs.map((job) => <JobResultCard key={job.id} {...sharedJobProps(job)} selected={selected?.id === job.id} onSelect={() => setSelectedId(job.id)} />)}
            {shownExternal.length > 0 && <li className="li-divider"><strong>De otros portales</strong><span>La postulación y el seguimiento se hacen fuera de Worka.</span></li>}
            {shownExternal.map((job) => <ExternalJobRow key={job.id} job={job} />)}
          </ul>
          {limit < total && <div className="li-more"><button className="btn-secondary w-full" onClick={() => setLimit((current) => current + 12)}>Ver más empleos ({total - limit})</button></div>}
        </section>
        {selected && <div className="li-detail"><JobPreview key={selected.id} {...sharedJobProps(selected)} /></div>}
      </div>}

    <MobileSheet desktop open={filterOpen} onClose={() => setFilterOpen(false)} label="Filtros de empleo" className="p-5 overflow-y-auto">
      <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-semibold">Todos los filtros</h2><button className="job-save" aria-label="Cerrar filtros" onClick={() => setFilterOpen(false)}><X size={20} /></button></div>
      <div className="space-y-4">
        <label className="block"><span className="label">Ciudad</span><select className="input" value={city} onChange={(e) => update("ciudad", e.target.value)}><option value="">Todas las ciudades</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Rubro</span><select className="input" value={industry} onChange={(e) => update("rubro", e.target.value)}><option value="">Todos los rubros</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Modalidad</span><select className="input" value={modality} onChange={(e) => update("modalidad", e.target.value)}><option value="">Cualquier modalidad</option>{["Presencial", "Híbrido", "Remoto"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Jornada laboral</span><select className="input" value={contract} onChange={(e) => update("contrato", e.target.value)}><option value="">Cualquier jornada</option>{["Tiempo completo", "Medio tiempo", "Por turnos", "Pasantía", "Freelance"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Ordenar por</span><select className="input" value={sort} onChange={(e) => update("orden", e.target.value)}><option value="recientes">Más recientes</option><option value="urgentes">Urgentes primero</option></select></label>
        {[{ key: "primerEmpleo", value: firstJobOnly, label: "Sin experiencia previa" }, { key: "salario", value: withSalary, label: "Con salario visible" }, { key: "verificadas", value: onlyVerified, label: "Solo empresas verificadas" }, ...(loggedIn ? [{ key: "sinPostuladas", value: hideApplied, label: "Ocultar mis postulaciones" }] : [])].map((filter) => <label key={filter.key} className="filter-check"><input type="checkbox" checked={filter.value} onChange={(e) => update(filter.key, e.target.checked)} />{filter.label}</label>)}
      </div>
      <div className="flex gap-2 mt-6"><button className="btn-secondary" onClick={reset}>Restablecer</button><button className="btn-primary flex-1" onClick={() => setFilterOpen(false)}>Ver {total} {total === 1 ? "resultado" : "resultados"}</button></div>
    </MobileSheet>
  </div>;
}

// Filtro desplegable con forma de píldora. Es un <select> nativo: en el
// celular abre el selector del sistema y nunca queda cortado por la fila que
// se desliza de costado.
function PillSelect({ label, value, options, onChange, className = "" }: { label: string; value: string; options: string[]; onChange: (value: string) => void; className?: string }) {
  return <label className={`li-pill li-pill-select ${className}`} data-active={value ? "true" : undefined}>
    <span className="sr-only">{label}</span>
    <span aria-hidden>{value || label}</span>
    <ChevronDown size={14} aria-hidden />
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label === "Rubro" ? `${label}: todos` : `${label}: todas`}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>;
}
