"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { signOut } from "@/app/actions";

const NAV = [
  { href: "/empleos", label: "Empleos", icon: "🔍" },
  { href: "/postulaciones", label: "Postulaciones", icon: "📋" },
  { href: "/perfil", label: "Mi perfil", icon: "👤" },
];

export default function CandidateHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 print:hidden">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Logo href="/empleos" />

        {/* Navegación horizontal solo en escritorio */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-primary"
                    : "text-gray-500 hover:text-primary-dark hover:bg-surface"
                }`}
              >
                <span className="mr-1.5" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/perfil#configuracion"
            aria-label="Configuración"
            title="Configuración"
            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl text-gray-400 hover:bg-surface hover:text-primary-dark"
          >
            ⚙️
          </Link>
          <button
            onClick={() => signOut()}
            className="hidden lg:inline-flex btn-secondary text-xs"
          >
            Cerrar sesión
          </button>
          <span className="lg:hidden text-xs text-gray-400">Paraguay 🇵🇾</span>
        </div>
      </div>
    </header>
  );
}
