"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, CalendarClock, Copy, Link2, Search, Users } from "lucide-react";
import type { ProcessRow } from "@/lib/evaluar";
import type { PanelCharts } from "@/lib/evaluar/panel-charts";
import { duplicateProcess, setProcessArchived } from "@/app/evaluar/actions";
import { StatusChip } from "@/components/evaluar/PanelHome";

// Lista de procesos: todos, con búsqueda, filtro por estado y el avance de
// cada uno en una sola fila. El inicio muestra solo los recientes.

type Filter = "todos" | "activo" | "borrador" | "cerrado" | "archivados";

export default function ProcessList({
  processes,
  progress,
  initialQuery,
}: {
  processes: ProcessRow[];
  progress: PanelCharts["perProcess"];
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("todos");
  const [error, setError] = useState<string | null>(null);
  const [saving, start] = useTransition();
  const byId = useMemo(() => new Map(progress.map((p) => [p.id, p])), [progress]);

  const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const counts = {
    todos: processes.filter((p) => !p.archived).length,
    activo: processes.filter((p) => !p.archived && p.status === "activo").length,
    borrador: processes.filter((p) => !p.archived && p.status === "borrador").length,
    cerrado: processes.filter((p) => !p.archived && p.status === "cerrado").length,
    archivados: processes.filter((p) => p.archived).length,
  };
  const visible = processes.filter((p) => {
    if (filter === "archivados" ? !p.archived : p.archived) return false;
    if (filter !== "todos" && filter !== "archivados" && p.status !== filter) return false;
    const q = norm(query.trim());
    return !q || norm(`${p.title} ${p.job?.title ?? ""} ${p.org_unit ?? ""} ${p.department ?? ""}`).includes(q);
  });

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(r.error ?? "Ocurrió un error.");
    });
  }

  const FILTERS: [Filter, string][] = [
    ["todos", "Todos"],
    ["activo", "Publicados"],
    ["borrador", "Borradores"],
    ["cerrado", "Cerrados"],
    ["archivados", "Archivados"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <label className="flex items-center gap-2 h-11 px-4 rounded-full border border-[#d6d3cf] bg-white flex-1 max-w-xl focus-within:border-[#0a66c2]">
          <Search size={17} className="text-slate-500" />
          <input
            className="flex-1 min-w-0 outline-none bg-transparent text-[15px]"
            placeholder="Buscar por nombre, vacante o sucursal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar procesos"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`chip min-h-9 px-3.5 border text-sm ${
                filter === key ? "bg-[#1d2226] text-white border-[#1d2226]" : "bg-white text-slate-700 border-[#e0dfdc] hover:border-slate-400"
              }`}
            >
              {label} <span className="opacity-70">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {visible.length === 0 ? (
        <div className="ev-panel text-center py-12">
          <p className="font-semibold text-primary-dark">{query ? "Ningún proceso coincide con la búsqueda" : "No hay procesos en esta vista"}</p>
          <p className="text-sm text-slate-500 mt-1">Probá con otro filtro o creá un proceso nuevo desde «Nuevo proceso».</p>
        </div>
      ) : (
        <div className="ev-panel !p-0 overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_120px_minmax(0,1.6fr)_150px] gap-4 px-5 py-3 border-b border-[#e0dfdc] ev-label">
            <span>Proceso</span>
            <span>Estado</span>
            <span>Avance de los candidatos</span>
            <span className="text-right">Acciones</span>
          </div>
          <ul className="divide-y divide-[#ebe9e6]">
            {visible.map((p) => {
              const pr = byId.get(p.id);
              const invited = pr?.invited ?? p.participant_count;
              const finished = pr?.finished ?? 0;
              const toReview = finished - (pr?.decided ?? 0);
              return (
                <li key={p.id} className="grid md:grid-cols-[minmax(0,2.2fr)_120px_minmax(0,1.6fr)_150px] gap-x-4 gap-y-2 px-5 py-4 items-center hover:bg-[#faf9f7]">
                  <div className="min-w-0">
                    <Link href={`/evaluar/app/procesos/${p.id}`} className="font-semibold text-primary-dark hover:text-primary">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {p.job ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Link2 size={12} /> {p.job.title}
                        </span>
                      ) : (
                        <span>Sin vacante enlazada</span>
                      )}
                      <span>
                        {p.stage_count} {p.stage_count === 1 ? "etapa" : "etapas"}
                      </span>
                      {p.deadline_at && p.status === "activo" && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock size={12} /> cierra el {new Date(p.deadline_at).toLocaleDateString("es-PY", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <StatusChip status={p.status} />
                  </div>
                  <div className="min-w-0">
                    {invited === 0 ? (
                      <p className="text-xs text-slate-500">Todavía sin candidatos</p>
                    ) : (
                      <>
                        <div className="h-2 rounded-full bg-[#ebe9e6] overflow-hidden flex" aria-hidden>
                          <span style={{ width: `${(finished / invited) * 100}%` }} className="bg-[#2a78d6]" />
                          <span style={{ width: `${(((pr?.started ?? 0) - finished) / invited) * 100}%` }} className="bg-[#b7d3f6]" />
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 flex flex-wrap gap-x-3">
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} /> {invited} {invited === 1 ? "candidato" : "candidatos"}
                          </span>
                          <span>{finished} terminaron</span>
                          {toReview > 0 && <span className="font-semibold text-amber-800">{toReview} para revisar</span>}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center md:justify-end gap-1">
                    {invited > 0 && (
                      <Link href={`/evaluar/app/procesos/${p.id}/tablero`} className="btn-secondary press text-xs !min-h-8 !px-3">
                        Decidir
                      </Link>
                    )}
                    <button
                      onClick={() => run(() => duplicateProcess(p.id))}
                      disabled={saving}
                      title="Duplicar con sus etapas y preguntas"
                      aria-label={`Duplicar ${p.title}`}
                      className="w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:text-primary hover:bg-slate-100"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => run(() => setProcessArchived(p.id, !p.archived))}
                      disabled={saving}
                      title={p.archived ? "Sacar del archivo" : "Archivar (no se borra nada)"}
                      aria-label={p.archived ? `Desarchivar ${p.title}` : `Archivar ${p.title}`}
                      className="w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:text-primary hover:bg-slate-100"
                    >
                      {p.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {saving && <p className="sr-only" role="status">Guardando…</p>}
    </div>
  );
}
