"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { CITIES } from "@/lib/mock-data";

const SUGGESTIONS = [
  "Cajero/a",
  "Cajero/a de supermercado",
  "Administrativo/a",
  "Asistente administrativo",
  "Repartidor/a",
  "Recepcionista",
  "Operario/a de planta",
  "Atención al cliente",
  "Vendedor/a",
  "Mozo/a",
  "Cocinero/a",
  "Chofer",
  "Guardia de seguridad",
  "Auxiliar de limpieza",
];

// Cada chip se traduce a un filtro real del feed de empleos.
const FILTER_CHIPS: { label: string; param: string; value: string }[] = [
  { label: "Primer empleo", param: "primerEmpleo", value: "1" },
  { label: "Tiempo completo", param: "contrato", value: "Tiempo completo" },
  { label: "Medio tiempo", param: "contrato", value: "Medio tiempo" },
  { label: "Presencial", param: "modalidad", value: "Presencial" },
  { label: "Por turnos", param: "contrato", value: "Por turnos" },
  { label: "Remoto", param: "modalidad", value: "Remoto" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState<string[]>([]);

  const matches = q.trim()
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  function toggleChip(label: string) {
    setChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function search() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("ciudad", city);
    // Los chips activos se mandan como filtros del feed.
    for (const label of chips) {
      const chip = FILTER_CHIPS.find((c) => c.label === label);
      if (chip) params.set(chip.param, chip.value);
    }
    router.push(`/empleos${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-col sm:flex-row bg-white rounded-2xl border border-primary-dark/10 shadow-[0_12px_40px_rgba(27,37,89,0.10)] overflow-hidden">
        <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5">
          <Search size={17} className="text-gray-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Cargo, empresa o rubro…"
            aria-label="Buscar empleo"
            className="w-full bg-transparent border-0 outline-none text-sm text-primary-dark placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3.5 border-t sm:border-t-0 sm:border-l border-primary-dark/10">
          <MapPin size={15} className="text-primary shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Ciudad"
            className="w-full sm:w-40 bg-transparent border-0 outline-none text-sm text-primary-dark cursor-pointer"
          >
            <option value="">Toda ciudad</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={search}
          className="w-full sm:w-auto bg-primary text-white font-bold text-sm px-7 py-3.5 flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          Buscar <ArrowRight size={15} />
        </button>
      </div>

      {/* Autocompletado */}
      {open && matches.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-primary-dark/10 shadow-[0_16px_44px_rgba(27,37,89,0.16)] overflow-hidden z-30">
          {matches.map((m) => (
            <button
              key={m}
              onMouseDown={() => {
                setQ(m);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-primary/5 transition-colors"
            >
              <Search size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-primary-dark">{m}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chips de filtro rápido */}
      <div className="flex flex-wrap gap-2 mt-4">
        {FILTER_CHIPS.map((c) => {
          const on = chips.includes(c.label);
          return (
            <button
              key={c.label}
              onClick={() => toggleChip(c.label)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3.5 py-1.5 border transition-all ${
                on
                  ? "bg-primary text-white border-primary font-semibold"
                  : "bg-white text-gray-500 border-primary-dark/10 hover:border-primary/40"
              }`}
            >
              {on && <CheckCircle size={12} />}
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
