import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Crown,
  Gift,
  Infinity as InfinityIcon,
  LayoutDashboard,
  Mail,
  MailCheck,
  Users,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import { ENTERPRISE_BRAND, formatMoney } from "@/lib/plans";
import { LAUNCH_PROMO } from "@/lib/promo";
import type { Money } from "@/lib/currency";

// Página de la promoción de lanzamiento: a donde lleva «Reclamar oferta» del
// popup de /para-empresas. Mismo sistema que el resto del sitio público:
// banda blanca con titular liviano, secciones sobre el lienzo cálido y el
// azul solo para las acciones.

const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";
const SECTION = "py-12 sm:py-16";
const H2 = "font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] tracking-[-0.015em]";

const BENEFITS = [
  { Icon: InfinityIcon, title: "Vacantes sin límite", text: "Publicá todas las búsquedas que necesites a la vez. El plan Gratis se queda en 3." },
  { Icon: TrendingUp, title: "2 destacadas por mes", text: "Tu vacante aparece primera en la búsqueda de Worka durante 7 días, con una marca especial." },
  { Icon: Zap, title: "2 alertas urgentes por mes", text: "Avisamos al instante, por la campanita y por correo, a los candidatos compatibles por rubro y ciudad." },
  { Icon: Search, title: "Búsqueda de talento", text: "Encontrá perfiles antes de que se postulen y escribiles directo." },
  { Icon: RefreshCw, title: "60 días y renovación automática", text: "Tus vacantes duran el doble y se renuevan solas al vencer: no se te cae ninguna búsqueda." },
  { Icon: Mail, title: "Prioridad en el correo semanal", text: "Tus vacantes van arriba en el resumen que reciben los candidatos cada semana." },
];

const EVALUAR = [
  { Icon: ClipboardCheck, title: "Procesos sin límite", text: "Evaluá a los candidatos de todas tus vacantes a la vez, enlazados con cada búsqueda de Worka." },
  { Icon: Sparkles, title: "Pruebas a medida con IA", text: "Describí el puesto y el asistente arma las etapas y preguntas por vos." },
  { Icon: BarChart3, title: "Informe por candidato", text: "Puntajes, perfil y respuestas de cada persona, con exportación a Excel para decidir rápido." },
  { Icon: Users, title: "Invitación masiva y equipo", text: "Invitá hasta 200 candidatos de una vez y sumá a tu equipo de selección a cada proceso." },
];

const COMPARE: { label: string; free: string; pro: string }[] = [
  { label: "Vacantes publicadas a la vez", free: "3", pro: "Sin límite" },
  { label: "Vigencia por vacante", free: "30 días", pro: "60 días" },
  { label: "Renovación automática", free: "—", pro: "✓" },
  { label: "Vacantes destacadas por mes", free: "—", pro: "2" },
  { label: "Alertas urgentes por mes", free: "—", pro: "2" },
  { label: "Búsqueda de talento", free: "—", pro: "✓" },
  { label: "Prioridad en el correo semanal", free: "—", pro: "✓" },
  { label: "Tablero de candidatos y mensajes", free: "✓", pro: "✓" },
  { label: "Worka Evaluar · Profesional", free: "—", pro: "✓" },
];

export default function PromoOfferLanding({
  countryName,
  value,
  open,
  wrongCode,
}: {
  countryName: string;
  // Lo que costarían los 3 meses de Pro en la moneda del país.
  value: Money;
  open: boolean;
  wrongCode: string | null;
}) {
  const register = `/empresa/registro?promo=${LAUNCH_PROMO.code}`;
  const steps = [
    { Icon: Gift, title: "Registrá tu empresa", text: `El código ${LAUNCH_PROMO.code} ya va cargado en el formulario. Solo completá los datos de la empresa.` },
    { Icon: MailCheck, title: "Confirmá tu email", text: "Te mandamos un link. Al tocarlo, Enterprise Pro y Worka Evaluar quedan activos al instante, sin pagos ni tarjeta." },
    { Icon: LayoutDashboard, title: "Entrá a tu panel", text: "Te recibimos con una guía corta por cada sección y te invitamos a publicar tu primera vacante." },
  ];

  return (
    <main className="flex-1 bg-white min-h-screen text-ink">
      <HomeNav />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-line">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-16 items-center pt-8 pb-12 sm:pt-14 lg:pt-16 lg:pb-16`}>
          <div className="min-w-0">
            {wrongCode && (
              <p className="flex items-start gap-2 text-sm bg-[#fff6f1] border border-[#f0d5c9] text-[#8f3b1f] rounded-lg px-3.5 py-2.5 mb-5">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>
                  El código <strong>{wrongCode}</strong> no es válido. Usá <strong>{LAUNCH_PROMO.code}</strong> para activar la oferta.
                </span>
              </p>
            )}
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#e9f4ec] text-success-ink mb-4">
              <Gift size={14} /> Oferta de lanzamiento · Empresas nuevas
            </p>
            <h1 className="font-light text-[34px] leading-[42px] sm:text-[48px] sm:leading-[58px] lg:text-[54px] lg:leading-[64px] tracking-[-0.02em] text-[#8f3b1f]">
              3 meses de {ENTERPRISE_BRAND} y Worka Evaluar, por cuenta de Worka
            </h1>
            <p className="text-[16px] sm:text-lg leading-relaxed text-[#404040] max-w-xl mt-4">
              Registrá tu empresa con tu código y contratá en {countryName} con todo el plan Pro desde el primer día:
              vacantes sin límite, destacados, alertas urgentes y búsqueda de talento. Y además, Worka Evaluar · Profesional
              para evaluar candidatos con pruebas hechas con IA.
            </p>

            {open ? (
              <>
                <div className="flex flex-col sm:flex-row gap-2.5 mt-7">
                  <Link href={register} className="btn-primary !min-h-12 !px-7 !text-base">
                    Registrar mi empresa y activar <ArrowRight size={17} />
                  </Link>
                  <a href="#beneficios" className="btn-secondary !min-h-12 !px-7 !text-base">
                    Ver qué incluye
                  </a>
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-[14px] text-[#404040]">
                  {["Sin tarjeta", "Se activa al confirmar tu email", `Válida hasta el ${LAUNCH_PROMO.deadlineLabel}`].map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5">
                      <Check size={16} className="text-success-ink" /> {t}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mt-7 rounded-lg border border-line bg-canvas p-4 text-sm">
                <p className="font-semibold">Esta promoción terminó el {LAUNCH_PROMO.deadlineLabel}.</p>
                <p className="text-muted mt-1">Podés empezar gratis y pasarte a {ENTERPRISE_BRAND} cuando lo necesites.</p>
                <Link href="/empresa/registro" className="btn-primary mt-3">Empezar gratis</Link>
              </div>
            )}
          </div>

          {/* El "pase" de la oferta, con el código. */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl text-white shadow-[0_18px_48px_rgba(10,102,194,0.28)] bg-[radial-gradient(120%_140%_at_100%_0%,#2f8ae0_0%,#0a66c2_45%,#004182_100%)]">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="w-8 h-8 rounded-full bg-white/15 grid place-items-center"><Crown size={16} /></span>
                    {ENTERPRISE_BRAND}
                  </p>
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase bg-white text-[#0a66c2] px-2.5 py-1 rounded-full">Plan Pro</span>
                </div>
                <p className="mt-8 text-[64px] sm:text-[76px] leading-none font-light tracking-[-0.04em]">
                  3 <span className="text-[28px] sm:text-[32px] tracking-[-0.02em]">meses</span>
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white/15 rounded-full px-3 py-1">
                  <ClipboardCheck size={14} /> + Worka Evaluar · Profesional
                </p>
                <p className="mt-3 text-white/85 text-[15px]">
                  Solo Enterprise Pro vale <span className="line-through">{formatMoney(value)}</span> · <strong className="text-white">para vos, sin costo</strong>
                </p>
              </div>
              {/* Troquel del ticket */}
              <div className="relative h-0 border-t-2 border-dashed border-white/35 mx-6">
                <span className="absolute -left-[38px] -top-[14px] w-7 h-7 rounded-full bg-white" />
                <span className="absolute -right-[38px] -top-[14px] w-7 h-7 rounded-full bg-white" />
              </div>
              <div className="p-6 sm:px-8 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] text-white/70">Tu código</p>
                  <p className="font-mono text-[24px] sm:text-[28px] font-bold tracking-[.14em]">{LAUNCH_PROMO.code}</p>
                </div>
                <div className="text-right text-[12px] text-white/75 shrink-0">
                  Canjealo hasta el
                  <br />
                  <strong className="text-white text-[14px]">{LAUNCH_PROMO.deadlineLabel}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section id="beneficios" className="bg-canvas scroll-mt-16">
        <div className={`${WRAP} ${SECTION}`}>
          <p className="plan-eyebrow"><Crown size={15} /> Todo el plan Pro</p>
          <h2 className={`${H2} mt-1`}>Lo que tu empresa desbloquea hoy</h2>
          <p className="text-[15px] text-muted mt-2 mb-8 max-w-2xl">
            Es el mismo plan que usan las empresas que contratan todos los meses. Sin versiones recortadas.
          </p>
          <div className="grid gap-px bg-line border border-line rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div key={title} className="flex sm:flex-col gap-3.5 bg-white p-5">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Icon size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] mb-1">{title}</h3>
                  <p className="text-[13px] text-muted leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKA EVALUAR ── */}
      <section className="bg-white">
        <div className={`${WRAP} ${SECTION} grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14 items-start`}>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#e9f4ec] text-success-ink">
              <Gift size={14} /> También incluido
            </p>
            <h2 className={`${H2} mt-3`}>Worka Evaluar · Profesional, 3 meses</h2>
            <p className="text-[15px] text-muted mt-2">
              Además de recibir postulaciones, evaluá a cada candidato con pruebas del puesto antes de entrevistarlo. Se
              activa junto con tu plan, con el mismo código y por el mismo plazo.
            </p>
            <Link href="/evaluar" className="btn-secondary mt-6">
              Conocer Worka Evaluar
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {EVALUAR.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4 bg-canvas border border-line rounded-lg p-4">
                <span className="w-10 h-10 rounded-full bg-white text-primary grid place-items-center shrink-0 border border-line">
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

      {/* ── GRATIS VS PRO ── */}
      <section className="bg-canvas border-t border-line">
        <div className={`${WRAP} ${SECTION} grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 items-start`}>
          <div>
            <h2 className={H2}>La diferencia, en una tabla</h2>
            <p className="text-[15px] text-muted mt-2">
              Durante 3 meses tenés la columna de la derecha. Después elegís: seguir con Pro o volver al plan Gratis, sin
              perder tus vacantes ni tus candidatos.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left bg-[#faf9f7]">
                  <th className="p-3 font-semibold">&nbsp;</th>
                  <th className="p-3 font-semibold text-muted">Gratis</th>
                  <th className="p-3 font-semibold text-primary">
                    <span className="inline-flex items-center gap-1.5"><Crown size={14} /> Pro · tu oferta</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARE.map((r) => (
                  <tr key={r.label}>
                    <td className="p-3 text-[#404040]">{r.label}</td>
                    <td className="p-3 text-muted">{r.free}</td>
                    <td className={`p-3 bg-primary/[0.04] font-semibold ${r.pro === "✓" ? "text-success-ink" : ""}`}>{r.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CÓMO SE ACTIVA ── */}
      <section className="bg-white border-y border-line">
        <div className={`${WRAP} ${SECTION}`}>
          <h2 className={`${H2} mb-8`}>Activala en tres pasos</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-canvas border border-line rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-full border-2 border-primary text-primary flex items-center justify-center font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <s.Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-[17px] mb-1">{s.title}</h3>
                <p className="text-[14px] text-[#404040] leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CONDICIONES ── */}
      <section className="bg-white">
        <div className={`${WRAP} pt-12 sm:pt-16`}>
          <div className="rounded-lg border border-line bg-[#faf9f7] p-5 sm:p-6 flex gap-4">
            <ShieldCheck size={22} className="text-success-ink shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#4a4a4a] leading-relaxed space-y-1">
              <p className="font-semibold text-[15px] text-ink">Condiciones de la promoción</p>
              <p>
                Válida para empresas nuevas que se registren en Worka con el código {LAUNCH_PROMO.code} hasta el{" "}
                {LAUNCH_PROMO.deadlineLabel} inclusive. Una vez por empresa.
              </p>
              <p>
                Activa {ENTERPRISE_BRAND} · Pro y Worka Evaluar · Profesional durante {LAUNCH_PROMO.months} meses desde el día del alta. No se renueva sola ni
                genera cobros: al terminar, la cuenta vuelve al plan Gratis salvo que elijas continuar.
              </p>
              <p>Las vacantes siguen las reglas de publicación de Worka y la verificación del registro fiscal de la empresa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      {open && (
        <section className="bg-white py-12 sm:py-16">
          <div className={WRAP}>
            <div className="rounded-lg bg-primary text-white text-center px-5 py-10 sm:px-10 sm:py-14">
              <h2 className="font-light text-[28px] leading-[36px] sm:text-[40px] sm:leading-[50px] tracking-[-0.015em] max-w-2xl mx-auto">
                Tu próxima contratación empieza hoy
              </h2>
              <p className="text-[15px] text-white/80 mt-3">
                Código <strong className="font-mono tracking-[.1em] text-white">{LAUNCH_PROMO.code}</strong> · 3 meses de Enterprise Pro + Evaluar sin costo
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-7">
                <Link href={register} className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold text-base px-7 min-h-12 rounded-full hover:bg-white/90">
                  Registrar mi empresa <ArrowRight size={16} />
                </Link>
                <Link href="/enterprise-pro" className="inline-flex items-center justify-center text-white font-semibold text-base px-7 min-h-12 rounded-full border border-white/60 hover:bg-white/10">
                  Ver todos los planes
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <SiteFooter countryName={countryName} />
    </main>
  );
}
