import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getAllCompanies, getCustomBadges } from "@/lib/data";

export const metadata = { title: "Empresas e insignias" };

export default async function AdminCompaniesPage() {
  await requireAdmin("/admin/empresas");
  const [allCompanies, customBadges] = await Promise.all([
    seguro("getAllCompanies", () => getAllCompanies(), []),
    seguro("getCustomBadges", () => getCustomBadges(), []),
  ]);
  const verified = allCompanies.filter((c) => c.is_verified).length;
  return (
    <>
      <AdminPageHead
        title="Empresas e insignias"
        description={`${allCompanies.length.toLocaleString("es-PY")} empresas · ${verified.toLocaleString("es-PY")} verificadas. Creá insignias y asignalas a cada empresa.`}
      />
      <AdminPanel section="empresas" allCompanies={allCompanies} customBadges={customBadges} />
    </>
  );
}
