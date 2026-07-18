import BottomNav from "@/components/BottomNav";
import CandidateHeader from "@/components/CandidateHeader";

// Lado candidato: mobile-first, pero con estética propia en escritorio
// (header con navegación horizontal y contenido en columnas).
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col w-full bg-surface min-h-screen">
      <CandidateHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 lg:py-8 pb-24 lg:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
