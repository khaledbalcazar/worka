"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Link2,
  MessageCircle,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { ProcessDetail } from "@/lib/evaluar";
import TemplatePicker from "./TemplatePicker";
import {
  addQuestion,
  addStage,
  applyTemplate,
  deleteQuestion,
  deleteStage,
  inviteBatch,
  inviteParticipant,
  updateProcess,
} from "@/app/evaluar/actions";

type Tab = "etapas" | "candidatos" | "ajustes";

export default function ProcessEditor({
  detail,
  jobs,
}: {
  detail: ProcessDetail;
  jobs: { id: string; title: string; linked: boolean }[];
}) {
  const router = useRouter();
  const { process, stages, participants } = detail;
  const [tab, setTab] = useState<Tab>("etapas");
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
            {process.job ? (
              <p className="text-sm text-primary mt-1 flex items-center gap-1.5">
                <Link2 size={14} /> Enlazado a «{process.job.title}»
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-1">
                Sin vacante enlazada
              </p>
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
            {process.status !== "activo" ? (
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
            ["ajustes", "Ajustes"],
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
      </div>

      {tab === "etapas" && (
        <StagesTab
          detail={detail}
          pending={pending}
          onApplyTemplate={(key) => run(() => applyTemplate(process.id, key))}
          onAddStage={(input) => run(() => addStage(process.id, input))}
          onDeleteStage={(sid) => run(() => deleteStage(process.id, sid))}
          onAddQuestion={(sid, input) =>
            run(() => addQuestion(process.id, sid, input))
          }
          onDeleteQuestion={(qid) => run(() => deleteQuestion(process.id, qid))}
        />
      )}

      {tab === "candidatos" && (
        <CandidatesTab
          detail={detail}
          pending={pending}
          onInvite={(input) =>
            startTransition(async () => {
              const r = await inviteParticipant(process.id, input);
              if (r.ok) router.refresh();
              else setError(r.error ?? "No pudimos invitar.");
            })
          }
          onInviteBatch={(raw) =>
            startTransition(async () => {
              const r = await inviteBatch(process.id, raw);
              if (r.ok) router.refresh();
              else setError(r.error ?? "No pudimos cargar la lista.");
            })
          }
        />
      )}

      {tab === "ajustes" && (
        <SettingsTab
          detail={detail}
          jobs={jobs}
          pending={pending}
          onSave={(input) => run(() => updateProcess(process.id, input))}
        />
      )}
    </div>
  );
}

// ── Etapas y preguntas ─────────────────────────────────────────

function StagesTab({
  detail,
  pending,
  onApplyTemplate,
  onAddStage,
  onDeleteStage,
  onAddQuestion,
  onDeleteQuestion,
}: {
  detail: ProcessDetail;
  pending: boolean;
  onApplyTemplate: (key: string) => void;
  onAddStage: (i: { title: string; description: string; minutes: number }) => void;
  onDeleteStage: (id: string) => void;
  onAddQuestion: (
    stageId: string,
    i: {
      text: string;
      kind: "unica" | "multiple" | "texto" | "escala" | "numero";
      options: string[];
      correctIndex: number | null;
      weight: number;
      knockout: boolean;
    }
  ) => void;
  onDeleteQuestion: (id: string) => void;
}) {
  const [newStage, setNewStage] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [openQ, setOpenQ] = useState<string | null>(null);

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
            <button
              onClick={() => onDeleteStage(stage.id)}
              disabled={pending}
              aria-label="Borrar etapa"
              className="w-9 h-9 grid place-items-center rounded-full text-slate-300 hover:text-danger press shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {stage.questions.map((q, qi) => (
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
                  onClick={() => onDeleteQuestion(q.id)}
                  disabled={pending}
                  aria-label="Borrar pregunta"
                  className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press shrink-0"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
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

      {/* El catálogo va primero: para la mayoría de los puestos alcanza con
          un test listo, y redactar preguntas desde cero es lo que hace que
          nadie termine de armar el proceso. */}
      <div className="card p-5">
        <h3 className="font-semibold text-primary-dark text-sm">
          Agregar un test ya armado
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Cinco Grandes, estilo laboral, juicio situacional y razonamiento. Se
          corrigen y se puntúan solos.
        </p>
        <TemplatePicker pending={pending} onPick={onApplyTemplate} />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-primary-dark text-sm">
          O armar una etapa propia
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
          Los minutos se le muestran al candidato antes de empezar: saber cuánto
          le va a llevar es lo que evita que abandone a la mitad.
        </p>
      </div>
    </div>
  );
}

function QuestionForm({
  pending,
  onSave,
  onCancel,
}: {
  pending: boolean;
  onCancel: () => void;
  onSave: (i: {
    text: string;
    kind: "unica" | "multiple" | "texto" | "escala" | "numero";
    options: string[];
    correctIndex: number | null;
    weight: number;
    knockout: boolean;
  }) => void;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<
    "unica" | "multiple" | "texto" | "escala" | "numero"
  >("unica");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(0);
  const [weight, setWeight] = useState(1);
  const [knockout, setKnockout] = useState(false);

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
          className="input"
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
        >
          <option value="unica">Opción única</option>
          <option value="multiple">Opción múltiple</option>
          <option value="texto">Respuesta escrita</option>
          <option value="escala">Escala 1 a 5</option>
          <option value="numero">Número</option>
        </select>
      </div>

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
            onSave({ text, kind, options, correctIndex, weight, knockout })
          }
          disabled={pending || !text.trim()}
          className="btn-primary press flex-[2] disabled:opacity-40"
        >
          Guardar pregunta
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
}: {
  detail: ProcessDetail;
  pending: boolean;
  onInvite: (i: { full_name: string; email?: string; phone?: string }) => void;
  onInviteBatch: (raw: string) => void;
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
