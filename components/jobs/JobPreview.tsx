import { jobCity } from "@/lib/job-mapper";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Bus,
  Clock,
  GraduationCap,
  MapPin,
  ShieldAlert,
  Share2,
  Wallet,
} from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { timeAgo, whatsappShareUrl } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import JobApplicationButton from "./JobApplicationButton";
import SaveJobButton from "./SaveJobButton";
import JobMatchCard from "./JobMatchCard";
import JobBenefits from "./JobBenefits";
import SelectionProcess from "./SelectionProcess";
import SafetyNotice from "./SafetyNotice";
import type { MatchCandidate } from "@/lib/job-match";

// Detalle de la vacante seleccionada, a la derecha de la lista en escritorio.
// Arriba lo que decide si vale la pena: puesto, empresa, lugar, salario,
// jornada y la postulación; abajo, el resto del aviso.
export default function JobPreview({ job, saved, applied, loggedIn, requiresEvaluation, matchProfile = null, onSaved, onApplied }: {
  job: JobWithCompany; matchProfile?: MatchCandidate | null; saved: boolean; applied: boolean; loggedIn: boolean; requiresEvaluation: boolean; onSaved: (value: boolean) => void; onApplied: () => void;
}) {
  const insights = [
    { Icon: BriefcaseBusiness, text: [job.modality, job.contract_type].filter(Boolean).join(" · ") },
    { Icon: Wallet, text: job.salary_range || "Salario no informado", strong: !!job.salary_range },
    { Icon: GraduationCap, text: job.requires_experience ? "Pide experiencia previa" : "No pide experiencia previa" },
    job.schedule && { Icon: Clock, text: job.schedule },
    job.nearby_transit && job.modality !== "Remoto" && { Icon: Bus, text: job.nearby_transit },
  ].filter(Boolean) as { Icon: typeof Clock; text: string; strong?: boolean }[];

  return <article className="li-detail-card" aria-label={`Detalle: ${job.title}`}>
    <header className="li-detail-top">
      <Link href={`/empresas/${job.company.id}`} className="li-detail-company">
        <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo is-small" />
        {job.company.trade_name}
        {job.company.is_verified && <BadgeCheck size={15} aria-label="Empresa verificada" />}
      </Link>
      <h2 className="li-detail-title"><Link href={`/empleo/${job.id}`}>{job.title}</Link></h2>
      <p className="li-detail-meta">
        <span>{jobCity(job)}</span>
        <span>Publicado {timeAgo(job.created_at)}</span>
        {job.vacancies_count > 1 && <span>{job.vacancies_count} puestos</span>}
      </p>
      <ul className="li-detail-insights">
        {insights.map(({ Icon, text, strong }) => <li key={text}><Icon size={18} /><span className={strong ? "is-strong" : ""}>{text}</span></li>)}
        {job.company.is_verified ? <li><BadgeCheck size={18} /><span>Empresa verificada · RUC contrastado</span></li> : <li className="is-warning"><ShieldAlert size={18} /><span>Empresa en verificación: todavía no contrastamos su RUC. Postularte por Worka es seguro; no pagues ni envíes documentos por fuera.</span></li>}
      </ul>
      <div className="li-detail-actions">
        <JobApplicationButton requiresEvaluation={requiresEvaluation} job={job} applied={applied} loggedIn={loggedIn} onApplied={onApplied} />
        <SaveJobButton jobId={job.id} saved={saved} loggedIn={loggedIn} onChange={onSaved} withLabel />
        <a href={whatsappShareUrl(job.title, job.id)} target="_blank" rel="noopener noreferrer" className="li-icon-button" aria-label="Compartir por WhatsApp"><Share2 size={18} /></a>
      </div>
    </header>

    <div className="li-detail-section"><JobMatchCard candidate={matchProfile} job={job} /></div>

    <section className="li-detail-section">
      <h3 className="job-block-title">Acerca del empleo</h3>
      <p className="li-detail-text">{job.description}</p>
      {job.requirements.length > 0 && <>
        <h4 className="li-detail-subtitle">Lo que buscan</h4>
        <ul className="li-detail-list">{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul>
      </>}
      {job.address && job.modality !== "Remoto" && <p className="li-detail-address"><MapPin size={14} /> {job.address}</p>}
    </section>

    {job.benefits.length > 0 && <div className="li-detail-section"><JobBenefits benefits={job.benefits} /></div>}
    <div className="li-detail-section"><SelectionProcess company={job.company} questions={job.filter_questions} hasEvaluation={requiresEvaluation} /></div>

    <section className="li-detail-section">
      <h3 className="job-block-title">Acerca de la empresa</h3>
      <div className="li-detail-about">
        <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo" />
        <div className="min-w-0">
          <p className="font-semibold flex items-center gap-1">{job.company.trade_name}{job.company.is_verified && <BadgeCheck size={15} className="text-primary" />}</p>
          <p className="text-xs text-gray-500">{job.industry} · {jobCity(job)}</p>
        </div>
      </div>
      {job.company.description && <p className="li-detail-text line-clamp-4 mt-3">{job.company.description}</p>}
      <Link href={`/empresas/${job.company.id}`} className="profile-text-action mt-1">Ver empresa y opiniones <ArrowUpRight size={14} /></Link>
    </section>

    <div className="li-detail-section"><SafetyNotice jobId={job.id} /></div>
  </article>;
}
