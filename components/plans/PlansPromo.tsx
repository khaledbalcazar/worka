import Link from "next/link";
import { ArrowRight, Building2, Crown } from "lucide-react";
import type { Country } from "@/lib/countries";
import { ENTERPRISE_BRAND, PRO_BRAND, formatMoney, localMonthlyPrice } from "@/lib/plans";

// Las dos ofertas pagas en la portada (y en la portada de cada país), con el
// precio en la moneda local.
export default function PlansPromo({ country, settings }: { country: Country; settings: Record<string, string> }) {
  const pro = localMonthlyPrice("pro", "pro", country.code, settings);
  const enterprise = localMonthlyPrice("enterprise", "pro", country.code, settings);
  const cards = [
    {
      Icon: Crown,
      title: PRO_BRAND,
      who: "Para personas",
      text: "Quién vio tu perfil, alertas al instante, revisión de CV y simulador de entrevistas con IA.",
      price: `${formatMoney(pro)} / mes`,
      href: `/worka-pro/${country.slug}`,
    },
    {
      Icon: Building2,
      title: ENTERPRISE_BRAND,
      who: "Para empresas",
      text: "Vacantes sin límite, destacadas, alertas urgentes, búsqueda de talento y tu marca empleadora.",
      price: `Desde ${formatMoney(enterprise)} / mes`,
      href: `/enterprise-pro/${country.slug}`,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map(({ Icon, title, who, text, price, href }) => (
        <Link key={title} href={href} className="group flex flex-col gap-2 rounded-lg border border-line bg-white p-5 hover:border-primary transition-colors">
          <span className="plan-eyebrow"><Icon size={15} /> {who}</span>
          <h3 className="text-xl font-semibold group-hover:text-primary">{title}</h3>
          <p className="text-[15px] text-muted leading-relaxed">{text}</p>
          <p className="mt-auto pt-2 flex items-center justify-between">
            <span className="font-semibold">{price}</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Conocer <ArrowRight size={15} /></span>
          </p>
        </Link>
      ))}
    </div>
  );
}
