import PlansAdmin from "@/components/admin/PlansAdmin";
import AdminSubscriptions from "@/components/evaluar/AdminSubscriptions";
import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getAdminUsers, getSiteSettings } from "@/lib/data";
import { getAdminPlansData } from "@/lib/subscriptions";
import { getEvaluarAccounts } from "@/lib/evaluar";

export const metadata = { title: "Pagos y planes" };

export const maxDuration = 60;

export default async function AdminPaymentsPage() {
  await requireAdmin("/admin/pagos");
  const [data, adminUsers, settings, accounts] = await Promise.all([
    seguro("getAdminPlansData", () => getAdminPlansData(), { payments: [], subscriptions: [], receipts: {} }),
    seguro("getAdminUsers", () => getAdminUsers(), { users: [], fullAccess: false }),
    seguro("getSiteSettings", () => getSiteSettings(), {} as Record<string, string>),
    seguro("getEvaluarAccounts", () => getEvaluarAccounts(), []),
  ]);
  const pending = data.payments.filter((p) => p.status === "pendiente").length;
  return (
    <>
      <AdminPageHead
        title="Pagos y planes"
        description={`Cobro manual de Worka Enterprise Pro, Worka Pro y Worka Evaluar.${pending ? ` ${pending} ${pending === 1 ? "pago espera" : "pagos esperan"} confirmación.` : ""}`}
      />
      <div className="space-y-8">
        <PlansAdmin
          payments={data.payments}
          subscriptions={data.subscriptions}
          receipts={data.receipts}
          users={adminUsers.users.map((u) => ({ id: u.id, email: u.email, role: u.role, name: u.name }))}
          settings={settings}
        />
        <AdminSubscriptions accounts={accounts} />
      </div>
    </>
  );
}
