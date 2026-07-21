import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ExternalLink, Mail, Lock, ArrowRight } from "lucide-react";
import { getExternalJob } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getExternalJob(id);
  if (!job) return { title: "Vacante no encontrada" };
  return {
    title: `${job.title} — ${job.company_name}`,
    description: job.description.slice(0, 160),
    // Es contenido de terceros: no queremos competir con la fuente original
    // en Google ni que nos penalicen por duplicado.
    robots: { index: false, follow: true },
  };
}

export default async function ExternalJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user] = await Promise.all([getExternalJob(id), getCurrentUser()]);
  if (!job) notFound();

  // getExternalJob ya devuelve los contactos en null si no hay sesión;
  // esto solo decide qué mostrar.
  const loggedIn = !!user;

  return (
    <main className="flex-1 bg-surface min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/empleos" className="text-sm text-primary font-medium">
          ← Volver a empleos
        </Link>

        <div className="card p-5 mt-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center shrink-0 overflow-hidden">
              {job.company_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company_logo_url}
                  alt={job.company_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-bold text-xl text-gray-400">
                  {job.company_name[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <span className="chip bg-amber-50 text-amber-700 mb-1.5">
                Vacante externa
              </span>
              <h1 className="text-xl font-bold text-primary-dark leading-snug">
                {job.title}
              </h1>
              <p className="text-gray-600 mt-0.5">{job.company_name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-600">
            {job.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" /> {job.city}
              </span>
            )}
            {job.industry && <span>{job.industry}</span>}
            {job.salary_range && (
              <span className="text-emerald-700 font-medium">
                {job.salary_range}
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-sm text-gray-700 leading-relaxed mt-4 whitespace-pre-line">
              {job.description}
            </p>
          )}
        </div>

        {/* Cómo postularse: solo con cuenta */}
        <div className="card p-5 mt-4">
          <h2 className="font-bold text-primary-dark mb-3">Cómo postularte</h2>

          {loggedIn ? (
            <div className="space-y-3">
              {job.apply_email && (
                <a
                  href={`mailto:${job.apply_email}?subject=${encodeURIComponent(
                    `Postulación: ${job.title}`
                  )}`}
                  className="btn-primary w-full"
                >
                  <Mail size={16} /> Enviar mi postulación por correo
                </a>
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
              {job.apply_email && (
                <p className="text-xs text-gray-500 text-center">
                  Correo de contacto: <b>{job.apply_email}</b>
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock size={20} className="text-primary" />
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Creá tu cuenta gratis para ver el contacto de esta empresa.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Te toma 2 minutos y te sirve para todas las vacantes de Worka.
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

        {/* Atribución */}
        <p className="text-xs text-gray-400 text-center mt-4 px-4">
          Este aviso no fue publicado por una empresa registrada en Worka.
          {job.source_url ? (
            <>
              {" "}
              Fue tomado de{" "}
              <a
                href={job.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline"
              >
                {job.source_name}
              </a>
              .
            </>
          ) : (
            <> Fuente: {job.source_name}.</>
          )}{" "}
          Worka no verificó esta empresa: revisá bien antes de dar tus datos y
          recordá que <b>nunca</b> tenés que pagar para conseguir un trabajo.
        </p>
      </div>
    </main>
  );
}
