import "./candidate.css";
import BottomNav from "@/components/BottomNav";
import CandidateHeader from "@/components/CandidateHeader";
import MaintenanceGate from "@/components/MaintenanceGate";
import { getCurrentCandidate, getMyNotifications, isLive } from "@/lib/data";
import { profileCompletion } from "@/lib/profile-completion";
import type { ProfileSummary } from "@/components/ProfileMenu";
import { getCurrentUser } from "@/lib/supabase/server";

// Lado candidato: mobile-first, con estética propia en escritorio.
export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = isLive() ? await getCurrentUser() : null;
  const loggedIn = isLive() ? !!user : true; // en demo se navega como logueado
  const [notifications, candidate] = loggedIn
    ? await Promise.all([getMyNotifications(), getCurrentCandidate()])
    : [[], null];
  const completion = candidate ? profileCompletion(candidate) : null;
  const profile: ProfileSummary | null = candidate && completion
    ? {
        name: candidate.full_name,
        city: candidate.location_city,
        avatarUrl: candidate.avatar_url,
        identityVerified: candidate.identity_status === "verified",
        emailVerified: !!candidate.email_verified,
        completion: completion.percent,
        nextStep: completion.nextStep,
      }
    : null;

  return (
    <div className="candidate-app flex-1 flex flex-col w-full min-h-screen">
      <CandidateHeader loggedIn={loggedIn} notifications={notifications} profile={profile} />
      <main className="candidate-main flex-1 w-full mx-auto">
        <MaintenanceGate>{children}</MaintenanceGate>
      </main>
      <BottomNav loggedIn={loggedIn} />
    </div>
  );
}
