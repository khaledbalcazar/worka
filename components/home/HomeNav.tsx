"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

// Enlaces del menú: anclas a las secciones de la home + rutas reales.
const NAV_LINKS: [string, string][] = [
  ["Buscar empleo", "#rubros"],
  ["Cómo funciona", "#como-funciona"],
  ["Para empresas", "#empresas"],
  ["Historias", "#historias"],
  ["Preguntas", "#faq"],
];

// Header sticky con blur y menú hamburguesa en móvil.
export default function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-primary-dark/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-gray-500 hover:text-primary-dark transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-primary-dark transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
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
          {[...NAV_LINKS, ["Blog", "/blog"] as [string, string]].map(
            ([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="block py-3.5 text-[0.95rem] text-primary-dark border-b border-gray-100"
              >
                {label}
              </a>
            )
          )}
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
