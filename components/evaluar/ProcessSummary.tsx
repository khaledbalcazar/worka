"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { ProcessDetail } from "@/lib/evaluar";
import { buildPanelCharts } from "@/lib/evaluar/panel-charts";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import { Columns, HBars, SERIES } from "@/components/admin/Charts";
import { StatusChip } from "@/components/evaluar/ProcessEditor";

// Resumen de una búsqueda: cómo viene el proceso de un vistazo, antes de
// entrar a la lista o a comparar candidatos. Todo sale de los candidatos que
// ya trae la página; no hace consultas propias.
//
// Las magnitudes van separadas y con su nombre: el puntaje (preguntas que se
// corrigen solas) no es el ajuste al puesto, y el perfil por rasgo describe
// estilos, no capacidad.

const FUNNEL_COLORS = ["#b7d3f6", "#6da7ec", "#2a78d6", "#184f95", "#0d366b"];

export default function ProcessSummary({ detail }: { detail: ProcessDetail }) {
  const { process, participants } = detail;
  const people = participants.map((p) => ({ ...p, process_id: process.id }));
  const charts = buildPanelCharts(people, [{ id: process.id, title: process.title, status: process.status }]);
  const pct = (p: (typeof participants)[number]) => (p.score !== null && p.max_score ? Math.round((p.score / p.max_score) * 100) : null);

  const started = participants.filter((p) => p.status !== "invitado").length;
  const finishedList = participants.filter((p) => ["completado", "finalista", "contratado", "descartado"].includes(p.status));
  const toReview = participants.filter((p) => p.status === "completado").length;
  const scores = finishedList.map(pct).filter((v): v is number => v !== null);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  // Tiempo que tarda la gente en terminar, desde que empieza.
  const durations = finishedList
    .filter((p) => p.started_at && p.completed_at)
    .map((p) => (Date.parse(p.completed_at!) - Date.parse(p.started_at!)) / 60000)
    .filter((m) => m > 0 && m < 60 * 24 * 7);
  const medianMin = durations.length ? [...durations].sort((a, b) => a - b)[Math.floor(durations.length / 2)] : null;

  const funnel = [
    { label: "Candidatos", value: participants.length },
    { label: "Empezaron", value: started },
    { label: "Terminaron", value: finishedList.length },
    { label: "Finalistas", value: participants.filter((p) => ["finalista", "contratado"].includes(p.status)).length },
    { label: "Contratados", value: participants.filter((p) => p.status === "contratado").length },
  ];

  // Perfil promedio por rasgo, solo de quienes rindieron ese rasgo.
  const traits = new Map<string, { sum: number; n: number }>();
  for (const p of participants) {
    for (const [k, v] of Object.entries(p.profile ?? {})) {
      if (!v.max) continue;
      const t = traits.get(k) ?? { sum: 0, n: 0 };
      t.sum += (v.raw / v.max) * 100;
      t.n += 1;
      traits.set(k, t);
    }
  }
  const traitItems = [...traits.entries()]
    .map(([k, t]) => ({ label: ALL_DIMENSIONS[k]?.label ?? k, value: Math.round(t.sum / t.n), n: t.n }))
    .sort((a, b) => b.value - a.value);

  const top = finishedList
    .filter((p) => p.status !== "descartado")
    .map((p) => ({ p, score: pct(p) }))
    .filter((x) => x.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);

  // Últimos 14 días, que es lo que dura una búsqueda típica.
  const daily = charts.daily.slice(-14);

  if (participants.length === 0)
    return (
      <div className="ev-panel text-center py-12">
        <p className="font-semibold text-primary-dark">Todavía no hay candidatos</p>
        <p className="text-sm text-slate-500 mt-1">
          {process.status === "activo"
            ? "Invitá gente desde la pestaña Candidatos o esperá a que se postulen por la vacante enlazada."
            : "Publicá el proceso para que la gente pueda rendirlo."}
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="ev-kpis">
        <div className="ev-kpi">
          <p className="ev-label">Para revisar</p>
          <p className={`ev-kpi-value ${toReview > 0 ? "!text-[#0a66c2]" : ""}`}>{toReview}</p>
          <p className="ev-kpi-sub">terminaron y esperan tu decisión</p>
        </div>
        <div className="ev-kpi">
          <p className="ev-label">Terminaron</p>
          <p className="ev-kpi-value">
            {finishedList.length}
            <span className="text-base font-normal text-slate-500"> de {participants.length}</span>
          </p>
          <p className="ev-kpi-sub">{started ? `${Math.round((finishedList.length / started) * 100)}% de quienes empezaron` : "nadie empezó todavía"}</p>
        </div>
        <div className="ev-kpi">
          <p className="ev-label">Puntaje promedio</p>
          <p className="ev-kpi-value">{avg === null ? "—" : `${avg}%`}</p>
          <p className="ev-kpi-sub">de las preguntas que se corrigen solas</p>
        </div>
        <div className="ev-kpi">
          <p className="ev-label">Tiempo para terminar</p>
          <p className="ev-kpi-value">{medianMin === null ? "—" : medianMin >= 60 ? `${Math.round(medianMin / 60)} h` : `${Math.round(medianMin)} min`}</p>
          <p className="ev-kpi-sub">mediana, desde que empiezan</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="ev-panel">
          <h2>Embudo del proceso</h2>
          <p className="ev-panel-sub mb-4">Cuántos pasan cada paso</p>
          <ul className="space-y-3">
            {funnel.map((f, i) => (
              <li key={f.label} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 text-[13px]">
                <span className="text-slate-700">{f.label}</span>
                <span className="h-[14px] rounded-[0_4px_4px_0] bg-[#f3f2f0] overflow-hidden">
                  <span
                    className="block h-full rounded-[0_4px_4px_0]"
                    style={{ width: `${participants.length ? Math.max(f.value ? 3 : 0, (f.value / participants.length) * 100) : 0}%`, background: FUNNEL_COLORS[i] }}
                  />
                </span>
                <span className="font-semibold tabular-nums text-primary-dark w-8 text-right">{f.value}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="ev-panel xl:col-span-2">
          <h2>Actividad de los últimos 14 días</h2>
          <div className="ev-legend mt-2 mb-3">
            <span>
              <i style={{ background: SERIES[0] }} /> Se sumaron
            </span>
            <span>
              <i style={{ background: SERIES[2] }} /> Terminaron
            </span>
          </div>
          <Columns
            labels={daily.map((d) => d.label)}
            series={[
              { name: "Se sumaron", color: SERIES[0], values: daily.map((d) => d.invited) },
              { name: "Terminaron", color: SERIES[2], values: daily.map((d) => d.completed) },
            ]}
            height={200}
            every={2}
          />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ev-panel">
          <h2>Distribución de puntajes</h2>
          <p className="ev-panel-sub mb-3">Quienes terminaron, por tramo (% de preguntas que se corrigen solas)</p>
          <Columns
            labels={charts.scoreBuckets.map((b) => b.label)}
            series={[{ name: "Candidatos", color: SERIES[0], values: charts.scoreBuckets.map((b) => b.value) }]}
            height={180}
            every={1}
          />
          {scores.length < 5 && (
            <p className="text-xs text-slate-500 mt-2">Con menos de 5 personas la distribución dice poco: mirá cada caso.</p>
          )}
        </section>
        <section className="ev-panel">
          <h2>Perfil promedio por rasgo</h2>
          <p className="ev-panel-sub mb-3">Promedio de quienes rindieron cada rasgo. Describe estilos de trabajo, no capacidad.</p>
          {traitItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Cuando alguien termine una prueba con rasgos, aparece acá.</p>
          ) : (
            <HBars items={traitItems.map((t) => ({ label: t.label, value: t.value }))} format={(n) => `${n}%`} />
          )}
        </section>
      </div>

      <section className="ev-panel">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2>Mejores puntajes</h2>
            <p className="ev-panel-sub">Los 5 con más puntaje entre quienes siguen en carrera. Para decidir, compará también el ajuste y las notas.</p>
          </div>
          <Link href={`/evaluar/app/procesos/${process.id}/tablero`} className="btn-primary press text-sm">
            Comparar y decidir <ArrowRight size={15} />
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Todavía nadie terminó.</p>
        ) : (
          <ol className="divide-y divide-[#ebe9e6]">
            {top.map(({ p, score }, i) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-7 h-7 rounded-full bg-[#f3f1ee] grid place-items-center text-xs font-bold text-slate-600">{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-primary-dark truncate">{p.full_name}</span>
                  <span className="block text-xs text-slate-500">{p.city ?? (p.source === "worka" ? "Desde Worka Empleos" : "Invitado")}</span>
                </span>
                <StatusChip status={p.status} />
                <span className="text-lg font-semibold tabular-nums text-primary-dark w-14 text-right">{score}%</span>
                <Link
                  href={`/evaluar/app/procesos/${process.id}/informe/${p.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <FileText size={14} /> Informe
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
