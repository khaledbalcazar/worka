import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkaProLanding from "@/components/plans/WorkaProLanding";
import { COUNTRIES, countryBySlug } from "@/lib/countries";
import { getSiteSettings } from "@/lib/data";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ pais: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pais: string }> }): Promise<Metadata> {
  const country = countryBySlug((await params).pais);
  if (!country) return { title: "Worka Pro" };
  return {
    title: `Worka Pro en ${country.name}`,
    description: "Herramientas para conseguir trabajo antes: quién vio tu perfil, alertas al instante, revisión de CV y simulador de entrevistas con IA.",
    alternates: { canonical: `/worka-pro/${country.slug}` },
  };
}

// Precios en la moneda de cada país: /worka-pro/argentina, /worka-pro/mexico…
export default async function Page({ params }: { params: Promise<{ pais: string }> }) {
  const country = countryBySlug((await params).pais);
  if (!country) notFound();
  const settings = await getSiteSettings();
  return <WorkaProLanding country={country} settings={settings} />;
}
