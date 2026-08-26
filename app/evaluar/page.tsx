import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import Faq from "@/components/evaluar/Faq";
import { TRIAL_DAYS } from "@/lib/evaluar-config";

// Portada de Worka Evaluar.
export const metadata = {
  description:
    "Conectá tu vacante de Worka Empleos y los candidatos empiezan la evaluación en el mismo aviso. Tests listos, tablero de decisión y devolución automática. 15 días gratis.",
};

const FEATURES = [
  {
    num: "01",
    title: "La evaluación empieza en el aviso",
    desc: "Enlazás el proceso a tu vacante de Worka y quien se postula arranca los tests en el momento en que está interesado. Nadie pierde el hilo entre el aviso y una plataforma aparte.",
  },
  {
    num: "02",
    title: "Tablero de decisión comparativo",
    desc: "Los finalistas lado a lado con la evidencia de cada uno: puntaje por etapa, respuestas y notas del equipo. Decidís en minutos y queda registrado por qué.",
  },
  {
    num: "03",
    title: "El candidato sabe siempre dónde está",
    desc: "Ve su etapa, cuánto falta y en qué terminó, con devolución incluso si queda afuera. La gente termina los procesos cuando entiende el proceso.",
  },
  {
    num: "04",
    title: "Tests listos para usar",
    desc: "Cinco Grandes, estilo laboral, juicio situacional y razonamiento, ya redactados y con corrección automática. O un proceso entero por puesto: cajero, chofer, call center.",
  },
];

const PASOS = [
  {
    n: "1",
    t: "Armá el proceso",
    d: "Elegís un puesto del catálogo y te queda listo con sus etapas, preguntas y tests.",
  },
  {
    n: "2",
    t: "Enlazá tu vacante",
    d: "Elegís una vacante activa de Worka y el proceso queda pegado al aviso.",
  },
  {
    n: "3",
    t: "La gente rinde",
    d: "Desde el aviso o por invitación, sin crear ninguna cuenta. Se corrige solo.",
  },
  {
    n: "4",
    t: "Decidí",
    d: "Compará finalistas en el tablero, dejá notas y cerrá el proceso.",
  },
];

const PORQUE = [
  {
    t: "Sin cuentas que crear",
    d: "El candidato entra con un enlace propio. Cada cuenta que pedís es gente que abandona.",
  },
  {
    t: "Sin respuestas correctas inventadas",
    d: "Los tests de personalidad describen estilos de trabajo, no capacidad. Lo decimos en la pantalla donde se decide.",
  },
  {
    t: "Sin nadie esperando en el vacío",
    d: "Cada decisión que tomás le llega al candidato con su motivo. Incluso el no.",
  },
];

export default function EvaluarLandingPage() {
  return (
    <MarketingShell>
      {/* ── PORTADA ── */}
      <section className="grid md:grid-cols-2 min-h-[88vh]">
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-20 order-2 md:order-1">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-copper border border-copper/30 bg-copper/10 rounded-full px-3 py-1.5 mb-8 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-copper animate-pulse" />
            {TRIAL_DAYS} días gratis · sin tarjeta
          </span>

          <h1 className="font-heading font-black text-[2.6rem] md:text-[3.2rem] lg:text-[3.9rem] leading-[1.08] text-cream mb-7">
            Seleccioná
            <br />
            al mejor,
            <br />
            <em className="italic text-copper">sin fricciones.</em>
          </h1>

          <p className="text-mist text-[1.05rem] leading-relaxed mb-9 max-w-[420px]">
            Conectá tu vacante de Worka Empleos y los candidatos empiezan la
            evaluación{" "}
            <strong className="text-cream font-medium">
              en el mismo aviso
            </strong>{" "}
            — sin cuentas externas, sin correos que no abren.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/evaluar/app"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-copper text-navy font-semibold rounded-xl hover:bg-copper-lite transition-colors text-[0.95rem]"
            >
              Empezar mis {TRIAL_DAYS} días gratis
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center px-6 py-3.5 border border-edge text-mist hover:text-cream hover:border-cream/20 rounded-xl transition-colors text-[0.95rem]"
            >
              Ver cómo funciona
            </Link>
          </div>

          <p className="text-xs text-mist/70 mt-6">
            Necesitás una cuenta de empresa en Worka. Crearla también es gratis.
          </p>
        </div>

        {/* Panel derecho: una maqueta del producto, no una foto de archivo.
            Mostrar la herramienta real dice más que gente sonriendo. */}
        <div className="relative bg-panel border-l border-edge overflow-hidden order-1 md:order-2 px-8 md:px-10 py-14 md:py-0 flex items-center">
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 75% 25%, rgba(207,122,82,.20), transparent 55%)",
            }}
          />

          <div className="relative w-full max-w-sm mx-auto space-y-3">
            <div className="bg-navy/70 backdrop-blur-sm border border-edge rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-mist uppercase tracking-widest">
                  Proceso activo
                </p>
                <p className="text-xs font-semibold text-cream truncate">
                  Cajero/a · 3 etapas
                </p>
              </div>
            </div>

            <div className="bg-navy/70 backdrop-blur-sm border border-edge rounded-2xl px-4 py-4">
              <p className="text-[10px] text-mist uppercase tracking-widest mb-3">
                Ajuste al puesto
              </p>
              {[
                { name: "Lucía M.", score: 92, color: "bg-emerald-400" },
                { name: "Rodrigo P.", score: 78, color: "bg-copper" },
                { name: "Ana G.", score: 61, color: "bg-mist" },
              ].map((c) => (
                <div key={c.name} className="mb-2.5 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-cream">{c.name}</span>
                    <span className="text-[11px] text-mist">{c.score}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-edge overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-mist/60 mt-3">
                Ejemplo de cómo se ve el tablero.
              </p>
            </div>

            <div className="bg-navy/70 backdrop-blur-sm border border-edge rounded-2xl px-5 py-4">
              <p className="text-[10px] text-mist uppercase tracking-widest mb-1">
                Etapa en curso
              </p>
              <p className="font-heading font-black text-2xl text-cream leading-none">
                Razonamiento
              </p>
              <p className="text-[10px] text-mist/70 mt-1.5">
                12 preguntas · 10 min · cronometrada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <div className="border-y border-edge bg-panel">
        <div className="max-w-6xl mx-auto px-6 py-9">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: "4", l: "tests listos para usar" },
              { v: "5", l: "procesos armados por puesto" },
              { v: "69", l: "preguntas ya redactadas" },
              { v: `${TRIAL_DAYS}`, l: "días de prueba, sin tarjeta" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <dt className="font-heading font-bold text-3xl text-copper">
                  {s.v}
                </dt>
                <dd className="text-xs text-mist mt-1 leading-snug">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── FUNCIONALIDADES ── */}
      <section
        id="funcionalidades"
        className="max-w-6xl mx-auto px-6 py-20 md:py-24"
      >
        <header className="mb-12">
          <p className="text-xs font-medium text-copper uppercase tracking-widest mb-3">
            Funcionalidades
          </p>
          <h2 className="font-heading font-black text-3xl md:text-4xl text-cream max-w-2xl leading-tight">
            Lo que no vas a encontrar en otro lado
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-px bg-edge border border-edge rounded-2xl overflow-hidden">
          {FEATURES.map((f) => (
            <div key={f.num} className="bg-navy p-7 md:p-9">
              <p className="font-heading font-black text-copper/40 text-3xl mb-4">
                {f.num}
              </p>
              <h3 className="font-heading font-bold text-xl text-cream mb-2.5">
                {f.title}
              </h3>
              <p className="text-sm text-mist leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="bg-panel border-y border-edge">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <header className="mb-12">
            <p className="text-xs font-medium text-copper uppercase tracking-widest mb-3">
              Cómo funciona
            </p>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-cream max-w-2xl leading-tight">
              Cuatro pasos y el proceso corre solo
            </h2>
          </header>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PASOS.map((p) => (
              <li key={p.n} className="relative">
                <span className="font-heading font-black text-5xl text-copper/25 leading-none">
                  {p.n}
                </span>
                <h3 className="font-heading font-bold text-lg text-cream mt-3">
                  {p.t}
                </h3>
                <p className="text-sm text-mist mt-1.5 leading-relaxed">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── POR QUÉ FUNCIONA ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <header>
            <p className="text-xs font-medium text-copper uppercase tracking-widest mb-3">
              Por qué funciona
            </p>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-cream leading-tight">
              La gente termina lo que entiende
            </h2>
            <p className="text-sm text-mist mt-4 leading-relaxed">
              La mayoría de los procesos de selección se caen por el mismo
              motivo: le piden al candidato más de lo que le explican.
            </p>
          </header>

          <div className="divide-y divide-edge border-y border-edge">
            {PORQUE.map((r) => (
              <div key={r.t} className="py-6">
                <h3 className="font-heading font-bold text-lg text-cream">
                  {r.t}
                </h3>
                <p className="text-sm text-mist mt-1.5 leading-relaxed">
                  {r.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREGUNTAS ── */}
      <section className="bg-panel border-y border-edge">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
          <header className="mb-10">
            <p className="text-xs font-medium text-copper uppercase tracking-widest mb-3">
              Preguntas frecuentes
            </p>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-cream leading-tight">
              Lo que nos preguntan siempre
            </h2>
          </header>
          <Faq />
        </div>
      </section>

      {/* ── CIERRE ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
        <h2 className="font-heading font-black text-3xl md:text-5xl text-cream leading-tight max-w-2xl mx-auto">
          Probalo con un proceso <em className="italic text-copper">real</em>.
        </h2>
        <p className="text-mist mt-5 max-w-lg mx-auto leading-relaxed">
          {TRIAL_DAYS} días completos, sin tarjeta y sin cobro automático. Si al
          final no te sirve, no pagás nada.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-9">
          <Link
            href="/evaluar/app"
            className="px-7 py-4 bg-copper text-navy font-semibold rounded-xl hover:bg-copper-lite transition-colors"
          >
            Empezar gratis
          </Link>
          <Link
            href="/evaluar/precios"
            className="px-7 py-4 border border-edge text-mist hover:text-cream hover:border-cream/20 rounded-xl transition-colors"
          >
            Ver precios
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
