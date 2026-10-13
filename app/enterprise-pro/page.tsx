import type { Metadata } from "next";
import EnterpriseProLanding from "@/components/plans/EnterpriseProLanding";
import { getActiveCountry } from "@/lib/country-context";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Worka Enterprise Pro",
  description: "Planes para empresas: vacantes sin límite, destacadas, alertas urgentes, búsqueda de talento y marca empleadora.",
  alternates: { canonical: "/enterprise-pro" },
};

// Sin país en la URL: el país activo del visitante (cookie) o Paraguay.
export default async function Page() {
  const [country, settings] = await Promise.all([getActiveCountry(), getSiteSettings()]);
  return <EnterpriseProLanding country={country} settings={settings} />;
}
