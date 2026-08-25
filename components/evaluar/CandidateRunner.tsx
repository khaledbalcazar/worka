"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Circle, XCircle } from "lucide-react";
import { startEvaluation, submitStage } from "@/app/evaluar/actions";
import { celebrate } from "@/lib/celebrate";

export type Evaluation = {
  participant: {
    id: string;
    full_name: string;
    status: string;
    stage_index: number;
    score: number | null;
    max_score: number | null;
    outcome_note: string | null;
    completed_at: string | null;
  };
  process: {
    id: string;
    title: string;
    description: string;
    closing_message: string;
    status: string;
    company: string | null;
  };
  stages: {
    id: string;
    title: string;
    description: string;
    kind: string;
    minutes: number;
    questions: {
      id: string;
      kind: "unica" | "multiple" | "texto" | "escala" | "numero" | "likert";
      text: string;
      options: string[];
    }[];
  }[];
  events: { kind: string; message: string; at: string }[];
};

export default function CandidateRunner({
  token,
  data,
}: {
  token: string;
  data: Evaluation;
}) {
  const router = useRouter();
  const { participant, process, stages, events } = data;
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(participant.status !== "invitado");
  const [pending, startTransition] = useTransition();

  const cerrado =
    participant.status === "descartado" ||
    participant.status === "completado" ||
    participant.status === "contratado";
  const stage = stages[participant.stage_index];

  const answered = stage?.questions.every(
    (q) => answers[q.id] !== undefined && answers[q.id] !== ""
  );

  function comenzar() {
    startTransition(async () => {
      await startEvaluation(token);
      setStarted(true);
      router.refresh();
    });
  }

  function enviar() {
    if (!stage) return;
    setError(null);
    startTransition(async () => {
      const result = await submitStage(token, stage.id, answers);
      if (!result.ok) {
        setError(result.error ?? "No pudimos guardar tus respuestas.");
        return;
      }
      setAnswers({});
      if (result.status === "completado") celebrate();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Encabezado: quién evalúa y para qué. */}
      <div className="card p-5 animate-rise">
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          {process.company ?? "Empresa"}
        </p>
        <h1 className="text-xl font-bold text-primary-dark mt-0.5">
          {process.title}
        </h1>
        {process.description && (
          <p className="text-sm text-slate-600 mt-2">{process.description}</p>
        )}
        <p className="text-sm text-slate-500 mt-3">
          Hola{participant.full_name ? `, ${participant.full_name}` : ""}. Esta
          es tu evaluación.
        </p>
      </div>

      {/* Mapa de etapas: se ve el proceso entero desde el principio, no de a
          una pantalla por vez. Saber cuánto falta es lo que evita abandonar. */}
      <div className="card p-5">
        <h2 className="font-semibold text-primary-dark text-sm">
          Tu proceso, paso a paso
        </h2>
        <ol className="mt-3 space-y-2.5">
          {stages.map((s, i) => {
            const hecha = i < participant.stage_index;
            const actual = i === participant.stage_index && !cerrado;
            return (
              <li key={s.id} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5">
                  {hecha ? (
                    <CheckCircle2 size={18} className="text-success" />
                  ) : actual ? (
                    <Circle size={18} className="text-primary fill-blue-100" />
                  ) : (
                    <Circle size={18} className="text-slate-300" />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm ${
                      hecha
                        ? "text-slate-400 line-through"
                        : actual
                          ? "font-semibold text-primary-dark"
                          : "text-slate-600"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> {s.minutes} min · {s.questions.length}{" "}
                    {s.questions.length === 1 ? "pregunta" : "preguntas"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Resultado cerrado */}
      {cerrado && (
        <div
          className={`card p-6 text-center animate-rise ${
            participant.status === "descartado"
              ? "bg-slate-50"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          {participant.status === "descartado" ? (
            <XCircle size={32} className="text-slate-400 mx-auto" />
          ) : (
            <CheckCircle2 size={32} className="text-success mx-auto" />
          )}
          <p className="font-bold text-primary-dark mt-2">
            {participant.status === "descartado"
              ? "Tu proceso terminó acá"
              : participant.status === "contratado"
                ? "¡Fuiste seleccionado/a!"
                : "Completaste la evaluación"}
          </p>
          <p className="text-sm text-slate-600 mt-1.5">
            {participant.outcome_note ||
              process.closing_message ||
              "La empresa está revisando. Te vamos a avisar por acá mismo."}
          </p>
          {participant.max_score ? (
            <p className="text-xs text-slate-500 mt-3">
              Tu puntaje: {participant.score}/{participant.max_score}
            </p>
          ) : null}
        </div>
      )}

      {/* Etapa en curso */}
      {!cerrado && stage && (
        <div className="card p-5">
          {!started ? (
            <div className="text-center py-2">
              <p className="font-semibold text-primary-dark">
                Cuando quieras, empezamos
              </p>
              <p className="text-sm text-slate-500 mt-1">
                La primera etapa te va a llevar unos {stage.minutes} minutos.
                Podés cortar y seguir después: se guarda lo que ya respondiste.
              </p>
              <button
                onClick={comenzar}
                disabled={pending}
                className="btn-primary press w-full mt-4 text-base py-3"
              >
                {pending ? "Abriendo…" : "Empezar evaluación"}
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Etapa {participant.stage_index + 1} de {stages.length}
              </p>
              <h2 className="font-bold text-primary-dark">{stage.title}</h2>
              {stage.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {stage.description}
                </p>
              )}

              <div className="space-y-5 mt-5">
                {stage.questions.map((q, i) => (
                  <div key={q.id}>
                    <p className="text-sm font-medium text-slate-800">
                      {i + 1}. {q.text}
                    </p>

                    {/* Escala de acuerdo. Se envía el número, no el texto:
                        la corrección del lado del servidor necesita el valor
                        para poder dar vuelta los ítems inversos. */}
                    {q.kind === "likert" && (
                      <div className="space-y-2 mt-2">
                        {q.options.map((o, oi) => {
                          const valor = oi + 1;
                          const elegido = answers[q.id] === valor;
                          return (
                            <button
                              key={o}
                              onClick={() =>
                                setAnswers((a) => ({ ...a, [q.id]: valor }))
                              }
                              className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border press transition-colors flex items-center gap-3 ${
                                elegido
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                                  elegido
                                    ? "border-white bg-white/30"
                                    : "border-slate-300"
                                }`}
                              />
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(q.kind === "unica" || q.kind === "multiple") && (
                      <div className="space-y-2 mt-2">
                        {q.options.map((o) => {
                          const elegido = answers[q.id] === o;
                          return (
                            <button
                              key={o}
                              onClick={() =>
                                setAnswers((a) => ({ ...a, [q.id]: o }))
                              }
                              className={`w-full text-left text-sm px-4 py-3 rounded-xl border press transition-colors ${
                                elegido
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.kind === "texto" && (
                      <textarea
                        className="input min-h-24 mt-2"
                        placeholder="Escribí tu respuesta"
                        value={(answers[q.id] as string) ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                      />
                    )}

                    {q.kind === "escala" && (
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [q.id]: n }))
                            }
                            className={`flex-1 min-h-11 rounded-xl border font-semibold press ${
                              answers[q.id] === n
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.kind === "numero" && (
                      <input
                        type="number"
                        className="input mt-2"
                        value={(answers[q.id] as number) ?? ""}
                        onChange={(e) =>
                          setAnswers((a) => ({
                            ...a,
                            [q.id]: Number(e.target.value),
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-4">
                  {error}
                </p>
              )}

              <button
                onClick={enviar}
                disabled={pending || !answered}
                className="btn-primary press w-full mt-5 text-base py-3 disabled:opacity-40"
              >
                {pending
                  ? "Enviando…"
                  : participant.stage_index + 1 >= stages.length
                    ? "Terminar evaluación"
                    : "Siguiente etapa"}
              </button>
              {!answered && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Respondé todas las preguntas para continuar.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Línea de tiempo: la transparencia hecha pantalla. */}
      {events.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-primary-dark text-sm">
            Lo que pasó hasta ahora
          </h2>
          <ol className="mt-3 space-y-2">
            {events.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <span className="min-w-0">
                  <span className="text-slate-700">{e.message}</span>
                  <span className="block text-xs text-slate-400">
                    {new Date(e.at).toLocaleDateString("es-PY", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Guardá este enlace: es tu acceso a esta evaluación. No hace falta crear
        ninguna cuenta.
      </p>
    </div>
  );
}
