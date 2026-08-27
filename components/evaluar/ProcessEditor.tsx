"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Link2,
  ChevronDown,
  Clock,
  FileText,
  ChevronUp,
  Columns3,
  List,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { EvaluarQuestion, ProcessDetail } from "@/lib/evaluar";
import type { PlanLimits } from "@/lib/evaluar-plans";
import TemplatePicker from "./TemplatePicker";
import AiStageGenerator from "./AiStageGenerator";
import CandidateBoard from "./CandidateBoard";
import {
  IdealProfile,
  ProcessDesign,
  ProcessOrg,
  ProcessTeam,
} from "./ProcessSettings";
import {
  addQuestion,
  addStage,
  applyRoleTemplate,
  applyTemplate,
  deleteQuestion,
  deleteStage,
  inviteBatch,
  inviteParticipant,
  moveStage,
  updateProcess,
  updateQuestion,
  updateStage,
} from "@/app/evaluar/actions";

type Tab = "etapas" | "candidatos" | "ajustes";

export default function ProcessEditor({
  detail,
  jobs,
  plan,
}: {
  detail: ProcessDetail;
  jobs: { id: string; title: string; linked: boolean }[];
  plan: PlanLimits;
}) {
  const router = useRouter();
  const { process, stages, participants, esDueno } = detail;
  const [tab, setTab] = useState<Tab>("etapas");
  const [vista, setVista] = useState<"lista" | "tablero">("lista");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) router.refresh();
      else setError(result.error ?? "Ocurrió un error.");
    });
  }

  const totalQuestions = stages.reduce((a, s) => a + s.questions.length, 0);
  const minutosTotales = stages.reduce((a, s) => a + (s.minutes || 0), 0);
  // Un proceso sin etapas no se puede publicar: el candidato entraría a una
  // evaluación vacía.
  const canPublish = stages.length > 0 && totalQuestions > 0;

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-primary-dark">
              {process.title}
            </h1>
            {/* Para qué área se llama. Distingue dos búsquedas del mismo
                puesto, que es lo que pasa apenas hay más de una sucursal. */}
            {(process.org_unit || process.department) && (
              <p className="text-sm text-slate-500 mt-0.5">
                {[process.org_unit, process.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {process.job ? (
              <p className="text-sm text-primary mt-1 flex items-center gap-1.5">
                <Link2 size={14} /> Enlazado a «{process.job.title}»
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-1">
                Sin vacante enlazada
              </p>
            )}

            {/* Cuánto le lleva al candidato. Es el número que decide cuánta
                gente termina, y no estaba en ningún lado: se armaban procesos
                de cuarenta minutos sin que nadie lo notara hasta ver que la
                mitad abandonaba. */}
            {stages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="chip bg-slate-100 text-slate-600">
                  {stages.length}{" "}
                  {stages.length === 1 ? "etapa" : "etapas"}
                </span>
                <span className="chip bg-slate-100 text-slate-600">
                  {totalQuestions}{" "}
                  {totalQuestions === 1 ? "pregunta" : "preguntas"}
                </span>
                <span
                  className={`chip ${
                    minutosTotales > 30
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  title={
                    minutosTotales > 30
                      ? "Arriba de media hora la mitad de la gente abandona"
                      : undefined
                  }
                >
                  <Clock size={13} /> {minutosTotales} min para el candidato
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`chip ${
                process.status === "activo"
                  ? "bg-emerald-50 text-emerald-700"
                  : process.status === "cerrado"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {process.status}
            </span>
            {!esDueno ? (
              <span className="chip bg-slate-100 text-slate-600">
                Te sumaron a este concurso
              </span>
            ) : process.status !== "activo" ? (
              <button
                disabled={!canPublish || pending}
                title={
                  canPublish
                    ? undefined
                    : "Agregá al menos una etapa con preguntas"
                }
                onClick={() =>
                  run(() => updateProcess(process.id, { status: "activo" }))
                }
                className="btn-primary press text-sm disabled:opacity-40"
              >
                Publicar
              </button>
            ) : (
              <button
                disabled={pending}
                onClick={() =>
                  run(() => updateProcess(process.id, { status: "cerrado" }))
                }
                className="btn-secondary press text-sm"
              >
                Cerrar proceso
              </button>
            )}
            {process.status === "cerrado" && (
              <a
                href={`/evaluar/app/procesos/${process.id}/cierre`}
                className="btn-primary press text-sm"
              >
                <FileText size={15} /> Acta de cierre
              </a>
            )}
          </div>
        </div>

        {!canPublish && process.status !== "activo" && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-3">
            Para publicar necesitás al menos una etapa con una pregunta. Así
            nadie entra a una evaluación vacía.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            ["etapas", `Etapas (${stages.length})`],
            ["candidatos", `Candidatos (${participants.length})`],
            ...(esDueno ? ([["ajustes", "Ajustes"]] as [Tab, string][]) : []),
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
        {tab === "candidatos" && (
          <div className="ml-auto flex items-center gap-1 pb-1.5">
            {(["lista", "tablero"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`chip press ${
                  vista === v
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {v === "lista" ? <List size={13} /> : <Columns3 size={13} />}
                {v === "lista" ? "Lista" : "Tablero"}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "etapas" && (
        <StagesTab
          detail={detail}
          pending={pending}
          plan={plan}
          onApplyTemplate={(key) => run(() => applyTemplate(process.id, key))}
          onApplyRole={(key) => run(() => applyRoleTemplate(process.id, key))}
          onAddStage={(input) => run(() => addStage(process.id, input))}
          onDeleteStage={(sid) => run(() => deleteStage(process.id, sid))}
          onAddQuestion={(sid, input) =>
            run(() => addQuestion(process.id, sid, input))
          }
          onDeleteQuestion={(qid) => run(() => deleteQuestion(process.id, qid))}
          onUpdateQuestion={(qid, input) =>
            run(() => updateQuestion(process.id, qid, input))
          }
          onMoveStage={(sid, dir) => run(() => moveStage(process.id, sid, dir))}
          onUpdateStage={(sid, input) =>
            run(() => updateStage(process.id, sid, input))
          }
        />
      )}

      {tab === "candidatos" && vista === "tablero" && (
        <CandidateBoard detail={detail} />
      )}

      {tab === "candidatos" && vista === "lista" && (
        <CandidatesTab
          detail={detail}
          pending={pending}
          aviso={aviso}
          onInvite={(input) =>
            startTransition(async () => {
              const r = await inviteParticipant(process.id, input);
              if (!r.ok) {
                setError(r.error ?? "No pudimos invitar.");
                return;
              }
              // Que la empresa sepa si el correo salio o si tiene que
              // mandar el enlace por WhatsApp, en vez de quedarse esperando.
              setAviso(
                r.emailSent
                  ? "Invitacion enviada por email."
                  : r.emailReason === "sin_email"
                    ? "Listo. Sin email cargado: mandale el enlace por WhatsApp."
                    : r.emailReason === "sin_configurar"
                      ? "Listo, pero el envio de correos no esta configurado todavia: mandale el enlace por WhatsApp."
                      : "Listo, pero el correo no pudo salir: mandale el enlace por WhatsApp."
              );
              router.refresh();
            })
          }
          onInviteBatch={(raw) =>
            startTransition(async () => {
              const r = await inviteBatch(process.id, raw);
              if (!r.ok) {
                setError(r.error ?? "No pudimos cargar la lista.");
                return;
              }
              setAviso(
                `Se cargaron ${r.invited ?? 0}. ${
                  r.failed
                    ? `A ${r.failed} no les llego el correo: mandales el enlace por WhatsApp.`
                    : "Las invitaciones salieron por email."
                }`
              );
              router.refresh();
            })
          }
        />
      )}

      {tab === "ajustes" && esDueno && (
        <div className="space-y-4">
          <ProcessOrg detail={detail} />
          <IdealProfile detail={detail} />
          <ProcessDesign detail={detail} />
          <ProcessTeam detail={detail} />
          <SettingsTab
          detail={detail}
          jobs={jobs}
          pending={pending}
          onSave={(input) => run(() => updateProcess(process.id, input))}
          />
        </div>
      )}
    </div>
  );
}

// ── Etapas y preguntas ─────────────────────────────────────────

function StagesTab({
  detail,
  pending,
  plan,
  onApplyTemplate,
  onApplyRole,
  onAddStage,
  onDeleteStage,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onMoveStage,
  onUpdateStage,
}: {
  detail: ProcessDetail;
  pending: boolean;
  plan: PlanLimits;
  onApplyTemplate: (key: string) => void;
  onApplyRole: (key: string) => void;
  onAddStage: (i: { title: string; description: string; minutes: number }) => void;
  onDeleteStage: (id: string) => void;
  onAddQuestion: (
    stageId: string,
    i: {
      text: string;
      kind: "unica" | "multiple" | "texto" | "escala" | "numero" | "video";
      maxSeconds: number;
      options: string[];
      correctIndex: number | null;
      weight: number;
      knockout: boolean;
    }
  ) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveStage: (id: string, dir: "arriba" | "abajo") => void;
  onUpdateStage: (
    id: string,
    i: { title: string; description: string; minutes: number; timed: boolean }
  ) => void;
  onUpdateQuestion: (
    questionId: string,
    i: {
      text: string;
      options: string[];
      correctIndex: number | null;
      weight: number;
      knockout: boolean;
    }
  ) => void;
}) {
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [editQ, setEditQ] = useState<string | null>(null);
  const [editS, setEditS] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {detail.stages.map((stage, i) => (
        <div key={stage.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Etapa {i + 1} · {stage.minutes} min
              </p>
              <h3 className="font-semibold text-primary-dark">{stage.title}</h3>
              {stage.description && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {stage.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Reordenar: antes las etapas quedaban para siempre en el orden
                  en que se crearon. */}
              <button
                onClick={() => onMoveStage(stage.id, "arriba")}
                disabled={pending || i === 0}
                aria-label="Subir etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press disabled:opacity-20"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => onMoveStage(stage.id, "abajo")}
                disabled={pending || i === detail.stages.length - 1}
                aria-label="Bajar etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press disabled:opacity-20"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setEditS(editS === stage.id ? null : stage.id)}
                disabled={pending}
                aria-label="Editar etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDeleteStage(stage.id)}
                disabled={pending}
                aria-label="Borrar etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {editS === stage.id && (
            <StageForm
              stage={stage}
              pending={pending}
              onCancel={() => setEditS(null)}
              onSave={(input) => {
                onUpdateStage(stage.id, input);
                setEditS(null);
              }}
            />
          )}

          <ul className="mt-3 space-y-2">
            {stage.questions.map((q, qi) =>
              editQ === q.id ? (
                <li key={q.id}>
                  <QuestionForm
                    pending={pending}
                    initial={q}
                    onCancel={() => setEditQ(null)}
                    onSave={(input) => {
                      onUpdateQuestion(q.id, input);
                      setEditQ(null);
                    }}
                  />
                </li>
              ) : (
              <li
                key={q.id}
                className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2.5"
              >
                <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                  {qi + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{q.text}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="chip bg-white text-slate-500 border border-slate-200">
                      {q.kind}
                    </span>
                    {q.correct !== null && (
                      <span className="chip bg-emerald-50 text-emerald-700">
                        vale {q.weight}
                      </span>
                    )}
                    {q.correct === null && (
                      <span className="chip bg-slate-100 text-slate-500">
                        la juzga el evaluador
                      </span>
                    )}
                    {q.knockout && (
                      <span className="chip bg-red-50 text-danger">
                        excluyente
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditQ(q.id)}
                  disabled={pending}
                  aria-label="Editar pregunta"
                  className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press shrink-0"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteQuestion(q.id)}
                  disabled={pending}
                  aria-label="Borrar pregunta"
                  className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press shrink-0"
                >
                  <X size={14} />
                </button>
              </li>
              )
            )}
          </ul>

          {openQ === stage.id ? (
            <QuestionForm
              pending={pending}
              onCancel={() => setOpenQ(null)}
              onSave={(input) => {
                onAddQuestion(stage.id, input);
                setOpenQ(null);
              }}
            />
          ) : (
            <button
              onClick={() => setOpenQ(stage.id)}
              className="btn-secondary press text-sm w-full mt-3"
            >
              <Plus size={15} /> Agregar pregunta
            </button>
          )}
        </div>
      ))}

      {/* Las tres formas de sumar una etapa, en una sola tarjeta.
          Antes eran tres tarjetas grandes siempre abiertas debajo de las
          etapas: quien ya armó su proceso tenía media pantalla ocupada por
          instrucciones de cómo armarlo. Se abre sola cuando todavía no hay
          nada, que es cuando de verdad hace falta. */}
      <AddStagePanel
        detail={detail}
        pending={pending}
        plan={plan}
        onApplyTemplate={onApplyTemplate}
        onApplyRole={onApplyRole}
        onAddStage={onAddStage}
      />
    </div>
  );
}

function QuestionForm({
  pending,
  initial,
  onSave,
  onCancel,
}: {
  pending: boolean;
  /** Pregunta existente: si viene, el formulario edita en vez de crear. */
  initial?: EvaluarQuestion;
  onCancel: () => void;
  onSave: (i: {
    text: string;
    kind: "unica" | "multiple" | "texto" | "escala" | "numero" | "video";
    maxSeconds: number;
    options: string[];
    correctIndex: number | null;
    weight: number;
    knockout: boolean;
  }) => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  // El tipo no se puede cambiar al editar: pasar de opciones a texto libre
  // dejaria las respuestas ya dadas sin sentido.
  const [kind, setKind] = useState<
    "unica" | "multiple" | "texto" | "escala" | "numero" | "video"
  >((initial?.kind as "unica") ?? "unica");
  const [options, setOptions] = useState<string[]>(
    initial && initial.options.length ? initial.options : ["", ""]
  );
  const [correctIndex, setCorrectIndex] = useState<number | null>(
    initial
      ? initial.options.findIndex((o) => o === initial.correct) >= 0
        ? initial.options.findIndex((o) => o === initial.correct)
        : null
      : 0
  );
  const [maxSeconds, setMaxSeconds] = useState(initial?.max_seconds ?? 90);
  const [weight, setWeight] = useState(initial?.weight ?? 1);
  const [knockout, setKnockout] = useState(initial?.knockout ?? false);

  const needsOptions = kind === "unica" || kind === "multiple";

  return (
    <div className="border border-slate-200 rounded-2xl p-4 mt-3 space-y-3 animate-rise">
      <div>
        <label className="label">Pregunta</label>
        <input
          className="input"
          placeholder="Ej: ¿Tenés registro profesional vigente?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Tipo</label>
        <select
          className="input disabled:opacity-60"
          value={kind}
          disabled={!!initial}
          title={initial ? "El tipo no se cambia al editar" : undefined}
          onChange={(e) => setKind(e.target.value as typeof kind)}
        >
          <option value="unica">Opción única</option>
          <option value="multiple">Opción múltiple</option>
          <option value="texto">Respuesta escrita</option>
          <option value="escala">Escala 1 a 5</option>
          <option value="numero">Número</option>
          <option value="video">Respuesta en video</option>
        </select>
      </div>

      {/* Tope de grabación. Va por pregunta porque "contá de vos" y "resolvé
          este caso" no piden lo mismo, y sin tope el que habla diez minutos
          parece más completo que el que contesta en uno. */}
      {kind === "video" && (
        <div>
          <label className="label">Tiempo máximo de grabación</label>
          <select
            className="input"
            value={maxSeconds}
            onChange={(e) => setMaxSeconds(Number(e.target.value))}
          >
            <option value={60}>1 minuto</option>
            <option value={90}>1 minuto y medio</option>
            <option value={120}>2 minutos</option>
            <option value={180}>3 minutos</option>
          </select>
          <p className="text-xs text-slate-500 mt-1.5">
            El candidato graba cuando puede y puede repetirlo antes de enviar.
            Vos lo mirás desde el informe, sin coordinar agenda.
          </p>
        </div>
      )}

      {needsOptions && (
        <div>
          <label className="label">
            Opciones — marcá la correcta (o ninguna)
          </label>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectIndex(correctIndex === i ? null : i)}
                  aria-label="Marcar como correcta"
                  className={`w-8 h-8 shrink-0 rounded-full grid place-items-center border-2 press ${
                    correctIndex === i
                      ? "bg-success border-success text-white"
                      : "border-slate-200 text-transparent"
                  }`}
                >
                  <Check size={14} />
                </button>
                <input
                  className="input flex-1"
                  placeholder={`Opción ${i + 1}`}
                  value={o}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOptions(options.filter((_, x) => x !== i));
                      if (correctIndex === i) setCorrectIndex(null);
                    }}
                    aria-label="Quitar opción"
                    className="w-8 h-8 grid place-items-center rounded-full text-slate-300 press shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="text-xs text-primary font-medium mt-2"
          >
            + Otra opción
          </button>
        </div>
      )}

      {needsOptions && correctIndex !== null && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm text-slate-700 flex items-center gap-2">
            Puntaje
            <input
              type="number"
              min={1}
              max={10}
              className="input w-20"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700 flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5 accent-red-500"
              checked={knockout}
              onChange={(e) => setKnockout(e.target.checked)}
            />
            Excluyente
          </label>
        </div>
      )}
      {needsOptions && correctIndex !== null && knockout && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          Si falla esta pregunta, el proceso se cierra para esa persona al
          instante y se le explica por qué.
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="btn-secondary press flex-1">
          Cancelar
        </button>
        <button
          onClick={() =>
            onSave({
              text,
              kind,
              options,
              correctIndex,
              weight,
              knockout,
              maxSeconds,
            })
          }
          disabled={pending || !text.trim()}
          className="btn-primary press flex-[2] disabled:opacity-40"
        >
          {initial ? "Guardar cambios" : "Guardar pregunta"}
        </button>
      </div>
    </div>
  );
}

// ── Candidatos ─────────────────────────────────────────────────

function CandidatesTab({
  detail,
  pending,
  onInvite,
  onInviteBatch,
  aviso,
}: {
  detail: ProcessDetail;
  pending: boolean;
  onInvite: (i: { full_name: string; email?: string; phone?: string }) => void;
  onInviteBatch: (raw: string) => void;
  aviso: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bulk, setBulk] = useState(false);
  const [list, setList] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function linkFor(token: string) {
    return `${window.location.origin}/evaluar/e/${token}`;
  }

  function copyLink(token: string) {
    navigator.clipboard?.writeText(linkFor(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function waLink(phone: string | null, nombre: string, token: string) {
    const texto = encodeURIComponent(
      `Hola${nombre ? ` ${nombre}` : ""}, te invitamos a completar la evaluación de "${detail.process.title}". ` +
        `Entrá desde acá, es tuyo y personal (no necesitás crear cuenta): ${linkFor(token)}`
    );
    // Sin teléfono, WhatsApp abre el selector de contacto igual.
    const numero = (phone ?? "").replace(/\D/g, "");
    return numero
      ? `https://wa.me/${numero}?text=${texto}`
      : `https://wa.me/?text=${texto}`;
  }

  return (
    <div className="space-y-3">
      {aviso && (
        <p className="text-sm text-primary bg-blue-50 rounded-xl px-4 py-3">
          {aviso}
        </p>
      )}

      <div className="card p-5">
        <h3 className="font-semibold text-primary-dark text-sm flex items-center gap-2">
          <UserPlus size={16} /> Invitar a alguien
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Le generamos un enlace propio: entra y rinde sin crear ninguna cuenta.
        </p>
        {bulk ? (
          <div className="mt-3 space-y-2">
            <textarea
              className="input min-h-32 font-mono text-xs"
              placeholder={
                "Una persona por línea:\nMaría González, maria@email.com, 0981123456\nJuan Pérez, juan@email.com\nAna Duarte"
              }
              value={list}
              onChange={(e) => setList(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Nombre, email y teléfono separados por coma. El email es opcional,
              pero a quien lo tenga le llega la invitación sola.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setBulk(false)}
                className="btn-secondary press flex-1"
              >
                Cargar de a una
              </button>
              <button
                onClick={() => {
                  onInviteBatch(list);
                  setList("");
                }}
                disabled={pending || !list.trim()}
                className="btn-primary press flex-[2] disabled:opacity-40"
              >
                Invitar a todos
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <input
                className="input flex-1"
                placeholder="Nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="input flex-1"
                placeholder="Email (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={() => {
                  onInvite({ full_name: name, email });
                  setName("");
                  setEmail("");
                }}
                disabled={pending || !name.trim()}
                className="btn-primary press disabled:opacity-40"
              >
                Invitar
              </button>
            </div>
            <button
              onClick={() => setBulk(true)}
              className="text-xs text-primary font-medium mt-2"
            >
              + Cargar una lista de varios
            </button>
          </>
        )}
      </div>

      {detail.participants.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center mx-auto">
            <Users size={20} />
          </span>
          <p className="font-medium text-primary-dark mt-3">
            Todavía no hay candidatos
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {detail.process.job
              ? "Cuando alguien se postule a la vacante enlazada va a aparecer acá."
              : "Invitá a alguien o enlazá el proceso con una vacante de Worka."}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {detail.participants.map((p) => (
            <div
              key={p.id}
              className="p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-primary-dark truncate">
                  {p.full_name || "Sin nombre"}
                </p>
                <p className="text-xs text-slate-500">
                  {p.source === "worka" ? "Desde Worka Empleos" : "Invitado"}
                  {p.score !== null && p.max_score
                    ? ` · ${p.score}/${p.max_score} puntos`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusChip status={p.status} />
                {/* WhatsApp abierto con el mensaje listo. No se manda solo
                    (eso necesita la API de Meta) pero evita tener que armar el
                    texto y pegar el enlace a mano, que es donde se pierde
                    media hora con una lista larga. */}
                <a
                  href={waLink(p.phone, p.full_name, p.token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary press text-xs"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <button
                  onClick={() => copyLink(p.token)}
                  className="btn-secondary press text-xs"
                >
                  {copied === p.token ? (
                    <>
                      <Check size={13} /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Enlace
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    invitado: "bg-slate-100 text-slate-600",
    en_curso: "bg-blue-50 text-primary",
    completado: "bg-indigo-50 text-indigo-700",
    finalista: "bg-emerald-50 text-emerald-700",
    contratado: "bg-emerald-600 text-white",
    descartado: "bg-red-50 text-danger",
  };
  return (
    <span className={`chip ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── Ajustes ────────────────────────────────────────────────────

function SettingsTab({
  detail,
  jobs,
  pending,
  onSave,
}: {
  detail: ProcessDetail;
  jobs: { id: string; title: string; linked: boolean }[];
  pending: boolean;
  onSave: (i: {
    title?: string;
    description?: string;
    closing_message?: string;
    job_id?: string | null;
  }) => void;
}) {
  const { process } = detail;
  const [title, setTitle] = useState(process.title);
  const [description, setDescription] = useState(process.description);
  const [closing, setClosing] = useState(process.closing_message);
  const [jobId, setJobId] = useState(process.job_id ?? "");

  const options = jobs.filter((j) => !j.linked || j.id === process.job_id);

  return (
    <div className="card p-5 space-y-3">
      <div>
        <label className="label">Nombre del proceso</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Descripción para el candidato</label>
        <textarea
          className="input min-h-20"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Vacante enlazada</label>
        <select
          className="input"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="">Sin enlazar</option>
          {options.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Con una vacante enlazada, quien la mire en Worka puede empezar la
          evaluación desde el aviso.
        </p>
      </div>
      <div>
        <label className="label">Mensaje al terminar</label>
        <textarea
          className="input min-h-20"
          placeholder="Ej: Gracias por tu tiempo. Revisamos todo y te contamos en 5 días hábiles."
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">
          Lo lee cada persona al completar la evaluación. Decir cuándo va a
          haber novedades es la mitad de la buena experiencia.
        </p>
      </div>
      <button
        onClick={() =>
          onSave({
            title,
            description,
            closing_message: closing,
            job_id: jobId || null,
          })
        }
        disabled={pending}
        className="btn-primary press w-full"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

// Edición de una etapa: nombre, descripción, minutos y si va cronometrada.
function StageForm({
  stage,
  pending,
  onSave,
  onCancel,
}: {
  stage: ProcessDetail["stages"][number];
  pending: boolean;
  onCancel: () => void;
  onSave: (i: {
    title: string;
    description: string;
    minutes: number;
    timed: boolean;
    intro: string;
  }) => void;
}) {
  const [title, setTitle] = useState(stage.title);
  const [description, setDescription] = useState(stage.description);
  const [minutes, setMinutes] = useState(stage.minutes);
  const [timed, setTimed] = useState(!!stage.timed);
  const [intro, setIntro] = useState(stage.intro ?? "");

  return (
    <div className="border border-slate-200 rounded-2xl p-4 mt-3 space-y-3 animate-rise">
      <div>
        <label className="label">Nombre de la etapa</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Descripción (opcional)</label>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm text-slate-700 flex items-center gap-2">
          Minutos
          <input
            type="number"
            min={1}
            max={120}
            className="input w-24"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
        <label className="text-sm text-slate-700 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary"
            checked={timed}
            onChange={(e) => setTimed(e.target.checked)}
          />
          Con cronómetro
        </label>
      </div>
      {timed && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
          Al llegar a cero se entrega lo respondido hasta ahí. Conviene para
          pruebas de conocimientos o razonamiento; en personalidad el tiempo no
          agrega nada y solo pone nervioso al candidato.
        </p>
      )}

      <div>
        <label className="label">Qué le explicamos al candidato</label>
        <textarea
          className="input min-h-24"
          placeholder="Ej: No es un examen y no hay respuestas correctas. Son frases sobre cómo trabajás…"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Se muestra antes de que empiece la etapa, y en las cronometradas el
          reloj arranca recién cuando la persona la cierra. Las plantillas ya
          vienen con su explicación y su ejemplo resuelto.
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary press flex-1">
          Cancelar
        </button>
        <button
          onClick={() => onSave({ title, description, minutes, timed, intro })}
          disabled={pending || !title.trim()}
          className="btn-primary press flex-[2] disabled:opacity-40"
        >
          Guardar etapa
        </button>
      </div>
    </div>
  );
}

// Las tres formas de sumar una etapa, juntas.
//
// Antes eran tres tarjetas grandes, siempre abiertas, debajo de las etapas.
// Para quien ya tenía su proceso armado eso era media pantalla ocupada por
// instrucciones de cómo armarlo, y encima empujaba el contenido real hacia
// arriba, fuera de la vista.
//
// Se abre sola cuando el proceso está vacío, porque ahí la pantalla en blanco
// es el problema, y se pliega en cuanto hay una etapa.
function AddStagePanel({
  detail,
  pending,
  plan,
  onApplyTemplate,
  onApplyRole,
  onAddStage,
}: {
  detail: ProcessDetail;
  pending: boolean;
  plan: PlanLimits;
  onApplyTemplate: (key: string) => void;
  onApplyRole: (key: string) => void;
  onAddStage: (i: { title: string; description: string; minutes: number }) => void;
}) {
  const vacio = detail.stages.length === 0;
  const [abierto, setAbierto] = useState(vacio);
  const [modo, setModo] = useState<"catalogo" | "ia" | "propia">("catalogo");
  const [newStage, setNewStage] = useState("");
  const [minutes, setMinutes] = useState(10);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="card press w-full p-4 flex items-center justify-center gap-2 text-sm font-medium text-primary border-dashed"
      >
        <Plus size={16} /> Agregar otra etapa
      </button>
    );
  }

  const OPCIONES = [
    { key: "catalogo" as const, label: "Test ya armado" },
    { key: "ia" as const, label: "Con el asistente" },
    { key: "propia" as const, label: "Armarla yo" },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-primary-dark text-sm">
            {vacio ? "Empezá por acá" : "Agregar una etapa"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {vacio
              ? "Un proceso necesita al menos una etapa con preguntas para poder publicarse."
              : "Podés combinar todo lo que quieras en el mismo proceso."}
          </p>
        </div>
        {!vacio && (
          <button
            onClick={() => setAbierto(false)}
            className="text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex gap-1 mt-3 border-b border-slate-200">
        {OPCIONES.map((o) => (
          <button
            key={o.key}
            onClick={() => setModo(o.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              modo === o.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {modo === "catalogo" && (
          <>
            {/* El catálogo va primero y es la opción por defecto: para la
                mayoría de los puestos alcanza con un test listo, y redactar
                preguntas desde cero es lo que hace que nadie termine de
                armar el proceso. */}
            <p className="text-xs text-slate-500 mb-3">
              Cinco Grandes, estilo laboral, juicio situacional y razonamiento.
              Se corrigen y se puntúan solos.
            </p>
            <TemplatePicker
              pending={pending}
              onPick={onApplyTemplate}
              onPickRole={onApplyRole}
            />
          </>
        )}

        {modo === "ia" && (
          <AiStageGenerator
            processId={detail.process.id}
            canUse={plan.ai}
            planLabel={plan.label}
            bare
          />
        )}

        {modo === "propia" && (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input flex-1"
                placeholder="Ej: Conocimientos del puesto"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={120}
                  className="input w-24"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  aria-label="Minutos estimados"
                />
                <button
                  onClick={() => {
                    onAddStage({ title: newStage, description: "", minutes });
                    setNewStage("");
                  }}
                  disabled={pending || !newStage.trim()}
                  className="btn-primary press disabled:opacity-40"
                >
                  Agregar
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Los minutos se le muestran al candidato antes de empezar: saber
              cuánto le va a llevar es lo que evita que abandone a la mitad.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
