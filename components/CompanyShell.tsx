"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { signOut } from "@/app/actions";
import type { Company, Notification } from "@/lib/types";

// Navegación del panel de empresa: el mismo encabezado blanco con íconos y
// etiquetas que usa el área de candidatos. Lo diario (panel, talento,
// mensajes, métricas) va siempre a la vista; equipo y perfil de empresa, que
// se tocan de vez en cuando, viven en el menú de la cuenta.
const NAV = [
  { href: "/empresa", label: "Panel", Icon: LayoutDashboard, exact: true },
  { href: "/empresa/talento", label: "Talento", Icon: Search },
  { href: "/empresa/mensajes", label: "Mensajes", Icon: MessageCircle },
  { href: "/empresa/metricas", label: "Métricas", Icon: BarChart3 },
];
const ACCOUNT = [
  { href: "/empresa/perfil", label: "Perfil de empresa", Icon: Building2 },
  { href: "/empresa/equipo", label: "Equipo", Icon: Users },
];

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CompanyShell({
  children,
  notifications,
  company,
  saludo,
  fecha,
}: {
  children: React.ReactNode;
  notifications: Notification[];
  company: Company | null;
  /* El saludo y la fecha los arma el layout en el servidor con la zona
     horaria de Asunción fija (ver saludoEmpresa en lib/format). Acá llegan
     como texto ya resuelto para que el navegador no vuelva a calcularlos con
     otro reloj y termine escribiendo algo distinto de lo que vino en el HTML. */
  saludo: string;
  fecha: string;
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const nombre = company?.trade_name || "tu empresa";
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // El alta de empresa todavía no tiene panel: se muestra sin navegación.
  const bare = pathname.startsWith("/empresa/registro");

  useEffect(() => {
    if (!menu) return;
    const outside = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!menuRef.current?.contains(target) && !target.closest("[data-co-menu-toggle]")) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const avatar = (size: string) => (
    <span className={`co-avatar ${size}`} aria-hidden>
      {company?.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={company.logo_url} alt="" />
      ) : (
        iniciales(nombre) || "W"
      )}
    </span>
  );

  return (
    <div className="company-app flex-1 flex flex-col min-h-screen">
      <header className="co-header print:hidden">
        <div className="co-header-inner">
          <Link href="/empresa" className="co-brand" aria-label="Worka, panel de empresa">
            <span className="co-brand-name">Worka<span>.click</span></span>
            <small>Empresas</small>
          </Link>

          {!bare && (
            <nav className="co-nav" aria-label="Panel de empresa">
              {NAV.map(({ href, label, Icon, exact }) => (
                <Link key={href} href={href} aria-current={isActive(href, exact) ? "page" : undefined}>
                  <Icon size={20} strokeWidth={1.7} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          )}

          {!bare && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <NotificationBell notifications={notifications} />
              <Link href="/empresa/vacantes/nueva" className="co-publish">
                <Plus size={16} strokeWidth={2.4} />
                <span className="hidden sm:inline">Publicar vacante</span>
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="co-account"
                  aria-label="Menú de la empresa"
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                >
                  {avatar("is-small")}
                  <ChevronDown size={14} className="hidden lg:block" />
                </button>
                {menu && (
                  <div className="co-menu" role="dialog" aria-label="Cuenta de la empresa">
                    <div className="co-menu-head">
                      {avatar("is-large")}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{nombre}</p>
                        <p className="text-xs text-muted flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${company?.is_verified ? "bg-emerald-600" : "bg-amber-500"}`} />
                          {company?.is_verified ? "Empresa verificada" : "Verificación pendiente"}
                        </p>
                      </div>
                    </div>
                    {company && (
                      <Link href={`/empresas/${company.id}`} className="btn-secondary w-full !min-h-9" onClick={() => setMenu(false)}>
                        Ver página pública
                      </Link>
                    )}
                    <nav aria-label="Cuenta">
                      {/* En celular, Métricas no entra en la barra de abajo: va acá. */}
                      {[...NAV.slice(3), ...ACCOUNT].map(({ href, label, Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`co-menu-link ${NAV.some((n) => n.href === href) ? "is-nav" : ""}`}
                          onClick={() => setMenu(false)}
                        >
                          <Icon size={18} /> {label}
                        </Link>
                      ))}
                      <form action={signOut}>
                        <button type="submit" className="co-menu-link is-danger">
                          <LogOut size={18} /> Cerrar sesión
                        </button>
                      </form>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="co-main">
        {!bare && pathname === "/empresa" && (
          <p className="co-greeting">
            {saludo}, <strong>{nombre}</strong>
            <span> · {fecha}</span>
          </p>
        )}
        {children}
      </main>

      {/* Navegación inferior en celular: lo de todos los días a un dedo. */}
      {!bare && (
        <nav className="co-bottom print:hidden" aria-label="Panel de empresa">
          {NAV.slice(0, 2).map(({ href, label, Icon, exact }) => (
            <Link key={href} href={href} aria-current={isActive(href, exact) ? "page" : undefined}>
              <Icon size={21} strokeWidth={1.7} />
              {label}
            </Link>
          ))}
          <Link href="/empresa/vacantes/nueva" aria-current={isActive("/empresa/vacantes/nueva") ? "page" : undefined}>
            <span className="co-bottom-plus"><Plus size={18} strokeWidth={2.4} /></span>
            Publicar
          </Link>
          {NAV.slice(2, 3).map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
              <Icon size={21} strokeWidth={1.7} />
              {label}
            </Link>
          ))}
          <button type="button" data-co-menu-toggle onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
            {menu ? <X size={21} /> : <Menu size={21} strokeWidth={1.7} />}
            Más
          </button>
        </nav>
      )}
    </div>
  );
}
