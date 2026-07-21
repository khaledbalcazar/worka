import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  ExternalLink,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  CalendarDays,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { getCurrentCandidate, getExternalJob } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import { timeAgo } from "@/lib/format";

const BASE = SITE_URL.replace(/\/$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getExternalJob(id);
  if (!job) return { title: "Vacante no encontrada" };

  const where = job.city ? ` en ${job.city}` : " en Paraguay";
  const description =
    job.description.slice(0, 155) ||
    `${job.title}${where}. Postulate gratis desde Worka.`;

  return {
    title: `${job.title} — ${job.company_name}${where}`,
    description,
    alternates: { canonical: `/empleo/externo/${job.id}` },
    openGraph: {
      title: `${job.title} — ${job.company_name}`,
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
  const [job, user, candidate] = await Promise.all([
    getExternalJob(id),
    getCurrentUser(),
    getCurrentCandidate(),
  ]);
  if (!job) notFound();

  const loggedIn = !!user;
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

  const mailto = job.apply_email
    ? `mailto:${job.apply_email}?subject=${encodeURIComponent(
        mailSubject
      )}&body=${encodeURIComponent(mailBody)}`
    : null;

  // Datos estructurados para Google for Jobs. Solo marcamos lo que está
  // visible en la página: la descripción es pública y únicamente el
  // contacto queda detrás del registro, así no violamos sus políticas.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${(job.description || job.title).replace(/\n/g, "<br/>")}</p>`,
    datePosted: job.imported_at,
    ...(job.expires_at ? { validThrough: job.expires_at } : {}),
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
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city ?? "Asunción",
        addressRegion: job.city ?? "Paraguay",
        addressCountry: "PY",
      },
    },
    ...(job.industry ? { industry: job.industry } : {}),
    url: pageUrl,
  };

  return (
    <main className="flex-1 bg-surface min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/empleos" className="text-sm text-primary font-medium">
          ← Volver a empleos
        </Link>

        {/* Encabezado */}
        <div className="card overflow-hidden mt-4">
          <div className="h-20 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 pb-5 -mt-9">
            <div className="w-18 h-18 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
              {job.company_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company_logo_url}
                  alt={job.company_name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="font-extrabold text-2xl text-primary">
                  {job.company_name[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-primary-dark leading-tight mt-3">
              {job.title}
            </h1>
            <p className="text-gray-600 font-medium mt-1">{job.company_name}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.city && (
                <span className="chip bg-surface text-gray-600">
                  <MapPin size={12} /> {job.city}
                </span>
              )}
              {job.industry && (
                <span className="chip bg-surface text-gray-600">
                  <Briefcase size={12} /> {job.industry}
                </span>
              )}
              {job.salary_range && (
                <span className="chip bg-emerald-50 text-emerald-700">
                  <Wallet size={12} /> {job.salary_range}
                </span>
              )}
              <span className="chip bg-surface text-gray-500">
                <CalendarDays size={12} /> {timeAgo(job.imported_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {job.description && (
          <div className="card p-5 mt-4">
            <h2 className="font-bold text-primary-dark mb-2">
              Sobre el puesto
            </h2>
            <p className="text-[0.925rem] text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {/* Postulación */}
        <div className="card p-5 mt-4">
          <h2 className="font-bold text-primary-dark mb-3">Cómo postularte</h2>

          {loggedIn ? (
            <div className="space-y-3">
              {mailto && (
                <>
                  <a href={mailto} className="btn-primary w-full">
                    <Mail size={16} /> Postularme por correo
                  </a>
                  <p className="text-xs text-gray-500 text-center">
                    Te abre el correo con el mensaje ya escrito. Solo{" "}
                    <b>adjuntá tu CV</b> y enviá.
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    Contacto: {job.apply_email}
                  </p>
                </>
              )}
              {job.apply_url && (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-secondary w-full"
                >
                  <ExternalLink size={16} /> Ver el aviso original
                </a>
              )}
              {!candidate?.cv_url && (
                <Link
                  href="/cv"
                  className="block text-xs text-primary text-center pt-1"
                >
                  ¿No tenés CV? Generá uno gratis en Worka →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock size={20} className="text-primary" />
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">
                Creá tu cuenta gratis para postularte
              </p>
              <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                Te mostramos el contacto de la empresa y te armamos el correo de
                postulación. Además podés generar tu CV sin costo.
              </p>
              <Link
                href={`/registro?next=/empleo/externo/${job.id}`}
                className="btn-primary w-full"
              >
                Crear cuenta gratis <ArrowRight size={16} />
              </Link>
              <Link
                href={`/ingresar?next=/empleo/externo/${job.id}`}
                className="block text-sm text-primary mt-3"
              >
                Ya tengo cuenta
              </Link>
            </div>
          )}
        </div>

        {/* Aviso de origen */}
        <div className="card p-4 mt-4 bg-amber-50 border-amber-100">
          <div className="flex gap-3">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Esta empresa no fue verificada por Worka
              </p>
              <p className="text-xs text-amber-800 leading-relaxed mt-1">
                El aviso no lo publicó una empresa registrada en la plataforma
                {job.source_url ? (
                  <>
                    {"; lo tomamos de "}
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline"
                    >
                      {job.source_name}
                    </a>
                  </>
                ) : (
                  <> (fuente: {job.source_name})</>
                )}
                . Revisá bien antes de dar tus datos y recordá que{" "}
                <b>nunca</b> tenés que pagar para conseguir un trabajo.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-5">
          <Link href="/empleos" className="text-sm text-primary font-medium">
            Ver vacantes verificadas de Worka →
          </Link>
        </p>
      </div>
    </main>
  );
}
