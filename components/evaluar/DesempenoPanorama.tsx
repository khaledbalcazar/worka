"use client";

import { Columns, Donut, HBars, SERIES } from "@/components/admin/Charts";
import type { Panorama } from "@/lib/evaluar/desempeno-tipos";

// Panorama general de un ciclo de desempeño: avance, resultados del equipo,
// competencias, áreas y dónde la gente se ve distinta de cómo la ven.
//
// Los promedios salen solo de evaluaciones enviadas, y se dice cuántas son:
// un 4,2 con dos evaluaciones no es lo mismo que con cuarenta.
export default function DesempenoPanorama({ p }: { p: Panorama }) {
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi titulo="Evaluaciones del jefe" valor={`${p.jefe.enviadas} de ${p.jefe.total}`} detalle={`${pct(p.jefe.enviadas, p.jefe.total)}% enviadas`} />
        <Kpi titulo="Autoevaluaciones" valor={`${p.auto.enviadas} de ${p.auto.total}`} detalle={p.auto.total ? `${pct(p.auto.enviadas, p.auto.total)}% enviadas` : "No se pidieron"} />
        <Kpi
          titulo="Promedio del equipo"
          valor={p.promedio === null ? "—" : `${p.promedio.toLocaleString("es-PY")} / 5`}
          detalle={p.promedio === null ? "Todavía no hay evaluaciones enviadas" : `Sobre ${p.jefe.enviadas} ${p.jefe.enviadas === 1 ? "evaluación enviada" : "evaluaciones enviadas"}`}
        />
        <Kpi titulo="Leídas y firmadas" valor={`${p.acuses} de ${p.jefe.enviadas}`} detalle={`${p.avisadas} ${p.avisadas === 1 ? "persona avisada" : "personas avisadas"} por correo`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="card p-5">
          <h3 className="font-semibold text-primary-dark">Avance del ciclo</h3>
          <p className="text-xs text-slate-500">Evaluaciones del jefe, por estado.</p>
          <div className="mt-4">
            <Donut
              items={[
                { label: "Enviadas", value: p.jefe.enviadas },
                { label: "A medio cargar", value: p.jefe.enCurso },
                { label: "Sin empezar", value: p.jefe.pendientes },
              ]}
              colors={[SERIES[2], SERIES[3], "#c9c6c1"]}
              center={{ value: `${pct(p.jefe.enviadas, p.jefe.total)}%`, label: "enviadas" }}
            />
          </div>
        </section>

        <section className="card p-5">
          <h3 className="font-semibold text-primary-dark">Cómo salió el equipo</h3>
          <p className="text-xs text-slate-500">Personas según su promedio, en la escala de conducta de 1 a 5.</p>
          {p.jefe.enviadas === 0 ? (
            <Vacio />
          ) : (
            <div className="mt-4">
              <Columns
                labels={p.distribucion.map((d) => d.label)}
                series={[{ name: "Personas", color: SERIES[0], values: p.distribucion.map((d) => d.personas) }]}
                height={190}
                every={1}
              />
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-semibold text-primary-dark">Promedio por competencia</h3>
          <p className="text-xs text-slate-500">De 1 (muy por debajo) a 5 (sobresaliente). Lo más bajo es por donde empezar a capacitar.</p>
          {p.porCompetencia.length === 0 ? (
            <Vacio />
          ) : (
            <div className="mt-4">
              <HBars
                items={p.porCompetencia.map((c) => ({ label: c.label, value: c.promedio }))}
                escala={5}
                format={(n) => n.toLocaleString("es-PY")}
                color={SERIES[0]}
              />
            </div>
          )}
        </section>

        <section className="card p-5">
          <h3 className="font-semibold text-primary-dark">Por área</h3>
          <p className="text-xs text-slate-500">Promedio de las evaluaciones enviadas y avance de cada área.</p>
          <ul className="mt-3 divide-y divide-[#ebe9e6]">
            {p.porArea.map((a) => (
              <li key={a.area} className="py-2.5 flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-primary-dark truncate">{a.area}</span>
                  <span className="block text-xs text-slate-500">
                    {a.enviadas} de {a.personas} {a.personas === 1 ? "evaluación enviada" : "evaluaciones enviadas"}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary-dark shrink-0">
                  {a.promedio === null ? "—" : `${a.promedio.toLocaleString("es-PY")} / 5`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {p.brechas.length > 0 && (
        <section className="card p-5">
          <h3 className="font-semibold text-primary-dark">Dónde se ven distinto</h3>
          <p className="text-xs text-slate-500">
            Diferencias entre la autoevaluación y la del jefe. Una brecha hacia arriba dice que la devolución no está llegando; hacia abajo, que la
            persona se subestima.
          </p>
          <ul className="mt-3 divide-y divide-[#ebe9e6]">
            {p.brechas.map((b, i) => (
              <li key={i} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-primary-dark">{b.persona}</span>
                <span className="text-slate-500">{b.competencia}</span>
                <span className="ml-auto text-xs text-slate-600 tabular-nums">
                  jefe {b.jefe} · ella/él {b.auto}
                </span>
                <span className={`chip ${b.brecha > 0 ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"}`}>
                  {b.brecha > 0 ? `+${b.brecha} se ve mejor` : `${b.brecha} se subestima`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Kpi({ titulo, valor, detalle }: { titulo: string; valor: string; detalle: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-slate-500">{titulo}</p>
      <p className="text-[22px] font-semibold text-primary-dark mt-1 tabular-nums leading-tight">{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{detalle}</p>
    </div>
  );
}

function Vacio() {
  return <p className="text-sm text-slate-500 mt-4">Todavía no hay evaluaciones enviadas para mostrar.</p>;
}
