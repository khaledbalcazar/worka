"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, CheckCircle } from "lucide-react";
import { CITIES } from "@/lib/mock-data";

type Props = { cities?: string[] };

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

export default function HeroSearch({ cities = CITIES }: Props) {
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
      prev.includes(label)
        ? prev.filter((c) => c !== label)
        : [...prev.filter((selected) =>
            FILTER_CHIPS.find((c) => c.label === selected)?.param !==
            FILTER_CHIPS.find((c) => c.label === label)?.param
          ), label]
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
    <div data-search className="relative w-full" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}>
      <div className="flex flex-col sm:flex-row gap-1.5 bg-white rounded-[10px] border border-line p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 min-h-12 rounded-md focus-within:ring-2 focus-within:ring-primary">
          <Search size={18} className="text-muted shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.closest("[data-search]")?.contains(e.relatedTarget)) setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Cargo, empresa o rubro…"
            aria-label="Buscar empleo"
            enterKeyHint="search"
            className="w-full min-w-0 bg-transparent border-0 outline-none text-base sm:text-[15px] text-ink placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-2 px-3 min-h-12 rounded-md border-t sm:border-t-0 sm:border-l sm:rounded-none border-line focus-within:ring-2 focus-within:ring-primary">
          <MapPin size={17} className="text-primary shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Ciudad"
            className="w-full sm:w-36 bg-transparent border-0 outline-none text-base sm:text-sm text-ink cursor-pointer"
          >
            <option value="">Toda ciudad</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={search}
          className="w-full sm:w-auto bg-primary text-white font-semibold text-[15px] px-7 min-h-12 rounded-full sm:rounded-md flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <Search size={17} />
          <span>
            Buscar<span className="sm:hidden xl:inline"> empleos</span>
          </span>
        </button>
      </div>

      {/* Autocompletado */}
      {open && matches.length > 0 && (
        <div className="absolute top-[calc(100%_+_6px)] left-0 right-0 bg-white rounded-lg border border-line shadow-[0_8px_24px_rgba(0,0,0,0.14)] overflow-hidden z-30">
          {matches.map((m) => (
            <button
              key={m}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ(m);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 text-left px-4 min-h-11 hover:bg-canvas transition-colors"
            >
              <Search size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-ink">{m}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chips de filtro rápido */}
      <div className="flex items-center gap-2 mt-3.5 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <span className="hidden sm:inline text-xs text-muted mr-1">Filtros rápidos:</span>
        {FILTER_CHIPS.map((c) => {
          const on = chips.includes(c.label);
          return (
            <button
              key={c.label}
              onClick={() => toggleChip(c.label)}
              aria-pressed={on}
              className={`inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium rounded-full px-3.5 min-h-9 border transition-colors ${
                on
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink border-[#c0bfbc] hover:border-ink"
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
