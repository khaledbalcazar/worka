"use client";
import Link from "next/link";
import { BadgeCheck, Bus, MapPin, Check, Zap } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import JobApplicationButton from "./JobApplicationButton";
import SaveJobButton from "./SaveJobButton";

export default function JobResultCard({ job, selected, saved, applied, loggedIn, requiresEvaluation, onSelect, onSaved, onApplied }: {
  job: JobWithCompany; selected: boolean; saved: boolean; applied: boolean; loggedIn: boolean; requiresEvaluation: boolean;
  onSelect: () => void; onSaved: (value: boolean) => void; onApplied: () => void;
}) {
  return <article className={`job-result ${selected ? "is-selected" : ""}`}>
    <div className="job-result-heading">
      <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="job-company-logo" />
      <div className="min-w-0 flex-1">
        <p className="job-company-name">{job.company.trade_name}{job.company.is_verified && <BadgeCheck size={14} className="text-primary shrink-0" aria-label="Empresa verificada" />}</p>
        <h2><Link className="lg:hidden" href={`/empleo/${job.id}`}>{job.title}</Link><button className="hidden lg:block text-left" onClick={onSelect} aria-pressed={selected}>{job.title}</button></h2>
        <p className="job-location"><MapPin size={12} />{job.company.location_city} · {job.modality}</p>
      </div>
      <SaveJobButton jobId={job.id} saved={saved} loggedIn={loggedIn} onChange={onSaved} />
    </div>
    <div className="job-salary-row"><div><span>Salario ofrecido</span><p>{job.salary_range || "No informado"}</p></div>{job.urgent && <span className="job-urgent"><Zap size={12} /> Contratación inmediata</span>}</div>
    <div className="job-facts">{!job.requires_experience && <span className="job-first"><Check size={12} /> Sin experiencia</span>}{job.contract_type && <span>{job.contract_type}</span>}</div>
    {job.nearby_transit && <p className="job-transit"><Bus size={13} /><span>{job.nearby_transit}</span></p>}
    <div className="job-mobile-actions lg:hidden"><JobApplicationButton requiresEvaluation={requiresEvaluation} job={job} applied={applied} loggedIn={loggedIn} onApplied={onApplied} /><Link href={`/empleo/${job.id}`} className="btn-secondary">Detalles</Link></div>
    <div className="job-result-footer">{applied ? <span className="text-emerald-700 flex items-center gap-1"><Check size={12} /> Ya te postulaste</span> : <span>{job.vacancies_count > 1 ? `${job.vacancies_count} puestos disponibles` : ""}</span>}<span>Publicado {timeAgo(job.created_at)}</span></div>
  </article>;
}
