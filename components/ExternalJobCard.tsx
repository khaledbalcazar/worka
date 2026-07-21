import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import type { ExternalJob } from "@/lib/types";

// Tarjeta de vacante externa. Se distingue a propósito de las de Worka:
// no tiene sello de verificada ni postulación con 1 clic, y deja claro
// de dónde salió el aviso.
export default function ExternalJobCard({ job }: { job: ExternalJob }) {
  return (
    <Link
      href={`/empleo/externo/${job.id}`}
      className="card p-4 flex gap-3 hover:shadow-md transition-shadow"
    >
      <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center shrink-0 overflow-hidden">
        {job.company_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.company_logo_url}
            alt={job.company_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="font-bold text-gray-400">
            {job.company_name[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-primary-dark leading-snug">
            {job.title}
          </h3>
          <span className="chip bg-amber-50 text-amber-700 shrink-0">
            Externa
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 truncate">
          {job.company_name}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
          {job.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {job.city}
            </span>
          )}
          {job.salary_range && (
            <span className="text-emerald-700 font-medium">
              {job.salary_range}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-gray-400">
            <ExternalLink size={11} /> vía {job.source_name}
          </span>
        </div>
      </div>
    </Link>
  );
}
