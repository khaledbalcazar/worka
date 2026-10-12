import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  FileText,
  Filter,
  Globe,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import { ENTERPRISE_BRAND, ENTERPRISE_PLANS, formatGs } from "@/lib/plans";
import SiteFooter from "@/components/home/SiteFooter";

// Landing "Para empresas", con el mismo sistema que el inicio: banda blanca
// con titular liviano, secciones alternadas sobre el lienzo cálido y el azul
// solo para las acciones. Todo lo que se muestra es lo que la plataforma hace
// hoy; las vistas del panel están marcadas como ejemplo.

const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";
const SECTION = "py-12 sm:py-16";
const H2 = "font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em]";

export default function ParaEmpresasLanding({
  countryName = "Paraguay",
  currencyName = "guaraní",
  taxIdLabel = "RUC",
  isPy = true,
  prices = {},
}: {
  countryName?: string;
  currencyName?: string;
  taxIdLabel?: string;
  isPy?: boolean;
  // Precio mensual en Gs. de cada plan pago (lo edita el admin).
  prices?: Record<string, number>;
}) {
  const features = [
    { Icon: FileText, title: "Empezá gratis", text: "Hasta 3 vacantes publicadas a la vez, sin tarjeta. Con plantillas, una vacante sale en un par de minutos." },
    { Icon: Filter, title: "Preguntas de filtro", text: "Hasta 3 preguntas de Sí o No. Las respuestas eliminatorias te ahorran revisar perfiles que no aplican." },
    { Icon: Users, title: "Tablero de candidatos", text: "Cada postulación avanza por columnas: nuevos, en proceso y descartados, con entrevistas agendadas." },
    { Icon: MessageCircle, title: "Contacto directo", text: "Escribile al candidato por WhatsApp o por los mensajes de Worka, sin intermediarios." },
    {
      Icon: BadgeCheck,
      title: "Sello de empresa verificada",
      text: isPy
        ? "Contrastamos tu RUC ante la DNIT. Los candidatos ven el sello en cada aviso."
        : `Contrastamos tu ${taxIdLabel}. Los candidatos ven el sello en cada aviso.`,
    },
    { Icon: BarChart3, title: "Métricas por vacante", text: "Vistas, postulaciones y contactados de cada búsqueda, semana a semana." },
  ];

  const steps = [
    {
      title: "Registrá tu empresa",
      text: isPy
        ? "Creá la cuenta con tu RUC. Lo verificamos ante la DNIT para darte el sello de empresa confiable."
        : `Creá la cuenta con tu ${taxIdLabel}. Lo verificamos para darte el sello de empresa confiable.`,
    },
    { title: "Publicá la vacante", text: "Elegí una plantilla, ajustá salario, horario y cómo llegar, y sumá hasta 3 preguntas de filtro." },
    { title: "Revisá y contactá", text: "Las postulaciones llegan a tu tablero. Avanzalas de columna y escribile a quien te interese." },
  ];

  const visibility = [
    { Icon: TrendingUp, title: "Vacante destacada", text: "Aparece primero en la búsqueda de Worka y con una marca especial." },
    { Icon: Globe, title: "Google for Jobs", text: `Cada vacante se publica con los datos que Google necesita para mostrarla a quien busca empleo en ${countryName}.` },
    { Icon: Zap, title: "Contratación inmediata", text: "Marcá la vacante como urgente y los candidatos la ven señalada en la lista." },
  ];

  return (
    <main className="flex-1 bg-white min-h-screen text-ink">
      <HomeNav />

      {/* ── HERO ── */}
      <section className="bg-white">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-16 items-center pt-8 pb-12 sm:pt-14 lg:pt-16 lg:pb-16`}>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#e9f4ec] text-success-ink mb-4">
              <ShieldCheck size={14} /> Worka para empresas
            </p>
            <h1 className="font-light text-[34px] leading-[42px] sm:text-[48px] sm:leading-[58px] lg:text-[56px] lg:leading-[66px] tracking-[-0.02em] text-[#8f3b1f]">
              Encontrá talento local verificado, sin pagar un {currencyName}
            </h1>
            <p className="text-[16px] sm:text-lg leading-relaxed text-[#404040] max-w-xl mt-4">
              Desde la pyme del barrio hasta la cadena nacional: publicá en minutos, filtrá con preguntas y
              contactá al candidato indicado.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-7">
              <Link href="/empresa/registro" className="btn-primary !min-h-12 !px-7 !text-base">
                Publicar una vacante gratis
              </Link>
              <Link href="/ingresar/empresa" className="btn-secondary !min-h-12 !px-7 !text-base">
                Ingresar como empresa
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-[14px] text-[#404040]">
              {["Sin costo", "Sin límite de vacantes", `${taxIdLabel} verificado`].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check size={16} className="text-success-ink" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Vista de ejemplo del tablero. */}
          <div className="min-w-0" aria-hidden>
            <div className="rounded-lg border border-line bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted">Vista de ejemplo</p>
                  <p className="text-sm font-semibold truncate">Cajero/a · Sucursal Centro</p>
                </div>
                <span className="text-[11px] font-semibold bg-[#e6f3e9] text-success-ink px-2.5 py-1 rounded-full shrink-0">Activa</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-line">
                {[
                  { label: "Nuevos", people: ["Ana R.", "Jorge P."] },
                  { label: "En proceso", people: ["Sofía M.", "Pablo G."] },
                  { label: "Descartados", people: ["Marcos L."] },
                ].map((col) => (
                  <div key={col.label} className="bg-[#faf9f7] p-3 min-h-40">
                    <p className="text-[11px] font-semibold text-muted mb-2">{col.label}</p>
                    <div className="space-y-2">
                      {col.people.map((name) => (
                        <div key={name} className="bg-white border border-line rounded-md p-2 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#dfeaf3] text-brand grid place-items-center text-[11px] font-semibold shrink-0">
                            {name[0]}
                          </span>
                          <span className="text-[12px] font-medium truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f8f8f7] text-[13px] text-muted">
                <MessageCircle size={16} className="text-success-ink shrink-0" />
                Contacto directo desde cada perfil.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LO QUE INCLUYE ── */}
      <section className="bg-canvas">
        <div className={`${WRAP} ${SECTION}`}>
          <h2 className={H2}>Todo lo que necesitás para contratar</h2>
          <p className="text-[15px] text-muted mt-2 mb-8">Incluido en la cuenta gratuita.</p>
          <div className="grid gap-px bg-line border border-line rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="flex sm:flex-col gap-3.5 bg-white p-5">
                <Icon size={24} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] mb-1">{title}</h3>
                  <p className="text-[13px] text-muted leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-white scroll-mt-16">
        <div className={`${WRAP} ${SECTION}`}>
          <h2 className={`${H2} mb-8`}>Contratá en tres pasos</h2>
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
          <Link href="/empresa/registro" className="btn-primary mt-8 w-full sm:w-auto">
            Crear cuenta de empresa <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── VISIBILIDAD ── */}
      <section className="bg-canvas border-y border-line">
        <div className={`${WRAP} ${SECTION} grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14`}>
          <div>
            <h2 className={H2}>Que tu vacante llegue a más personas</h2>
            <p className="text-[15px] text-muted mt-2">
              Además de la publicación gratuita, podés destacar una vacante para que la vean primero.
            </p>
            <Link href="/empresa" className="btn-secondary mt-6">
              Ver opciones en mi panel
            </Link>
          </div>
          <ul className="grid gap-3">
            {visibility.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4 bg-white border border-line rounded-lg p-4">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Icon size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px]">{title}</h3>
                  <p className="text-[13px] text-muted leading-relaxed mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CONFIANZA ── */}
      <section className="bg-white">
        <div className={`${WRAP} ${SECTION}`}>
          <div className="rounded-lg border border-[#f0d5c9] bg-[#fff6f1] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-white text-clay grid place-items-center shrink-0 border border-[#f0d5c9]">
              <ShieldCheck size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-xl mb-1.5">Un portal donde los candidatos confían</h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">
                Bloqueamos ofertas que piden dinero, verificamos el {taxIdLabel} de cada empresa y la comunidad puede
                denunciar avisos sospechosos. Por eso las personas se postulan con tranquilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="planes">
        <div className={`${WRAP} ${SECTION}`}>
          <p className="plan-eyebrow">{ENTERPRISE_BRAND}</p>
          <h2 className={`${H2} mt-1`}>Empezá gratis. Crecé cuando lo necesites.</h2>
          <p className="text-[15px] text-muted mt-2 max-w-2xl">
            El plan Gratis alcanza para una pyme que contrata de vez en cuando. Si publicás seguido, Pro y Empresa suman alcance y herramientas.
          </p>
          <div className="plan-grid mt-8">
            {ENTERPRISE_PLANS.map((p) => {
              const price = p.id === "gratis" ? 0 : prices[p.id] ?? p.defaultPriceGs;
              return (
                <article key={p.id} className={`plan-card${p.id === "pro" ? " is-featured" : ""}`}>
                  {p.id === "pro" && <span className="plan-ribbon">Más elegido</span>}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted">{p.tagline}</p>
                  <p className="plan-price">{price === 0 ? "Gratis" : formatGs(price)}{price > 0 && <small> / mes</small>}</p>
                  <ul className="plan-features">
                    {p.features.map((f) => (
                      <li key={f}><Check size={15} /> {f}</li>
                    ))}
                  </ul>
                  <Link
                    href={p.id === "gratis" ? "/empresa/registro" : `/empresa/planes?plan=${p.id}#contratar`}
                    className={`${p.id === "pro" ? "btn-primary" : "btn-secondary"} w-full mt-auto`}
                  >
                    {p.id === "gratis" ? "Empezar gratis" : `Elegir ${p.name}`}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-white pb-12 sm:pb-16">
        <div className={WRAP}>
          <div className="rounded-lg bg-primary text-white text-center px-5 py-10 sm:px-10 sm:py-14">
            <h2 className="font-light text-[28px] leading-[36px] sm:text-[40px] sm:leading-[50px] tracking-[-0.015em] max-w-2xl mx-auto">
              Publicá tu primera vacante hoy
            </h2>
            <p className="text-[15px] text-white/80 mt-3">Es gratis y no necesitás tarjeta.</p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-7">
              <Link href="/empresa/registro" className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold text-base px-7 min-h-12 rounded-full hover:bg-white/90">
                Registrar mi empresa <ArrowRight size={16} />
              </Link>
              <Link href="/ingresar/empresa" className="inline-flex items-center justify-center text-white font-semibold text-base px-7 min-h-12 rounded-full border border-white/60 hover:bg-white/10">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter countryName={countryName} />
    </main>
  );
}
