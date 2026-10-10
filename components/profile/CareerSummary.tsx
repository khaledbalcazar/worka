import { Award, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import CourseBadges from "@/components/profile/CourseBadges";
import { educationPeriod, experiencePeriod } from "@/lib/career";
import type { CareerData } from "@/lib/types";
import "./career.css";

// Versión de solo lectura de la trayectoria: perfil público y vista de la
// empresa. Las secciones vacías no se muestran.
export default function CareerSummary({ career }: { career: CareerData }) {
  return (
    <>
      {career.experience.length > 0 && (
        <section className="card p-5">
          <h2 className="career-heading"><Briefcase size={18} /> Experiencia laboral</h2>
          <ul className="career-list">
            {career.experience.map((e) => (
              <li key={e.id}>
                <span className="career-icon"><Briefcase size={17} /></span>
                <div className="min-w-0 flex-1">
                  <strong>{e.role}</strong>
                  <p>{e.company}</p>
                  <small>{experiencePeriod(e)}</small>
                  {e.description && <p className="career-description">{e.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {career.education.length > 0 && (
        <section className="card p-5">
          <h2 className="career-heading"><GraduationCap size={18} /> Estudios</h2>
          <ul className="career-list">
            {career.education.map((e) => (
              <li key={e.id}>
                <span className="career-icon"><GraduationCap size={17} /></span>
                <div className="min-w-0 flex-1">
                  <strong>{e.title}</strong>
                  <p>{e.institution}</p>
                  <small>{e.level} · {educationPeriod(e)}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {career.skills.length > 0 && (
        <section className="card p-5">
          <h2 className="career-heading"><Sparkles size={18} /> Habilidades</h2>
          <ul className="skill-list is-readonly">
            {career.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      )}
      {career.courses.length > 0 && (
        <section className="card p-5">
          <h2 className="career-heading"><Award size={18} /> Cursos completados en Academia Worka</h2>
          <CourseBadges courses={career.courses} linkToCertificate={false} />
        </section>
      )}
    </>
  );
}
