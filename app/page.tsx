import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Bus,
  CheckCircle,
  Zap,
  Star,
  BadgeCheck,
  ChevronRight,
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
import { getActiveCountry } from "@/lib/country-context";
import { getCountryJobsCount, getSiteSettings } from "@/lib/data";
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
  { icon: "ventas", color: "#0A66C2", name: "Ventas y Comercio", rubro: "Ventas" },
  { icon: "gastronomia", color: "#B24020", name: "Gastronomía", rubro: "Gastronomía" },
  { icon: "atencion", color: "#057642", name: "Atención al Cliente", rubro: "Atención al Cliente" },
  { icon: "logistica", color: "#5F4BB6", name: "Logística y Transporte", rubro: "Logística" },
  { icon: "administracion", color: "#0A66C2", name: "Administración", rubro: "Administración" },
  { icon: "produccion", color: "#B24020", name: "Producción / Operario", rubro: "Producción" },
  { icon: "salud", color: "#C0264D", name: "Salud", rubro: "Salud" },
  { icon: "construccion", color: "#057642", name: "Construcción", rubro: "Construcción" },
];

// ── Contenido en el contexto de cada país ──
// PY y AR hablan de vos ("Sabés", "Filtrá"); MX/CO/CL/BO de tú ("Sabes",
// "Filtra"). Además cambian la etiqueta fiscal (RUC/CUIT/RFC…), la moneda
// y las ciudades. Paraguay puede sobrescribir todo desde el admin.
import type { Country } from "@/lib/countries";

const usesVoseo = (c: Country) => c.code === "py" || c.code === "ar";

function buildDifferentiators(
  c: Country
): { icon: IconKey; color: string; title: string; text: string }[] {
  const vos = usesVoseo(c);
  return [
    {
      icon: "bus",
      color: "#0A66C2",
      title: vos ? "Sabés cómo llegar" : "Sabes cómo llegar",
      text:
        c.code === "py"
          ? "Cada vacante presencial muestra las líneas de colectivo y abre en Google Maps o Moovit."
          : "Cada vacante presencial muestra la dirección y abre en Google Maps para planear tu viaje.",
    },
    {
      icon: "check",
      color: "#057642",
      title: `${c.taxIdLabel} verificado`,
      text:
        c.code === "py"
          ? "Contrastamos el RUC de cada empresa contra el registro público de la DNIT."
          : `Contrastamos el ${c.taxIdLabel} de cada empresa contra los registros públicos antes de verificarla.`,
    },
    { icon: "whatsapp", color: "#057642", title: "Alertas por WhatsApp", text: "Te avisamos cuando una empresa ve tu perfil o aparecen vacantes de tu rubro." },
    { icon: "rayo", color: "#B24020", title: "Postulación en segundos", text: "1 clic y hasta 3 preguntas simples. Sin formularios eternos." },
    {
      icon: "estrella",
      color: "#5F4BB6",
      title: "Modo primer empleo",
      text: vos
        ? `Filtrá solo vacantes sin requisito de experiencia. Nadie más lo hace en ${c.name}.`
        : `Filtra solo vacantes sin requisito de experiencia. Nadie más lo hace en ${c.name}.`,
    },
    {
      icon: "cv",
      color: "#0A66C2",
      title: "CV gratis",
      text: vos
        ? "Respondé unas preguntas y generamos un PDF profesional sin costo alguno."
        : "Responde unas preguntas y generamos un PDF profesional sin costo alguno.",
    },
    { icon: "escudo", color: "#057642", title: "Cero estafas", text: "Bloqueamos ofertas que piden dinero. Con 3 denuncias la vacante se oculta sola." },
    {
      icon: "grafico",
      color: "#B24020",
      title: "Seguimiento real",
      text: vos
        ? "Sabés cuándo la empresa revisó tu perfil y por qué no avanzaste."
        : "Sabes cuándo la empresa revisó tu perfil y por qué no avanzaste.",
    },
  ];
}

function buildSteps(c: Country) {
  const vos = usesVoseo(c);
  return [
    {
      title: vos ? "Creá tu perfil" : "Crea tu perfil",
      text: vos
        ? "Con tu WhatsApp y tu ciudad alcanza. Si tenés CV lo leemos; si no, te lo generamos gratis en PDF."
        : "Con tu WhatsApp y tu ciudad alcanza. Si tienes CV lo leemos; si no, te lo generamos gratis en PDF.",
    },
    {
      title: vos ? "Postulate con 1 clic" : "Postúlate con 1 clic",
      text: vos
        ? "Filtrá por ciudad, rubro o «primer empleo». Cada tarjeta muestra el salario y cómo llegar."
        : "Filtra por ciudad, rubro o «primer empleo». Cada tarjeta muestra el salario y cómo llegar.",
    },
    {
      title: vos ? "Recibí novedades" : "Recibe novedades",
      text: "Te avisamos por WhatsApp cuando la empresa revisa tu perfil. Sin apps raras.",
    },
  ];
}

function buildCompanyFeatures(c: Country) {
  return [
    "Vacantes ilimitadas, sin costo",
    "Plantillas para publicar en 2 minutos",
    "Preguntas de filtro personalizadas",
    "Panel Kanban con WhatsApp directo",
    `Sello de empresa verificada con ${c.taxIdLabel}`,
    "Métricas por vacante: vistas, postulantes, contactados",
  ];
}

function buildFaqs(c: Country) {
  const vos = usesVoseo(c);
  return [
    { q: "¿Worka es gratis?", a: "Sí, para candidatos es gratis para siempre. Para empresas, publicar y gestionar candidatos tampoco tiene costo. Habrá opciones de visibilidad extra pagas, pero lo esencial no se cobra." },
    {
      q: "¿Cómo sé que la empresa es real?",
      a:
        c.code === "py"
          ? "Toda empresa registra su RUC y lo contrastamos con la DNIT antes de darle el sello ✓ Verificada. Cada empresa tiene una página pública con su historial en Worka."
          : `Toda empresa registra su ${c.taxIdLabel} y lo contrastamos con los registros públicos antes de darle el sello ✓ Verificada. Cada empresa tiene una página pública con su historial en Worka.`,
    },
    {
      q: "¿Necesito CV para postularme?",
      a: vos
        ? "No. Podés crear tu perfil respondiendo preguntas y Worka genera un CV profesional en PDF sin costo. Si ya tenés CV, lo subís y completamos tu perfil automáticamente."
        : "No. Puedes crear tu perfil respondiendo preguntas y Worka genera un CV profesional en PDF sin costo. Si ya tienes CV, lo subes y completamos tu perfil automáticamente.",
    },
    {
      q: "¿Qué hago si veo una oferta sospechosa?",
      a: vos
        ? "Denunciala desde el menú de la tarjeta. Con 3 denuncias la vacante se oculta y nuestro equipo la revisa. En Worka ninguna oferta puede pedirte dinero."
        : "Denúnciala desde el menú de la tarjeta. Con 3 denuncias la vacante se oculta y nuestro equipo la revisa. En Worka ninguna oferta puede pedirte dinero.",
    },
    { q: "¿Funciona bien con poca señal?", a: "Sí. Worka está optimizada para celulares y conexiones inestables: pantallas livianas, sin videos pesados, con lo más importante primero." },
  ];
}

// El feed EN VIVO usa las ciudades reales del país.
function buildActivity(c: Country): ActivityItem[] {
  const [a, b, d] = [c.cities[0], c.cities[1] ?? c.cities[0], c.cities[2] ?? c.cities[0]];
  return [
    { kind: "registro", text: `Rocío se registró desde ${b}` },
    { kind: "vista", text: "Un supermercado revisó 3 perfiles" },
    { kind: "vacante", text: `Nueva vacante: Cajero/a en ${a}` },
    { kind: "verificado", text: `Una empresa de ${d} verificó su ${c.taxIdLabel}` },
    { kind: "mensaje", text: "José recibió un mensaje por WhatsApp" },
    { kind: "destacado", text: "12 vacantes de primer empleo publicadas hoy" },
    { kind: "vacante", text: `Nueva vacante: Repartidor/a en ${d}` },
    { kind: "vista", text: "Una clínica está mirando tu rubro" },
    { kind: "registro", text: `Diego se registró desde ${a}` },
  ];
}

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

// Contenedor y ritmo vertical del sistema: 1128px de ancho útil y bloques
// separados en múltiplos de 8.
const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";
const SECTION = "py-10 sm:py-14 lg:py-16";

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Candidatos",
    links: [
      ["Buscar empleos", "/empleos"],
      ["Crear mi perfil", "/onboarding"],
      ["Sueldos y salarios", "/salarios"],
      ["Alertas de empleo", "/alertas"],
      ["Academia", "/academia"],
    ],
  },
  {
    title: "Empresas",
    links: [
      ["Publicar vacante", "/empresa/vacantes/nueva"],
      ["Registrar empresa", "/empresa/registro"],
      ["Para empresas", "/para-empresas"],
      ["Opiniones de empresas", "/opiniones"],
    ],
  },
  {
    title: "Legal y privacidad",
    links: [
      ["Términos de servicio", "/terminos"],
      ["Política de privacidad", "/privacidad"],
      ["Blog", "/blog"],
    ],
  },
];

function SectionHead({
  eyebrow,
  eyebrowClass = "text-primary",
  title,
  sub,
  center,
}: {
  eyebrow: string;
  eyebrowClass?: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${center ? "text-center max-w-xl mx-auto" : "max-w-2xl"}`}>
      <p className={`text-[11px] font-semibold tracking-[0.12em] uppercase mb-2 ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h2 className="font-semibold text-[26px] leading-[34px] lg:text-[36px] lg:leading-[44px] tracking-[-0.015em] text-ink">
        {title}
      </h2>
      {sub && (
        <p className="text-[15px] leading-relaxed text-muted mt-2">{sub}</p>
      )}
    </div>
  );
}

export default async function LandingPage() {
  const [settings, country] = await Promise.all([
    getSiteSettings(),
    getActiveCountry(),
  ]);
  // Total del país: vacantes de Worka + externas de ese país.
  const jobsCount = await getCountryJobsCount(country.code);

  // Los textos del admin (pensados para Paraguay) solo aplican cuando el
  // país activo es Paraguay; los demás países usan el contenido generado
  // en su propio contexto (moneda, RUC/CUIT, voseo o tuteo, ciudades).
  const isPy = country.code === "py";

  const customDiffs = parseLines(settings.landing_differentiators, (p) =>
    p.length >= 3
      ? { icon: (p[0] as IconKey) in ICON_MAP ? (p[0] as IconKey) : ("estrella" as IconKey), color: "#0A66C2", title: p[1], text: p[2] }
      : null
  );
  const differentiators =
    isPy && customDiffs.length > 0 ? customDiffs : buildDifferentiators(country);

  const customSteps = parseLines(settings.landing_steps, (p) =>
    p.length >= 2 ? { title: p[0], text: p[1] } : null
  );
  const steps =
    isPy && customSteps.length > 0 ? customSteps : buildSteps(country);

  const customFaqs = parseLines(settings.landing_faqs, (p) =>
    p.length >= 2 ? { q: p[0], a: p.slice(1).join(" | ") } : null
  );
  const faqs = isPy && customFaqs.length > 0 ? customFaqs : buildFaqs(country);

  const customCats = parseLines(settings.landing_categories, (p) =>
    p.length >= 2
      ? {
          icon: ((p[0] as IconKey) in ICON_MAP ? p[0] : "ventas") as IconKey,
          color: p[3] || "#0A66C2",
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
    isPy && customFeatures.length > 0
      ? customFeatures
      : buildCompanyFeatures(country);

  const customActivity = parseLines(settings.landing_activity, (p) =>
    p.length >= 2 ? ({ kind: p[0], text: p[1] } as ActivityItem) : null
  );
  const activity =
    isPy && customActivity.length > 0 ? customActivity : buildActivity(country);

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
          { value: `${country.taxIdLabel} ✓`, label: "empresas verificadas" },
          { value: "100%", label: "gratis, sin comisiones" },
        ];
  const statIcons = [Briefcase, Building2, Bus, Users];

  return (
    <main className="flex-1 bg-canvas min-h-screen text-ink">
      <HomeNav />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-line">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] gap-10 lg:gap-14 items-center pt-8 pb-8 sm:pt-12 lg:pt-16 lg:pb-12`}>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1.5 mb-4 sm:mb-5">
              <span className="text-[12px] font-medium text-brand">
                {country.code === "py" && settings.hero_badge
                  ? settings.hero_badge
                  : `${country.flag} Hecho en ${country.name} · 100% gratis para candidatos`}
              </span>
            </div>

            <h1 className="font-bold text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] lg:text-[48px] lg:leading-[56px] tracking-[-0.02em] text-ink mb-3 sm:mb-4">
              Tu próximo trabajo
              <br />
              <span className="text-primary">está en Worka.</span>
            </h1>

            <p className="text-[15px] sm:text-lg leading-relaxed text-[#4a4a4a] max-w-xl mb-6">
              {country.code === "py" && settings.hero_subtitle
                ? settings.hero_subtitle
                : `Encontrá tu próximo trabajo en ${country.name}. Sin estafas, sin comisiones, con las mejores empresas.`}
            </p>

            <HeroSearch cities={country.cities} />

            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center" aria-hidden>
                {["A", "R", "J", "M"].map((ini, i) => (
                  <div
                    key={ini}
                    className="w-8 h-8 rounded-full border-2 border-white bg-[#dfeaf3] text-brand flex items-center justify-center text-xs font-semibold"
                    style={{ marginLeft: i === 0 ? 0 : -10 }}
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-muted leading-snug">
                {usesVoseo(country) ? "Sumate" : "Súmate"} a los{" "}
                {country.demonym} que ya buscan trabajo en Worka.
              </span>
            </div>
          </div>

          {/* Panel de confianza (escritorio y tablet). */}
          <div className="hidden md:block min-w-0">
            {settings.hero_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.hero_image_url}
                alt="Personas buscando empleo en Worka"
                className="w-full aspect-[16/9] object-cover rounded-[10px] border border-line mb-4"
              />
            )}
            <div className="bg-white rounded-[10px] border border-line shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-success-ink">
                  <span className="w-2 h-2 rounded-full bg-success-ink" />
                  Verificación activa
                </p>
                <span className="text-[12px] text-muted">
                  {country.code === "py" ? "DNIT conectado" : `${country.taxIdLabel} validado`}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-center gap-3 rounded-lg bg-[#f8f6f3] p-3">
                  <span className="w-10 h-10 rounded-full bg-[#e6f3e9] text-success-ink grid place-items-center shrink-0">
                    <BadgeCheck size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[15px]">Empresa verificada</p>
                    <p className="text-[13px] text-muted">
                      {country.code === "py"
                        ? "RUC contrastado ✓ DNIT"
                        : `${country.taxIdLabel} contrastado ✓`}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3 rounded-lg bg-[#f8f6f3] p-3">
                  <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                    <MessageCircle size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[15px]">¡Te vieron el perfil!</p>
                    <p className="text-[13px] text-muted">Seguí tu postulación en Worka</p>
                  </div>
                  <span className="text-[12px] font-medium text-primary">Ahora</span>
                </li>
              </ul>
              <p className="mt-4 pt-3 border-t border-line text-[13px] text-muted text-center">
                Sin intermediarios ni cobros ocultos.
              </p>
            </div>
          </div>
        </div>

        {/* Franja de estadísticas */}
        <div className={`${WRAP} pb-8 lg:pb-12`}>
          <dl className="grid grid-cols-3 gap-2 sm:gap-4">
            {stats.map((s, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div
                  key={s.label}
                  className="rounded-[10px] border border-line bg-[#faf9f7] px-3 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0"
                >
                  <Icon size={20} className="text-primary shrink-0 hidden sm:block" />
                  <div className="min-w-0">
                    <dd className="font-bold text-lg sm:text-2xl leading-tight tracking-tight text-ink">
                      {s.value}
                    </dd>
                    <dt className="text-[11px] sm:text-[13px] text-muted leading-snug mt-0.5">
                      {s.label}
                    </dt>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ── NOVEDADES ── */}
      <section id="novedades" className={SECTION}>
        <div className={`${WRAP} grid lg:grid-cols-2 gap-8 lg:gap-14 items-center`}>
          <div>
            <SectionHead
              eyebrow="En vivo"
              title="Worka está vivo las 24 horas."
              sub="Empresas revisando perfiles, gente consiguiendo trabajo y vacantes nuevas cada minuto."
            />
            <Link href="/registro" className="btn-primary hidden lg:inline-flex">
              Unirme ahora <ArrowRight size={16} />
            </Link>
          </div>
          <ActivityFeed pool={activity} />
        </div>
      </section>

      {/* ── RUBROS ── */}
      <section id="rubros" className={`${SECTION} bg-white border-y border-line`}>
        <div className={WRAP}>
          <div className="flex items-end justify-between gap-4">
            <SectionHead
              eyebrow="Explorá por rubro"
              title="¿En qué querés trabajar?"
              sub="Elegí tu rubro y encontrá vacantes cerca tuyo, con salario y cómo llegar."
            />
            <Link
              href="/empleos"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary mb-8 whitespace-nowrap hover:underline"
            >
              Ver todas las vacantes <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? ShoppingBag;
              return (
                <Link
                  key={c.name}
                  href={`/empleos?rubro=${encodeURIComponent(c.rubro)}`}
                  className="group flex flex-col gap-3 bg-white border border-line rounded-[10px] p-3.5 sm:p-5 transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98]"
                >
                  <span
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${c.color}14` }}
                  >
                    <Icon size={20} style={{ color: c.color }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-[14px] sm:text-[15px] leading-snug text-ink group-hover:text-primary">
                      {c.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-primary mt-1">
                      Ver vacantes <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/empleos"
            className="sm:hidden btn-secondary w-full mt-4"
          >
            Ver todas las vacantes
          </Link>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className={SECTION}>
        <div className={WRAP}>
          <SectionHead
            eyebrow="Para candidatos"
            title="Conseguí trabajo, sin vueltas."
            sub="Tres pasos. Nada de formularios eternos ni CVs enviados al vacío."
          />
          <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex md:flex-col gap-4 bg-white rounded-[10px] border border-line p-4 sm:p-6"
              >
                <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base text-ink mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 sm:mt-8">
            <Link href="/onboarding" className="btn-primary w-full sm:w-auto">
              Crear mi perfil gratis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIADORES ── */}
      <section className={`${SECTION} bg-white border-y border-line`}>
        <div className={WRAP}>
          <SectionHead
            center
            eyebrow="Lo que nos hace distintos"
            title="Solo en Worka."
            sub={`Cada detalle está pensado para cómo se busca trabajo en ${country.name}.`}
          />
          <div className="grid gap-x-6 gap-y-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => {
              const Icon = ICON_MAP[d.icon] ?? Star;
              return (
                <div
                  key={d.title}
                  className="flex sm:flex-col gap-3.5 py-3.5 border-b border-line last:border-b-0 sm:border sm:rounded-[10px] sm:bg-[#faf9f7] sm:p-5 sm:last:border-b"
                >
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${d.color}14` }}
                  >
                    <Icon size={19} style={{ color: d.color }} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[15px] text-ink mb-1">
                      {d.title}
                    </h3>
                    <p className="text-[13px] text-muted leading-relaxed">
                      {d.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PARA EMPRESAS ── */}
      <section id="empresas" className={SECTION}>
        <div className={`${WRAP} grid gap-8 lg:gap-14 items-center lg:grid-cols-2`}>
          <div>
            <SectionHead
              eyebrow="Para empresas"
              eyebrowClass="text-clay"
              title={<>Talento local, verificado y sin pagar un {country.currencyName}.</>}
              sub="Desde la pyme del barrio hasta la cadena nacional. Publicá en minutos y contactá al candidato ideal por WhatsApp."
            />
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-7">
              {companyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle size={17} className="text-success-ink shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link href="/empresa/registro" className="btn-primary">
                Registrar mi empresa <ArrowRight size={15} />
              </Link>
              <Link href="/para-empresas" className="btn-secondary">
                Conocé Worka para empresas
              </Link>
            </div>
          </div>

          {/* Panel simulado */}
          <div className="hidden md:block rounded-[10px] overflow-hidden bg-white border border-line shadow-[0_8px_24px_rgba(0,0,0,0.08)]" aria-hidden>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted tracking-[0.08em] uppercase mb-1">
                  Vacante activa
                </p>
                <p className="font-semibold text-[15px] text-ink">
                  Cajero/a — Sucursal Centro
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-[#e6f3e9] text-success-ink px-2.5 py-1 rounded-full shrink-0">
                Activa
              </span>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { v: "342", l: "Vistas" },
                  { v: "23", l: "Postulantes" },
                  { v: "5", l: "Contactados" },
                ].map((s) => (
                  <div key={s.l} className="bg-[#f8f6f3] rounded-lg py-3 px-2 text-center">
                    <p className="font-bold text-xl text-ink">{s.v}</p>
                    <p className="text-[11px] text-muted mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-semibold text-muted tracking-[0.08em] uppercase mb-2">
                Candidatos destacados
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Carlos Benítez", score: "2/2 requisitos" },
                  { name: "Lucía Martínez", score: "1/2 requisitos" },
                  { name: "Miguel Rodríguez", score: "2/2 requisitos" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-2 border border-line rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#dfeaf3] text-brand flex items-center justify-center font-semibold text-xs shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-ink truncate">{c.name}</p>
                        <p className="text-[11px] text-muted">{c.score}</p>
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#e6f3e9] text-success-ink grid place-items-center shrink-0">
                      <MessageCircle size={15} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HISTORIAS Y CONFIANZA ── */}
      <section className={`${SECTION} bg-white border-y border-line`}>
        <div className={`${WRAP} grid gap-6 ${testimonials.length > 0 ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}>
          {testimonials.length > 0 && (
            <div id="historias">
              <SectionHead
                eyebrow="Historias reales"
                title="Ya encontraron trabajo."
                sub={`${country.demonym[0].toUpperCase()}${country.demonym.slice(1)} que consiguieron empleo en Worka.`}
              />
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:mx-0 sm:px-0">
                {testimonials.map((t) => (
                  <figure
                    key={t.name}
                    className="snap-start shrink-0 w-[85%] sm:w-auto bg-[#faf9f7] border border-line rounded-[10px] p-5 flex flex-col gap-4"
                  >
                    <Quote size={22} className="text-primary/40" />
                    <blockquote className="text-[15px] text-ink leading-relaxed flex-1">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="flex items-center gap-3 pt-3 border-t border-line">
                      {t.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#dfeaf3] text-brand flex items-center justify-center font-semibold shrink-0">
                          {t.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-ink">{t.name}</p>
                        <p className="text-[12px] text-muted">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-[10px] border border-[#f0d5c9] bg-[#fff6f1] p-5 sm:p-7 flex gap-4 ${testimonials.length > 0 ? "flex-col self-end" : "flex-col sm:flex-row sm:items-center max-w-4xl mx-auto w-full"}`}>
            <span className="w-12 h-12 rounded-full bg-white text-clay grid place-items-center shrink-0 border border-[#f0d5c9]">
              <Shield size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-xl text-ink mb-1.5">
                El portal donde no te estafan.
              </h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">
                Bloqueamos automáticamente ofertas que piden dinero, verificamos
                el {country.taxIdLabel} y la comunidad puede denunciar vacantes
                sospechosas.{" "}
                <strong className="font-semibold text-clay">
                  Nunca pagues para conseguir un trabajo.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={SECTION}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHead center eyebrow="Soporte y transparencia" title="Preguntas frecuentes" />
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="pb-12 lg:pb-16">
        <div className={WRAP}>
          <div className="rounded-[10px] bg-primary text-white text-center px-5 py-10 sm:px-10 sm:py-14 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_60%)]">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/75 mb-3">
              Tu próximo paso
            </p>
            <h2 className="font-bold text-[26px] leading-[34px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] mb-3">
              Las mejores oportunidades te están esperando.
            </h2>
            <p className="text-[15px] text-white/80 mb-7 max-w-md mx-auto">
              {usesVoseo(country)
                ? "Registrate gratis. En 2 minutos ya podés postularte a ofertas comprobadas."
                : "Regístrate gratis. En 2 minutos ya puedes postularte a ofertas comprobadas."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href="/empleos"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold text-[15px] px-7 min-h-12 rounded-full hover:bg-white/90 transition-colors"
              >
                Buscar empleo <ArrowRight size={16} />
              </Link>
              <Link
                href="/empresa/registro"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold text-[15px] px-7 min-h-12 rounded-full border border-white/50 hover:bg-white/10 transition-colors"
              >
                Publicar una vacante
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-line">
        <div className={`${WRAP} py-10 lg:py-12 grid gap-8 grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]`}>
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-[13px] text-muted leading-relaxed mt-3 max-w-[260px]">
              Infraestructura de empleo y contratación verificada para{" "}
              {country.name} y América Latina.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-semibold text-sm text-ink mb-3">{col.title}</p>
              <ul className="flex flex-col">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="inline-flex items-center min-h-9 text-[13px] text-muted hover:text-primary hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Worka en tu país">
            <p className="font-semibold text-sm text-ink mb-3">Worka en tu país</p>
            <ul className="flex flex-col">
              {COUNTRIES.map((c) => (
                <li key={c.code}>
                  <Link href={`/${c.slug}`} className="inline-flex items-center gap-2 min-h-9 text-[13px] text-muted hover:text-primary hover:underline">
                    <span aria-hidden>{c.flag}</span> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-line">
          <div className={`${WRAP} py-5 flex flex-col sm:flex-row sm:justify-between gap-2 text-[12px] text-muted`}>
            <span>
              {settings.site_name || "Worka"} © {new Date().getFullYear()} · Hecho en Paraguay 🇵🇾
            </span>
            <span>Nunca pagues para conseguir un trabajo.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
