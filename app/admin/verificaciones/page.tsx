import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getAllReferences, getIdentityDocUrls, getPendingCompanies, getPendingIdentities } from "@/lib/data";

export const metadata = { title: "Verificaciones" };

export default async function AdminVerificationsPage() {
  await requireAdmin("/admin/verificaciones");
  const [pendingCompanies, pendingIdentities, references] = await Promise.all([
    seguro("getPendingCompanies", () => getPendingCompanies(), []),
    seguro("getPendingIdentities", () => getPendingIdentities(), []),
    seguro("getAllReferences", () => getAllReferences(), []),
  ]);
  // Links firmados de cada documento (vencen solos).
  const identityQueue = await Promise.all(
    pendingIdentities.map(async (c) => ({
      ...c,
      docs: await seguro("getIdentityDocUrls", () => getIdentityDocUrls(c.id), []),
    }))
  );
  return (
    <>
      <AdminPageHead
        title="Verificaciones"
        description="Registro fiscal de las empresas, identidad de los candidatos y referencias laborales."
      />
      <AdminPanel
        section="verificaciones"
        pendingCompanies={pendingCompanies}
        identityQueue={identityQueue}
        references={references}
      />
    </>
  );
}
