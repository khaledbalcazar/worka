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
    <div className="flex-1 flex flex-col w-full bg-surface min-h-screen">
      <CandidateHeader loggedIn={loggedIn} notifications={notifications} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 lg:py-8 pb-24 lg:pb-10">
        <MaintenanceGate>{children}</MaintenanceGate>
      </main>
      <BottomNav />
    </div>
  );
}
