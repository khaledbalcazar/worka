import Link from "next/link";
import { Search } from "lucide-react";
import Logo from "@/components/Logo";
import FreelancerCard from "@/components/freelancers/FreelancerCard";
import { getFreelancerDirectory } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";
import { FREELANCER_CATEGORIES } from "@/lib/freelancer";

export const revalidate = 120;

export const metadata = {
  title: "Freelancers — Contratá profesionales para tus proyectos",
  description:
    "Encontrá diseñadores, programadores, redactores y más. Mirá sus portfolios, pedí presupuesto y trabajá con freelancers de tu país en Worka.",
};

export default async function FreelancersDirectory({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;
  const country = await getActiveCountry();
  const freelancers = await getFreelancerDirectory({
    country: country.code,
    category: cat,
    q,
  });

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Logo />
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/empleos" className="text-gray-500 hover:text-primary">
              Empleos
            </Link>
            <Link href="/unirme-freelancer" className="btn-primary text-xs">
              Ofrecer mis servicios
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-primary-dark">
            Freelancers en {country.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Contratá profesionales verificados para tus proyectos. Mirá sus
            trabajos y pedí un presupuesto sin compromiso.
          </p>
        </div>

        {/* Buscador */}
        <form action="/freelancers" className="relative max-w-lg">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por especialidad… (ej: logo, landing page)"
            className="input pl-9"
          />
        </form>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <CategoryChip label="Todas" active={!cat} q={q} value={undefined} />
          {FREELANCER_CATEGORIES.map((c) => (
            <CategoryChip key={c} label={c} value={c} active={cat === c} q={q} />
          ))}
        </div>

        {/* Grilla */}
        {freelancers.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-2">🧑‍💻</p>
            <p className="font-semibold text-primary-dark">
              Todavía no hay freelancers para mostrar acá
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ¿Ofrecés servicios? Sé de los primeros en {country.name}.
            </p>
            <Link href="/unirme-freelancer" className="btn-primary mt-4">
              Crear mi perfil de freelancer
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((f) => (
              <FreelancerCard key={f.id} f={f} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CategoryChip({
  label,
  value,
  active,
  q,
}: {
  label: string;
  value?: string;
  active: boolean;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (value) params.set("cat", value);
  if (q) params.set("q", q);
  const href = `/freelancers${params.toString() ? `?${params}` : ""}`;
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-gray-600 border-gray-200 hover:border-primary"
      }`}
    >
      {label}
    </Link>
  );
}
