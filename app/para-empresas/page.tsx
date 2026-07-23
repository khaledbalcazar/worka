import type { Metadata } from "next";
import ParaEmpresasLanding from "@/components/ParaEmpresasLanding";
import { getActiveCountry } from "@/lib/country-context";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getActiveCountry();
  const verb = c.code === "py" || c.code === "ar" ? "Encontrá" : "Encuentra";
  return {
    title: `Para empresas — Publicá vacantes gratis en ${c.name}`,
    description: `${verb} talento local verificado en ${c.name} sin pagar un ${c.currencyName}. Publicá vacantes ilimitadas, gestioná candidatos con un tablero Kanban y contactá por WhatsApp.`,
    alternates: { canonical: "/para-empresas" },
  };
}

export default async function ParaEmpresasPage() {
  const country = await getActiveCountry();
  return (
    <ParaEmpresasLanding
      countryName={country.name}
      currencyName={country.currencyName}
      taxIdLabel={country.taxIdLabel}
      isPy={country.code === "py"}
    />
  );
}
