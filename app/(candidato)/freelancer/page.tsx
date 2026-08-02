import Link from "next/link";
import FreelancerDashboard from "@/components/FreelancerDashboard";
import { getMyFreelancerDashboard, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Mi perfil de freelancer" };

export default async function FreelancerDashboardPage() {
  const live = isLive();
  const user = live ? await getCurrentUser() : null;
  if (live && !user) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-primary-dark">Iniciá sesión</p>
        <Link href="/ingresar" className="btn-primary mt-4">
          Ingresar
        </Link>
      </div>
    );
  }

  const data = await getMyFreelancerDashboard();

  if (!data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl mb-2">🧑‍💻</p>
        <p className="font-semibold text-primary-dark">
          Todavía no sos parte de Worka Freelancers
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Creá tu perfil profesional para ofrecer servicios y recibir proyectos.
        </p>
        <Link href="/unirme-freelancer" className="btn-primary mt-4">
          Crear mi perfil de freelancer
        </Link>
      </div>
    );
  }

  return <FreelancerDashboard data={data} />;
}
