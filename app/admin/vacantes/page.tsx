import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getAllJobsForAdmin, getBoostRequests } from "@/lib/data";

export const metadata = { title: "Vacantes" };

export default async function AdminJobsPage() {
  await requireAdmin("/admin/vacantes");
  const [allJobs, boosts] = await Promise.all([
    seguro("getAllJobsForAdmin", () => getAllJobsForAdmin(), []),
    seguro("getBoostRequests", () => getBoostRequests(), []),
  ]);
  return (
    <>
      <AdminPageHead
        title="Vacantes"
        description="Todas las vacantes publicadas, destaques pagos por confirmar e indexación en buscadores."
      />
      <AdminPanel section="vacantes" allJobs={allJobs} boosts={boosts} />
    </>
  );
}
