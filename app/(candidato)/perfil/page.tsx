import Link from "next/link";
import ProfileClient from "@/components/ProfileClient";
import { getCurrentCandidate, getMyReferences } from "@/lib/data";

export const metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const candidate = await getCurrentCandidate();

  if (!candidate) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl mb-2">👤</p>
        <p className="font-semibold text-primary-dark">
          Todavía no completaste tu perfil
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Creá tu perfil en 2 minutos y empezá a postularte con 1 clic.
        </p>
        <Link href="/onboarding" className="btn-primary mt-4">
          Completar mi perfil
        </Link>
      </div>
    );
  }

  const references = await getMyReferences();
  return <ProfileClient candidate={candidate} references={references} />;
}
