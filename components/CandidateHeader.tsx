"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { markNotificationsRead, signOut } from "@/app/actions";
import type { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/format";

const NAV = [
  { href: "/empleos", label: "Empleos", icon: "🔍" },
  { href: "/postulaciones", label: "Postulaciones", icon: "📋" },
  { href: "/mensajes", label: "Mensajes", icon: "💬" },
  { href: "/perfil", label: "Mi perfil", icon: "👤" },
];

export default function CandidateHeader({
  loggedIn = false,
  notifications = [],
}: {
  loggedIn?: boolean;
  notifications?: Notification[];
}) {
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(
    notifications.filter((n) => !n.read).length
  );

  function openBell() {
    const next = !bellOpen;
    setBellOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      markNotificationsRead();
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
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

        <div className="flex items-center gap-1.5">
          {loggedIn ? (
            <>
              {/* Campanita de notificaciones */}
              <div className="relative">
                <button
                  aria-label="Notificaciones"
                  onClick={openBell}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-surface"
                >
                  🔔
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-11 z-40 w-80 card shadow-lg p-2 max-h-96 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1.5">
                      Notificaciones
                    </p>
                    {notifications.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        Nada nuevo por acá.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href ?? "#"}
                        onClick={() => setBellOpen(false)}
                        className={`block px-3 py-2.5 rounded-xl hover:bg-surface ${
                          n.read ? "opacity-70" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {n.icon} {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {timeAgo(n.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
            </>
          ) : (
            <>
              <Link href="/ingresar" className="btn-secondary text-xs">
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="btn-primary text-xs hidden sm:inline-flex"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Aviso cuando no hay sesión (incluye sesión expirada por inactividad) */}
      {!loggedIn && (
        <div className="bg-amber-50 border-t border-amber-100 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-amber-800">
              🔒 Iniciá sesión para postularte, guardar vacantes y ver tu
              perfil.
            </p>
            <Link
              href="/ingresar"
              className="btn-primary text-xs shrink-0 py-1.5"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
