import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Building2, ThumbsUp, ThumbsDown } from "lucide-react";
import Logo from "@/components/Logo";
import EntityAvatar from "@/components/EntityAvatar";
import Stars from "@/components/reviews/Stars";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getEmployerBySlug, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveCountry } from "@/lib/country-context";
import { formatDate } from "@/lib/format";

export const revalidate = 120;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { slug } = await params;
  const { name } = await searchParams;
  const data = await getEmployerBySlug(slug, name);
  const employer = data?.summary.name ?? name ?? "esta empresa";
  return {
    title: `Trabajar en ${employer} — Opiniones y calificaciones`,
    description: `Opiniones reales de empleados sobre ${employer}: calificación, pros y contras, cultura y ambiente laboral. Enterate antes de postularte.`,
  };
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  actual: "Empleado/a actual",
  ex: "Ex empleado/a",
  entrevista: "Entrevista",
};

export default async function EmployerReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string; cid?: string }>;
}) {
  const { slug } = await params;
  const { name } = await searchParams;
  const country = await getActiveCountry();
  const data = await getEmployerBySlug(slug, name);
  if (!data) notFound();

  const { summary, reviews } = data;
  const live = isLive();
  const user = live ? await getCurrentUser() : null;
  const loggedIn = live ? !!user : true;

  // Distribución de estrellas
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  const recommend = reviews.filter((r) => r.would_recommend === true).length;
  const recommendPct = reviews.length
    ? Math.round((recommend / reviews.length) * 100)
    : 0;

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/opiniones" className="text-sm text-gray-500 hover:text-primary">
            ← Todas las opiniones
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Cabecera del empleador */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <EntityAvatar
                url={summary.logo_url}
                name={summary.name}
                className="w-14 h-14 rounded-2xl"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2 flex-wrap">
                  {summary.name}
                  {summary.company_id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificada en Worka
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 bg-surface px-2 py-0.5 rounded-full">
                      Sin registrar
                    </span>
                  )}
                </h1>
                {summary.review_count > 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-primary-dark">
                      {summary.avg_rating}
                    </span>
                    <Stars rating={summary.avg_rating} />
                    <span className="text-sm text-gray-400">
                      {summary.review_count} opinión
                      {summary.review_count === 1 ? "" : "es"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Todavía sin opiniones. Sé el primero en opinar.
                  </p>
                )}
              </div>
            </div>

            {summary.company_id && (
              <Link
                href={`/empresas/${summary.company_id}`}
                className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
              >
                <Building2 className="w-4 h-4" /> Ver perfil y vacantes en Worka
              </Link>
            )}

            {summary.review_count > 0 && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  {dist.map((d) => (
                    <div key={d.n} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-gray-500">{d.n}</span>
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width: `${(d.count / summary.review_count) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-4 text-gray-400 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-primary-dark">
                    {recommendPct}%
                  </p>
                  <p className="text-xs text-gray-500">lo recomienda</p>
                </div>
              </div>
            )}
          </div>

          {/* Reseñas */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <article key={r.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={r.rating} size={15} />
                  <span className="text-xs text-gray-400">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.title && (
                  <h3 className="font-semibold text-primary-dark mt-2">{r.title}</h3>
                )}
                <p className="text-xs text-gray-400">
                  {[EMPLOYMENT_LABEL[r.employment_type], r.role]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {r.body && <p className="text-sm text-gray-600 mt-2">{r.body}</p>}
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {r.pros && (
                    <div className="text-sm">
                      <p className="text-emerald-600 font-medium flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> Lo bueno
                      </p>
                      <p className="text-gray-600">{r.pros}</p>
                    </div>
                  )}
                  {r.cons && (
                    <div className="text-sm">
                      <p className="text-red-500 font-medium flex items-center gap-1">
                        <ThumbsDown className="w-3.5 h-3.5" /> Lo mejorable
                      </p>
                      <p className="text-gray-600">{r.cons}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div>
          <div className="sticky top-6">
            <ReviewForm
              companyName={summary.name}
              companyId={summary.company_id}
              country={country.code}
              loggedIn={loggedIn}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
