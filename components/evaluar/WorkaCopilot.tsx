"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp, SquarePen, X } from "lucide-react";
import { askCopilot, type CopilotMessage } from "@/app/evaluar/copilot-actions";

// Worka Copilot: botón en la barra superior y un chat que se abre al
// costado, sin sacar a la persona de lo que estaba mirando.
//
// La conversación vive en la pestaña (sessionStorage): sobrevive a navegar
// entre procesos, pero no queda guardada en ningún lado.

const CLAVE = "worka-copilot";

const FRASES = ["Preguntá lo que necesites", "Armá un proceso", "Entendé un informe", "Compará finalistas", "Invitá candidatos"];

function sugerencias(path: string): string[] {
  if (/\/procesos\/[^/]+\/informe\//.test(path))
    return ["¿Cómo leo este informe?", "¿Qué le pregunto en la entrevista?", "¿Qué significa el ajuste al puesto?"];
  if (/\/procesos\/[^/]+/.test(path))
    return ["¿Cómo invito candidatos?", "¿Qué me falta para publicar?", "¿Cómo va este proceso?", "¿Cómo defino qué importa en el puesto?"];
  return ["¿Cómo creo mi primer proceso?", "¿Cómo enlazo una vacante de Worka?", "¿Qué pruebas me recomendás para un cajero?", "¿Qué incluye mi plan?"];
}

export default function WorkaCopilot() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<CopilotMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Índice del mensaje que se está «escribiendo» con el efecto de tipeo.
  const [tipeando, setTipeando] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Recuperar la conversación de esta pestaña.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CLAVE);
      if (raw) {
        const saved = JSON.parse(raw) as CopilotMessage[];
        queueMicrotask(() => setMsgs(saved));
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(msgs.slice(-30)));
    } catch {}
  }, [msgs]);

  // Ctrl/⌘ + J abre y cierra; Esc cierra.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  // Siempre abajo de todo, también mientras se tipea la respuesta.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, pending, tipeando]);

  function enviar(contenido: string) {
    const q = contenido.trim();
    if (!q || pending) return;
    setError(null);
    setText("");
    const next: CopilotMessage[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    start(async () => {
      const r = await askCopilot(next, path);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setMsgs((m) => {
        setTipeando(m.length);
        return [...m, { role: "assistant", content: r.text }];
      });
    });
  }

  return (
    <>
      <button
        type="button"
        className={`ev-copilot-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="worka-copilot"
        title="Worka Copilot (Ctrl + J)"
      >
        <CopilotOrb size={22} />
        <span className="ev-copilot-label">Copilot</span>
      </button>

      <div className={`ev-copilot-backdrop ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden />

      <aside
        id="worka-copilot"
        className={`ev-copilot ${open ? "is-open" : ""}`}
        role="dialog"
        aria-label="Worka Copilot"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="flex items-center gap-2 px-4 h-14 shrink-0">
          <button
            type="button"
            className="ev-icon-btn !w-9 !h-9"
            onClick={() => {
              setMsgs([]);
              setError(null);
              setTipeando(null);
            }}
            title="Nueva conversación"
            aria-label="Nueva conversación"
          >
            <SquarePen size={18} />
          </button>
          <p className="flex-1 font-semibold text-[17px] text-[#1d2226] flex items-center gap-2">
            Worka <span className="ev-copilot-grad">Copilot</span>
          </p>
          <button type="button" className="ev-icon-btn !w-9 !h-9" onClick={() => setOpen(false)} aria-label="Cerrar Copilot">
            <X size={20} />
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-4">
          {msgs.length === 0 ? (
            <Bienvenida path={path} onPick={enviar} />
          ) : (
            <ol className="space-y-4 pt-2" aria-live="polite">
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <li key={i} className="flex justify-end ev-copilot-in">
                    <p className="max-w-[85%] rounded-[18px] rounded-br-md bg-[#f0eef8] text-[#1d2226] text-[14.5px] px-4 py-2.5 whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </li>
                ) : (
                  <li key={i} className="flex gap-2.5 ev-copilot-in">
                    <span className="shrink-0 mt-0.5">
                      <CopilotOrb size={26} still />
                    </span>
                    <div className="min-w-0 flex-1 text-[14.5px] text-[#2b2f38] leading-relaxed">
                      {tipeando === i ? (
                        <Tipeo texto={m.content} onDone={() => setTipeando(null)} onLink={() => setOpen(false)} />
                      ) : (
                        <Markdown texto={m.content} onLink={() => setOpen(false)} />
                      )}
                    </div>
                  </li>
                )
              )}
              {pending && (
                <li className="flex gap-2.5 items-center ev-copilot-in">
                  <CopilotOrb size={26} />
                  <span className="ev-copilot-dots" aria-label="Pensando">
                    <i />
                    <i />
                    <i />
                  </span>
                </li>
              )}
            </ol>
          )}
          {error && (
            <p className="mt-4 text-sm text-danger bg-red-50 rounded-xl px-4 py-3 ev-copilot-in" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="px-4 pb-3 shrink-0">
          <form
            className="ev-copilot-input"
            onSubmit={(e) => {
              e.preventDefault();
              enviar(text);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(text);
                }
              }}
              placeholder="Preguntale a Worka Copilot"
              aria-label="Tu pregunta"
              maxLength={1200}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11.5px] text-[#8a8a8a]">Enter para enviar · Shift + Enter, nueva línea</span>
              <button type="submit" className="ev-copilot-send" disabled={!text.trim() || pending} aria-label="Enviar">
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
          <p className="text-[11.5px] text-center text-[#767676] mt-2.5">
            Worka Copilot puede cometer errores. Revisá lo importante.
          </p>
        </div>
      </aside>
    </>
  );
}

// El orbe: un anillo de color que gira alrededor de una chispa. Quieto en los
// avatares de la conversación para no distraer mientras se lee.
export function CopilotOrb({ size = 24, still = false }: { size?: number; still?: boolean }) {
  return (
    <span className={`ev-orb ${still ? "is-still" : ""}`} style={{ width: size, height: size }} aria-hidden>
      <span className="ev-orb-ring" />
      <span className="ev-orb-core">
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
          <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z" fill="url(#ev-orb-g)" />
          <circle cx="19" cy="18.5" r="1.8" fill="#7b6fc0" />
          <defs>
            <linearGradient id="ev-orb-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0a66c2" />
              <stop offset="1" stopColor="#7b6fc0" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </span>
  );
}

function Bienvenida({ path, onPick }: { path: string; onPick: (q: string) => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRASES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center py-10">
      <CopilotOrb size={64} />
      <p key={i} className="ev-copilot-grad ev-copilot-phrase text-[27px] font-semibold mt-6 leading-tight">
        {FRASES[i]}
      </p>
      <p className="text-sm text-[#666] mt-2 max-w-[280px]">
        Te ayudo a usar Evaluar y a entender lo que tenés en pantalla.
      </p>
      <div className="flex flex-col gap-2 mt-7 w-full max-w-[320px]">
        {sugerencias(path).map((s, n) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="ev-copilot-chip"
            style={{ animationDelay: `${120 + n * 70}ms` }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// La respuesta aparece de a poco, como si se escribiera. Llega entera del
// servidor; esto es solo la forma de mostrarla.
function Tipeo({ texto, onDone, onLink }: { texto: string; onDone: () => void; onLink: () => void }) {
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current();
      return;
    }
    const paso = Math.max(2, Math.round(texto.length / 90));
    const id = setInterval(() => {
      setN((x) => {
        const y = x + paso;
        if (y >= texto.length) {
          clearInterval(id);
          setTimeout(() => done.current(), 0);
          return texto.length;
        }
        return y;
      });
    }, 16);
    return () => clearInterval(id);
  }, [texto]);
  return <Markdown texto={texto.slice(0, n)} onLink={onLink} />;
}

// Markdown mínimo: párrafos, listas, **negrita**, _cursiva_ y enlaces a
// rutas del panel. Los enlaces externos se muestran como texto: el Copilot
// no tiene por qué mandar a nadie fuera de Worka.
function Markdown({ texto, onLink }: { texto: string; onLink: () => void }) {
  const bloques = texto.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {bloques.map((b, i) => {
        const lineas = b.split("\n");
        const esLista = lineas.every((l) => /^\s*([-•*]|\d+[.)])\s+/.test(l));
        if (esLista)
          return (
            <ul key={i} className="space-y-1.5">
              {lineas.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[9px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#0a66c2,#7b6fc0)" }} />
                  <span>{enLinea(l.replace(/^\s*([-•*]|\d+[.)])\s+/, ""), onLink)}</span>
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            {lineas.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {enLinea(l, onLink)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function enLinea(s: string, onLink: () => void): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|(?:^|(?<=\s))[_*]([^_*]+)[_*]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++} className="font-semibold text-[#1d2226]">{m[1]}</strong>);
    else if (m[2]) {
      const href = m[3];
      out.push(
        /^\/(evaluar|empresa)(\/|$)/.test(href) ? (
          <Link
            key={k++}
            href={href}
            onClick={() => {
              if (window.innerWidth < 768) onLink();
            }}
            className="font-semibold text-[#0a66c2] underline decoration-[#0a66c2]/30 underline-offset-2 hover:decoration-[#0a66c2]"
          >
            {m[2]}
          </Link>
        ) : (
          <span key={k++} className="font-semibold">{m[2]}</span>
        )
      );
    } else if (m[4]) out.push(<em key={k++}>{m[4]}</em>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
