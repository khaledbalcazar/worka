"use client";

import { useMemo, useState } from "react";
import type { EvaluarParticipant, ProcessDetail } from "@/lib/evaluar";
import { StatusChip } from "./ProcessEditor";

// Tablero por etapas: los candidatos en columnas según dónde están parados.
//
// Con una lista hay que leer estado por estado para darse cuenta de que hay
// quince personas trabadas en la etapa 2. Acá se ve de un vistazo dónde se
// atasca el proceso, que es la pregunta que la empresa se hace todos los días.
export default function CandidateBoard({ detail }: { detail: ProcessDetail }) {
  const [query, setQuery] = useState("");

  const columnas = useMemo(() => {
    const q = query.trim().toLowerCase();
    const gente = q
      ? detail.participants.filter((p) =>
          `${p.full_name} ${p.email ?? ""}`.toLowerCase().includes(q)
        )
      : detail.participants;

    // Una columna por etapa, más las dos de cierre. Quien fue descartado o
    // contratado sale del flujo y no debe ensuciar la etapa donde quedó.
    const cols: { key: string; title: string; people: EvaluarParticipant[] }[] =
      detail.stages.map((s, i) => ({
        key: s.id,
        title: `${i + 1}. ${s.title}`,
        people: [],
      }));
    cols.push({ key: "finalistas", title: "Finalistas", people: [] });
    cols.push({ key: "cerrados", title: "Cerrados", people: [] });

    for (const p of gente) {
      if (p.status === "descartado") {
        cols[cols.length - 1].people.push(p);
      } else if (p.status === "finalista" || p.status === "contratado") {
        cols[cols.length - 2].people.push(p);
      } else {
        const i = Math.min(p.stage_index, detail.stages.length - 1);
        if (i >= 0 && cols[i]) cols[i].people.push(p);
      }
    }
    return cols;
  }, [detail, query]);

  if (detail.stages.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">
          Agregá al menos una etapa para ver el tablero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        className="input bg-white"
        placeholder="Buscar por nombre o email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="overflow-x-auto scroll-thin -mx-4 px-4">
        <div className="flex gap-3 min-w-min pb-2">
          {columnas.map((col) => (
            <div key={col.key} className="w-60 shrink-0">
              <div className="flex items-baseline justify-between gap-2 px-1 pb-2">
                <p className="text-xs font-semibold text-slate-600 truncate">
                  {col.title}
                </p>
                <span className="text-xs text-slate-400 shrink-0">
                  {col.people.length}
                </span>
              </div>

              <div className="space-y-2">
                {col.people.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                    Nadie acá
                  </p>
                ) : (
                  col.people.map((p) => (
                    <div key={p.id} className="card p-3">
                      <p className="text-sm font-medium text-primary-dark truncate">
                        {p.full_name || "Sin nombre"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.source === "worka" ? "Desde Worka" : "Invitado"}
                        {p.score !== null && p.max_score
                          ? ` · ${Math.round((p.score / p.max_score) * 100)}%`
                          : ""}
                      </p>
                      <div className="mt-1.5">
                        <StatusChip status={p.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Para mover a alguien a finalista o descartarlo, entrá al tablero de
        decisión: ahí queda registrado el motivo y le llega al candidato.
      </p>
    </div>
  );
}
