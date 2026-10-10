"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  BriefcaseBusiness,
  Users,
  Star,
  Building2,
} from "lucide-react";
import Logo from "@/components/Logo";
import CountrySelector from "@/components/CountrySelector";

// Nav principal, agrupado para no saturar: enlaces clave arriba y el resto
// dentro de "Más". Se usa en todas las páginas públicas (home, freelancers,
// opiniones, panorama…) para que el logo y el menú lleven siempre al inicio.
// En escritorio sigue el patrón ícono + etiqueta del área de candidatos.
const PRIMARY = [
  { label: "Buscar empleo", href: "/empleos", Icon: BriefcaseBusiness },
  { label: "Freelancers", href: "/freelancers", Icon: Users },
  { label: "Opiniones", href: "/opiniones", Icon: Star },
  { label: "Para empresas", href: "/para-empresas", Icon: Building2 },
];

const MORE: [string, string][] = [
  ["Panorama del mercado", "/panorama"],
  ["Academia", "/academia"],
  ["Blog", "/blog"],
];

export default function HomeNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Escape cierra el menú móvil y el desplegable "Más".
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-[1128px] mx-auto px-4 sm:px-6 h-14 lg:h-16 flex items-center justify-between gap-4">
        <Logo />

        <nav
          className="hidden lg:flex items-stretch self-stretch gap-7"
          aria-label="Navegación principal"
        >
          {PRIMARY.map(({ label, href, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] border-b-2 transition-colors ${
                  active
                    ? "text-primary border-primary"
                    : "text-muted border-transparent hover:text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={1.7} />
                {label}
              </Link>
            );
          })}

          {/* Menú "Más" */}
          <div
            className="relative flex"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted hover:text-ink border-b-2 border-transparent"
            >
              <Menu size={20} strokeWidth={1.7} />
              <span className="inline-flex items-center gap-0.5">
                Más <ChevronDown className="w-3 h-3" />
              </span>
            </button>
            {moreOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-56">
                <div className="bg-white rounded-lg border border-line shadow-[0_8px_24px_rgba(0,0,0,0.14)] py-1.5">
                  {MORE.map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2.5 text-sm text-ink hover:bg-canvas"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <CountrySelector />
          <span className="w-px h-7 bg-line mx-1" aria-hidden />
          <Link
            href="/ingresar"
            className="text-sm font-semibold text-primary px-4 py-2.5 rounded-full hover:bg-primary/[0.06] transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="text-sm font-semibold text-white bg-primary px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors"
          >
            Crear cuenta
          </Link>
        </div>

        {/* Celular: "Ingresar" siempre a mano, el resto en el menú. */}
        <div className="flex lg:hidden items-center gap-1">
          <Link
            href="/ingresar"
            className="text-sm font-semibold text-primary px-3 py-2.5 rounded-full"
          >
            Ingresar
          </Link>
          <button
            className="w-11 h-11 grid place-items-center rounded-full text-ink hover:bg-canvas"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="home-mobile-menu"
          className="lg:hidden bg-white border-t border-line px-4 pb-5 pt-2 max-h-[calc(100dvh-56px)] overflow-y-auto shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
        >
          <nav aria-label="Navegación principal">
            {PRIMARY.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 min-h-12 text-[15px] text-ink border-b border-line/70"
              >
                <Icon size={19} className="text-muted" strokeWidth={1.8} />
                {label}
              </Link>
            ))}
            {MORE.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center min-h-12 pl-[31px] text-[15px] text-ink border-b border-line/70"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="py-2 border-b border-line/70">
            <CountrySelector />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <Link href="/ingresar" className="btn-secondary">
              Ingresar
            </Link>
            <Link href="/registro" className="btn-primary">
              Crear cuenta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
