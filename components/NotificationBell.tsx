"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(
    notifications.filter((n) => !n.read).length
  );
  const [, startTransition] = useTransition();

  function openBell() {
    setOpen((v) => !v);
    if (unread > 0) {
      setUnread(0);
      startTransition(() => {
        markNotificationsRead();
      });
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notificaciones"
        onClick={openBell}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl ${
          variant === "dark"
            ? "text-blue-200 hover:bg-white/10"
            : "text-gray-500 hover:bg-surface"
        }`}
      >
        🔔
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 card shadow-lg p-2 max-h-96 overflow-y-auto text-left">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
