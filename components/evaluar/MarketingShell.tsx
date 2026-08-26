"use client";

import { useState } from "react";
import Link from "next/link";
import EvaluarLogo from "./EvaluarLogo";

const NAV = [
  { href: "/evaluar#funcionalidades", label: "Funcionalidades" },
  { href: "/evaluar#como-funciona", label: "Cómo funciona" },
  { href: "/evaluar/precios", label: "Precios" },
];

// Marco oscuro de la parte pública de Worka Evaluar.
//
// Va aparte del panel de trabajo a propósito: una landing de venta y una
// pantalla donde se comparan candidatos todo el día no piden lo mismo. Acá
// manda la marca; allá, la legibilidad de los datos.
export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-navy text-cream font-[family-name:var(--font-dm-sans)] min-h-screen flex flex-col">
      {/* Fondo fijo: el body del sitio es claro, y sin esto asoma gris en el
          rebote del scroll y en los bordes de pantallas altas. */}
      <div className="fixed inset-0 -z-10 bg-navy" aria-hidden />
      <header className="sticky top-0 z-50 border-b border-edge bg-navy/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/evaluar" className="shrink-0">
            <EvaluarLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-mist hover:text-cream transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/evaluar/app"
              className="text-sm px-4 py-2 border border-edge text-mist hover:text-cream hover:border-cream/20 rounded-lg transition-colors"
            >
              Mi panel
            </Link>
            <Link
              href="/evaluar/app"
              className="text-sm px-4 py-2 bg-copper text-navy font-semibold rounded-lg hover:bg-copper-lite transition-colors"
            >
              Empezar gratis
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-mist hover:text-cream transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-edge bg-navy px-6 py-4 flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-mist hover:text-cream py-1 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/evaluar/app"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-mist py-1"
            >
              Mi panel
            </Link>
            <Link
              href="/evaluar/app"
              onClick={() => setMenuOpen(false)}
              className="mt-2 text-sm px-4 py-2.5 bg-copper text-navy font-semibold rounded-lg text-center"
            >
              Empezar gratis
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-edge">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <EvaluarLogo size={28} />
            <p className="text-xs text-mist mt-2.5 max-w-xs">
              Software de selección de personal. Parte de{" "}
              <a
                href="https://worka.click"
                className="text-copper hover:text-copper-lite transition-colors"
              >
                Worka
              </a>
              , la plataforma de empleo de Paraguay.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs text-mist">
            <Link href="/evaluar/precios" className="hover:text-cream transition-colors">
              Precios
            </Link>
            <Link href="/terminos" className="hover:text-cream transition-colors">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-cream transition-colors">
              Privacidad
            </Link>
            <a href="https://worka.click" className="hover:text-cream transition-colors">
              Worka Empleos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
