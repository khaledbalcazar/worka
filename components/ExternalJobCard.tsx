import Link from "next/link";
import { MapPin, Briefcase, Wallet } from "lucide-react";
import type { ExternalJob } from "@/lib/types";
import { timeAgo } from "@/lib/format";

// Tarjeta de vacante externa. Cuida el diseño igual que las de Worka, pero
// deja claro que la empresa no está verificada y de dónde salió el aviso.
export default function ExternalJobCard({ job }: { job: ExternalJob }) {
  return (
    <Link
      href={`/empleo/externo/${job.id}`}
      className="card p-4 flex gap-3.5 hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-surface border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
        {job.company_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.company_logo_url}
            alt={job.company_name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span className="font-bold text-lg text-primary/70">
            {job.company_name[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-primary-dark leading-snug group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5 truncate">
          {job.company_name}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {job.city && (
            <span className="chip bg-surface text-gray-600">
              <MapPin size={11} /> {job.city}
            </span>
          )}
          {job.industry && (
            <span className="chip bg-surface text-gray-600">
              <Briefcase size={11} /> {job.industry}
            </span>
          )}
          {job.salary_range && (
            <span className="chip bg-emerald-50 text-emerald-700">
              <Wallet size={11} /> {job.salary_range}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2.5">
          <span className="text-xs text-gray-400">
            {timeAgo(job.imported_at)} · vía {job.source_name}
          </span>
          <span className="chip bg-amber-50 text-amber-700 shrink-0">
            Sin verificar
          </span>
        </div>
      </div>
    </Link>
  );
}
