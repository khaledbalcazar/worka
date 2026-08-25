import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AdminPanel from "@/components/AdminPanel";
import AdminSubscriptions from "@/components/evaluar/AdminSubscriptions";
import { getEvaluarAccounts } from "@/lib/evaluar";
import {
  getActiveJobsCount,
  getAllCompanies,
  getAllReferences,
  getBoostRequests,
  getIdentityDocUrls,
  getModerationQueue,
  getPendingCompanies,
  getPendingIdentities,
  getReports,
  getAdminUsers,
  getAllJobsForAdmin,
  getCustomBadges,
  getDetailedReports,
  getGlobalStats,
  getPendingIndustryTags,
  getSiteSettings,
  isLive,
} from "@/lib/data";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Backoffice" };

export default async function AdminPage() {
  // En modo live, solo el rol 'admin' puede entrar.
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=/admin");
    const supabase = await getServerClient();
    const { data: profile } = await supabase!
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") redirect("/");
  }

  const [
    moderationQueue,
    reports,
    pendingCompanies,
    allCompanies,
    activeJobsCount,
    pendingIdentities,
    references,
    boosts,
    settings,
    pendingIndustries,
    adminUsers,
    globalStats,
    detailedReports,
    allJobs,
    customBadges,
    evaluarAccounts,
  ] = await Promise.all([
    getModerationQueue(),
    getReports(),
    getPendingCompanies(),
    getAllCompanies(),
    getActiveJobsCount(),
    getPendingIdentities(),
    getAllReferences(),
    getBoostRequests(),
    getSiteSettings(),
    getPendingIndustryTags(),
    getAdminUsers(),
    getGlobalStats(),
    getDetailedReports(),
    getAllJobsForAdmin(),
    getCustomBadges(),
    getEvaluarAccounts(),
  ]);

  const identityQueue = await Promise.all(
    pendingIdentities.map(async (c) => ({
      ...c,
      docs: await getIdentityDocUrls(c.id),
    }))
  );

  return (
    <div className="flex-1 bg-surface min-h-screen">
      <header className="bg-primary-dark text-white px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo light href="/admin" />
          <span className="chip bg-white/10 text-blue-200">Backoffice</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="text-sm text-blue-200 underline">
            📝 Blog
          </Link>
          <Link
            href="/admin/externas"
            className="text-sm text-blue-200 underline"
          >
            🌐 Externas
          </Link>
          <Link
            href="/admin/academia"
            className="text-sm text-blue-200 underline"
          >
            🎓 Academia
          </Link>
          <Link href="/" className="text-sm text-blue-200 underline">
            Salir
          </Link>
        </div>
      </header>
      <AdminPanel
        moderationQueue={moderationQueue}
        reports={reports}
        pendingCompanies={pendingCompanies}
        allCompanies={allCompanies}
        activeJobsCount={activeJobsCount}
        identityQueue={identityQueue}
        references={references}
        boosts={boosts}
        settings={settings}
        pendingIndustries={pendingIndustries}
        adminUsers={adminUsers}
        globalStats={globalStats}
        detailedReports={detailedReports}
        allJobs={allJobs}
        customBadges={customBadges}
      />

      {/* Suscripciones de Worka Evaluar. Va como seccion aparte porque el
          cobro es manual: es la pantalla donde se activa a quien pago. */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <AdminSubscriptions accounts={evaluarAccounts} />
      </div>
    </div>
  );
}
