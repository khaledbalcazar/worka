import { getTalentPool } from "@/lib/data";
import TalentSearch from "@/components/TalentSearch";

export const metadata = { title: "Buscar talento" };

// Búsqueda activa: la empresa encuentra candidatos sin esperar postulaciones.
export default async function TalentPage() {
  const candidates = await getTalentPool();
  return <TalentSearch candidates={candidates} />;
}
