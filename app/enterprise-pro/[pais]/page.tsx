import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EnterpriseProLanding from "@/components/plans/EnterpriseProLanding";
import { COUNTRIES, countryBySlug } from "@/lib/countries";
import { getSiteSettings } from "@/lib/data";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ pais: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pais: string }> }): Promise<Metadata> {
  const country = countryBySlug((await params).pais);
  if (!country) return { title: "Worka Enterprise Pro" };
  return {
    title: `Worka Enterprise Pro en ${country.name}`,
    description: "Planes para empresas: vacantes sin límite, destacadas, alertas urgentes, búsqueda de talento y marca empleadora.",
    alternates: { canonical: `/enterprise-pro/${country.slug}` },
  };
}

// Precios en la moneda de cada país: /enterprise-pro/argentina, /enterprise-pro/mexico…
export default async function Page({ params }: { params: Promise<{ pais: string }> }) {
  const country = countryBySlug((await params).pais);
  if (!country) notFound();
  const settings = await getSiteSettings();
  return <EnterpriseProLanding country={country} settings={settings} />;
}
