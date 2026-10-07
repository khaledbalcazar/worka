import type { ExternalJob, JobWithCompany } from "@/lib/types";

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export type SearchFilters = {
  query: string; city: string; industry: string; modality: string; contract: string;
  firstJobOnly: boolean; onlyVerified: boolean; withSalary: boolean; hideApplied: boolean;
};

export function matchesJob(job: JobWithCompany, filters: SearchFilters, applied: Set<string>) {
  return !(filters.firstJobOnly && job.requires_experience) &&
    !(filters.onlyVerified && !job.company.is_verified) &&
    !(filters.withSalary && !job.salary_range?.trim()) &&
    !(filters.hideApplied && applied.has(job.id)) &&
    (!filters.city || normalizeSearch(job.company.location_city) === normalizeSearch(filters.city)) &&
    (!filters.industry || job.industry === filters.industry) &&
    (!filters.modality || job.modality === filters.modality) &&
    (!filters.contract || job.contract_type === filters.contract) &&
    normalizeSearch(`${job.title} ${job.company.trade_name} ${job.industry}`).includes(normalizeSearch(filters.query));
}

export function matchesExternalJob(job: ExternalJob, filters: SearchFilters) {
  // External listings have no verified employer or reliable experience requirement.
  if (filters.onlyVerified || filters.firstJobOnly) return false;
  return !(filters.withSalary && !job.salary_range?.trim()) &&
    (!filters.city || normalizeSearch(job.city ?? "") === normalizeSearch(filters.city)) &&
    (!filters.industry || job.industry === filters.industry) &&
    (!filters.modality || job.modality === filters.modality) &&
    (!filters.contract || job.contract_type === filters.contract) &&
    normalizeSearch(`${job.title} ${job.company_name} ${job.industry ?? ""}`).includes(normalizeSearch(filters.query));
}
