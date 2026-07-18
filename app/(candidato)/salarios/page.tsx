import Link from "next/link";
import { getSalaryStats } from "@/lib/data";

export const metadata = { title: "Salarios por rubro" };

function gs(n: number): string {
  return `Gs. ${Math.round(n / 100000) * 100000 >= 1000000 ? (n / 1000000).toLocaleString("es-PY", { maximumFractionDigits: 1 }) + " M" : n.toLocaleString("es-PY")}`;
}

// Comparador salarial: calculado en vivo de las vacantes con salario visible.
export default async function SalariosPage() {
  const stats = await getSalaryStats();
  const maxValue = Math.max(...stats.map((s) => s.max), 1);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
          💰 ¿Cuánto se paga en tu rubro?
        </h1>
        <p className="text-sm text-gray-500">
          Rangos reales, calculados de las vacantes publicadas en Worka con
          salario visible. Usalos para saber qué pedir.
        </p>
      </div>

      {stats.length === 0 && (
        <div className="card p-8 text-center text-sm text-gray-400">
          Todavía no hay suficientes vacantes con salario para calcular rangos.
        </div>
      )}

      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.industry} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-primary-dark">{s.industry}</h2>
              <span className="text-xs text-gray-400">
                {s.count} dato{s.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-3 relative h-3 bg-surface rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                style={{
                  left: `${(s.min / maxValue) * 100}%`,
                  width: `${Math.max(((s.max - s.min) / maxValue) * 100, 4)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1.5">
              <span className="font-medium text-gray-700">{gs(s.min)}</span>
              <span className="font-medium text-emerald-700">{gs(s.max)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-blue-50 border-blue-100 text-sm text-gray-600">
        💡 El salario mínimo legal vigente en Paraguay es tu piso: ninguna
        oferta formal puede pagarte menos.{" "}
        <Link href="/empleos" className="text-primary font-medium">
          Ver vacantes con salario visible →
        </Link>
      </div>
    </div>
  );
}
