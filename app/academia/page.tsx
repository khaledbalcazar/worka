import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { getPublishedCourses } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Academia Worka — Cursos gratis para conseguir empleo",
  description:
    "Prepará entrevistas, descubrí tus habilidades y aprendé a conseguir tu primer empleo. Cursos gratuitos con ejercicios y certificado, para candidatos de Worka.",
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
  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <SiteHeader active="/academia" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF1FC] to-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -right-[10%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3.5 py-1.5 mb-5">
            <GraduationCap size={15} className="text-primary" />
            <span className="text-[0.72rem] text-primary tracking-wide">
              Academia Worka · 100% gratis
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-dark leading-[1.08] tracking-tight">
            Aprendé gratis y
            <br />
            <span className="text-primary">conseguí mejor trabajo</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-[1.05rem]">
            Cursos cortos y prácticos para prepararte: entrevistas, habilidades
            y tu primer empleo. Con ejercicios y certificado al terminar.
          </p>

          {/* Beneficios */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle size={16} className="text-primary" /> Lecciones cortas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" /> Ejercicios para
              practicar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" /> Certificado gratis
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16 -mt-2">
        {/* Filtros por categoría */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-7">
            {categories.map((cat) => {
              const color = CAT_COLORS[cat] ?? CAT_COLORS.General;
              return (
                <span
                  key={cat}
                  className="chip"
                  style={{ background: `${color}18`, color }}
                >
                  {cat}
                </span>
              );
            })}
          </div>
        )}

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
                  className="card overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${color}22, ${color}0a)`,
                    }}
                  >
                    {c.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.cover_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap size={44} style={{ color }} />
                    )}
                    <span
                      className="absolute top-3 left-3 chip"
                      style={{ background: "white", color }}
                    >
                      {c.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="font-bold text-primary-dark leading-snug group-hover:text-primary">
                      {c.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-3 flex-1">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="chip bg-surface text-gray-500">
                        {c.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold">
                        Empezar <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Cómo funciona */}
        <div className="mt-14 grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              title: "Elegí un curso",
              text: "Todos son gratis para los usuarios de Worka. Registrate y accedé a todo.",
            },
            {
              icon: CheckCircle2,
              title: "Aprendé y practicá",
              text: "Lecciones cortas con ejercicios para fijar lo que aprendés.",
            },
            {
              icon: Award,
              title: "Llevate tu certificado",
              text: "Al completar el curso, descargás un certificado con tu nombre.",
            },
          ].map((s, i) => (
            <div key={s.title} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <s.icon size={18} className="text-primary" />
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Paso {i + 1}</p>
              <h3 className="font-bold text-primary-dark">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
