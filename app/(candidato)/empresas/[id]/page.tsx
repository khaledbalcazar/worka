import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyById, getCompanyPosts, getJobsByCompany } from "@/lib/data";
import { formatDate, timeAgo } from "@/lib/format";
import {
  FastResponderBadge,
  StatusChip,
  VerifiedBadge,
} from "@/components/Badges";
import EntityAvatar from "@/components/EntityAvatar";
import { BADGE_CATALOG } from "@/lib/types";

// Página pública de empresa: funciona como referencia verificable para candidatos.
export default async function CompanyPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const [companyJobsAll, posts] = await Promise.all([
    getJobsByCompany(id),
    getCompanyPosts(id),
  ]);
  const companyJobs = companyJobsAll.filter((j) => j.status !== "Moderacion");
  const active = companyJobs.filter((j) => j.status === "Activo");
  const badges = BADGE_CATALOG.filter((b) => company.badges.includes(b.id));
  const links = [
    company.website_url && { icon: "🌐", label: "Sitio web", url: company.website_url },
    company.instagram_url && { icon: "📸", label: "Instagram", url: company.instagram_url },
    company.facebook_url && { icon: "👍", label: "Facebook", url: company.facebook_url },
  ].filter(Boolean) as { icon: string; label: string; url: string }[];

  return (
    <div className="space-y-4">
      <Link href="/empleos" className="text-sm text-primary font-medium">
        ← Volver al feed
      </Link>

      {/* Encabezado con banner */}
      <div className="card overflow-hidden">
        <div
          className="h-28 sm:h-36 bg-gradient-to-r from-primary-dark to-primary"
          style={
            company.banner_url
              ? {
                  backgroundImage: `url(${company.banner_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="p-5 pt-0">
          <div className="-mt-8 inline-block">
            <EntityAvatar
              url={company.logo_url}
              name={company.trade_name}
              className="w-16 h-16 rounded-2xl border-4 border-white text-xl shadow"
            />
          </div>
          <div className="mt-2">
            <h1 className="font-bold text-primary-dark text-lg leading-snug">
              {company.trade_name}
            </h1>
            <p className="text-xs text-gray-500">{company.company_name}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {company.is_verified && <VerifiedBadge />}
            {company.fast_responder && <FastResponderBadge />}
            {badges.map((b) => (
              <span
                key={b.id}
                className="chip bg-amber-50 text-amber-700"
                title={b.description}
              >
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {company.description}
          </p>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip bg-surface text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                >
                  {l.icon} {l.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            {company.location_city} · En Worka desde{" "}
            {formatDate(company.created_at)}
            {company.is_verified && " · RUC verificado"}
          </p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0 items-start">
        {/* Vacantes */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Vacantes ({active.length} activas)
          </h2>
          {companyJobs.length === 0 && (
            <p className="card p-5 text-sm text-gray-400 text-center">
              Esta empresa no tiene vacantes publicadas.
            </p>
          )}
          {companyJobs.map((job) => (
            <Link
              key={job.id}
              href={job.status === "Activo" ? `/empleo/${job.id}` : "#"}
              className="card p-4 flex items-center justify-between gap-2 block hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <p className="font-medium text-primary-dark text-sm truncate">
                  {job.title}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(job.created_at)}
                  {job.salary_range && ` · ${job.salary_range}`}
                </p>
              </div>
              <StatusChip status={job.status} />
            </Link>
          ))}
        </section>

        {/* Novedades */}
        {posts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              📣 Novedades
            </h2>
            {posts.map((p) => (
              <div key={p.id} className="card p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {p.content}
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {timeAgo(p.created_at)}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
