"use client";

import { useState, useTransition } from "react";
import type { KanbanApplicant } from "@/lib/data";
import type { JobWithCompany, RejectionReason } from "@/lib/types";
import {
  proposeInterview,
  setApplicationNote,
  setApplicationStatus,
} from "@/app/actions";
import { timeAgo } from "@/lib/format";

type Column = "Nuevos" | "En proceso" | "Descartados";

type Item = KanbanApplicant & { column: Column };

const COLUMNS: Column[] = ["Nuevos", "En proceso", "Descartados"];

const REJECTION_REASONS: RejectionReason[] = [
  "Buscamos más experiencia",
  "Puesto cubierto",
  "Perfil distinto al buscado",
];

function initialColumn(status: string): Column {
  if (status === "Pendiente") return "Nuevos";
  if (status === "Rechazado") return "Descartados";
  return "En proceso";
}

export default function ApplicantsKanban({
  job,
  applicants,
  companyName,
}: {
  job: JobWithCompany;
  applicants: KanbanApplicant[];
  companyName: string;
}) {
  const [items, setItems] = useState<Item[]>(
    applicants.map((a) => ({ ...a, column: initialColumn(a.status) }))
  );
  const [toast, setToast] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [detail, setDetail] = useState<Item | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewAt, setInterviewAt] = useState("");
  const [interviewPlace, setInterviewPlace] = useState("");
  const [interviewSent, setInterviewSent] = useState(false);
  const [, startTransition] = useTransition();

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function moveTo(appId: string, column: Column, reason?: RejectionReason) {
    const item = items.find((a) => a.id === appId);
    if (!item || item.column === column) return;

    // Descartar requiere elegir motivo (el candidato lo ve en su timeline).
    if (column === "Descartados" && !reason) {
      setRejecting(appId);
      return;
    }

    const fromNew = item.column === "Nuevos";
    setItems((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, column } : a))
    );
    setRejecting(null);

    const status =
      column === "Descartados"
        ? "Rechazado"
        : column === "En proceso"
          ? item.status === "Contactado"
            ? "Contactado"
            : "Revisado"
          : "Pendiente";

    startTransition(async () => {
      await setApplicationStatus(appId, status, reason);
    });

    // Primera vez que sale de "Nuevos": alerta de WhatsApp al candidato.
    if (fromNew && column === "En proceso") {
      showToast(
        `📲 Le avisamos a ${item.candidate_name} por WhatsApp que revisaste su perfil.`
      );
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-primary-dark text-white text-sm rounded-xl px-4 py-3 shadow-lg max-w-sm">
          {toast}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colItems = items.filter((a) => a.column === col);
          return (
            <section
              key={col}
              className="bg-gray-100/80 rounded-2xl p-3 min-h-40"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragged) moveTo(dragged, col);
                setDragged(null);
              }}
            >
              <h2 className="text-sm font-semibold text-gray-600 px-2 py-1 flex items-center justify-between">
                {col}
                <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-400">
                  {colItems.length}
                </span>
              </h2>
              <div className="space-y-2 mt-2">
                {colItems.map((a) => (
                  <article
                    key={a.id}
                    draggable
                    onDragStart={() => setDragged(a.id)}
                    className={`card p-4 cursor-grab active:cursor-grabbing ${
                      dragged === a.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        className="text-left"
                        onClick={() => {
                          setDetail(a);
                          setNoteDraft(a.internal_note);
                          setNoteSaved(false);
                          setInterviewOpen(false);
                          setInterviewSent(false);
                        }}
                        title="Ver detalle del candidato"
                      >
                        <p className="font-semibold text-primary-dark text-sm hover:text-primary">
                          {a.candidate_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.candidate_city} · {timeAgo(a.applied_at)}
                        </p>
                      </button>
                      {a.answers_total > 0 && (
                        <span
                          className={`chip ${
                            a.answers_ok === a.answers_total
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                          title="Respuestas correctas a tus preguntas de filtro"
                        >
                          {a.answers_ok}/{a.answers_total} ✓
                        </span>
                      )}
                    </div>

                    {rejecting === a.id ? (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs font-medium text-gray-600">
                          Motivo del descarte (el candidato lo ve):
                        </p>
                        {REJECTION_REASONS.map((r) => (
                          <button
                            key={r}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-200 hover:border-danger hover:bg-red-50"
                            onClick={() => moveTo(a.id, "Descartados", r)}
                          >
                            {r}
                          </button>
                        ))}
                        <button
                          className="w-full text-xs text-gray-400 py-1"
                          onClick={() => setRejecting(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        {col === "Nuevos" && (
                          <button
                            className="btn-secondary flex-1 text-xs min-h-9"
                            onClick={() => moveTo(a.id, "En proceso")}
                          >
                            Ver perfil
                          </button>
                        )}
                        {col !== "Descartados" && (
                          <a
                            href={`https://wa.me/${a.candidate_phone}?text=${encodeURIComponent(
                              `Hola ${a.candidate_name.split(" ")[0]}! Te escribimos de ${companyName} por tu postulación a "${job.title}" en Worka.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-success flex-1 text-xs min-h-9"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                        {col !== "Descartados" ? (
                          <button
                            className="btn-danger-outline text-xs min-h-9 px-3"
                            onClick={() => moveTo(a.id, "Descartados")}
                          >
                            ✕
                          </button>
                        ) : (
                          <button
                            className="btn-secondary flex-1 text-xs min-h-9"
                            onClick={() => moveTo(a.id, "En proceso")}
                          >
                            Recuperar
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
                {colItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Arrastrá candidatos acá
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        💡 Al mover un candidato a &ldquo;En proceso&rdquo; por primera vez, le
        avisamos por WhatsApp que su perfil fue revisado.
      </p>

      {/* Detalle del candidato */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
                {detail.candidate_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="font-bold text-primary-dark">
                  {detail.candidate_name}
                </h3>
                <p className="text-sm text-gray-500">
                  📍 {detail.candidate_city} · Postuló{" "}
                  {timeAgo(detail.applied_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="bg-surface rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Preguntas de filtro
                </p>
                <p
                  className={`text-sm font-semibold mt-0.5 ${
                    detail.answers_total > 0 &&
                    detail.answers_ok === detail.answers_total
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {detail.answers_total > 0
                    ? `${detail.answers_ok}/${detail.answers_total} correctas`
                    : "Sin preguntas"}
                </p>
              </div>
              <div className="bg-surface rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Estado
                </p>
                <p className="text-sm font-semibold text-primary-dark mt-0.5">
                  {detail.status}
                </p>
              </div>
            </div>

            {/* Nota interna del reclutador */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                📝 Nota interna (solo la ve tu equipo)
              </p>
              <textarea
                className="input min-h-16 text-sm"
                placeholder="Ej: Buen perfil, llamar el lunes…"
                value={noteDraft}
                onChange={(e) => {
                  setNoteDraft(e.target.value);
                  setNoteSaved(false);
                }}
              />
              <div className="flex justify-end mt-1">
                <button
                  className="text-xs text-primary font-medium"
                  onClick={() =>
                    startTransition(async () => {
                      await setApplicationNote(detail.id, noteDraft);
                      setNoteSaved(true);
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === detail.id
                            ? { ...x, internal_note: noteDraft }
                            : x
                        )
                      );
                    })
                  }
                >
                  {noteSaved ? "✓ Guardada" : "Guardar nota"}
                </button>
              </div>
            </div>

            {/* Proponer entrevista */}
            {interviewSent ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 mt-2 animate-pop">
                📅 Entrevista propuesta. El candidato la confirma desde sus
                postulaciones y le llega la notificación.
              </p>
            ) : interviewOpen ? (
              <div className="mt-2 space-y-2 bg-surface rounded-xl p-3">
                <input
                  type="datetime-local"
                  className="input text-sm"
                  value={interviewAt}
                  onChange={(e) => setInterviewAt(e.target.value)}
                />
                <input
                  className="input text-sm"
                  placeholder="Lugar (ej: nuestra oficina, o videollamada)"
                  value={interviewPlace}
                  onChange={(e) => setInterviewPlace(e.target.value)}
                />
                <button
                  className="btn-primary w-full text-sm"
                  disabled={!interviewAt}
                  onClick={() =>
                    startTransition(async () => {
                      await proposeInterview(
                        detail.id,
                        interviewAt,
                        interviewPlace
                      );
                      setInterviewSent(true);
                      moveTo(detail.id, "En proceso");
                    })
                  }
                >
                  Proponer entrevista
                </button>
              </div>
            ) : (
              <button
                className="btn-secondary w-full mt-2 text-sm"
                onClick={() => setInterviewOpen(true)}
              >
                📅 Proponer entrevista
              </button>
            )}

            <div className="flex gap-2 mt-4">
              <button
                className="btn-secondary flex-1"
                onClick={() => setDetail(null)}
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/${detail.candidate_phone}?text=${encodeURIComponent(
                  `Hola ${detail.candidate_name.split(" ")[0]}! Te escribimos de ${companyName} por tu postulación a "${job.title}" en Worka.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success flex-1"
                onClick={() => {
                  moveTo(detail.id, "En proceso");
                  setDetail(null);
                }}
              >
                💬 Contactar
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
