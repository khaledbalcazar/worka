import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompanyById,
  getCompanyPosts,
  getCustomBadges,
  getJobsByCompany,
} from "@/lib/data";
import { formatDate, timeAgo } from "@/lib/format";
import {
  FastResponderBadge,
  StatusChip,
  VerifiedBadge,
} from "@/components/Badges";
import EntityAvatar from "@/components/EntityAvatar";
import { resolveBadges } from "@/lib/types";
import { Crown } from "lucide-react";
import { enterpriseLimits } from "@/lib/plans";
import { getEnterprisePlanId } from "@/lib/subscriptions";
import { videoEmbedUrl } from "@/lib/video";

// Página pública de empresa: funciona como referencia verificable para candidatos.
export default async function CompanyPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const [companyJobsAll, posts, customBadges] = await Promise.all([
    getJobsByCompany(id),
    getCompanyPosts(id),
    getCustomBadges(),
  ]);
  // Marca empleadora: solo con el plan Empresa vigente (si el plan vence, la
  // página vuelve a la versión estándar sin perder lo cargado).
  const branded = enterpriseLimits(await getEnterprisePlanId(company.id)).brandedPage;
  const brandColor = branded && company.brand_color && /^#[0-9a-f]{6}$/i.test(company.brand_color) ? company.brand_color : null;
  const video = branded ? videoEmbedUrl(company.video_url) : null;
  const perks = branded ? (company.perks ?? []).filter(Boolean) : [];
  const culture = branded ? company.culture?.trim() : "";
  const companyJobs = companyJobsAll.filter((j) => j.status !== "Moderacion");
  const active = companyJobs.filter((j) => j.status === "Activo");
  const badges = resolveBadges(company.badges, customBadges);
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
          className="h-28 sm:h-36 bg-[linear-gradient(135deg,#a0b4b7_0%,#c9d6d4_55%,#e9e5df_100%)]"
          style={
            company.banner_url
              ? {
                  backgroundImage: `url(${company.banner_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : brandColor
                ? { background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 60%, ${brandColor}88 100%)` }
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
            {branded && <span className="pro-chip"><Crown size={11} /> Empresa Pro</span>}
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

      {(culture || perks.length > 0 || video) && (
        <section className="card p-5 space-y-4" style={brandColor ? { borderTop: `4px solid ${brandColor}` } : undefined}>
          <h2 className="font-semibold text-lg">Por qué trabajar en {company.trade_name}</h2>
          {culture && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{culture}</p>}
          {perks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {perks.map((p) => (
                <li key={p} className="chip border" style={brandColor ? { borderColor: brandColor, color: brandColor } : undefined}>✓ {p}</li>
              ))}
            </ul>
          )}
          {video && (
            <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={video}
                title={`Video de ${company.trade_name}`}
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </section>
      )}

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
