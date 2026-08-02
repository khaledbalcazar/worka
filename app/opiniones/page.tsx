import Link from "next/link";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import Logo from "@/components/Logo";
import Stars from "@/components/reviews/Stars";
import EmployerSearch from "@/components/reviews/EmployerSearch";
import { getTopEmployers } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";

export const revalidate = 300;

export const metadata = {
  title: "Opiniones de empresas — Trabajar en…",
  description:
    "Leé opiniones reales de empleados sobre empresas y empleadores. Calificaciones, pros y contras, salarios y cultura. Opiná también sobre dónde trabajaste.",
};

export default async function OpinionesPage() {
  const country = await getActiveCountry();
  const employers = await getTopEmployers(country.code);

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/empleos" className="text-sm text-gray-500 hover:text-primary">
            Buscar empleo
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-primary-dark flex items-center gap-2">
            <MessageSquareText className="w-7 h-7" /> Opiniones de empresas
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Descubrí cómo es trabajar en una empresa antes de postularte. Podés
            opinar sobre cualquier empleador, esté o no registrado en Worka.
          </p>
        </div>

        <EmployerSearch country={country.code} />

        <section>
          <h2 className="font-semibold text-primary-dark mb-3">
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
      </div>
    </main>
  );
}
