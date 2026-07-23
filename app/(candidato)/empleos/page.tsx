import JobFeed from "@/components/JobFeed";
import {
  getActiveJobs,
  getCurrentCandidate,
  getExternalJobs,
  getMyAppliedJobIds,
  getMySavedJobIds,
  getSiteSettings,
} from "@/lib/data";
import { INDUSTRIES } from "@/lib/mock-data";
import { countryByCode } from "@/lib/countries";
import { getActiveCountry } from "@/lib/country-context";
import type { Candidate, JobWithCompany } from "@/lib/types";

export const metadata = { title: "Empleos" };

// Puntaje de afinidad (alimentado por el test de perfil):
// rubro > ciudad/movilidad > primer empleo > modalidad preferida.
const MAX_MATCH_SCORE = 9;

function matchScore(job: JobWithCompany, candidate: Candidate): number {
  let score = 0;
  if (candidate.preferences_industry.includes(job.industry)) score += 3;
  if (
    job.company.location_city === candidate.location_city ||
    job.modality === "Remoto" ||
    candidate.open_to_other_cities
  )
    score += 2;
  if (candidate.first_job_mode && !job.requires_experience) score += 2;
  const prefModality = candidate.preferences_modality;
  if (
    !prefModality ||
    prefModality === "Cualquiera" ||
    prefModality === "Full-time" || // valor histórico previo al test
    prefModality === job.modality
  )
    score += 2;
  return score;
}

export default async function JobFeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    ciudad?: string;
    rubro?: string;
    modalidad?: string;
    contrato?: string;
    primerEmpleo?: string;
  }>;
}) {
  const [allJobs, candidate, appliedIds, savedIds, settings, params, active] =
    await Promise.all([
      getActiveJobs(),
      getCurrentCandidate(),
      getMyAppliedJobIds(),
      getMySavedJobIds(),
      getSiteSettings(),
      searchParams,
      getActiveCountry(),
    ]);

  // País del feed: el del candidato si está logueado, si no el de la cookie.
  const country = candidate?.country
    ? countryByCode(candidate.country)
    : active;

  // Solo vacantes de ese país (las de empresas de ese país + externas).
  const jobs = allJobs.filter((j) => (j.company.country ?? "py") === country.code);
  const externalJobs = await getExternalJobs(country.code);

  // Listas del sitio: ciudades del país + las que el admin agregó.
  const extra = (value: string | undefined) =>
    (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const industries = [...new Set([...INDUSTRIES, ...extra(settings.custom_industries)])];
  const cities = [...new Set([...country.cities, ...extra(settings.custom_cities)])];

  const scored = candidate
    ? jobs
        .filter((j) => !appliedIds.has(j.id))
        .map((j) => ({ id: j.id, score: matchScore(j, candidate) }))
        .filter((x) => x.score >= 4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
    : [];
  const recommendedIds = scored.map((x) => x.id);
  // Porcentaje de match visible en cada tarjeta recomendada
  const matchScores = Object.fromEntries(
    scored.map((x) => [x.id, Math.round((x.score / MAX_MATCH_SCORE) * 100)])
  );

  return (
    <JobFeed
      jobs={jobs}
      appliedJobIds={[...appliedIds]}
      savedJobIds={[...savedIds]}
      recommendedJobIds={recommendedIds}
      matchScores={matchScores}
      industries={industries}
      cities={cities}
      initialQuery={params.q ?? ""}
      initialCity={params.ciudad ?? ""}
      initialIndustry={params.rubro ?? ""}
      initialModality={params.modalidad ?? ""}
      initialContract={params.contrato ?? ""}
      initialFirstJob={params.primerEmpleo === "1"}
      externalJobs={externalJobs}
    />
  );
}
