"use client";

import { useState, useTransition } from "react";
import type { ChatMessage } from "@/lib/types";
import { sendChatMessage } from "@/app/actions";
import { timeAgo } from "@/lib/format";

export interface ChatThread {
  applicationId: string;
  jobTitle: string;
  // Nombre del interlocutor: la empresa (vista candidato) o el candidato (vista empresa)
  companyName: string;
  messages: ChatMessage[];
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
  const [, startTransition] = useTransition();

  const active = threads.find((t) => t.applicationId === activeId);
  const messages = local[activeId] ?? [];

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
    setLocal((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setDraft("");
    startTransition(() => {
      sendChatMessage(activeId, viewAs, content);
    });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
        💬 Mensajes
      </h1>
      <div className="card overflow-hidden lg:grid lg:grid-cols-[280px_1fr] lg:min-h-[480px]">
        {/* Lista de hilos */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-100 max-h-40 lg:max-h-none overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.applicationId}
              onClick={() => setActiveId(t.applicationId)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 ${
                t.applicationId === activeId ? "bg-blue-50" : "hover:bg-surface"
              }`}
            >
              <p className="text-sm font-semibold text-primary-dark truncate">
                {t.companyName}
              </p>
              <p className="text-xs text-gray-500 truncate">{t.jobTitle}</p>
            </button>
          ))}
        </div>

        {/* Conversación */}
        <div className="flex flex-col min-h-72">
          <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                {viewAs === "candidate"
                  ? "Empezá la conversación: presentate y contá por qué te interesa el puesto. 👋"
                  : "Escribile al candidato: coordiná una llamada o hacé la primera pregunta. 👋"}
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.sender === viewAs
                    ? "ml-auto bg-primary text-white rounded-br-md"
                    : "bg-surface text-gray-700 rounded-bl-md"
                }`}
              >
                <p>{m.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    m.sender === viewAs ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {timeAgo(m.created_at)}
                </p>
              </div>
            ))}
          </div>
          {/* Plantillas de respuesta rápida */}
          <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto scroll-thin">
            {quickReplies.map((q) => (
              <button
                key={q}
                className="chip bg-surface text-gray-600 border border-gray-200 hover:border-primary hover:text-primary whitespace-nowrap shrink-0"
                onClick={() => setDraft(q)}
              >
                {q.length > 32 ? q.slice(0, 30) + "…" : q}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-3 flex gap-2">
            <input
              className="input flex-1"
              placeholder={`Mensaje para ${active?.companyName ?? (viewAs === "candidate" ? "la empresa" : "el candidato")}…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              className="btn-primary shrink-0"
              disabled={!draft.trim()}
              onClick={send}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        🔒 Consejo: mantené la conversación dentro de Worka hasta confirmar que
        la empresa es real. Nunca compartas datos bancarios.
      </p>
    </div>
  );
}
