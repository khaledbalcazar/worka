import Link from "next/link";
import {
  CheckCircle2,
  Star,
  PenLine,
  Search,
  ShieldCheck,
  Building2,
} from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import Stars from "@/components/reviews/Stars";
import EmployerSearch from "@/components/reviews/EmployerSearch";
import { getTopEmployers } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";

export const revalidate = 300;

export const metadata = {
  title: "Opiniones de empresas — Trabajar en…",
  description:
    "Leé opiniones reales de empleados sobre empresas y empleadores. Calificaciones, pros y contras, cultura y ambiente laboral. Opiná también sobre dónde trabajaste.",
};

const STEPS = [
  {
    icon: Search,
    title: "Buscá la empresa",
    text: "Escribí el nombre. Están las registradas en Worka y las de otros portales.",
  },
  {
    icon: Star,
    title: "Leé las opiniones",
    text: "Calificación, pros y contras, y si la recomiendan quienes trabajaron ahí.",
  },
  {
    icon: PenLine,
    title: "Dejá la tuya",
    text: "¿Trabajaste o entrevistaste ahí? Ayudá a otros con tu experiencia.",
  },
];

export default async function OpinionesPage() {
  const country = await getActiveCountry();
  const employers = await getTopEmployers(country.code);
  const totalReviews = employers.reduce((a, e) => a + e.review_count, 0);

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <HomeNav />

      {/* Hero */}
      <section className="bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-10 lg:py-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/[0.08] text-brand">
            <ShieldCheck className="w-3.5 h-3.5" /> Opiniones reales · {country.name}
          </span>
          <h1 className="font-light text-[34px] leading-[42px] lg:text-[52px] lg:leading-[62px] tracking-[-0.02em] text-[#8f3b1f] mt-3 max-w-3xl">
            Enterate cómo es trabajar ahí antes de postularte
          </h1>
          <p className="text-[#404040] text-[16px] sm:text-lg mt-3 max-w-xl">
            Opiniones honestas sobre empresas y empleadores. Buscá cualquiera —
            esté o no registrada en Worka— y compartí tu propia experiencia.
          </p>

          <div className="mt-6 max-w-xl">
            <EmployerSearch country={country.code} />
          </div>

          {totalReviews > 0 && (
            <p className="text-muted text-sm mt-3">
              {totalReviews} opinión{totalReviews === 1 ? "" : "es"} sobre{" "}
              {employers.length} empresa{employers.length === 1 ? "" : "s"} y sumando.
            </p>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Cómo funciona */}
        <section className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-blue-50 text-primary">
                <s.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-300 mt-3">PASO {i + 1}</p>
              <h3 className="font-semibold text-primary-dark">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.text}</p>
            </div>
          ))}
        </section>

        {/* Ranking */}
        <section>
          <h2 className="text-lg font-bold text-primary-dark mb-4">
            Empresas más reseñadas
          </h2>
          {employers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="font-semibold text-primary-dark">
                Todavía no hay opiniones
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Buscá una empresa arriba y sé el primero en opinar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {employers.map((e) => (
                <Link
                  key={e.slug}
                  href={`/opiniones/${e.slug}`}
                  className="card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-primary-dark flex items-center gap-1.5">
                      {e.name}
                      {e.company_id && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </h3>
                    <span className="text-sm font-bold text-primary-dark">
                      {e.avg_rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={e.avg_rating} size={14} />
                    <span className="text-xs text-gray-400">
                      {e.review_count} opinión{e.review_count === 1 ? "" : "es"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Agregar empresa */}
        <section className="card p-6 lg:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-primary-dark mt-3">
            ¿No encontrás la empresa?
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">
            Agregala vos mismo. Escribí su nombre y creá la primera opinión: queda
            disponible para que otros la encuentren y opinen.
          </p>
          <div className="mt-5 max-w-md mx-auto text-left">
            <EmployerSearch country={country.code} />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Si la empresa después se registra en Worka, sus opiniones quedan
            vinculadas y aparece como <strong>verificada</strong>.
          </p>
        </section>

        {/* Nota para empresas */}
        <section className="rounded-lg p-8 text-center text-white bg-primary">
          <h2 className="text-xl lg:text-2xl font-bold">
            ¿Sos una empresa? Mostrá tu mejor cara
          </h2>
          <p className="text-white/85 mt-2 max-w-lg mx-auto">
            Registrate en Worka para verificar tu perfil, responder opiniones y
            publicar tus vacantes.
          </p>
          <Link
            href="/para-empresas"
            className="inline-block mt-5 bg-white text-primary-dark font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors"
          >
            Crear cuenta de empresa
          </Link>
        </section>
      </div>
    </main>
  );
}
