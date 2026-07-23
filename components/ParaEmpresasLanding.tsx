"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  ChevronRight,
  Menu,
  MessageCircle,
  BadgeCheck,
  Zap,
  TrendingUp,
  Globe,
  Star,
  ArrowRight,
  Users,
  Eye,
  FileText,
  BarChart2,
  Shield,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import Logo from "@/components/Logo";

// Landing "Para empresas" — diseño de Figma adaptado a la paleta de Worka
// (primary #2563EB, primary-dark #1E3A8A) y con enlaces reales de la app.

const FEATURES = [
  "Publicá vacantes ilimitadas, gratis",
  "Plantillas para publicar en 2 minutos",
  "Preguntas de filtro: leé solo CVs que aplican",
  "Tablero de candidatos con contacto directo por WhatsApp",
  "Sello de empresa verificada e insignias que generan confianza",
  "Métricas de cada búsqueda: vistas, postulaciones y contactados",
];

const HOW_STEPS = [
  {
    number: "01",
    title: "Registrá tu empresa",
    description:
      "Creá tu cuenta en minutos. Verificamos tu RUC ante la DNIT para otorgarte el sello de empresa confiable.",
    icon: BadgeCheck,
  },
  {
    number: "02",
    title: "Publicá tu vacante",
    description:
      "Usá nuestras plantillas para describir el puesto en menos de 2 minutos, con preguntas de filtro incluidas.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Gestioná y contactá",
    description:
      "Revisá candidatos en tu tablero Kanban y escribiles directamente por WhatsApp con un clic.",
    icon: MessageCircle,
  },
];

const WORKAADS_PERKS = [
  {
    icon: TrendingUp,
    title: "Vacante destacada en el feed",
    description:
      "Tu oferta aparece primero y con un badge especial ante miles de candidatos activos en Worka.",
  },
  {
    icon: Globe,
    title: "Publicación en Google Jobs",
    description:
      "Tu vacante aparece en la búsqueda de Google cuando alguien busca empleo en Paraguay.",
  },
  {
    icon: Zap,
    title: "Distribución en plataformas externas",
    description:
      "Llegamos a más canales: redes sociales, portales de empleo y alertas push a candidatos.",
  },
  {
    icon: BarChart2,
    title: "Analíticas avanzadas",
    description:
      "Seguí el rendimiento de tu vacante con métricas detalladas de alcance e impacto real.",
  },
];

type Cell = true | false | string;
interface CompRow {
  feature: string;
  worka: Cell;
  linkedin: Cell;
  empleapy: Cell;
  infojobs: Cell;
}
const COMPARISON: CompRow[] = [
  { feature: "Publicación de vacantes gratis", worka: true, linkedin: false, empleapy: true, infojobs: false },
  { feature: "Verificación de empresa (RUC)", worka: true, linkedin: false, empleapy: false, infojobs: false },
  { feature: "Tablero Kanban de candidatos", worka: true, linkedin: "Solo premium", empleapy: false, infojobs: false },
  { feature: "Contacto directo por WhatsApp", worka: true, linkedin: false, empleapy: false, infojobs: false },
  { feature: "Preguntas de filtro/screening", worka: true, linkedin: "Solo premium", empleapy: false, infojobs: "Solo premium" },
  { feature: "Foco 100% en Paraguay", worka: true, linkedin: false, empleapy: true, infojobs: false },
  { feature: "Rutas de transporte público", worka: true, linkedin: false, empleapy: false, infojobs: false },
  { feature: "Alertas WhatsApp a candidatos", worka: true, linkedin: false, empleapy: false, infojobs: false },
  { feature: "Vacante en Google Jobs (WorkaAds)", worka: true, linkedin: false, empleapy: false, infojobs: false },
];

const TESTIMONIALS = [
  {
    name: "María Fernández",
    role: "Gerente de RRHH",
    company: "Supermercados El Trigal",
    text: "Con Worka llenamos 4 puestos de cajeros en menos de una semana. El tablero Kanban hace que el proceso sea muy ordenado.",
    rating: 5,
    initials: "MF",
  },
  {
    name: "Carlos Benítez",
    role: "Dueño",
    company: "Panadería Don Carlos",
    text: "Nunca pensé que una pyme del barrio podía usar una herramienta tan buena. Es gratis y los candidatos llegan solos.",
    rating: 5,
    initials: "CB",
  },
  {
    name: "Laura Giménez",
    role: "Directora de Talento",
    company: "Grupo Vierci",
    text: "El sello de verificación genera confianza real. Los candidatos se animan más cuando ven que somos una empresa legítima.",
    rating: 5,
    initials: "LG",
  },
];

function CheckCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.5} />
        </div>
      </div>
    );
  return (
    <div className="flex justify-center">
      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
        {value}
      </span>
    </div>
  );
}

function CandidateCard({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-primary">
          {name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">{name}</div>
          <div className="text-xs text-gray-400">{score}% compatibilidad</div>
        </div>
      </div>
      <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
        <MessageCircle className="w-3 h-3" />
        WhatsApp
      </span>
    </div>
  );
}

const NAV = [
  { label: "Buscar empleo", href: "/empleos" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para empresas", href: "/para-empresas", active: true },
  { label: "Preguntas", href: "/#faq" },
];

export default function ParaEmpresasLanding({
  countryName = "Paraguay",
  currencyName = "guaraní",
  taxIdLabel = "RUC",
  isPy = true,
}: {
  countryName?: string;
  currencyName?: string;
  taxIdLabel?: string;
  isPy?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Versiones de los datos adaptadas al país (moneda, etiqueta fiscal, nombre).
  const howSteps = HOW_STEPS.map((s, i) =>
    i === 0
      ? {
          ...s,
          description: isPy
            ? s.description
            : `Creá tu cuenta en minutos. Verificamos tu ${taxIdLabel} para otorgarte el sello de empresa confiable.`,
        }
      : s
  );
  const workaAdsPerks = WORKAADS_PERKS.map((p) =>
    p.title === "Publicación en Google Jobs"
      ? {
          ...p,
          description: `Tu vacante aparece en la búsqueda de Google cuando alguien busca empleo en ${countryName}.`,
        }
      : p
  );
  const comparison = COMPARISON.map((r) => {
    if (r.feature === "Verificación de empresa (RUC)")
      return { ...r, feature: `Verificación de empresa (${taxIdLabel})` };
    if (r.feature === "Foco 100% en Paraguay")
      return { ...r, feature: `Foco 100% en ${countryName}` };
    return r;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm transition-colors ${
                  l.active
                    ? "text-primary font-bold"
                    : "text-gray-500 hover:text-gray-800 font-medium"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/ingresar" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Crear cuenta
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            {NAV.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-gray-700"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/registro"
              className="text-sm font-bold bg-primary text-white px-4 py-2.5 rounded-lg text-center"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-14 flex items-center bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-7">
            <span className="inline-flex items-center text-xs font-bold text-primary bg-white border border-blue-200 px-3 py-1.5 rounded-full w-fit shadow-sm">
              Para empresas
            </span>

            <h1 className="text-4xl lg:text-[2.85rem] font-extrabold text-primary-dark leading-[1.1] tracking-tight">
              Encontrá talento local, verificado y sin pagar un {currencyName}
            </h1>

            <p className="text-[0.95rem] text-gray-500 leading-relaxed max-w-lg">
              Desde la pyme del barrio hasta la cadena nacional: publicá en
              minutos, filtrá con preguntas inteligentes y contactá por WhatsApp
              al candidato correcto.
            </p>

            <ul className="flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-[0.875rem] text-gray-700">{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/empresa/registro"
                className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 text-sm"
              >
                Registrá tu empresa
              </Link>
              <Link
                href="/empresa"
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3.5 rounded-xl hover:border-blue-300 hover:text-primary transition-all text-sm"
              >
                Ver el panel de ejemplo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Dashboard card */}
          <div className="hidden lg:flex justify-end">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-[340px]">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 mb-0.5">
                    Cajero/a para sucursal centro
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    Panel de candidatos
                  </div>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                  Activo
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Postulaciones", value: "342" },
                  { label: "En revisión", value: "23" },
                  { label: "Entrevistas", value: "5" },
                ].map((s) => (
                  <div key={s.label} className="py-4 text-center">
                    <div className="text-xl font-extrabold text-primary">{s.value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 flex flex-col gap-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  Candidatos destacados
                </div>
                <CandidateCard name="Carlos B." score={94} />
                <CandidateCard name="Lucía M." score={87} />
              </div>

              <div className="px-4 pb-4">
                <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-primary">
                    <strong>487 personas</strong> vieron tu vacante esta semana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-primary py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: "12.000+", label: "Candidatos activos" },
            { value: "800+", label: "Empresas registradas" },
            { value: "2 min", label: "Para publicar una vacante" },
            { value: "100%", label: "Gratis para empezar" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 lg:py-24 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Simple y rápido
            </span>
            <h2 className="text-3xl font-extrabold text-primary-dark mt-3 leading-tight">
              Tres pasos para encontrar a tu próximo empleado
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {howSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col gap-5 p-7 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-4xl font-extrabold text-blue-100">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary-dark mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panel Kanban */}
      <section id="panel" className="py-20 lg:py-24 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Tablero Kanban
            </span>
            <h2 className="text-3xl font-extrabold text-primary-dark leading-tight">
              Gestioná tus candidatos en un solo lugar
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              Tu panel te muestra en tiempo real quiénes aplicaron, cuántos
              revisaste y quiénes están listos para entrevistar. Contacto directo
              por WhatsApp con un clic — sin intermediarios.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Columnas: Nuevos → En revisión → Entrevista → Contratado",
                "Filtro automático por preguntas de screening",
                "WhatsApp directo desde el perfil del candidato",
                "Métricas por vacante: vistas, aplicaciones, contactos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/empresa"
              className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all w-fit"
            >
              Ver demo en vivo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400">Vacante activa</div>
                <div className="text-sm font-bold text-gray-800">
                  Encargado/a de local — Asunción
                </div>
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Activo
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {[
                  { label: "Nuevos", count: 18, color: "bg-blue-50 border-blue-100", badge: "bg-primary", candidates: [{ name: "Ana R.", compat: 91 }, { name: "Jorge P.", compat: 85 }] },
                  { label: "En revisión", count: 7, color: "bg-amber-50 border-amber-100", badge: "bg-amber-500", candidates: [{ name: "Sofía M.", compat: 88 }, { name: "Marcos L.", compat: 76 }] },
                  { label: "Entrevista", count: 3, color: "bg-green-50 border-green-100", badge: "bg-green-600", candidates: [{ name: "Pablo G.", compat: 95 }] },
                ].map((col) => (
                  <div key={col.label} className={`rounded-xl border p-3 w-44 ${col.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-600">{col.label}</span>
                      <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                        {col.count}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.candidates.map((c) => (
                        <div key={c.name} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-50">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-primary">
                              {c.name[0]}
                            </div>
                            <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-400">{c.compat}% match</span>
                            <span className="flex items-center gap-0.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              <MessageCircle className="w-2.5 h-2.5" />
                              WA
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {[{ label: "Vistas", value: "1.204" }, { label: "Aplicaron", value: "28" }, { label: "Contactados", value: "11" }].map((s) => (
                <div key={s.label} className="bg-surface rounded-xl p-2.5 text-center">
                  <div className="text-base font-extrabold text-primary">{s.value}</div>
                  <div className="text-[10px] text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WorkaAds */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  WorkaAds
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Potenciá tu vacante
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-primary-dark leading-tight">
                ¿Querés llegar a más candidatos más rápido?
              </h2>
              <p className="text-gray-500 leading-relaxed text-sm">
                Con WorkaAds tu vacante deja de ser una publicación más. La
                destacamos en el feed de Worka, la distribuimos en Google Jobs y
                la llevamos a otras plataformas para que el candidato correcto la
                encuentre — donde sea que esté buscando.
              </p>
              <Link
                href="/empresa"
                className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-blue-200 w-fit text-sm"
              >
                Potenciar mi vacante
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {workaAdsPerks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.title}
                    className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-primary-dark">
                      {perk.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary to-primary-dark">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-extrabold text-lg">WorkaAds</span>
              </div>
              <p className="text-blue-200 text-sm max-w-md">
                Tu vacante en Google Jobs, el feed de Worka y las principales
                plataformas de empleo del país. Más alcance, menos tiempo sin
                contratar.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {[{ label: "Google Jobs", icon: Globe }, { label: "Feed destacado", icon: TrendingUp }, { label: "Redes sociales", icon: Users }].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 bg-white/10 rounded-xl px-4 py-3 border border-white/15">
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-white text-xs font-semibold whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Por qué Worka — Comparación */}
      <section className="py-20 lg:py-24 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Por qué Worka
            </span>
            <h2 className="text-3xl font-extrabold text-primary-dark mt-3 leading-tight">
              La única plataforma pensada 100% para el mercado laboral de{" "}
              {countryName}
            </h2>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
              LinkedIn cobra caro y los portales genéricos no entienden el
              contexto local. Worka está construido para {countryName}: con su
              cultura, sus empresas y sus candidatos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: MapPin, title: "100% local", description: `Rutas de transporte, barrios y contexto de ${countryName} integrado.` },
              { icon: DollarSign, title: "Gratis de verdad", description: "Las funciones esenciales no tienen costo oculto ni período de prueba." },
              { icon: Shield, title: "Verificado y seguro", description: `${taxIdLabel} validado, bloqueo de fraudes y reportes de la comunidad.` },
              { icon: Clock, title: "Rápido de usar", description: "De registro a primera vacante publicada en menos de 5 minutos." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-blue-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-primary-dark">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-bold text-primary-dark w-2/5">
                      Funcionalidad
                    </th>
                    {[
                      { name: "Worka", highlight: true },
                      { name: "LinkedIn", highlight: false },
                      { name: "EmpleaPY", highlight: false },
                      { name: "Infojobs", highlight: false },
                    ].map((p) => (
                      <th key={p.name} className={`px-4 py-4 text-center text-sm font-bold ${p.highlight ? "text-primary" : "text-gray-400"}`}>
                        {p.highlight ? (
                          <span className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1 rounded-full text-xs">
                            <Check className="w-3 h-3" strokeWidth={3} />
                            {p.name}
                          </span>
                        ) : (
                          p.name
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3.5 bg-blue-50/40">
                        <CheckCell value={row.worka} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CheckCell value={row.linkedin} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CheckCell value={row.empleapy} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CheckCell value={row.infojobs} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-primary flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-blue-100 text-sm">
                Worka es la plataforma con más funciones gratuitas para empresas
                en {countryName}.
              </p>
              <Link
                href="/empresa/registro"
                className="shrink-0 bg-white text-primary text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Testimonios
            </span>
            <h2 className="text-3xl font-extrabold text-primary-dark mt-3 leading-tight">
              Empresas que ya confían en Worka
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col gap-5 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed flex-1 text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary-dark">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-7">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Tu próximo gran empleado está en Worka.
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Empresas de {countryName} ya encontraron el talento que buscaban.
            Empezá hoy, gratis, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/empresa/registro"
              className="flex items-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg text-sm"
            >
              Registrá tu empresa gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/empresa/registro"
              className="flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Hablar con el equipo
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-blue-300 pt-1">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" strokeWidth={3} /> Sin tarjeta de crédito</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" strokeWidth={3} /> Gratis para siempre</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" strokeWidth={3} /> Hecho en Paraguay 🇵🇾</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary-dark">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="flex flex-col gap-3">
            <Logo light />
            <p className="text-blue-300 text-xs max-w-xs leading-relaxed">
              La plataforma de empleo de {countryName}. Tu próximo paso empieza
              acá.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            {[
              { title: "Empresas", links: [["Publicar vacante", "/empresa/vacantes/nueva"], ["WorkaAds", "/empresa"], ["Registrar empresa", "/empresa/registro"], ["Panel de empresa", "/empresa"]] },
              { title: "Candidatos", links: [["Buscar empleo", "/empleos"], ["Primer empleo", "/empleos"], ["Generar CV", "/cv"], ["Crear cuenta", "/registro"]] },
              { title: "Worka", links: [["Inicio", "/"], ["Términos", "/terminos"], ["Privacidad", "/privacidad"], ["worka.click", "/"]] },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <div className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                  {col.title}
                </div>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-blue-300 hover:text-white transition-colors text-xs">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-400 text-xs">
            © 2026 Worka · Hecho con orgullo en Paraguay 🇵🇾
          </p>
          <div className="flex gap-5 text-xs text-blue-400">
            <Link href="/terminos" className="hover:text-white transition-colors">Términos de uso</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
