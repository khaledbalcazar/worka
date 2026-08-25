import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Worka Evaluar — Selección de personal sin fricción",
    template: "%s | Worka Evaluar",
  },
  description:
    "Software de reclutamiento y evaluación de candidatos. Enlazá tu vacante de Worka y la gente empieza los tests desde el propio aviso. 15 días de prueba gratis.",
};

// Worka Evaluar tiene identidad propia (más sobria, de herramienta de
// trabajo) pero es la misma app: comparte sesión y base con Worka, que es lo
// que permite enlazar una vacante con su proceso de selección.
export default function EvaluarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/evaluar" className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary-dark text-white grid place-items-center font-bold text-sm shrink-0">
              W
            </span>
            <span className="font-bold text-primary-dark truncate">
              Worka <span className="text-primary">Evaluar</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/evaluar/precios"
              className="text-sm text-slate-600 px-2 hidden sm:block"
            >
              Precios
            </Link>
            <Link
              href="/evaluar/app"
              className="btn-secondary press text-xs px-3"
            >
              Mi panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Worka Evaluar · parte de{" "}
            <a href="https://worka.click" className="text-primary font-medium">
              Worka
            </a>
          </p>
          <div className="flex gap-4">
            <Link href="/terminos">Términos</Link>
            <Link href="/privacidad">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
