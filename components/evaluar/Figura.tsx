"use client";

import { useId } from "react";
import {
  decodificar,
  describir,
  type FiguraSpec,
} from "@/lib/evaluar/figuras";

// Dibujo de los ítems figurales (matrices y series). El código de cada
// casilla lo arma lib/evaluar/figuras.ts; acá solo se traduce a SVG.
//
// Todo va en currentColor: la figura toma el color del texto de la tarjeta,
// así se ve igual en los tres temas de la evaluación y en el panel.

const CENTROS: Record<number, number[]> = { 1: [50], 2: [32, 68], 3: [21, 50, 79] };
const ESQUINA: Record<string, [number, number]> = {
  si: [15, 15],
  sd: [85, 15],
  id: [85, 85],
  ii: [15, 85],
};

function estrella(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function Figura({
  codigo,
  className = "w-full h-full",
  etiqueta = true,
}: {
  codigo: string;
  className?: string;
  /** false cuando quien la contiene ya lleva el aria-label. */
  etiqueta?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const c = decodificar(codigo);
  if (!c) return null;

  const rayado = `rayado-${id}`;
  const relleno =
    c.relleno === "lleno" ? "currentColor" : c.relleno === "rayado" ? `url(#${rayado})` : "none";
  const n = c.cantidad;
  const chico = n > 1 || c.tam === "c";
  const r = n === 3 ? 11 : n === 2 ? 14 : chico ? 17 : 26;

  const forma = (cx: number, k: number) => {
    const cy = 50;
    // La key va directo en cada elemento: React no la acepta dentro de un
    // objeto que se esparce.
    const comun = {
      fill: relleno,
      stroke: "currentColor",
      strokeWidth: 4,
      strokeLinejoin: "round" as const,
    };
    switch (c.forma) {
      case "circulo":
        return <circle key={k} {...comun} cx={cx} cy={cy} r={r} />;
      case "cuadrado":
        return <rect key={k} {...comun} x={cx - r} y={cy - r} width={r * 2} height={r * 2} />;
      case "rombo":
        return (
          <polygon key={k} {...comun} points={`${cx},${cy - r * 1.2} ${cx + r},${cy} ${cx},${cy + r * 1.2} ${cx - r},${cy}`} />
        );
      case "triangulo":
        return (
          <polygon
            key={k}
            {...comun}
            points={`${cx},${cy - r} ${cx + r * 1.1},${cy + r * 0.8} ${cx - r * 1.1},${cy + r * 0.8}`}
            transform={`rotate(${c.giro} ${cx} ${cy})`}
          />
        );
      case "linea":
        // 45° es "/" (sube hacia la derecha): en SVG la y crece hacia abajo,
        // así que el giro va con signo negativo.
        return (
          <line
            key={k}
            x1={14}
            y1={50}
            x2={86}
            y2={50}
            stroke="currentColor"
            strokeWidth={5}
            strokeLinecap="round"
            transform={`rotate(${-c.giro} 50 50)`}
          />
        );
      default:
        return null;
    }
  };

  const [mx, my] = ESQUINA[c.pos];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={etiqueta ? "img" : undefined}
      aria-label={etiqueta ? describir(codigo) : undefined}
      aria-hidden={etiqueta ? undefined : true}
    >
      <defs>
        <pattern id={rayado} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="2.5" />
        </pattern>
      </defs>
      {c.forma === "linea" ? forma(50, 0) : CENTROS[n].map((cx, k) => forma(cx, k))}
      {c.marca === "punto" && <circle cx={mx} cy={my} r={5} fill="currentColor" />}
      {c.marca === "cruz" && (
        <path
          d={`M${mx - 6},${my} H${mx + 6} M${mx},${my - 6} V${my + 6}`}
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      )}
      {c.marca === "estrella" && <polygon points={estrella(mx, my, 8)} fill="currentColor" />}
    </svg>
  );
}

// La consigna en figuras: una matriz 3×3 con la última casilla en blanco, o
// una fila de cuatro con un lugar al final. Las opciones las dibuja quien
// arma la pregunta (el runner o la demo), porque cada uno maneja su estado.
export function ConsignaFigural({ spec }: { spec: FiguraSpec }) {
  const esMatriz = spec.tipo === "matriz";
  const descripcion = esMatriz
    ? "Matriz de tres por tres. " +
      spec.celdas
        .map((cod, i) => `Fila ${Math.floor(i / 3) + 1}, casilla ${(i % 3) + 1}: ${describir(cod)}.`)
        .join(" ") +
      " Fila 3, casilla 3: vacía, es la que hay que completar."
    : "Serie de figuras. " +
      spec.celdas.map((cod, i) => `${i + 1}: ${describir(cod)}.`).join(" ") +
      " 5: vacía, es la que hay que completar.";

  return (
    <div
      role="img"
      aria-label={descripcion}
      className={`grid gap-0 border-2 border-current rounded-lg overflow-hidden mx-auto ${
        esMatriz ? "grid-cols-3 max-w-[15rem]" : "grid-cols-5 max-w-sm"
      }`}
    >
      {spec.celdas.map((cod, i) => (
        <div key={i} className="aspect-square border border-current/40 p-1.5">
          <Figura codigo={cod} etiqueta={false} />
        </div>
      ))}
      <div className="aspect-square border border-current/40 grid place-items-center text-2xl font-bold opacity-50">
        ?
      </div>
    </div>
  );
}
