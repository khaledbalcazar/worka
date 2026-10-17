import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getAdminUsers } from "@/lib/data";

export const metadata = { title: "Usuarios" };

// Listar todas las cuentas de Supabase Auth puede tardar varios segundos.
export const maxDuration = 60;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin("/admin/usuarios");
  const [{ q }, adminUsers] = await Promise.all([
    searchParams,
    seguro("getAdminUsers", () => getAdminUsers(), { users: [], fullAccess: false }),
  ]);
  const byRole = (r: string) => adminUsers.users.filter((u) => u.role === r).length;
  return (
    <>
      <AdminPageHead
        title="Usuarios"
        description={`${adminUsers.users.length.toLocaleString("es-PY")} cuentas · ${byRole("candidate").toLocaleString("es-PY")} candidatos · ${byRole("company").toLocaleString("es-PY")} empresas · ${byRole("admin")} admins`}
      />
      <AdminPanel section="usuarios" adminUsers={adminUsers} initialUserQuery={q ?? ""} />
    </>
  );
}
