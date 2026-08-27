import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import Faq from "@/components/evaluar/Faq";
import { TRIAL_DAYS } from "@/lib/evaluar-config";

export const metadata = {
  title: "Worka Evaluar — Selección de personal sin fricción",
  description:
    "Software de reclutamiento y evaluación de candidatos. Enlazá tu vacante de Worka y la gente empieza los tests desde el propio aviso. 15 días de prueba gratis.",
};

const MUTED = "rgba(233,233,237,.6)";
const FAINT = "rgba(233,233,237,.45)";

const DIFERENCIALES = [
  {
    n: "01",
    t: "La evaluación empieza en el aviso",
    d: "Enlazás el proceso a tu vacante de Worka y quien se postula arranca los tests en el momento en que está interesado. Nadie pierde el hilo entre el aviso y una plataforma aparte.",
  },
  {
    n: "02",
    t: "Tablero de decisión comparativo",
    d: "Los finalistas lado a lado con la evidencia de cada uno: puntaje por etapa, respuestas y notas del equipo. Decidís en minutos y queda registrado por qué.",
  },
  {
    n: "03",
    t: "El candidato sabe siempre dónde está",
    d: "Ve su etapa, cuánto falta y en qué terminó, con devolución incluso si queda afuera. La gente termina los procesos cuando entiende el proceso.",
  },
  {
    n: "04",
    t: "Tests listos para usar",
    d: "Cinco Grandes, estilo laboral, juicio situacional, razonamiento e integridad, ya redactados y con corrección automática. O un proceso entero por puesto: cajero, chofer, call center.",
  },
];

const PASOS = [
  {
    t: "Armá el proceso",
    d: "Elegís un puesto del catálogo y te queda listo con sus etapas, preguntas y tests.",
  },
  {
    t: "Enlazá tu vacante",
    d: "Elegís una vacante activa de Worka y el proceso queda pegado al aviso.",
  },
  {
    t: "La gente rinde",
    d: "Desde el aviso o por invitación, sin crear ninguna cuenta. Se corrige solo.",
  },
  {
    t: "Decidí",
    d: "Compará finalistas en el tablero, dejá notas y cerrá el proceso.",
  },
];

// Las cifras salen del catálogo real (lib/evaluar/templates.ts e
// integridad.ts). Si mañana se suma un instrumento, hay que tocarlas acá:
// vale la pena el recordatorio antes que una portada que promete de más.
const INSTRUMENTOS = [
  {
    k: "big5",
    n: "Los Cinco Grandes",
    d: "Personalidad en el trabajo: apertura, tesón, extraversión, amabilidad y estabilidad. Ítems del IPIP, de dominio público.",
    i: 25, m: 6, dim: 5, cron: false,
  },
  {
    k: "estilo",
    n: "Estilo laboral",
    d: "Cómo se mueve en un equipo: conducción, detalle, tolerancia a la presión, orientación al cliente, autonomía y planificación.",
    i: 24, m: 6, dim: 8, cron: false,
  },
  {
    k: "sjt",
    n: "Juicio situacional",
    d: "Situaciones reales de mostrador y teléfono. No hay una correcta y muchas equivocadas: la diferencia está en el orden de prioridades.",
    i: 8, m: 8, dim: 4, cron: false,
  },
  {
    k: "razonamiento",
    n: "Razonamiento",
    d: "Series numéricas, fichas de dominó y analogías. Con respuesta correcta y con reloj: sin tiempo deja de medir razonamiento y mide paciencia.",
    i: 12, m: 10, dim: 3, cron: true,
  },
  {
    k: "integridad",
    n: "Integridad laboral",
    d: "Nueve factores de actitud ante el cuidado de lo ajeno, el trato, la seguridad y el uso de la información. Dos de ellos dicen si el resto es confiable.",
    i: 27, m: 9, dim: 9, cron: false,
  },
];

const TALENTO = [
  {
    k: "Desempeño",
    t: "Evaluación por competencias, con anclajes de conducta",
    d: "Ciclos por período, con la evaluación del jefe y la autoevaluación de la persona. El empleado la lee y deja constancia — que no es lo mismo que estar de acuerdo, y la pantalla lo dice.",
    dato: "10 competencias con cinco descripciones observables cada una",
  },
  {
    k: "Autoevaluación",
    t: "Dónde se ven distinto la persona y su jefe",
    d: "Es la lectura más útil de una autoevaluación y casi ninguna plataforma la muestra. Una brecha grande hacia arriba dice que la devolución no está llegando; una hacia abajo, que se subestima y probablemente no pide lo que le corresponde.",
    dato: "El punto por donde conviene empezar la conversación",
  },
  {
    k: "Integridad",
    t: "Actitudes, no confesiones",
    d: "Mide qué le parece aceptable a la persona en situaciones de trabajo. No pregunta si robó: un cuestionario que pide admitir delitos te convierte en depositario de una confesión, y quien lo hizo no lo marca igual.",
    dato: "Resultado en bandas, nunca en veredictos",
  },
];

const INFORME = [
  {
    t: "Percentiles",
    d: "Dónde cae contra el resto de los evaluados, dibujado como campana. «Percentil 85» no le dice nada a quien no trabaja con estadística.",
  },
  {
    t: "Perfil contra el puesto",
    d: "Un radar con los rasgos y, encima, lo que pediste para el puesto. La pregunta deja de ser cuánto sacó y pasa a ser cuánto se parece.",
  },
  {
    t: "Calidad de la respuesta",
    d: "Si contestó todo igual, demasiado rápido o contradiciéndose. Va arriba del perfil: si la respuesta no es confiable, lo de abajo no describe a nadie.",
  },
  {
    t: "Métricas del grupo",
    d: "Si la prueba separa. Cuando todos sacan entre 68 y 72, ese puntaje no distingue a nadie y elegir por él es echar a suerte.",
  },
];

// Los números son del producto, no inventados: cinco instrumentos en el
// catálogo, cinco procesos por puesto, y el total real de ítems redactados.
const CIFRAS = [
  { v: "5", l: "tests listos" },
  { v: "5", l: "procesos por puesto" },
  { v: "96", l: "preguntas redactadas" },
  { v: "0", l: "cuentas que crear" },
];

export default function EvaluarLandingPage() {
  return (
    <MarketingShell>
      {/* ── Portada ─────────────────────────────────────────── */}
      <section className="relative">
        <canvas
          data-grid
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          aria-hidden
        />

        <div className="relative z-[2] max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24 grid gap-10 lg:grid-cols-[1.05fr_.95fr] items-center">
          <div data-parallax data-depth="8">
            <span
              className="inline-flex items-center gap-2.5 rounded-full px-3 py-1.5 mb-7"
              style={{ border: "1px solid rgba(145,132,217,.35)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full nk-beat"
                style={{ background: "var(--color-accent)" }}
              />
              <span className="nk-mono" style={{ color: "var(--nk-300)" }}>
                {TRIAL_DAYS} días · sin tarjeta
              </span>
            </span>

            <h1 className="text-[44px] sm:text-[58px] lg:text-[66px] leading-[1.03] tracking-[-.03em] font-medium mb-6">
              Decidí a quién contratás con{" "}
              <span style={{ color: "var(--color-accent)" }}>evidencia</span>,
              no con una entrevista.
            </h1>

            <p
              className="text-base leading-relaxed max-w-[440px] mb-8"
              style={{ color: MUTED }}
            >
              Enlazás tu vacante de Worka Empleos y la evaluación empieza en el
              propio aviso. Corrección automática, tablero comparativo y
              devolución para todos —{" "}
              <span style={{ color: "var(--color-text)" }}>
                sin que el candidato cree una cuenta
              </span>
              .
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link href="/evaluar/app" className="nk-cta">
                Empezar mis {TRIAL_DAYS} días
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="/evaluar/precios" className="nk-ghost">
                Ver precios
              </Link>
            </div>

            <div className="flex gap-7 mt-11">
              <div>
                <p className="nk-mono mb-1.5" style={{ color: FAINT }}>
                  Sin cuenta para rendir
                </p>
                <p className="text-2xl font-medium m-0">0 pasos</p>
              </div>
              <div style={{ width: 1, background: "rgba(233,233,237,.12)" }} />
              <div>
                <p className="nk-mono mb-1.5" style={{ color: FAINT }}>
                  Prueba completa
                </p>
                <p className="text-2xl font-medium m-0">{TRIAL_DAYS} días</p>
              </div>
            </div>
          </div>

          {/* Muestra del tablero. Es una ilustración de la pantalla real, no
              una captura: mantenerla en HTML la deja nítida en cualquier
              pantalla y no se despinta cuando el producto cambia de color. */}
          <div data-parallax data-depth="-16" className="relative hidden lg:block">
            <div
              data-tilt
              className="relative rounded-[14px] p-5 overflow-hidden"
              style={{
                background: "linear-gradient(165deg,#232532,#1a1c28)",
                border: "1px solid var(--nk-line-2)",
                boxShadow: "0 16px 40px rgba(0,0,0,.65)",
                transition: "transform .18s ease-out",
              }}
            >
              <div
                className="absolute left-0 right-0 top-0 h-[120px] pointer-events-none nk-sweep"
                style={{
                  background:
                    "linear-gradient(180deg,rgba(145,132,217,.14),transparent)",
                }}
                aria-hidden
              />
              <div className="flex items-center justify-between mb-4">
                <span className="nk-mono" style={{ color: FAINT }}>
                  Tablero de decisión
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full nk-beat"
                    style={{ background: "var(--nk-400)" }}
                  />
                  <span className="nk-mono" style={{ color: "var(--nk-300)" }}>
                    en vivo
                  </span>
                </span>
              </div>

              <p className="text-xl font-medium m-0">Cajero/a · Sucursal Centro</p>
              <p className="text-[12.5px] mt-0.5 mb-5" style={{ color: MUTED }}>
                3 etapas · 18 candidatos · cierra en 6 días
              </p>

              <div className="flex flex-col gap-3.5">
                {[
                  { n: "Lucía M.", v: 92, alto: true },
                  { n: "Rodrigo P.", v: 78, alto: false },
                  { n: "Ana G.", v: 61, alto: false },
                ].map((c, i) => (
                  <div key={c.n}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[13px]">{c.n}</span>
                      <span
                        className="text-xs font-mono"
                        style={{
                          color: c.alto ? "var(--nk-300)" : MUTED,
                        }}
                      >
                        {c.v}
                      </span>
                    </div>
                    <div
                      className="h-[3px] rounded-full overflow-hidden"
                      style={{ background: "var(--nk-line)" }}
                    >
                      <div
                        className="h-full rounded-full nk-grow"
                        style={{
                          width: `${c.v}%`,
                          animationDelay: `${i * 0.15}s`,
                          background: c.alto
                            ? "linear-gradient(90deg,#5d5294,#b5abfc)"
                            : c.v > 70
                              ? "linear-gradient(90deg,#423a6a,#968ae0)"
                              : "#595d6c",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 pt-4 grid grid-cols-3 gap-3"
                style={{ borderTop: "1px solid rgba(233,233,237,.1)" }}
              >
                {[
                  { l: "Razonamiento", v: "12/12", ac: false },
                  { l: "Situacional", v: "9/10", ac: false },
                  { l: "Integridad", v: "sin señales", ac: true },
                ].map((x) => (
                  <div key={x.l}>
                    <p className="nk-mono mb-1.5" style={{ color: FAINT }}>
                      {x.l}
                    </p>
                    <p
                      className="text-[15px] m-0"
                      style={{ color: x.ac ? "var(--nk-300)" : undefined }}
                    >
                      {x.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-tilt
              className="absolute rounded-xl px-4 py-3.5"
              style={{
                left: -84,
                bottom: -78,
                width: 236,
                background: "#1a1c28",
                border: "1px solid var(--nk-line-2)",
                boxShadow: "0 16px 40px rgba(0,0,0,.6)",
                transition: "transform .18s ease-out",
              }}
            >
              <p className="nk-mono mb-2" style={{ color: FAINT }}>
                Etapa en curso
              </p>
              <p className="text-[17px] font-medium m-0">Razonamiento</p>
              <p className="text-[11.5px] mt-1.5 m-0" style={{ color: FAINT }}>
                12 preguntas · 10 min · cronometrada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cifras ──────────────────────────────────────────── */}
      <div
        className="relative z-[2]"
        style={{
          background: "linear-gradient(180deg,var(--nk-band),#1f2350)",
          borderTop: "1px solid rgba(233,233,237,.1)",
          borderBottom: "1px solid rgba(233,233,237,.1)",
        }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-7">
          {CIFRAS.map((c) => (
            <div key={c.l}>
              <p className="text-[34px] font-medium m-0 tracking-[-.02em]">
                {c.v}
              </p>
              <p
                className="nk-mono mt-1.5"
                style={{ color: "rgba(233,233,237,.55)" }}
              >
                {c.l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plataforma ──────────────────────────────────────── */}
      <section
        id="plataforma"
        className="relative z-[2] max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24 scroll-mt-20"
      >
        <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
          Plataforma
        </p>
        <h2 className="text-[30px] md:text-[38px] font-medium max-w-[640px] mb-11">
          Lo que no vas a encontrar en otro lado
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {DIFERENCIALES.map((d) => (
            <div
              key={d.n}
              data-tilt
              className="rounded-xl p-8"
              style={{
                background: "var(--nk-card)",
                border: "1px solid var(--nk-line)",
                transition: "transform .18s ease-out, border-color .3s ease",
              }}
            >
              <p
                className="font-mono text-xs mb-5 m-0"
                style={{ color: "var(--color-accent)" }}
              >
                {d.n}
              </p>
              <h3 className="text-[21px] font-medium mb-2.5">{d.t}</h3>
              <p
                className="text-sm leading-[1.7] m-0"
                style={{ color: "rgba(233,233,237,.55)" }}
              >
                {d.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instrumentos ────────────────────────────────────── */}
      <section
        id="instrumentos"
        className="relative z-[2] scroll-mt-20"
        style={{ borderTop: "1px solid rgba(233,233,237,.08)" }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24">
          <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
            Instrumentos
          </p>
          <h2 className="text-[30px] md:text-[38px] font-medium max-w-[680px] mb-4">
            Cinco pruebas escritas y corregidas, no cinco plantillas vacías
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[560px] mb-11"
            style={{ color: MUTED }}
          >
            96 ítems redactados en castellano de acá, con su corrección y su
            interpretación ya escritas. Los de personalidad usan el IPIP, un
            banco de dominio público hecho para esto;{" "}
            <span style={{ color: "var(--color-text)" }}>
              no reproducimos ningún instrumento licenciado
            </span>
            .
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INSTRUMENTOS.map((t) => (
              <div
                key={t.k}
                data-tilt
                className="rounded-xl p-6 flex flex-col"
                style={{
                  background: "var(--nk-card)",
                  border: "1px solid var(--nk-line)",
                  transition: "transform .18s ease-out, border-color .3s ease",
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[17px] font-medium m-0">{t.n}</h3>
                  {t.cron && (
                    <span
                      className="nk-mono shrink-0"
                      style={{ color: "var(--nk-300)" }}
                    >
                      cronometrada
                    </span>
                  )}
                </div>
                <p
                  className="text-[13.5px] leading-[1.65] mt-2.5 mb-4 flex-1"
                  style={{ color: "rgba(233,233,237,.55)" }}
                >
                  {t.d}
                </p>
                <div
                  className="flex gap-4 pt-3.5"
                  style={{ borderTop: "1px solid var(--nk-line)" }}
                >
                  {[
                    [`${t.i}`, "ítems"],
                    [`${t.m}`, "minutos"],
                    [`${t.dim}`, t.dim === 1 ? "rasgo" : "rasgos"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <p className="text-[15px] font-medium m-0">{v}</p>
                      <p className="nk-mono mt-1" style={{ color: FAINT }}>
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Los procesos por puesto cierran la grilla: son la puerta de
                entrada real, porque nadie arma un proceso de cero. */}
            <div
              data-tilt
              className="rounded-xl p-6 flex flex-col justify-between"
              style={{
                background: "linear-gradient(150deg,var(--nk-band),#1d2048)",
                border: "1px solid var(--nk-800)",
                transition: "transform .18s ease-out",
              }}
            >
              <div>
                <p className="nk-mono mb-3" style={{ color: "var(--nk-300)" }}>
                  O directo por puesto
                </p>
                <h3 className="text-[17px] font-medium m-0 mb-2.5">
                  Cinco procesos enteros, ya armados
                </h3>
                <p
                  className="text-[13.5px] leading-[1.65] m-0"
                  style={{ color: "rgba(233,233,237,.68)" }}
                >
                  Cajero, chofer, call center, gastronomía y vendedor: etapas,
                  preguntas de filtro y tests, listos para publicar.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-5">
                {["Cajero", "Chofer", "Call center", "Gastronomía", "Vendedor"].map(
                  (r) => (
                    <span
                      key={r}
                      className="nk-mono rounded-full px-2.5 py-1"
                      style={{
                        border: "1px solid rgba(210,206,253,.3)",
                        color: "var(--nk-300)",
                      }}
                    >
                      {r}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Asistente de IA ─────────────────────────────────── */}
      <section
        id="ia"
        className="relative z-[2] scroll-mt-20"
        style={{
          background: "linear-gradient(180deg,var(--nk-band),#1f2350)",
          borderTop: "1px solid rgba(233,233,237,.1)",
          borderBottom: "1px solid rgba(233,233,237,.1)",
        }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-start">
            <div>
              <p className="nk-mono mb-3.5" style={{ color: "var(--nk-300)" }}>
                Asistente de IA
              </p>
              <h2 className="text-[30px] md:text-[38px] font-medium mb-5">
                Describí el puesto en una línea y te arma la prueba
              </h2>
              <p
                className="text-[15px] leading-relaxed mb-4"
                style={{ color: "rgba(233,233,237,.7)" }}
              >
                El catálogo cubre los puestos que más se buscan en Paraguay.
                Para el resto —un tornero, un analista de laboratorio, un
                encargado de depósito— antes te quedabas frente a una pantalla
                en blanco, que es donde la mayoría abandona.
              </p>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: "rgba(233,233,237,.7)" }}
              >
                Le contás qué puesto es y qué te importa que sepan, y te deja la
                prueba armada{" "}
                <span style={{ color: "var(--color-text)" }}>como borrador</span>
                : la revisás y la editás como cualquier otra. Nunca se publica
                sola.
              </p>

              <div
                className="mt-8 rounded-xl p-5"
                style={{
                  background: "rgba(0,0,0,.22)",
                  border: "1px solid rgba(210,206,253,.18)",
                }}
              >
                <p className="nk-mono mb-2.5" style={{ color: "var(--nk-300)" }}>
                  Lo que nunca va a preguntar
                </p>
                <p
                  className="text-sm leading-relaxed m-0"
                  style={{ color: "rgba(233,233,237,.68)" }}
                >
                  Edad, sexo, religión, estado civil, hijos, embarazo, salud,
                  nacionalidad ni afiliación política. Además de
                  discriminatorio, nada de eso predice desempeño —{" "}
                  <span style={{ color: "var(--color-text)" }}>
                    y escrito en un test es la prueba documentada de una
                    decisión que no se puede defender
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Muestra del flujo: lo que se escribe y lo que sale. */}
            <div
              data-tilt
              className="rounded-[14px] p-6"
              style={{
                background: "rgba(0,0,0,.28)",
                border: "1px solid rgba(210,206,253,.2)",
                transition: "transform .18s ease-out",
              }}
            >
              <p className="nk-mono mb-3" style={{ color: "var(--nk-300)" }}>
                Vos escribís
              </p>
              <p
                className="text-[14.5px] leading-relaxed rounded-lg px-4 py-3 m-0"
                style={{
                  background: "rgba(233,233,237,.06)",
                  color: "var(--color-text)",
                }}
              >
                «Cajero de farmacia; quiero saber si maneja vuelto, si entiende
                recetas y cómo reacciona ante un cliente apurado.»
              </p>

              <div className="flex items-center gap-2.5 my-5">
                <span
                  className="flex-1 h-px"
                  style={{ background: "rgba(210,206,253,.2)" }}
                />
                <span className="nk-mono" style={{ color: "var(--nk-300)" }}>
                  y sale
                </span>
                <span
                  className="flex-1 h-px"
                  style={{ background: "rgba(210,206,253,.2)" }}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  "Un cliente reclama que le cobraste de más y hay fila…",
                  "Te falta Gs. 15.000 en el cierre de caja. ¿Qué hacés?",
                  "Una receta no coincide con el producto pedido…",
                ].map((q, i) => (
                  <div
                    key={q}
                    className="rounded-lg px-3.5 py-2.5 flex items-start gap-2.5"
                    style={{ border: "1px solid rgba(233,233,237,.1)" }}
                  >
                    <span
                      className="font-mono text-[11px] shrink-0 mt-0.5"
                      style={{ color: "var(--nk-300)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[13px] leading-snug"
                      style={{ color: "rgba(233,233,237,.72)" }}
                    >
                      {q}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="text-[11.5px] leading-relaxed mt-4 m-0"
                style={{ color: "rgba(233,233,237,.45)" }}
              >
                Queda como borrador, con sus opciones y su respuesta correcta.
                Revisalo antes de publicar: la responsabilidad de lo que se le
                toma al candidato sigue siendo tuya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gestión de talento humano ───────────────────────── */}
      <section
        id="talento"
        className="relative z-[2] scroll-mt-20"
        style={{ background: "var(--nk-deep)" }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24">
          <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
            Gestión de talento humano
          </p>
          <h2 className="text-[30px] md:text-[38px] font-medium max-w-[700px] mb-4">
            No termina cuando la persona entra
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[580px] mb-12"
            style={{ color: MUTED }}
          >
            La misma plataforma sigue con quien ya trabaja con vos: evaluación
            de desempeño por competencias, integridad laboral y el historial de
            cada persona período a período.
          </p>

          <div className="grid gap-4 lg:grid-cols-3">
            {TALENTO.map((b) => (
              <div
                key={b.t}
                data-tilt
                className="rounded-xl p-7 flex flex-col"
                style={{
                  background: "var(--nk-card)",
                  border: "1px solid var(--nk-line)",
                  transition: "transform .18s ease-out, border-color .3s ease",
                }}
              >
                <p className="nk-mono mb-4" style={{ color: "var(--color-accent)" }}>
                  {b.k}
                </p>
                <h3 className="text-[19px] font-medium m-0 mb-3">{b.t}</h3>
                <p
                  className="text-[13.5px] leading-[1.7] m-0 flex-1"
                  style={{ color: "rgba(233,233,237,.55)" }}
                >
                  {b.d}
                </p>
                {b.dato && (
                  <p
                    className="text-[12.5px] mt-5 pt-4 m-0"
                    style={{
                      borderTop: "1px solid var(--nk-line)",
                      color: "var(--nk-300)",
                    }}
                  >
                    {b.dato}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* El anclaje de conducta, mostrado. Es la diferencia entre esto y
              una planilla de estrellas, y contarlo no alcanza. */}
          <div
            className="mt-4 rounded-xl p-7 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center"
            style={{
              background: "var(--nk-card)",
              border: "1px solid var(--nk-line)",
            }}
          >
            <div>
              <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
                Por qué no son estrellas
              </p>
              <h3 className="text-[21px] font-medium m-0 mb-3">
                El evaluador no elige un número: elige lo que vio
              </h3>
              <p
                className="text-[13.5px] leading-[1.7] m-0"
                style={{ color: "rgba(233,233,237,.55)" }}
              >
                «Calificá comunicación del 1 al 5» da números que dependen de
                quién califica: el jefe exigente pone 3 donde el complaciente
                pone 5, y comparar dos áreas se vuelve imposible. Con
                descripciones de conducta, el número significa lo mismo en toda
                la empresa — y la persona se lleva algo concreto sobre lo que
                trabajar.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { n: 2, t: "Avisa tarde o de forma confusa; se generan malentendidos.", on: false },
                { n: 3, t: "Informa lo importante cuando se le pregunta.", on: false },
                { n: 4, t: "Avisa por adelantado, sobre todo cuando algo se atrasa.", on: true },
                { n: 5, t: "Explica con claridad incluso lo complicado, y a quien corresponde.", on: false },
              ].map((a) => (
                <div
                  key={a.n}
                  className="flex items-start gap-3 rounded-lg px-3.5 py-2.5"
                  style={{
                    border: `1px solid ${a.on ? "var(--color-accent)" : "rgba(233,233,237,.1)"}`,
                    background: a.on
                      ? "color-mix(in srgb, var(--color-accent) 8%, transparent)"
                      : "transparent",
                  }}
                >
                  <span
                    className="grid place-items-center w-5 h-5 rounded-full font-mono text-[11px] font-medium shrink-0 mt-0.5"
                    style={{
                      background: a.on ? "var(--color-accent)" : "var(--nk-line)",
                      color: a.on ? "#161826" : "rgba(233,233,237,.5)",
                    }}
                  >
                    {a.n}
                  </span>
                  <span
                    className="text-[13px] leading-snug"
                    style={{
                      color: a.on ? "var(--color-text)" : "rgba(233,233,237,.5)",
                    }}
                  >
                    {a.t}
                  </span>
                </div>
              ))}
              <p className="nk-mono mt-2" style={{ color: FAINT }}>
                Competencia: comunicación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── El informe ──────────────────────────────────────── */}
      <section
        className="relative z-[2]"
        style={{ borderTop: "1px solid rgba(233,233,237,.08)" }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-20 md:py-24">
          <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
            El informe
          </p>
          <h2 className="text-[30px] md:text-[38px] font-medium max-w-[640px] mb-4">
            Un porcentaje solo no dice nada
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[560px] mb-11"
            style={{ color: MUTED }}
          >
            Un 72% puede ser el mejor de la camada o la mitad de abajo. Y si la
            persona contestó en cuarenta segundos, ese número no describe a
            nadie. Las dos cosas están en el informe, y la segunda va arriba.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INFORME.map((x) => (
              <div
                key={x.t}
                data-tilt
                className="rounded-xl p-6"
                style={{
                  background: "var(--nk-card)",
                  border: "1px solid var(--nk-line)",
                  transition: "transform .18s ease-out, border-color .3s ease",
                }}
              >
                <h3 className="text-[16px] font-medium m-0 mb-2.5">{x.t}</h3>
                <p
                  className="text-[13px] leading-[1.65] m-0"
                  style={{ color: "rgba(233,233,237,.55)" }}
                >
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-[12.5px] leading-relaxed mt-8 max-w-[640px]"
            style={{ color: FAINT }}
          >
            Todo esto entra a la conversación junto a la entrevista y la
            experiencia, nunca en lugar de ellas. Ningún resultado alcanza por
            sí solo para descartar a una persona, y el propio informe lo dice
            donde se decide.
          </p>
        </div>
      </section>

      {/* ── Cómo funciona ───────────────────────────────────── */}
      <section
        id="como-funciona"
        className="relative z-[2] scroll-mt-20"
        style={{
          borderTop: "1px solid rgba(233,233,237,.08)",
          background: "var(--nk-deep)",
        }}
      >
        <div className="max-w-[1160px] mx-auto px-6 sm:px-8 py-20">
          <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
            Cómo funciona
          </p>
          <h2 className="text-[30px] md:text-[38px] font-medium max-w-[600px] mb-12">
            Cuatro pasos y el proceso corre solo
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* La línea que une los pasos. Solo en pantalla ancha: apilados
                en columna, una línea horizontal no une nada. */}
            <div
              className="absolute left-0 right-0 hidden lg:block"
              style={{
                top: 11,
                height: 1,
                background:
                  "linear-gradient(90deg,rgba(145,132,217,.5),rgba(145,132,217,.12))",
              }}
              aria-hidden
            />
            {PASOS.map((p, i) => (
              <div key={p.t} className="relative">
                <span
                  className="grid place-items-center w-[22px] h-[22px] rounded-full font-mono text-[11px] font-medium"
                  style={{
                    background: "var(--color-bg)",
                    border: `1px solid ${i < 2 ? "var(--color-accent)" : "rgba(145,132,217,.5)"}`,
                    color: i < 2 ? "var(--color-accent)" : "rgba(233,233,237,.7)",
                  }}
                >
                  {i + 1}
                </span>
                <h3 className="text-[17px] font-medium mt-5 mb-2">{p.t}</h3>
                <p
                  className="text-[13.5px] leading-[1.65] m-0"
                  style={{ color: "rgba(233,233,237,.52)" }}
                >
                  {p.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preguntas ───────────────────────────────────────── */}
      <section className="relative z-[2] max-w-[760px] mx-auto px-6 sm:px-8 py-20">
        <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
          Preguntas
        </p>
        <h2 className="text-[30px] md:text-[38px] font-medium mb-9">
          Lo que más nos preguntan
        </h2>
        <Faq />
      </section>

      {/* ── Cierre ──────────────────────────────────────────── */}
      <section className="relative z-[2] max-w-[1160px] mx-auto px-6 sm:px-8 pt-4 pb-24 text-center">
        <h2 className="text-[34px] md:text-[46px] font-medium tracking-[-.03em] max-w-[660px] mx-auto leading-[1.1]">
          Probalo con un proceso{" "}
          <span style={{ color: "var(--color-accent)" }}>real</span>.
        </h2>
        <p
          className="mt-5 mx-auto max-w-[480px] leading-relaxed"
          style={{ color: "rgba(233,233,237,.55)" }}
        >
          {TRIAL_DAYS} días completos, sin tarjeta y sin cobro automático. Si al
          final no te sirve, no pagás nada.
        </p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <Link href="/evaluar/app" className="nk-cta">
            Empezar gratis
          </Link>
          <Link href="/evaluar/precios" className="nk-ghost">
            Ver precios
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
