import { redirect, notFound } from "next/navigation";
import { getCourse, getMyCompletions, getCurrentCandidate } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import Certificate from "@/components/Certificate";
import { issueCertificate } from "@/app/plans-actions";
import { isCurrentUserPro } from "@/lib/subscriptions";
import { CANONICAL_URL } from "@/lib/supabase/config";

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

  if (course.premium && !(await isCurrentUserPro())) redirect(`/academia/${slug}`);

  // Código verificable (migración 047). Sin la migración, el certificado
  // se muestra igual, sin código.
  const issued = await issueCertificate(course.id);
  const code = issued.ok ? issued.code ?? null : null;

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
      code={code}
      verifyUrl={code ? `${CANONICAL_URL}/certificado/${code}` : null}
    />
  );
}
