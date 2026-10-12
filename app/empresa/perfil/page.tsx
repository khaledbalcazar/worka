import Link from "next/link";
import {
  getCompanyMembers,
  getCompanyPosts,
  getCurrentCompany,
  getCustomBadges,
} from "@/lib/data";
import { resolveBadges } from "@/lib/types";
import CompanyProfileEditor from "@/components/CompanyProfileEditor";
import CompanyBrandingEditor from "@/components/plans/CompanyBrandingEditor";
import PlanLock from "@/components/plans/PlanLock";
import { getEnterpriseLimits } from "@/lib/subscriptions";

export const metadata = { title: "Perfil de empresa" };

export default async function CompanyProfilePage() {
  const company = await getCurrentCompany();

  if (!company) {
    return (
      <div className="max-w-md card p-8 text-center">
        <p className="font-semibold text-primary-dark">
          Primero registrá tu empresa
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  const [posts, members, customBadges, limits] = await Promise.all([
    getCompanyPosts(company.id),
    getCompanyMembers(company.id),
    getCustomBadges(),
    getEnterpriseLimits(company.id),
  ]);
  // Solo las personalizadas que esta empresa tiene otorgadas.
  const earnedCustom = resolveBadges(
    company.badges,
    customBadges
  ).filter((b) => customBadges.some((c) => c.id === b.id));
  return (
    <div className="space-y-6">
      <CompanyProfileEditor
        company={company}
        posts={posts}
        members={members}
        earnedCustomBadges={earnedCustom}
      />
      <div className="max-w-3xl">
        {limits.brandedPage ? (
          <CompanyBrandingEditor
            initial={{
              brand_color: company.brand_color ?? null,
              culture: company.culture ?? null,
              perks: company.perks ?? [],
              video_url: company.video_url ?? null,
            }}
          />
        ) : (
          <PlanLock
            title="Mostrá tu marca empleadora"
            text="Con el plan Empresa tu página suma el color de tu marca, por qué trabajar con ustedes, los beneficios y un video."
            href="/empresa/planes?plan=empresa#contratar"
            cta="Ver el plan Empresa"
          />
        )}
      </div>
    </div>
  );
}
