import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import EntityAvatar from "@/components/EntityAvatar";
import type { FreelancerWithIdentity } from "@/lib/types";
import { AVAILABILITY_LABELS, formatPrice } from "@/lib/freelancer";

// Tarjeta de un freelancer para el directorio.
export default function FreelancerCard({ f }: { f: FreelancerWithIdentity }) {
  const avail = AVAILABILITY_LABELS[f.availability];
  return (
    <Link
      href={`/freelancers/${f.slug}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <EntityAvatar
          url={f.identity.avatar_url}
          name={f.identity.full_name}
          className="w-14 h-14 rounded-2xl text-base"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-primary-dark truncate">
              {f.identity.full_name}
            </h3>
            {f.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {f.headline || f.category}
          </p>
          {f.location_city && (
            <p className="text-xs text-gray-400 mt-0.5">{f.location_city}</p>
          )}
        </div>
        {f.featured && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
        )}
      </div>

      {f.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {f.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs bg-surface text-gray-600 px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
          {f.skills.length > 3 && (
            <span className="text-xs text-gray-400 px-1 py-0.5">
              +{f.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span
          className="text-xs font-medium inline-flex items-center gap-1.5"
          style={{ color: avail?.color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: avail?.color }}
          />
          {avail?.label}
        </span>
        {f.hourly_rate != null && (
          <span className="text-sm font-semibold text-primary-dark">
            {formatPrice(f.hourly_rate, f.currency)}
            <span className="text-xs font-normal text-gray-400">/h</span>
          </span>
        )}
      </div>
    </Link>
  );
}
