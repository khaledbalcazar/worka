"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardCheck, CreditCard, LogOut, TrendingUp } from "lucide-react";
import { signOut } from "@/app/actions";

// Marco del panel de Worka Evaluar con el sistema del ecosistema Worka: el
// mismo encabezado blanco con íconos y etiquetas del panel de empresa, el
// lienzo cálido, tarjetas blancas con borde fino y el azul solo para las
// acciones. Evaluar se distingue por su chip, no por un tema propio: antes
// era un producto oscuro con otras tipografías, y pasar del panel de empresa
// a Evaluar se sentía como cambiar de empresa proveedora.
//
// Las clases co-* vienen de app/empresa/company.css (las importa el layout).

const NAV = [
  { href: "/evaluar/app", label: "Procesos", Icon: ClipboardCheck, match: (p: string) => p === "/evaluar/app" || p.startsWith("/evaluar/app/procesos") },
  { href: "/evaluar/app/desempeno", label: "Desempeño", Icon: TrendingUp, match: (p: string) => p.startsWith("/evaluar/app/desempeno") },
  { href: "/evaluar/app/plan", label: "Mi plan", Icon: CreditCard, match: (p: string) => p.startsWith("/evaluar/app/plan") },
];

export default function EvaluarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="company-app ev-app flex-1 flex flex-col min-h-screen">
      <header className="co-header print:hidden">
        <div className="co-header-inner">
          <Link href="/evaluar/app" className="co-brand" aria-label="Worka Evaluar, panel">
            <span className="co-brand-name">
              Worka<span>.click</span>
            </span>
            <small className="ev-chip">Evaluar</small>
          </Link>

          <nav className="co-nav" aria-label="Worka Evaluar">
            {NAV.map(({ href, label, Icon, match }) => (
              <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined}>
                <Icon size={20} strokeWidth={1.7} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Volver al resto de Worka para empresas sin pasar por la portada. */}
            <Link href="/empresa" className="ev-switch" title="Ir al panel de empresa de Worka">
              <Building2 size={16} />
              <span className="hidden sm:inline">Panel de empresa</span>
            </Link>
            {/* Formulario y no botón de cliente: signOut es una acción de
                servidor y así funciona aun sin JavaScript. */}
            <form action={signOut}>
              <button type="submit" className="ev-switch" title="Cerrar sesión">
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="co-main">{children}</main>

      {/* En celular: lo de todos los días a un dedo, como en el panel de empresa. */}
      <nav className="co-bottom ev-bottom print:hidden" aria-label="Worka Evaluar">
        {NAV.map(({ href, label, Icon, match }) => (
          <Link key={href} href={href} aria-current={match(pathname) ? "page" : undefined}>
            <Icon size={21} strokeWidth={1.7} />
            {label}
          </Link>
        ))}
        <Link href="/empresa">
          <Building2 size={21} strokeWidth={1.7} />
          Empresa
        </Link>
      </nav>
    </div>
  );
}
