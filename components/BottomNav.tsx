"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileText,
  Gamepad2,
  LineChart,
  LogOut,
  MessageCircle,
  Menu,
  Newspaper,
  Search,
  Settings,
  Star,
  Target,
  User,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions";

// Barra inferior estilo app. Cinco destinos fijos + "Más", que abre una hoja
// con el resto de la plataforma: en el celular la nav del encabezado está
// oculta, así que sin esta hoja secciones enteras (alertas, CV, salarios,
// panorama, reseñas, academia…) quedaban sin ninguna forma de llegar.
const MAIN = [
  { href: "/empleos", label: "Empleos", Icon: Search },
  { href: "/postulaciones", label: "Postulaciones", Icon: ClipboardList },
  { href: "/mensajes", label: "Mensajes", Icon: MessageCircle },
  { href: "/perfil", label: "Mi perfil", Icon: User },
];

const GROUPS: {
  title: string;
  items: { href: string; label: string; hint: string; Icon: typeof Search }[];
}[] = [
  {
    title: "Mi búsqueda",
    items: [
      {
        href: "/alertas",
        label: "Alertas de empleo",
        hint: "Avisos de vacantes nuevas",
        Icon: Bell,
      },
      {
        href: "/cv",
        label: "Mi CV",
        hint: "Generalo gratis en PDF",
        Icon: FileText,
      },
      {
        href: "/test-perfil",
        label: "Test de perfil",
        hint: "Afiná tus recomendaciones",
        Icon: Target,
      },
    ],
  },
  {
    title: "Explorar",
    items: [
      {
        href: "/panorama",
        label: "Panorama del mercado",
        hint: "Datos del empleo en tu país",
        Icon: LineChart,
      },
      {
        href: "/salarios",
        label: "Salarios",
        hint: "Cuánto se paga en tu rubro",
        Icon: Wallet,
      },
      {
        href: "/opiniones",
        label: "Reseñas de empresas",
        hint: "Cómo es trabajar ahí",
        Icon: Star,
      },
      {
        href: "/freelancer",
        label: "Worka Freelancers",
        hint: "Ofrecé tus servicios",
        Icon: Briefcase,
      },
      {
        href: "/academia",
        label: "Academia",
        hint: "Cursos gratis con certificado",
        Icon: BookOpen,
      },
      {
        href: "/blog",
        label: "Blog",
        hint: "Consejos para tu búsqueda",
        Icon: Newspaper,
      },
      {
        href: "/juegos",
        label: "Worka Play",
        hint: "Juegos y tips",
        Icon: Gamepad2,
      },
    ],
  },
];

export default function BottomNav({ loggedIn = true }: { loggedIn?: boolean }) {
  const pathname = usePathname();
  // La hoja se cierra sola al navegar: en una app nadie espera volver y
  // encontrarla abierta encima de la pantalla nueva. Se resuelve guardando en
  // qué ruta se abrió, en vez de cerrarla desde un efecto (que dispara un
  // render extra en cada navegación).
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const moreOpen = openedAt === pathname;
  const setMoreOpen = (open: boolean) => setOpenedAt(open ? pathname : null);

  // Con la hoja abierta el fondo no debe correrse al arrastrar.
  useEffect(() => {
    if (!moreOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [moreOpen]);

  const inMore = GROUPS.some((g) =>
    g.items.some((i) => pathname.startsWith(i.href))
  );

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      )}

      {/* Hoja "Más": se desliza desde abajo y deja lugar para el pulgar. */}
      <div
        role="dialog"
        aria-label="Más secciones"
        aria-hidden={!moreOpen}
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl transition-transform duration-200 ease-out max-h-[85vh] flex flex-col ${
          moreOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <h2 className="font-bold text-primary-dark">Todo Worka</h2>
          <button
            onClick={() => setMoreOpen(false)}
            aria-label="Cerrar"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-surface"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {GROUPS.map((group) => (
            <section key={group.title} className="mb-2">
              <p className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {group.title}
              </p>
              <div className="grid grid-cols-1 gap-0.5">
                {group.items.map(({ href, label, hint, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-2xl active:bg-surface"
                  >
                    <span className="w-10 h-10 shrink-0 rounded-2xl bg-surface flex items-center justify-center text-primary">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-800">
                        {label}
                      </span>
                      <span className="block text-xs text-gray-400 truncate">
                        {hint}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="mb-2 border-t border-gray-100 pt-2">
            {loggedIn ? (
              <>
                <Link
                  href="/perfil#configuracion"
                  className="flex items-center gap-3 px-2 py-2.5 rounded-2xl active:bg-surface"
                >
                  <span className="w-10 h-10 shrink-0 rounded-2xl bg-surface flex items-center justify-center text-gray-500">
                    <Settings size={18} />
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    Configuración
                  </span>
                </Link>
                {/* Cerrar sesión no existía en el celular: el botón del
                    encabezado es solo de escritorio. */}
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl active:bg-surface text-left"
                >
                  <span className="w-10 h-10 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-danger">
                    <LogOut size={18} />
                  </span>
                  <span className="text-sm font-medium text-danger">
                    Cerrar sesión
                  </span>
                </button>
              </>
            ) : (
              <div className="px-2 py-2 space-y-2">
                <Link href="/ingresar?modo=registro" className="btn-primary w-full">
                  Crear cuenta gratis
                </Link>
                <Link href="/ingresar" className="btn-secondary w-full">
                  Ya tengo cuenta
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 lg:hidden print:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {MAIN.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 min-h-14 text-[11px] font-medium ${
                  active ? "text-primary" : "text-gray-400"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-label="Más secciones"
            className={`flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 min-h-14 text-[11px] font-medium ${
              moreOpen || inMore ? "text-primary" : "text-gray-400"
            }`}
          >
            <Menu size={21} strokeWidth={moreOpen || inMore ? 2.4 : 1.9} />
            <span className="leading-none">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}
