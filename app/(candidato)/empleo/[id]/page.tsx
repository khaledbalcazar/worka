import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentCandidate, getExperienceCount, getJobById, getMyAppliedJobIds, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { CANONICAL_URL } from "@/lib/supabase/config";
import { formatDate, timeAgo } from "@/lib/format";
import { isJobExpired } from "@/lib/job-visibility";
import ApplyPanel from "@/components/ApplyPanel";
import JobMatchCard from "@/components/jobs/JobMatchCard";
import JobBenefits from "@/components/jobs/JobBenefits";
import SelectionProcess from "@/components/jobs/SelectionProcess";
import SafetyNotice from "@/components/jobs/SafetyNotice";
import EntityAvatar from "@/components/EntityAvatar";
import JobViewTracker from "@/components/JobViewTracker";
import LinkedJobPanel from "@/components/evaluar/LinkedJobPanel";
import { getProcessForJob, getMyParticipation } from "@/lib/evaluar";
import { countryByCode } from "@/lib/countries";
import { FastResponderBadge, UrgentBadge, VerifiedBadge } from "@/components/Badges";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Bus,
  Clock,
  GraduationCap,
  MapPin,
  Navigation,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";

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
  const rawTitle = `${job.title} — ${job.company.trade_name}`;
  const title =
    rawTitle.length > 60 ? `${rawTitle.slice(0, 57).trimEnd()}…` : rawTitle;
  // Descripción con el rubro y la ciudad para dar más contexto y palabras.
  const description = `${job.title} en ${job.company.trade_name} · ${job.company.location_city}${job.salary_range ? ` · ${job.salary_range}` : ""}. Postulate gratis y sin comisiones en Worka.`.slice(
    0,
    158
  );
  const ogImage = `/empleo/${job.id}/og`;
  return {
    title,
    description,
    // Vencida: la página queda para quien tenga el enlace, pero fuera de Google.
    ...(isJobExpired(job.expires_at) ? { robots: { index: false, follow: true } } : {}),
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
  const [job, appliedIds, user, candidate] = await Promise.all([
    getJobById(id),
    getMyAppliedJobIds(),
    isLive() ? getCurrentUser() : null,
    getCurrentCandidate(),
  ]);
  // En demo se navega como logueado; en vivo depende de la sesión real.
  const loggedIn = isLive() ? !!user : true;
  if (!job || job.status !== "Activo") notFound();
  const expired = isJobExpired(job.expires_at);

  // ¿La empresa enlazó esta vacante con un proceso de Worka Evaluar? Si sí, el
  // candidato arranca los tests desde acá, sin salir del aviso.
  const [evaluation, experienceCount] = await Promise.all([
    getProcessForJob(job.id),
    candidate ? getExperienceCount(candidate.id) : Promise.resolve(0),
  ]);
  const participation = evaluation
    ? await getMyParticipation(evaluation.id)
    : null;

  // Pais de la empresa que publica: define el marcado para Google y la
  // moneda. Antes estaba fijo en Paraguay, asi que una vacante argentina se
  // le declaraba a Google como paraguaya y nunca llegaba a su publico.
  const pais = countryByCode(job.company.country);

  // Destino para las apps de mapas: dirección exacta o empresa + ciudad.
  // El origen lo resuelve la app con la ubicación del usuario.
  const destination = encodeURIComponent(
    job.address ?? `${job.company.trade_name}, ${job.company.location_city}, Paraguay`
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`;
  const moovitUrl = `https://moovitapp.com/tripplan?dest_name=${destination}`;

  const insights = [
    { Icon: BriefcaseBusiness, text: [job.modality, job.contract_type].filter(Boolean).join(" · ") },
    { Icon: Wallet, text: job.salary_range || "Salario no informado", strong: !!job.salary_range },
    { Icon: GraduationCap, text: job.requires_experience ? "Pide experiencia previa" : "No pide experiencia previa" },
    job.schedule && { Icon: Clock, text: job.schedule },
    {
      Icon: Users,
      text: job.vacancies_count === 1 ? "1 puesto disponible" : `${job.vacancies_count} puestos disponibles`,
    },
  ].filter(Boolean) as { Icon: typeof Clock; text: string; strong?: boolean }[];


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
      sameAs: `${CANONICAL_URL}/empresas/${job.company.id}`,
      ...(job.company.logo_url ? { logo: job.company.logo_url } : {}),
    },
    ...(salaryNums && salaryNums.length > 0
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: pais.currencyCode,
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
        addressCountry: pais.code.toUpperCase(),
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: pais.name,
    },
  };

  // pb extra en celular: debajo quedan la barra de postulación y la de
  // navegación, y sin ese respiro tapan el final del contenido.
  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Google pide sacar el JobPosting de las vacantes que ya cerraron. */}
      {!expired && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobViewTracker
        jobId={job.id}
        title={job.title}
        company={job.company.trade_name}
      />
      <Link href="/empleos" className="inline-flex items-center gap-1 text-sm text-primary font-semibold min-h-10">
        <ArrowLeft size={16} /> Volver a la búsqueda
      </Link>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <article className="li-detail-card li-detail-page">
          <header className="li-detail-top">
            <Link href={`/empresas/${job.company.id}`} className="li-detail-company">
              <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo is-small" />
              {job.company.trade_name}
              {job.company.is_verified && <BadgeCheck size={15} aria-label="Empresa verificada" />}
            </Link>
            <h1 className="li-detail-title">{job.title}</h1>
            <p className="li-detail-meta">
              <span>{job.company.location_city}</span>
              <span>Publicada {timeAgo(job.created_at)}</span>
              <span>{job.views_count} vistas</span>
            </p>
            <ul className="li-detail-insights">
              {insights.map(({ Icon, text, strong }) => (
                <li key={text}><Icon size={18} /><span className={strong ? "is-strong" : ""}>{text}</span></li>
              ))}
              {!job.company.is_verified && (
                <li className="is-warning">
                  <ShieldAlert size={18} />
                  <span>Empresa en verificación: todavía no contrastamos su {pais.taxIdLabel}. Postularte por Worka es seguro; no pagues ni envíes documentos por fuera.</span>
                </li>
              )}
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {job.urgent && <UrgentBadge />}
              {job.company.is_verified && <VerifiedBadge />}
              {job.company.fast_responder && <FastResponderBadge />}
            </div>
          </header>

          <div className="li-detail-section">
            <JobMatchCard
              candidate={candidate ? { ...candidate, skills: candidate.skills ?? [], experience_count: experienceCount } : null}
              job={job}
            />
          </div>

          <section className="li-detail-section">
            <h2 className="job-block-title">Acerca del empleo</h2>
            <p className="li-detail-text">{job.description}</p>
            {job.requirements.length > 0 && (
              <>
                <h3 className="li-detail-subtitle">Lo que buscan</h3>
                <ul className="li-detail-list">
                  {job.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </>
            )}
          </section>

          {(job.address || job.nearby_transit) && job.modality !== "Remoto" && (
            <section className="li-detail-section">
              <h2 className="job-block-title">Cómo llegar</h2>
              {job.address && <p className="li-detail-address !mt-0"><MapPin size={15} /> {job.address}</p>}
              {job.nearby_transit && (
                <p className="li-detail-address"><Bus size={15} /> Colectivos: {job.nearby_transit}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Navigation size={15} /> Google Maps
                </a>
                <a href={moovitUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Bus size={15} /> Moovit
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">Se abre con tu ubicación actual como punto de partida.</p>
            </section>
          )}

          {job.benefits.length > 0 && (
            <div className="li-detail-section"><JobBenefits benefits={job.benefits} /></div>
          )}

          <div className="li-detail-section">
            <SelectionProcess company={job.company} questions={job.filter_questions} hasEvaluation={!!evaluation} />
          </div>

          <section className="li-detail-section">
            <h2 className="job-block-title">Acerca de la empresa</h2>
            <div className="li-detail-about">
              <EntityAvatar url={job.company.logo_url} name={job.company.trade_name} className="li-logo" />
              <div className="min-w-0">
                <p className="font-semibold flex items-center gap-1">
                  {job.company.trade_name}
                  {job.company.is_verified && <BadgeCheck size={15} className="text-primary" />}
                </p>
                <p className="text-xs text-gray-500">{job.industry} · {job.company.location_city}</p>
              </div>
            </div>
            {job.company.description && <p className="li-detail-text line-clamp-4 mt-3">{job.company.description}</p>}
            <Link href={`/empresas/${job.company.id}`} className="profile-text-action mt-1">
              Ver empresa y opiniones <ArrowUpRight size={14} />
            </Link>
          </section>

          <div className="li-detail-section">
            <SafetyNotice jobId={job.id} />
            <p className="text-xs text-gray-500 mt-3">
              {expired ? `Cerró el ${formatDate(job.expires_at)}.` : `Postulate antes del ${formatDate(job.expires_at)}.`}
            </p>
          </div>
        </article>

        {/* Panel de postulación: fijo a la derecha en escritorio */}
        <div className="lg:sticky lg:top-20 space-y-4">
          {/* Con evaluacion enlazada hay UN solo camino, en orden: mostrar
              tambien el panel normal dejaba postularse salteando los tests,
              que es justo lo que la empresa quiere evitar al enlazarlo. */}
          {expired ? (
            <section className="card p-5">
              <h2 className="font-semibold">Esta vacante ya no recibe postulaciones</h2>
              <p className="text-sm text-muted mt-1">
                Cerró el {formatDate(job.expires_at)}.
                {appliedIds.has(job.id) && " Tu postulación sigue en Mis postulaciones."}
              </p>
              <Link href={`/empleos?rubro=${encodeURIComponent(job.industry)}`} className="btn-primary w-full mt-4">
                Ver vacantes de {job.industry}
              </Link>
            </section>
          ) : evaluation ? (
            <LinkedJobPanel
              job={job}
              alreadyApplied={appliedIds.has(job.id)}
              loggedIn={loggedIn}
              processId={evaluation.id}
              stageCount={evaluation.stage_count}
              participation={participation}
            />
          ) : (
            <ApplyPanel
              job={job}
              alreadyApplied={appliedIds.has(job.id)}
              loggedIn={loggedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
