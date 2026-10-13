import Link from "next/link";
import { COUNTRIES, type Country } from "@/lib/countries";

// Elegir país en las páginas de planes: cada país tiene su URL y su moneda.
export default function CountryPriceSwitch({ base, current }: { base: "/worka-pro" | "/enterprise-pro"; current: Country }) {
  return (
    <nav aria-label="Precios por país" className="flex flex-wrap gap-2">
      {COUNTRIES.map((c) => (
        <Link
          key={c.code}
          href={`${base}/${c.slug}`}
          aria-current={c.code === current.code ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full border text-sm font-medium ${
            c.code === current.code ? "border-primary bg-primary/10 text-primary" : "border-line bg-white text-[#404040] hover:border-[#8c8c8c]"
          }`}
        >
          <span aria-hidden="true">{c.flag}</span> {c.name}
        </Link>
      ))}
    </nav>
  );
}
