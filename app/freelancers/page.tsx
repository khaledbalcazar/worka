import Link from "next/link";
import {
  Search,
  Palette,
  Code2,
  Megaphone,
  PenLine,
  Video,
  Camera,
  Music,
  Briefcase,
  BarChart3,
  Headphones,
  Scale,
  Sparkles,
  ShieldCheck,
  Wallet,
  Send,
  ArrowRight,
} from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import FreelancerCard from "@/components/freelancers/FreelancerCard";
import { getFreelancerDirectory } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";
import { FREELANCER_CATEGORIES } from "@/lib/freelancer";

export const revalidate = 120;

export const metadata = {
  title: "Freelancers — Contratá profesionales para tus proyectos",
  description:
    "Encontrá diseñadores, programadores, redactores y más. Mirá sus portfolios, pedí presupuesto y trabajá con freelancers de tu país en Worka.",
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Diseño: Palette,
  "Desarrollo y Programación": Code2,
  "Marketing Digital": Megaphone,
  "Redacción y Traducción": PenLine,
  "Video y Animación": Video,
  Fotografía: Camera,
  "Música y Audio": Music,
  "Negocios y Consultoría": Briefcase,
  "Datos y Análisis": BarChart3,
  "Soporte y Administración": Headphones,
  "Legales y Contabilidad": Scale,
  General: Sparkles,
};

const ACCENT = "#7C5CFC";

const STEPS = [
  {
    icon: Search,
    title: "Buscá el perfil ideal",
    text: "Filtrá por categoría y especialidad. Mirá portfolios, servicios y reseñas.",
  },
  {
    icon: Send,
    title: "Pedí presupuesto",
    text: "Contactá al freelancer con los detalles de tu proyecto, sin compromiso.",
  },
  {
    icon: Wallet,
    title: "Acordá y pagá directo",
    text: "Definen precio y plazo entre ustedes. El pago va directo al freelancer.",
  },
];

export default async function FreelancersDirectory({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;
  const country = await getActiveCountry();
  const freelancers = await getFreelancerDirectory({
    country: country.code,
    category: cat,
    q,
  });
  const filtering = !!cat || !!q;

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, #5b3fd6)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-12 lg:py-16 text-white">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/15">
            <Sparkles className="w-3.5 h-3.5" /> Worka Freelancers
          </span>
          <h1 className="text-3xl lg:text-5xl font-bold mt-3 max-w-2xl leading-tight">
            Contratá al profesional ideal para tu proyecto
          </h1>
          <p className="text-white/85 mt-3 max-w-xl">
            Diseñadores, programadores, redactores y más, verificados y en{" "}
            {country.name}. Mirá su trabajo y pedí presupuesto sin compromiso.
          </p>

          {/* Buscador */}
          <form action="/freelancers" className="relative max-w-xl mt-6">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="¿Qué necesitás? Ej: logo, landing page, community manager"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-800 bg-white shadow-lg outline-none"
            />
          </form>
          <div className="flex flex-wrap gap-2 mt-4 text-sm">
            <span className="text-white/70">Popular:</span>
            {["Diseño", "Desarrollo y Programación", "Marketing Digital"].map(
              (c) => (
                <Link
                  key={c}
                  href={`/freelancers?cat=${encodeURIComponent(c)}`}
                  className="underline decoration-white/40 hover:decoration-white"
                >
                  {c}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Categorías destacadas */}
        <section>
          <h2 className="text-lg font-bold text-primary-dark mb-4">
            Explorá por categoría
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {FREELANCER_CATEGORIES.filter((c) => c !== "General").map((c) => {
              const Icon = CATEGORY_ICONS[c] ?? Sparkles;
              return (
                <Link
                  key={c}
                  href={`/freelancers?cat=${encodeURIComponent(c)}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${ACCENT}15`, color: ACCENT }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-medium text-primary-dark">
                    {c}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Directorio */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-primary-dark">
              {filtering
                ? `Resultados${cat ? ` · ${cat}` : ""}`
                : "Freelancers destacados"}
            </h2>
            {filtering && (
              <Link href="/freelancers" className="text-sm text-primary hover:underline">
                Limpiar filtros
              </Link>
            )}
          </div>

          {freelancers.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-3xl mb-2">🧑‍💻</p>
              <p className="font-semibold text-primary-dark">
                {filtering
                  ? "No encontramos freelancers con esos filtros"
                  : `Todavía no hay freelancers en ${country.name}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ¿Ofrecés servicios? Sé de los primeros.
              </p>
              <Link href="/unirme-freelancer" className="btn-primary mt-4">
                Crear mi perfil de freelancer
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {freelancers.map((f) => (
                <FreelancerCard key={f.id} f={f} />
              ))}
            </div>
          )}
        </section>

        {/* Cómo funciona */}
        <section className="card p-6 lg:p-8">
          <h2 className="text-lg font-bold text-primary-dark text-center">
            Cómo funciona
          </h2>
          <div className="grid gap-6 sm:grid-cols-3 mt-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: `${ACCENT}15`, color: ACCENT }}
                >
                  <s.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-300 mt-3">
                  PASO {i + 1}
                </p>
                <h3 className="font-semibold text-primary-dark">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Confianza */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              t: "Perfiles verificados",
              d: "Freelancers con identidad y trabajo comprobable.",
            },
            {
              icon: Wallet,
              t: "Sin comisiones ocultas",
              d: "Worka no cobra sobre tu proyecto. Pagás directo al profesional.",
            },
            {
              icon: Sparkles,
              t: "Talento local",
              d: `Profesionales de ${country.name} que entienden tu mercado.`,
            },
          ].map((b) => (
            <div key={b.t} className="card p-5">
              <b.icon className="w-6 h-6" style={{ color: ACCENT }} />
              <h3 className="font-semibold text-primary-dark mt-2">{b.t}</h3>
              <p className="text-sm text-gray-500 mt-1">{b.d}</p>
            </div>
          ))}
        </section>

        {/* CTA freelancer */}
        <section
          className="rounded-3xl p-8 lg:p-10 text-center text-white"
          style={{ background: `linear-gradient(135deg, #1e3a8a, ${ACCENT})` }}
        >
          <h2 className="text-2xl lg:text-3xl font-bold">
            ¿Ofrecés servicios profesionales?
          </h2>
          <p className="text-white/85 mt-2 max-w-lg mx-auto">
            Creá tu perfil gratis, mostrá tu portfolio y empezá a recibir
            proyectos. Sumás Worka Freelancers a tu cuenta en 2 minutos.
          </p>
          <Link
            href="/unirme-freelancer"
            className="inline-flex items-center gap-2 mt-5 bg-white text-primary-dark font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors"
          >
            Crear mi perfil de freelancer <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
