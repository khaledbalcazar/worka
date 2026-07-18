import JobFeed from "@/components/JobFeed";
import {
  getActiveJobs,
  getCurrentCandidate,
  getMyAppliedJobIds,
  getMySavedJobIds,
} from "@/lib/data";
import type { Candidate, JobWithCompany } from "@/lib/types";

export const metadata = { title: "Empleos" };

// Puntaje de afinidad: rubro > ciudad > primer empleo.
function matchScore(job: JobWithCompany, candidate: Candidate): number {
  let score = 0;
  if (candidate.preferences_industry.includes(job.industry)) score += 3;
  if (job.company.location_city === candidate.location_city) score += 2;
  if (candidate.first_job_mode && !job.requires_experience) score += 2;
  if (job.modality === "Remoto") score += 1; // llega desde cualquier ciudad
  return score;
}

export default async function JobFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string; rubro?: string }>;
}) {
  const [jobs, candidate, appliedIds, savedIds, params] = await Promise.all([
    getActiveJobs(),
    getCurrentCandidate(),
    getMyAppliedJobIds(),
    getMySavedJobIds(),
    searchParams,
  ]);

  const recommendedIds = candidate
    ? jobs
        .filter((j) => !appliedIds.has(j.id))
        .map((j) => ({ id: j.id, score: matchScore(j, candidate) }))
        .filter((x) => x.score >= 3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.id)
    : [];

  return (
    <JobFeed
      jobs={jobs}
      appliedJobIds={[...appliedIds]}
      savedJobIds={[...savedIds]}
      recommendedJobIds={recommendedIds}
      initialQuery={params.q ?? ""}
      initialCity={params.ciudad ?? ""}
      initialIndustry={params.rubro ?? ""}
    />
  );
}
