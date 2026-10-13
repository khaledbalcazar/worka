import type { Metadata } from "next";
import WorkaProLanding from "@/components/plans/WorkaProLanding";
import { getActiveCountry } from "@/lib/country-context";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Worka Pro",
  description: "Herramientas para conseguir trabajo antes: quién vio tu perfil, alertas al instante, revisión de CV y simulador de entrevistas con IA.",
  alternates: { canonical: "/worka-pro" },
};

// Sin país en la URL: el país activo del visitante (cookie) o Paraguay.
export default async function Page() {
  const [country, settings] = await Promise.all([getActiveCountry(), getSiteSettings()]);
  return <WorkaProLanding country={country} settings={settings} />;
}
