import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, getMyAppliedJobIds } from "@/lib/data";
import { formatDate, timeAgo } from "@/lib/format";
import ApplyPanel from "@/components/ApplyPanel";
import JobViewTracker from "@/components/JobViewTracker";
import {
  FastResponderBadge,
  FirstJobBadge,
  ModalityChip,
  UrgentBadge,
  VerifiedBadge,
} from "@/components/Badges";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    validThrough: job.expires_at,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.trade_name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.company.location_city,
        addressCountry: "PY",
      },
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
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold text-lg">
                {job.company.trade_name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
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
