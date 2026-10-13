import Link from "next/link";
import { ArrowRight, Building2, Check, Receipt } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import CountryPriceSwitch from "@/components/plans/CountryPriceSwitch";
import type { Country } from "@/lib/countries";
import { ENTERPRISE_BRAND, ENTERPRISE_PLANS, formatMoney, localMonthlyPrice } from "@/lib/plans";

const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";

// Página pública de Worka Enterprise Pro, con precios en la moneda del país.
export default function EnterpriseProLanding({ country, settings }: { country: Country; settings: Record<string, string> }) {
  const vos = ["py", "ar"].includes(country.code);
  const rows: { label: string; values: string[] }[] = [
    { label: "Vacantes publicadas a la vez", values: ["3", "Sin límite", "Sin límite"] },
    { label: "Vigencia por vacante", values: ["30 días", "60 días", "60 días"] },
    { label: "Renovación automática", values: ["—", "✓", "✓"] },
    { label: "Vacantes destacadas por mes", values: ["—", "2", "5"] },
    { label: "Alertas urgentes por mes", values: ["—", "2", "5"] },
    { label: "Búsqueda de talento", values: ["—", "✓", "✓"] },
    { label: "Prioridad en el correo semanal", values: ["—", "✓", "✓"] },
    { label: "Equipo con varios usuarios", values: ["—", "—", "✓"] },
    { label: "Página con tu marca empleadora", values: ["—", "—", "✓"] },
  ];
  return (
    <main className="flex-1 bg-white min-h-screen text-ink">
      <HomeNav />
      <section className="bg-white border-b border-line">
        <div className={`${WRAP} py-10 sm:py-16`}>
          <p className="plan-eyebrow"><Building2 size={16} /> {ENTERPRISE_BRAND} · {country.flag} {country.name}</p>
          <h1 className="font-light text-[34px] leading-[42px] sm:text-[48px] sm:leading-[58px] tracking-[-0.02em] text-[#8f3b1f] mt-2 max-w-3xl">
            {vos ? "Contratá" : "Contrata"} más rápido en {country.name}
          </h1>
          <p className="text-[17px] text-[#404040] mt-4 max-w-2xl">
            {vos ? "Empezá" : "Empieza"} gratis con hasta 3 vacantes. Cuando necesites más alcance, Pro y Empresa suman visibilidad, búsqueda de talento y tu marca.
          </p>
          <div className="plan-grid mt-8">
            {ENTERPRISE_PLANS.map((p) => {
              const price = p.id === "gratis" ? null : localMonthlyPrice("enterprise", p.id, country.code, settings);
              return (
                <article key={p.id} className={`plan-card${p.id === "pro" ? " is-featured" : ""}`}>
                  {p.id === "pro" && <span className="plan-ribbon">Más elegido</span>}
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted">{p.tagline}</p>
                  <p className="plan-price">{price ? formatMoney(price) : "Gratis"}{price && <small> / mes</small>}</p>
                  <ul className="plan-features">
                    {p.features.map((f) => (
                      <li key={f}><Check size={15} /> {f}</li>
                    ))}
                  </ul>
                  <Link
                    href={p.id === "gratis" ? "/empresa/registro" : `/empresa/planes?plan=${p.id}#contratar`}
                    className={`${p.id === "pro" ? "btn-primary" : "btn-secondary"} w-full mt-auto`}
                  >
                    {p.id === "gratis" ? (vos ? "Empezá gratis" : "Empieza gratis") : `Elegir ${p.name}`} <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-4 flex items-center gap-1.5">
            <Receipt size={13} /> Pago con link, por 1, 3 o 12 meses (el anual cuesta 10). Recibo digital con QR en cada pago.
            {country.currencyCode !== "PYG" && " El link cobra el equivalente en guaraníes."}
          </p>
        </div>
      </section>

      <section className="bg-canvas">
        <div className={`${WRAP} py-12 sm:py-16`}>
          <h2 className="font-light text-[28px] sm:text-[36px] tracking-[-0.015em]">Compará los planes</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left">
                  <th className="p-3 font-semibold">&nbsp;</th>
                  {ENTERPRISE_PLANS.map((p) => (
                    <th key={p.id} className="p-3 font-semibold">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td className="p-3 text-muted">{r.label}</td>
                    {r.values.map((v, i) => (
                      <td key={i} className={`p-3 ${v === "✓" ? "text-success-ink font-semibold" : ""}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="font-semibold mt-10 mb-3">Precios en otros países</h3>
          <CountryPriceSwitch base="/enterprise-pro" current={country} />
        </div>
      </section>
      <SiteFooter countryName={country.name} />
    </main>
  );
}
