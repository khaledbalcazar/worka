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
import { getActiveCountry } from "@/lib/country-context";
import { getActiveJobs, getCountryJobsCount, getSiteSettings } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import EntityAvatar from "@/components/EntityAvatar";
import HomeNav from "@/components/home/HomeNav";
import HeroSearch from "@/components/home/HeroSearch";
import FaqAccordion from "@/components/home/FaqAccordion";
import SiteFooter from "@/components/home/SiteFooter";

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
    "Empezá gratis: hasta 3 vacantes publicadas",
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
    { q: "¿Worka es gratis?", a: "Para candidatos, postularse y armar el CV es gratis para siempre; Worka Pro suma herramientas opcionales. Las empresas publican gratis hasta 3 vacantes a la vez y pueden sumar alcance con Worka Enterprise Pro." },
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


// Búsquedas que más se repiten en Worka: cada una abre el buscador con ese
// cargo ya escrito.
const POPULAR_SEARCHES = [
  "Cajero/a",
  "Vendedor/a",
  "Atención al cliente",
  "Repartidor/a",
  "Administrativo/a",
  "Recepcionista",
  "Mozo/a",
  "Chofer",
  "Operario/a",
  "Guardia de seguridad",
  "Cocinero/a",
  "Auxiliar de limpieza",
];

export default async function LandingPage() {
  const [settings, country, allJobs] = await Promise.all([
    getSiteSettings(),
    getActiveCountry(),
    getActiveJobs().catch(() => []),
  ]);
  // Total del país: vacantes de Worka + externas de ese país.
  const jobsCount = await getCountryJobsCount(country.code);
  const recentJobs = allJobs
    .filter((j) => (j.company.country ?? "py") === country.code)
    .slice(0, 9);

  // Los textos del admin (pensados para Paraguay) solo aplican cuando el
  // país activo es Paraguay; los demás países usan el contenido generado
  // en su propio contexto (moneda, RUC/CUIT, voseo o tuteo, ciudades).
  const isPy = country.code === "py";
  const vos = usesVoseo(country);

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
  const steps = isPy && customSteps.length > 0 ? customSteps : buildSteps(country);

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
    isPy && customFeatures.length > 0 ? customFeatures : buildCompanyFeatures(country);

  // Historias: se cargan desde el admin (nombre | rol | testimonio | foto).
  const testimonials = parseLines(settings.landing_testimonials, (p) =>
    p.length >= 3 ? { name: p[0], role: p[1], quote: p[2], photo: p[3] || "" } : null
  );

  const chip =
    "inline-flex items-center gap-1.5 min-h-10 px-4 rounded-full border border-[#8c8c8c] bg-white text-[15px] font-semibold text-[#404040] hover:bg-[#f3f2f0] hover:shadow-[inset_0_0_0_1px_#404040] transition-colors";

  return (
    <main className="flex-1 bg-white min-h-screen text-ink">
      <HomeNav />

      {/* ── HERO: titular, búsqueda y empleos reales a la derecha ── */}
      <section className="bg-white">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-10 lg:gap-16 items-center pt-8 pb-10 sm:pt-14 lg:pt-16 lg:pb-16`}>
          <div className="min-w-0">
            <h1 className="font-light text-[34px] leading-[42px] sm:text-[48px] sm:leading-[58px] lg:text-[56px] lg:leading-[66px] tracking-[-0.02em] text-[#8f3b1f] mb-4">
              {vos ? "Encontrá" : "Encuentra"} tu próximo empleo en {country.name}
            </h1>
            <p className="text-[16px] sm:text-lg leading-relaxed text-[#404040] max-w-xl mb-6">
              {country.code === "py" && settings.hero_subtitle
                ? settings.hero_subtitle
                : `Vacantes de empresas verificadas, con salario, cómo llegar y postulación con 1 clic. Sin estafas y sin comisiones.`}
            </p>

            <HeroSearch cities={country.cities} />

            <p className="text-[15px] text-[#404040] mt-6">
              {jobsCount > 0 && (
                <>
                  <strong className="font-semibold">{jobsCount} vacantes activas</strong> ·{" "}
                </>
              )}
              ¿Primera vez en Worka?{" "}
              <Link href="/registro" className="font-semibold text-primary hover:underline">
                {vos ? "Creá tu perfil gratis" : "Crea tu perfil gratis"}
              </Link>
            </p>
          </div>

          {/* Vista previa con vacantes reales (o la foto cargada en el admin).
              En celular no se muestra: la sección de empleos recientes queda
              enseguida debajo y repetiría las mismas tres. */}
          <div className="min-w-0 hidden lg:block">
            {settings.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.hero_image_url}
                alt="Personas buscando empleo en Worka"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            ) : (
              <div className="rounded-lg border border-line bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
                  <p className="text-sm font-semibold">Recién publicadas en {country.name}</p>
                  <Link href="/empleos" className="text-sm font-semibold text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>
                {recentJobs.length > 0 ? (
                  <ul>
                    {recentJobs.slice(0, 3).map((job) => (
                      <JobRow key={job.id} job={job} />
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-8 text-sm text-muted text-center">
                    Muy pronto vas a ver acá las primeras vacantes de {country.name}.
                  </p>
                )}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#f8f8f7] text-[13px] text-muted">
                  <BadgeCheck size={16} className="text-success-ink shrink-0" />
                  {country.code === "py"
                    ? "Empresas con RUC contrastado ante la DNIT."
                    : `Empresas con ${country.taxIdLabel} contrastado.`}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── BÚSQUEDAS POPULARES ── */}
      <section className="bg-canvas">
        <div className={`${WRAP} ${SECTION} grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14`}>
          <div>
            <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] text-ink">
              {vos ? "Buscá el empleo adecuado para vos" : "Busca el empleo adecuado para ti"}
            </h2>
            <p className="text-[15px] text-muted mt-2">
              Las búsquedas que más se hacen en Worka, a un toque.
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted mb-3">BÚSQUEDAS POPULARES</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((q) => (
                <Link key={q} href={`/empleos?q=${encodeURIComponent(q)}`} className={chip}>
                  {q}
                </Link>
              ))}
              <Link href="/empleos?primerEmpleo=1" className={chip}>Sin experiencia</Link>
              <Link href="/empleos?modalidad=Remoto" className={chip}>Remoto</Link>
            </div>
            <p className="text-[13px] font-semibold text-muted mt-6 mb-3">POR RUBRO</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const Icon = ICON_MAP[c.icon] ?? ShoppingBag;
                return (
                  <Link key={c.name} href={`/empleos?rubro=${encodeURIComponent(c.rubro)}`} className={chip}>
                    <Icon size={16} style={{ color: c.color }} />
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMPLEOS RECIENTES ── */}
      {recentJobs.length > 0 && (
        <section className={`bg-white border-b border-line ${recentJobs.length <= 3 && !settings.hero_image_url ? "lg:hidden" : ""}`}>
          <div className={`${WRAP} ${SECTION}`}>
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em]">
                  Empleos recientes
                </h2>
                <p className="text-[15px] text-muted mt-1">Publicados por empresas en Worka.</p>
              </div>
              <Link href="/empleos" className="hidden sm:inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:underline whitespace-nowrap">
                Ver los {jobsCount} empleos <ChevronRight size={16} />
              </Link>
            </div>
            <ul className="grid md:grid-cols-2 border-t border-line md:border-t-0 md:gap-x-8">
              {/* En escritorio las tres primeras ya están arriba, junto al buscador. */}
              {recentJobs.map((job, i) => (
                <JobRow key={job.id} job={job} bordered className={i < 3 ? (settings.hero_image_url ? "" : "lg:hidden") : i >= 6 ? "hidden lg:flex" : ""} />
              ))}
            </ul>
            <Link href="/empleos" className="btn-secondary w-full sm:hidden mt-5">
              Ver los {jobsCount} empleos
            </Link>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-white">
        <div className={`${WRAP} ${SECTION}`}>
          <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] mb-6 sm:mb-8">
            {vos ? "Conseguí" : "Consigue"} trabajo en tres pasos
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center font-semibold shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[17px] mb-1">{s.title}</h3>
                  <p className="text-[15px] text-[#404040] leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/onboarding" className="btn-primary mt-8 w-full sm:w-auto">
            Crear mi perfil gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── DIFERENCIADORES ── */}
      <section className="bg-canvas">
        <div className={`${WRAP} ${SECTION}`}>
          <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] mb-2">
            Pensado para buscar trabajo en {country.name}
          </h2>
          <p className="text-[15px] text-muted mb-6 sm:mb-8">Lo que vas a encontrar en cada vacante de Worka.</p>
          <div className="grid gap-px bg-line border border-line rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => {
              const Icon = ICON_MAP[d.icon] ?? Star;
              return (
                <div key={d.title} className="flex sm:flex-col gap-3.5 bg-white p-5">
                  <Icon size={24} style={{ color: d.color }} className="shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[15px] mb-1">{d.title}</h3>
                    <p className="text-[13px] text-muted leading-relaxed">{d.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PARA EMPRESAS ── */}
      <section id="empresas" className="bg-white border-y border-line">
        <div className={`${WRAP} ${SECTION} grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 items-center`}>
          <div>
            <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] text-[#8f3b1f]">
              {vos ? "Publicá" : "Publica"} una vacante y {vos ? "encontrá" : "encuentra"} talento verificado
            </h2>
            <p className="text-[15px] text-muted mt-2">
              Gratis, sin pagar un {country.currencyName}. Desde la pyme del barrio hasta la cadena nacional.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              <Link href="/empresa/registro" className="btn-primary">
                Publicar una vacante gratis
              </Link>
              <Link href="/para-empresas" className="btn-secondary">
                Conocer Worka para empresas
              </Link>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {companyFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] text-[#404040]">
                <CheckCircle size={18} className="text-success-ink shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── HISTORIAS Y CONFIANZA ── */}
      <section className="bg-white">
        <div className={`${WRAP} ${SECTION} grid gap-6 ${testimonials.length > 0 ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}>
          {testimonials.length > 0 && (
            <div id="historias">
              <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] mb-5">
                Ya encontraron trabajo
              </h2>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:mx-0 sm:px-0">
                {testimonials.map((t) => (
                  <figure key={t.name} className="snap-start shrink-0 w-[85%] sm:w-auto border border-line rounded-lg p-5 flex flex-col gap-4">
                    <Quote size={22} className="text-primary/40" />
                    <blockquote className="text-[15px] leading-relaxed flex-1">“{t.quote}”</blockquote>
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
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-[12px] text-muted">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
          <div className={`rounded-lg border border-[#f0d5c9] bg-[#fff6f1] p-5 sm:p-7 flex gap-4 ${testimonials.length > 0 ? "flex-col self-end" : "flex-col sm:flex-row sm:items-center"}`}>
            <span className="w-12 h-12 rounded-full bg-white text-clay grid place-items-center shrink-0 border border-[#f0d5c9]">
              <Shield size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-xl mb-1.5">El portal donde no te estafan.</h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">
                Bloqueamos automáticamente ofertas que piden dinero, verificamos el {country.taxIdLabel} y
                la comunidad puede denunciar vacantes sospechosas.{" "}
                <strong className="font-semibold text-clay">Nunca pagues para conseguir un trabajo.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-canvas">
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 ${SECTION}`}>
          <h2 className="font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em] mb-6 text-center">
            Preguntas frecuentes
          </h2>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-white">
        <div className={`${WRAP} ${SECTION} text-center`}>
          <h2 className="font-light text-[28px] leading-[36px] sm:text-[40px] sm:leading-[50px] tracking-[-0.015em] text-[#8f3b1f] max-w-2xl mx-auto">
            Tu próximo trabajo te está esperando en Worka
          </h2>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-7">
            <Link href="/empleos" className="btn-primary !min-h-12 !px-7 !text-[15px]">
              Buscar empleos <ArrowRight size={16} />
            </Link>
            <Link href="/registro" className="btn-secondary !min-h-12 !px-7 !text-[15px]">
              Crear mi perfil gratis
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter countryName={country.name} siteName={settings.site_name || "Worka"} />
    </main>
  );
}

// Fila de vacante en la portada: mismo formato que la búsqueda de empleos.
function JobRow({
  job,
  bordered = false,
  className = "",
}: {
  job: Awaited<ReturnType<typeof getActiveJobs>>[number];
  bordered?: boolean;
  className?: string;
}) {
  return (
    <li className={`relative flex gap-3 px-4 py-3.5 hover:bg-[#f8f8f7] ${bordered ? "border-b border-line px-0 hover:bg-transparent" : "border-b border-line last:border-b-0"} ${className}`}>
      <EntityAvatar
        url={job.company.logo_url}
        name={job.company.trade_name}
        className="w-12 h-12 rounded text-sm bg-[#f3f2ef] text-[#4c6580] border border-[#ebebeb]"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-semibold leading-snug text-primary">
          <Link href={`/empleo/${job.id}`} className="hover:underline after:absolute after:inset-0">
            {job.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-[14px] text-ink">
          {job.company.trade_name}
          {job.company.is_verified && <BadgeCheck size={14} className="text-primary shrink-0" aria-label="Empresa verificada" />}
        </p>
        <p className="text-[14px] text-muted">
          {job.company.location_city} ({job.modality})
        </p>
        <p className="flex flex-wrap gap-x-3 text-[12px] text-muted mt-1">
          {job.salary_range && <span className="font-semibold text-success-ink">{job.salary_range}</span>}
          <span>{timeAgo(job.created_at)}</span>
        </p>
      </div>
    </li>
  );
}
