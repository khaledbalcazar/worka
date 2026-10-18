import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, GraduationCap, ArrowRight, Check, Clock, BarChart3 } from "lucide-react";
import { getCourse, getMyCompletions, getMyCourseProgress } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { CANONICAL_URL } from "@/lib/supabase/config";
import HomeNav from "@/components/home/HomeNav";
import CourseViewer from "@/components/CourseViewer";
import CoursePlayer from "@/components/academia/CoursePlayer";
import PlanLock from "@/components/plans/PlanLock";
import { PRO_BRAND } from "@/lib/plans";
import { isCurrentUserPro } from "@/lib/subscriptions";

const BASE = CANONICAL_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Curso no encontrado" };
  // Los cursos nuevos traen su título y descripción para buscadores.
  const title = course.meta_title || `${course.title} — Academia Worka`;
  const description = course.meta_description || course.description.slice(0, 155);
  return {
    // absolute: el meta_title ya trae «| Academia Worka» y no lleva sufijo.
    title: course.meta_title ? { absolute: title } : title,
    description,
    alternates: { canonical: `${BASE}/academia/${course.slug}` },
    openGraph: { title, description, url: `${BASE}/academia/${course.slug}`, type: "website" },
  };
}

export const revalidate = 300;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course || course.status !== "publicado") notFound();

  // SEO: datos estructurados de curso.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.meta_description || course.description,
    url: `${BASE}/academia/${course.slug}`,
    provider: { "@type": "Organization", name: "Worka", url: "https://worka.click", sameAs: BASE },
    inLanguage: "es-PY",
    isAccessibleForFree: !course.premium,
    educationalLevel: course.level,
    ...(course.outcomes?.length ? { teaches: course.outcomes } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(course.duration_label ? { courseWorkload: `PT${parseInt(course.duration_label, 10) || 60}M` } : {}),
    },
  };
  // Formato nuevo (migración 051): quiz con puntaje, práctica y proyecto final.
  const graded = course.cert_min_quiz != null || !!course.final_project;
  const suggestedCourse = course.suggested_course ? await getCourse(course.suggested_course) : null;
  const suggested =
    suggestedCourse && suggestedCourse.status === "publicado" ? { slug: suggestedCourse.slug, title: suggestedCourse.title } : null;

  // Contenido tras registro: sin sesión, mostramos la portada + CTA.
  if (!user) {
    return (
      <main className="flex-1 bg-surface min-h-screen flex flex-col">
        <HomeNav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="max-w-2xl mx-auto w-full px-4 py-10">
          <Link href="/academia" className="text-sm text-primary font-medium">
            ← Academia
          </Link>
          <div className="card p-6 sm:p-8 mt-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={26} className="text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary-dark">
              {course.title}
            </h1>
            <p className="text-gray-500 mt-2">{course.description}</p>
            {graded && (
              <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-3">
                <span className="inline-flex items-center gap-1"><BarChart3 size={13} /> {course.level}</span>
                {course.duration_label && <span className="inline-flex items-center gap-1"><Clock size={13} /> {course.duration_label}</span>}
                <span>{course.lessons.length} lecciones + proyecto final</span>
              </p>
            )}
            {suggested && (
              <p className="text-sm text-gray-600 mt-3">
                Te recomendamos hacer antes:{" "}
                <Link href={`/academia/${suggested.slug}`} className="text-primary font-semibold underline underline-offset-2">{suggested.title}</Link>
              </p>
            )}

            {course.outcomes && course.outcomes.length > 0 && (
              <div className="text-left max-w-md mx-auto mt-6">
                <p className="font-semibold text-primary-dark text-sm mb-2">Lo que vas a aprender</p>
                <ul className="space-y-1.5">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={15} className="text-success shrink-0 mt-0.5" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {graded && <p className="text-left max-w-sm mx-auto mt-6 font-semibold text-primary-dark text-sm">Lecciones</p>}
            <ul className={`text-left max-w-sm mx-auto ${graded ? "mt-2" : "mt-6"} space-y-2`}>
              {(graded ? course.lessons : course.lessons.slice(0, 6)).map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-2.5 text-sm text-gray-600"
                >
                  <Lock size={14} className="text-gray-300 shrink-0" />
                  {l.title}
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-5 text-white">
              <p className="font-bold">
                {course.premium ? `Curso de ${PRO_BRAND}` : "Registrate gratis y accedé a toda la Academia"}
              </p>
              <p className="text-white/80 text-sm mt-1">
                {course.premium
                  ? "Creá tu cuenta y activá Worka Pro para hacerlo, con certificado verificable."
                  : "Los cursos de la Academia son gratis para los usuarios de Worka."}
              </p>
              <Link
                href={`/registro?next=/academia/${course.slug}`}
                className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold px-6 py-3 rounded-xl mt-4 hover:bg-white/90"
              >
                Crear cuenta gratis <ArrowRight size={16} />
              </Link>
            </div>
            <Link
              href={`/ingresar?next=/academia/${course.slug}`}
              className="block text-sm text-primary mt-4"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Curso premium: el contenido de las lecciones no se envía sin Worka Pro.
  if (course.premium && !(await isCurrentUserPro())) {
    return (
      <main className="flex-1 bg-surface min-h-screen flex flex-col">
        <HomeNav />
        <div className="max-w-2xl mx-auto w-full px-4 py-10 space-y-4">
          <Link href="/academia" className="text-sm text-primary font-medium">← Academia</Link>
          <PlanLock
            title={course.title}
            text={`${course.description.slice(0, 220)} Este curso es parte de ${PRO_BRAND} e incluye certificado verificable.`}
            href="/pro#contratar"
            cta={`Desbloquear con ${PRO_BRAND}`}
          >
            <ul className="text-left text-sm text-muted space-y-1.5 mt-2">
              {course.lessons.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-center gap-2"><Lock size={13} /> {l.title}</li>
              ))}
            </ul>
          </PlanLock>
        </div>
      </main>
    );
  }

  const [completed, progress] = await Promise.all([
    getMyCompletions(course.id),
    graded ? getMyCourseProgress(course.id) : Promise.resolve({ lessons: {}, project: null }),
  ]);

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <HomeNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {graded ? (
        <CoursePlayer course={course} initialCompleted={[...completed]} progress={progress} suggested={suggested} />
      ) : (
        <CourseViewer course={course} initialCompleted={[...completed]} />
      )}
    </main>
  );
}
