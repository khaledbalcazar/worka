import type { Metadata } from "next";
import PromoOfferLanding from "@/components/plans/PromoOfferLanding";
import { getActiveCountry } from "@/lib/country-context";
import { getSiteSettings } from "@/lib/data";
import { ENTERPRISE_BRAND, localMonthlyPrice } from "@/lib/plans";
import { LAUNCH_PROMO, isPromoOpen, normalizePromoCode } from "@/lib/promo";

export const metadata: Metadata = {
  title: `3 meses de ${ENTERPRISE_BRAND} y Worka Evaluar sin costo — Oferta para empresas nuevas`,
  description: `Registrá tu empresa en Worka con el código ${LAUNCH_PROMO.code} y usá ${ENTERPRISE_BRAND} · Pro y Worka Evaluar · Profesional gratis durante 3 meses. Válido hasta el ${LAUNCH_PROMO.deadlineLabel}.`,
  alternates: { canonical: "/para-empresas/oferta" },
};

export default async function PromoOfferPage({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const [{ codigo }, country, settings] = await Promise.all([searchParams, getActiveCountry(), getSiteSettings()]);
  const monthly = localMonthlyPrice("enterprise", "pro", country.code, settings);
  const typed = normalizePromoCode(codigo);
  return (
    <PromoOfferLanding
      countryName={country.name}
      value={{ amount: monthly.amount * LAUNCH_PROMO.months, currency: monthly.currency }}
      open={isPromoOpen()}
      wrongCode={typed !== "" && typed !== LAUNCH_PROMO.code ? typed : null}
    />
  );
}
