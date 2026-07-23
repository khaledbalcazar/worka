import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Bus,
  CheckCircle,
  Zap,
  Star,
  FileText,
  TrendingUp,
  MessageCircle,
  Briefcase,
  Building2,
  Users,
  Quote,
  ShoppingBag,
  UtensilsCrossed,
  Headphones,
  Truck,
  ClipboardList,
  Factory,
  HeartPulse,
  HardHat,
} from "lucide-react";
import Logo from "@/components/Logo";
import { COUNTRIES } from "@/lib/countries";
import { getActiveJobsCount, getSiteSettings } from "@/lib/data";
import HomeNav from "@/components/home/HomeNav";
import HeroSearch from "@/components/home/HeroSearch";
import ActivityFeed, { type ActivityItem } from "@/components/home/ActivityFeed";
import FaqAccordion from "@/components/home/FaqAccordion";

export const revalidate = 300;

/* ── Contenido base (se puede sobrescribir desde /admin) ── */

const ICON_MAP = {
  bus: Bus,
  check: CheckCircle,
  whatsapp: MessageCircle,
  rayo: Zap,
  estrella: Star,
  cv: FileText,
  escudo: Shield,
  grafico: TrendingUp,
  ventas: ShoppingBag,
  gastronomia: UtensilsCrossed,
  atencion: Headphones,
  logistica: Truck,
  administracion: ClipboardList,
  produccion: Factory,
  salud: HeartPulse,
  construccion: HardHat,
} as const;
type IconKey = keyof typeof ICON_MAP;

const CATEGORIES: { icon: IconKey; color: string; name: string; rubro: string }[] = [
  { icon: "ventas", color: "#2563EB", name: "Ventas y Comercio", rubro: "Ventas" },
  { icon: "gastronomia", color: "#F59E0B", name: "Gastronomía", rubro: "Gastronomía" },
  { icon: "atencion", color: "#10B981", name: "Atención al Cliente", rubro: "Atención al Cliente" },
  { icon: "logistica", color: "#7C5CFC", name: "Logística y Transporte", rubro: "Logística" },
  { icon: "administracion", color: "#2563EB", name: "Administración", rubro: "Administración" },
  { icon: "produccion", color: "#F59E0B", name: "Producción / Operario", rubro: "Producción" },
  { icon: "salud", color: "#E11D6C", name: "Salud", rubro: "Salud" },
  { icon: "construccion", color: "#10B981", name: "Construcción", rubro: "Construcción" },
];

const DIFFERENTIATORS: { icon: IconKey; color: string; title: string; text: string }[] = [
  { icon: "bus", color: "#2563EB", title: "Sabés cómo llegar", text: "Cada vacante presencial muestra las líneas de colectivo y abre en Google Maps o Moovit." },
  { icon: "check", color: "#10B981", title: "RUC verificado", text: "Contrastamos el RUC de cada empresa contra el registro público de la DNIT." },
  { icon: "whatsapp", color: "#10B981", title: "Alertas por WhatsApp", text: "Te avisamos cuando una empresa ve tu perfil o aparecen vacantes de tu rubro." },
  { icon: "rayo", color: "#F59E0B", title: "Postulación en segundos", text: "1 clic y hasta 3 preguntas simples. Sin formularios eternos." },
  { icon: "estrella", color: "#7C5CFC", title: "Modo primer empleo", text: "Filtrá solo vacantes sin requisito de experiencia. Nadie más lo hace en Paraguay." },
  { icon: "cv", color: "#2563EB", title: "CV gratis", text: "Respondé unas preguntas y generamos un PDF profesional sin costo alguno." },
  { icon: "escudo", color: "#10B981", title: "Cero estafas", text: "Bloqueamos ofertas que piden dinero. Con 3 denuncias la vacante se oculta sola." },
  { icon: "grafico", color: "#F59E0B", title: "Seguimiento real", text: "Sabés cuándo la empresa revisó tu perfil y por qué no avanzaste." },
];

const STEPS = [
  { title: "Creá tu perfil", text: "Con tu WhatsApp y tu ciudad alcanza. Si tenés CV lo leemos; si no, te lo generamos gratis en PDF." },
  { title: "Postulate con 1 clic", text: "Filtrá por ciudad, rubro o «primer empleo». Cada tarjeta muestra el salario y cómo llegar." },
  { title: "Recibí novedades", text: "Te avisamos por WhatsApp cuando la empresa revisa tu perfil. Sin apps raras." },
];

const COMPANY_FEATURES = [
  "Vacantes ilimitadas, sin costo",
  "Plantillas para publicar en 2 minutos",
  "Preguntas de filtro personalizadas",
  "Panel Kanban con WhatsApp directo",
  "Sello de empresa verificada con RUC",
  "Métricas por vacante: vistas, postulantes, contactados",
];

const FAQS = [
  { q: "¿Worka es gratis?", a: "Sí, para candidatos es gratis para siempre. Para empresas, publicar y gestionar candidatos tampoco tiene costo. Habrá opciones de visibilidad extra pagas, pero lo esencial no se cobra." },
  { q: "¿Cómo sé que la empresa es real?", a: "Toda empresa registra su RUC y lo contrastamos con la DNIT antes de darle el sello ✓ Verificada. Cada empresa tiene una página pública con su historial en Worka." },
  { q: "¿Necesito CV para postularme?", a: "No. Podés crear tu perfil respondiendo preguntas y Worka genera un CV profesional en PDF sin costo. Si ya tenés CV, lo subís y completamos tu perfil automáticamente." },
  { q: "¿Qué hago si veo una oferta sospechosa?", a: "Denunciala desde el menú de la tarjeta. Con 3 denuncias la vacante se oculta y nuestro equipo la revisa. En Worka ninguna oferta puede pedirte dinero." },
  { q: "¿Funciona bien con poca señal?", a: "Sí. Worka está optimizada para celulares y conexiones inestables: pantallas livianas, sin videos pesados, con lo más importante primero." },
];

const ACTIVITY: ActivityItem[] = [
  { kind: "registro", text: "Rocío se registró desde Encarnación" },
  { kind: "vista", text: "Supermercado Stock revisó 3 perfiles" },
  { kind: "vacante", text: "Nueva vacante: Cajero/a en Asunción" },
  { kind: "verificado", text: "Frigorífico Concepción verificó su RUC" },
  { kind: "mensaje", text: "José recibió un mensaje por WhatsApp" },
  { kind: "destacado", text: "12 vacantes de primer empleo publicadas hoy" },
  { kind: "vacante", text: "Nueva vacante: Repartidor/a en San Lorenzo" },
  { kind: "vista", text: "Clínica Santa Rosa vio tu rubro" },
  { kind: "registro", text: "Diego se registró desde Ciudad del Este" },
];

/* ── Utilidades ── */

// Secciones editables desde /admin: una línea por ítem, campos separados por "|".
function parseLines<T>(
  value: string | undefined,
  map: (parts: string[]) => T | null
): T[] {
  return (value ?? "")
    .split("\n")
    .map((line) => (line.trim() ? map(line.split("|").map((p) => p.trim())) : null))
    .filter((x): x is T => x !== null);
}

function Eyebrow({ children, light }: { children: string; light?: boolean }) {
  return (
    <p
      className={`text-[0.7rem] font-semibold tracking-[0.12em] uppercase mb-2.5 ${
        light ? "text-blue-300" : "text-primary"
      }`}
    >
      {children}
    </p>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
  center,
  light,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={`mb-10 ${center ? "text-center max-w-lg mx-auto" : "max-w-xl"}`}
    >
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`font-extrabold text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.12] tracking-tight mb-3 ${
          light ? "text-white" : "text-primary-dark"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p
          className={`text-[0.95rem] leading-relaxed ${
            light ? "text-white/60" : "text-gray-500"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default async function LandingPage() {
  const [jobsCount, settings] = await Promise.all([
    getActiveJobsCount(),
    getSiteSettings(),
  ]);

  // Cada bloque usa lo configurado en el admin; si está vacío, el texto base.
  const customDiffs = parseLines(settings.landing_differentiators, (p) =>
    p.length >= 3
      ? { icon: (p[0] as IconKey) in ICON_MAP ? (p[0] as IconKey) : ("estrella" as IconKey), color: "#2563EB", title: p[1], text: p[2] }
      : null
  );
  const differentiators = customDiffs.length > 0 ? customDiffs : DIFFERENTIATORS;

  const customSteps = parseLines(settings.landing_steps, (p) =>
    p.length >= 2 ? { title: p[0], text: p[1] } : null
  );
  const steps = customSteps.length > 0 ? customSteps : STEPS;

  const customFaqs = parseLines(settings.landing_faqs, (p) =>
    p.length >= 2 ? { q: p[0], a: p.slice(1).join(" | ") } : null
  );
  const faqs = customFaqs.length > 0 ? customFaqs : FAQS;

  const customCats = parseLines(settings.landing_categories, (p) =>
    p.length >= 2
      ? {
          icon: ((p[0] as IconKey) in ICON_MAP ? p[0] : "ventas") as IconKey,
          color: p[3] || "#2563EB",
          name: p[1],
          rubro: p[2] || p[1],
        }
      : null
  );
  const categories = customCats.length > 0 ? customCats : CATEGORIES;

  const customFeatures = parseLines(settings.landing_company_features, (p) =>
    p[0] ? p[0] : null
  );
  const companyFeatures =
    customFeatures.length > 0 ? customFeatures : COMPANY_FEATURES;

  const customActivity = parseLines(settings.landing_activity, (p) =>
    p.length >= 2 ? ({ kind: p[0], text: p[1] } as ActivityItem) : null
  );
  const activity = customActivity.length > 0 ? customActivity : ACTIVITY;

  // Historias: se cargan desde el admin (nombre | rol | testimonio | foto).
  const testimonials = parseLines(settings.landing_testimonials, (p) =>
    p.length >= 3
      ? { name: p[0], role: p[1], quote: p[2], photo: p[3] || "" }
      : null
  );

  // Estadísticas: la de vacantes sale de la base; el resto se edita en el admin.
  const customStats = parseLines(settings.landing_stats, (p) =>
    p.length >= 2 ? { value: p[0], label: p[1] } : null
  );
  const stats =
    customStats.length > 0
      ? customStats
      : [
          { value: `${jobsCount}`, label: "vacantes activas" },
          { value: "RUC ✓", label: "empresas verificadas" },
          { value: "100%", label: "gratis, sin comisiones" },
        ];
  const statIcons = [Briefcase, Building2, Bus, Users];

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <HomeNav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF1FC] to-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -right-[10%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center px-5 pt-[clamp(36px,7vw,64px)] pb-[clamp(44px,8vw,72px)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3.5 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[0.7rem] text-primary tracking-wide">
                {settings.hero_badge ||
                  "🇵🇾 Plataforma de empleo · 100% gratuita"}
              </span>
            </div>

            <h1 className="font-extrabold text-[clamp(2.1rem,6vw,4rem)] leading-[1.05] tracking-[-0.025em] text-primary-dark mb-4">
              Tu próximo trabajo
              <br />
              <span className="text-primary">está en Worka.</span>
            </h1>

            <p className="text-[clamp(0.95rem,2vw,1.1rem)] text-gray-500 max-w-md leading-relaxed mb-7">
              {settings.hero_subtitle ||
                "La única plataforma diseñada para Paraguay. Sin estafas, sin comisiones, con líneas de colectivo incluidas."}
            </p>

            <HeroSearch />

            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center">
                {["A", "R", "J", "M"].map((ini, i) => (
                  <div
                    key={ini}
                    className="w-9 h-9 rounded-full border-2 border-surface bg-primary/15 text-primary flex items-center justify-center text-xs font-bold"
                    style={{ marginLeft: i === 0 ? 0 : -12 }}
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <span className="text-[0.82rem] text-gray-500 leading-snug">
                Sumate a los paraguayos que
                <br />
                ya buscan trabajo en Worka.
              </span>
            </div>
          </div>

          {/* Tarjetas flotantes (desktop) */}
          <div className="relative hidden lg:block">
            {/* Foto de portada: se sube desde /admin. Sin imagen, cae en la
                tarjeta de marca para que el hero nunca quede vacío. */}
            <div className="rounded-3xl overflow-hidden aspect-[4/3.4] shadow-[0_30px_70px_rgba(27,37,89,0.18)]">
              {settings.hero_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.hero_image_url}
                  alt="Personas buscando empleo en Worka"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <span className="text-white/95 text-7xl font-extrabold tracking-tight">
                    w.
                  </span>
                </div>
              )}
            </div>
            <div className="absolute top-6 -left-7 bg-white rounded-2xl px-4 py-3 shadow-[0_14px_40px_rgba(27,37,89,0.16)] flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-success/15 flex items-center justify-center">
                <CheckCircle size={17} className="text-success" />
              </div>
              <div>
                <p className="font-bold text-[0.8rem] text-primary-dark">
                  Empresa verificada
                </p>
                <p className="text-[0.62rem] text-gray-400 mt-0.5">
                  RUC contrastado ✓ DNIT
                </p>
              </div>
            </div>
            <div className="absolute bottom-6 -right-6 bg-primary-dark rounded-2xl px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.25)] flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-primary/40 flex items-center justify-center">
                <MessageCircle size={17} className="text-blue-200" />
              </div>
              <div>
                <p className="font-bold text-[0.8rem] text-white">
                  ¡Te vieron el perfil!
                </p>
                <p className="text-[0.62rem] text-white/60 mt-0.5">
                  Aviso por WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Franja de estadísticas */}
        <div className="border-t border-primary-dark/10 bg-white/50">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-x-8 gap-y-5 md:gap-x-12 p-5">
            {stats.map((s, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={s.label} className="flex items-center gap-2.5">
                  <Icon size={18} className="text-primary/90 shrink-0" />
                  <div>
                    <p className="font-extrabold text-[1.15rem] text-primary-dark leading-none">
                      {s.value}
                    </p>
                    <p className="text-[0.64rem] text-gray-500 mt-1 tracking-wide">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NOVEDADES ── */}
      <section
        id="novedades"
        className="max-w-6xl mx-auto px-5 py-[clamp(56px,9vw,80px)]"
      >
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <SectionHead
              eyebrow="Lo que pasa ahora"
              title={
                <>
                  Worka está <span className="text-primary">vivo</span> las 24
                  horas.
                </>
              }
              sub="Empresas revisando perfiles, gente consiguiendo trabajo y vacantes nuevas cada minuto."
            />
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-primary-hover transition-colors"
            >
              Unirme ahora <ArrowRight size={16} />
            </Link>
          </div>
          <ActivityFeed pool={activity} />
        </div>
      </section>

      {/* ── RUBROS ── */}
      <section
        id="rubros"
        className="bg-white border-y border-primary-dark/10 py-[clamp(56px,9vw,80px)]"
      >
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead
            center
            eyebrow="Explorá por rubro"
            title="¿En qué querés trabajar?"
            sub="Elegí tu rubro y encontrá vacantes cerca tuyo, con salario y cómo llegar."
          />
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))]">
            {categories.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? ShoppingBag;
              return (
                <Link
                  key={c.name}
                  href={`/empleos?rubro=${encodeURIComponent(c.rubro)}`}
                  className="group flex items-center gap-4 bg-surface border border-primary-dark/10 rounded-2xl px-4.5 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(27,37,89,0.08)]"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${c.color}18` }}
                  >
                    <Icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[0.9rem] text-primary-dark">
                      {c.name}
                    </p>
                    <p className="text-[0.68rem] text-gray-500 mt-0.5">
                      Ver vacantes
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-400 shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-[clamp(56px,9vw,80px)]">
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead
            eyebrow="Para candidatos"
            title={
              <>
                Conseguí trabajo,
                <br />
                sin vueltas.
              </>
            }
            sub="Tres pasos. Nada de formularios eternos ni CVs enviados al vacío."
          />
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative bg-white rounded-3xl border border-primary-dark/10 px-6 py-8"
              >
                <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-[0.8rem] shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
                  {i + 1}
                </div>
                <h3 className="font-bold text-base text-primary-dark mt-4 mb-2.5">
                  {s.title}
                </h3>
                <p className="text-[0.85rem] text-gray-500 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-primary-hover transition-colors"
            >
              Crear mi perfil gratis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIADORES ── */}
      <section className="bg-white border-t border-primary-dark/10 py-[clamp(56px,9vw,80px)]">
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead
            center
            eyebrow="Lo que nos hace distintos"
            title="Solo en Worka."
            sub="Cada detalle está pensado para cómo se busca trabajo en Paraguay."
          />
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))]">
            {differentiators.map((d) => {
              const Icon = ICON_MAP[d.icon] ?? Star;
              return (
                <div
                  key={d.title}
                  className="bg-surface border border-primary-dark/10 rounded-2xl px-5 py-5.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(27,37,89,0.08)]"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5"
                    style={{ background: `${d.color}18` }}
                  >
                    <Icon size={18} style={{ color: d.color }} />
                  </div>
                  <h3 className="font-bold text-[0.9rem] text-primary-dark mb-2">
                    {d.title}
                  </h3>
                  <p className="text-[0.78rem] text-gray-500 leading-relaxed">
                    {d.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PARA EMPRESAS ── */}
      <section
        id="empresas"
        className="relative overflow-hidden bg-primary-dark py-[clamp(56px,9vw,80px)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/5 -right-[8%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 grid gap-12 items-center [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
          <div>
            <SectionHead
              light
              eyebrow="Para empresas"
              title={
                <>
                  Talento local,
                  <br />
                  verificado y sin pagar un guaraní.
                </>
              }
              sub="Desde la pyme del barrio hasta la cadena nacional. Publicá en minutos y contactá al candidato ideal por WhatsApp."
            />
            <ul className="flex flex-col gap-3 mb-8">
              {companyFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[0.875rem] text-white/85"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={11} className="text-blue-200" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/empresa/registro"
                className="inline-flex items-center gap-2 bg-white text-primary-dark font-bold text-[0.875rem] px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Registrar mi empresa <ArrowRight size={14} />
              </Link>
              <Link
                href="/para-empresas"
                className="inline-flex items-center gap-2 text-white font-semibold text-[0.875rem] px-6 py-3 rounded-xl border border-white/25 hover:bg-white/10 transition-colors"
              >
                Conocé Worka para empresas
              </Link>
            </div>
          </div>

          {/* Panel simulado */}
          <div className="rounded-3xl overflow-hidden bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-[0.64rem] text-gray-400 tracking-widest uppercase mb-1">
                  Vacante activa
                </p>
                <p className="font-bold text-[0.92rem] text-primary-dark">
                  Cajero/a — Sucursal Centro
                </p>
              </div>
              <span className="text-[0.62rem] bg-success/15 text-emerald-700 px-2.5 py-1 rounded-full tracking-wide shrink-0">
                ACTIVA
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {[
                  { v: "342", l: "Vistas" },
                  { v: "23", l: "Postulantes" },
                  { v: "5", l: "Contactados" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="bg-surface rounded-xl py-3.5 px-2 text-center"
                  >
                    <p className="font-extrabold text-[1.25rem] text-primary-dark">
                      {s.v}
                    </p>
                    <p className="text-[0.62rem] text-gray-500 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.64rem] text-gray-400 tracking-widest uppercase mb-2.5">
                Candidatos
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Carlos Benítez", score: "2/2 ✓", c: "#10B981" },
                  { name: "Lucía Martínez", score: "1/2 ✓", c: "#F59E0B" },
                  { name: "Miguel Rodríguez", score: "2/2 ✓", c: "#10B981" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between gap-2 bg-surface rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7.5 h-7.5 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-[0.72rem] shrink-0">
                        {c.name[0]}
                      </div>
                      <span className="font-semibold text-[0.82rem] text-primary-dark truncate">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span
                        className="text-[0.62rem] px-2 py-0.5 rounded-full"
                        style={{ background: `${c.c}18`, color: c.c }}
                      >
                        {c.score}
                      </span>
                      <span className="text-[0.62rem] bg-success/12 text-emerald-700 px-2 py-0.5 rounded-full">
                        💬
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HISTORIAS (se cargan desde el admin) ── */}
      {testimonials.length > 0 && (
        <section id="historias" className="py-[clamp(56px,9vw,80px)]">
          <div className="max-w-6xl mx-auto px-5">
            <SectionHead
              center
              eyebrow="Historias reales"
              title="Ya encontraron trabajo."
              sub="Paraguayos que consiguieron empleo en Worka."
            />
            <div className="grid gap-4.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white border border-primary-dark/10 rounded-3xl px-6 py-6 flex flex-col gap-4"
                >
                  <Quote size={24} className="text-primary/35" />
                  <p className="text-[0.9rem] text-primary-dark leading-relaxed flex-1">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100">
                    {t.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[0.85rem] text-primary-dark">
                        {t.name}
                      </p>
                      <p className="text-[0.68rem] text-gray-500 mt-0.5">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONFIANZA ── */}
      <section className="bg-white border-t border-primary-dark/10 px-5 py-[clamp(44px,8vw,56px)]">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary-dark/10 bg-gradient-to-br from-primary/8 to-success/8 p-[clamp(24px,5vw,36px)] flex flex-wrap items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Shield size={26} className="text-primary" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <h3 className="font-extrabold text-[1.2rem] text-primary-dark mb-2">
                El portal donde no te estafan.
              </h3>
              <p className="text-[0.875rem] text-gray-500 leading-relaxed">
                Bloqueamos automáticamente ofertas que piden dinero, verificamos
                el RUC y la comunidad puede denunciar vacantes sospechosas.{" "}
                <span className="text-primary-dark font-semibold">
                  Nunca pagues para conseguir un trabajo.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="border-t border-primary-dark/10 py-[clamp(56px,9vw,80px)]"
      >
        <div className="max-w-3xl mx-auto px-5">
          <SectionHead center eyebrow="Soporte" title="Preguntas frecuentes" />
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative overflow-hidden bg-white border-t border-primary-dark/10 px-5 py-[clamp(64px,10vw,96px)] text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-xl mx-auto">
          <Eyebrow>Tu próximo paso</Eyebrow>
          <h2 className="font-extrabold text-[clamp(1.9rem,6vw,3.4rem)] leading-[1.08] tracking-tight text-primary-dark mb-4">
            Las mejores oportunidades
            <br />
            <span className="text-primary">te están esperando.</span>
          </h2>
          <p className="text-[0.95rem] text-gray-500 mb-9">
            Registrate gratis. En 2 minutos ya podés postularte.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-primary text-white font-extrabold text-[0.95rem] px-8 py-4 rounded-xl hover:bg-primary-hover transition-colors"
            >
              Buscar empleo <ArrowRight size={16} />
            </Link>
            <Link
              href="/empresa/registro"
              className="inline-flex items-center gap-2 text-primary-dark font-semibold text-[0.95rem] px-8 py-4 rounded-xl border border-primary-dark/10 hover:bg-surface transition-colors"
            >
              Publicar una vacante
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-primary-dark">
        <div className="max-w-6xl mx-auto px-5 py-12 grid gap-9 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          <div className="col-span-2">
            <Logo light />
            <p className="text-[0.82rem] text-white/50 leading-relaxed mt-3.5 max-w-[240px]">
              La plataforma de empleo 100% gratuita de Paraguay. Tu próximo paso.
            </p>
          </div>
          {[
            {
              title: "Candidatos",
              links: [
                ["Buscar empleo", "/empleos"],
                ["Crear mi perfil", "/onboarding"],
                ["Mis postulaciones", "/postulaciones"],
                ["Blog", "/blog"],
              ],
            },
            {
              title: "Empresas",
              links: [
                ["Registrar empresa", "/empresa/registro"],
                ["Para empresas", "/para-empresas"],
                ["Publicar vacante", "/empresa/vacantes/nueva"],
              ],
            },
            {
              title: "Legal",
              links: [
                ["Términos", "/terminos"],
                ["Privacidad", "/privacidad"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[0.67rem] text-white/40 tracking-widest uppercase mb-4">
                {col.title}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[0.82rem] text-white/55 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Worka en la región */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-5 py-5">
            <p className="text-[0.67rem] text-white/40 tracking-widest uppercase mb-3">
              Worka en tu país
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {COUNTRIES.map((c) => (
                <Link
                  key={c.code}
                  href={`/${c.slug}`}
                  className="text-sm text-white/60 hover:text-white"
                >
                  {c.flag} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-5 py-4.5 flex flex-wrap justify-between gap-2">
            <span className="text-[0.67rem] text-white/40">
              {settings.site_name || "Worka"} © {new Date().getFullYear()} ·
              Hecho en Paraguay 🇵🇾
            </span>
            <span className="text-[0.67rem] text-white/40">
              Nunca pagues para conseguir un trabajo.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
