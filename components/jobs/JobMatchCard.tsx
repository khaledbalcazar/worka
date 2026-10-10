import Link from "next/link";
import { CheckCircle2, Circle, Sparkles, XCircle } from "lucide-react";
import { jobMatch, type MatchCandidate, type MatchJob } from "@/lib/job-match";

// "Tu compatibilidad con este empleo": compara la vacante con lo que el
// candidato declaró en su perfil. Sin perfil, invita a crearlo.
export default function JobMatchCard({
  candidate,
  job,
}: {
  candidate: MatchCandidate | null;
  job: MatchJob & { title: string };
}) {
  if (!candidate) {
    return (
      <section className="job-match" aria-labelledby="job-match-title">
        <h2 id="job-match-title"><Sparkles size={18} /> Tu compatibilidad con este empleo</h2>
        <p className="job-match-lead">Creá tu perfil y te mostramos cuánto encaja esta vacante con tu ciudad, rubros y experiencia.</p>
        <Link href="/onboarding" className="btn-secondary !min-h-10 mt-3">Crear mi perfil gratis</Link>
      </section>
    );
  }

  const match = jobMatch(candidate, job);
  const tone = match.percent >= 80 ? "is-high" : match.percent >= 50 ? "is-mid" : "is-low";
  return (
    <section className="job-match" aria-labelledby="job-match-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="job-match-title"><Sparkles size={18} /> Tu compatibilidad con este empleo</h2>
        <span className={`job-match-badge ${tone}`}>{match.percent}% · {match.level}</span>
      </div>
      <p className="job-match-lead">
        Coincidís en <strong>{match.met} de {match.total}</strong> puntos de tu perfil de Worka para <strong>{job.title}</strong>:
      </p>
      <ul className="job-match-list">
        {match.items.map((item) => (
          <li key={item.key} className={`is-${item.status}`}>
            {item.status === "met" ? <CheckCircle2 size={16} aria-label="Cumple" /> : item.status === "unmet" ? <XCircle size={16} aria-label="No coincide" /> : <Circle size={16} aria-label="Sin datos" />}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <p className="job-match-note">
        Calculado con tus preferencias. No es una decisión de la empresa.{" "}
        <Link href="/perfil#preferencias">Ajustar mi perfil</Link>
      </p>
    </section>
  );
}
