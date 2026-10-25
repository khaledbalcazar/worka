"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";

// Funcionalidades con IA: una pestaña por cosa que el asistente hace de
// verdad en el panel, con una muestra de lo que se escribe y lo que sale.
// Las pestañas avanzan solas mientras nadie las toca; al tocar una, se quedan.

type Feature = {
  key: string;
  tab: string;
  titulo: string;
  bajada: string;
  pedido: string;
  salida: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    key: "pruebas",
    tab: "Arma pruebas a medida",
    titulo: "Arma pruebas",
    bajada: "Escribí una línea sobre el puesto y en treinta segundos tenés la prueba con opciones y respuestas correctas. La revisás y la publicás vos.",
    pedido: "Cajero de farmacia: que maneje vuelto, entienda recetas y atienda a un cliente apurado.",
    salida: (
      <ol className="space-y-2">
        {["Un cliente reclama que le cobraste de más y hay fila…", "Te faltan Gs. 15.000 en el cierre de caja. ¿Qué hacés?", "Una receta no coincide con el producto pedido…"].map((q, i) => (
          <li key={q} className="evl-out rounded-xl border border-[#e6e3f6] bg-white px-3.5 py-2.5 text-[13.5px] text-[#404b63] flex gap-2.5" style={{ ["--i" as string]: i }}>
            <span className="font-mono text-[11px] text-[#5d5294] mt-0.5">{String(i + 1).padStart(2, "0")}</span>
            {q}
          </li>
        ))}
      </ol>
    ),
  },
  {
    key: "informe",
    tab: "Lee cada informe",
    titulo: "Lee informes",
    bajada: "Un resumen en criollo de cada candidato: qué tiene a favor, qué conviene verificar y preguntas listas para la entrevista.",
    pedido: "Resumime el informe de Lucía para la entrevista de mañana.",
    salida: (
      <div className="space-y-2 text-[13.5px] text-[#404b63]">
        <p className="evl-out" style={{ ["--i" as string]: 0 }}>Ajusta un 86% a lo que pide el puesto y resolvió bien el 88% de las pruebas.</p>
        <p className="evl-out flex gap-2" style={{ ["--i" as string]: 1 }}><CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" /> Se destaca en servicio al cliente.</p>
        <p className="evl-out flex gap-2" style={{ ["--i" as string]: 2 }}><Lightbulb size={15} className="text-amber-600 shrink-0 mt-0.5" /> Verificá cómo trabaja bajo presión en horas pico.</p>
      </div>
    ),
  },
  {
    key: "finalistas",
    tab: "Compara finalistas",
    titulo: "Compara finalistas",
    bajada: "Pone lado a lado a los que terminaron y te dice qué distingue a cada uno y qué verificar antes de decidir. La decisión sigue siendo tuya.",
    pedido: "¿En qué se diferencian mis tres finalistas?",
    salida: (
      <div className="grid grid-cols-3 gap-2">
        {[["Lucía", 86], ["Ana", 81], ["Rodrigo", 78]].map(([n, v], i) => (
          <div key={n} className="evl-out rounded-xl border border-[#e6e3f6] bg-white p-2.5 text-center" style={{ ["--i" as string]: i }}>
            <span className="mx-auto w-9 h-9 rounded-full grid place-items-center text-white text-sm font-bold" style={{ background: "var(--evl-grad)" }}>{String(n)[0]}</span>
            <p className="text-[12.5px] font-semibold text-[#1d2b4f] mt-1.5">{n}</p>
            <p className="text-[11px] text-[#5f6475]">ajuste {v}%</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "perfil",
    tab: "Define el perfil ideal",
    titulo: "Perfil ideal",
    bajada: "Le decís el puesto y propone qué rasgos pesan y cuánto. El tablero ordena por ajuste real al puesto, no por puntaje bruto.",
    pedido: "¿Qué importa para un cajero de supermercado?",
    salida: (
      <div className="flex flex-wrap gap-2">
        {[["Servicio al cliente", "Clave"], ["Integridad", "Clave"], ["Cálculo", "Importa"], ["Detalle", "Importa"], ["Presión", "Suma"]].map(([r, p], i) => (
          <span key={r} className="evl-out inline-flex items-center gap-1.5 rounded-full border border-[#e6e3f6] bg-white px-3 py-1.5 text-[12.5px] text-[#404b63]" style={{ ["--i" as string]: i }}>
            {r} <strong className="text-[#5d5294]">{p}</strong>
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "mensajes",
    tab: "Escribe tus mensajes",
    titulo: "Escribe mensajes",
    bajada: "La bienvenida y el cierre que lee cada candidato, con un tono cálido y claro. Decir cuándo hay novedades es la mitad de la buena experiencia.",
    pedido: "Mejorá el mensaje que ven al terminar.",
    salida: (
      <p className="evl-out rounded-xl border border-[#e6e3f6] bg-white px-4 py-3 text-[13.5px] text-[#404b63] leading-relaxed" style={{ ["--i" as string]: 0 }}>
        ¡Gracias por tomarte el tiempo! Ya recibimos tus respuestas. Las revisamos esta semana y te escribimos por WhatsApp para contarte cómo sigue, quedes o no.
      </p>
    ),
  },
];

const DURACION = 7000;

export default function AiFeatureTabs() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [escrito, setEscrito] = useState("");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const f = FEATURES[i];

  // Solo avanza cuando la sección está a la vista: si no, al llegar ya va
  // por la cuarta pestaña y la primera no la vio nadie.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const id = setTimeout(() => setI((n) => (n + 1) % FEATURES.length), DURACION);
    return () => clearTimeout(id);
  }, [i, auto, visible]);

  // El pedido se escribe letra por letra, como si alguien lo tipeara.
  useEffect(() => {
    if (!visible) return;
    const texto = FEATURES[i].pedido;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setEscrito(texto));
      return;
    }
    let n = 0;
    queueMicrotask(() => setEscrito(""));
    const id = setInterval(() => {
      n += 2;
      setEscrito(texto.slice(0, n));
      if (n >= texto.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [i, visible]);

  const listo = escrito.length >= f.pedido.length;

  return (
    <div ref={ref} className="grid gap-8 lg:gap-10 lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,1.05fr)] items-start">
      {/* Pestañas: columna en escritorio, chips que se deslizan en celular. */}
      <div role="tablist" aria-label="Funcionalidades con IA" className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 [scrollbar-width:none]">
        {FEATURES.map((x, n) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={n === i}
            onClick={() => {
              setI(n);
              setAuto(false);
            }}
            className={`evl-tab shrink-0 lg:shrink ${n === i ? "is-on" : ""} max-lg:rounded-full max-lg:border max-lg:border-[#e6e3f6] max-lg:bg-white max-lg:!px-4 max-lg:!py-2 max-lg:text-[14px] max-lg:before:hidden max-lg:[&.is-on]:border-[#5d5294]`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      {/* Qué hace. */}
      <div key={f.key} className="animate-rise min-w-0">
        <p className="text-[17px] text-[#404b63] leading-relaxed">{f.bajada}</p>
        <p className="evl-grad-text text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-.03em] mt-5">{f.titulo}</p>
        <Link href="/evaluar/app" className="evl-btn mt-6">
          Probalo en tu panel <ArrowRight size={16} />
        </Link>
        {auto && visible && (
          <div className="relative h-[2px] bg-[#ebe9f5] rounded-full mt-8 max-w-[260px] overflow-hidden" aria-hidden>
            <span key={f.key} className="evl-tab-bar" style={{ animationDuration: `${DURACION}ms` }} />
          </div>
        )}
      </div>

      {/* Copiloto: lo que se pide y lo que devuelve. */}
      <div className="evl-card !rounded-[26px] p-5 sm:p-6 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="evl-icon !w-9 !h-9 !rounded-full">
            <Sparkles size={17} />
          </span>
          <p className="text-[19px] font-bold evl-grad-text">Copiloto Worka</p>
        </div>
        <div className="mt-4 rounded-2xl border border-[#e6e3f6] bg-white px-4 py-3 text-[14px] text-[#1d2b4f] min-h-[70px]">
          {escrito}
          {!listo && <span className="evl-caret" aria-hidden />}
        </div>
        <div key={`${f.key}-${listo}`} className="mt-4 min-h-[150px]">
          {listo ? (
            <div className="evl-outs">{f.salida}</div>
          ) : (
            <div className="space-y-2" aria-hidden>
              <div className="ai-line w-full" />
              <div className="ai-line w-10/12" />
              <div className="ai-line w-8/12" />
            </div>
          )}
        </div>
        <p className="text-[11.5px] text-[#8a8fa0] mt-3">Ejemplo ilustrativo. En tu panel trabaja con tus procesos reales.</p>
      </div>
    </div>
  );
}
