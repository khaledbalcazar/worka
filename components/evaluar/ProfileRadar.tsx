import type { NormedDimension } from "@/lib/evaluar/report";

// Radar del perfil por rasgo, en SVG puro.
//
// Sin librería de gráficos a propósito. El informe se imprime y se guarda como
// PDF desde el navegador, y una librería que dibuja con canvas o que necesita
// JavaScript sale en blanco en el papel. Un SVG hecho a mano imprime igual que
// en pantalla, pesa nada y se puede pegar en un documento.
//
// El segundo polígono es el perfil ideal del puesto, cuando la empresa lo
// cargó: la lectura que importa no es "cuánto sacó" sino "cuánto se parece a
// lo que buscamos", y eso se ve de un vistazo cuando las dos formas se
// superponen.

const R = 96;
const CENTRO = 130;
const ANILLOS = [0.25, 0.5, 0.75, 1];

function punto(i: number, total: number, frac: number) {
  // Se arranca arriba y se gira en sentido horario, que es como se lee.
  const angulo = (-90 + (360 / total) * i) * (Math.PI / 180);
  return {
    x: CENTRO + Math.cos(angulo) * R * frac,
    y: CENTRO + Math.sin(angulo) * R * frac,
  };
}

function poligono(valores: number[]): string {
  return valores
    .map((v, i) => {
      const p = punto(i, valores.length, Math.max(0.04, v / 100));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

export default function ProfileRadar({
  dimensions,
  ideal,
}: {
  dimensions: NormedDimension[];
  /** Perfil ideal del puesto, con pesos de 1 a 3 por rasgo. */
  ideal?: Record<string, number>;
}) {
  // Con menos de tres ejes un radar es una línea: ahí no aporta nada y se deja
  // que manden las barras.
  if (dimensions.length < 3) return null;

  const dims = dimensions.slice(0, 8);
  const total = dims.length;
  const valores = dims.map((d) => d.pct);

  // El peso del perfil ideal va de 1 a 3; se lleva a porcentaje para poder
  // dibujarlo sobre los mismos ejes.
  const idealValores =
    ideal && dims.some((d) => (ideal[d.key] ?? 0) > 0)
      ? dims.map((d) => ((ideal[d.key] ?? 0) / 3) * 100)
      : null;

  return (
    <figure className="mt-4">
      <svg
        viewBox="0 0 260 260"
        className="w-full max-w-xs mx-auto"
        role="img"
        aria-label={`Perfil por rasgo: ${dims
          .map((d) => `${d.label} ${d.pct}%`)
          .join(", ")}`}
      >
        {/* Telaraña de fondo */}
        {ANILLOS.map((a) => (
          <polygon
            key={a}
            points={poligono(dims.map(() => a * 100))}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={a === 1 ? 1.2 : 0.8}
          />
        ))}

        {/* Ejes */}
        {dims.map((d, i) => {
          const p = punto(i, total, 1);
          return (
            <line
              key={d.key}
              x1={CENTRO}
              y1={CENTRO}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth={0.8}
            />
          );
        })}

        {/* Perfil ideal del puesto: punteado, detrás del real. */}
        {idealValores && (
          <polygon
            points={poligono(idealValores)}
            fill="#10b98118"
            stroke="#10b981"
            strokeWidth={1.4}
            strokeDasharray="4 3"
          />
        )}

        {/* Perfil del candidato */}
        <polygon
          points={poligono(valores)}
          fill="#6366f130"
          stroke="#6366f1"
          strokeWidth={1.8}
        />
        {valores.map((v, i) => {
          const p = punto(i, total, Math.max(0.04, v / 100));
          return (
            <circle
              key={dims[i].key}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill="#6366f1"
            />
          );
        })}

        {/* Etiquetas. Se alinean según de qué lado del círculo caen, si no
            las de la izquierda se salen del cuadro. */}
        {dims.map((d, i) => {
          const p = punto(i, total, 1.18);
          const anchor =
            Math.abs(p.x - CENTRO) < 12
              ? "middle"
              : p.x > CENTRO
                ? "start"
                : "end";
          return (
            <text
              key={d.key}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="8.5"
              fill="#475569"
            >
              {d.label.length > 18 ? d.label.slice(0, 17) + "…" : d.label}
            </text>
          );
        })}
      </svg>

      <figcaption className="flex justify-center gap-4 text-[11px] text-slate-500 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-indigo-500 inline-block" />
          Este candidato
        </span>
        {idealValores && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block border-dashed" />
            Lo que busca el puesto
          </span>
        )}
      </figcaption>
    </figure>
  );
}
