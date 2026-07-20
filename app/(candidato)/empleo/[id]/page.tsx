import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, getMyAppliedJobIds } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";
import { formatDate, timeAgo } from "@/lib/format";
import ApplyPanel from "@/components/ApplyPanel";
import EntityAvatar from "@/components/EntityAvatar";
import JobViewTracker from "@/components/JobViewTracker";
import {
  FastResponderBadge,
  FirstJobBadge,
  ModalityChip,
  UrgentBadge,
  VerifiedBadge,
} from "@/components/Badges";

// Metadata por vacante: título, descripción y la imagen para redes (og:image),
// clave para el preview al compartir por WhatsApp/Facebook y para el SEO.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Vacante no encontrada" };
  const title = `${job.title} — ${job.company.trade_name}`;
  const description = `${job.company.location_city}${job.salary_range ? ` · ${job.salary_range}` : ""}. Postulate gratis en Worka.`;
  const ogImage = `/empleo/${job.id}/og`;
  return {
    title,
    description,
    alternates: { canonical: `/empleo/${job.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/empleo/${job.id}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, appliedIds] = await Promise.all([
    getJobById(id),
    getMyAppliedJobIds(),
  ]);
  if (!job || job.status !== "Activo") notFound();

  // Destino para las apps de mapas: dirección exacta o empresa + ciudad.
  // El origen lo resuelve la app con la ubicación del usuario.
  const destination = encodeURIComponent(
    job.address ?? `${job.company.trade_name}, ${job.company.location_city}, Paraguay`
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`;
  const moovitUrl = `https://moovitapp.com/tripplan?dest_name=${destination}`;

  const facts = [
    job.salary_range && { icon: "💰", label: "Salario", value: job.salary_range },
    job.contract_type && { icon: "📄", label: "Contrato", value: job.contract_type },
    job.schedule && { icon: "🕒", label: "Horario", value: job.schedule },
    {
      icon: "👥",
      label: "Puestos",
      value:
        job.vacancies_count === 1 ? "1 vacante" : `${job.vacancies_count} vacantes`,
    },
    { icon: "🏷️", label: "Rubro", value: job.industry },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  // JSON-LD para Google for Jobs: hace que la vacante aparezca en el buscador.
  const employmentTypeMap: Record<string, string> = {
    "Tiempo completo": "FULL_TIME",
    "Medio tiempo": "PART_TIME",
    "Por turnos": "PART_TIME",
    Pasantía: "INTERN",
    Freelance: "CONTRACTOR",
  };
  // Salario mínimo aproximado (para baseSalary) a partir del rango en guaraníes.
  const salaryNums = (job.salary_range ?? "")
    .replace(/\./g, "")
    .match(/\d{6,}/g)
    ?.map(Number);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${job.description.replace(/\n/g, "<br/>")}</p>`,
    datePosted: job.created_at,
    validThrough: job.expires_at,
    employmentType:
      employmentTypeMap[job.contract_type ?? ""] ?? "FULL_TIME",
    identifier: {
      "@type": "PropertyValue",
      name: job.company.trade_name,
      value: job.id,
    },
    directApply: true,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.trade_name,
      sameAs: `${SITE_URL.replace(/\/$/, "")}/empresas/${job.company.id}`,
      ...(job.company.logo_url ? { logo: job.company.logo_url } : {}),
    },
    ...(salaryNums && salaryNums.length > 0
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "PYG",
            value: {
              "@type": "QuantitativeValue",
              minValue: Math.min(...salaryNums),
              maxValue: Math.max(...salaryNums),
              unitText: "MONTH",
            },
          },
        }
      : {}),
    ...(job.modality === "Remoto" ? { jobLocationType: "TELECOMMUTE" } : {}),
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.address ?? undefined,
        addressLocality: job.company.location_city,
        addressRegion: job.company.location_city,
        addressCountry: "PY",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Paraguay",
    },
  };

  return (
    <div className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobViewTracker jobId={job.id} />
      <Link href="/empleos" className="text-sm text-primary font-medium">
        ← Volver al feed
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="space-y-4">
          {/* Encabezado */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <EntityAvatar
                url={job.company.logo_url}
                name={job.company.trade_name}
                className="w-14 h-14 rounded-2xl text-lg"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-dark leading-snug">
                  {job.title}
                </h1>
                <Link
                  href={`/empresas/${job.company.id}`}
                  className="text-sm text-primary mt-0.5 inline-block hover:underline"
                >
                  {job.company.trade_name} · {job.company.location_city} →
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              <ModalityChip modality={job.modality} />
              {!job.requires_experience && <FirstJobBadge />}
              {job.urgent && <UrgentBadge />}
              {job.company.is_verified && <VerifiedBadge />}
              {job.company.fast_responder && <FastResponderBadge />}
            </div>

            {/* Datos clave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              {facts.map((f) => (
                <div key={f.label} className="bg-surface rounded-xl px-3 py-2.5">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                    {f.icon} {f.label}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Publicada {timeAgo(job.created_at)} · Postulate antes del{" "}
              {formatDate(job.expires_at)} · {job.views_count} personas vieron
              esta vacante
            </p>
          </div>

          {/* Cómo llegar */}
          {(job.address || job.nearby_transit) && job.modality !== "Remoto" && (
            <div className="card p-5">
              <h2 className="font-semibold text-primary-dark mb-3">
                📍 Cómo llegar
              </h2>
              {job.address && (
                <p className="text-sm text-gray-700">{job.address}</p>
              )}
              {job.nearby_transit && (
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-primary-dark mt-2">
                  🚌 <span className="font-semibold">Colectivos:</span>{" "}
                  {job.nearby_transit}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-sm"
                >
                  🗺️ Google Maps
                </a>
                <a
                  href={moovitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-sm"
                >
                  🚏 Moovit
                </a>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Se abre con tu ubicación actual como punto de partida.
              </p>
            </div>
          )}

          {/* Descripción */}
          <div className="card p-5">
            <h2 className="font-semibold text-primary-dark mb-2">
              Sobre el puesto
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Requisitos y beneficios */}
          {(job.requirements.length > 0 || job.benefits.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {job.requirements.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-semibold text-primary-dark mb-2.5">
                    ✅ Requisitos
                  </h2>
                  <ul className="space-y-1.5">
                    {job.requirements.map((r) => (
                      <li
                        key={r}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.benefits.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-semibold text-primary-dark mb-2.5">
                    🎁 Beneficios
                  </h2>
                  <ul className="space-y-1.5">
                    {job.benefits.map((b) => (
                      <li
                        key={b}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-success mt-0.5">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 px-4 pb-2">
            ¿Esta oferta te parece sospechosa? Denunciala desde el menú ⋮ del
            feed. Nunca pagues para conseguir un trabajo.
          </p>
        </div>

        {/* Panel de postulación: fijo a la derecha en escritorio */}
        <div className="lg:sticky lg:top-20">
          <ApplyPanel job={job} alreadyApplied={appliedIds.has(job.id)} />
        </div>
      </div>
    </div>
  );
}
