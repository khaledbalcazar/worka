import Link from "next/link";
import EvaluarPromo from "@/components/evaluar/EvaluarPromo";
import CompanyDashboard from "@/components/CompanyDashboard";
import {
  getCompanyActivity,
  getCompanyStats,
  getCurrentCompany,
  getJobsByCompany,
  getSiteSettings,
} from "@/lib/data";
import { enterprisePlan, paymentLink } from "@/lib/plans";
import { getCompanySubscription, getEnterprisePlanId, getPromotionUsage } from "@/lib/subscriptions";
import { getCurrentUser } from "@/lib/supabase/server";
import { redeemSignupPromo } from "@/lib/promo-server";
import PromoWelcome from "@/components/plans/PromoWelcome";

export const metadata = { title: "Panel de empresa" };

export default async function CompanyDashboardPage({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const [{ bienvenida }, company] = await Promise.all([searchParams, getCurrentCompany()]);

  if (!company) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <p className="text-3xl mb-2">🏢</p>
        <p className="font-semibold text-primary-dark">
          Tu cuenta todavía no tiene una empresa registrada
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Registrá tu empresa con su RUC para empezar a publicar vacantes.
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  // Red de seguridad del canje de la promoción: si el callback no llegó a
  // activarla (por ejemplo, ingresó con contraseña sin pasar por el link),
  // se activa en la primera visita al panel.
  const promo = await redeemSignupPromo(await getCurrentUser());

  const [jobs, settings, stats, activity, planId, subscription, usage] = await Promise.all([
    getJobsByCompany(company.id),
    getSiteSettings(),
    getCompanyStats(company.id),
    getCompanyActivity(company.id),
    getEnterprisePlanId(company.id),
    getCompanySubscription(company.id),
    getPromotionUsage(company.id),
  ]);
  const plan = enterprisePlan(planId);
  const { ofertaDestacados } = await import("@/lib/billing/ofertas");
  const destacadosTarjeta = ofertaDestacados(settings);
  return (
    <div className="space-y-4">
      {/* Puerta de entrada a Worka Evaluar desde donde la empresa ya trabaja:
          si vive solo en su propio dominio, nadie se entera de que existe. */}
      {(promo.redeemed || bienvenida === "promo") && subscription && (
        <PromoWelcome
          company={company.trade_name || company.company_name}
          code={subscription.promo_code ?? promo.code ?? null}
          endsAt={subscription.ends_at}
          hasJobs={jobs.length > 0}
        />
      )}
      <EvaluarPromo />
      <CompanyDashboard
        company={company}
        jobs={jobs}
        paymentLink={paymentLink("enterprise", settings) ?? ""}
        destacadosTarjeta={destacadosTarjeta}
        plan={{ id: plan.id, name: plan.name, endsAt: subscription?.ends_at ?? null, limits: plan.limits, usage }}
        stats={stats}
        activity={activity}
      />
    </div>
  );
}
