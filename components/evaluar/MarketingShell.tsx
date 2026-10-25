"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Menu, UserRound, X } from "lucide-react";
import EvaluarLogo from "./EvaluarLogo";
import VentasBurbuja from "./VentasBurbuja";

// Seis entradas es el techo antes de que el encabezado se vuelva un índice.
const NAV = [
  { href: "/evaluar#soluciones", label: "Plataforma" },
  { href: "/evaluar#instrumentos", label: "Pruebas" },
  { href: "/evaluar#ia", label: "Inteligencia artificial" },
  { href: "/evaluar#talento", label: "Talento humano" },
  { href: "/evaluar/recursos", label: "Recursos" },
  { href: "/evaluar/precios", label: "Precios" },
];

// Marco de la parte pública de Worka Evaluar.
//
// Va aparte del panel de trabajo a propósito: una landing de venta y una
// pantalla donde se comparan candidatos todo el día no piden lo mismo. Las
// dos hablan el idioma claro de Worka (cobalto para actuar, violeta de
// Evaluar como marca) para que se note que es la misma familia.
//
// Arriba de todo va una franja con las dos puertas que no son de venta: el
// candidato que llegó buscando trabajo y la empresa que ya tiene cuenta.
export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="nk-light min-h-screen flex flex-col" style={{ background: "#ffffff" }}>
      <div className="fixed inset-0 -z-10" style={{ background: "#ffffff" }} aria-hidden />
      <VentasBurbuja />

      {/* Franja superior. */}
      <div className="evl-topbar text-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-10 flex items-center justify-end gap-6 text-[13.5px] font-medium">
          <a href="https://worka.click" className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100">
            <UserRound size={15} /> Soy candidato
          </a>
          <Link href="/evaluar/app" className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100">
            <Briefcase size={15} /> Ingresar empresas
          </Link>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-[0_8px_24px_-14px_rgba(29,43,79,.35)]" : ""
        }`}
        style={{ borderBottom: "1px solid #eeecf5" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/evaluar" className="shrink-0" aria-label="Worka Evaluar, inicio">
            <EvaluarLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] text-[#2b3550] hover:text-[#0a66c2] transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#0a66c2] after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/evaluar/app" className="evl-btn !px-5 !py-2.5 !text-[14.5px]">
              Probar gratis
            </Link>
          </nav>

          <button
            className="lg:hidden p-2 -mr-2 text-[#2b3550]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden px-5 pb-5 pt-2 flex flex-col gap-1 bg-white border-t border-[#eeecf5] animate-rise">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-[16px] py-2.5 text-[#2b3550] border-b border-[#f3f2f8]"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/evaluar/app" onClick={() => setMenuOpen(false)} className="evl-btn mt-4">
              Probar gratis
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0e1a33] text-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2">
              <span className="text-[22px] font-bold tracking-[-0.03em]">
                Worka<span className="font-medium text-[#6cb0f5]">.click</span>
              </span>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-[#d9d4f3]">Evaluar</span>
            </span>
            <p className="text-sm mt-3 max-w-xs leading-relaxed text-white/60">
              Software de selección y evaluación de personal. Parte de{" "}
              <a href="https://worka.click" className="text-white underline-offset-2 hover:underline">Worka</a>, la
              plataforma de empleo de Paraguay.
            </p>
          </div>
          {[
            { t: "Producto", l: [["Plataforma", "/evaluar#soluciones"], ["Pruebas", "/evaluar#instrumentos"], ["Inteligencia artificial", "/evaluar#ia"], ["Precios", "/evaluar/precios"]] },
            { t: "Recursos", l: [["Guías", "/evaluar/recursos"], ["Preguntas frecuentes", "/evaluar#preguntas"], ["Ingresar", "/evaluar/app"]] },
            { t: "Worka", l: [["Worka Empleos", "https://worka.click"], ["Términos", "/terminos"], ["Privacidad", "/privacidad"]] },
          ].map((col) => (
            <div key={col.t}>
              <p className="text-xs font-bold uppercase tracking-[.1em] text-white/45 mb-3">{col.t}</p>
              <ul className="space-y-2">
                {col.l.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("http") ? (
                      <a href={href} className="text-sm text-white/75 hover:text-white">{label}</a>
                    ) : (
                      <Link href={href} className="text-sm text-white/75 hover:text-white">{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <p className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5 text-xs text-white/45">
            © {new Date().getFullYear()} Worka. Hecho en Paraguay.
          </p>
        </div>
      </footer>
    </div>
  );
}
