"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions";
import type { AdminCounts } from "@/lib/admin-stats";

// Navegación del backoffice con el mismo sistema que los paneles de
// candidato y empresa: encabezado blanco, lienzo cálido, tarjetas con borde
// fino y el azul solo para las acciones. Antes todo vivía en una sola página
// de quince bloques apilados; ahora cada tema tiene su sección y la barra
// lateral avisa cuántas cosas esperan en cada una.

type Item = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  count?: (c: AdminCounts) => number;
  exact?: boolean;
};

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "General",
    items: [{ href: "/admin", label: "Estadísticas", Icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Operación",
    items: [
      { href: "/admin/moderacion", label: "Moderación", Icon: ShieldAlert, count: (c) => c.moderation + c.reports },
      { href: "/admin/verificaciones", label: "Verificaciones", Icon: BadgeCheck, count: (c) => c.companies + c.identities },
      { href: "/admin/vacantes", label: "Vacantes", Icon: Briefcase, count: (c) => c.boosts },
      { href: "/admin/externas", label: "Vacantes externas", Icon: Globe },
    ],
  },
  {
    title: "Personas",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", Icon: Users },
      { href: "/admin/empresas", label: "Empresas e insignias", Icon: Building2 },
    ],
  },
  {
    title: "Negocio",
    items: [{ href: "/admin/pagos", label: "Pagos y planes", Icon: CreditCard, count: (c) => c.payments }],
  },
  {
    title: "Comunicación",
    items: [
      { href: "/admin/comunicacion", label: "Avisos y correos", Icon: Megaphone },
      { href: "/admin/correo", label: "Correo semanal", Icon: Mail },
    ],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/blog", label: "Blog", Icon: FileText },
      { href: "/admin/academia", label: "Academia", Icon: GraduationCap },
    ],
  },
  {
    title: "Sistema",
    items: [{ href: "/admin/ajustes", label: "Ajustes del sitio", Icon: Settings }],
  },
];

export default function AdminShell({
  children,
  counts,
  adminName,
}: {
  children: React.ReactNode;
  counts: AdminCounts;
  adminName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");

  // El aula e-learn es una app aparte a pantalla completa.
  const bare = pathname.startsWith("/admin/e-learn");

  useEffect(() => {
    if (!drawer) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [drawer]);

  if (bare) return <>{children}</>;

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const pendingTotal = counts.moderation + counts.reports + counts.companies + counts.identities + counts.payments + counts.boosts;

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/admin/usuarios?q=${encodeURIComponent(q)}`);
    setDrawer(false);
  }

  const nav = (
    <nav className="ad-nav" aria-label="Backoffice">
      {GROUPS.map((g) => (
        <div key={g.title} className="ad-group">
          <p className="ad-group-title">{g.title}</p>
          {g.items.map(({ href, label, Icon, count, exact }) => {
            const n = count ? count(counts) : 0;
            return (
              <Link
                key={href}
                href={href}
                className="ad-link"
                aria-current={isActive(href, exact) ? "page" : undefined}
                onClick={() => setDrawer(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1 truncate">{label}</span>
                {n > 0 && (
                  <span className="ad-count" aria-label={`${n} pendientes`}>
                    {n > 99 ? "99+" : n}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="admin-app flex-1 flex flex-col min-h-screen">
      <header className="ad-header">
        <div className="ad-header-inner">
          <button type="button" className="ad-menu-btn" onClick={() => setDrawer(true)} aria-label="Abrir menú">
            <Menu size={22} />
            {pendingTotal > 0 && <span className="ad-dot" aria-hidden />}
          </button>
          <Link href="/admin" className="ad-brand" aria-label="Worka, backoffice">
            <span className="ad-brand-name">
              Worka<span>.click</span>
            </span>
            <small>Backoffice</small>
          </Link>

          <form onSubmit={search} className="ad-search" role="search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar usuario por nombre o email"
              aria-label="Buscar usuario"
            />
          </form>

          <div className="flex items-center gap-1.5 ml-auto">
            <Link href="/" className="ad-icon-link" title="Ver el sitio" target="_blank">
              <ExternalLink size={18} />
              <span className="hidden md:inline">Ver sitio</span>
            </Link>
            <span className="ad-avatar" title={adminName}>
              {(adminName.trim()[0] ?? "A").toUpperCase()}
            </span>
            <form action={signOut}>
              <button type="submit" className="ad-icon-link" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="ad-body">
        <aside className="ad-sidebar">{nav}</aside>
        <main className="ad-main">{children}</main>
      </div>

      {drawer && (
        <div className="ad-drawer-backdrop" onClick={() => setDrawer(false)}>
          <div className="ad-drawer" role="dialog" aria-modal="true" aria-label="Menú del backoffice" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="ad-brand-name">
                Worka<span>.click</span>
              </span>
              <button type="button" className="ad-icon-link" onClick={() => setDrawer(false)} aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={search} className="ad-search is-drawer" role="search">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar usuario" aria-label="Buscar usuario" />
            </form>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
