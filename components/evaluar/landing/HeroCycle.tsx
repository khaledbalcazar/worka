"use client";

import { useEffect, useState } from "react";

// El ciclo completo de una persona en la empresa, de la vacante al
// desarrollo, dibujado como una rueda. La mitad izquierda es seleccionar y la
// derecha desarrollar: es la idea que Evaluar tiene que transmitir de un
// vistazo, que no es «un test» sino todo el recorrido.
//
// Es HTML y SVG, no una imagen: se ve nítido en cualquier pantalla, el texto
// se puede leer con lector de pantalla y las etapas se iluminan de a una.

type Etapa = { n: number; label: string; x: number; y: number; color: string };

const AZUL = "#0a66c2";
const VIOLETA = "#5d5294";

const ETAPAS: Etapa[] = [
  { n: 1, label: "Publicar", x: 31, y: 15, color: AZUL },
  { n: 2, label: "Atraer", x: 15, y: 33, color: AZUL },
  { n: 3, label: "Evaluar", x: 15, y: 67, color: AZUL },
  { n: 4, label: "Comparar", x: 31, y: 85, color: "#2f6ec4" },
  { n: 5, label: "Contratar", x: 50, y: 93, color: "#4660b8" },
  { n: 6, label: "Integrar", x: 69, y: 85, color: "#5a57a6" },
  { n: 7, label: "Desempeño", x: 85, y: 67, color: VIOLETA },
  { n: 8, label: "Autoevaluación", x: 85, y: 33, color: VIOLETA },
  { n: 9, label: "Potencial", x: 69, y: 15, color: VIOLETA },
];

export default function HeroCycle() {
  const [on, setOn] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setOn((i) => (i + 1) % ETAPAS.length), 1700);
    return () => clearInterval(id);
  }, []);

  const actual = ETAPAS[on];
  const lado = actual.n <= 5 ? "Seleccionar" : "Desarrollar";

  return (
    <div className="relative w-full max-w-[600px] mx-auto aspect-[6/5] text-[clamp(10px,2.4vw,14px)] select-none">
      {/* Órbita punteada y radios hacia cada etapa. */}
      <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full" aria-hidden preserveAspectRatio="none">
        <defs>
          <linearGradient id="evl-ring" x1="0" x2="1">
            <stop offset="0" stopColor={AZUL} stopOpacity=".55" />
            <stop offset="1" stopColor={VIOLETA} stopOpacity=".55" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="50" rx="42" ry="38" fill="none" stroke="url(#evl-ring)" strokeWidth=".35" strokeDasharray="1.2 2" className="evl-orbit" />
        <ellipse cx="60" cy="50" rx="30" ry="27" fill="none" stroke="#dcd8f2" strokeWidth=".3" />
        {ETAPAS.map((e) => (
          <line
            key={e.n}
            x1="60"
            y1="50"
            x2={e.x * 1.2}
            y2={e.y}
            stroke={e.n === actual.n ? e.color : "#d9d6ea"}
            strokeWidth={e.n === actual.n ? ".45" : ".25"}
            strokeDasharray=".8 1.2"
            style={{ transition: "stroke .4s" }}
          />
        ))}
      </svg>

      {/* Barra Seleccionar | Desarrollar. */}
      <div className="absolute left-[2%] right-[2%] top-1/2 -translate-y-1/2 h-[9%] flex rounded-full overflow-hidden shadow-[0_12px_28px_-12px_rgba(29,43,79,.45)]" aria-hidden>
        <div className="flex-1 flex items-center justify-start pl-[7%] text-white font-bold tracking-[.32em] text-[.85em]" style={{ background: `linear-gradient(90deg, #4a9be0, ${AZUL})` }}>
          SELECCIONAR
        </div>
        <div className="flex-1 flex items-center justify-end pr-[7%] text-white font-bold tracking-[.32em] text-[.85em]" style={{ background: `linear-gradient(90deg, #6a5fae, ${VIOLETA})` }}>
          DESARROLLAR
        </div>
      </div>

      {/* Centro: la marca, con un pulso. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[21%] aspect-square">
        <span className="absolute inset-0 rounded-full evl-pulse" style={{ background: "rgba(93,82,148,.22)" }} aria-hidden />
        <div className="relative w-full h-full rounded-full bg-white grid place-items-center shadow-[0_14px_34px_-10px_rgba(29,43,79,.5)] ring-[6px] ring-[#eef0fb]">
          <div className="text-center leading-none">
            <span className="block font-extrabold text-[1.9em] tracking-tight text-[#004e99]">
              W<span className="text-[#0a66c2]">.</span>
            </span>
            <span key={lado} className="block text-[.72em] font-semibold mt-1 animate-rise" style={{ color: actual.color }}>
              {lado}
            </span>
          </div>
        </div>
      </div>

      {/* Insignia de IA arriba. */}
      <div className="absolute left-1/2 top-[3%] -translate-x-1/2 evl-float">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-white font-bold text-[.85em]" style={{ background: "var(--evl-grad)" }}>
          ✦ IA
        </span>
      </div>

      {/* Etapas. */}
      <ol aria-label="El ciclo completo, de la vacante al desarrollo">
        {ETAPAS.map((e) => (
          <li key={e.n}>
            <span
              className={`evl-cycle-pill ${e.n === actual.n ? "is-on" : ""}`}
              style={{ left: `${e.x}%`, top: `${e.y}%`, ["--pill" as string]: e.color }}
            >
              {e.label}
            </span>
            <span
              className="evl-cycle-num text-[.85em]"
              style={{ left: `${50 + (e.x - 50) * 0.55}%`, top: `${50 + (e.y - 50) * 0.55}%`, color: e.n === actual.n ? e.color : undefined }}
              aria-hidden
            >
              {e.n}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
