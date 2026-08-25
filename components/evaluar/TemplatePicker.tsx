"use client";

import { useState } from "react";
import { BookOpen, Brain, Check, Sparkles, Target, X } from "lucide-react";
import {
  ROLE_TEMPLATES,
  TEMPLATES,
  type Template,
} from "@/lib/evaluar/templates";

const FAMILY_ICON = {
  personalidad: Sparkles,
  laboral: Target,
  sjt: BookOpen,
  cognitivo: Brain,
} as const;

const FAMILY_LABEL = {
  personalidad: "Personalidad",
  laboral: "Competencias",
  sjt: "Juicio situacional",
  cognitivo: "Psicométrico",
} as const;

// Catálogo de tests listos. Cada uno se agrega como una etapa más del proceso,
// con sus preguntas ya cargadas: la empresa no tiene que redactar nada.
export default function TemplatePicker({
  pending,
  onPick,
  onPickRole,
}: {
  pending: boolean;
  onPick: (key: string) => void;
  onPickRole: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Template | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary press text-sm w-full"
      >
        <Sparkles size={15} /> Usar un test listo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-rise">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <h2 className="font-bold text-primary-dark">
            {detail ? detail.name : "Tests listos para usar"}
          </h2>
          <button
            onClick={() => (detail ? setDetail(null) : setOpen(false))}
            aria-label="Cerrar"
            className="w-9 h-9 grid place-items-center rounded-full text-slate-400 press"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {detail ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{detail.measures}</p>

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">
                  Qué mide, dimensión por dimensión
                </p>
                <ul className="space-y-1.5 mt-2">
                  {detail.dimensions.map((d) => (
                    <li key={d.key}>
                      <span className="font-medium text-slate-800">
                        {d.label}:
                      </span>{" "}
                      {d.high}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  <strong className="text-slate-700">
                    {detail.questions.length} preguntas
                  </strong>{" "}
                  · unos {detail.minutes} minutos ·{" "}
                  {detail.scored === "correcto"
                    ? "con respuestas correctas"
                    : "sin respuestas correctas"}
                </p>
                <p>{detail.source}</p>
              </div>

              {detail.scored === "dimension" && (
                <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2">
                  Este test describe estilos, no capacidad: no hay perfiles
                  buenos ni malos. Usalo como una entrada más de la decisión,
                  nunca como único filtro.
                </p>
              )}

              <button
                onClick={() => {
                  onPick(detail.key);
                  setDetail(null);
                  setOpen(false);
                }}
                disabled={pending}
                className="btn-primary press w-full"
              >
                <Check size={16} /> Agregar al proceso
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Proceso entero por rubro. Va primero porque a la mayoria le
                  alcanza con esto y no tiene que decidir nada. */}
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Proceso completo por puesto
              </p>
              {ROLE_TEMPLATES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    onPickRole(r.key);
                    setOpen(false);
                  }}
                  disabled={pending}
                  className="w-full text-left card press p-4 flex gap-3 border-primary/30"
                >
                  <span className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 grid place-items-center text-lg">
                    {r.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="font-semibold text-primary-dark block">
                      {r.name}
                    </span>
                    <span className="block text-xs text-slate-600 mt-0.5">
                      {r.summary}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      Filtro del puesto + {r.stages.length} tests, listo para
                      publicar
                    </span>
                  </span>
                </button>
              ))}

              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 pt-3">
                O un test suelto
              </p>
              {TEMPLATES.map((t) => {
                const Icon = FAMILY_ICON[t.family];
                return (
                  <button
                    key={t.key}
                    onClick={() => setDetail(t)}
                    className="w-full text-left card press p-4 flex gap-3"
                  >
                    <span className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 text-primary grid place-items-center">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-primary-dark">
                          {t.name}
                        </span>
                        <span className="chip bg-slate-100 text-slate-500">
                          {FAMILY_LABEL[t.family]}
                        </span>
                      </span>
                      <span className="block text-xs text-slate-600 mt-1">
                        {t.summary}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-1">
                        {t.questions.length} preguntas · {t.minutes} min
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
