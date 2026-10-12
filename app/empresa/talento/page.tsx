import { getCurrentCompany, getTalentPool } from "@/lib/data";
import TalentSearch from "@/components/TalentSearch";
import PlanLock from "@/components/plans/PlanLock";
import { ENTERPRISE_BRAND } from "@/lib/plans";
import { getEnterpriseLimits } from "@/lib/subscriptions";

export const metadata = { title: "Buscar talento" };

// Búsqueda activa: la empresa encuentra candidatos sin esperar postulaciones.
// Solo ve talento de su propio país. Es una función de Worka Enterprise Pro.
export default async function TalentPage() {
  const company = await getCurrentCompany();
  const [candidates, limits] = await Promise.all([
    getTalentPool(company?.country ?? "py"),
    company ? getEnterpriseLimits(company.id) : Promise.resolve(null),
  ]);
  if (!limits?.talentSearch) {
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <PlanLock
          title="Encontrá candidatos sin esperar postulaciones"
          text={`La búsqueda de talento es parte de ${ENTERPRISE_BRAND}. Filtrá por ciudad, rubro y experiencia, mirá perfiles verificados y escribiles directo.`}
          href="/empresa/planes?plan=pro#contratar"
          cta={`Pasar a ${ENTERPRISE_BRAND}`}
        >
          {candidates.length > 0 && (
            <p className="text-sm font-semibold">Hoy hay {candidates.length} candidatos visibles en tu país.</p>
          )}
        </PlanLock>
      </div>
    );
  }
  return <TalentSearch candidates={candidates} />;
}
