import Link from "next/link";
import { BadgeCheck, Bus, MapPin, ShieldCheck, ArrowUpRight, Share2 } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { timeAgo, whatsappShareUrl } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import JobApplicationButton from "./JobApplicationButton";
import SaveJobButton from "./SaveJobButton";
import ReportJobButton from "./ReportJobButton";

export default function JobPreview({ job, saved, applied, loggedIn, requiresEvaluation, onSaved, onApplied }: {
  job: JobWithCompany; saved: boolean; applied: boolean; loggedIn: boolean; requiresEvaluation: boolean; onSaved: (value: boolean) => void; onApplied: () => void;
}) {
  return <section className="job-preview" aria-label="Detalle del empleo seleccionado">
    <div className="job-preview-heading">
      <div className="flex items-start gap-4"><EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="w-16 h-16 rounded-lg text-xl bg-white" /><div>
        <h2>{job.title}</h2><p className="flex items-center gap-1 text-primary mt-2 text-sm">{job.company.trade_name}{job.company.is_verified && <BadgeCheck size={15} />}</p><p className="text-sm text-gray-600 mt-1">{job.company.location_city} · {job.modality}</p><p className="text-xs text-gray-500 mt-2">Publicado {timeAgo(job.created_at)}</p>
      </div></div>
      <div className="job-trust-line"><ShieldCheck size={16} /><span>{job.company.is_verified ? "Empresa verificada en Worka" : "Postulación gratuita en Worka"}</span></div>
    </div>
    <div className="job-preview-body">
      <div className="flex flex-wrap gap-2"><JobApplicationButton requiresEvaluation={requiresEvaluation} job={job} applied={applied} loggedIn={loggedIn} onApplied={onApplied} /><SaveJobButton jobId={job.id} saved={saved} loggedIn={loggedIn} onChange={onSaved} withLabel /></div>
      <dl className="job-detail-facts"><div><dt>Salario ofrecido</dt><dd>{job.salary_range || "No informado"}</dd></div><div><dt>Jornada</dt><dd>{job.contract_type || "No especificada"}</dd>{job.schedule && <p>{job.schedule}</p>}</div><div><dt>Experiencia</dt><dd>{job.requires_experience ? "Con experiencia" : "Sin experiencia previa"}</dd></div></dl>
      {job.nearby_transit && <div className="job-detail-transit"><Bus size={19} /><div><strong>Cómo llegar</strong><p>{job.nearby_transit}</p>{job.address && <p><MapPin size={12} className="inline" /> {job.address}</p>}</div></div>}
      <div className="job-description"><h3>Sobre este empleo</h3><p className="whitespace-pre-line">{job.description}</p>
        {job.requirements.length > 0 && <><h3>Lo que buscamos</h3><ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {job.benefits.length > 0 && <><h3>Lo que ofrecemos</h3><ul>{job.benefits.map((item) => <li key={item}>{item}</li>)}</ul></>}
      </div>
      <div className="flex flex-wrap gap-4 border-t border-stone-200 pt-4 mt-6 text-sm text-primary"><Link href={`/empleo/${job.id}`} className="flex items-center gap-1">Abrir página del empleo <ArrowUpRight size={15} /></Link><a href={whatsappShareUrl(job.title, job.id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><Share2 size={14} /> Compartir</a></div>
      <ReportJobButton jobId={job.id} />
    </div>
  </section>;
}
