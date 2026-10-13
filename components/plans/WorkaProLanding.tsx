import Link from "next/link";
import { ArrowRight, Bell, Check, Crown, Eye, FileText, GraduationCap, MessageSquareText, Receipt, Sparkles, Star } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import CountryPriceSwitch from "@/components/plans/CountryPriceSwitch";
import type { Country } from "@/lib/countries";
import { ALWAYS_FREE_FOR_PEOPLE, BILLING_OPTIONS, PRO_BRAND, WORKA_PRO, formatMoney, localMonthlyPrice } from "@/lib/plans";

const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";

const FEATURES = [
  { Icon: Eye, title: "Quién vio tu perfil", text: "Qué empresas miraron tu perfil o descargaron tu CV, y cuándo." },
  { Icon: Sparkles, title: "Revisión de CV con IA", text: `Puntaje y mejoras concretas para cada sección (${WORKA_PRO.limits.cvReviewsPerMonth} por mes).` },
  { Icon: MessageSquareText, title: "Simulador de entrevistas", text: `Preguntas del puesto y devolución de cada respuesta (${WORKA_PRO.limits.interviewSessionsPerMonth} por mes).` },
  { Icon: Bell, title: "Alertas al instante", text: "Te avisamos apenas se publica una vacante de tus alertas, no al día siguiente." },
  { Icon: FileText, title: "Plantillas de CV premium", text: "Dos diseños más, además de las tres gratis." },
  { Icon: GraduationCap, title: "Cursos premium", text: "Con certificado verificable para mostrar a las empresas." },
  { Icon: Star, title: "Perfil destacado", text: "Aparecés primero cuando una empresa busca talento." },
  { Icon: Check, title: "Detalle de tus postulaciones", text: "Cuántos se postularon y si la empresa ya abrió tu perfil." },
];

// Página pública de Worka Pro, con el precio en la moneda de cada país.
export default function WorkaProLanding({ country, settings }: { country: Country; settings: Record<string, string> }) {
  const price = localMonthlyPrice("pro", "pro", country.code, settings);
  const vos = ["py", "ar"].includes(country.code);
  const faqs = [
    { q: "¿Tengo que pagar para postularme?", a: "No. Postularte, armar tu CV, las alertas diarias y los mensajes con empresas son gratis para siempre. Worka Pro suma herramientas, no quita nada." },
    { q: "¿Cómo se paga?", a: `Con el link de pago, en un solo pago por 1, 3 o 12 meses (el anual cuesta 10). No hay débito automático: cuando vence, ${vos ? "decidís" : "decides"} si renovar.` },
    { q: `¿En qué moneda pago desde ${country.name}?`, a: country.currencyCode === "PYG" ? "En guaraníes." : `El precio se muestra en ${country.currencyCode} para que sepas cuánto es. El link de pago cobra el equivalente en guaraníes y tu banco o tarjeta hace la conversión.` },
    { q: "¿Me dan comprobante?", a: "Sí: un recibo digital con número y código QR para verificarlo. Por ahora es sin valor fiscal." },
  ];
  return (
    <main className="flex-1 bg-white min-h-screen text-ink">
      <HomeNav />
      <section className="bg-white border-b border-line">
        <div className={`${WRAP} py-10 sm:py-16 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center`}>
          <div>
            <p className="plan-eyebrow"><Crown size={16} /> {PRO_BRAND} · {country.flag} {country.name}</p>
            <h1 className="font-light text-[34px] leading-[42px] sm:text-[48px] sm:leading-[58px] tracking-[-0.02em] text-[#8f3b1f] mt-2">
              {vos ? "Conseguí" : "Consigue"} trabajo antes, con más información
            </h1>
            <p className="text-[17px] text-[#404040] mt-4 max-w-xl">
              {vos ? "Sabé" : "Sabe"} quién vio tu perfil, {vos ? "practicá" : "practica"} la entrevista con IA y {vos ? "enterate" : "entérate"} primero de cada vacante.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              <Link href="/pro#contratar" className="btn-primary !min-h-12 !px-7">{vos ? "Activá" : "Activa"} {PRO_BRAND} <ArrowRight size={16} /></Link>
              <Link href="/registro?next=/pro" className="btn-secondary !min-h-12 !px-7">{vos ? "Creá tu cuenta gratis" : "Crea tu cuenta gratis"}</Link>
            </div>
          </div>
          <div className="plan-card is-featured">
            <span className="plan-ribbon">{PRO_BRAND}</span>
            <p className="text-sm text-muted">Precio en {country.name}</p>
            <p className="plan-price">{formatMoney(price)} <small>/ mes</small></p>
            <ul className="plan-features">
              {BILLING_OPTIONS.map((o) => (
                <li key={o.months}>
                  <Check size={15} /> {o.label}: {formatMoney({ amount: price.amount * o.paidMonths, currency: price.currency })}
                  {o.paidMonths < o.months && <strong className="text-success-ink"> · 2 meses gratis</strong>}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted flex items-center gap-1.5"><Receipt size={13} /> Recibo digital con QR en cada pago</p>
          </div>
        </div>
      </section>

      <section className="bg-canvas">
        <div className={`${WRAP} py-12 sm:py-16`}>
          <h2 className="font-light text-[28px] sm:text-[36px] tracking-[-0.015em]">Qué incluye</h2>
          <div className="grid gap-px bg-line border border-line rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4 mt-6">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="bg-white p-5">
                <Icon size={22} className="text-primary" />
                <h3 className="font-semibold text-[15px] mt-2">{title}</h3>
                <p className="text-[13px] text-muted leading-relaxed mt-1">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg bg-white border border-line p-5">
            <h3 className="font-semibold">Siempre gratis en Worka</h3>
            <ul className="plan-features sm:grid-cols-2 lg:grid-cols-3 !mb-0">
              {ALWAYS_FREE_FOR_PEOPLE.map((f) => (
                <li key={f}><Check size={15} /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className={`${WRAP} py-12 sm:py-16 grid lg:grid-cols-2 gap-10`}>
          <div>
            <h2 className="font-light text-[28px] sm:text-[32px] tracking-[-0.015em]">Preguntas frecuentes</h2>
            <dl className="mt-5 space-y-4">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="text-[15px] text-muted mt-1">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-light text-[28px] sm:text-[32px] tracking-[-0.015em]">Precio en tu país</h2>
            <p className="text-[15px] text-muted mt-2 mb-4">Cada país ve el precio en su moneda.</p>
            <CountryPriceSwitch base="/worka-pro" current={country} />
          </div>
        </div>
      </section>
      <SiteFooter countryName={country.name} />
    </main>
  );
}
