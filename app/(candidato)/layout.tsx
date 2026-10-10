import "./candidate.css";
import BottomNav from "@/components/BottomNav";
import CandidateHeader from "@/components/CandidateHeader";
import MaintenanceGate from "@/components/MaintenanceGate";
import { getMyNotifications, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";

// Lado candidato: mobile-first, con estética propia en escritorio.
export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = isLive() ? await getCurrentUser() : null;
  const loggedIn = isLive() ? !!user : true; // en demo se navega como logueado
  const notifications = loggedIn ? await getMyNotifications() : [];

  return (
    <div className="candidate-app flex-1 flex flex-col w-full min-h-screen">
      <CandidateHeader loggedIn={loggedIn} notifications={notifications} />
      <main className="candidate-main flex-1 w-full mx-auto">
        <MaintenanceGate>{children}</MaintenanceGate>
      </main>
      <BottomNav loggedIn={loggedIn} />
    </div>
  );
}
