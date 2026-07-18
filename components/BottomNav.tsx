"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/empleos", label: "Empleos", icon: "🔍" },
  { href: "/postulaciones", label: "Postulaciones", icon: "📋" },
  { href: "/perfil", label: "Mi perfil", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 lg:hidden print:hidden">
      <div className="flex">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 min-h-14 text-xs font-medium ${
                active ? "text-primary" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
