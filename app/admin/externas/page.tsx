import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin } from "@/lib/admin-stats";
import ExternalJobsAdmin from "@/components/ExternalJobsAdmin";
import {
  externalJobsEnabled,
  getAllExternalJobs,
  getJobSources,
} from "@/lib/data";

export const metadata = { title: "Vacantes externas" };

export default async function AdminExternalPage() {
  await requireAdmin("/admin/externas");

  const [enabled, sources, jobs] = await Promise.all([
    externalJobsEnabled(),
    getJobSources(),
    getAllExternalJobs(),
  ]);

  return (
    <>
      <AdminPageHead title="Vacantes externas" description="Fuentes de vacantes importadas, su estado y la moderación de cada una." />
      <ExternalJobsAdmin enabled={enabled} sources={sources} jobs={jobs} />
    </>
  );
}
