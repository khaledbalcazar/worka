import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList, UserCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getMyEvaluarAccess } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import {
  getMisCiclos,
  getMisPendientes,
  getMiDesempeno,
} from "@/lib/evaluar/desempeno";
import NuevoCiclo from "@/components/evaluar/NuevoCiclo";

export const metadata = { title: "Desempeño" };

// Evaluación de desempeño.
//
// Una misma persona puede llegar acá desde tres lugares distintos, y por eso
// la pantalla tiene tres bloques: el dueño de la cuenta administra los ciclos,
// el jefe de área carga las evaluaciones que le tocan, y cualquier empleado
// lee la suya. Los tres se muestran solo si tienen contenido, así que un jefe
// que no administra nada ve directo su lista de pendientes.
export default async function DesempenoPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp%2Fdesempeno");
  }

  const access = await getMyEvaluarAccess();
  const plan = planOf(access);

  const [ciclos, pendientes, mias] = await Promise.all([
    getMisCiclos(),
    getMisPendientes(),
    getMiDesempeno(),
  ]);

  const porCargar = pendientes.filter((p) => p.status !== "enviada");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-dark">
            Evaluación de desempeño
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Para la gente que ya trabaja con vos. Va aparte de la selección: acá
            cada quien ve solo lo que le corresponde.
          </p>
        </div>
        {plan.reports && <NuevoCiclo />}
      </div>

      {/* Lo que me toca cargar. Va primero: es lo único que le pide algo a
          quien entra, y un jefe de área no administra ningún ciclo. */}
      {porCargar.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary-dark flex items-center gap-2 mb-2">
            <ClipboardList size={16} /> Te toca evaluar
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {porCargar.map((p) => (
              <Link
                key={p.id}
                href={`/evaluar/app/desempeno/evaluar/${p.id}`}
                className="card press p-4 flex items-start gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-primary-dark truncate">
                    {p.tipo === "auto" ? "Tu autoevaluación" : p.empleado_nombre}
                  </span>
                  <span className="block text-xs text-slate-500 truncate">
                    {p.ciclo?.title}
                    {p.empleado_puesto ? ` · ${p.empleado_puesto}` : ""}
                  </span>
                  <span className="chip bg-slate-100 text-slate-600 mt-1.5">
                    {p.status === "pendiente" ? "Sin empezar" : "A medio cargar"}
                  </span>
                </span>
                <ArrowRight size={16} className="text-slate-400 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* La mía */}
      {mias.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary-dark flex items-center gap-2 mb-2">
            <UserCheck size={16} /> Tu evaluación
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {mias.map((m) => (
              <Link
                key={m.id}
                href="/evaluar/app/desempeno/mias"
                className="card press p-4 flex items-start gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-primary-dark truncate">
                    {m.ciclo?.title}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {m.acuse_at
                      ? "Ya la leíste"
                      : "Nueva — todavía no dejaste tu acuse"}
                  </span>
                </span>
                <ArrowRight size={16} className="text-slate-400 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Los ciclos que administro */}
      <section>
        <h2 className="text-sm font-semibold text-primary-dark mb-2">
          Ciclos de tu empresa
        </h2>

        {!plan.reports ? (
          <div className="card p-6 text-center">
            <p className="font-semibold text-primary-dark">
              La evaluación de desempeño viene con el plan Profesional
            </p>
            <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
              Permite evaluar por competencias con anclajes de conducta,
              comparar la autoevaluación con la del jefe y guardar el historial
              de cada persona período a período.
            </p>
            <Link
              href="/evaluar/precios"
              className="btn-primary press inline-flex mt-4"
            >
              Ver planes
            </Link>
          </div>
        ) : ciclos.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="font-semibold text-primary-dark">
              Todavía no armaste ningún ciclo
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Un ciclo es un período: «primer semestre 2026». Elegís qué
              competencias se evalúan, cargás a la gente con su jefe, y cuando
              lo abrís cada jefe carga la suya.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {ciclos.map((c) => (
              <Link
                key={c.id}
                href={`/evaluar/app/desempeno/${c.id}`}
                className="card press p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-primary-dark truncate">
                    {c.title}
                  </p>
                  <span
                    className={`chip shrink-0 ${
                      c.status === "abierto"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.status === "cerrado"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {c.total === 0
                    ? "Sin personas cargadas"
                    : `${c.enviadas} de ${c.total} evaluaciones enviadas`}
                </p>
                {c.total > 0 && (
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.enviadas / c.total) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
