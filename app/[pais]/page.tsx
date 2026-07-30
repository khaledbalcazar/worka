import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Shield, Search } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, countryBySlug } from "@/lib/countries";
import { INDUSTRIES } from "@/lib/mock-data";
import { getExternalJobs } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";
import Logo from "@/components/Logo";
import ExternalJobCard from "@/components/ExternalJobCard";
import RememberCountry from "@/components/RememberCountry";

const BASE = SITE_URL.replace(/\/$/, "");

// Genera /paraguay, /argentina, /mexico… en build.
export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ pais: c.slug }));
}

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pais: string }>;
}): Promise<Metadata> {
  const { pais } = await params;
  const country = countryBySlug(pais);
  if (!country) return { title: "País no encontrado" };

  // Título < 70 caracteres (el layout NO le agrega sufijo a este título raíz).
  const title = `Empleos en ${country.name} — Worka`;
  const description = `Encontrá trabajo en ${country.name}: vacantes nuevas cada día de las mejores empresas. Postulate gratis en Worka, la bolsa de empleo de ${country.demonym}.`;

  // hreflang con URLs ABSOLUTAS + x-default (Semrush exige absolutas y 200).
  const languages: Record<string, string> = {};
  for (const c of COUNTRIES) languages[`es-${c.code}`] = `${BASE}/${c.slug}`;
  languages["x-default"] = `${BASE}/${DEFAULT_COUNTRY.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${country.slug}`,
      languages,
    },
    openGraph: { title, description, url: `${BASE}/${country.slug}`, type: "website" },
  };
}

export default async function CountryLanding({
  params,
}: {
  params: Promise<{ pais: string }>;
}) {
  const { pais } = await params;
  const country = countryBySlug(pais);
  if (!country) notFound();

  const jobs = await getExternalJobs(country.code);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `Worka ${country.name}`,
    url: `${BASE}/${country.slug}`,
    description: `Bolsa de empleo de ${country.name}.`,
  };

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RememberCountry code={country.code} />

      {/* Header con selector de país */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-primary-dark/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <CountryPicker current={country.slug} />
            <Link href="/registro" className="btn-primary text-xs">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#EEF1FC] to-surface">
        <div className="max-w-5xl mx-auto px-5 py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3.5 py-1.5 mb-5">
            <span className="text-sm">{country.flag}</span>
            <span className="text-[0.72rem] text-primary tracking-wide">
              Empleos en {country.name} · actualizado a diario
            </span>
          </div>
          <h1 className="font-extrabold text-[clamp(2rem,6vw,3.4rem)] leading-[1.08] tracking-tight text-primary-dark">
            Tu próximo trabajo
            <br />
            <span className="text-primary">está en {country.name}.</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            {country.blurb}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <a href="#empleos" className="btn-primary">
              <Search size={16} /> Ver empleos
            </a>
            <Link href="/registro" className="btn-secondary">
              Crear mi perfil gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Rubros */}
      <section className="max-w-5xl mx-auto px-5 py-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Rubros con más demanda en {country.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.slice(0, 12).map((r) => (
            <span
              key={r}
              className="chip bg-white border border-gray-200 text-gray-600"
            >
              {r}
            </span>
          ))}
        </div>
      </section>

      {/* Empleos del país */}
      <section id="empleos" className="max-w-5xl mx-auto px-5 pb-14">
        <h2 className="text-xl font-bold text-primary-dark mb-1">
          Empleos disponibles en {country.name}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Avisos de distintas fuentes. Creá tu cuenta para postularte y ver el
          contacto de cada empresa.
        </p>

        {jobs.length === 0 ? (
          <div className="card p-10 text-center">
            <MapPin size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Todavía estamos sumando vacantes de {country.name}.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Dejanos tu perfil y te avisamos apenas haya ofertas de tu rubro.
            </p>
            <Link href="/registro" className="btn-primary mt-5 inline-flex">
              Crear mi perfil gratis <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {jobs.slice(0, 24).map((job) => (
                <ExternalJobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 text-center text-white">
              <p className="font-bold text-lg">
                Creá tu cuenta para postularte a estas vacantes
              </p>
              <p className="text-white/80 text-sm mt-1">
                Gratis. Te mostramos el contacto y te armamos el correo de
                postulación.
              </p>
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold px-6 py-3 rounded-xl mt-4 hover:bg-white/90"
              >
                Empezar gratis <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Contenido SEO único por país */}
      <section className="bg-white border-t border-primary-dark/10 px-5 py-12">
        <div className="max-w-3xl mx-auto prose-sm">
          <h2 className="text-xl font-bold text-primary-dark mb-3">
            Cómo buscar empleo en {country.name} con Worka
          </h2>
          <p className="text-[0.925rem] text-gray-600 leading-relaxed mb-3">
            Buscar trabajo en {country.name} es más simple cuando tenés todas
            las vacantes en un solo lugar. En Worka creás tu perfil gratis,
            generás tu CV sin costo y te postulás con un clic a ofertas de{" "}
            {country.cities.slice(0, 5).join(", ")} y más ciudades. Cada aviso
            muestra el puesto, el rango de salario cuando está disponible y cómo
            contactar a la empresa.
          </p>
          <p className="text-[0.925rem] text-gray-600 leading-relaxed mb-3">
            Las empresas de {country.name} publican en Worka porque es{" "}
            <Link href="/para-empresas" className="text-primary underline">
              gratis para publicar vacantes
            </Link>{" "}
            y verificamos su identidad fiscal ({country.taxIdLabel}) para darle
            confianza a los candidatos. Podés explorar{" "}
            <Link href="/empleos" className="text-primary underline">
              todos los empleos disponibles
            </Link>
            , revisar los{" "}
            <Link href="/salarios" className="text-primary underline">
              salarios de referencia por rubro
            </Link>{" "}
            o leer consejos en el{" "}
            <Link href="/blog" className="text-primary underline">
              blog de Worka
            </Link>
            .
          </p>
          <p className="text-[0.925rem] text-gray-600 leading-relaxed">
            Recordá: en Worka <b>nunca tenés que pagar</b> para postularte ni
            para conseguir un trabajo. Si una oferta te pide dinero, no es real.{" "}
            <Link href="/registro" className="text-primary underline">
              Creá tu cuenta gratis
            </Link>{" "}
            y empezá a postularte hoy mismo.
          </p>
        </div>
      </section>

      {/* Confianza */}
      <section className="bg-surface border-t border-primary-dark/10 px-5 py-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Shield size={26} className="text-primary shrink-0" />
          <p className="text-sm text-gray-600">
            En Worka <b>nunca pagás</b> para conseguir trabajo. Revisá bien cada
            aviso antes de dar tus datos.
          </p>
        </div>
      </section>

      {/* Footer con países */}
      <footer className="bg-primary-dark text-white/70">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <Logo light />
          <p className="text-xs mt-3 mb-5 text-white/50">
            La plataforma de empleo de Latinoamérica.
          </p>
          <p className="text-[0.67rem] text-white/40 tracking-widest uppercase mb-3">
            Worka en tu país
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/${c.slug}`}
                className={`text-sm hover:text-white ${
                  c.slug === country.slug ? "text-white font-semibold" : ""
                }`}
              >
                {c.flag} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

// Selector de país simple (links, sin estado).
function CountryPicker({ current }: { current: string }) {
  return (
    <div className="relative group">
      <button className="text-sm text-gray-600 px-3 py-2 rounded-xl hover:bg-white inline-flex items-center gap-1.5">
        {COUNTRIES.find((c) => c.slug === current)?.flag} País ▾
      </button>
      <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-44">
          {COUNTRIES.map((c) => (
            <Link
              key={c.code}
              href={`/${c.slug}`}
              className={`block px-4 py-2 text-sm hover:bg-surface ${
                c.slug === current
                  ? "text-primary font-semibold"
                  : "text-gray-600"
              }`}
            >
              {c.flag} {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
