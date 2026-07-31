import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Clock, BookOpen } from "lucide-react";
import { getPublishedCourses } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Academia Worka — Cursos gratis para conseguir empleo",
  description:
    "Prepará entrevistas, descubrí tus habilidades y aprendé a conseguir tu primer empleo. Cursos gratuitos de Worka para candidatos registrados.",
  alternates: { canonical: "/academia" },
};

export const revalidate = 300;

const CAT_COLORS: Record<string, string> = {
  Entrevistas: "#2563EB",
  Habilidades: "#7C5CFC",
  Empleo: "#10B981",
  General: "#F59E0B",
};

export default async function AcademiaPage() {
  const courses = await getPublishedCourses();

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <SiteHeader active="/academia" />

      <section className="bg-gradient-to-b from-blue-50 to-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 chip bg-primary/10 text-primary mb-3">
            <GraduationCap size={14} /> Academia Worka
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark">
            Aprendé gratis y conseguí mejor trabajo
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Cursos cortos y prácticos para prepararte: entrevistas, habilidades
            y tu primer empleo. Al registrarte en Worka, tenés acceso a todo.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
        {courses.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            Pronto vamos a publicar los primeros cursos.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => {
              const color = CAT_COLORS[c.category] ?? CAT_COLORS.General;
              return (
                <Link
                  key={c.id}
                  href={`/academia/${c.slug}`}
                  className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{ background: `${color}18` }}
                  >
                    {c.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.cover_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap size={40} style={{ color }} />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="chip"
                        style={{ background: `${color}18`, color }}
                      >
                        {c.category}
                      </span>
                      <span className="chip bg-surface text-gray-500">
                        {c.level}
                      </span>
                    </div>
                    <h2 className="font-bold text-primary-dark leading-snug group-hover:text-primary">
                      {c.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-3 flex-1">
                      {c.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium mt-3">
                      <BookOpen size={13} /> Empezar el curso →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
