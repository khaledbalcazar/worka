import "./admin.css";
import AdminShell from "@/components/admin/AdminShell";
import { EMPTY_COUNTS, getAdminCounts, requireAdmin } from "@/lib/admin-stats";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  title: { default: "Backoffice", template: "%s · Backoffice Worka" },
  robots: { index: false, follow: false },
};

// Todo /admin pasa por acá: un solo control de acceso (antes cada página lo
// repetía y alguna podía olvidarlo) y la navegación con los pendientes.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [counts, user] = await Promise.all([
    getAdminCounts().catch(() => EMPTY_COUNTS),
    getCurrentUser().catch(() => null),
  ]);
  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Admin";
  return (
    <AdminShell counts={counts} adminName={name}>
      {children}
    </AdminShell>
  );
}
