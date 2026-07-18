"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";

export default function TalentSearch({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [firstJobOnly, setFirstJobOnly] = useState(false);

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        if (city && c.location_city !== city) return false;
        if (industry && !c.preferences_industry.includes(industry))
          return false;
        if (firstJobOnly && !c.first_job_mode) return false;
        return true;
      }),
    [candidates, city, industry, firstJobOnly]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          🔎 Buscar talento
        </h1>
        <p className="text-sm text-gray-500">
          Candidatos que activaron &ldquo;visible para empresas&rdquo;. No
          esperes la postulación: contactalos vos.
        </p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select
          className="input w-44"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Toda ciudad</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input w-48"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">Todo rubro</option>
          {INDUSTRIES.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={firstJobOnly}
            onChange={(e) => setFirstJobOnly(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          ✨ Primer empleo
        </label>
        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} candidato{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                {c.full_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary-dark truncate">
                  {c.full_name}
                </p>
                <p className="text-xs text-gray-500">📍 {c.location_city}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.phone_verified && (
                <span className="chip bg-emerald-50 text-emerald-700">
                  ✓ WhatsApp
                </span>
              )}
              {c.identity_status === "verified" && (
                <span className="chip bg-blue-50 text-primary">
                  🪪 Identidad
                </span>
              )}
              {c.first_job_mode && (
                <span className="chip bg-purple-50 text-purple-700">
                  ✨ Primer empleo
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {c.preferences_industry.map((ind) => (
                <span key={ind} className="chip bg-surface text-gray-600">
                  {ind}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              {c.public_profile && (
                <Link
                  href={`/p/${c.id}`}
                  className="btn-secondary flex-1 text-xs"
                >
                  Ver perfil
                </Link>
              )}
              <a
                href={`https://wa.me/${c.phone_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hola ${c.full_name.split(" ")[0]}! Te encontramos en Worka y nos interesa tu perfil.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success flex-1 text-xs"
              >
                💬 Contactar
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-gray-400 lg:col-span-2 xl:col-span-3">
            No hay candidatos visibles con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
