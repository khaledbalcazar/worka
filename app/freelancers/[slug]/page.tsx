import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Camera as Instagram,
  Link2 as Linkedin,
  Code2 as Github,
  CreditCard,
} from "lucide-react";
import EntityAvatar from "@/components/EntityAvatar";
import Logo from "@/components/Logo";
import QuoteForm from "@/components/freelancers/QuoteForm";
import { getPublicFreelancer } from "@/lib/data";
import { AVAILABILITY_LABELS, formatPrice } from "@/lib/freelancer";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = await getPublicFreelancer(slug);
  if (!f) return { title: "Freelancer no encontrado" };
  return {
    title: `${f.identity.full_name} — ${f.headline || f.category} | Worka Freelancers`,
    description:
      f.bio.slice(0, 155) ||
      `Contratá a ${f.identity.full_name} en Worka. Mirá su portfolio y pedí un presupuesto.`,
  };
}

export default async function FreelancerProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = await getPublicFreelancer(slug);
  if (!f) notFound();

  const avail = AVAILABILITY_LABELS[f.availability];
  const accent = f.accent_color || "#7C5CFC";
  const socials = [
    { url: f.website_url, icon: Globe, label: "Sitio web" },
    { url: f.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: f.instagram_url, icon: Instagram, label: "Instagram" },
    { url: f.github_url, icon: Github, label: "GitHub" },
    { url: f.behance_url, icon: ExternalLink, label: "Behance" },
  ].filter((s) => s.url);

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/freelancers" className="text-sm text-gray-500 hover:text-primary">
            ← Ver más freelancers
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 grid gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div
              className="h-28 bg-cover bg-center"
              style={{
                background: f.banner_url
                  ? `url(${f.banner_url}) center/cover`
                  : `linear-gradient(135deg, ${accent}, ${accent}99)`,
              }}
            />
            <div className="p-5 pt-0">
              <div className="-mt-10 flex items-end gap-3">
                <EntityAvatar
                  url={f.identity.avatar_url}
                  name={f.identity.full_name}
                  className="w-20 h-20 rounded-2xl text-xl ring-4 ring-white"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-primary-dark flex items-center gap-1.5">
                    {f.identity.full_name}
                    {f.is_verified && (
                      <CheckCircle2 className="w-5 h-5" style={{ color: accent }} />
                    )}
                  </h1>
                  <p className="text-gray-600">{f.headline || f.category}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {[f.location_city, f.category].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className="text-xs font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ color: avail?.color, background: `${avail?.color}1a` }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: avail?.color }}
                  />
                  {avail?.label}
                </span>
              </div>

              {(f.hourly_rate != null || f.years_experience != null) && (
                <div className="flex gap-6 mt-4 text-sm">
                  {f.hourly_rate != null && (
                    <div>
                      <p className="text-gray-400 text-xs">Tarifa</p>
                      <p className="font-semibold text-primary-dark">
                        {formatPrice(f.hourly_rate, f.currency)}/h
                      </p>
                    </div>
                  )}
                  {f.years_experience != null && (
                    <div>
                      <p className="text-gray-400 text-xs">Experiencia</p>
                      <p className="font-semibold text-primary-dark">
                        {f.years_experience} año{f.years_experience === 1 ? "" : "s"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {socials.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      title={s.label}
                      className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-gray-500 hover:text-primary"
                    >
                      <s.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sobre mí */}
          {f.bio && (
            <section className="card p-5">
              <h2 className="font-semibold text-primary-dark mb-2">Sobre mí</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{f.bio}</p>
            </section>
          )}

          {/* Habilidades */}
          {f.skills.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold text-primary-dark mb-3">Habilidades</h2>
              <div className="flex flex-wrap gap-2">
                {f.skills.map((s) => (
                  <span
                    key={s}
                    className="text-sm px-3 py-1 rounded-full"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Servicios */}
          {f.services.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-primary-dark">Servicios</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {f.services.map((s) => (
                  <div key={s.id} className="card p-4">
                    <h3 className="font-medium text-primary-dark">{s.title}</h3>
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="font-semibold" style={{ color: accent }}>
                        {formatPrice(s.price_from, s.currency)}
                      </span>
                      {s.delivery_days != null && (
                        <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.delivery_days} día{s.delivery_days === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio */}
          {f.portfolio.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-primary-dark">Portfolio</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {f.portfolio.map((p) => (
                  <article key={p.id} className="card overflow-hidden">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-primary-dark">{p.title}</h3>
                      {(p.role || p.client || p.year) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[p.role, p.client, p.year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                      )}
                      {p.link_url && (
                        <a
                          href={p.link_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-sm font-medium mt-2 inline-flex items-center gap-1"
                          style={{ color: accent }}
                        >
                          Ver proyecto <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Columna lateral: contacto + pago */}
        <div className="space-y-5">
          <QuoteForm freelancerId={f.id} accent={accent} />

          {f.payment_links.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-primary-dark mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Formas de pago
              </h3>
              <div className="space-y-2">
                {f.payment_links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="btn-secondary w-full justify-between flex items-center text-sm"
                  >
                    {l.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
