"use client";

import { useEffect, useRef, useState } from "react";

// Gráficos del backoffice en SVG, sin librerías: son pocos y simples, y una
// dependencia de gráficos pesaría más que todo el panel.
//
// Reglas (skill de visualización): un solo eje por gráfico, barras finas con
// la punta redondeada y la base recta, líneas de 2px, grilla en gris de un
// paso, el texto siempre en tinta (nunca del color de la serie) y tooltip al
// pasar el mouse. La paleta está validada para daltonismo sobre blanco; los
// tonos claros (aqua, amarillo, magenta) van siempre con etiqueta visible.

export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
const GRID = "#ebe9e6";
const INK_2 = "#52514e";
const INK_3 = "#767676";

// Compacto y en formato local: 4,8 k · 6,9 M (coma decimal, como en Paraguay).
export function compact(n: number): string {
  const f = (v: number, d: number) => v.toLocaleString("es-PY", { maximumFractionDigits: d });
  if (Math.abs(n) >= 1_000_000) return `${f(n / 1_000_000, 1)} M`;
  if (Math.abs(n) >= 1_000) return `${f(n / 1_000, Math.abs(n) >= 10_000 ? 0 : 1)} k`;
  return f(n, 0);
}

export function gs(n: number): string {
  return `Gs. ${Math.round(n).toLocaleString("es-PY")}`;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// Escala «linda»: un paso redondo (1, 2 o 5 × 10^n, nunca menos de 1 porque
// casi todo son conteos) y el máximo como múltiplo de ese paso. Así el eje
// marca 0 · 10 · 20 · 30 · 40 y no 0 · 12,5 · 25 · 37,5.
function niceScale(v: number): { max: number; ticks: number[] } {
  const raw = Math.max(v, 1) / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const n = raw / p;
  const step = Math.max(1, (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p);
  const max = Math.max(step, Math.ceil(Math.max(v, 1) / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= max + step / 2; t += step) ticks.push(t);
  return { max, ticks };
}

// Barra vertical con la punta redondeada (4px) y la base recta.
function colPath(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

type Tip = { x: number; y: number; html: React.ReactNode } | null;

/* ── Columnas (apiladas si hay varias series) ─────────────────────────── */

export function Columns({
  labels,
  series,
  height = 220,
  format = compact,
  every = 5,
}: {
  labels: string[];
  series: { name: string; color: string; values: number[] }[];
  height?: number;
  format?: (n: number) => string;
  // Cada cuántas columnas se rotula el eje X.
  every?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 40, r: 8, t: 10, b: 24 };
  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((s, se) => s + (se.values[i] ?? 0), 0));
  const { max, ticks } = niceScale(Math.max(...totals, 1));
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const band = n ? innerW / n : 0;
  const barW = Math.max(2, Math.min(24, band * 0.62));
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;

  let tip: Tip = null;
  if (hover !== null && width) {
    const x = pad.l + band * hover + band / 2;
    tip = {
      x,
      y: y(totals[hover]),
      html: (
        <>
          <b>{labels[hover]}</b>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <i style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
              {s.name}: <b>{format(s.values[hover] ?? 0)}</b>
            </div>
          ))}
          {series.length > 1 && <div>Total: <b>{format(totals[hover])}</b></div>}
        </>
      ),
    };
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={series.map((s) => s.name).join(" y ")}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK_3}>
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => {
            let acc = 0;
            const x = pad.l + band * i + (band - barW) / 2;
            return (
              <g key={l + i} opacity={hover === null || hover === i ? 1 : 0.45}>
                {series.map((s, si) => {
                  const v = s.values[i] ?? 0;
                  const top = y(acc + v);
                  const bottom = y(acc);
                  acc += v;
                  // 2px de separación entre segmentos apilados.
                  const h = bottom - top - (si > 0 && v > 0 ? 2 : 0);
                  const isTop = series.slice(si + 1).every((o) => !(o.values[i] > 0));
                  return v > 0 ? (
                    isTop ? (
                      <path key={s.name} d={colPath(x, top, barW, Math.max(1, h))} fill={s.color} />
                    ) : (
                      <rect key={s.name} x={x} y={top} width={barW} height={Math.max(1, h)} fill={s.color} />
                    )
                  ) : null;
                })}
                {(i % every === 0 || i === n - 1) && (
                  <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize={11} fill={INK_3}>
                    {l}
                  </text>
                )}
              </g>
            );
          })}
          {/* Zona de hover más ancha que la barra. */}
          {labels.map((l, i) => (
            <rect
              key={`h-${i}`}
              x={pad.l + band * i}
              y={pad.t}
              width={band}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
      )}
      {tip && (
        <div className="ad-chart-tip" style={{ left: Math.min(Math.max(tip.x - 70, 0), width - 160), top: Math.max(0, tip.y - 70) }}>
          {tip.html}
        </div>
      )}
    </div>
  );
}

/* ── Línea con área ──────────────────────────────────────────────────── */

export function Line({
  labels,
  values,
  name,
  color = SERIES[0],
  height = 220,
  format = compact,
  every = 5,
}: {
  labels: string[];
  values: number[];
  name: string;
  color?: string;
  height?: number;
  format?: (n: number) => string;
  every?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 40, r: 14, t: 12, b: 24 };
  const n = values.length;
  const { max, ticks } = niceScale(Math.max(...values, 1));
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1));
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `M${x(0)},${y(0)} L${pts.replace(/ /g, " L")} L${x(n - 1)},${y(0)} Z`;
  const last = n - 1;

  function move(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && n > 0 && (
        <svg width={width} height={height} role="img" aria-label={name}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK_3}>
                {format(t)}
              </text>
            </g>
          ))}
          <path d={area} fill={color} opacity={0.1} />
          <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {labels.map((l, i) =>
            i % every === 0 || i === last ? (
              <text key={l + i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill={INK_3}>
                {l}
              </text>
            ) : null
          )}
          {/* Valor del último punto, rotulado directo. */}
          <circle cx={x(last)} cy={y(values[last])} r={4} fill={color} stroke="#fff" strokeWidth={2} />
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke={INK_3} strokeWidth={1} />
              <circle cx={x(hover)} cy={y(values[hover])} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            </g>
          )}
          <rect x={pad.l} y={pad.t} width={innerW} height={innerH} fill="transparent" onMouseMove={move} onMouseLeave={() => setHover(null)} />
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div className="ad-chart-tip" style={{ left: Math.min(Math.max(x(hover) - 60, 0), width - 140), top: Math.max(0, y(values[hover]) - 56) }}>
          <b>{labels[hover]}</b>
          <div>
            {name}: <b>{format(values[hover])}</b>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Barras horizontales (rankings y repartos) ───────────────────────── */

export function HBars({
  items,
  color = SERIES[0],
  format = (n: number) => n.toLocaleString("es-PY"),
  total,
  escala,
}: {
  items: { label: string; value: number }[];
  color?: string;
  format?: (n: number) => string;
  // Si viene, se muestra también el porcentaje sobre este total.
  total?: number;
  /** Tope fijo de la escala (por ejemplo 5 en un promedio de 1 a 5). Sin
   *  esto la barra más larga ocupa todo el ancho y un 3 parece un 5. */
  escala?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = escala ?? Math.max(...items.map((i) => i.value), 1);
  if (items.length === 0) return <p className="text-sm text-[#767676] py-6 text-center">Todavía no hay datos.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const pct = total ? Math.round((it.value / Math.max(total, 1)) * 100) : null;
        return (
          <li
            key={it.label}
            className="grid grid-cols-[minmax(84px,34%)_1fr_auto] items-center gap-3 text-[13px]"
            onMouseEnter={() => setHover(it.label)}
            onMouseLeave={() => setHover(null)}
            title={`${it.label}: ${format(it.value)}${pct !== null ? ` (${pct}%)` : ""}`}
          >
            <span className="truncate text-[#404040]">{it.label}</span>
            <span className="h-[14px] rounded-[0_4px_4px_0] bg-[#f3f2f0] overflow-hidden">
              <span
                className="block h-full rounded-[0_4px_4px_0] transition-[width] duration-500"
                style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: color, opacity: hover && hover !== it.label ? 0.5 : 1 }}
              />
            </span>
            <span className="font-semibold text-[#1d2226] tabular-nums text-right">
              {format(it.value)}
              {pct !== null && <span className="font-normal text-[#767676]"> · {pct}%</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Dona (repartos de pocas categorías) ─────────────────────────────── */

export function Donut({
  items,
  colors = SERIES,
  center,
  size = 168,
}: {
  items: { label: string; value: number }[];
  colors?: string[];
  center?: { value: string; label: string };
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={items.map((i) => `${i.label} ${i.value}`).join(", ")} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f2f0" strokeWidth={20} />
        {total > 0 &&
          items.map((it, i) => {
            const len = (it.value / total) * c;
            // 2px de aire entre porciones.
            const gap = items.filter((x) => x.value > 0).length > 1 ? 2 : 0;
            const el = (
              <circle
                key={it.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={hover === i ? 24 : 20}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-acc}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "stroke-width .15s" }}
              >
                <title>{`${it.label}: ${it.value.toLocaleString("es-PY")} (${Math.round((it.value / total) * 100)}%)`}</title>
              </circle>
            );
            acc += len;
            return el;
          })}
        {center && (
          <>
            <text x="50%" y="47%" textAnchor="middle" fontSize={22} fontWeight={600} fill="#1d2226">
              {hover !== null ? items[hover].value.toLocaleString("es-PY") : center.value}
            </text>
            <text x="50%" y="60%" textAnchor="middle" fontSize={11} fill={INK_2}>
              {hover !== null ? items[hover].label : center.label}
            </text>
          </>
        )}
      </svg>
      <ul className="space-y-1.5 text-[13px] w-full">
        {items.map((it, i) => (
          <li
            key={it.label}
            className={`flex items-center gap-2 ${hover !== null && hover !== i ? "opacity-60" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <i className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="flex-1 truncate text-[#404040]">{it.label}</span>
            <span className="font-semibold tabular-nums">{it.value.toLocaleString("es-PY")}</span>
            <span className="w-10 text-right text-[#767676] tabular-nums">{total ? Math.round((it.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Sparkline para las tarjetas de indicadores ──────────────────────── */

export function Spark({ values, color = SERIES[0] }: { values: number[]; color?: string }) {
  const w = 96;
  const h = 28;
  const max = Math.max(...values, 1);
  const n = values.length;
  const pts = values.map((v, i) => `${(i / Math.max(n - 1, 1)) * (w - 4) + 2},${h - 3 - (v / max) * (h - 6)}`).join(" ");
  return (
    <svg width={w} height={h} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
