import { getCurrentCompany, getTalentPool } from "@/lib/data";
import TalentSearch from "@/components/TalentSearch";

export const metadata = { title: "Buscar talento" };

// Búsqueda activa: la empresa encuentra candidatos sin esperar postulaciones.
// Solo ve talento de su propio país.
export default async function TalentPage() {
  const company = await getCurrentCompany();
  const candidates = await getTalentPool(company?.country ?? "py");
  return <TalentSearch candidates={candidates} />;
}
