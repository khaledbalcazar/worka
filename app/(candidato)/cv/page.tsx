import Link from "next/link";
import CvBuilder from "@/components/CvBuilder";
import { getCurrentCandidate } from "@/lib/data";

export const metadata = { title: "Mi CV" };

export default async function CvPage() {
  const candidate = await getCurrentCandidate();

  if (!candidate) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl mb-2">📄</p>
        <p className="font-semibold text-primary-dark">
          Para generar tu CV, primero creá tu perfil
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Con esos datos armamos tu CV automáticamente.
        </p>
        <Link href="/onboarding" className="btn-primary mt-4">
          Crear mi perfil
        </Link>
      </div>
    );
  }

  return <CvBuilder candidate={candidate} />;
}
