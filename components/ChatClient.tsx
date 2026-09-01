"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ChatMessage } from "@/lib/types";
import { sendChatMessage } from "@/app/actions";
import { timeAgo, toPyWhatsapp } from "@/lib/format";

export interface ChatThread {
  applicationId: string;
  jobTitle: string;
  // Nombre del interlocutor: la empresa (vista candidato) o el candidato (vista empresa)
  companyName: string;
  messages: ChatMessage[];
  // Solo del lado empresa: llevan a los dos botones del encabezado del hilo.
  peerHref?: string | null;
  peerPhone?: string;
}

/* Colores de avatar.
   Salen del nombre y no de un contador, para que la misma persona tenga
   siempre el mismo color: si dependiera de la posición en la lista, cambiaría
   cada vez que llega un mensaje nuevo y reordena. */
const AVATAR = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

function colorDe(nombre: string) {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) | 0;
  return AVATAR[Math.abs(h) % AVATAR.length];
}

function iniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function Avatar({
  nombre,
  size = 36,
}: {
  nombre: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full shrink-0 grid place-items-center font-bold text-white"
      style={{
        width: size,
        height: size,
        background: colorDe(nombre),
        fontSize: size <= 28 ? 10 : 11,
      }}
      aria-hidden
    >
      {iniciales(nombre)}
    </div>
  );
}

// Chat compartido por ambos lados: viewAs define quién escribe y cómo se
// alinean las burbujas (los mensajes propios siempre a la derecha).
export default function ChatClient({
  threads,
  viewAs = "candidate",
}: {
  threads: ChatThread[];
  viewAs?: "candidate" | "company";
}) {
  const [activeId, setActiveId] = useState(threads[0]?.applicationId ?? "");
  const [local, setLocal] = useState<Record<string, ChatMessage[]>>(
    Object.fromEntries(threads.map((t) => [t.applicationId, t.messages]))
  );
  const [draft, setDraft] = useState("");
  // En el celular no entran los dos paneles: se ve la lista o se ve el hilo.
  const [verHilo, setVerHilo] = useState(false);
  const [, startTransition] = useTransition();
  const finRef = useRef<HTMLDivElement>(null);

  const active = threads.find((t) => t.applicationId === activeId);
  const messages = local[activeId] ?? [];

  // El hilo abre abajo de todo, donde está lo último que se dijo. Sin esto
  // cada conversación se abre en su primer mensaje, que suele ser de hace
  // semanas, y hay que bajar a mano para ver de qué se estaba hablando.
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, messages.length]);

  // Plantillas de respuesta rápida según quién escribe.
  const quickReplies =
    viewAs === "company"
      ? [
          "¡Hola! Gracias por postularte 🙌",
          "Nos gustaría coordinar una entrevista. ¿Qué día te queda cómodo?",
          "¿Podés contarnos un poco de tu experiencia?",
          "Quedó cubierto el puesto por ahora, ¡gracias por tu interés!",
        ]
      : [
          "¡Hola! Sí, sigo muy interesado/a 🙌",
          "¿Cuándo podríamos coordinar la entrevista?",
          "Gracias, quedo atento/a a novedades.",
          "¿El puesto es presencial o remoto?",
        ];

  function abrir(id: string) {
    setActiveId(id);
    setVerHilo(true);
    setDraft("");
  }

  function send() {
    const content = draft.trim();
    if (!content || !active) return;
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      application_id: activeId,
      sender: viewAs,
      content,
      created_at: new Date().toISOString(),
    };
    setLocal((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), msg],
    }));
    setDraft("");
    startTransition(() => {
      sendChatMessage(activeId, viewAs, content);
    });
  }

  const otro = viewAs === "candidate" ? "la empresa" : "el candidato";

  return (
    <div className="space-y-3">
      <div
        className="flex bg-white rounded-xl border border-slate-100 overflow-hidden"
        style={{ height: "calc(100vh - 190px)", minHeight: 420 }}
      >
        {/* ── Lista de conversaciones ─────────────────────────────────── */}
        <div
          className={`w-full lg:w-72 shrink-0 flex-col border-r border-slate-100 ${
            verHilo ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="px-4 py-4 shrink-0 border-b border-slate-100">
            <h1 className="text-sm font-bold text-slate-900">Mensajes</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {threads.length} conversación{threads.length === 1 ? "" : "es"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => {
              const activo = t.applicationId === activeId;
              const msgs = local[t.applicationId] ?? [];
              const ultimo = msgs[msgs.length - 1];
              return (
                <button
                  key={t.applicationId}
                  onClick={() => abrir(t.applicationId)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-slate-50 transition-colors cursor-pointer ${
                    activo ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar nombre={t.companyName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          activo ? "text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {t.companyName}
                      </p>
                      {ultimo && (
                        <p className="shrink-0 text-[9px] text-slate-300">
                          {timeAgo(ultimo.created_at)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5 text-slate-400">
                      {t.jobTitle}
                    </p>
                    <p className="text-xs truncate mt-0.5 text-slate-400">
                      {ultimo
                        ? `${ultimo.sender === viewAs ? "Vos: " : ""}${ultimo.content}`
                        : "Sin mensajes todavía"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Hilo ────────────────────────────────────────────────────── */}
        <div
          className={`flex-1 flex-col min-w-0 ${verHilo ? "flex" : "hidden lg:flex"}`}
        >
          {!active ? (
            <div className="flex-1 grid place-items-center">
              <p className="text-sm text-slate-400">
                Elegí una conversación de la izquierda.
              </p>
            </div>
          ) : (
            <>
              <div className="h-14 px-4 lg:px-5 flex items-center justify-between shrink-0 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setVerHilo(false)}
                    aria-label="Volver a la lista"
                    className="lg:hidden text-slate-400 text-lg leading-none -ml-1 cursor-pointer"
                  >
                    ←
                  </button>
                  <Avatar nombre={active.companyName} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {active.companyName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {active.jobTitle}
                    </p>
                  </div>
                </div>
                {/* En el celular los dos botones con texto no dejaban lugar al
                    nombre: "Lucía Martínez" se leía "Lucí…". Abajo de sm van
                    como íconos, con el nombre accesible en aria-label. */}
                <div className="flex items-center gap-2 shrink-0">
                  {active.peerHref && (
                    <Link
                      href={active.peerHref}
                      aria-label={`Ver el perfil de ${active.companyName}`}
                      className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <span className="sm:hidden" aria-hidden>
                        👤
                      </span>
                      <span className="hidden sm:inline">Ver perfil</span>
                    </Link>
                  )}
                  {active.peerPhone && (
                    <a
                      href={`https://wa.me/${toPyWhatsapp(active.peerPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escribirle a ${active.companyName} por WhatsApp`}
                      className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg text-white bg-[#25d366] hover:bg-green-500 transition-colors"
                    >
                      💬<span className="hidden sm:inline"> WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 lg:px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-10">
                    {viewAs === "candidate"
                      ? "Empezá la conversación: presentate y contá por qué te interesa el puesto. 👋"
                      : "Escribile al candidato: coordiná una llamada o hacé la primera pregunta. 👋"}
                  </p>
                )}
                {messages.map((m) => {
                  const mio = m.sender === viewAs;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mio ? "justify-end" : "justify-start"}`}
                    >
                      {!mio && (
                        <div className="mr-2 mt-1">
                          <Avatar nombre={active.companyName} size={28} />
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        <div
                          className={`px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                            mio
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-slate-100 text-slate-700 rounded-bl-md"
                          }`}
                        >
                          {m.content}
                        </div>
                        <p
                          className={`text-[10px] mt-1 text-slate-300 ${
                            mio ? "text-right" : "text-left"
                          }`}
                        >
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={finRef} />
              </div>

              {/* Plantillas de respuesta rápida */}
              <div className="px-4 lg:px-5 pt-2 pb-1 flex gap-1.5 overflow-x-auto scroll-hover shrink-0">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => setDraft(q)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {q.length > 32 ? q.slice(0, 30) + "…" : q}
                  </button>
                ))}
              </div>

              <div className="px-4 lg:px-5 py-3.5 shrink-0 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={`Responder a ${active.companyName}…`}
                    className="input flex-1"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim()}
                    aria-label="Enviar mensaje"
                    className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 transition-colors ${
                      draft.trim()
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M12.5 7L1.5 1.5l2.5 5.5-2.5 5.5L12.5 7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <p className="text-[11px] mt-2 text-center text-slate-300">
                  Enter para enviar
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        🔒 Mantené la conversación dentro de Worka hasta confirmar que{" "}
        {otro === "la empresa" ? "la empresa" : "la persona"} es real. Nunca
        compartas datos bancarios.
      </p>
    </div>
  );
}
