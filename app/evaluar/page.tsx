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
