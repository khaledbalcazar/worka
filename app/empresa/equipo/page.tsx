import Link from "next/link";
import CompanyTeam from "@/components/CompanyTeam";
import {
  getCompanyMembers,
  getCurrentCompany,
  getMyCompanyRole,
} from "@/lib/data";

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

  const [members, rol] = await Promise.all([
    getCompanyMembers(company.id),
    getMyCompanyRole(company.id),
  ]);

  return (
    <CompanyTeam
      members={members}
      companyId={company.id}
      puedeGestionar={rol === "dueno" || rol === "administrador"}
    />
  );
}
