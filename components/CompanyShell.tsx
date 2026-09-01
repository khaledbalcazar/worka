"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { signOut } from "@/app/actions";
import type { Company, Notification } from "@/lib/types";

/* ── Íconos ──────────────────────────────────────────────────────────────
   Van como SVG y no como emoji. El emoji lo dibuja el sistema operativo: el
   mismo 📊 se ve plano en Windows, de color en Android y distinto en iPhone,
   así que la barra nunca era la misma barra. Estos heredan currentColor, que
   es lo que permite que el ítem activo se prenda. */

function IcoPanel() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".5" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".35" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IcoChat() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M2 3a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H8.5L6 12v-2H3a1 1 0 01-1-1V3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IcoChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="8" width="3" height="6" rx="1" fill="currentColor" opacity=".5" />
      <rect x="6" y="5" width="3" height="9" rx="1" fill="currentColor" opacity=".75" />
      <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}
function IcoTeam() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" opacity=".6" />
      <path d="M14 12c0-2-1.5-3-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}
function IcoBuilding() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2 13V5.5L7.5 2 13 5.5V13H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="5.5" y="9" width="4" height="4" rx=".5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

// Agrupada, no una lista corrida: "Nueva vacante" es una acción de todos los
// días y "Perfil de empresa" es un ajuste que se toca una vez por año.
// Mezcladas, hay que leer los cinco ítems cada vez para encontrar el de siempre.
const GROUPS: { label?: string; items: Item[] }[] = [
  {
    items: [
      { href: "/empresa", label: "Panel", icon: <IcoPanel />, exact: true },
      {
        href: "/empresa/vacantes/nueva",
        label: "Nueva vacante",
        icon: <IcoPlus />,
      },
      { href: "/empresa/metricas", label: "Métricas", icon: <IcoChart /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/empresa/mensajes", label: "Mensajes", icon: <IcoChat /> },
      { href: "/empresa/talento", label: "Buscar talento", icon: <IcoSearch /> },
      { href: "/empresa/equipo", label: "Equipo", icon: <IcoTeam /> },
    ],
  },
  {
    label: "Cuenta",
    items: [
      {
        href: "/empresa/perfil",
        label: "Perfil de empresa",
        icon: <IcoBuilding />,
      },
    ],
  },
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

  const nombre = company?.trade_name || "tu empresa";

  const nav = (
    <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-5">
      {GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1.5 text-[9px] font-bold tracking-[.12em] uppercase text-slate-400/50">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  /* El cajón se cierra al elegir, no al detectar que cambió la
                     ruta: si esperáramos al cambio, taparía la página recién
                     abierta durante el instante en que la navegación viaja. */
                  onClick={() => setMenu(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-500/20 text-blue-50 font-semibold"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`shrink-0 ${active ? "text-blue-400" : "text-slate-500"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span className="w-0.5 h-4 rounded-full bg-blue-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const pie = (
    <div className="px-4 pb-5 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full shrink-0 grid place-items-center text-xs font-bold text-white bg-gradient-to-br from-blue-600 to-blue-800">
          {iniciales(nombre) || "W"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{nombre}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                company?.is_verified ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <p className="text-[10px] text-slate-400">
              {company?.is_verified
                ? "Empresa verificada"
                : "Verificación pendiente"}
            </p>
          </div>
        </div>
      </div>
      {/* Formulario y no botón de cliente: signOut ya es una acción de
          servidor, así que también funciona sin JavaScript. */}
      <form action={signOut}>
        <button
          type="submit"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ← Cerrar sesión
        </button>
      </form>
    </div>
  );

  const barra =
    "bg-gradient-to-b from-[#0c1528] via-[#111d3a] to-[#0f1f3d]";

  const marca = (
    <div>
      <span className="text-white font-extrabold text-lg tracking-tight">
        Work<span className="text-blue-400">a</span>
      </span>
      <p className="mt-1 text-[9px] font-bold tracking-[.14em] uppercase text-blue-400/60">
        Panel de empresa
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex min-h-screen bg-slate-50">
      {/* ── Barra lateral (escritorio) ───────────────────────────────── */}
      <aside
        className={`hidden lg:flex w-56 shrink-0 flex-col sticky top-0 h-screen border-r border-white/5 ${barra}`}
      >
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <Link href="/empresa" className="block">
            {marca}
          </Link>
        </div>
        {nav}
        {pie}
      </aside>

      {/* ── Cajón lateral (celular) ──────────────────────────────────── */}
      {menu && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/55"
            onClick={() => setMenu(false)}
          />
          <aside className={`relative w-60 flex flex-col h-full ${barra}`}>
            <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-start justify-between">
              {marca}
              <button
                onClick={() => setMenu(false)}
                aria-label="Cerrar menú"
                className="text-slate-400 text-xl leading-none -mt-1 cursor-pointer"
              >
                ×
              </button>
            </div>
            {nav}
            {pie}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <header className="h-14 px-4 lg:px-8 flex items-center justify-between shrink-0 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMenu(true)}
              aria-label="Abrir menú"
              className="lg:hidden w-9 h-9 -ml-1 rounded-lg grid place-items-center text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="M2 4.5h14M2 9h14M2 13.5h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {saludo}, {nombre}
              <span className="hidden md:inline font-normal text-slate-400">
                {" — "}
                {fecha}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <NotificationBell notifications={notifications} />
            <Link
              href="/empresa/vacantes/nueva"
              className="flex items-center gap-2 px-3 lg:px-4 h-9 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M6 1.5v9M1.5 6h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden sm:inline">Nueva vacante</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:px-8 lg:py-7 w-full max-w-[1180px]">
          {children}
        </main>
      </div>
    </div>
  );
}
