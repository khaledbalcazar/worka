"use client";

import type { BoardData } from "@/lib/evaluar";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import { DIMENSIONES_INTEGRIDAD } from "@/lib/evaluar/integridad";

// Métricas del grupo, no de una persona.
//
// El informe individual contesta "cómo es este candidato". Esto contesta dos
// preguntas distintas que antes no se podían responder sin exportar a Excel:
// qué tan buena es la camada que se presentó, y si la evaluación está
// midiendo algo o le sale lo mismo a todo el mundo.
//
// Esa segunda es la que casi nadie mira y la que más sirve. Una prueba donde
// todos sacan entre 68% y 72% no está separando a nadie: se puede tirar, o
// hay que hacerla más difícil. Una donde el mejor saca 90 y el peor 30 sí
// está discriminando, que es exactamente para lo que se tomó.

function mediana(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export default function BoardMetrics({ board }: { board: BoardData }) {
  const conPuntaje = board.candidates
    .map((c) => c.percent)
    .filter((p): p is number => p !== null);

  const conFit = board.candidates
    .map((c) => c.fit)
    .filter((f): f is number => f !== null);

  // Promedio del grupo por rasgo, para ver el perfil de la camada entera.
  // Se excluyen los factores de integridad: esos se leen por persona y con
  // bandas, y promediarlos entre candidatos no significa nada.
  const clavesIntegridad = new Set<string>(
    DIMENSIONES_INTEGRIDAD.map((d) => d.key)
  );
  const acumulado = new Map<string, number[]>();
  for (const c of board.candidates) {
    for (const [key, v] of Object.entries(c.profile ?? {})) {
      if (clavesIntegridad.has(key) || !v || v.max <= 0) continue;
      const lista = acumulado.get(key) ?? [];
      lista.push(Math.round((v.raw / v.max) * 100));
      acumulado.set(key, lista);
    }
  }
  const rasgos = [...acumulado.entries()]
    .map(([key, valores]) => ({
      key,
      label: ALL_DIMENSIONS[key]?.label ?? key,
      promedio: Math.round(valores.reduce((s, x) => s + x, 0) / valores.length),
      n: valores.length,
    }))
    .sort((a, b) => b.promedio - a.promedio);

  if (conPuntaje.length === 0 && rasgos.length === 0) return null;

  const min = conPuntaje.length ? Math.min(...conPuntaje) : 0;
  const max = conPuntaje.length ? Math.max(...conPuntaje) : 0;
  const rango = max - min;

  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold text-primary-dark">
        Métricas del grupo
      </h2>
      <p className="text-xs text-slate-500 mt-0.5">
        Cómo le fue a la camada completa, no a una persona.
      </p>

      {conPuntaje.length >= 2 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            {[
              { l: "Promedio", v: `${Math.round(conPuntaje.reduce((s, x) => s + x, 0) / conPuntaje.length)}%` },
              { l: "Mediana", v: `${mediana(conPuntaje)}%` },
              { l: "Mejor", v: `${max}%` },
              { l: "Más bajo", v: `${min}%` },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-lg font-bold text-primary-dark leading-none">
                  {s.v}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Si la prueba separa o no. Es la lectura que casi nadie hace y la
              que decide si vale la pena volver a tomarla. */}
          <div
            className={`rounded-xl border px-3.5 py-2.5 mt-3 ${
              rango < 15
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-semibold text-primary-dark">
              {rango < 15
                ? "La prueba casi no separa a los candidatos"
                : "La prueba está separando bien"}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {rango < 15
                ? `Entre el mejor y el más bajo hay ${rango} puntos. Con tan poca diferencia, elegir por este puntaje es casi echar a suerte: conviene subir la dificultad o medir otra cosa.`
                : `Entre el mejor y el más bajo hay ${rango} puntos, así que el puntaje efectivamente distingue a unos de otros.`}
            </p>
          </div>
        </>
      )}

      {conFit.length >= 2 && (
        <p className="text-xs text-slate-600 mt-3">
          <strong className="font-semibold">Ajuste al puesto:</strong> promedio{" "}
          {Math.round(conFit.reduce((s, x) => s + x, 0) / conFit.length)}%, y{" "}
          {conFit.filter((f) => f >= 70).length} de {conFit.length} pasan el 70%.
        </p>
      )}

      {/* El perfil de la camada. Sirve para ver con qué tipo de gente se está
          quedando el aviso: si todos vienen bajos en el rasgo que más importa
          para el puesto, el problema está antes de la evaluación. */}
      {rasgos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-primary-dark">
            Perfil promedio del grupo
          </p>
          <div className="space-y-2 mt-2">
            {rasgos.map((r) => (
              <div key={r.key}>
                <div className="flex justify-between text-xs gap-3">
                  <span className="text-slate-700">{r.label}</span>
                  <span className="text-slate-500 shrink-0">
                    {r.promedio}%{" "}
                    <span className="text-slate-400">({r.n})</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${r.promedio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
