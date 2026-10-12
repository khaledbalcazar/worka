import type { Metadata } from "next";
import ParaEmpresasLanding from "@/components/ParaEmpresasLanding";
import { getActiveCountry } from "@/lib/country-context";
import { getSiteSettings } from "@/lib/data";
import { monthlyPrice } from "@/lib/plans";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getActiveCountry();
  const verb = c.code === "py" || c.code === "ar" ? "Encontrá" : "Encuentra";
  return {
    title: `Para empresas — Publicá vacantes gratis en ${c.name}`,
    description: `${verb} talento local verificado en ${c.name}. Empezá gratis con hasta 3 vacantes, gestioná candidatos con un tablero Kanban y sumá alcance con Worka Enterprise Pro.`,
    alternates: { canonical: "/para-empresas" },
  };
}

export default async function ParaEmpresasPage() {
  const [country, settings] = await Promise.all([getActiveCountry(), getSiteSettings()]);
  return (
    <ParaEmpresasLanding
      countryName={country.name}
      currencyName={country.currencyName}
      taxIdLabel={country.taxIdLabel}
      isPy={country.code === "py"}
      prices={{ pro: monthlyPrice("enterprise", "pro", settings), empresa: monthlyPrice("enterprise", "empresa", settings) }}
    />
  );
}
