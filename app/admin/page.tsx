import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AdminPanel from "@/components/AdminPanel";
import AdminSubscriptions from "@/components/evaluar/AdminSubscriptions";
import AdminAiKeys from "@/components/evaluar/AdminAiKeys";
import EmailTemplates from "@/components/admin/EmailTemplates";
import { getAiKeys, getEvaluarAccounts } from "@/lib/evaluar";
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
  getEmailTemplateOverrides,
  isLive,
} from "@/lib/data";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Backoffice" };

// Cada panel del backoffice trae sus datos por su cuenta, y una sola consulta
// rota tumbaba la pantalla entera: el Promise.all rechaza con la primera que
// falle y la pagina devuelve 500. Paso justo con un 500 del endpoint de
// usuarios de Supabase Auth, y el resultado fue quedarse sin backoffice —
// sin poder moderar, sin poder cobrar y sin poder ver por que.
//
// Ahora lo que falla devuelve su valor vacio y deja un rastro en el log. Un
// panel en blanco es un problema; no poder entrar es otro mucho mas caro.
async function seguro<T>(etiqueta: string, fn: () => Promise<T>, vacio: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`admin: fallo ${etiqueta}`, e);
    return vacio;
  }
}

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
    emailOverrides,
    aiKeys,
  ] = await Promise.all([
    seguro("getModerationQueue", () => getModerationQueue(), []),
    seguro("getReports", () => getReports(), []),
    seguro("getPendingCompanies", () => getPendingCompanies(), []),
    seguro("getAllCompanies", () => getAllCompanies(), []),
    seguro("getActiveJobsCount", () => getActiveJobsCount(), 0),
    seguro("getPendingIdentities", () => getPendingIdentities(), []),
    seguro("getAllReferences", () => getAllReferences(), []),
    seguro("getBoostRequests", () => getBoostRequests(), []),
    seguro("getSiteSettings", () => getSiteSettings(), {} as Awaited<
      ReturnType<typeof getSiteSettings>
    >),
    seguro("getPendingIndustryTags", () => getPendingIndustryTags(), []),
    seguro("getAdminUsers", () => getAdminUsers(), {
      users: [],
      fullAccess: false,
    }),
    // Ceros y no null: pasar null solo mudaria el crash al componente que
    // lee globalStats.candidates.
    seguro("getGlobalStats", () => getGlobalStats(), {
      candidates: 0,
      companies: 0,
      activeJobs: 0,
      totalJobs: 0,
      applications: 0,
      applicationsThisWeek: 0,
      contactedRate: 0,
      signupsByDay: [],
    }),
    seguro("getDetailedReports", () => getDetailedReports(), []),
    seguro("getAllJobsForAdmin", () => getAllJobsForAdmin(), []),
    seguro("getCustomBadges", () => getCustomBadges(), []),
    seguro("getEvaluarAccounts", () => getEvaluarAccounts(), []),
    seguro("getEmailTemplateOverrides", () => getEmailTemplateOverrides(), []),
    seguro("getAiKeys", () => getAiKeys(), []),
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

      {/* Claves del asistente de IA. Varias por proveedor: con una sola, el
          tope por minuto de Groq lo deja caido justo cuando mas se usa. */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <AdminAiKeys keys={aiKeys} />
      </div>

      {/* Editor de los correos que manda la plataforma. */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <EmailTemplates overrides={emailOverrides} />
      </div>
    </div>
  );
}
