import { redirect, notFound } from "next/navigation";
import { getCourse, getMyCompletions, getCurrentCandidate } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import Certificate from "@/components/Certificate";

export const metadata = { title: "Certificado — Academia Worka" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course || course.status !== "publicado") notFound();
  if (!user) redirect(`/ingresar?next=/academia/${slug}/certificado`);

  const [completed, candidate] = await Promise.all([
    getMyCompletions(course.id),
    getCurrentCandidate(),
  ]);

  // El certificado solo se emite con el curso 100% completado.
  const total = course.lessons.length;
  if (total === 0 || completed.size < total) {
    redirect(`/academia/${slug}`);
  }

  const name = candidate?.full_name?.trim() || "Estudiante de Worka";
  const dateStr = new Date().toLocaleDateString("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Certificate
      name={name}
      courseTitle={course.title}
      dateStr={dateStr}
      courseSlug={slug}
    />
  );
}
