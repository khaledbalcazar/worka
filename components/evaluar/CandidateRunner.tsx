"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  CloudOff,
  ChevronLeft,
  Circle,
  Clock,
  FileUp,
  Loader2,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  TimerReset,
  XCircle,
} from "lucide-react";
import {
  beginStage,
  saveDraft,
  saveParticipantProfile,
  startEvaluation,
  submitStage,
  uploadParticipantCv,
  uploadVideoAnswer,
} from "@/app/evaluar/actions";
import VideoAnswer from "./VideoAnswer";
import { ConsignaFigural, Figura } from "./Figura";
import { describir, type FiguraSpec } from "@/lib/evaluar/figuras";
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
    /** Cuándo empezó la etapa en curso según el servidor (053). */
    stage_started_at?: string | null;
    stage_started_for?: string | null;
  };
  /** Hora del servidor al armar la página, para corregir el reloj local. */
  server_now?: string;
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
    /** Cuántas preguntas le tocan (056). Con azar, la lista llega recién al empezar. */
    question_count?: number;
    timed?: boolean;
    /** Que es esta etapa y que se espera, en criollo. */
    intro?: string;
    /** Ejemplo resuelto, para ver el formato sin que corra el reloj. */
    demo?: {
      text: string;
      options: string[];
      answer: string;
      explain: string;
      /** Ejemplo con figuras: las opciones son códigos de dibujo. */
      figure?: FiguraSpec;
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
        | "video"
        | "figura";
      /** Consigna dibujada, solo en las de tipo "figura". */
      figure?: FiguraSpec | null;
      /** Tope de grabacion, solo para las de video. */
      max_seconds?: number;
      text: string;
      options: string[];
    }[];
  }[];
  events: { kind: string; message: string; at: string }[];
};

export type WorkaConnect = {
  /** Pantalla de autorización en worka.click. */
  url: string;
  /** La ficha ya tiene los datos de una cuenta de Worka. */
  linked: boolean;
  /** Vuelve recién de autorizar: se le confirma con un aviso. */
  justConnected: boolean;
};

export default function CandidateRunner({
  token,
  data,
  vencido,
  workaConnect,
}: {
  token: string;
  data: Evaluation;
  /** El plazo lo evalua el servidor: la hora del navegador es del usuario. */
  vencido: boolean;
  workaConnect?: WorkaConnect;
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
  // Lo que dice la cabecera sobre el guardado: quien contesta en el celular
  // con mala señal necesita saber si lo último quedó o no.
  const [guardado, setGuardado] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // Hacia dónde se mueve la pregunta: la nueva entra desde la derecha al
  // avanzar y desde la izquierda al volver, como pasar páginas.
  const [dir, setDir] = useState<"next" | "prev">("next");
  // Pantalla de festejo entre etapas: sin ella, terminar una etapa y ver la
  // explicación de la siguiente se sentía como un salto sin aviso.
  const [etapaHecha, setEtapaHecha] = useState<{ titulo: string; numero: number } | null>(null);
  // Qué se está cargando, para mostrar una pantalla de espera con sentido.
  const [cargando, setCargando] = useState<null | "abrir" | "etapa" | "enviar">(null);
  const [aviso, setAviso] = useState<string | null>(
    workaConnect?.justConnected ? "Conectaste tu cuenta de Worka Empleos: tus datos y tu CV ya están cargados." : null
  );
  // El festejo entre etapas aparece donde estaba la pregunta, que en el
  // celular suele quedar abajo: se lo trae a la vista.
  const etapaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (etapaHecha) etapaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [etapaHecha]);
  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(id);
  }, [aviso]);
  const [pending, startTransition] = useTransition();

  const cerrado =
    participant.status === "descartado" ||
    participant.status === "completado" ||
    participant.status === "contratado";
  // El panel dice que sin publicar nadie puede rendir, y acá se dejaba rendir
  // igual: la etapa se mostraba con el proceso en borrador o ya cerrado.
  const abierto = process.status === "activo";
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


  // Al pasar de pregunta el foco va al enunciado: con lector de pantalla, si
  // no, el botón "Siguiente" queda con el foco y la pregunta nueva no se lee.
  const preguntaRef = useRef<HTMLParagraphElement | null>(null);
  const preguntaId = question?.id;
  useEffect(() => {
    if (preguntaId) preguntaRef.current?.focus();
  }, [preguntaId]);

  const startedAtRef = useRef<number | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const enviarRef = useRef<(() => void) | null>(null);
  // Una entrega por vez. El reloj que vence y el toque en "Terminar" podían
  // disparar dos envíos de la misma etapa; la base de la 053 ya no suma dos
  // veces, pero no hace falta mandarle el segundo.
  const enviandoRef = useRef(false);

  // Momento de inicio de la etapa, en el reloj de este navegador. Sale del
  // servidor (evaluar_begin_stage) para que recargar no reinicie el tiempo.
  const [inicio, setInicio] = useState<number | null>(null);
  const yaEmpezadaEnServidor =
    !!stage && participant.stage_started_for === stage.id;

  // Explicación de la etapa, una vez por etapa y SIEMPRE antes de que corra
  // el reloj. Antes solo aparecía si la etapa tenía texto de introducción: al
  // terminar una etapa, la siguiente prueba cronometrada arrancaba sola, sin
  // que la persona confirmara que estaba lista.
  const [briefingListo, setBriefingListo] = useState<string | null>(null);
  const verBriefing =
    started && !!stage && briefingListo !== stage.id && !yaEmpezadaEnServidor;

  const stageId = stage?.id;
  const stageTimed = !!stage?.timed;
  const stageMinutes = stage?.minutes ?? 0;

  // Retomar: si el servidor dice que esta etapa ya había empezado, el reloj
  // sigue desde esa hora y no desde que se abrió la página.
  useEffect(() => {
    if (!yaEmpezadaEnServidor || !participant.stage_started_at || !data.server_now)
      return;
    const desfase = Date.parse(data.server_now) - Date.now();
    const base = Date.parse(participant.stage_started_at) - desfase;
    queueMicrotask(() => setInicio(base));
  }, [yaEmpezadaEnServidor, participant.stage_started_at, data.server_now]);

  useEffect(() => {
    // El cronómetro arranca recién cuando se cerró la explicación. Si no,
    // leer las instrucciones sale del tiempo de la prueba, que es exactamente
    // el apuro que la explicación venía a sacar.
    if (!started || !stageId || verBriefing || inicio === null) return;
    startedAtRef.current = inicio;
    if (!stageTimed) return;

    const total = stageMinutes * 60;
    const restante = () => total - Math.round((Date.now() - inicio) / 1000);
    queueMicrotask(() => setLeft(Math.max(0, restante())));
    const id = setInterval(() => {
      const queda = restante();
      if (queda <= 0) {
        clearInterval(id);
        setLeft(0);
        enviarRef.current?.();
      } else {
        setLeft(queda);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [started, stageId, stageTimed, stageMinutes, verBriefing, inicio]);

  // "Entendí, empezar": el servidor anota la hora y desde ahí se cuenta.
  function empezarEtapa() {
    if (!stage) return;
    const id = stage.id;
    setError(null);
    setCargando("etapa");
    startTransition(async () => {
      const r = await beginStage(token, id);
      setCargando(null);
      if (!r.ok) {
        setError(r.error ?? "No pudimos empezar la etapa.");
        return;
      }
      const base =
        r.startedAt && r.serverNow
          ? Date.parse(r.startedAt) - (Date.parse(r.serverNow) - Date.now())
          : Date.now();
      setInicio(base);
      setBriefingListo(id);
      // Con azar, las preguntas de esta persona se arman recién ahora:
      // se vuelve a pedir la página para traerlas.
      router.refresh();
    });
  }

  function responder(value: unknown) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    // Se guarda en el momento, no al final de la etapa: si se corta la
    // conexión no se pierde lo ya contestado.
    setGuardado("saving");
    void saveDraft(token, next)
      .then((r) => setGuardado(r.ok ? "saved" : "error"))
      .catch(() => setGuardado("error"));
  }

  function comenzar() {
    setError(null);
    setCargando("abrir");
    startTransition(async () => {
      const r = await startEvaluation(token);
      setCargando(null);
      if (!r.ok) {
        setError(r.error ?? "No pudimos abrir la evaluación.");
        return;
      }
      setStarted(true);
      router.refresh();
    });
  }

  function enviar() {
    if (!stage || enviandoRef.current) return;
    enviandoRef.current = true;
    setError(null);
    const seconds = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : undefined;
    setCargando("enviar");
    const titulo = stage.title;
    const numero = participant.stage_index + 1;
    startTransition(async () => {
      const result = await submitStage(token, stage.id, answers, seconds);
      enviandoRef.current = false;
      setCargando(null);
      if (!result.ok) {
        setError(result.error ?? "No pudimos guardar tus respuestas.");
        return;
      }
      setAnswers({});
      setQIndex(0);
      setDir("next");
      setInicio(null);
      setLeft(null);
      if (result.status === "completado") celebrate();
      else setEtapaHecha({ titulo, numero });
      router.refresh();
    });
  }
  useEffect(() => {
    enviarRef.current = enviar;
  });

  // Mientras se contesta, la pantalla es solo la pregunta: el mapa de etapas,
  // los datos de contacto y la línea de tiempo vuelven al terminar la etapa.
  const respondiendo =
    !etapaHecha && !cerrado && abierto && !!stage && !vencido && started && !verBriefing && stage.questions.length > 0;
  const minutosTotales = stages.reduce((t, s) => t + (s.minutes || 0), 0);

  // Atajos de teclado en la compu: 1-9 elige la opción, Enter avanza.
  const responderRef = useRef(responder);
  useEffect(() => {
    responderRef.current = responder;
  });
  const avanzarRef = useRef<() => void>(() => {});
  useEffect(() => {
    avanzarRef.current = () => {
      if (pending || !respondida) return;
      if (esUltima) enviar();
      else {
        setDir("next");
        setQIndex((i) => i + 1);
      }
    };
  });
  const kindActual = respondiendo ? question?.kind : undefined;
  const opcionesActuales = respondiendo ? question?.options : undefined;
  useEffect(() => {
    if (!kindActual || !opcionesActuales) return;
    const conOpciones = kindActual === "unica" || kindActual === "multiple" || kindActual === "likert" || kindActual === "figura";
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT")) return;
      if (e.key === "Enter") {
        avanzarRef.current();
        return;
      }
      const n = Number(e.key);
      if (!conOpciones || !Number.isInteger(n) || n < 1 || n > opcionesActuales!.length) return;
      const o = opcionesActuales![n - 1];
      responderRef.current(kindActual === "likert" ? n : o);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kindActual, opcionesActuales]);

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
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">
              {process.company ?? "Evaluación"}
            </p>
            <p className="text-xs opacity-70 truncate">{process.title}</p>
          </div>
          {started && !cerrado && (
            <span className="shrink-0 text-xs flex items-center gap-1.5 opacity-80" role="status" aria-live="polite">
              {guardado === "saving" ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Guardando…
                </>
              ) : guardado === "error" ? (
                <>
                  <CloudOff size={14} /> Sin conexión
                </>
              ) : (
                <>
                  <Check size={14} /> {guardado === "saved" ? "Guardado" : "Se guarda solo"}
                </>
              )}
            </span>
          )}
        </div>
      </header>

      {aviso && (
        <div className="fixed top-3 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
          <p role="status" className="ev-toast pointer-events-auto max-w-md w-full rounded-2xl bg-[#1d2226] text-white text-sm px-4 py-3 shadow-lg flex items-start gap-2.5">
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1">{aviso}</span>
            <button onClick={() => setAviso(null)} className="text-white/60 hover:text-white" aria-label="Cerrar aviso">
              <XCircle size={16} />
            </button>
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-4">
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
        {!respondiendo && (
        <div className={`${theme.card} p-5 sm:p-6`}>
          <p className={`text-xs font-semibold ${theme.muted}`}>
            {cerrado ? "Tu evaluación" : started ? "Tu avance" : "Te damos la bienvenida"}
          </p>
          <h1 className={`text-xl font-bold mt-0.5 ${theme.heading}`}>
            Hola{participant.full_name ? `, ${participant.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className={`text-sm mt-1 leading-relaxed ${theme.muted}`}>
            {process.description ||
              `${process.company ?? "La empresa"} te invitó a esta evaluación para la búsqueda «${process.title}».`}
          </p>

          {workaConnect?.linked && (
            <span className="chip bg-[#eef5fc] text-[#0a66c2] mt-3">
              <CheckCircle2 size={13} /> Conectado con Worka Empleos
            </span>
          )}

          {!started && !cerrado && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Dato icono={<Clock size={16} />} valor={`${minutosTotales} min`} texto="en total, aprox." accent={accent} />
              <Dato icono={<CheckCircle2 size={16} />} valor={String(stages.length)} texto={stages.length === 1 ? "etapa" : "etapas"} accent={accent} />
              <Dato icono={<ShieldCheck size={16} />} valor="Se guarda" texto="cada respuesta" accent={accent} />
            </div>
          )}

          <ol className="mt-5 space-y-2.5">
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
                      <Clock size={11} /> {s.minutes} min · {cantidadDe(s)}{" "}
                      {cantidadDe(s) === 1 ? "pregunta" : "preguntas"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        )}

        {/* Resultado cerrado */}
        {cerrado && (
          <div className={`${theme.card} p-6 sm:p-8 text-center animate-rise`}>
            {participant.status === "descartado" ? (
              <XCircle size={32} className="text-slate-400 mx-auto" />
            ) : (
              <span
                className="ev-done-ring mx-auto w-16 h-16 rounded-full grid place-items-center"
                style={{ background: `${accent}14`, color: accent }}
              >
                <CheckCircle2 size={34} className="animate-pop" />
              </span>
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

        {/* Proceso sin publicar o cerrado: se explica en vez de dejar rendir. */}
        {!cerrado && !abierto && (
          <div className={`${theme.card} p-6 text-center`}>
            <CalendarClock size={28} className="text-slate-400 mx-auto" />
            <p className={`font-bold mt-2 ${theme.heading}`}>
              {process.status === "cerrado"
                ? "Esta evaluación ya cerró"
                : "Esta evaluación todavía no está abierta"}
            </p>
            <p className={`text-sm mt-1.5 ${theme.muted}`}>
              {process.status === "cerrado"
                ? "La empresa ya no recibe respuestas para esta búsqueda."
                : "La empresa la está terminando de preparar. Guardá este enlace y volvé a entrar más tarde."}
            </p>
          </div>
        )}

        {/* Datos y CV: el invitado no tiene cuenta de Worka, así que sus datos
            no salen de ningún lado si no se los pedimos. */}
        {!cerrado && abierto && started && !respondiendo && (
          <CandidateData token={token} participant={participant} theme={theme} workaConnect={workaConnect} />
        )}

        {/* Etapa en curso */}
        {!cerrado && abierto && stage && !vencido && (
          <div ref={etapaRef} className={`${theme.card} p-5 scroll-mt-4`}>
            {!started ? (
              <div className="py-1">
                {workaConnect && !workaConnect.linked && (
                  <div className="mb-5 pb-5 border-b border-[#ebe9e6]">
                    <WorkaButton href={workaConnect.url} />
                    <p className={`text-xs text-center mt-2 ${theme.muted}`}>
                      Opcional. Si tenés cuenta en Worka Empleos, cargamos tu nombre, contacto y CV por vos.
                    </p>
                  </div>
                )}
                <p className={`font-semibold ${theme.heading}`}>
                  Antes de empezar
                </p>
                <ul className={`text-sm mt-2 space-y-2 ${theme.muted}`}>
                  {[
                    "Buscá un lugar tranquilo. Se puede hacer desde el celular.",
                    `La primera etapa lleva unos ${stage.minutes} minutos.`,
                    "Si una etapa tiene tiempo, te avisamos antes y el reloj arranca recién cuando vos lo decidís.",
                    "Cada respuesta se guarda sola: podés cortar y seguir después con este mismo enlace.",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check size={15} className="shrink-0 mt-0.5" style={{ color: accent }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {cargando === "abrir" ? (
                  <Cargando accent={accent} theme={theme} mensajes={["Abriendo tu evaluación…", "Preparando la primera etapa…"]} />
                ) : (
                  <button
                    onClick={comenzar}
                    disabled={pending}
                    className="w-full mt-4 text-base py-3 rounded-xl font-semibold press"
                    style={{ background: accent, color: onAccent }}
                  >
                    Empezar evaluación
                  </button>
                )}
                {error && (
                  <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-3">
                    {error}
                  </p>
                )}
              </div>
            ) : etapaHecha ? (
              <EtapaCompletada
                titulo={etapaHecha.titulo}
                numero={etapaHecha.numero}
                total={stages.length}
                siguiente={stage.title}
                accent={accent}
                onAccent={onAccent}
                theme={theme}
                onSeguir={() => setEtapaHecha(null)}
              />
            ) : cargando === "etapa" ? (
              <Cargando accent={accent} theme={theme} mensajes={["Preparando tus preguntas…", "Mezclando las opciones…", "Ya casi…"]} />
            ) : verBriefing ? (
              <>
                <StageBriefing
                  stage={stage}
                  numero={participant.stage_index + 1}
                  total={stages.length}
                  theme={theme}
                  accent={accent}
                  onAccent={onAccent}
                  pending={pending}
                  onListo={empezarEtapa}
                />
                {error && (
                  <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-3">
                    {error}
                  </p>
                )}
              </>
            ) : stage.questions.length === 0 ? (
              <Cargando accent={accent} theme={theme} mensajes={["Preparando tus preguntas…", "Ya casi…"]} />
            ) : (
              <>
                <div className="flex gap-1 mb-4" aria-hidden>
                  {stages.map((s, i) => (
                    <span
                      key={s.id}
                      className="h-1 flex-1 rounded-full"
                      style={{ background: i <= participant.stage_index ? accent : "#e0dfdc", opacity: i === participant.stage_index ? 1 : i < participant.stage_index ? 0.45 : 1 }}
                    />
                  ))}
                </div>
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
                      role="timer"
                      aria-label={`Tiempo restante: ${Math.floor(left / 60)} minutos y ${left % 60} segundos`}
                      className={`chip shrink-0 font-mono font-semibold ${
                        left <= 60
                          ? "bg-red-50 text-danger animate-beat"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <TimerReset size={13} aria-hidden />
                      {String(Math.floor(left / 60)).padStart(2, "0")}:
                      {String(left % 60).padStart(2, "0")}
                    </span>
                  )}
                  {/* El reloj no se anuncia cada segundo (sería ruido); sí
                      cuando falta un minuto. */}
                  <span className="sr-only" aria-live="assertive">
                    {left !== null && left <= 60 && left > 55
                      ? "Queda un minuto para terminar la etapa."
                      : ""}
                  </span>
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
                  <div
                    className="h-1.5 rounded-full bg-slate-200/70 overflow-hidden"
                    role="progressbar"
                    aria-label="Avance de la etapa"
                    aria-valuemin={1}
                    aria-valuemax={stage.questions.length}
                    aria-valuenow={qIndex + 1}
                  >
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
                  <div key={question.id} className={`mt-5 ${dir === "next" ? "ev-q-next" : "ev-q-prev"}`}>
                    <p
                      ref={preguntaRef}
                      tabIndex={-1}
                      id={`q-${question.id}`}
                      className={`text-[17px] leading-snug font-semibold outline-none ${theme.heading}`}
                    >
                      {question.text}
                    </p>

                    {(question.kind === "likert" ||
                      question.kind === "unica" ||
                      question.kind === "multiple") && (
                      <div
                        className="space-y-2 mt-3"
                        role="radiogroup"
                        aria-labelledby={`q-${question.id}`}
                      >
                        {question.options.map((o, oi) => {
                          const valor =
                            question.kind === "likert" ? oi + 1 : o;
                          const elegido = answers[question.id] === valor;
                          return (
                            <button
                              key={o}
                              role="radio"
                              aria-checked={elegido}
                              onClick={() => responder(valor)}
                              className={`w-full text-left text-[15px] px-4 py-3.5 rounded-xl border press transition-colors flex items-center gap-3 hover:bg-black/[.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${elegido ? "ev-opt-pop" : ""}`}
                              style={
                                elegido
                                  ? {
                                      background: accent,
                                      color: onAccent,
                                      borderColor: accent,
                                    }
                                  : { borderColor: "#e0dfdc" }
                              }
                            >
                              <span
                                aria-hidden
                                className="w-6 h-6 rounded-full border shrink-0 grid place-items-center text-xs font-semibold"
                                style={{
                                  borderColor: elegido ? onAccent : "#d4d2ce",
                                  background: elegido
                                    ? "rgba(255,255,255,.25)"
                                    : "transparent",
                                }}
                              >
                                {elegido ? <Check size={13} /> : oi + 1}
                              </span>
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {question.kind === "texto" && (
                      <textarea
                        className="input min-h-28 mt-3"
                        aria-labelledby={`q-${question.id}`}
                        placeholder="Escribí tu respuesta"
                        value={(answers[question.id] as string) ?? ""}
                        onChange={(e) => responder(e.target.value)}
                      />
                    )}

                    {question.kind === "escala" && (
                      <>
                      <div
                        className="flex gap-2 mt-3"
                        role="radiogroup"
                        aria-labelledby={`q-${question.id}`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => {
                          const elegido = answers[question.id] === n;
                          return (
                            <button
                              key={n}
                              role="radio"
                              aria-checked={elegido}
                              aria-label={`${n} de 5`}
                              onClick={() => responder(n)}
                              className="flex-1 min-h-12 rounded-xl border font-semibold press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                              style={
                                elegido
                                  ? {
                                      background: accent,
                                      color: onAccent,
                                      borderColor: accent,
                                    }
                                  : { borderColor: "#e0dfdc" }
                              }
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      {/* Sin esto, "1" y "5" no dicen cuál punta es cuál. */}
                      <div className={`flex justify-between text-xs mt-1.5 ${theme.muted}`}>
                        <span>1 = lo mínimo</span>
                        <span>5 = lo máximo</span>
                      </div>
                      </>
                    )}

                    {question.kind === "numero" && (
                      <input
                        type="number"
                        inputMode="decimal"
                        aria-labelledby={`q-${question.id}`}
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
                    {/* Figuras: la consigna dibujada y cuatro opciones
                        dibujadas, con letra para poder nombrarlas. */}
                    {question.kind === "figura" && question.figure && (
                      <div className="mt-4 space-y-4">
                        <ConsignaFigural spec={question.figure} />
                        <div
                          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                          role="radiogroup"
                          aria-labelledby={`q-${question.id}`}
                        >
                          {question.options.map((o, oi) => {
                            const elegido = answers[question.id] === o;
                            return (
                              <button
                                key={o}
                                role="radio"
                                aria-checked={elegido}
                                aria-label={`Opción ${"abcd"[oi] ?? oi + 1}: ${describir(o)}`}
                                onClick={() => responder(o)}
                                className="rounded-xl border-2 p-2 press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                style={
                                  elegido
                                    ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}` }
                                    : { borderColor: "#e0dfdc" }
                                }
                              >
                                <span className="block text-xs font-semibold text-left opacity-70">
                                  {"abcd"[oi] ?? oi + 1}
                                </span>
                                <span className="block aspect-square">
                                  <Figura codigo={o} etiqueta={false} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                  <p
                    role="alert"
                    className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-4"
                  >
                    {error}
                  </p>
                )}

                <div className="flex gap-2 mt-5">
                  {qIndex > 0 && (
                    <button
                      onClick={() => {
                        setDir("prev");
                        setQIndex((i) => i - 1);
                      }}
                      className="btn-secondary press shrink-0"
                      aria-label="Pregunta anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (esUltima) enviar();
                      else {
                        setDir("next");
                        setQIndex((i) => i + 1);
                      }
                    }}
                    disabled={pending || !respondida}
                    className="flex-1 text-base py-3 rounded-xl font-semibold press disabled:opacity-40"
                    style={{ background: accent, color: onAccent }}
                  >
                    {cargando === "enviar"
                      ? "Enviando tus respuestas…"
                      : esUltima
                        ? participant.stage_index + 1 >= stages.length
                          ? "Terminar evaluación"
                          : "Terminar etapa"
                        : "Siguiente"}
                  </button>
                </div>
                <p className={`text-xs text-center mt-2 ${theme.muted}`}>
                  {!respondida
                    ? "Elegí una respuesta para continuar."
                    : esUltima
                      ? "Al terminar se envía la etapa y ya no se puede cambiar."
                      : "Podés volver a la pregunta anterior con la flecha."}
                  <span className="hidden sm:inline"> · Atajos: números para elegir, Enter para seguir.</span>
                </p>
              </>
            )}
          </div>
        )}

        {/* Línea de tiempo */}
        {events.length > 0 && !respondiendo && (
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
          Guardá este enlace: es tu acceso a esta evaluación. Tus respuestas
          solo las ve {process.company ?? "la empresa"}. Con tecnología de Worka.
        </p>
      </div>
    </div>
  );
}

// «Continuar con Worka Empleos», al estilo de los botones de Google o
// Microsoft: es el gesto que la gente ya conoce para «usar mi cuenta».
function WorkaButton({ href, compact = false }: { href: string; compact?: boolean }) {
  return (
    <a
      href={href}
      className={`group w-full rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white flex items-center gap-3 press transition-colors ${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}
    >
      <span className={`${compact ? "w-8 h-8 text-[13px]" : "w-10 h-10 text-[15px]"} rounded-full bg-white text-[#0a3d7a] grid place-items-center font-extrabold shrink-0 tracking-tight`}>
        W<span className="text-[#0a66c2]">.</span>
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className={`block font-semibold ${compact ? "text-sm" : "text-[15px]"}`}>Continuar con Worka Empleos</span>
        {!compact && <span className="block text-xs text-white/75">Tus datos y tu CV en un toque</span>}
      </span>
      <Sparkles size={16} className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

// Pantalla de espera: un spinner solo parece colgado; con mensajes que van
// cambiando y una barra que avanza se entiende que algo está pasando.
function Cargando({
  accent,
  theme,
  mensajes,
}: {
  accent: string;
  theme: ReturnType<typeof getTheme>;
  mensajes: string[];
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(n + 1, mensajes.length - 1)), 1400);
    return () => clearInterval(id);
  }, [mensajes.length]);
  return (
    <div className="py-6 text-center" role="status" aria-live="polite">
      <span className="relative mx-auto w-14 h-14 grid place-items-center">
        <span className="absolute inset-0 rounded-full ev-pulse-ring" style={{ background: `${accent}22` }} />
        <Loader2 size={26} className="animate-spin relative" style={{ color: accent }} />
      </span>
      <p key={i} className={`text-sm font-medium mt-4 animate-rise ${theme.heading}`}>
        {mensajes[i]}
      </p>
      <div className="h-1 max-w-[220px] mx-auto rounded-full bg-[#ebe9e6] overflow-hidden mt-4">
        <div className="h-full rounded-full ev-load-bar" style={{ background: accent }} />
      </div>
      <div className="mt-6 space-y-2.5 text-left" aria-hidden>
        <div className="ev-skeleton h-4 w-3/4 rounded-md" />
        <div className="ev-skeleton h-11 rounded-xl" />
        <div className="ev-skeleton h-11 rounded-xl" />
        <div className="ev-skeleton h-11 rounded-xl" />
      </div>
    </div>
  );
}

// Festejo entre etapas, con el avance total y la próxima etapa a la vista.
function EtapaCompletada({
  titulo,
  numero,
  total,
  siguiente,
  accent,
  onAccent,
  theme,
  onSeguir,
}: {
  titulo: string;
  numero: number;
  total: number;
  siguiente: string;
  accent: string;
  onAccent: string;
  theme: ReturnType<typeof getTheme>;
  onSeguir: () => void;
}) {
  const pct = Math.round((numero / total) * 100);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="py-4 text-center animate-rise">
      <div className="relative mx-auto w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90" aria-hidden>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#ebe9e6" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="ev-ring-fill"
            style={{ ["--ev-ring-from" as string]: String(c * (1 - (numero - 1) / total)) }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <PartyPopper size={28} className="animate-pop" style={{ color: accent }} />
        </span>
      </div>
      <p className={`text-xs font-semibold mt-4 ${theme.muted}`}>
        Etapa {numero} de {total} lista · {pct}% de la evaluación
      </p>
      <h2 className={`text-xl font-bold mt-1 ${theme.heading}`}>¡Muy bien! Terminaste «{titulo}»</h2>
      <p className={`text-sm mt-1.5 ${theme.muted}`}>
        Tus respuestas ya quedaron guardadas. Si querés, tomate un respiro: la próxima etapa no arranca hasta que vos lo decidas.
      </p>
      <div className="rounded-xl border border-[#e0dfdc] px-4 py-3 mt-5 text-left">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.muted}`}>Sigue</p>
        <p className={`text-sm font-semibold ${theme.heading}`}>{siguiente}</p>
      </div>
      <button
        onClick={onSeguir}
        className="w-full mt-5 text-base py-3 rounded-xl font-semibold press"
        style={{ background: accent, color: onAccent }}
      >
        Seguir con la próxima etapa
      </button>
    </div>
  );
}

function Dato({ icono, valor, texto, accent }: { icono: React.ReactNode; valor: string; texto: string; accent: string }) {
  return (
    <div className="rounded-xl border border-[#e0dfdc] px-3 py-2.5">
      <span style={{ color: accent }}>{icono}</span>
      <p className="text-sm font-semibold text-[#1d2226] mt-1">{valor}</p>
      <p className="text-[11px] text-[#666] leading-tight">{texto}</p>
    </div>
  );
}

// Cuántas preguntas tiene una etapa para esta persona. Con azar (056) la
// lista de preguntas llega recién al empezar la etapa; antes, solo el número.
function cantidadDe(s: Evaluation["stages"][number]): number {
  return s.questions.length || s.question_count || 0;
}

// ── Datos de contacto y CV ─────────────────────────────────────

function CandidateData({
  token,
  participant,
  theme,
  workaConnect,
}: {
  token: string;
  participant: Evaluation["participant"];
  theme: ReturnType<typeof getTheme>;
  workaConnect?: WorkaConnect;
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
      {workaConnect && !workaConnect.linked && (
        <>
          <WorkaButton href={workaConnect.url} compact />
          <p className={`text-xs text-center ${theme.muted}`}>o cargalos a mano:</p>
        </>
      )}
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
  pending,
  onListo,
}: {
  stage: Evaluation["stages"][number];
  numero: number;
  total: number;
  theme: ReturnType<typeof getTheme>;
  accent: string;
  onAccent: string;
  pending: boolean;
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
          {cantidadDe(stage)}{" "}
          {cantidadDe(stage) === 1 ? "pregunta" : "preguntas"}
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
        {stage.intro?.trim() ||
          stage.description?.trim() ||
          "Cuando estés listo, empezá la etapa. Podés tomarte un momento antes: nada corre hasta que toques el botón."}
      </p>

      {demo && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Así se ve
          </p>
          <p className="text-sm font-medium text-slate-800 mt-1.5">
            {demo.text}
          </p>

          {demo.figure ? (
            <div className="mt-3 space-y-3 text-slate-800">
              <ConsignaFigural spec={demo.figure} />
              <div className="grid grid-cols-4 gap-2">
                {demo.options.map((o, oi) => {
                  const correcta = o === demo.answer;
                  return (
                    <div
                      key={o}
                      aria-label={`${"abcd"[oi]}: ${describir(o)}${correcta ? " (es la correcta)" : ""}`}
                      className={`rounded-xl border-2 p-1.5 ${
                        correcta ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="block text-[11px] font-semibold">
                        {"abcd"[oi]} {correcta && "✓"}
                      </span>
                      <span className="block aspect-square">
                        <Figura codigo={o} etiqueta={false} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
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
          )}

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            <strong className="font-semibold">Por qué:</strong> {demo.explain}
          </p>
        </div>
      )}

      <button
        onClick={onListo}
        disabled={pending}
        className="w-full mt-5 text-base py-3 rounded-xl font-semibold press disabled:opacity-60"
        style={{ background: accent, color: onAccent }}
      >
        {pending ? "Abriendo…" : "Entendí, empezar"}
      </button>

      {stage.timed && (
        <p className={`text-xs text-center mt-2 ${theme.muted}`}>
          El tiempo empieza a correr cuando toques el botón, no antes.
        </p>
      )}
    </div>
  );
}
