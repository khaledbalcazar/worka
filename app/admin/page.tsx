import AdminDashboard from "@/components/admin/AdminDashboard";
import { EMPTY_COUNTS, getAdminCounts, getAdminDashboard, requireAdmin, seguro } from "@/lib/admin-stats";

export const metadata = { title: "Estadísticas" };

// Las estadísticas hacen varias decenas de conteos: con el límite por
// defecto la función podía cortarse antes de terminar.
export const maxDuration = 60;

export default async function AdminHomePage() {
  await requireAdmin("/admin");
  const [data, counts] = await Promise.all([
    getAdminDashboard(),
    seguro("getAdminCounts", () => getAdminCounts(), EMPTY_COUNTS),
  ]);
  return <AdminDashboard data={data} counts={counts} />;
}
