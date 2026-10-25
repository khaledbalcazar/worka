"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";

// «Encontrá tu solución»: quien llega sabe qué problema tiene, no cómo se
// llama la sección. Elegir la necesidad lleva a la parte de la página que la
// responde.
const OPCIONES = [
  { id: "soluciones", label: "Quiero contratar mejor" },
  { id: "instrumentos", label: "Busco pruebas psicométricas listas" },
  { id: "ia", label: "Quiero que la IA me ayude a evaluar" },
  { id: "talento", label: "Quiero evaluar el desempeño de mi equipo" },
  { id: "candidato", label: "Quiero cuidar la experiencia del candidato" },
];

export default function SolutionPicker({ trialDays }: { trialDays: number }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Encontrá tu solución acá");

  function ir(id: string, l: string) {
    setLabel(l);
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="relative max-w-[480px]">
      <div className="rounded-[28px] bg-white shadow-[0_24px_50px_-24px_rgba(29,43,79,.35)] border border-[#ebe9f5] pb-9">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="w-full flex items-center justify-between gap-3 px-6 pt-5 pb-3 text-left text-[16.5px] text-[#1d2b4f]"
        >
          <span className="truncate">{label}</span>
          <ChevronDown size={18} className={`shrink-0 text-[#5d5294] transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <ul role="listbox" className="px-3 pb-2 animate-rise">
            {OPCIONES.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={label === o.label}
                  onClick={() => ir(o.id, o.label)}
                  className="w-full text-left text-[15px] px-3 py-2.5 rounded-xl text-[#404b63] hover:bg-[#f3f2fb] hover:text-[#5d5294]"
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href="/evaluar/app" className="evl-btn absolute left-6 right-6 -bottom-6 !py-3.5">
        <Sparkles size={16} /> Probalo gratis {trialDays} días, sin tarjeta
      </Link>
    </div>
  );
}
