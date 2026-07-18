"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";

// Buscador del hero: lleva al feed con los filtros elegidos.
export default function LandingSearch({ jobsCount }: { jobsCount: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function search() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("ciudad", city);
    router.push(`/empleos${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto animate-fade-up">
      <div className="card p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 shadow-lg">
        <input
          type="search"
          className="input border-0 bg-surface flex-1"
          placeholder="¿Qué trabajo buscás? Ej: cajera, chofer, ventas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <select
          className="input border-0 bg-surface sm:w-44"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Toda ciudad</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="btn-primary sm:px-8" onClick={search}>
          Buscar
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        <span className="text-xs text-gray-400 py-1">Populares:</span>
        {INDUSTRIES.slice(0, 5).map((ind) => (
          <button
            key={ind}
            className="chip bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
            onClick={() => router.push(`/empleos?rubro=${encodeURIComponent(ind)}`)}
          >
            {ind}
          </button>
        ))}
        <span className="chip bg-purple-50 text-purple-700 border border-purple-100">
          ✨ {jobsCount > 0 ? `${jobsCount} vacantes hoy` : "Nuevas vacantes cada día"}
        </span>
      </div>
    </div>
  );
}
