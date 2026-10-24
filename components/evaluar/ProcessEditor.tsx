"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  CopyPlus,
  Link2,
  Lock,
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
import {
  KIND_LABEL,
  iniciados,
  mensajeBloqueo,
  modoCorreccion,
} from "@/lib/evaluar/puntaje";
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
  duplicateProcess,
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
  const [tab, setTab] = useState<Tab>(
    process.status !== "borrador" && participants.length > 0
      ? "candidatos"
      : "etapas"
  );
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

  // Con alguien que ya empezó, etapas y corrección quedan fijas (el
  // servidor lo vuelve a chequear en cada acción).
  const empezaron = iniciados(participants.map((p) => p.status));

  function duplicarComoVersion() {
    setError(null);
    startTransition(async () => {
      const r = await duplicateProcess(process.id);
      if (r.ok && r.id) router.push(`/evaluar/app/procesos/${r.id}`);
      else setError(r.error ?? "No pudimos duplicar el proceso.");
    });
  }

  const totalQuestions = stages.reduce((a, s) => a + s.questions.length, 0);
  const minutosTotales = stages.reduce((a, s) => a + (s.minutes || 0), 0);
  // Un proceso sin etapas no se puede publicar: el candidato entraría a una
  // evaluación vacía. Y tampoco con UNA etapa vacía: el candidato llegaba a
  // ella y quedaba frente a un botón que nunca se habilita. El servidor
  // vuelve a chequearlo al publicar.
  const etapaVacia = stages.find((s) => s.questions.length === 0);
  const canPublish = stages.length > 0 && totalQuestions > 0 && !etapaVacia;

  // El embudo, calculado una vez. "Esperando" es el numero que importa: son
  // los que ya terminaron y nadie miro todavia.
  const esperando = participants.filter((p) => p.status === "completado").length;
  const embudo = [
    { v: participants.length, l: "invitados", ac: false },
    {
      v: participants.filter((p) => p.status === "en_curso").length,
      l: "rindiendo",
      ac: false,
    },
    { v: esperando, l: "te esperan", ac: esperando > 0 },
    {
      v: participants.filter((p) =>
        ["finalista", "contratado"].includes(p.status)
      ).length,
      l: "finalistas",
      ac: false,
    },
  ];

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
                Te sumaron a este proceso
              </span>
            ) : process.status !== "activo" ? (
              <button
                disabled={!canPublish || pending}
                title={
                  canPublish
                    ? undefined
                    : etapaVacia
                      ? `La etapa «${etapaVacia.title}» no tiene preguntas`
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

        {/* Donde esta parada la gente. Es lo primero que se pregunta quien
            entra a un proceso ya publicado, y estaba a dos clics. */}
        {participants.length > 0 && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden mt-4"
            style={{
              background: "var(--nk-line, #e2e8f0)",
              border: "1px solid var(--nk-line, #e2e8f0)",
            }}
          >
            {embudo.map((e) => (
              <div
                key={e.l}
                className="px-4 py-3"
                style={{ background: "var(--nk-deep, #f8fafc)" }}
              >
                <p
                  className="text-xl font-medium leading-none m-0"
                  style={{ color: e.ac ? "var(--nk-300)" : undefined }}
                >
                  {e.v}
                </p>
                <p className="nk-mono mt-1.5" style={{ color: "#767676" }}>
                  {e.l}
                </p>
              </div>
            ))}
          </div>
        )}

        {!canPublish && process.status !== "activo" && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-3">
            {etapaVacia
              ? `La etapa «${etapaVacia.title}» no tiene preguntas: cargale al menos una o borrala para poder publicar.`
              : "Para publicar necesitás al menos una etapa con una pregunta. Así nadie entra a una evaluación vacía."}
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
          empezaron={empezaron}
          onDuplicate={duplicarComoVersion}
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
  empezaron,
  onDuplicate,
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
  /** Cuántos ya empezaron a rendir. Con uno, la estructura queda fija. */
  empezaron: number;
  onDuplicate: () => void;
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
    i: {
      title: string;
      description: string;
      minutes: number;
      timed: boolean;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      drawCount?: number | null;
    }
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
  // Plegadas de entrada, salvo que la etapa sea corta: con cinco preguntas
  // esconderlas es un clic de mas, con veinticinco es lo que hace legible la
  // pantalla. La que se esta editando se abre sola.
  const [abiertas, setAbiertas] = useState<Set<string>>(
    () =>
      new Set(
        detail.stages.filter((st) => st.questions.length <= 6).map((st) => st.id)
      )
  );
  const alternar = (id: string) =>
    setAbiertas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const [editQ, setEditQ] = useState<string | null>(null);
  const [editS, setEditS] = useState<string | null>(null);
  const fija = empezaron > 0;

  return (
    <div className="space-y-3">
      {fija && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-amber-200 bg-amber-50/60">
          <Lock size={18} className="text-amber-700 shrink-0" />
          <p className="text-sm text-amber-900 flex-1">{mensajeBloqueo(empezaron)}</p>
          {detail.esDueno && (
            <button
              onClick={onDuplicate}
              disabled={pending}
              className="btn-secondary press text-sm shrink-0 disabled:opacity-40"
            >
              <CopyPlus size={15} /> Duplicar como versión nueva
            </button>
          )}
        </div>
      )}

      {detail.stages.map((stage, i) => (
        <div key={stage.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Etapa {i + 1} · {stage.minutes} min
              </p>
              {/* Lo que cambia entre un candidato y otro. Sin esto no hay
                  forma de saber, mirando el proceso, que cada uno recibe
                  12 de 120 y no las 120. */}
              {(stage.draw_count || stage.shuffle_questions || stage.shuffle_options) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {!!stage.draw_count && stage.draw_count < stage.questions.length && (
                    <span className="chip bg-indigo-50 text-indigo-700">
                      Cada uno recibe {stage.draw_count} de {stage.questions.length}
                    </span>
                  )}
                  {stage.shuffle_questions && (
                    <span className="chip bg-slate-100 text-slate-600">Orden al azar</span>
                  )}
                  {stage.shuffle_options && (
                    <span className="chip bg-slate-100 text-slate-600">Opciones mezcladas</span>
                  )}
                </div>
              )}
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
              {!fija && (
              <>
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
              </>
              )}
              <button
                onClick={() => setEditS(editS === stage.id ? null : stage.id)}
                disabled={pending}
                aria-label="Editar etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press"
              >
                <Pencil size={15} />
              </button>
              {!fija && (
              <button
                onClick={() => {
                  // Borrar una etapa borra en cascada las respuestas que ya
                  // dieron los candidatos: un toque de más no puede costar eso.
                  const aviso =
                    detail.participants.length > 0
                      ? `¿Borrar la etapa «${stage.title}»? Se pierden también las respuestas que ya dieron los candidatos en ella, y no se puede deshacer.`
                      : `¿Borrar la etapa «${stage.title}»?`;
                  if (window.confirm(aviso)) onDeleteStage(stage.id);
                }}
                disabled={pending}
                aria-label="Borrar etapa"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press"
              >
                <Trash2 size={15} />
              </button>
              )}
            </div>
          </div>

          {editS === stage.id && (
            <StageForm
              stage={stage}
              pending={pending}
              soloTextos={fija}
              onCancel={() => setEditS(null)}
              onSave={(input) => {
                onUpdateStage(stage.id, input);
                setEditS(null);
              }}
            />
          )}

          {stage.questions.length > 0 && !abiertas.has(stage.id) && (
            <button
              onClick={() => alternar(stage.id)}
              className="w-full mt-3 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm press"
              style={{
                border: "1px dashed var(--nk-line, #e2e8f0)",
                color: "#666666",
              }}
            >
              <span>
                Ver las {stage.questions.length} preguntas
              </span>
              <ChevronDown size={16} />
            </button>
          )}

          {abiertas.has(stage.id) && (
          <ul className="mt-3 space-y-2">
            {stage.questions.map((q, qi) =>
              editQ === q.id ? (
                <li key={q.id}>
                  <QuestionForm
                    pending={pending}
                    initial={q}
                    soloTexto={fija}
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
                      {KIND_LABEL[q.kind] ?? q.kind}
                    </span>
                    {(() => {
                      // Cómo se corrige. Antes todo lo que no tenía respuesta
                      // correcta decía "la juzga el evaluador", incluidos los
                      // ítems de plantilla, que se corrigen solos.
                      const modo = modoCorreccion(q);
                      return modo === "correcta" ? (
                        <span className="chip bg-emerald-50 text-emerald-700">
                          {q.weight === 1 ? "Vale 1 punto" : `Vale ${q.weight} puntos`}
                        </span>
                      ) : modo === "por_opcion" ? (
                        <span className="chip bg-emerald-50 text-emerald-700">
                          Puntos por opción
                        </span>
                      ) : modo === "rasgo" ? (
                        <span className="chip bg-indigo-50 text-indigo-700">
                          Suma al perfil
                        </span>
                      ) : (
                        <span className="chip bg-slate-100 text-slate-500">
                          Sin corrección automática
                        </span>
                      );
                    })()}
                    {q.knockout && (
                      <span className="chip bg-red-50 text-danger">
                        excluyente
                      </span>
                    )}
                  </div>
                </div>
                {/* Las de figuras no se editan a mano: sus opciones son
                    códigos de dibujo y tocarlos rompe la figura y la clave. */}
                {q.kind !== "figura" && (
                <button
                  onClick={() => setEditQ(q.id)}
                  disabled={pending}
                  aria-label="Editar pregunta"
                  className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-primary press shrink-0"
                >
                  <Pencil size={14} />
                </button>
                )}
                {!fija && (
                <button
                  onClick={() => {
                    const aviso =
                      detail.participants.length > 0
                        ? "¿Borrar esta pregunta? Se pierden las respuestas que ya le dieron los candidatos y no se puede deshacer."
                        : "¿Borrar esta pregunta?";
                    if (window.confirm(aviso)) onDeleteQuestion(q.id);
                  }}
                  disabled={pending}
                  aria-label="Borrar pregunta"
                  className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press shrink-0"
                >
                  <X size={14} />
                </button>
                )}
              </li>
              )
            )}
          </ul>
          )}

          {stage.questions.length > 6 && abiertas.has(stage.id) && (
            <button
              onClick={() => alternar(stage.id)}
              className="w-full mt-2 py-2 text-xs press"
              style={{ color: "#767676" }}
            >
              <ChevronUp size={14} /> Plegar las preguntas
            </button>
          )}

          {fija ? null : openQ === stage.id ? (
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
              className="btn-secondary press text-sm flex-1 mt-3"
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
      {!fija && (
      <AddStagePanel
        detail={detail}
        pending={pending}
        plan={plan}
        onApplyTemplate={onApplyTemplate}
        onApplyRole={onApplyRole}
        onAddStage={onAddStage}
      />
      )}
    </div>
  );
}

function QuestionForm({
  pending,
  initial,
  soloTexto = false,
  onSave,
  onCancel,
}: {
  pending: boolean;
  /** Pregunta existente: si viene, el formulario edita en vez de crear. */
  initial?: EvaluarQuestion;
  /** Con candidatos rindiendo: solo se corrige el enunciado. */
  soloTexto?: boolean;
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
      {soloTexto && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2">
          Ya hay candidatos rindiendo: podés corregir el enunciado, pero las
          opciones, la correcta, el puntaje y si es excluyente quedan fijos.
        </p>
      )}
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
          {/* "Opción múltiple" ya no se ofrece: solo dejaba marcar una
              correcta y el candidato elegía una sola, así que era una opción
              única con otro nombre. Se muestra solo al editar una vieja. */}
          {initial?.kind === "multiple" && (
            <option value="multiple">Opción única (creada como «múltiple»)</option>
          )}
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
                  disabled={soloTexto}
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
                  className="input flex-1 disabled:opacity-60"
                  placeholder={`Opción ${i + 1}`}
                  disabled={soloTexto}
                  value={o}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                />
                {options.length > 2 && !soloTexto && (
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
          {!soloTexto && (
            <button
              type="button"
              onClick={() => setOptions([...options, ""])}
              className="text-xs text-primary font-medium mt-2"
            >
              + Otra opción
            </button>
          )}
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
              className="input w-20 disabled:opacity-60"
              disabled={soloTexto}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700 flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5 accent-red-500"
              disabled={soloTexto}
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
  soloTextos = false,
  onSave,
  onCancel,
}: {
  stage: ProcessDetail["stages"][number];
  pending: boolean;
  /** Con candidatos rindiendo: el tiempo y el cronómetro quedan fijos. */
  soloTextos?: boolean;
  onCancel: () => void;
  onSave: (i: {
    title: string;
    description: string;
    minutes: number;
    timed: boolean;
    intro: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    drawCount: number | null;
  }) => void;
}) {
  const [title, setTitle] = useState(stage.title);
  const [mezclarOrden, setMezclarOrden] = useState(!!stage.shuffle_questions);
  const [mezclarOpciones, setMezclarOpciones] = useState(!!stage.shuffle_options);
  const total = stage.questions.length;
  const [sortear, setSortear] = useState(
    !!stage.draw_count && stage.draw_count < total
  );
  const [cuantas, setCuantas] = useState(
    stage.draw_count && stage.draw_count < total ? stage.draw_count : Math.max(1, Math.ceil(total / 2))
  );
  const soloEscalas =
    total > 0 && stage.questions.every((q) => q.kind === "likert" || q.kind === "escala");
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
            className="input w-24 disabled:opacity-60"
            disabled={soloTextos}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
        <label className="text-sm text-slate-700 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary"
            disabled={soloTextos}
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

      {/* Que cada candidato vea una prueba distinta. Es lo que hace inútil
          pasarse las respuestas: la 7 de uno no es la 7 del otro, y con un
          banco grande ni siquiera es la misma pregunta. */}
      <fieldset className="rounded-2xl border border-slate-200 p-3.5 space-y-2.5">
        <legend className="text-sm font-semibold text-primary-dark px-1">
          Para que no se copien
        </legend>
        <label className="text-sm text-slate-700 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary"
            checked={mezclarOrden}
            onChange={(e) => setMezclarOrden(e.target.checked)}
          />
          Cada candidato ve las preguntas en otro orden
        </label>
        <label className={`text-sm flex items-center gap-2 ${soloEscalas ? "text-slate-400" : "text-slate-700"}`}>
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary"
            disabled={soloEscalas}
            checked={mezclarOpciones && !soloEscalas}
            onChange={(e) => setMezclarOpciones(e.target.checked)}
          />
          Mezclar el orden de las opciones
          {soloEscalas && " (no aplica a escalas de acuerdo)"}
        </label>
        <label className="text-sm text-slate-700 flex flex-wrap items-center gap-2">
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary"
            disabled={soloTextos || total < 2}
            checked={sortear}
            onChange={(e) => setSortear(e.target.checked)}
          />
          Sortear
          <input
            type="number"
            min={1}
            max={Math.max(1, total - 1)}
            disabled={soloTextos || !sortear}
            aria-label="Cuántas preguntas sortear"
            className="input w-20 disabled:opacity-60"
            value={cuantas}
            onChange={(e) => setCuantas(Number(e.target.value))}
          />
          de las {total} preguntas para cada candidato
        </label>
        {sortear && (
          <p className="text-xs text-slate-500">
            El sorteo se reparte en proporción entre los rasgos que mide la
            etapa, y las preguntas excluyentes entran siempre. Cada uno queda
            con su formulario aunque recargue la página.
          </p>
        )}
      </fieldset>

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
          onClick={() =>
            onSave({
              title,
              description,
              minutes,
              timed,
              intro,
              shuffleQuestions: mezclarOrden,
              shuffleOptions: mezclarOpciones && !soloEscalas,
              drawCount: sortear ? cuantas : null,
            })
          }
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
              Personalidad, competencias, juicio situacional, razonamiento con
              figuras y números, atención al detalle e integridad. Se corrigen
              solos, y en los bancos cada candidato recibe preguntas distintas.
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
