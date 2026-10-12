import Link from "next/link";
import CompanyTeam from "@/components/CompanyTeam";
import {
  getCompanyMembers,
  getCurrentCompany,
  getMyCompanyRole,
} from "@/lib/data";
import PlanLock from "@/components/plans/PlanLock";
import { getEnterpriseLimits } from "@/lib/subscriptions";

export const metadata = { title: "Equipo" };

export default async function CompanyTeamPage() {
  const company = await getCurrentCompany();

  if (!company) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <p className="font-semibold text-primary-dark">
          Primero registrá tu empresa
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Después vas a poder invitar a tu equipo de recursos humanos.
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  const [members, rol, limits] = await Promise.all([
    getCompanyMembers(company.id),
    getMyCompanyRole(company.id),
    getEnterpriseLimits(company.id),
  ]);

  // Sin plan Empresa no se invita gente nueva; quien ya estaba sigue entrando.
  if (!limits.team && members.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <PlanLock
          title="Sumá a tu equipo de selección"
          text="Invitá a reclutadores y administradores con su propio usuario y permisos. Es parte del plan Empresa de Worka Enterprise Pro."
          href="/empresa/planes?plan=empresa#contratar"
          cta="Ver el plan Empresa"
        />
      </div>
    );
  }

  return (
    <CompanyTeam
      members={members}
      companyId={company.id}
      puedeGestionar={limits.team && (rol === "dueno" || rol === "administrador")}
    />
  );
}
