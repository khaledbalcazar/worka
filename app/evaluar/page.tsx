import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import Faq from "@/components/evaluar/Faq";
import { TRIAL_DAYS } from "@/lib/evaluar-config";
import VentasCta from "@/components/evaluar/VentasCta";
import {
  evaluarMetadata,
  jsonLdFaq,
  jsonLdMigas,
  jsonLdProducto,
} from "@/lib/evaluar/seo";
import { getSiteSettings } from "@/lib/data";

// El título lleva las palabras con las que alguien busca esto en Paraguay:
// "software de selección de personal" y "evaluación de candidatos". El nombre
// del producto va al final — nadie lo busca todavía.
export const metadata = evaluarMetadata({
  title:
    "Software de selección de personal y evaluación de candidatos | Worka Evaluar",
  description:
    "Tests psicométricos, tablero de decisión e informes por candidato para empresas de Paraguay. Enlazá tu vacante y la gente rinde desde el propio aviso, sin crear cuenta. 15 días gratis.",
  path: "/",
});

const MUTED = "rgba(233,233,237,.6)";
const FAINT = "rgba(233,233,237,.45)";

const DIFERENCIALES = [
  {
    n: "01",
    t: "Se postulan y ya están rindiendo",
    d: "El test arranca en el propio aviso, mientras la persona todavía está entusiasmada. Nada de mandarle un link tres días después para que no lo abra nunca: cuando entrás a mirar, ya tenés a los veinte medidos.",
  },
  {
    n: "02",
    t: "Elegís en diez minutos, no en dos semanas",
    d: "Los finalistas lado a lado con el puntaje de cada uno, sus respuestas y lo que opinó tu equipo. Se acabó el ida y vuelta de audios preguntando «¿este cuál era?».",
  },
  {
    n: "03",
    t: "Nadie te queda mal hablando",
    d: "Cada candidato ve en qué etapa está, cuánto le falta y cómo terminó — incluso si queda afuera. Los que no quedan se van sin bronca, y esos son los que después te recomiendan.",
  },
  {
    n: "04",
    t: "Ya está todo escrito",
    d: "No tenés que inventar una sola pregunta. Cinco pruebas listas y cinco procesos completos por puesto: elegís, publicás y listo.",
  },
];

const PASOS = [
  {
    t: "Elegí el puesto",
    d: "Cajero, chofer, call center, gastronomía o vendedor. Te queda armado con sus etapas y preguntas.",
  },
  {
    t: "Pegalo a tu aviso",
    d: "Un clic sobre una vacante que ya tenés publicada en Worka. Listo, está online.",
  },
  {
    t: "Andá a hacer otra cosa",
    d: "La gente rinde de noche, el domingo, desde el celular. Se corrige solo y vos no tocás nada.",
  },
  {
    t: "Volvé y elegí",
    d: "Los mejores ya están ordenados arriba, con la evidencia al lado. Decidís y cerrás.",
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
    t: "Que la evaluación anual deje de ser un trámite",
    d: "El jefe no elige una estrella: elige la frase que describe lo que vio. Por eso un 4 significa lo mismo en depósito que en ventas, y la persona sale de la reunión sabiendo exactamente qué tiene que hacer distinto.",
    dato: "10 competencias, con las cinco conductas escritas",
  },
  {
    k: "Autoevaluación",
    t: "Enterate de lo que tu gente no te dice",
    d: "Cuando alguien se pone 5 y su jefe le pone 2, ahí tenés la conversación que venías postergando hace un año. Y al revés: el que se subestima es el que nunca te va a pedir el aumento que se merece — hasta que se va.",
    dato: "Te marcamos por dónde empezar a hablar",
  },
  {
    k: "Integridad",
    t: "Lo que no vas a ver en un CV",
    d: "Nueve señales sobre el cuidado de lo ajeno, el trato con los compañeros y el manejo de la información. Sin acusar a nadie: te decimos con quién conviene charlar un poco más antes de darle las llaves.",
    dato: "Y te avisa si contestó para quedar bien",
  },
];

const INFORME = [
  {
    t: "¿Es bueno o parece bueno?",
    d: "Un 72% no significa nada solo. Te mostramos si ese candidato está arriba o abajo del resto de la gente que rindió, dibujado para que se entienda de un vistazo.",
  },
  {
    t: "¿Se parece a lo que buscás?",
    d: "Vos decís qué importa para el puesto y el gráfico superpone las dos formas. Mientras más se pisan, más cerca está de lo que necesitás.",
  },
  {
    t: "¿Contestó en serio?",
    d: "Si marcó todo igual, si voló las preguntas o si se contradijo, te lo decimos antes de que leas el resto. Nadie decide con un dato que no vale.",
  },
  {
    t: "¿Sirvió la prueba?",
    d: "Si los veinte sacaron parecido, esa prueba no te está separando a nadie y elegir por ahí es tirar una moneda. Te lo avisamos para que la ajustes.",
  },
];

// Los números son del producto, no inventados: cinco instrumentos en el
// catálogo, cinco procesos por puesto, y el total real de ítems redactados.
const CIFRAS = [
  { v: "5 min", l: "y tenés el proceso online" },
  { v: "96", l: "preguntas ya escritas" },
  { v: "0", l: "cuentas que crear el candidato" },
  { v: "24/7", l: "rinden cuando pueden" },
];

export default async function EvaluarLandingPage() {
  // Los precios salen de site_settings, los mismos que muestra /precios: un
  // JSON-LD con un precio distinto al de la página es motivo de sanción.
  const settings = await getSiteSettings();

  return (
    <MarketingShell>
      {/* Datos estructurados. Van en el HTML y no por script externo porque
          Google los lee al renderizar, y un script diferido puede no estar
          cuando pasa el rastreador. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            jsonLdProducto({
              esencial: settings.evaluar_precio_esencial ?? undefined,
              profesional: settings.evaluar_precio_profesional ?? undefined,
            }),
            jsonLdFaq(),
            jsonLdMigas([{ nombre: "Worka Evaluar", path: "/" }]),
          ]),
        }}
      />
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
              La entrevista te{" "}
              <span style={{ color: "var(--color-accent)" }}>miente</span>.
              <br />
              Los datos, no.
            </h1>

            <p
              className="text-base leading-relaxed max-w-[440px] mb-8"
              style={{ color: MUTED }}
            >
              Todos caemos: el que cae simpático en la entrevista arranca el
              lunes y a los dos meses ya no está. Worka Evaluar te muestra
              quién sabe hacer el trabajo{" "}
              <span style={{ color: "var(--color-text)" }}>
                antes de que le des el puesto
              </span>
              — y sin que nadie tenga que crear una cuenta.
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
                  Armás el proceso en
                </p>
                <p className="text-2xl font-medium m-0">5 minutos</p>
              </div>
              <div style={{ width: 1, background: "rgba(233,233,237,.12)" }} />
              <div>
                <p className="nk-mono mb-1.5" style={{ color: FAINT }}>
                  Y lo probás
                </p>
                <p className="text-2xl font-medium m-0">gratis {TRIAL_DAYS} días</p>
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
          Contratar mal te sale carísimo. Esto lo evita.
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
            Publicá hoy. Ya está todo escrito.
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[560px] mb-11"
            style={{ color: MUTED }}
          >
            Otras plataformas te dan la plantilla vacía y el trabajo de
            llenarla. Acá abrís, elegís y publicás: 96 preguntas escritas en
            castellano de acá, que se corrigen y se interpretan solas.{" "}
            <span style={{ color: "var(--color-text)" }}>
              Cero horas de tu tiempo redactando
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
                Contratás un tornero. ¿Y ahora qué le preguntás?
              </h2>
              <p
                className="text-[15px] leading-relaxed mb-4"
                style={{ color: "rgba(233,233,237,.7)" }}
              >
                El catálogo cubre los puestos que más se buscan en Paraguay.
                Pero cuando el puesto es raro, el que sabe qué preguntar sos
                vos — y no tenés tres horas para armar un test.
              </p>
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: "rgba(233,233,237,.7)" }}
              >
                Escribí una línea sobre el puesto y en{" "}
                <span style={{ color: "var(--color-text)" }}>
                  treinta segundos
                </span>{" "}
                tenés la prueba armada, con sus opciones y sus respuestas
                correctas. La revisás, la editás y la publicás. Nunca sale sola
                al aire: vos tenés la última palabra.
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
            Contratar es la mitad del trabajo
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[580px] mb-12"
            style={{ color: MUTED }}
          >
            La gente buena no se va por plata: se va porque nadie le dijo cómo
            venía ni hacia dónde iba. La misma plataforma que te ayuda a
            elegirlos te ayuda a no perderlos.
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
            Dejá de contratar por corazonada
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[560px] mb-11"
            style={{ color: MUTED }}
          >
            Cada candidato te llega con un informe que contesta las cuatro
            preguntas que de verdad te hacés antes de decidir. En una hoja, y
            listo para imprimir y llevar a la reunión.
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
            Hoy lo armás. Mañana ya tenés gente rindiendo.
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
          className="mt-5 mx-auto max-w-[500px] leading-relaxed"
          style={{ color: "rgba(233,233,237,.55)" }}
        >
          Tomá tu próxima búsqueda y hacela acá. {TRIAL_DAYS} días completos,
          sin tarjeta y sin cobro automático: si no te sirve, cerrás la pestaña
          y no pagaste nada.
        </p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <Link href="/evaluar/app" className="nk-cta">
            Empezar gratis
          </Link>
          <VentasCta mensaje="Hola, quiero que me cuenten sobre Worka Evaluar antes de empezar." />
        </div>
        <p className="text-[12.5px] mt-5" style={{ color: FAINT }}>
          ¿Sos consultora de RRHH o tenés varias sucursales? Escribinos y lo
          armamos a tu medida.
        </p>
      </section>
    </MarketingShell>
  );
}
