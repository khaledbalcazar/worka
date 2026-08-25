"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, MessageSquarePlus, Trophy, UserX } from "lucide-react";
import type { BoardData } from "@/lib/evaluar";
import { addNote, setParticipantStatus } from "@/app/evaluar/actions";
import { StatusChip } from "./ProcessEditor";

// Tablero de decisión: los candidatos lado a lado con su evidencia.
//
// La comparación es el momento en que se decide de verdad, y en casi todos los
// sistemas hay que abrir una ficha por persona y recordar lo anterior de
// memoria. Acá se ven juntos, con el puntaje por etapa y las notas del equipo,
// y cada decisión deja registrado por qué.
export default function DecisionBoard({ board }: { board: BoardData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [pending, startTransition] = useTransition();

  const rendidos = board.candidates.filter((c) => c.percent !== null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(r.error ?? "Ocurrió un error.");
    });
  }

  if (board.candidates.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-semibold text-primary-dark">
          Todavía no hay a quién comparar
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Cuando alguien rinda la evaluación vas a poder verlos acá lado a lado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary-dark">
          Tablero de decisión
        </h1>
        <p className="text-sm text-slate-500">
          {rendidos.length} de {board.candidates.length} rindieron. Ordenados
          por desempeño.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Comparativa lado a lado: se desplaza de costado en celular. */}
      <div className="overflow-x-auto scroll-thin -mx-4 px-4">
        <div className="flex gap-3 min-w-min pb-2">
          {board.candidates.map((c, i) => {
            const lider = i === 0 && c.percent !== null;
            return (
              <div
                key={c.id}
                className={`card p-4 w-72 shrink-0 flex flex-col ${
                  lider ? "border-emerald-300 ring-1 ring-emerald-200" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary-dark truncate">
                      {c.full_name || "Sin nombre"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {c.source === "worka" ? "Desde Worka" : "Invitado"}
                    </p>
                  </div>
                  {lider && (
                    <Trophy size={16} className="text-amber-500 shrink-0" />
                  )}
                </div>

                <div className="mt-3">
                  {c.percent !== null ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-primary-dark leading-none">
                          {c.percent}
                          <span className="text-base">%</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          {c.score}/{c.max_score} pts
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full animate-fill ${
                            c.percent >= 70
                              ? "bg-success"
                              : c.percent >= 40
                                ? "bg-primary"
                                : "bg-warning"
                          }`}
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Sin rendir todavía</p>
                  )}
                </div>

                <div className="mt-3">
                  <StatusChip status={c.status} />
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Etapa {Math.min(c.stage_index + 1, board.stages.length || 1)}{" "}
                  de {board.stages.length}
                  {c.answers.length > 0 &&
                    ` · ${c.answers.length} respuestas`}
                </p>

                {c.outcome_note && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 mt-2">
                    {c.outcome_note}
                  </p>
                )}

                {/* Notas del equipo: la memoria compartida de la decisión. */}
                {c.notes.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {c.notes.slice(0, 3).map((n) => (
                      <li
                        key={n.id}
                        className="text-xs text-slate-600 bg-blue-50/60 rounded-xl px-3 py-2"
                      >
                        {n.body}
                      </li>
                    ))}
                  </ul>
                )}

                {noteFor === c.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="input min-h-16 text-sm"
                      placeholder="Qué observaste de esta persona…"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNoteFor(null)}
                        className="btn-secondary press text-xs flex-1"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          run(() =>
                            addNote(board.process.id, c.id, noteText)
                          );
                          setNoteText("");
                          setNoteFor(null);
                        }}
                        disabled={pending || !noteText.trim()}
                        className="btn-primary press text-xs flex-1 disabled:opacity-40"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setNoteFor(c.id)}
                    className="text-xs text-primary font-medium mt-3 flex items-center gap-1"
                  >
                    <MessageSquarePlus size={13} /> Agregar nota
                  </button>
                )}

                <div className="flex gap-2 mt-auto pt-4">
                  <button
                    onClick={() =>
                      run(() =>
                        setParticipantStatus(
                          board.process.id,
                          c.id,
                          "descartado"
                        )
                      )
                    }
                    disabled={pending || c.status === "descartado"}
                    className="btn-secondary press text-xs flex-1 disabled:opacity-40"
                  >
                    <UserX size={13} /> Descartar
                  </button>
                  <button
                    onClick={() =>
                      run(() =>
                        setParticipantStatus(
                          board.process.id,
                          c.id,
                          c.status === "finalista" ? "contratado" : "finalista"
                        )
                      )
                    }
                    disabled={pending || c.status === "contratado"}
                    className="btn-primary press text-xs flex-1 disabled:opacity-40"
                  >
                    <Award size={13} />
                    {c.status === "finalista" ? "Contratar" : "Finalista"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Cada decisión que tomás acá le llega al candidato en su línea de tiempo,
        con el motivo que escribas. Nadie queda esperando sin respuesta.
      </p>
    </div>
  );
}
