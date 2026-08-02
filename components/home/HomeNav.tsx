"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import CountrySelector from "@/components/CountrySelector";

// Nav principal, agrupado para no saturar: enlaces clave arriba y el resto
// dentro de "Más". Se usa en todas las páginas públicas (home, freelancers,
// opiniones, panorama…) para que el logo y el menú lleven siempre al inicio.
const PRIMARY: [string, string][] = [
  ["Buscar empleo", "/empleos"],
  ["Freelancers", "/freelancers"],
  ["Opiniones", "/opiniones"],
  ["Para empresas", "/para-empresas"],
];

const MORE: [string, string][] = [
  ["Panorama del mercado", "/panorama"],
  ["Academia", "/academia"],
  ["Blog", "/blog"],
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-primary-dark/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {PRIMARY.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-gray-500 hover:text-primary-dark transition-colors"
            >
              {label}
            </Link>
          ))}

          {/* Menú "Más" */}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className="text-sm text-gray-500 hover:text-primary-dark transition-colors inline-flex items-center gap-1"
            >
              Más <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full pt-2 w-52">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1.5">
                  {MORE.map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-surface hover:text-primary-dark"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <CountrySelector />
          <Link
            href="/ingresar"
            className="text-sm font-medium text-primary-dark px-4 py-2 rounded-xl hover:bg-white transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="text-sm font-bold text-white bg-primary px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
          >
            Crear cuenta
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg bg-primary-dark/8 text-primary-dark"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 pb-5 pt-3">
          {[...PRIMARY, ...MORE].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3.5 text-[0.95rem] text-primary-dark border-b border-gray-100"
            >
              {label}
            </Link>
          ))}
          <div className="py-3.5 border-b border-gray-100">
            <CountrySelector />
          </div>
          <div className="flex gap-2.5 mt-4">
            <Link
              href="/ingresar"
              className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-sm font-medium text-primary-dark"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="flex-1 text-center py-3 rounded-xl bg-primary text-sm font-bold text-white"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
