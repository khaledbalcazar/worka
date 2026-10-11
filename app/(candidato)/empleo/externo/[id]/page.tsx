import JobViewTracker from "@/components/JobViewTracker";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, ShieldAlert, Wallet } from "lucide-react";
import EntityAvatar from "@/components/EntityAvatar";
import ExternalApplyPanel from "@/components/jobs/ExternalApplyPanel";
import SafetyNotice from "@/components/jobs/SafetyNotice";
import { getCurrentCandidate, getExternalJob, getMyExternalApplication, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { CANONICAL_URL } from "@/lib/supabase/config";
import { timeAgo } from "@/lib/format";
import { countryByCode } from "@/lib/countries";

const BASE = CANONICAL_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getExternalJob(id);
  if (!job) return { title: "Vacante no encontrada" };

  const where = job.city ? ` en ${job.city}` : "";
  // Descripción entre 120 y 160 caracteres (recomendación SEO).
  const rawDesc =
    job.description.replace(/\s+/g, " ").trim() ||
    `${job.title} en ${job.company_name}${where}. Postulate gratis desde Worka.`;
  const description =
    rawDesc.length > 158 ? `${rawDesc.slice(0, 155).trimEnd()}…` : rawDesc;

  // Título < 62 chars para que con el sufijo "| Worka" no supere 70.
  const rawTitle = `${job.title} — ${job.company_name}`;
  const title =
    rawTitle.length > 60 ? `${rawTitle.slice(0, 57).trimEnd()}…` : rawTitle;

  return {
    title,
    description,
    alternates: { canonical: `/empleo/externo/${job.id}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/empleo/externo/${job.id}`,
    },
  };
}

export default async function ExternalJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user, candidate, application] = await Promise.all([
    getExternalJob(id),
    isLive() ? getCurrentUser() : null,
    getCurrentCandidate(),
    getMyExternalApplication(id),
  ]);
  if (!job) notFound();

  // En demo se navega como logueado, igual que en el resto del área.
  const loggedIn = isLive() ? !!user : true;
  // Pais real de la vacante: define el marcado para Google y la moneda.
  const pais = countryByCode(job.country);
  const pageUrl = `${BASE}/empleo/externo/${job.id}`;

  // Correo de postulación ya redactado: el candidato solo adjunta su CV.
  // La firma enlaza de vuelta a Worka, así la empresa nos conoce.
  const mailSubject = `Postulación: ${job.title}`;
  const mailBody = [
    "Estimado/a equipo de selección,",
    "",
    `Me dirijo a ustedes para postularme al puesto de ${job.title}.`,
    "Adjunto mi CV para su consideración.",
    "",
    "Quedo a disposición para una entrevista.",
    "Saludos cordiales.",
    "",
    candidate?.full_name ? `${candidate.full_name}` : "",
    candidate?.phone_whatsapp ? `Tel: ${candidate.phone_whatsapp}` : "",
    "",
    "---",
    `Vacante encontrada en Worka — ${pageUrl}`,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");


  // Tipo de empleo para Google (mapeo desde el contrato; por defecto jornada
  // completa, que es lo más común y lo que Google recomienda tener siempre).
  const employmentTypeMap: Record<string, string> = {
    "Tiempo completo": "FULL_TIME",
    "Medio tiempo": "PART_TIME",
    "Por turnos": "PER_DIEM",
    Pasantía: "INTERN",
    Temporal: "TEMPORARY",
    "Por contrato": "CONTRACTOR",
  };
  const employmentType =
    employmentTypeMap[job.contract_type ?? ""] ?? "FULL_TIME";

  // validThrough siempre presente: si no hay vencimiento guardado, damos 30
  // días desde que se importó (Google penaliza avisos sin fecha de cierre).
  const validThrough =
    job.expires_at ??
    new Date(
      new Date(job.imported_at).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

  // Salario para el marcado: sacamos los números del texto ("2.800.000 Gs").
  const salaryNums = (job.salary_range?.match(/[\d.]+/g) ?? [])
    .map((s) => parseInt(s.replace(/\./g, ""), 10))
    .filter((n) => !isNaN(n) && n > 1000);

  // Datos estructurados para Google for Jobs. Solo marcamos lo que está
  // visible en la página: la descripción es pública y únicamente el
  // contacto queda detrás del registro, así no violamos sus políticas.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${(job.description || job.title).replace(/\n/g, "<br/>")}</p>`,
    datePosted: job.imported_at,
    validThrough,
    employmentType,
    identifier: {
      "@type": "PropertyValue",
      name: job.company_name,
      value: job.id,
    },
    // No se postula dentro de Worka: la empresa recibe el correo directo.
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      ...(job.company_logo_url ? { logo: job.company_logo_url } : {}),
      ...(job.source_url ? { sameAs: job.source_url } : {}),
    },
    ...(salaryNums.length > 0
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
    ...(job.modality === "Remoto"
      ? { jobLocationType: "TELECOMMUTE" }
      : {}),
    // El país sale de la vacante, no de una constante.
    //
    // Antes acá decía siempre "PY": a Google se le declaraba que un aviso de
    // Bogotá estaba en Paraguay, así que Google for Jobs se lo mostraba a
    // paraguayos y nunca a colombianos. Es la razón por la que las vacantes
    // regionales no llegaban a su público.
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city ?? pais.cities[0] ?? pais.name,
        addressRegion: job.city ?? pais.name,
        addressCountry: pais.code.toUpperCase(),
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: pais.name,
    },
    ...(job.industry ? { industry: job.industry } : {}),
    url: pageUrl,
  };

  const applyPanel = (anchorId?: string) => (
    <ExternalApplyPanel
            jobId={job.id}
            sourceName={job.source_name}
            applyEmail={job.apply_email}
            applyUrl={job.apply_url}
            sourceUrl={job.source_url}
            mailSubject={mailSubject}
            mailBody={mailBody}
            loggedIn={loggedIn}
            hasCv={!!candidate?.cv_url}
            nextHref={`/empleo/externo/${job.id}`}
            initialApplication={application}
      anchorId={anchorId}
    />
  );

  const insights = [
    [job.modality, job.contract_type].filter(Boolean).join(" · ") && {
      Icon: Briefcase,
      text: [job.modality, job.contract_type].filter(Boolean).join(" · "),
    },
    { Icon: Wallet, text: job.salary_range || "Salario no informado", strong: !!job.salary_range },
    job.industry && { Icon: Building2, text: job.industry },
  ].filter(Boolean) as { Icon: typeof Wallet; text: string; strong?: boolean }[];

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobViewTracker
        jobId={job.id}
        title={job.title}
        company={job.company_name}
        external
      />
      <Link href="/empleos" className="inline-flex items-center gap-1 text-sm text-primary font-semibold min-h-10">
        <ArrowLeft size={16} /> Volver a la búsqueda
      </Link>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <article className="li-detail-card li-detail-page">
          <header className="li-detail-top">
            <div className="li-detail-company">
              <EntityAvatar url={job.company_logo_url} name={job.company_name} className="li-logo is-small" />
              {job.company_name}
              <span className="ext-badge">Sin verificar</span>
            </div>
            <h1 className="li-detail-title">{job.title}</h1>
            <p className="li-detail-meta">
              {job.city && <span>{job.city}</span>}
              <span>Publicada {timeAgo(job.imported_at)}</span>
              <span>vía {job.source_name}</span>
            </p>
            <ul className="li-detail-insights">
              {insights.map(({ Icon, text, strong }) => (
                <li key={text}><Icon size={18} /><span className={strong ? "is-strong" : ""}>{text}</span></li>
              ))}
            </ul>
          </header>

          {job.description && (
            <section className="li-detail-section">
              <h2 className="job-block-title">Acerca del empleo</h2>
              <p className="li-detail-text">{job.description}</p>
            </section>
          )}

          {/* En celular la postulación va enseguida de la descripción. */}
          <div className="li-detail-section lg:hidden">{applyPanel("postular")}</div>

          <section className="li-detail-section">
            <h2 className="job-block-title">De dónde viene este aviso</h2>
            <div className="ext-origin">
              <ShieldAlert size={20} className="shrink-0" />
              <p>
                No lo publicó una empresa registrada en Worka, así que no verificamos su {pais.taxIdLabel}
                {job.source_url ? (
                  <>
                    {". Lo tomamos de "}
                    <a href={job.source_url} target="_blank" rel="noopener noreferrer nofollow">{job.source_name}</a>
                  </>
                ) : (
                  <> (fuente: {job.source_name})</>
                )}
                . La postulación y el seguimiento se hacen fuera de Worka.
              </p>
            </div>
            <Link href="/empleos?verificadas=1" className="profile-text-action mt-2">
              Ver solo vacantes de empresas verificadas
            </Link>
          </section>

          <div className="li-detail-section">
            <SafetyNotice jobId={job.id} external />
          </div>
        </article>

        <div className="hidden lg:block lg:sticky lg:top-24">{applyPanel()}</div>
      </div>

      {/* Barra fija en celular: lleva al panel de postulación, que arma el
          mensaje y guarda la postulación. */}
      <div className="lg:hidden fixed inset-x-0 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-40 bg-white/95 backdrop-blur border-t border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{job.title}</p>
            <p className="text-[11px] text-muted truncate">
              {job.company_name}
              {job.city ? ` · ${job.city}` : ""} · sin verificar
            </p>
          </div>
          <a href="#postular" className="btn-primary press text-sm shrink-0 px-5">
            {application ? "Ver estado" : "Postularme"}
          </a>
        </div>
      </div>
    </div>
  );
}
