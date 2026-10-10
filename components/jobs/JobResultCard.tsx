"use client";
import Link from "next/link";
import { BadgeCheck, Check, Zap } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { isRecent, timeAgo } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import SaveJobButton from "./SaveJobButton";
import { jobMatch, type MatchCandidate } from "@/lib/job-match";

// Fila de resultado al estilo de una bolsa de empleo profesional: logo,
// título, empresa, lugar y una línea de datos. Toda la fila es clickeable:
// en escritorio abre el detalle al costado; en celular, la página del aviso.
export default function JobResultCard({ job, selected, saved, loggedIn, applied, requiresEvaluation, matchProfile = null, onSelect, onSaved }: {
  job: JobWithCompany; selected: boolean; saved: boolean; applied: boolean; loggedIn: boolean; requiresEvaluation: boolean;
  matchProfile?: MatchCandidate | null; onSelect: () => void; onSaved: (value: boolean) => void; onApplied?: () => void;
}) {
  const match = matchProfile ? jobMatch(matchProfile, job) : null;
  const quickApply = !requiresEvaluation && job.filter_questions.length === 0;
  return <li className={`li-item ${selected ? "is-selected" : ""}`}>
    <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo" />
    <div className="li-item-body">
      <h3 className="li-item-title">
        <Link className="lg:hidden" href={`/empleo/${job.id}`}>{job.title}</Link>
        <button className="hidden lg:inline text-left" onClick={onSelect} aria-current={selected ? "true" : undefined}>{job.title}</button>
      </h3>
      <p className="li-item-company">{job.company.trade_name}{job.company.is_verified && <BadgeCheck size={14} aria-label="Empresa verificada" />}</p>
      <p className="li-item-location">{job.company.location_city} ({job.modality})</p>
      {job.salary_range && <p className="li-item-salary">{job.salary_range}</p>}
      {(applied || (match && match.percent >= 80) || job.urgent || !job.requires_experience) && <p className="li-item-tags">
        {applied && <span className="is-applied"><Check size={12} /> Postulado</span>}
        {!applied && match && match.percent >= 80 && <span className="is-match">{match.percent}% compatible</span>}
        {job.urgent && <span className="is-urgent">Contratación inmediata</span>}
        {!job.requires_experience && <span>Sin experiencia</span>}
      </p>}
      <p className="li-item-foot">
        <span className={isRecent(job.created_at) ? "is-new" : ""}>{timeAgo(job.created_at)}</span>
        {job.vacancies_count > 1 && <span>{job.vacancies_count} puestos</span>}
        {quickApply && !applied && <span className="is-quick"><Zap size={12} /> Postulación con 1 clic</span>}
      </p>
    </div>
    <SaveJobButton jobId={job.id} saved={saved} loggedIn={loggedIn} onChange={onSaved} />
  </li>;
}
