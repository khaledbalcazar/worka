import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, GraduationCap, ArrowRight } from "lucide-react";
import { getCourse, getMyCompletions } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/supabase/config";
import SiteHeader from "@/components/SiteHeader";
import CourseViewer from "@/components/CourseViewer";

const BASE = SITE_URL.replace(/\/$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Curso no encontrado" };
  return {
    title: `${course.title} — Academia Worka`,
    description: course.description.slice(0, 155),
    alternates: { canonical: `/academia/${course.slug}` },
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
    description: course.description,
    provider: { "@type": "Organization", name: "Worka", sameAs: BASE },
  };

  // Contenido tras registro: sin sesión, mostramos la portada + CTA.
  if (!user) {
    return (
      <main className="flex-1 bg-surface min-h-screen flex flex-col">
        <SiteHeader active="/academia" />
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

            <ul className="text-left max-w-sm mx-auto mt-6 space-y-2">
              {course.lessons.slice(0, 6).map((l) => (
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
                Registrate gratis y accedé a toda la Academia
              </p>
              <p className="text-white/80 text-sm mt-1">
                Todos los cursos son gratis para los usuarios de Worka.
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

  const completed = await getMyCompletions(course.id);

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <SiteHeader active="/academia" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseViewer course={course} initialCompleted={[...completed]} />
    </main>
  );
}
