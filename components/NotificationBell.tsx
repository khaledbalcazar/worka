"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/types";
import { markNotificationsRead } from "@/app/actions";
import { timeAgo } from "@/lib/format";

// Campanita de notificaciones, reutilizable en candidato y empresa.
// variant "dark" para headers oscuros (sidebar de empresa).
export default function NotificationBell({
  notifications,
  variant = "light",
}: {
  notifications: Notification[];
  variant?: "light" | "dark";
}) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(
    notifications.filter((n) => !n.read).length
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  function openBell() {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      setError(null);
      startTransition(async () => {
        try {
          const result = await markNotificationsRead();
          if (result.ok) setUnread(0);
          else setError("No pudimos marcar los avisos como leídos. Volvé a abrir para reintentar.");
        } catch {
          setError("No pudimos marcar los avisos como leídos. Volvé a abrir para reintentar.");
        }
      });
    }
  }

  return (
    <div ref={root} className="relative" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}>
      <button
        ref={trigger}
        aria-label={unread ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={openBell}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl ${
          variant === "dark"
            ? "text-blue-200 hover:bg-white/10"
            : "text-gray-500 hover:bg-surface"
        }`}
      >
        <Bell size={20} strokeWidth={1.7} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-11 z-40 w-80 max-w-[calc(100vw-2rem)] card shadow-lg p-2 max-h-96 overflow-y-auto text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1.5">
            Notificaciones
          </p>
          {error && <p role="alert" className="text-xs text-danger px-2 py-2">{error}</p>}
          {notifications.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Nada nuevo por acá.
            </p>
          )}
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              href={n.href}
              onClick={() => setOpen(false)}
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
            </NotificationItem>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ href, children, onClick, className }: {
  href: string | null;
  children: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  return href ? <Link href={href} onClick={onClick} className={className}>{children}</Link>
    : <div className={className}>{children}</div>;
}
