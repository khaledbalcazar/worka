import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import BlogCard from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog — Consejos de empleo en Paraguay",
  description:
    "Guías, consejos y novedades sobre el mercado laboral paraguayo: cómo buscar trabajo, salarios, rubros y más. Por Worka.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 300;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ para?: string }>;
}) {
  const [posts, params] = await Promise.all([
    getPublishedPosts(),
    searchParams,
  ]);
  const filter = params.para;
  const shown = filter
    ? posts.filter((p) => p.audience === filter)
    : posts;

  const tabs = [
    { label: "Todos", href: "/blog", active: !filter },
    { label: "Para personas", href: "/blog?para=personas", active: filter === "personas" },
    { label: "Para empresas", href: "/blog?para=empresas", active: filter === "empresas" },
  ];

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <SiteHeader active="/blog" />

      <section className="bg-gradient-to-b from-blue-50 to-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Blog de Worka
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark mt-2">
            Todo para conseguir (y ofrecer) empleo en Paraguay
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Guías prácticas, novedades del mercado laboral y consejos para
            candidatos y empresas.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16 -mt-2">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`chip min-h-9 px-4 ${
                t.active
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            Todavía no hay artículos publicados.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
