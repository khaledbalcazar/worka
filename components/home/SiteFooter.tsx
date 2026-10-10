import Link from "next/link";
import Logo from "@/components/Logo";
import { COUNTRIES } from "@/lib/countries";

const WRAP = "max-w-[1128px] mx-auto px-4 sm:px-6";

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

// Pie de página de las páginas públicas (inicio y landing para empresas).
export default function SiteFooter({
  countryName,
  siteName = "Worka",
}: {
  countryName: string;
  siteName?: string;
}) {
  return (
    <footer className="bg-white border-t border-line">
      <div className={`${WRAP} py-10 lg:py-12 grid gap-8 grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]`}>
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="text-[13px] text-muted leading-relaxed mt-3 max-w-[260px]">
            Infraestructura de empleo y contratación verificada para {countryName} y América Latina.
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
            {siteName} © {new Date().getFullYear()} · Hecho en Paraguay 🇵🇾
          </span>
          <span>Nunca pagues para conseguir un trabajo.</span>
        </div>
      </div>
    </footer>
  );
}
