import Link from "next/link";
import Logo from "@/components/Logo";

// Header público para páginas de marketing (blog). Sin estado, liviano.
export default function SiteHeader({ active }: { active?: string }) {
  const links = [
    { label: "Buscar empleo", href: "/empleos" },
    { label: "Para empresas", href: "/para-empresas" },
    { label: "Blog", href: "/blog" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                active === l.href
                  ? "text-primary font-bold"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/ingresar" className="btn-secondary text-xs">
            Ingresar
          </Link>
          <Link href="/registro" className="btn-primary text-xs hidden sm:inline-flex">
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
