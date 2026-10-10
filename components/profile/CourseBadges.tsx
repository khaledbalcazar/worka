import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";
import type { CourseBadge } from "@/lib/types";
import "./career.css";

// Insignias de los cursos de Academia terminados al 100%. Cada una enlaza al
// certificado (para la dueña del perfil) o a la página del curso.
const TONES: Record<string, string> = {
  Entrevistas: "is-blue",
  Habilidades: "is-green",
  Empleo: "is-clay",
};

export default function CourseBadges({
  courses,
  emptyHint = false,
  linkToCertificate = true,
}: {
  courses: CourseBadge[];
  emptyHint?: boolean;
  linkToCertificate?: boolean;
}) {
  if (courses.length === 0) {
    return emptyHint ? (
      <div className="course-badges-empty">
        <GraduationCap size={22} />
        <p>
          Terminá un curso gratis de Academia Worka y su insignia aparece acá y en tu perfil público.{" "}
          <Link href="/academia">Ver cursos</Link>
        </p>
      </div>
    ) : null;
  }
  return (
    <ul className="course-badges">
      {courses.map((c) => (
        <li key={c.course_id}>
          <Link
            href={linkToCertificate ? `/academia/${c.slug}/certificado` : `/academia/${c.slug}`}
            className={`course-badge ${TONES[c.category] ?? "is-blue"}`}
          >
            <span className="course-badge-medal"><Award size={20} /></span>
            <span className="min-w-0">
              <strong>{c.title}</strong>
              <small>
                {c.category} · Completado{" "}
                {new Date(c.completed_at).toLocaleDateString("es-PY", { month: "short", year: "numeric" })}
              </small>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
