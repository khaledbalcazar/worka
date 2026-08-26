import Link from "next/link";
import EvaluarLogo from "@/components/evaluar/EvaluarLogo";

// Marco del panel de trabajo. Se queda claro a propósito: acá se comparan
// candidatos y se leen tablas durante horas, y el oscuro de la landing —que
// está pensado para vender— cansa la vista en ese uso.
export default function EvaluarAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 font-[family-name:var(--font-dm-sans)]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/evaluar/app" className="min-w-0">
            <EvaluarLogo size={28} tone="light" />
          </Link>
          <nav className="flex items-center gap-2 shrink-0">
            <Link
              href="/evaluar"
              className="text-sm text-slate-500 hover:text-primary-dark px-2 hidden sm:block"
            >
              Inicio
            </Link>
            <Link
              href="/evaluar/precios"
              className="btn-secondary press text-xs px-3"
            >
              Planes
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
