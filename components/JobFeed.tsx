"use client";

import { Fragment, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, SlidersHorizontal, X, Bell, GraduationCap, Wallet, BadgeCheck } from "lucide-react";
import type { ExternalJob, JobWithCompany } from "@/lib/types";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import { matchesJob, matchesExternalJob } from "@/lib/job-search";
import MobileSheet from "@/components/MobileSheet";
import ExternalJobCard from "@/components/ExternalJobCard";
import JobResultCard from "@/components/jobs/JobResultCard";
import JobPreview from "@/components/jobs/JobPreview";

export default function JobFeed({ jobs, appliedJobIds, savedJobIds = [], evaluationJobIds = [], industries = INDUSTRIES, cities = CITIES, externalJobs = [], loggedIn = true }: {
  jobs: JobWithCompany[]; appliedJobIds: string[]; savedJobIds?: string[]; evaluationJobIds?: string[];
  industries?: string[]; cities?: string[]; externalJobs?: ExternalJob[]; loggedIn?: boolean;
}) {
  const params = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedChanges, setSavedChanges] = useState<Record<string, boolean>>({});
  const [newApplications, setNewApplications] = useState<string[]>([]);
  const [limit, setLimit] = useState(12);
  const [alertDismissed, setAlertDismissed] = useState(false);
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
  const applied = new Set([...appliedJobIds, ...newApplications]);
  const isSaved = (id: string) => savedChanges[id] ?? savedJobIds.includes(id);
  const filters = { query, city, industry, modality, contract, firstJobOnly, onlyVerified, withSalary, hideApplied };
  const filtered = jobs.filter((job) => matchesJob(job, filters, applied)).sort((a, b) =>
    (sort === "urgentes" ? Number(b.urgent) - Number(a.urgent) : 0) || Date.parse(b.created_at) - Date.parse(a.created_at));
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
  function reset() { window.history.replaceState(null, "", "/empleos"); setLimit(12); }
  const sharedJobProps = (job: JobWithCompany) => ({
    job, loggedIn, requiresEvaluation: evaluationJobIds.includes(job.id), saved: isSaved(job.id), applied: applied.has(job.id),
    onSaved: (value: boolean) => setSavedChanges((current) => ({ ...current, [job.id]: value })),
    onApplied: () => setNewApplications((current) => [...current, job.id]),
  });

  return <div className="job-search-page">
    <h1 className="sr-only">Buscar empleos</h1>
    <div className="job-search-bar">
      <label className="job-search-input"><Search size={19} /><span className="sr-only">Buscar cargo, empresa o rubro</span><input type="search" value={query} onChange={(e) => update("q", e.target.value)} placeholder="Buscar cargo, empresa o rubro…" /></label>
      <label className="job-city-input"><MapPin size={18} /><span className="sr-only">Ciudad</span><select value={city} onChange={(e) => update("ciudad", e.target.value)}><option value="">Todas las ciudades</option>{[...new Set([...cities, ...(city ? [city] : [])])].map((item) => <option key={item}>{item}</option>)}</select></label>
      <button className="job-filter-button" onClick={() => setFilterOpen(true)} aria-expanded={filterOpen} aria-label={`Filtros${activeCount ? `, ${activeCount} activos` : ""}`}><SlidersHorizontal size={19} /><span>Filtros</span>{activeCount > 0 && <b>{activeCount}</b>}</button>
    </div>
    <div className="job-filter-ribbon" aria-label="Filtros rápidos">
      <button className="filter-pill" aria-pressed={firstJobOnly} onClick={() => update("primerEmpleo", !firstJobOnly)}><GraduationCap size={15} /> Primer empleo</button>
      <button className="filter-pill" aria-pressed={withSalary} onClick={() => update("salario", !withSalary)}><Wallet size={14} /> Con salario</button>
      <button className="filter-pill" aria-pressed={onlyVerified} onClick={() => update("verificadas", !onlyVerified)}><BadgeCheck size={15} /> Verificadas</button>
      {modality && <button className="filter-pill" aria-label={`Quitar modalidad ${modality}`} aria-pressed="true" onClick={() => update("modalidad", "")}>{modality}<X size={13} /></button>}
      {contract && <button className="filter-pill" aria-label={`Quitar contrato ${contract}`} aria-pressed="true" onClick={() => update("contrato", "")}>{contract}<X size={13} /></button>}
      {industry && <button className="filter-pill" aria-label={`Quitar rubro ${industry}`} aria-pressed="true" onClick={() => update("rubro", "")}>{industry}<X size={13} /></button>}
      {hideApplied && <button className="filter-pill" aria-pressed="true" onClick={() => update("sinPostuladas", false)}>Sin postuladas<X size={13} /></button>}
      {(activeCount > 0 || query) && <button className="filter-clear" onClick={reset}>Limpiar</button>}
      <Link href={alertSupported ? alertHref : "/alertas"} className="job-alert-link"><Bell size={15} /> Mis alertas</Link>
    </div>
    <div className="job-results-toolbar"><p role="status"><span className="job-active-dot" /><strong>{total} {total === 1 ? "vacante" : "vacantes"}</strong><span className="job-results-hint"> encontradas</span></p><label><span className="hidden sm:inline">Ordenar por:</span><select aria-label="Ordenar vacantes" value={sort} onChange={(e) => update("orden", e.target.value)}><option value="recientes">Más recientes</option><option value="urgentes">Urgentes primero</option></select></label></div>
    {total === 0 ? <div className="job-empty"><Search size={32} /><h2>No hay resultados con estos filtros</h2><p>Probá otro cargo o ampliá la ciudad para ver más oportunidades.</p><button className="btn-primary" onClick={reset}>Ver todas las vacantes</button></div> :
      <div className={`job-search-grid ${!selected ? "external-only" : ""}`}>
        <div className="job-results-list" aria-label="Resultados de empleo">
          {shownJobs.map((job, index) => <Fragment key={job.id}><JobResultCard {...sharedJobProps(job)} selected={selected?.id === job.id} onSelect={() => setSelectedId(job.id)} />{index === 1 && (!alertDismissed && alertSupported && <aside className="job-alert-banner">
      <span className="job-alert-icon"><Bell size={20} /></span><div><h2>Que el próximo empleo te encuentre</h2><p>Recibí nuevas oportunidades por email y en Worka.</p><Link href={alertHref}>Crear una alerta <span aria-hidden>→</span></Link></div><button className="job-alert-dismiss" aria-label="Ocultar sugerencia de alertas" onClick={() => setAlertDismissed(true)}><X size={16} /></button>
    </aside>)}</Fragment>)}
          {shownExternal.length > 0 && <><div className="job-external-heading"><h2>De otros portales</h2><p>La postulación y el seguimiento se realizan fuera de Worka.</p></div>{shownExternal.map((job) => <ExternalJobCard key={job.id} job={job} />)}</>}
          {limit < total && <button className="btn-secondary w-full" onClick={() => setLimit((current) => current + 12)}>Ver más empleos ({total - limit})</button>}
        </div>
        {selected && <div className="hidden lg:block min-w-0"><JobPreview key={selected.id} {...sharedJobProps(selected)} /></div>}
      </div>}
    <MobileSheet desktop open={filterOpen} onClose={() => setFilterOpen(false)} label="Filtros de empleo" className="p-5 overflow-y-auto">
      <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-semibold">Filtrar empleos</h2><button className="job-save" aria-label="Cerrar filtros" onClick={() => setFilterOpen(false)}><X size={20} /></button></div>
      <div className="space-y-4">
        <label className="block"><span className="label">Ciudad</span><select className="input" value={city} onChange={(e) => update("ciudad", e.target.value)}><option value="">Todas las ciudades</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Rubro</span><select className="input" value={industry} onChange={(e) => update("rubro", e.target.value)}><option value="">Todos los rubros</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Modalidad</span><select className="input" value={modality} onChange={(e) => update("modalidad", e.target.value)}><option value="">Cualquier modalidad</option>{["Presencial", "Híbrido", "Remoto"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Jornada laboral</span><select className="input" value={contract} onChange={(e) => update("contrato", e.target.value)}><option value="">Cualquier jornada</option>{["Tiempo completo", "Medio tiempo", "Por turnos", "Pasantía", "Freelance"].map((item) => <option key={item}>{item}</option>)}</select></label>
        {[{ key: "primerEmpleo", value: firstJobOnly, label: "Sin experiencia previa" }, { key: "salario", value: withSalary, label: "Con salario visible" }, { key: "verificadas", value: onlyVerified, label: "Solo empresas verificadas" }, ...(loggedIn ? [{ key: "sinPostuladas", value: hideApplied, label: "Ocultar mis postulaciones" }] : [])].map((filter) => <label key={filter.key} className="filter-check"><input type="checkbox" checked={filter.value} onChange={(e) => update(filter.key, e.target.checked)} />{filter.label}</label>)}
      </div>
      <div className="flex gap-2 mt-6"><button className="btn-secondary" onClick={reset}>Limpiar</button><button className="btn-primary flex-1" onClick={() => setFilterOpen(false)}>Ver {total} {total === 1 ? "vacante" : "vacantes"}</button></div>
    </MobileSheet>
  </div>;
}
