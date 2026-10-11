import Link from "next/link";
import CvBuilder from "@/components/CvBuilder";
import { getCandidateCareer, getCurrentCandidate, isLive } from "@/lib/data";
import { cvFromProfile } from "@/lib/cv";
import { getCurrentUser } from "@/lib/supabase/server";

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

  const [career, user] = await Promise.all([
    getCandidateCareer(candidate.id, candidate.skills ?? []),
    isLive() ? getCurrentUser() : Promise.resolve(null),
  ]);

  return (
    <CvBuilder
      candidateId={candidate.id}
      initial={cvFromProfile(candidate, career, user?.email ?? null)}
      photoUrl={candidate.avatar_url}
    />
  );
}
