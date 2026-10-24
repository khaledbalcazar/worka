"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Lightbulb, MessageSquareText, RotateCcw, Sparkles, TriangleAlert, Wand2 } from "lucide-react";
import {
  aiCandidateBrief,
  aiCompareFinalists,
  aiSuggestIdealProfile,
  aiWriteProcessText,
  type CandidateBrief,
  type FinalistsComparison,
  type IdealSuggestion,
} from "@/app/evaluar/ai-actions";

// Piezas del asistente de IA en el panel de Evaluar.
//
// Todo lo que sale de la IA se ve igual: borde violeta, la chispa y la
// aclaración de que es una lectura para revisar. Así nadie confunde una
// sugerencia del asistente con un resultado medido de la evaluación.

const UPGRADE = "Incluido en los planes Profesional y Corporativo.";

export function AiPill({
  onClick,
  pending,
  children,
  disabled,
}: {
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={pending || disabled} className="ai-pill press">
      <Sparkles size={14} className={pending ? "ai-spark-spin" : ""} />
      {children}
    </button>
  );
}

// Mientras la IA piensa: mensajes que avanzan y renglones que se van
// dibujando, para que la espera de unos segundos no parezca un cuelgue.
export function AiThinking({ mensajes }: { mensajes: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % mensajes.length), 1500);
    return () => clearInterval(id);
  }, [mensajes.length]);
  return (
    <div className="py-2" role="status" aria-live="polite">
      <p key={i} className="text-sm text-[#5d5294] font-medium flex items-center gap-2 animate-rise">
        <Sparkles size={15} className="ai-spark-spin" /> {mensajes[i]}
      </p>
      <div className="mt-3 space-y-2" aria-hidden>
        <div className="ai-line w-full" />
        <div className="ai-line w-11/12" style={{ animationDelay: ".15s" }} />
        <div className="ai-line w-4/5" style={{ animationDelay: ".3s" }} />
      </div>
    </div>
  );
}

function AiFooter({ demo }: { demo?: boolean }) {
  return (
    <p className="text-[11px] text-slate-400 mt-4 flex items-start gap-1.5">
      <Sparkles size={12} className="shrink-0 mt-0.5" />
      {demo
        ? "Ejemplo del modo demostración. Con la base conectada lo escribe el asistente con los datos reales."
        : "Lo escribió el asistente con los resultados. Es una lectura para ayudarte, no un veredicto: revisalo antes de decidir."}
    </p>
  );
}

function AiError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl bg-red-50 text-danger text-sm px-4 py-3 flex items-start gap-2">
      <TriangleAlert size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{error}</span>
      <button type="button" onClick={onRetry} className="font-semibold underline shrink-0">
        Reintentar
      </button>
    </div>
  );
}

// ── Informe: resumen y preguntas de entrevista ─────────────────

export function AiCandidateBrief({
  processId,
  participantId,
  enabled,
}: {
  processId: string;
  participantId: string;
  enabled: boolean;
}) {
  const [data, setData] = useState<CandidateBrief | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pedir() {
    setError(null);
    start(async () => {
      const r = await aiCandidateBrief(processId, participantId);
      if (r.ok) {
        setData(r.data);
        setDemo(!!r.demo);
      } else setError(r.error);
    });
  }

  return (
    <section className="ai-card p-5 print:hidden">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Sparkles size={16} className="text-[#5d5294]" /> Lectura con IA
        </h2>
        {data && !pending && (
          <button type="button" onClick={pedir} className="text-xs text-[#5d5294] font-semibold flex items-center gap-1">
            <RotateCcw size={12} /> Otra vez
          </button>
        )}
      </div>

      {!enabled ? (
        <p className="text-sm text-slate-500 mt-1.5">Un resumen del informe y preguntas para la entrevista. {UPGRADE}</p>
      ) : pending ? (
        <AiThinking mensajes={["Leyendo el informe…", "Cruzando con lo que pide el puesto…", "Armando preguntas para la entrevista…"]} />
      ) : error ? (
        <div className="mt-3">
          <AiError error={error} onRetry={pedir} />
        </div>
      ) : !data ? (
        <>
          <p className="text-sm text-slate-500 mt-1.5">
            Un resumen en criollo del informe, qué conviene verificar y preguntas listas para la entrevista.
          </p>
          <div className="mt-3">
            <AiPill onClick={pedir}>Generar lectura</AiPill>
          </div>
        </>
      ) : (
        <div className="mt-3 space-y-4 animate-rise">
          <p className="text-sm text-slate-700 leading-relaxed">{data.resumen}</p>
          {data.fortalezas.length > 0 && (
            <AiList titulo="A favor" Icon={CheckCircle2} color="text-emerald-600" items={data.fortalezas} />
          )}
          {data.explorar.length > 0 && (
            <AiList titulo="Para verificar" Icon={Lightbulb} color="text-amber-600" items={data.explorar} />
          )}
          {data.preguntas.length > 0 && (
            <AiList titulo="Preguntas para la entrevista" Icon={MessageSquareText} color="text-[#5d5294]" items={data.preguntas} />
          )}
          <AiFooter demo={demo} />
        </div>
      )}
    </section>
  );
}

function AiList({
  titulo,
  Icon,
  color,
  items,
}: {
  titulo: string;
  Icon: typeof Sparkles;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{titulo}</p>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="text-sm text-slate-700 flex items-start gap-2 animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
            <Icon size={15} className={`shrink-0 mt-0.5 ${color}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Tablero: comparar finalistas ───────────────────────────────

export function AiFinalists({ processId, enabled }: { processId: string; enabled: boolean }) {
  const [data, setData] = useState<FinalistsComparison | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pedir() {
    setError(null);
    start(async () => {
      const r = await aiCompareFinalists(processId);
      if (r.ok) {
        setData(r.data);
        setDemo(!!r.demo);
      } else setError(r.error);
    });
  }

  return (
    <section className="ai-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-primary-dark flex items-center gap-2">
            <Sparkles size={16} className="text-[#5d5294]" /> Comparar con IA
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {enabled
              ? "Qué distingue a cada finalista y qué verificar antes de decidir."
              : `Qué distingue a cada finalista y qué verificar. ${UPGRADE}`}
          </p>
        </div>
        {enabled && !pending && (
          <AiPill onClick={pedir}>{data ? "Comparar otra vez" : "Comparar finalistas"}</AiPill>
        )}
      </div>

      {pending && (
        <div className="mt-3">
          <AiThinking mensajes={["Mirando a los que terminaron…", "Comparando con el perfil del puesto…", "Buscando qué los diferencia…"]} />
        </div>
      )}
      {error && !pending && (
        <div className="mt-3">
          <AiError error={error} onRetry={pedir} />
        </div>
      )}
      {data && !pending && (
        <div className="mt-4 animate-rise">
          <p className="text-sm text-slate-700 leading-relaxed">{data.lectura}</p>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {data.candidatos.map((c, i) => (
              <div
                key={c.id}
                className="rounded-xl border border-[#e0dfdc] bg-white p-3.5 animate-rise"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-sm font-semibold text-primary-dark">{c.nombre}</p>
                <p className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" /> {c.aFavor}
                </p>
                <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5">
                  <Lightbulb size={13} className="text-amber-600 shrink-0 mt-0.5" /> {c.aCuidar}
                </p>
              </div>
            ))}
          </div>
          {data.siguientePaso && (
            <p className="text-sm mt-4 rounded-xl bg-[#efedfb] text-[#3f3870] px-4 py-3">
              <strong className="font-semibold">Siguiente paso:</strong> {data.siguientePaso}
            </p>
          )}
          <AiFooter demo={demo} />
        </div>
      )}
    </section>
  );
}

// ── Ajustes: perfil ideal y textos ─────────────────────────────

export function AiIdealButton({
  processId,
  onSuggest,
}: {
  processId: string;
  onSuggest: (s: IdealSuggestion) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <AiPill
        pending={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await aiSuggestIdealProfile(processId);
            if (r.ok) onSuggest(r.data);
            else setError(r.error);
          })
        }
      >
        {pending ? "Pensando…" : "Sugerir con IA"}
      </AiPill>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}

export function AiWriteButton({
  processId,
  kind,
  value,
  onText,
}: {
  processId: string;
  kind: "descripcion" | "cierre";
  value: string;
  onText: (t: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        className="text-xs font-semibold text-[#5d5294] inline-flex items-center gap-1 press disabled:opacity-60"
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await aiWriteProcessText(processId, kind, value);
            if (r.ok) onText(r.data.text);
            else setError(r.error);
          })
        }
      >
        <Wand2 size={13} className={pending ? "ai-spark-spin" : ""} />
        {pending ? "Escribiendo…" : value.trim() ? "Mejorar con IA" : "Escribir con IA"}
      </button>
      {error && <span className="text-[11px] text-danger mt-1">{error}</span>}
    </span>
  );
}
