import { getJobsWithEvaluation } from "@/lib/evaluar";
import JobFeed from "@/components/JobFeed";
import {
  getActiveJobs,
  getCurrentCandidate,
  getExperienceCount,
  getExternalJobs,
  getMyAppliedJobIds,
  getMySavedJobIds,
  getSiteSettings,
  isLive,
} from "@/lib/data";
import { INDUSTRIES } from "@/lib/mock-data";
import { countryByCode } from "@/lib/countries";
import { getActiveCountry } from "@/lib/country-context";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Buscar empleos",
  description:
    "Explorá miles de vacantes de empleo actualizadas cada día: ventas, gastronomía, logística, administración y más. Postulate gratis y encontrá trabajo cerca tuyo con Worka.",
};

export default async function JobFeedPage() {
  const [allJobs, candidate, appliedIds, savedIds, settings, active] =
    await Promise.all([
      getActiveJobs(),
      getCurrentCandidate(),
      getMyAppliedJobIds(),
      getMySavedJobIds(),
      getSiteSettings(),
      getActiveCountry(),
    ]);

  // País del feed: el del candidato si está logueado, si no el de la cookie.
  const country = candidate?.country
    ? countryByCode(candidate.country)
    : active;

  // Solo vacantes de ese país (las de empresas de ese país + externas).
  const jobs = allJobs.filter((j) => (j.company.country ?? "py") === country.code);
  const [externalJobs, evaluationJobIds] = await Promise.all([getExternalJobs(country.code), getJobsWithEvaluation(jobs.map((job) => job.id))]);

  // Listas del sitio: ciudades del país + las que el admin agregó.
  const extra = (value: string | undefined) =>
    (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const industries = [...new Set([...INDUSTRIES, ...extra(settings.custom_industries)])];
  const cities = [...new Set([...country.cities, ...extra(settings.custom_cities)])];

  const loggedIn = isLive() ? !!(await getCurrentUser()) : true;
  const experienceCount = candidate ? await getExperienceCount(candidate.id) : 0;

  return (
    <JobFeed
      jobs={jobs}
      evaluationJobIds={evaluationJobIds}
      appliedJobIds={[...appliedIds]}
      savedJobIds={[...savedIds]}
      loggedIn={loggedIn}
      industries={industries}
      cities={cities}
      externalJobs={externalJobs}
      matchProfile={candidate ? {
        location_city: candidate.location_city,
        open_to_other_cities: candidate.open_to_other_cities,
        preferences_modality: candidate.preferences_modality,
        preferences_industry: candidate.preferences_industry,
        first_job_mode: candidate.first_job_mode,
        cv_url: candidate.cv_url,
        experience_count: experienceCount,
        skills: candidate.skills ?? [],
      } : null}
    />
  );
}
