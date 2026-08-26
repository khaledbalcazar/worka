"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock,
  FileUp,
  TimerReset,
  XCircle,
} from "lucide-react";
import {
  saveDraft,
  saveParticipantProfile,
  startEvaluation,
  submitStage,
  uploadParticipantCv,
  uploadVideoAnswer,
} from "@/app/evaluar/actions";
import VideoAnswer from "./VideoAnswer";
import { celebrate } from "@/lib/celebrate";
import { getTheme, readableOn } from "@/lib/evaluar/themes";

export type Evaluation = {
  participant: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    cv_url: string | null;
    status: string;
    stage_index: number;
    score: number | null;
    max_score: number | null;
    draft: Record<string, unknown> | null;
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
    logo: string | null;
    theme: string | null;
    brand_color: string | null;
    deadline_at: string | null;
  };
  stages: {
    id: string;
    title: string;
    description: string;
    kind: string;
    minutes: number;
    timed?: boolean;
    /** Que es esta etapa y que se espera, en criollo. */
    intro?: string;
    /** Ejemplo resuelto, para ver el formato sin que corra el reloj. */
    demo?: {
      text: string;
      options: string[];
      answer: string;
      explain: string;
    } | null;
    questions: {
      id: string;
      kind:
        | "unica"
        | "multiple"
        | "texto"
        | "escala"
        | "numero"
        | "likert"
        | "video";
      /** Tope de grabacion, solo para las de video. */
      max_seconds?: number;
      text: string;
      options: string[];
    }[];
  }[];
  events: { kind: string; message: string; at: string }[];
};

export default function CandidateRunner({
  token,
  data,
  vencido,
}: {
  token: string;
  data: Evaluation;
  /** El plazo lo evalua el servidor: la hora del navegador es del usuario. */
  vencido: boolean;
}) {
  const router = useRouter();
  const { participant, process, stages, events } = data;

  const theme = getTheme(process.theme);
  const accent = process.brand_color?.trim() || theme.accent;
  const onAccent = readableOn(accent);

  // El borrador vuelve del servidor: quien cerró la pestaña en la pregunta 20
  // la reencuentra donde la dejó.
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    (participant.draft as Record<string, unknown>) ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(participant.status !== "invitado");
  const [pending, startTransition] = useTransition();

  const cerrado =
    participant.status === "descartado" ||
    participant.status === "completado" ||
    participant.status === "contratado";
  const stage = stages[participant.stage_index];

  // Una pregunta por pantalla: en el celular una lista de 25 ítems desalienta
  // antes de empezar.
  const [qIndex, setQIndex] = useState(0);
  const question = stage?.questions[qIndex];
  const respondida =
    question !== undefined &&
    answers[question.id] !== undefined &&
    answers[question.id] !== "";
  const esUltima = stage ? qIndex >= stage.questions.length - 1 : false;


  const startedAtRef = useRef<number | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const enviarRef = useRef<(() => void) | null>(null);

  // Explicación de la etapa. Se muestra una vez por etapa, no una vez por
  // evaluación: la segunda prueba no se parece en nada a la primera, y quien
  // ya entendió los Cinco Grandes no sabe todavía qué es un dominó.
  const [briefingListo, setBriefingListo] = useState<string | null>(null);
  const verBriefing =
    started && !!stage && !!stage.intro && briefingListo !== stage.id;

  useEffect(() => {
    // El cronómetro arranca recién cuando se cerró la explicación. Si no,
    // leer las instrucciones sale del tiempo de la prueba, que es exactamente
    // el apuro que la explicación venía a sacar.
    if (!started || !stage || verBriefing) return;
    const inicio = Date.now();
    startedAtRef.current = inicio;
    if (!stage.timed) return;

    const total = stage.minutes * 60;
    queueMicrotask(() => setLeft(total));
    const id = setInterval(() => {
      const queda = total - Math.round((Date.now() - inicio) / 1000);
      if (queda <= 0) {
        clearInterval(id);
        setLeft(0);
        enviarRef.current?.();
      } else {
        setLeft(queda);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [started, stage, verBriefing]);

  function responder(value: unknown) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    // Se guarda en el momento, no al final de la etapa: si se corta la
    // conexión no se pierde lo ya contestado.
    void saveDraft(token, next);
  }

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
    const seconds = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : undefined;
    startTransition(async () => {
      const result = await submitStage(token, stage.id, answers, seconds);
      if (!result.ok) {
        setError(result.error ?? "No pudimos guardar tus respuestas.");
        return;
      }
      setAnswers({});
      setQIndex(0);
      if (result.status === "completado") celebrate();
      router.refresh();
    });
  }
  useEffect(() => {
    enviarRef.current = enviar;
  });

  return (
    <div className={`min-h-screen ${theme.page}`}>
      {/* Cabecera con la marca de la empresa: el candidato tiene que sentir
          que está con el empleador, no en una plataforma ajena. */}
      <header className={theme.header}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          {process.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={process.logo}
              alt={process.company ?? ""}
              className="w-10 h-10 rounded-xl object-contain bg-white shrink-0"
            />
          ) : (
            <span
              className="w-10 h-10 rounded-xl grid place-items-center font-bold shrink-0"
              style={{ background: accent, color: onAccent }}
            >
              {(process.company ?? "W")[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">
              {process.company ?? "Evaluación"}
            </p>
            <p className="text-xs opacity-70 truncate">{process.title}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Aviso de plazo */}
        {process.deadline_at && !cerrado && (
          <p
            className={`text-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 ${
              vencido
                ? "bg-red-50 text-danger"
                : "bg-white border border-slate-200 " + theme.muted
            }`}
          >
            <CalendarClock size={15} className="shrink-0" />
            {vencido
              ? "El plazo para completar esta evaluación ya venció."
              : `Tenés tiempo hasta el ${new Date(process.deadline_at).toLocaleDateString("es-PY", { day: "numeric", month: "long" })}.`}
          </p>
        )}

        {/* Mapa de etapas */}
        <div className={`${theme.card} p-5`}>
          <h1 className={`font-bold ${theme.heading}`}>
            Hola{participant.full_name ? `, ${participant.full_name}` : ""}
          </h1>
          {process.description && (
            <p className={`text-sm mt-1 ${theme.muted}`}>
              {process.description}
            </p>
          )}

          <ol className="mt-4 space-y-2.5">
            {stages.map((s, i) => {
              const hecha = i < participant.stage_index;
              const actual = i === participant.stage_index && !cerrado;
              return (
                <li key={s.id} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">
                    {hecha ? (
                      <CheckCircle2 size={18} style={{ color: accent }} />
                    ) : (
                      <Circle
                        size={18}
                        className={actual ? "" : "text-slate-300"}
                        style={actual ? { color: accent } : undefined}
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm ${
                        hecha
                          ? "line-through " + theme.muted
                          : actual
                            ? `font-semibold ${theme.heading}`
                            : theme.muted
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${theme.muted}`}>
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
          <div className={`${theme.card} p-6 text-center animate-rise`}>
            {participant.status === "descartado" ? (
              <XCircle size={32} className="text-slate-400 mx-auto" />
            ) : (
              <CheckCircle2 size={32} style={{ color: accent }} className="mx-auto" />
            )}
            <p className={`font-bold mt-2 ${theme.heading}`}>
              {participant.status === "descartado"
                ? "Tu proceso terminó acá"
                : participant.status === "contratado"
                  ? "¡Fuiste seleccionado/a!"
                  : "Completaste la evaluación"}
            </p>
            <p className={`text-sm mt-1.5 ${theme.muted}`}>
              {participant.outcome_note ||
                process.closing_message ||
                "La empresa está revisando. Te vamos a avisar por acá mismo."}
            </p>
          </div>
        )}

        {/* Datos y CV: el invitado no tiene cuenta de Worka, así que sus datos
            no salen de ningún lado si no se los pedimos. */}
        {!cerrado && started && (
          <CandidateData token={token} participant={participant} theme={theme} />
        )}

        {/* Etapa en curso */}
        {!cerrado && stage && !vencido && (
          <div className={`${theme.card} p-5`}>
            {!started ? (
              <div className="text-center py-2">
                <p className={`font-semibold ${theme.heading}`}>
                  Cuando quieras, empezamos
                </p>
                <p className={`text-sm mt-1 ${theme.muted}`}>
                  La primera etapa te va a llevar unos {stage.minutes} minutos.
                  Se guarda cada respuesta, así que podés cortar y seguir
                  después.
                </p>
                <button
                  onClick={comenzar}
                  disabled={pending}
                  className="w-full mt-4 text-base py-3 rounded-xl font-semibold press"
                  style={{ background: accent, color: onAccent }}
                >
                  {pending ? "Abriendo…" : "Empezar evaluación"}
                </button>
              </div>
            ) : verBriefing && stage.intro ? (
              <StageBriefing
                stage={stage}
                numero={participant.stage_index + 1}
                total={stages.length}
                theme={theme}
                accent={accent}
                onAccent={onAccent}
                onListo={() => setBriefingListo(stage.id)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.muted}`}>
                      Etapa {participant.stage_index + 1} de {stages.length}
                    </p>
                    <h2 className={`font-bold ${theme.heading}`}>
                      {stage.title}
                    </h2>
                  </div>
                  {left !== null && (
                    <span
                      className={`chip shrink-0 font-mono font-semibold ${
                        left <= 60
                          ? "bg-red-50 text-danger animate-beat"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <TimerReset size={13} />
                      {String(Math.floor(left / 60)).padStart(2, "0")}:
                      {String(left % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Progreso dentro de la etapa */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={theme.muted}>
                      Pregunta {qIndex + 1} de {stage.questions.length}
                    </span>
                    <span className={theme.muted}>
                      {Math.round(((qIndex + 1) / stage.questions.length) * 100)}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((qIndex + 1) / stage.questions.length) * 100}%`,
                        background: accent,
                      }}
                    />
                  </div>
                </div>

                {question && (
                  <div key={question.id} className="mt-5 animate-rise">
                    <p className={`text-base font-medium ${theme.heading}`}>
                      {question.text}
                    </p>

                    {(question.kind === "likert" ||
                      question.kind === "unica" ||
                      question.kind === "multiple") && (
                      <div className="space-y-2 mt-3">
                        {question.options.map((o, oi) => {
                          const valor =
                            question.kind === "likert" ? oi + 1 : o;
                          const elegido = answers[question.id] === valor;
                          return (
                            <button
                              key={o}
                              onClick={() => responder(valor)}
                              className="w-full text-left text-sm px-4 py-3 rounded-xl border press transition-colors flex items-center gap-3"
                              style={
                                elegido
                                  ? {
                                      background: accent,
                                      color: onAccent,
                                      borderColor: accent,
                                    }
                                  : { borderColor: "#e2e8f0" }
                              }
                            >
                              <span
                                className="w-5 h-5 rounded-full border-2 shrink-0"
                                style={{
                                  borderColor: elegido ? onAccent : "#cbd5e1",
                                  background: elegido
                                    ? "rgba(255,255,255,.35)"
                                    : "transparent",
                                }}
                              />
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {question.kind === "texto" && (
                      <textarea
                        className="input min-h-28 mt-3"
                        placeholder="Escribí tu respuesta"
                        value={(answers[question.id] as string) ?? ""}
                        onChange={(e) => responder(e.target.value)}
                      />
                    )}

                    {question.kind === "escala" && (
                      <div className="flex gap-2 mt-3">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const elegido = answers[question.id] === n;
                          return (
                            <button
                              key={n}
                              onClick={() => responder(n)}
                              className="flex-1 min-h-12 rounded-xl border font-semibold press"
                              style={
                                elegido
                                  ? {
                                      background: accent,
                                      color: onAccent,
                                      borderColor: accent,
                                    }
                                  : { borderColor: "#e2e8f0" }
                              }
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {question.kind === "numero" && (
                      <input
                        type="number"
                        className="input mt-3"
                        value={(answers[question.id] as number) ?? ""}
                        onChange={(e) => responder(Number(e.target.value))}
                      />
                    )}

                    {/* El video no pasa por `answers`: se sube apenas se
                        graba, con su propia acción. Meter un blob de treinta
                        megas en el estado de la etapa y mandarlo recién al
                        enviar sería jugarse toda la respuesta a que la
                        conexión aguante ese último tirón. */}
                    {question.kind === "video" && (
                      <div className="mt-3">
                        <VideoAnswer
                          maxSeconds={question.max_seconds ?? 90}
                          saved={!!answers[question.id]}
                          onUpload={async (blob) => {
                            const fd = new FormData();
                            fd.append(
                              "video",
                              blob,
                              blob.type === "video/mp4" ? "r.mp4" : "r.webm"
                            );
                            const r = await uploadVideoAnswer(
                              token,
                              question.id,
                              fd
                            );
                            // Se marca respondida para que el paso deje de
                            // pedirla y el borrador la recuerde al volver.
                            if (r.ok) responder("video");
                            return r;
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 mt-5">
                  {qIndex > 0 && (
                    <button
                      onClick={() => setQIndex((i) => i - 1)}
                      className="btn-secondary press shrink-0"
                      aria-label="Pregunta anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      esUltima ? enviar() : setQIndex((i) => i + 1)
                    }
                    disabled={pending || !respondida}
                    className="flex-1 text-base py-3 rounded-xl font-semibold press disabled:opacity-40"
                    style={{ background: accent, color: onAccent }}
                  >
                    {pending
                      ? "Enviando…"
                      : esUltima
                        ? participant.stage_index + 1 >= stages.length
                          ? "Terminar evaluación"
                          : "Terminar etapa"
                        : "Siguiente"}
                  </button>
                </div>
                {!respondida && (
                  <p className={`text-xs text-center mt-2 ${theme.muted}`}>
                    Elegí una respuesta para continuar.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Línea de tiempo */}
        {events.length > 0 && (
          <div className={`${theme.card} p-5`}>
            <h2 className={`font-semibold text-sm ${theme.heading}`}>
              Lo que pasó hasta ahora
            </h2>
            <ol className="mt-3 space-y-2">
              {events.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{ background: accent }}
                  />
                  <span className="min-w-0">
                    <span className={theme.heading}>{e.message}</span>
                    <span className={`block text-xs ${theme.muted}`}>
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

        <p className={`text-xs text-center ${theme.muted}`}>
          Guardá este enlace: es tu acceso a esta evaluación. Con tecnología de
          Worka.
        </p>
      </div>
    </div>
  );
}

// ── Datos de contacto y CV ─────────────────────────────────────

function CandidateData({
  token,
  participant,
  theme,
}: {
  token: string;
  participant: Evaluation["participant"];
  theme: ReturnType<typeof getTheme>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(participant.email ?? "");
  const [phone, setPhone] = useState(participant.phone ?? "");
  const [city, setCity] = useState(participant.city ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const completo = !!participant.email && !!participant.phone;

  function guardar() {
    setMsg(null);
    startTransition(async () => {
      const r = await saveParticipantProfile(token, { email, phone, city });
      setMsg(r.ok ? "Datos guardados." : (r.error ?? "No pudimos guardar."));
      if (r.ok) router.refresh();
    });
  }

  function subirCv(file: File | undefined) {
    if (!file) return;
    setMsg(null);
    const fd = new FormData();
    fd.append("cv", file);
    startTransition(async () => {
      const r = await uploadParticipantCv(token, fd);
      setMsg(r.ok ? "CV subido." : (r.error ?? "No pudimos subir el archivo."));
      if (r.ok) router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`${theme.card} p-4 w-full text-left press flex items-center gap-3`}
      >
        <FileUp size={18} className={theme.muted} />
        <span className="min-w-0">
          <span className={`block text-sm font-medium ${theme.heading}`}>
            {completo ? "Tus datos y tu CV" : "Completá tus datos de contacto"}
          </span>
          <span className={`block text-xs ${theme.muted}`}>
            {completo
              ? "Tocá para revisarlos o adjuntar tu CV."
              : "Así la empresa puede contactarte si avanzás."}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className={`${theme.card} p-5 space-y-3 animate-rise`}>
      <h2 className={`font-semibold text-sm ${theme.heading}`}>
        Tus datos de contacto
      </h2>
      <input
        className="input"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input"
        type="tel"
        placeholder="WhatsApp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        className="input"
        placeholder="Ciudad"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <label className="btn-secondary press w-full cursor-pointer">
        <FileUp size={15} />
        {participant.cv_url ? "Reemplazar mi CV (PDF)" : "Adjuntar mi CV (PDF)"}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => subirCv(e.target.files?.[0])}
        />
      </label>

      {msg && <p className={`text-sm ${theme.muted}`}>{msg}</p>}

      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="btn-secondary press flex-1">
          Cerrar
        </button>
        <button
          onClick={guardar}
          disabled={pending}
          className="btn-primary press flex-[2]"
        >
          {pending ? "Guardando…" : "Guardar datos"}
        </button>
      </div>
    </div>
  );
}

// Explicación de la etapa, antes de que corra el reloj.
//
// Antes el candidato entraba directo a una etapa llamada "Los Cinco Grandes" y
// no sabía si era un examen, cuánto duraba ni si se podía equivocar. Eso no
// mide lo que se quiere medir: mide cuánta ansiedad tolera alguien en los
// primeros dos minutos, que no es lo que la empresa está buscando.
//
// El ejemplo resuelto es la parte que más rinde. Explicar "es una escala del 1
// al 5" no sirve de nada; ver una pregunta contestada, con el por qué al lado,
// se entiende de una.
function StageBriefing({
  stage,
  numero,
  total,
  theme,
  accent,
  onAccent,
  onListo,
}: {
  stage: Evaluation["stages"][number];
  numero: number;
  total: number;
  theme: ReturnType<typeof getTheme>;
  accent: string;
  onAccent: string;
  onListo: () => void;
}) {
  const demo = stage.demo;

  return (
    <div className="animate-rise">
      <p
        className={`text-[11px] font-semibold uppercase tracking-wide ${theme.muted}`}
      >
        Etapa {numero} de {total}
      </p>
      <h2 className={`font-bold text-lg mt-0.5 ${theme.heading}`}>
        {stage.title}
      </h2>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="chip bg-slate-100 text-slate-600">
          <Clock size={13} /> {stage.minutes} min aprox.
        </span>
        <span className="chip bg-slate-100 text-slate-600">
          {stage.questions.length}{" "}
          {stage.questions.length === 1 ? "pregunta" : "preguntas"}
        </span>
        {/* Que haya o no reloj cambia por completo cómo se encara la prueba,
            así que se dice antes y no cuando ya está corriendo. */}
        <span
          className={`chip ${
            stage.timed
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {stage.timed ? (
            <>
              <TimerReset size={13} /> Con tiempo
            </>
          ) : (
            <>
              <CheckCircle2 size={13} /> Sin apuro
            </>
          )}
        </span>
      </div>

      <p className={`text-sm mt-4 leading-relaxed ${theme.muted}`}>
        {stage.intro}
      </p>

      {demo && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Así se ve
          </p>
          <p className="text-sm font-medium text-slate-800 mt-1.5">
            {demo.text}
          </p>

          <div className="space-y-1.5 mt-3">
            {demo.options.map((o) => {
              const correcta = o === demo.answer;
              return (
                <div
                  key={o}
                  className={`text-sm rounded-xl px-3 py-2 border flex items-start gap-2 ${
                    correcta
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {correcta ? (
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={15} className="shrink-0 mt-0.5 opacity-40" />
                  )}
                  <span>{o}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            <strong className="font-semibold">Por qué:</strong> {demo.explain}
          </p>
        </div>
      )}

      <button
        onClick={onListo}
        className="w-full mt-5 text-base py-3 rounded-xl font-semibold press"
        style={{ background: accent, color: onAccent }}
      >
        Entendí, empezar
      </button>

      {stage.timed && (
        <p className={`text-xs text-center mt-2 ${theme.muted}`}>
          El tiempo empieza a correr cuando toques el botón, no antes.
        </p>
      )}
    </div>
  );
}
