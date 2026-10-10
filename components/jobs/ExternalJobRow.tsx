import Link from "next/link";
import type { ExternalJob } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";

// Vacante de otro portal en la lista de resultados. Mismo formato que las de
// Worka, pero aclara que no está verificada y de dónde viene.
export default function ExternalJobRow({ job }: { job: ExternalJob }) {
  return <li className="li-item">
    <EntityAvatar url={job.company_logo_url} name={job.company_name} className="li-logo" />
    <div className="li-item-body">
      <h3 className="li-item-title"><Link href={`/empleo/externo/${job.id}`}>{job.title}</Link></h3>
      <p className="li-item-company">{job.company_name}</p>
      {job.city && <p className="li-item-location">{job.city}</p>}
      {job.salary_range && <p className="li-item-salary">{job.salary_range}</p>}
      <p className="li-item-foot"><span>{timeAgo(job.imported_at)}</span><span>vía {job.source_name}</span><span className="is-external">Sin verificar</span></p>
    </div>
  </li>;
}
