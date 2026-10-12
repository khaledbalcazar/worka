"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  ChevronRight,
  ClipboardList,
  FileText,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  UserRound,
  Crown,
} from "lucide-react";
import { signOut } from "@/app/actions";

export type ProfileSummary = {
  name: string;
  city: string;
  avatarUrl: string | null;
  identityVerified: boolean;
  emailVerified: boolean;
  completion: number; // 0–100
  nextStep: { label: string; href: string } | null;
};

// Evento que dispara Mi perfil al cambiar la foto: el encabezado la muestra al
// instante, sin esperar a que el servidor vuelva a pintar el layout.
export const AVATAR_EVENT = "worka:avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  url,
  name,
  className,
}: {
  url: string | null;
  name: string;
  className: string;
}) {
  return (
    <span className={`profile-menu-avatar ${className}`} aria-hidden>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" />
      ) : name ? (
        initials(name)
      ) : (
        <UserRound size={18} />
      )}
    </span>
  );
}

// Menú de la cuenta: se abre al tocar el avatar del encabezado. Muestra la
// foto, los datos básicos, cuánto falta para completar el perfil y accesos a
// la cuenta. En celular ocupa el ancho de la pantalla, debajo del encabezado.
export default function ProfileMenu({ profile }: { profile: ProfileSummary }) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  // La foto recién subida pisa a la del servidor hasta que este se actualice.
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const avatarUrl = newAvatar ?? profile.avatarUrl;

  useEffect(() => {
    const onAvatar = (e: Event) => setNewAvatar((e as CustomEvent<string>).detail);
    window.addEventListener(AVATAR_EVENT, onAvatar);
    return () => window.removeEventListener(AVATAR_EVENT, onAvatar);
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  // Desde /perfil el ancla cambia sin recargar y no dispara "hashchange":
  // se abre a mano la sección (<details>) a la que apunta.
  function openSection(href: string) {
    setOpen(false);
    if (pathname !== "/perfil") return;
    const id = href.split("#")[1];
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) el.open = true;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const links = [
    { href: "/perfil", label: "Ver mi perfil", Icon: UserRound },
    { href: "/cv", label: "Mi CV", Icon: FileText },
    { href: "/postulaciones", label: "Mis postulaciones", Icon: ClipboardList },
    { href: "/guardados", label: "Empleos guardados", Icon: Bookmark },
    { href: "/alertas", label: "Alertas de empleo", Icon: Bell },
    { href: "/pro", label: "Worka Pro", Icon: Crown },
  ];
  const account = [
    { href: "/perfil#privacidad", label: "Avisos y privacidad", Icon: ShieldCheck },
    { href: "/perfil#configuracion", label: "Configuración de la cuenta", Icon: Settings },
  ];

  return (
    <div className="relative" ref={root}>
      <button
        ref={trigger}
        type="button"
        className="profile-menu-trigger"
        aria-label="Abrir el menú de mi cuenta"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar url={avatarUrl} name={profile.name} className="is-small" />
      </button>

      {open && (
        <div id={panelId} className="profile-menu" role="dialog" aria-label="Mi cuenta">
          <div className="profile-menu-head">
            <Avatar url={avatarUrl} name={profile.name} className="is-large" />
            <div className="min-w-0">
              <p className="profile-menu-name">
                {profile.name || "Tu perfil"}
                {profile.identityVerified && (
                  <BadgeCheck size={16} className="text-primary shrink-0" aria-label="Identidad verificada" />
                )}
              </p>
              {profile.city && (
                <p className="profile-menu-meta">
                  <MapPin size={12} /> {profile.city}
                </p>
              )}
              <p className="profile-menu-meta">
                {profile.emailVerified ? "Email verificado" : "Email sin confirmar"}
              </p>
            </div>
          </div>

          <Link href="/perfil" className="btn-secondary w-full !min-h-10" onClick={() => setOpen(false)}>
            Ver perfil completo
          </Link>

          <div className="profile-menu-progress">
            <div className="flex items-center justify-between gap-2">
              <span>Perfil completo al {profile.completion}%</span>
              {profile.nextStep && (
                <Link href={profile.nextStep.href} className="text-primary font-semibold" onClick={() => openSection(profile.nextStep!.href)}>
                  {profile.nextStep.label}
                </Link>
              )}
            </div>
            <div
              className="profile-progress-track !w-full mt-2"
              role="progressbar"
              aria-valuenow={profile.completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Completitud del perfil"
            >
              <span style={{ width: `${profile.completion}%` }} />
            </div>
          </div>

          <nav aria-label="Mi actividad">
            <p className="profile-menu-group">Mi actividad</p>
            {links.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="profile-menu-link" onClick={() => setOpen(false)}>
                <Icon size={18} /> <span>{label}</span> <ChevronRight size={15} />
              </Link>
            ))}
          </nav>
          <nav aria-label="Cuenta">
            <p className="profile-menu-group">Cuenta</p>
            {account.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="profile-menu-link" onClick={() => openSection(href)}>
                <Icon size={18} /> <span>{label}</span> <ChevronRight size={15} />
              </Link>
            ))}
            <form action={signOut}>
              <button type="submit" className="profile-menu-link is-danger">
                <LogOut size={18} /> <span>Cerrar sesión</span>
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
