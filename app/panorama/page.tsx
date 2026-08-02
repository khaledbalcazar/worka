import Link from "next/link";
import {
  TrendingUp,
  Briefcase,
  Users,
  MapPin,
  Sparkles,
  Building2,
} from "lucide-react";
import Logo from "@/components/Logo";
import { getMarketPanorama, getSalaryStats } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";

export const revalidate = 600;

export const metadata = {
  title: "Panorama del mercado laboral",
  description:
    "Datos reales del mercado de empleo: vacantes activas por rubro, ciudades que más contratan, competencia por puesto y tarifas freelance. Actualizado con la información de Worka.",
};

export default async function PanoramaPage() {
  const country = await getActiveCountry();
  const [m, salaries] = await Promise.all([
    getMarketPanorama(country.code),
    getSalaryStats(),
  ]);

  const maxInd = Math.max(...m.topIndustries.map((i) => i.count), 1);
  const maxCity = Math.max(...m.topCities.map((c) => c.count), 1);
  const maxSalary = Math.max(...salaries.map((s) => s.max), 1);

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/empleos" className="text-gray-500 hover:text-primary">
              Empleos
            </Link>
            <Link href="/salarios" className="text-gray-500 hover:text-primary">
              Salarios
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-primary">
            <TrendingUp className="w-3.5 h-3.5" /> Datos reales · {country.name}
          </span>
          <h1 className="text-xl lg:text-3xl font-bold text-primary-dark mt-2">
            Panorama del mercado laboral
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Métricas del mercado de empleo en {country.name}, calculadas en vivo
            de las vacantes y perfiles de Worka. Se actualiza automáticamente.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Briefcase} label="Vacantes activas" value={m.totalActive} accent="#2563EB" />
          <Kpi icon={Sparkles} label="Nuevas esta semana" value={m.newThisWeek} accent="#10B981" />
          <Kpi
            icon={Users}
            label="Postulantes por vacante"
            value={m.applicantsPerJob ?? "—"}
            accent="#F59E0B"
          />
          <Kpi icon={Building2} label="Freelancers activos" value={m.freelancers.total} accent="#7C5CFC" />
        </div>

        <p className="text-xs text-gray-400">
          {m.workaActive.toLocaleString("es")} vacantes de Worka +{" "}
          {m.externalActive.toLocaleString("es")} de otros portales agregados.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Demanda por rubro */}
          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" /> Rubros con más demanda
            </h2>
            {m.topIndustries.length === 0 ? (
              <p className="text-sm text-gray-400">Sin datos todavía.</p>
            ) : (
              <div className="space-y-3">
                {m.topIndustries.map((i) => (
                  <div key={i.industry}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{i.industry}</span>
                      <span className="font-semibold text-primary-dark">{i.count}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(i.count / maxInd) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ciudades */}
          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" /> Ciudades que más contratan
            </h2>
            {m.topCities.length === 0 ? (
              <p className="text-sm text-gray-400">Sin datos todavía.</p>
            ) : (
              <div className="space-y-3">
                {m.topCities.map((c) => (
                  <div key={c.city}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{c.city}</span>
                      <span className="font-semibold text-primary-dark">{c.count}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(c.count / maxCity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Salarios */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary-dark">
              Rangos salariales por rubro
            </h2>
            <Link href="/salarios" className="text-xs text-primary hover:underline">
              Ver detalle →
            </Link>
          </div>
          {salaries.length === 0 ? (
            <p className="text-sm text-gray-400">
              Todavía no hay suficientes vacantes con salario visible.
            </p>
          ) : (
            <div className="space-y-3">
              {salaries.slice(0, 8).map((s) => (
                <div key={s.industry}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.industry}</span>
                    <span className="text-xs text-gray-400">
                      {country.currency} {Math.round(s.min).toLocaleString("es")} –{" "}
                      {Math.round(s.max).toLocaleString("es")}
                    </span>
                  </div>
                  <div className="relative h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                      style={{
                        left: `${(s.min / maxSalary) * 100}%`,
                        width: `${((s.max - s.min) / maxSalary) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Freelancers por categoría */}
        {m.freelancers.byCategory.length > 0 && (
          <section className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary-dark">
                Freelancers por categoría
              </h2>
              <Link href="/freelancers" className="text-xs text-primary hover:underline">
                Ver directorio →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.freelancers.byCategory.map((c) => (
                <span
                  key={c.category}
                  className="text-sm bg-[#7C5CFC]/10 text-[#7C5CFC] px-3 py-1.5 rounded-full"
                >
                  {c.category} · {c.count}
                </span>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-gray-400 text-center pt-2">
          Los datos se recalculan periódicamente a partir de la actividad real en
          Worka. No constituyen asesoramiento profesional.
        </p>
      </div>
    </main>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
        style={{ background: `${accent}1a`, color: accent }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-primary-dark">
        {typeof value === "number" ? value.toLocaleString("es") : value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
