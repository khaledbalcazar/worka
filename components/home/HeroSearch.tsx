"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
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

export default function HeroSearch({ cities = CITIES }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);

  const matches = q.trim()
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  function search() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("ciudad", city);
    router.push(`/empleos${params.size ? `?${params}` : ""}`);
  }

  return (
    <div data-search className="relative w-full" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3.5 min-h-12 rounded-md bg-[#edf3f8] border border-transparent focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_0_0_1px_#0a66c2]">
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
            className="w-full min-w-0 bg-transparent border-0 outline-none text-base text-ink placeholder:text-[#56687a]"
          />
        </div>

        <div className="flex items-center gap-2 px-3.5 min-h-12 rounded-md bg-[#edf3f8] border border-transparent focus-within:bg-white focus-within:border-primary focus-within:shadow-[0_0_0_1px_#0a66c2]">
          <MapPin size={17} className="text-muted shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Ciudad"
            className="w-full bg-transparent border-0 outline-none text-base text-ink cursor-pointer"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={search}
          className="w-full sm:w-auto sm:justify-self-start bg-primary text-white font-semibold text-base px-8 min-h-12 rounded-full flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <Search size={17} />
          <span>Buscar</span>
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
    </div>
  );
}
