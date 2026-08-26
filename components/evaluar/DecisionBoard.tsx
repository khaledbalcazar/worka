"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Download,
  Eye,
  EyeOff,
  FileText,
  MessageSquarePlus,
  Trophy,
  UserX,
} from "lucide-react";
import type { BoardData } from "@/lib/evaluar";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
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

  const [blind, setBlind] = useState(false);

  const rendidos = board.candidates.filter((c) => c.percent !== null);

  const funnel = {
    invitados: board.candidates.length,
    empezaron: board.candidates.filter((c) => c.status !== "invitado").length,
    terminaron: board.candidates.filter((c) =>
      ["completado", "finalista", "contratado"].includes(c.status)
    ).length,
  };

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-dark">
            Tablero de decisión
          </h1>
          <p className="text-sm text-slate-500">
            {rendidos.length} de {board.candidates.length} rindieron. Ordenados
            por {board.candidates.some((c) => c.fit !== null) ? "ajuste al puesto" : "desempeño"}.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Cribado ciego: oculta nombre y datos de contacto mientras se
              puntúa. El sesgo por nombre, edad o género es real y documentado;
              esconderlos durante la comparación es la forma más simple de
              recortarlo. */}
          <button
            onClick={() => setBlind((v) => !v)}
            className={`btn-secondary press text-xs ${blind ? "border-primary text-primary" : ""}`}
            title="Ocultar nombres para comparar sin sesgo"
          >
            {blind ? <EyeOff size={14} /> : <Eye size={14} />}
            {blind ? "Ciego" : "Cribado ciego"}
          </button>
          <a
            href={`/evaluar/app/procesos/${board.process.id}/export`}
            className="btn-secondary press text-xs"
          >
            <Download size={14} /> Excel
          </a>
        </div>
      </div>

      {/* Embudo: dice si la evaluación es demasiado larga. Si la mitad
          abandona en la etapa 2, el problema no son los candidatos. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 stagger">
        {[
          { label: "Invitados", value: funnel.invitados },
          { label: "Empezaron", value: funnel.empezaron },
          { label: "Terminaron", value: funnel.terminaron },
          {
            label: "Tasa de finalización",
            value: funnel.invitados
              ? `${Math.round((funnel.terminaron / funnel.invitados) * 100)}%`
              : "—",
          },
        ].map((s) => (
          <div key={s.label} className="card p-3.5">
            <p className="text-xl font-bold text-primary-dark leading-none">
              {s.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
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
                      {blind
                        ? `Candidato ${i + 1}`
                        : c.full_name || "Sin nombre"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {c.source === "worka" ? "Desde Worka" : "Invitado"}
                    </p>
                  </div>
                  {lider && (
                    <Trophy size={16} className="text-amber-500 shrink-0" />
                  )}
                </div>

                {/* Ajuste al perfil del puesto: cuando la empresa dijo que
                    importa, es el numero que manda y por el que se ordena. */}
                {c.fit !== null && (
                  <div className="mt-3 rounded-2xl bg-indigo-50 px-3 py-2">
                    <p className="text-[11px] text-indigo-700 font-semibold uppercase tracking-wide">
                      Ajuste al puesto
                    </p>
                    <p className="text-2xl font-bold text-indigo-900 leading-none mt-0.5">
                      {c.fit}%
                    </p>
                  </div>
                )}

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

                {/* Perfil por rasgo. Va sin colores de "bueno/malo" a
                    propósito: en personalidad no hay puntaje deseable, y
                    pintarlo de verde o rojo empujaría a leerlo como un examen
                    aprobado o reprobado. */}
                {Object.keys(c.profile).length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {Object.entries(c.profile).map(([key, v]) => {
                      const pct =
                        v.max > 0 ? Math.round((v.raw / v.max) * 100) : 0;
                      const dim = ALL_DIMENSIONS[key];
                      return (
                        <div key={key}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className="text-[11px] text-slate-600 truncate"
                              title={dim?.high}
                            >
                              {dim?.label ?? key}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-400 animate-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <button
                      onClick={() => setNoteFor(c.id)}
                      className="text-xs text-primary font-medium flex items-center gap-1"
                    >
                      <MessageSquarePlus size={13} /> Nota
                    </button>
                    <a
                      href={`/evaluar/app/procesos/${board.process.id}/informe/${c.id}`}
                      className="text-xs text-slate-500 font-medium flex items-center gap-1"
                    >
                      <FileText size={13} /> Informe
                    </a>
                  </div>
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

      <div className="text-xs text-slate-400 space-y-1.5">
        <p>
          Cada decisión que tomás acá le llega al candidato en su línea de
          tiempo, con el motivo que escribas. Nadie queda esperando sin
          respuesta.
        </p>
        {/* Los tests de personalidad describen estilos, no capacidad. Decirlo
            en la pantalla donde se decide es lo único que evita que el
            porcentaje se lea como una nota de examen. */}
        <p>
          Las barras de rasgos describen <strong>estilos de trabajo</strong>, no
          capacidad: no hay perfiles buenos ni malos, y un porcentaje alto no
          significa mejor candidato. Usalas junto a la entrevista y la
          experiencia, nunca como único filtro.
        </p>
      </div>
    </div>
  );
}
