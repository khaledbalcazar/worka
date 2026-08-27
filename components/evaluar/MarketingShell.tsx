"use client";

import { useState } from "react";
import Link from "next/link";
import EvaluarLogo from "./EvaluarLogo";
import NocturneFx from "./NocturneFx";

const NAV = [
  { href: "/evaluar#plataforma", label: "Plataforma" },
  { href: "/evaluar#como-funciona", label: "Cómo funciona" },
  { href: "/evaluar/precios", label: "Precios" },
];

// Marco de la parte pública de Worka Evaluar.
//
// Va aparte del panel de trabajo a propósito: una landing de venta y una
// pantalla donde se comparan candidatos todo el día no piden lo mismo. Los
// dos comparten ahora el mismo idioma oscuro, pero la portada puede permitirse
// la grilla reactiva y el parallax que en una jornada de trabajo cansarían.
export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="nk min-h-screen flex flex-col">
      {/* Fondo fijo: el body del sitio es claro, y sin esto asoma gris en el
          rebote del scroll y en los bordes de pantallas altas. */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "var(--color-bg)" }}
        aria-hidden
      />
      <NocturneFx />

      <header
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{
          borderBottom: "1px solid rgba(233,233,237,.08)",
          background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
        }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/evaluar" className="shrink-0">
            <EvaluarLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13.5px] transition-colors"
                style={{ color: "rgba(233,233,237,.6)" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/evaluar/app"
              className="nk-ghost"
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Mi panel
            </Link>
            <Link
              href="/evaluar/app"
              className="nk-cta"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Empezar gratis
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            style={{ color: "rgba(233,233,237,.7)" }}
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
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-3"
            style={{
              borderTop: "1px solid rgba(233,233,237,.08)",
              background: "var(--color-bg)",
            }}
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm py-1"
                style={{ color: "rgba(233,233,237,.6)" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/evaluar/app"
              onClick={() => setMenuOpen(false)}
              className="text-sm py-1"
              style={{ color: "rgba(233,233,237,.6)" }}
            >
              Mi panel
            </Link>
            <Link
              href="/evaluar/app"
              onClick={() => setMenuOpen(false)}
              className="nk-cta mt-2"
            >
              Empezar gratis
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer style={{ borderTop: "1px solid rgba(233,233,237,.08)" }}>
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <EvaluarLogo size={26} />
            <p
              className="text-xs mt-2.5 max-w-xs leading-relaxed"
              style={{ color: "rgba(233,233,237,.45)" }}
            >
              Software de selección de personal. Parte de{" "}
              <a
                href="https://worka.click"
                style={{ color: "var(--color-accent)" }}
              >
                Worka
              </a>
              , la plataforma de empleo de Paraguay.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-5 text-xs"
            style={{ color: "rgba(233,233,237,.45)" }}
          >
            <Link href="/evaluar/precios">Precios</Link>
            <Link href="/terminos">Términos</Link>
            <Link href="/privacidad">Privacidad</Link>
            <a href="https://worka.click">Worka Empleos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
