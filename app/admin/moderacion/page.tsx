import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getDetailedReports, getModerationQueue, getPendingIndustryTags, getReports } from "@/lib/data";

export const metadata = { title: "Moderación" };

export default async function AdminModerationPage() {
  await requireAdmin("/admin/moderacion");
  const [moderationQueue, reports, detailedReports, pendingIndustries] = await Promise.all([
    seguro("getModerationQueue", () => getModerationQueue(), []),
    seguro("getReports", () => getReports(), []),
    seguro("getDetailedReports", () => getDetailedReports(), []),
    seguro("getPendingIndustryTags", () => getPendingIndustryTags(), []),
  ]);
  return (
    <>
      <AdminPageHead
        title="Moderación"
        description="Vacantes retenidas por el filtro, denuncias de la comunidad y rubros nuevos que propusieron las empresas."
      />
      <AdminPanel
        section="moderacion"
        moderationQueue={moderationQueue}
        reports={reports}
        detailedReports={detailedReports}
        pendingIndustries={pendingIndustries}
      />
    </>
  );
}
