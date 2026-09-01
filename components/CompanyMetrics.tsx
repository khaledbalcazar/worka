"use client";

import { useMemo, useState } from "react";
import type { CompanyMetrics } from "@/lib/data";

/* Métricas de la empresa.
   El servidor manda medio año de postulaciones y acá se recorta según el
   período elegido. Cambiar de período no vuelve a consultar la base. */

const RANGOS = [
  { v: 28, l: "4 sem." },
  { v: 84, l: "12 sem." },
  { v: 182, l: "6 meses" },
] as const;

const DIA = 86400000;

// Paleta fija por posición: si el color de un área dependiera del nombre,
// cambiaría cada vez que la empresa publica en un rubro nuevo.
const COLORES = [
  "#8b5cf6",
  "#2563eb",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
];

// Un decimal, con coma. En Paraguay 12.9 se lee como doce mil novecientos.
function pct(x: number) {
  return x.toFixed(1).replace(".", ",");
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[.07em] uppercase text-slate-400">
      {children}
    </p>
  );
}

function Tarjeta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export default function CompanyMetricsView({ data }: { data: CompanyMetrics }) {
  /* data.now es el instante en que el servidor armó estos datos. Todos los
     cortes de período se miden contra él y no contra el reloj del navegador:
     el componente se dibuja de los dos lados, y con dos relojes las semanas
     del borde podían caer distinto en el HTML y al hidratar. */
  const desdeMs = data.now;
  const [dias, setDias] = useState<number>(84);

  const m = useMemo(() => {
    const corte = desdeMs - dias * DIA;
    const apps = data.applications.filter(
      (a) => new Date(a.at).getTime() >= corte
    );

    // Período anterior del mismo largo, para la comparación.
    const previas = data.applications.filter((a) => {
      const t = new Date(a.at).getTime();
      return t >= corte - dias * DIA && t < corte;
    }).length;

    const contactados = apps.filter((a) => a.status === "Contactado").length;

    // Semanas del gráfico. Se arma el eje completo aunque una semana venga
    // vacía: si solo se dibujaran las semanas con postulaciones, un mes sin
    // movimiento se vería como una línea continua y no como el bache que es.
    const semanas = Math.ceil(dias / 7);
    const barras = Array.from({ length: semanas }, (_, i) => {
      const fin = desdeMs - (semanas - 1 - i) * 7 * DIA;
      const ini = fin - 7 * DIA;
      return {
        n: apps.filter((a) => {
          const t = new Date(a.at).getTime();
          return t >= ini && t < fin;
        }).length,
        etiqueta: new Date(fin).toLocaleDateString("es-PY", {
          day: "2-digit",
          month: "short",
        }),
      };
    });

    const porRubro = new Map<string, number>();
    for (const a of apps)
      porRubro.set(a.industry, (porRubro.get(a.industry) ?? 0) + 1);
    const rubros = [...porRubro.entries()]
      .map(([rubro, n]) => ({ rubro, n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);

    return {
      apps: apps.length,
      previas,
      contactados,
      barras,
      rubros,
      maxRubro: Math.max(...rubros.map((r) => r.n), 1),
    };
  }, [data.applications, dias, desdeMs]);

  const delta =
    m.previas === 0
      ? null
      : Math.round(((m.apps - m.previas) / m.previas) * 100);

  // Conversión: postulaciones sobre vistas. Las vistas que guardamos son las
  // acumuladas de cada vacante desde que se publicó, así que esta tasa es de
  // toda la vida de las vacantes y no del período elegido. Se dice en el
  // subtítulo en lugar de dejar que se lea como si fuera del período.
  const conversion =
    data.totalViews > 0
      ? pct((data.applications.length / data.totalViews) * 100)
      : null;

  const maxSemana = Math.max(...m.barras.map((b) => b.n), 1);
  const W = 420;
  const H = 80;
  const pts: [number, number][] = m.barras.map((b, i) => [
    m.barras.length === 1 ? W / 2 : (i / (m.barras.length - 1)) * W,
    H - (b.n / maxSemana) * (H - 8),
  ]);
  const linea = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${linea} L ${W} ${H} L 0 ${H} Z`;

  const embudo = [
    { label: "Vistas", value: data.totalViews },
    { label: "Postulaciones", value: m.apps },
    { label: "Entrevistas agendadas", value: data.interviews },
    { label: "Contactados", value: m.contactados },
  ];

  const tarjetas = [
    {
      label: "Postulaciones",
      value: String(m.apps),
      pie:
        delta === null
          ? "sin período anterior con datos"
          : `${delta > 0 ? "+" : ""}${delta}% vs. período anterior`,
      accent: "#2563eb",
    },
    {
      label: "Tasa de conversión",
      value: conversion ? `${conversion}%` : "—",
      pie: conversion ? "vistas → postulación (histórico)" : "todavía sin vistas",
      accent: "#10b981",
    },
    {
      label: "Entrevistas agendadas",
      value: String(data.interviews),
      pie: "en todas tus vacantes",
      accent: "#8b5cf6",
    },
    {
      label: "Contactados",
      value: String(m.contactados),
      pie:
        m.apps > 0
          ? `${Math.round((m.contactados / m.apps) * 100)}% de los postulantes`
          : "en este período",
      accent: "#f59e0b",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Métricas</h1>
          <p className="text-sm text-slate-500">
            Cómo vienen rindiendo tus vacantes
          </p>
        </div>
        <div className="flex items-center p-0.5 rounded-lg gap-0.5 bg-slate-100">
          {RANGOS.map((r) => (
            <button
              key={r.v}
              onClick={() => setDias(r.v)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                dias === r.v
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {tarjetas.map((c) => (
          <Tarjeta key={c.label} className="p-4 lg:p-5 space-y-2">
            <div className="min-h-[26px]">
              <Rotulo>{c.label}</Rotulo>
            </div>
            <p className="font-mono-data font-bold text-[26px] lg:text-[28px] tracking-tight text-slate-900 leading-none">
              {c.value}
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: c.accent }}
            >
              {c.pie}
            </p>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta className="p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Postulaciones por semana
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Últimas {m.barras.length} semanas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded-full bg-blue-600" />
            <span className="text-xs text-slate-400">Postulaciones</span>
          </div>
        </div>
        {m.apps === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            No hubo postulaciones en este período.
          </p>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-20"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Postulaciones por semana: ${m.barras
                .map((b) => `${b.etiqueta} ${b.n}`)
                .join(", ")}`}
            >
              <defs>
                <linearGradient id="wk-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity=".01" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((p) => (
                <line
                  key={p}
                  x1="0"
                  y1={H * p}
                  x2={W}
                  y2={H * p}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              ))}
              <path d={area} fill="url(#wk-area)" />
              <path
                d={linea}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {pts.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#fff"
                  stroke="#2563eb"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="flex justify-between mt-2">
              {m.barras
                .filter(
                  (_, i) => i % Math.max(Math.ceil(m.barras.length / 5), 1) === 0
                )
                .map((b) => (
                  <span key={b.etiqueta} className="text-[9px] text-slate-300">
                    {b.etiqueta}
                  </span>
                ))}
            </div>
          </>
        )}
      </Tarjeta>

      <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
        <Tarjeta className="p-5 lg:p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Embudo de selección
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Cuánta gente queda en cada paso
          </p>
          <div className="space-y-3">
            {embudo.map((s, i) => {
              const anterior = i > 0 ? embudo[i - 1].value : 0;
              const paso =
                i > 0 && anterior > 0
                  ? pct((s.value / anterior) * 100)
                  : null;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{s.label}</span>
                    <span className="font-mono-data font-bold text-slate-800">
                      {s.value.toLocaleString("es-PY")}
                    </span>
                  </div>
                  {/* El ancho del escalón es fijo y decreciente: dibuja la
                      forma de embudo. El porcentaje que se lee adentro es el
                      real, del paso anterior a este. */}
                  <div
                    className="h-7 rounded-lg overflow-hidden bg-slate-50"
                    style={{ width: `${100 - i * 14}%` }}
                  >
                    <div
                      className="h-full w-full rounded-lg flex items-center px-2.5"
                      style={{
                        background: ["#dbeafe", "#93c5fd", "#60a5fa", "#2563eb"][
                          i
                        ],
                      }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: i === 3 ? "#fff" : "#1d4ed8" }}
                      >
                        {paso ? `${paso}%` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tarjeta>

        <Tarjeta className="p-5 lg:p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Postulaciones por rubro
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            En qué rubro se te postula más
          </p>
          {m.rubros.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              Sin postulaciones en este período.
            </p>
          ) : (
            <div className="space-y-4">
              {m.rubros.map((d, i) => (
                <div key={d.rubro} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium w-20 lg:w-24 shrink-0 truncate text-slate-500"
                    title={d.rubro}
                  >
                    {d.rubro}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.n / m.maxRubro) * 100}%`,
                        background: COLORES[i % COLORES.length],
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-xs font-bold w-8 text-right text-slate-800">
                    {d.n}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
