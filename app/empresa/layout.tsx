"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/empresa", label: "Panel", icon: "📊", exact: true },
  { href: "/empresa/vacantes/nueva", label: "Nueva vacante", icon: "➕" },
  { href: "/empresa/talento", label: "Buscar talento", icon: "🔎" },
  { href: "/empresa/perfil", label: "Perfil de empresa", icon: "🏢" },
];

// Layout desktop-first del lado empresa: sidebar fija en escritorio,
// barra superior compacta en móvil.
export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex min-h-screen bg-surface">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-primary-dark text-white min-h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-white/10">
          <Logo light href="/empresa" />
          <p className="text-xs text-blue-300 mt-1">Panel de empresa</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-blue-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs text-blue-300">Cuenta de empresa</p>
          <Link href="/" className="text-xs text-blue-300 underline mt-2 inline-block">
            Salir
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-primary-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <Logo light href="/empresa" />
          <nav className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-blue-200">
                {item.icon}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
