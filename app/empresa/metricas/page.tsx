import Link from "next/link";
import CompanyMetricsView from "@/components/CompanyMetrics";
import { getCompanyMetrics, getCurrentCompany } from "@/lib/data";

export const metadata = { title: "Métricas" };

export default async function CompanyMetricsPage() {
  const company = await getCurrentCompany();

  if (!company) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <p className="font-semibold text-primary-dark">
          Primero registrá tu empresa
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Las métricas salen de tus vacantes y sus postulaciones.
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  const data = await getCompanyMetrics(company.id);
  return <CompanyMetricsView data={data} />;
}
