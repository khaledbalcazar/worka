import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  FileText,
  LayoutDashboard,
  Link2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
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
import { ROLE_TEMPLATES, TEMPLATES } from "@/lib/evaluar/templates";
import HeroCycle from "@/components/evaluar/landing/HeroCycle";
import SolutionPicker from "@/components/evaluar/landing/SolutionPicker";
import AiFeatureTabs from "@/components/evaluar/landing/AiFeatureTabs";
import RevealOnScroll from "@/components/evaluar/landing/RevealOnScroll";

// Las cifras del catálogo salen del catálogo: escritas a mano quedaban
// viejas cada vez que se sumaba una prueba ("cinco pruebas", "96 preguntas").
const PRUEBAS = TEMPLATES.length;
const PROCESOS = ROLE_TEMPLATES.length;
const ITEMS = TEMPLATES.reduce((n, t) => n + t.questions.length, 0);

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
    d: `No tenés que inventar una sola pregunta. ${PRUEBAS} pruebas listas y ${PROCESOS} procesos completos por puesto: elegís, publicás y listo.`,
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

// Los números son del producto, no inventados: el total real de ítems del
// catálogo, contado del catálogo.
const CIFRAS = [
  { v: "5 min", l: "y tenés el proceso online" },
  { v: ITEMS.toLocaleString("es-PY"), l: "preguntas ya escritas" },
  { v: "0", l: "cuentas que crear el candidato" },
  { v: "24/7", l: "rinden cuando pueden" },
];

// Un solo sistema: cada tarjeta es una parte real del producto.
const SOLUCIONES = [
  { Icon: LayoutDashboard, t: "Tablero de decisión", d: "Los finalistas lado a lado, con puntajes, respuestas y notas del equipo." },
  { Icon: Brain, t: "Pruebas psicométricas", d: "Personalidad, estilo laboral y razonamiento, listas para usar." },
  { Icon: ShieldCheck, t: "Integridad", d: "Nueve señales de actitud, con aviso si contestó para quedar bien." },
  { Icon: MessagesSquare, t: "Juicio situacional", d: "Situaciones de mostrador y teléfono, con el orden de prioridades." },
  { Icon: FileText, t: "Informe por candidato", d: "Una hoja que contesta lo que te preguntás antes de decidir." },
  { Icon: TrendingUp, t: "Desempeño", d: "Evaluaciones anuales con conductas escritas, no estrellas." },
  { Icon: Sparkles, t: "Asistente de IA", d: "Arma pruebas, lee informes y compara finalistas." },
  { Icon: Link2, t: "Conectado a Worka", d: "Enlazás tu vacante y la gente rinde desde el propio aviso." },
];

const CANDIDATO = [
  { t: "Sin crear cuenta", d: "Entra con el enlace, desde el celular, a la hora que puede." },
  { t: "O con su cuenta de Worka", d: "«Continuar con Worka Empleos» carga sus datos y su CV en un toque." },
  { t: "Sabe dónde está parado", d: "Ve cuántas etapas faltan, cuánto dura cada una y si tiene reloj." },
  { t: "No pierde nada", d: "Cada respuesta se guarda sola: puede cortar y seguir después." },
];

export default async function EvaluarLandingPage() {
  // Los precios salen de site_settings, los mismos que muestra /precios: un
  // JSON-LD con un precio distinto al de la página es motivo de sanción.
  const settings = await getSiteSettings();

  return (
    <MarketingShell>
      <RevealOnScroll />
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

      {/* ── 1. Portada ─────────────────────────────────────── */}
      <section className="relative overflow-hidden evl-hero-bg">
        <Ondas />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 pb-20 md:pt-16 md:pb-24 grid gap-12 lg:grid-cols-[1fr_1.05fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#e6e3f6] px-3.5 py-1.5 text-[13px] font-semibold text-[#5d5294] mb-6 animate-rise">
              <span className="w-2 h-2 rounded-full bg-[#0a66c2] nk-beat" /> {TRIAL_DAYS} días gratis · sin tarjeta
            </span>
            <h1 className="text-[clamp(38px,6vw,68px)] leading-[1.04] tracking-[-.035em] font-bold text-[var(--evl-ink)] animate-rise" style={{ animationDelay: "80ms" }}>
              Software de <span className="evl-grad-text">selección, evaluación</span> y desarrollo de talento
            </h1>
            <p className="text-[clamp(17px,1.6vw,20px)] leading-relaxed text-[#404b63] mt-6 max-w-[560px] animate-rise" style={{ animationDelay: "160ms" }}>
              La entrevista te miente; los datos, no. Descubrí <strong className="text-[var(--evl-ink)]">quién sabe hacer el trabajo antes de darle el puesto</strong>, con pruebas listas, un tablero para decidir y{" "}
              <strong className="text-[var(--evl-ink)]">un asistente de IA</strong> que te ahorra horas.
            </p>
            <div className="mt-9 animate-rise" style={{ animationDelay: "240ms" }}>
              <SolutionPicker trialDays={TRIAL_DAYS} />
            </div>
            <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[#5f6475]">
              <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#0a66c2]" /> El candidato no crea cuenta</span>
              <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#0a66c2]" /> Hecho en Paraguay</span>
            </div>
          </div>
          <div className="animate-rise" style={{ animationDelay: "200ms" }}>
            <HeroCycle />
          </div>
        </div>
      </section>

      {/* ── 2. Cifras ──────────────────────────────────────── */}
      <section className="bg-[#f6f5fc] border-y border-[#eeecf5]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14 grid gap-10 lg:grid-cols-[1fr_1.4fr] items-center">
          <p data-reveal className="text-[clamp(22px,2.4vw,28px)] leading-snug text-[var(--evl-ink)]">
            Todo lo que necesitás para elegir bien, <strong>{PRUEBAS} pruebas</strong> y{" "}
            <strong>{PROCESOS} procesos por puesto</strong> listos para publicar.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CIFRAS.map((c, i) => (
              <div key={c.l} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="rounded-2xl bg-white border border-[#ebe9f5] px-4 py-5 text-center">
                <p className="text-[28px] font-bold evl-grad-text leading-none">{c.v}</p>
                <p className="text-[13px] text-[#5f6475] mt-2 leading-snug">{c.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Un solo sistema ─────────────────────────────── */}
      <section id="soluciones" className="relative overflow-hidden scroll-mt-24">
        <Orbitas />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28 grid gap-12 lg:grid-cols-[1.25fr_1fr] items-center">
          <div className="grid grid-cols-2 gap-4 sm:gap-5 order-2 lg:order-1">
            {SOLUCIONES.map(({ Icon, t, d }, i) => (
              <div
                key={t}
                data-reveal
                style={{ ["--d" as string]: `${(i % 4) * 80}ms` }}
                className={`evl-card p-5 sm:p-6 ${i % 2 === 1 ? "lg:translate-y-14" : ""}`}
              >
                <span className="evl-icon">
                  <Icon size={20} />
                </span>
                <h3 className="text-[17px] sm:text-[19px] font-semibold text-[var(--evl-ink)] mt-5 leading-snug">{t}</h3>
                <p className="text-[13.5px] text-[#5f6475] mt-1.5 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-28 self-start lg:pl-6" data-reveal>
            <span className="evl-eyebrow">Plataforma</span>
            <h2 className="text-[clamp(38px,5.4vw,64px)] leading-[1.02] tracking-[-.035em] font-bold mt-4 text-[var(--evl-ink)]">
              Un solo sistema con <span className="evl-grad-text">todas las soluciones</span>
            </h2>
            <p className="text-[17px] text-[#404b63] mt-5 leading-relaxed max-w-[440px]">
              Contratar mal te sale carísimo. Publicás, evaluás, comparás y decidís en el mismo lugar — y después seguís acompañando a tu gente.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <VentasCta mensaje="Hola, quiero que me cuenten sobre Worka Evaluar." className="evl-btn !border-0" variante="cta">
                Chateá con un asesor
              </VentasCta>
              <Link href="/evaluar/precios" className="evl-btn-ghost">Ver planes</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Por qué funciona ────────────────────────────── */}
      <section className="bg-[#0e1a33] text-white relative overflow-hidden">
        <div className="absolute -right-40 -top-40 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(#5d5294, transparent 70%)" }} aria-hidden />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-24">
          <span className="evl-eyebrow !text-[#b9b1ec]">Por qué funciona</span>
          <h2 className="evl-h2 !text-white mt-4 max-w-[720px]">Se postulan y ya están rindiendo. Vos elegís en diez minutos.</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-12">
            {DIFERENCIALES.map((d, i) => (
              <div key={d.n} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="rounded-2xl bg-white/[.06] border border-white/10 p-6 hover:bg-white/[.09] transition-colors">
                <span className="text-[13px] font-mono text-[#8fc2f5]">{d.n}</span>
                <h3 className="text-[18px] font-semibold mt-3 leading-snug">{d.t}</h3>
                <p className="text-[14px] text-white/65 mt-2.5 leading-relaxed">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Inteligencia artificial ─────────────────────── */}
      <section id="ia" className="relative scroll-mt-24 bg-[linear-gradient(180deg,#ffffff,#f6f5fc)]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
          <div data-reveal>
            <span className="evl-eyebrow">Asistente de IA</span>
            <h2 className="evl-h2 mt-4">
              Funcionalidades con <span className="evl-grad-text">inteligencia artificial</span>
            </h2>
          </div>
          <div className="mt-12" data-reveal>
            <AiFeatureTabs />
          </div>
          <p className="text-[13.5px] text-[#5f6475] mt-12 max-w-[720px] rounded-2xl border border-[#e6e3f6] bg-white px-5 py-4" data-reveal>
            <strong className="text-[var(--evl-ink)]">Lo que nunca va a preguntar:</strong> edad, sexo, religión, estado civil, hijos, embarazo, salud, nacionalidad ni afiliación política. Y a la IA no le llegan nombres ni datos de contacto de tus candidatos.
          </p>
        </div>
      </section>

      {/* ── 6. Instrumentos ────────────────────────────────── */}
      <section id="instrumentos" className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] items-end" data-reveal>
            <div>
              <span className="evl-eyebrow">Pruebas psicométricas</span>
              <h2 className="evl-h2 mt-4">Publicá hoy. Ya está todo escrito.</h2>
            </div>
            <p className="text-[16px] text-[#404b63] leading-relaxed">
              {ITEMS.toLocaleString("es-PY")} preguntas escritas en castellano de acá, que se corrigen y se interpretan solas.{" "}
              <strong className="text-[var(--evl-ink)]">Cero horas de tu tiempo redactando.</strong>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {INSTRUMENTOS.map((t, i) => (
              <div key={t.k} data-reveal style={{ ["--d" as string]: `${(i % 3) * 90}ms` }} className="evl-card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[19px] font-semibold text-[var(--evl-ink)]">{t.n}</h3>
                  {t.cron && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#eef5fc] text-[#0a66c2] text-[12px] font-semibold px-2.5 py-1">
                      <Timer size={13} /> Con reloj
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#5f6475] leading-relaxed mt-2.5 flex-1">{t.d}</p>
                <div className="grid grid-cols-3 gap-2 mt-5">
                  {[
                    [t.i, "ítems"],
                    [t.m, "minutos"],
                    [t.dim, t.dim === 1 ? "rasgo" : "rasgos"],
                  ].map(([v, l]) => (
                    <div key={String(l)} className="rounded-xl bg-[#f6f5fc] px-2 py-2.5 text-center">
                      <p className="text-[18px] font-bold text-[var(--evl-ink)] leading-none">{v}</p>
                      <p className="text-[11.5px] text-[#5f6475] mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div data-reveal style={{ ["--d" as string]: "180ms", background: "var(--evl-grad)" }} className="rounded-[22px] p-6 text-white shadow-[0_18px_40px_-20px_rgba(10,102,194,.55)]">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-[12.5px] font-bold uppercase tracking-[.08em] text-white/70">O directo por puesto</p>
                  <h3 className="text-[21px] font-semibold mt-3 leading-snug">{PROCESOS} procesos enteros, ya armados</h3>
                  <p className="text-[14px] text-white/80 mt-2 leading-relaxed">Etapas, preguntas de filtro y tests, listos para publicar.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {["Cajero", "Chofer", "Call center", "Gastronomía", "Vendedor"].map((r) => (
                    <span key={r} className="rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[12.5px]">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Experiencia del candidato ───────────────────── */}
      <section id="candidato" className="scroll-mt-24 bg-[#f6f5fc] border-y border-[#eeecf5] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28 grid gap-14 lg:grid-cols-[1fr_1fr] items-center">
          <div data-reveal>
            <span className="evl-eyebrow">Para el candidato</span>
            <h2 className="evl-h2 mt-4">Una evaluación que se hace con ganas, <span className="evl-grad-text">desde el celular</span></h2>
            <p className="text-[16px] text-[#404b63] mt-5 leading-relaxed max-w-[520px]">
              Los que no quedan se van sin bronca, y esos son los que después te recomiendan. Cada persona ve tu marca, sabe cuánto le falta y cómo terminó.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {CANDIDATO.map((c, i) => (
                <li key={c.t} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className="flex gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-[#e6e3f6] grid place-items-center text-[#0a66c2]">
                    <Check size={16} />
                  </span>
                  <span>
                    <span className="block text-[15.5px] font-semibold text-[var(--evl-ink)]">{c.t}</span>
                    <span className="block text-[14px] text-[#5f6475] mt-0.5 leading-relaxed">{c.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ ["--d" as string]: "120ms" }}>
            <TelefonoDemo />
          </div>
        </div>
      </section>

      {/* ── 8. Gestión de talento ──────────────────────────── */}
      <section id="talento" className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
          <div data-reveal className="max-w-[720px]">
            <span className="evl-eyebrow">Gestión de talento humano</span>
            <h2 className="evl-h2 mt-4">Contratar es la mitad del trabajo</h2>
            <p className="text-[16px] text-[#404b63] mt-4 leading-relaxed">
              La gente buena no se va por plata: se va porque nadie le dijo cómo venía ni hacia dónde iba. La misma plataforma que te ayuda a elegirlos te ayuda a no perderlos.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 mt-12">
            {TALENTO.map((b, i) => (
              <div key={b.t} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="evl-card p-7 flex flex-col">
                <span className="self-start rounded-full bg-[#efedfb] text-[#5d5294] text-[12.5px] font-semibold px-3 py-1">{b.k}</span>
                <h3 className="text-[20px] font-semibold text-[var(--evl-ink)] mt-4 leading-snug">{b.t}</h3>
                <p className="text-[14px] text-[#5f6475] mt-2.5 leading-relaxed flex-1">{b.d}</p>
                <p className="text-[13px] font-semibold text-[#0a66c2] mt-5 pt-4 border-t border-[#eeecf5] flex items-center gap-1.5">
                  <ArrowRight size={14} /> {b.dato}
                </p>
              </div>
            ))}
          </div>

          {/* El anclaje de conducta, mostrado. Es la diferencia entre esto y
              una planilla de estrellas, y contarlo no alcanza. */}
          <div data-reveal className="mt-5 evl-card !bg-white p-7 md:p-9 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center hover:!translate-y-0">
            <div>
              <span className="evl-eyebrow">Por qué no son estrellas</span>
              <h3 className="text-[24px] font-semibold text-[var(--evl-ink)] mt-3 leading-snug">El evaluador no elige un número: elige lo que vio</h3>
              <p className="text-[14.5px] text-[#5f6475] mt-3 leading-relaxed">
                «Calificá comunicación del 1 al 5» da números que dependen de quién califica. Con descripciones de conducta, el número significa lo mismo en toda la empresa — y la persona se lleva algo concreto sobre lo que trabajar.
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
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition-colors ${a.on ? "border-[#5d5294] bg-[#f5f3ff]" : "border-[#eeecf5]"}`}
                >
                  <span className={`grid place-items-center w-6 h-6 rounded-full text-[12px] font-bold shrink-0 ${a.on ? "text-white" : "bg-[#f1f0f7] text-[#5f6475]"}`} style={a.on ? { background: "var(--evl-grad)" } : undefined}>
                    {a.n}
                  </span>
                  <span className={`text-[14px] leading-snug ${a.on ? "text-[var(--evl-ink)] font-medium" : "text-[#5f6475]"}`}>{a.t}</span>
                </div>
              ))}
              <p className="text-[12.5px] text-[#8a8fa0] mt-1">Competencia: comunicación</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. El informe ──────────────────────────────────── */}
      <section className="bg-[linear-gradient(180deg,#f6f5fc,#ffffff)] border-t border-[#eeecf5]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div data-reveal className="lg:sticky lg:top-28 self-start">
            <span className="evl-eyebrow">El informe</span>
            <h2 className="evl-h2 mt-4">Dejá de contratar por corazonada</h2>
            <p className="text-[16px] text-[#404b63] mt-4 leading-relaxed">
              Cada candidato te llega con un informe que contesta las cuatro preguntas que de verdad te hacés antes de decidir. En una hoja, lista para imprimir.
            </p>
            <p className="text-[13.5px] text-[#5f6475] mt-5 leading-relaxed">
              Todo esto entra a la conversación junto a la entrevista y la experiencia, nunca en lugar de ellas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {INFORME.map((x, i) => (
              <div key={x.t} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="evl-card p-6">
                <span className="text-[34px] font-bold evl-grad-text leading-none">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[18px] font-semibold text-[var(--evl-ink)] mt-3">{x.t}</h3>
                <p className="text-[14px] text-[#5f6475] mt-2 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Cómo funciona ──────────────────────────────── */}
      <section id="como-funciona" className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-24">
          <div data-reveal className="text-center max-w-[640px] mx-auto">
            <span className="evl-eyebrow">Cómo funciona</span>
            <h2 className="evl-h2 mt-4">Hoy lo armás. Mañana ya tenés gente rindiendo.</h2>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-14 relative">
            <div className="absolute left-[12%] right-[12%] top-7 h-[2px] hidden lg:block rounded-full" style={{ background: "linear-gradient(90deg,#0a66c2,#5d5294)" }} aria-hidden />
            {PASOS.map((p, i) => (
              <li key={p.t} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }} className="relative text-center">
                <span className="relative mx-auto w-14 h-14 rounded-full grid place-items-center text-white text-[20px] font-bold ring-8 ring-white" style={{ background: "var(--evl-grad)" }}>
                  {i + 1}
                </span>
                <h3 className="text-[18px] font-semibold text-[var(--evl-ink)] mt-5">{p.t}</h3>
                <p className="text-[14px] text-[#5f6475] mt-2 leading-relaxed max-w-[260px] mx-auto">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 11. Preguntas ──────────────────────────────────── */}
      <section id="preguntas" className="scroll-mt-24 bg-[#f6f5fc] border-t border-[#eeecf5]">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-20 md:py-24">
          <div data-reveal className="text-center">
            <span className="evl-eyebrow">Preguntas</span>
            <h2 className="evl-h2 mt-4 mb-10">Lo que más nos preguntan</h2>
          </div>
          <div data-reveal className="rounded-[22px] bg-white border border-[#ebe9f5] px-5 sm:px-8 py-2">
            <Faq />
          </div>
        </div>
      </section>

      {/* ── 12. Cierre ─────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-20">
        <div data-reveal className="relative max-w-[1200px] mx-auto rounded-[32px] overflow-hidden px-6 sm:px-12 py-16 md:py-20 text-center text-white" style={{ background: "var(--evl-grad)" }}>
          <Ondas claro />
          <div className="relative">
            <h2 className="text-[clamp(32px,4.6vw,54px)] font-bold tracking-[-.03em] leading-[1.06] max-w-[760px] mx-auto">
              Probalo con tu próxima búsqueda
            </h2>
            <p className="mt-5 mx-auto max-w-[540px] text-[17px] text-white/85 leading-relaxed">
              {TRIAL_DAYS} días completos, sin tarjeta y sin cobro automático: si no te sirve, cerrás la pestaña y no pagaste nada.
            </p>
            <div className="flex gap-3 justify-center mt-9 flex-wrap">
              <Link href="/evaluar/app" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0a66c2] font-semibold px-7 py-3.5 hover:bg-[#f3f8fd] transition-colors">
                Empezar gratis <ArrowRight size={17} />
              </Link>
              <VentasCta mensaje="Hola, quiero que me cuenten sobre Worka Evaluar antes de empezar." className="!rounded-full !border-white/50 !text-white !bg-white/10 hover:!bg-white/20 !px-6 !py-3.5 !font-semibold" />
            </div>
            <p className="text-[13.5px] mt-6 text-white/70">¿Sos consultora de RRHH o tenés varias sucursales? Escribinos y lo armamos a tu medida.</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

// Hilos ondulados de fondo: dos capas que se deslizan a distinta velocidad.
function Ondas({ claro = false }: { claro?: boolean }) {
  const color = claro ? "rgba(255,255,255,.28)" : "rgba(93,82,148,.16)";
  const color2 = claro ? "rgba(255,255,255,.16)" : "rgba(10,102,194,.12)";
  const linea = (y: number, a: number) =>
    `M0 ${y} C 150 ${y - a}, 300 ${y + a}, 450 ${y} S 750 ${y - a}, 900 ${y} S 1200 ${y + a}, 1350 ${y} S 1650 ${y - a}, 1800 ${y}`;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg className="evl-wave absolute -bottom-6 left-0 h-[70%] w-[200%]" viewBox="0 0 1800 300" preserveAspectRatio="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={linea(150 + i * 9, 60 + i * 6)} fill="none" stroke={color} strokeWidth="1.2" />
        ))}
      </svg>
      <svg className="evl-wave is-slow absolute top-0 left-0 h-[60%] w-[200%]" viewBox="0 0 1800 300" preserveAspectRatio="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={linea(120 + i * 12, 80 - i * 6)} fill="none" stroke={color2} strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

// Círculos concéntricos detrás de la grilla de soluciones.
function Orbitas() {
  return (
    <svg className="absolute -left-40 top-24 w-[760px] h-[760px] pointer-events-none hidden md:block" viewBox="0 0 760 760" aria-hidden>
      {[360, 300, 240].map((r) => (
        <circle key={r} cx="380" cy="380" r={r} fill="none" stroke="#e6e3f6" strokeWidth="1.2" />
      ))}
      <circle cx="680" cy="230" r="9" fill="none" stroke="#b9b1ec" strokeWidth="2" className="evl-float" />
      <circle cx="40" cy="470" r="11" fill="none" stroke="#9ec5ee" strokeWidth="2" className="evl-float" />
    </svg>
  );
}

// Lo que ve el candidato, dibujado: un teléfono con una pregunta en curso.
function TelefonoDemo() {
  return (
    <div className="relative mx-auto w-[290px] sm:w-[310px]">
      <div className="absolute -inset-10 rounded-full blur-3xl opacity-60" style={{ background: "radial-gradient(rgba(93,82,148,.35), transparent 70%)" }} aria-hidden />
      <div className="relative rounded-[40px] bg-[#0e1a33] p-3 shadow-[0_40px_80px_-30px_rgba(29,43,79,.6)] evl-float">
        <div className="rounded-[30px] bg-[#f3efea] overflow-hidden">
          <div className="bg-white px-4 py-3 flex items-center gap-2.5 border-b border-[#e0dfdc]">
            <span className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white grid place-items-center text-sm font-bold">S</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold text-[#1d2226]">Supermercado</span>
              <span className="block text-[10.5px] text-[#666]">Cajero/a · Centro</span>
            </span>
            <span className="text-[10px] text-[#666] flex items-center gap-1"><Check size={11} /> Guardado</span>
          </div>
          <div className="p-3.5">
            <div className="rounded-2xl bg-white border border-[#e0dfdc] p-3.5">
              <div className="flex gap-1 mb-3">
                <span className="h-1 flex-1 rounded-full bg-[#0a66c2]" />
                <span className="h-1 flex-1 rounded-full bg-[#e0dfdc]" />
                <span className="h-1 flex-1 rounded-full bg-[#e0dfdc]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#666]">Etapa 1 de 3</span>
                <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">08:42</span>
              </div>
              <p className="text-[13.5px] font-semibold text-[#1d2226] mt-2.5 leading-snug">¿Qué número sigue? 2, 4, 8, 16, __</p>
              <div className="space-y-1.5 mt-3">
                {["18", "24", "32", "64"].map((o, i) => (
                  <div
                    key={o}
                    className={`rounded-xl border px-3 py-2 text-[12.5px] flex items-center gap-2 ${i === 2 ? "bg-[#0a66c2] border-[#0a66c2] text-white" : "border-[#e0dfdc] text-[#1d2226]"}`}
                  >
                    <span className={`w-4 h-4 rounded-full border text-[9px] grid place-items-center ${i === 2 ? "border-white" : "border-[#d4d2ce]"}`}>{i === 2 ? "✓" : i + 1}</span>
                    {o}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-[#0a66c2] text-white text-center text-[12.5px] font-semibold py-2">Siguiente</div>
            </div>
            <div className="mt-3 rounded-full bg-[#0a66c2] text-white text-[11.5px] font-semibold px-3 py-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-[#004e99] grid place-items-center text-[10px] font-extrabold">W.</span>
              Continuar con Worka Empleos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
