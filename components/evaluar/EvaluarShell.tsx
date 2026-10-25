"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions";
import NewProcess from "@/components/evaluar/NewProcess";
import WorkaCopilot from "@/components/evaluar/WorkaCopilot";

// Marco del panel de Worka Evaluar: barra lateral con la acción principal
// («Nuevo proceso»), las secciones y el uso del plan abajo; barra superior
// con buscador, ayuda, ajustes y el menú de la cuenta.
//
// Está siempre conectado a Worka Empresas: la barra lateral lleva a las
// vacantes, el talento y los mensajes del panel de empresa, y la cuenta es
// la misma. El sistema visual es el del ecosistema Worka (lienzo cálido,
// tarjetas blancas, azul para las acciones); Evaluar se reconoce por su chip.

export type ShellInfo = {
  companyName: string;
  logoUrl: string | null;
  email: string;
  verified: boolean;
  plan: {
    label: string;
    inTrial: boolean;
    active: boolean;
    daysLeft: number;
    // null = sin límite de procesos activos
    limit: number | null;
    activeCount: number;
  };
  processCount: number;
  jobs: { id: string; title: string; linked: boolean }[];
};

const SECTIONS = [
  { href: "/evaluar/app", label: "Inicio", Icon: LayoutDashboard, match: (p: string) => p === "/evaluar/app" },
  { href: "/evaluar/app/procesos", label: "Procesos", Icon: ClipboardList, match: (p: string) => p.startsWith("/evaluar/app/procesos"), count: true },
  { href: "/evaluar/app/desempeno", label: "Desempeño", Icon: TrendingUp, match: (p: string) => p.startsWith("/evaluar/app/desempeno") },
  { href: "/evaluar/app/plan", label: "Plan y facturación", Icon: CreditCard, match: (p: string) => p.startsWith("/evaluar/app/plan") },
  { href: "/evaluar/app/ajustes", label: "Ajustes", Icon: Settings, match: (p: string) => p.startsWith("/evaluar/app/ajustes") },
];

// El otro lado de la misma cuenta: Worka Empresas.
const WORKA = [
  { href: "/empresa", label: "Panel de empresa", Icon: Building2 },
  { href: "/empresa/vacantes/nueva", label: "Publicar vacante", Icon: Briefcase },
  { href: "/empresa/talento", label: "Buscar talento", Icon: Users },
  { href: "/empresa/mensajes", label: "Mensajes", Icon: MessageCircle },
];

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "W"
  );
}

export default function EvaluarShell({ children, info }: { children: React.ReactNode; info: ShellInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const outside = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  useEffect(() => {
    if (!drawer) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [drawer]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/evaluar/app/procesos?q=${encodeURIComponent(q)}` : "/evaluar/app/procesos");
    setDrawer(false);
  }

  const { plan } = info;
  const pct = plan.limit ? Math.min(100, Math.round((plan.activeCount / plan.limit) * 100)) : 12;
  const avatar = (cls: string) => (
    <span className={`ev-avatar ${cls}`} aria-hidden>
      {info.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={info.logoUrl} alt="" />
      ) : (
        initials(info.companyName)
      )}
    </span>
  );

  const sidebar = (
    <div className="ev-side-inner">
      {info.plan.active && <NewProcess jobs={info.jobs} triggerClassName="ev-compose" />}

      <nav className="ev-side-nav" aria-label="Worka Evaluar">
        {SECTIONS.map(({ href, label, Icon, match, count }) => (
          <Link key={href} href={href} className="ev-side-link" aria-current={match(pathname) ? "page" : undefined} onClick={() => setDrawer(false)}>
            <Icon size={18} strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            {count && info.processCount > 0 && <span className="ev-side-count">{info.processCount}</span>}
          </Link>
        ))}
      </nav>

      <div className="ev-side-sep" />
      <p className="ev-side-title">Worka Empresas</p>
      <nav className="ev-side-nav" aria-label="Worka Empresas">
        {WORKA.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="ev-side-link is-external" onClick={() => setDrawer(false)}>
            <Icon size={18} strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            <ExternalLink size={14} className="opacity-50" />
          </Link>
        ))}
      </nav>

      {/* Uso del plan, como el almacenamiento de un correo: siempre a la
          vista, para no enterarse del límite al querer publicar. */}
      <div className="ev-plan">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1d2226]">Plan {plan.label}</p>
          <Link href="/evaluar/app/plan" className="ev-plan-btn">
            {plan.inTrial || !plan.active ? "Contratar" : "Mejorar"}
          </Link>
        </div>
        <div className="ev-meter" aria-hidden>
          <span style={{ width: `${pct}%` }} className={plan.limit && plan.activeCount >= plan.limit ? "is-full" : ""} />
        </div>
        <p className="text-xs text-[#666] flex justify-between gap-2">
          <span>
            <strong className="text-[#1d2226]">{plan.activeCount}</strong>
            {plan.limit === null ? (plan.activeCount === 1 ? " proceso activo" : " procesos activos") : ` de ${plan.limit} activos`}
          </span>
          {plan.inTrial && <span>{plan.daysLeft} días de prueba</span>}
          {!plan.active && <span className="text-red-700 font-semibold">Vencido</span>}
        </p>
      </div>
    </div>
  );

  return (
    <div className="company-app ev-app flex-1 flex flex-col min-h-screen">
      <header className="ev-top print:hidden">
        <button type="button" className="ev-icon-btn lg:!hidden" onClick={() => setDrawer(true)} aria-label="Abrir menú">
          <Menu size={21} />
        </button>
        <Link href="/evaluar/app" className="ev-brand" aria-label="Worka Evaluar, inicio">
          <span className="ev-brand-name">
            Worka<span>.click</span>
          </span>
          <small className="ev-chip">Evaluar</small>
        </Link>

        <form onSubmit={search} className="ev-search" role="search">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar procesos" aria-label="Buscar procesos" />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <WorkaCopilot />
          <Link href="/empresa" className="ev-pill hidden md:inline-flex" title="Volver al panel de empresa">
            <Building2 size={16} /> Panel de empresa
          </Link>
          <Link href="/evaluar/recursos" className="ev-icon-btn" title="Ayuda y guías" aria-label="Ayuda y guías">
            <CircleHelp size={20} />
          </Link>
          <Link
            href="/evaluar/app/ajustes"
            className="ev-icon-btn"
            title="Ajustes"
            aria-label="Ajustes"
            aria-current={pathname.startsWith("/evaluar/app/ajustes") ? "page" : undefined}
          >
            <Settings size={20} />
          </Link>
          <div className="relative" ref={menuRef}>
            <button type="button" className="ev-account" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label="Menú de la cuenta">
              {avatar("is-sm")}
              <ChevronDown size={14} className="hidden sm:block text-[#666]" />
            </button>
            {menu && (
              <div className="ev-menu" role="dialog" aria-label="Cuenta">
                <div className="flex flex-col items-center text-center gap-1.5 pb-3">
                  {avatar("is-lg")}
                  <p className="font-semibold text-[#1d2226] mt-1">{info.companyName}</p>
                  {info.email && <p className="text-xs text-[#666] break-all">{info.email}</p>}
                  <p className="text-xs flex items-center gap-1.5 text-[#666]">
                    <span className={`w-1.5 h-1.5 rounded-full ${info.verified ? "bg-emerald-600" : "bg-amber-500"}`} />
                    {info.verified ? "Empresa verificada" : "Verificación pendiente"}
                  </p>
                </div>
                <div className="ev-menu-links">
                  <Link href="/evaluar/app/ajustes" onClick={() => setMenu(false)}>
                    <Settings size={17} /> Ajustes de la cuenta
                  </Link>
                  <Link href="/empresa/perfil" onClick={() => setMenu(false)}>
                    <Building2 size={17} /> Perfil de empresa
                  </Link>
                  <Link href="/evaluar/app/plan" onClick={() => setMenu(false)}>
                    <CreditCard size={17} /> Plan y facturación
                  </Link>
                  <Link href="/empresa" onClick={() => setMenu(false)}>
                    <LayoutDashboard size={17} /> Ir al panel de empresa
                  </Link>
                </div>
                <form action={signOut}>
                  <button type="submit" className="ev-logout">
                    <LogOut size={17} /> Cerrar sesión
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="ev-body">
        <aside className="ev-side print:hidden" aria-label="Menú de Evaluar">
          {sidebar}
        </aside>
        <main className="ev-main">{children}</main>
      </div>

      {drawer && (
        <div className="ev-drawer-backdrop" onClick={() => setDrawer(false)}>
          <div className="ev-drawer" role="dialog" aria-modal="true" aria-label="Menú de Evaluar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="ev-brand-name">
                Worka<span>.click</span>
              </span>
              <button type="button" className="ev-icon-btn" onClick={() => setDrawer(false)} aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={search} className="ev-search is-drawer" role="search">
              <Search size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar procesos" aria-label="Buscar procesos" />
            </form>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
