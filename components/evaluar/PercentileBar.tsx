import type { NormedDimension } from "@/lib/evaluar/report";

// Dónde cae el candidato dentro de la población, dibujado como una campana.
//
// Un "percentil 85" no le dice nada a quien no trabaja con estadística todos
// los días, y quien decide una contratación casi nunca lo hace. La campana con
// la marca encima se entiende sin explicación: se ve que hay mucha gente en el
// medio, poca en las puntas, y dónde cayó esta persona.
//
// SVG a mano por lo mismo que el radar: el informe se imprime.

/** Cuántos quedan por debajo, en palabras. */
export function bandaDe(percentile: number): {
  label: string;
  tono: string;
} {
  if (percentile >= 90)
    return { label: "Muy por encima del promedio", tono: "text-emerald-700" };
  if (percentile >= 70)
    return { label: "Por encima del promedio", tono: "text-emerald-700" };
  if (percentile >= 31)
    return { label: "En el promedio", tono: "text-slate-600" };
  if (percentile >= 11)
    return { label: "Por debajo del promedio", tono: "text-amber-700" };
  return { label: "Muy por debajo del promedio", tono: "text-amber-700" };
}

// Curva normal aproximada, dibujada como camino relleno.
function campana(ancho: number, alto: number): string {
  const puntos: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * ancho;
    // z de -3 a 3 sobre el ancho, y la normal estándar escalada al alto.
    const z = (i / 60) * 6 - 3;
    const y = alto - Math.exp(-(z * z) / 2) * alto * 0.94;
    puntos.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M0,${alto} L${puntos.join(" L")} L${ancho},${alto} Z`;
}

export default function PercentileBar({ d }: { d: NormedDimension }) {
  if (d.percentile === null) return null;

  const ANCHO = 220;
  const ALTO = 44;
  const x = (d.percentile / 100) * ANCHO;
  const banda = bandaDe(d.percentile);

  return (
    <div className="mt-1.5">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO + 12}`}
        className="w-full max-w-[220px]"
        role="img"
        aria-label={`Percentil ${d.percentile} en ${d.label}: ${banda.label}`}
      >
        <path d={campana(ANCHO, ALTO)} fill="#e0e7ff" />

        {/* Los cuartos, para dar referencia sin llenar de números. */}
        {[25, 50, 75].map((p) => (
          <line
            key={p}
            x1={(p / 100) * ANCHO}
            y1={0}
            x2={(p / 100) * ANCHO}
            y2={ALTO}
            stroke="#c7d2fe"
            strokeWidth={0.7}
          />
        ))}
        <line
          x1={0}
          y1={ALTO}
          x2={ANCHO}
          y2={ALTO}
          stroke="#94a3b8"
          strokeWidth={0.8}
        />

        {/* Dónde cayó esta persona */}
        <line
          x1={x}
          y1={2}
          x2={x}
          y2={ALTO}
          stroke="#4338ca"
          strokeWidth={2}
        />
        <circle cx={x} cy={2} r={3.2} fill="#4338ca" />
        <text
          x={Math.min(Math.max(x, 16), ANCHO - 16)}
          y={ALTO + 10}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="600"
          fill="#4338ca"
        >
          P{d.percentile}
        </text>
      </svg>

      <p className="text-[11px] mt-0.5">
        <span className={`font-semibold ${banda.tono}`}>{banda.label}</span>
        <span className="text-slate-400">
          {" — "}más alto que el {d.percentile}% de {d.sample} evaluados.
        </span>
      </p>
    </div>
  );
}
