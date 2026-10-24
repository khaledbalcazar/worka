import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCurrentCompany, isLive } from "@/lib/data";
import { getLinkableJobs, getMyEvaluarAccess, getMyProcesses } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import AccountSettings from "@/components/evaluar/AccountSettings";

export const metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp%2Fajustes");
  }
  const [company, user, access, processes, jobs] = await Promise.all([
    getCurrentCompany(),
    getCurrentUser(),
    getMyEvaluarAccess(),
    getMyProcesses(),
    getLinkableJobs(),
  ]);
  const plan = planOf(access);
  const propios = processes.filter((p) => p.esDueno !== false && !p.archived);
  const c = company as (typeof company & { email_notifications?: boolean }) | null;

  return (
    <div>
      <div className="ev-page-head">
        <div>
          <h1>Ajustes</h1>
          <p>Tu empresa, tu cuenta y cómo trabaja Evaluar con Worka Empresas.</p>
        </div>
      </div>
      <AccountSettings
        data={{
          companyName: c?.trade_name || c?.company_name || "Tu empresa",
          legalName: c?.company_name ?? "",
          ruc: c?.ruc ?? "—",
          verified: !!c?.is_verified,
          logoUrl: c?.logo_url ?? null,
          description: c?.description ?? "",
          city: c?.location_city ?? "",
          website: c?.website_url ?? "",
          email: user?.email ?? "",
          emailNotifications: c?.email_notifications !== false,
          plan: {
            label: plan.label,
            inTrial: access.inTrial,
            active: access.active,
            daysLeft: access.daysLeft,
            limit: plan.activeProcesses,
            activeCount: propios.filter((p) => p.status === "activo").length,
          },
          processCount: propios.length,
          activeJobs: jobs.length,
          linkedJobs: jobs.filter((j) => j.linked).length,
        }}
      />
    </div>
  );
}
