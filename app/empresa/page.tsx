import Link from "next/link";
import CompanyDashboard from "@/components/CompanyDashboard";
import { getCurrentCompany, getJobsByCompany } from "@/lib/data";

export const metadata = { title: "Panel de empresa" };

export default async function CompanyDashboardPage() {
  const company = await getCurrentCompany();

  if (!company) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <p className="text-3xl mb-2">🏢</p>
        <p className="font-semibold text-primary-dark">
          Tu cuenta todavía no tiene una empresa registrada
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Registrá tu empresa con su RUC para empezar a publicar vacantes.
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  const jobs = await getJobsByCompany(company.id);
  return <CompanyDashboard company={company} jobs={jobs} />;
}
