"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Bookmark, ClipboardList, MessageCircle, UserRound } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import type { Notification } from "@/lib/types";

const NAV = [
  { href: "/empleos", label: "Buscar empleo", Icon: BriefcaseBusiness },
  { href: "/guardados", label: "Guardados", Icon: Bookmark },
  { href: "/postulaciones", label: "Postulaciones", Icon: ClipboardList },
  { href: "/mensajes", label: "Mensajes", Icon: MessageCircle },
  { href: "/perfil", label: "Mi perfil", Icon: UserRound },
];

export default function CandidateHeader({ loggedIn = false, notifications = [] }: {
  loggedIn?: boolean; notifications?: Notification[];
}) {
  const pathname = usePathname();
  return (
    <header className="candidate-header print:hidden">
      <div className="candidate-header-inner">
        <Link href="/empleos" className="candidate-brand" aria-label="Worka, buscar empleo">Worka<span>.click</span></Link>
        <nav className="candidate-desktop-nav" aria-label="Navegación principal">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>
              <Icon size={20} strokeWidth={1.7} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loggedIn ? <NotificationBell notifications={notifications} /> : <Link href="/ingresar" className="text-sm font-semibold text-primary px-2 py-3">Ingresar</Link>}
          <Link href={loggedIn ? "/perfil" : "/ingresar"} className="candidate-user" aria-label={loggedIn ? "Mi perfil" : "Ingresar a mi cuenta"}><UserRound size={18} /></Link>
        </div>
      </div>
    </header>
  );
}
