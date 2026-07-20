import Link from "next/link";
import Logo from "@/components/Logo";
import { getActiveJobsCount, getSiteSettings } from "@/lib/data";
import LandingSearch from "@/components/LandingSearch";

const DIFFERENTIATORS = [
  {
    icon: "🚌",
    title: "Sabés cómo llegar",
    text: "Cada vacante presencial muestra las líneas de colectivo cercanas y se abre directo en Google Maps o Moovit.",
  },
  {
    icon: "✅",
    title: "Empresas con RUC verificado",
    text: "Contrastamos el RUC de cada empresa contra el registro público antes de darle el sello de verificada.",
  },
  {
    icon: "💬",
    title: "Alertas por WhatsApp",
    text: "Te avisamos cuando una empresa ve tu perfil y cuando aparecen vacantes de tu rubro en tu ciudad.",
  },
  {
    icon: "⚡",
    title: "Postulación en segundos",
    text: "Sin formularios eternos: 1 clic y hasta 3 preguntas simples que la empresa realmente necesita saber.",
  },
  {
    icon: "✨",
    title: "Modo primer empleo",
    text: "Un interruptor que filtra solo vacantes sin requisito de experiencia. Nadie más lo hace en Paraguay.",
  },
  {
    icon: "📄",
    title: "CV gratis hecho por Worka",
    text: "¿No tenés CV? Respondé unas preguntas y te generamos uno profesional en PDF, sin costo.",
  },
  {
    icon: "🛡️",
    title: "Cero estafas laborales",
    text: "Bloqueamos ofertas que piden dinero y la comunidad puede denunciar: con 3 denuncias, la vacante se oculta sola.",
  },
  {
    icon: "📈",
    title: "Seguimiento real",
    text: "Ves cuándo la empresa miró tu perfil y por qué no avanzaste. Basta de postular al vacío.",
  },
];

const CANDIDATE_STEPS = [
  {
    n: "1",
    title: "Creá tu perfil en 2 minutos",
    text: "Con tu WhatsApp y tu ciudad alcanza. Si tenés CV lo leemos nosotros; si no, te lo generamos gratis.",
  },
  {
    n: "2",
    title: "Postulate con 1 clic",
    text: "Filtrá por ciudad, rubro o modo primer empleo. Cada tarjeta te dice el salario y cómo llegar en colectivo.",
  },
  {
    n: "3",
    title: "Recibí novedades por WhatsApp",
    text: "Te avisamos cuando la empresa revisa tu perfil. Sin apps raras: todo llega a tu teléfono.",
  },
];

const COMPANY_FEATURES = [
  "Publicá vacantes ilimitadas, gratis",
  "Plantillas para publicar en 2 minutos",
  "Preguntas de filtro: leé solo CVs que aplican",
  "Kanban de candidatos con contacto directo por WhatsApp",
  "Sello de empresa verificada e insignias que generan confianza",
  "Métricas de cada búsqueda: vistas, postulaciones y contactados",
];

const FAQS = [
  {
    q: "¿Worka es realmente gratis?",
    a: "Sí. Para candidatos es gratis para siempre. Para empresas, publicar vacantes y gestionar candidatos tampoco tiene costo; más adelante habrá opciones pagas de visibilidad extra (vacantes destacadas), pero lo esencial no se cobra.",
  },
  {
    q: "¿Cómo sé que una empresa es real?",
    a: "Toda empresa registra su RUC y lo contrastamos con el registro público de la DNIT antes de darle el sello ✓ Verificada. Además, cada empresa tiene una página pública con su historial en Worka.",
  },
  {
    q: "¿Qué pasa si veo una oferta sospechosa?",
    a: "Denunciala desde el menú de la tarjeta. Con 3 denuncias válidas la vacante se oculta automáticamente y nuestro equipo la revisa. Y recordá: en Worka ninguna oferta puede pedirte dinero.",
  },
  {
    q: "¿Necesito CV para postularme?",
    a: "No. Podés crear tu perfil respondiendo unas preguntas y Worka te genera un CV profesional en PDF, gratis. Si ya tenés CV, lo subís y completamos tu perfil automáticamente.",
  },
  {
    q: "¿Funciona bien con pocos datos?",
    a: "Sí. Worka está pensada para celulares y conexiones inestables: pantallas livianas, sin videos pesados y con lo importante primero.",
  },
];

export const revalidate = 300;

// Secciones editables desde /admin con formato de una línea por ítem,
// campos separados por "|". Si el ajuste está vacío, se usan los textos base.
function parseLines<T>(
  value: string | undefined,
  map: (parts: string[]) => T | null
): T[] {
  return (value ?? "")
    .split("\n")
    .map((line) => map(line.split("|").map((p) => p.trim())))
    .filter((x): x is T => x !== null);
}

export default async function LandingPage() {
  const [jobsCount, settings] = await Promise.all([
    getActiveJobsCount(),
    getSiteSettings(),
  ]);

  const customDiffs = parseLines(settings.landing_differentiators, (p) =>
    p.length >= 3 ? { icon: p[0], title: p[1], text: p[2] } : null
  );
  const differentiators = customDiffs.length > 0 ? customDiffs : DIFFERENTIATORS;

  const customSteps = parseLines(settings.landing_steps, (p) =>
    p.length >= 2 ? { title: p[0], text: p[1] } : null
  );
  const candidateSteps =
    customSteps.length > 0
      ? customSteps.map((s, i) => ({ n: `${i + 1}`, ...s }))
      : CANDIDATE_STEPS;

  const customFaqs = parseLines(settings.landing_faqs, (p) =>
    p.length >= 2 ? { q: p[0], a: p.slice(1).join(" | ") } : null
  );
  const faqs = customFaqs.length > 0 ? customFaqs : FAQS;

  return (
    <main className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/empleos" className="hover:text-primary">
              Buscar empleo
            </Link>
            <a href="#como-funciona" className="hover:text-primary">
              Cómo funciona
            </a>
            <a href="#empresas" className="hover:text-primary">
              Para empresas
            </a>
            <a href="#faq" className="hover:text-primary">
              Preguntas
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/ingresar" className="btn-secondary">
              Ingresar
            </Link>
            <Link href="/registro" className="btn-primary hidden sm:inline-flex">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 sm:pt-24 sm:pb-16 text-center">
          <p className="inline-flex items-center gap-2 chip bg-blue-100 text-primary-dark mb-4 animate-fade-up">
            {settings.hero_badge}
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-primary-dark leading-tight animate-fade-up">
            {settings.hero_title}
          </h1>
          <p className="mt-4 text-gray-600 text-base sm:text-xl max-w-2xl mx-auto animate-fade-up">
            {settings.hero_subtitle}
          </p>

          <LandingSearch jobsCount={jobsCount} />

          <div className="mt-10 grid grid-cols-3 max-w-lg mx-auto divide-x divide-gray-200 animate-fade-up">
            {[
              { value: `${jobsCount}`, label: "vacantes activas" },
              { value: "100%", label: "gratis, sin comisiones" },
              { value: "RUC ✓", label: "empresas verificadas" },
            ].map((s) => (
              <div key={s.label} className="px-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-dark">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-4xl font-bold text-primary-dark text-center">
            Conseguir trabajo, sin vueltas
          </h2>
          <p className="text-center text-gray-500 mt-2 max-w-xl mx-auto">
            Tres pasos. Nada de formularios eternos ni CVs a ciegas.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-10">
            {candidateSteps.map((step) => (
              <div key={step.n} className="card p-6 relative">
                <span className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                  {step.n}
                </span>
                <h3 className="font-semibold text-primary-dark mt-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/onboarding" className="btn-primary text-base px-8 py-3">
              Crear mi perfil gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Diferenciadores */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 w-full">
        <h2 className="text-2xl sm:text-4xl font-bold text-primary-dark text-center">
          Lo que solo vas a encontrar en Worka
        </h2>
        <p className="text-center text-gray-500 mt-2 max-w-xl mx-auto">
          No somos un portal de empleo más: cada detalle está pensado para cómo
          se busca trabajo en Paraguay.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {differentiators.map((f) => (
            <div
              key={f.title}
              className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <p className="text-3xl" aria-hidden>
                {f.icon}
              </p>
              <h3 className="font-semibold text-primary-dark mt-3">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Para empresas */}
      <section id="empresas" className="bg-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="chip bg-white/10 text-blue-200 mb-4">Para empresas</p>
            <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
              Encontrá talento local, verificado y sin pagar un guaraní
            </h2>
            <p className="text-blue-200 mt-3 leading-relaxed">
              Desde la pyme del barrio hasta la cadena nacional: publicá en
              minutos, filtrá con preguntas inteligentes y contactá por WhatsApp
              al candidato correcto.
            </p>
            <ul className="mt-6 space-y-2.5">
              {COMPANY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span className="text-blue-100">{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/empresa/registro"
                className="btn bg-white text-primary-dark hover:bg-blue-50"
              >
                Registrar mi empresa
              </Link>
              <Link
                href="/empresa"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                Ver el panel de ejemplo
              </Link>
            </div>
          </div>

          {/* Mini mockup del panel */}
          <div className="card bg-white text-foreground p-5 shadow-2xl rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-primary-dark text-sm">
                Cajero/a para sucursal centro
              </p>
              <span className="chip bg-emerald-50 text-emerald-700">Activo</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[
                { v: "342", l: "vistas" },
                { v: "23", l: "postulantes" },
                { v: "5", l: "contactados" },
              ].map((s) => (
                <div key={s.l} className="bg-surface rounded-xl py-3">
                  <p className="font-bold text-primary-dark">{s.v}</p>
                  <p className="text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: "Carlos B.", tag: "2/2 ✓", tagClass: "bg-emerald-50 text-emerald-700" },
                { name: "Lucía M.", tag: "1/2 ✓", tagClass: "bg-amber-50 text-amber-700" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-gray-700">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`chip ${c.tagClass}`}>{c.tag}</span>
                    <span className="chip bg-emerald-500 text-white">
                      💬 WhatsApp
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              Así se ve tu panel de candidatos en Worka
            </p>
          </div>
        </div>
      </section>

      {/* Confianza / anti-estafa */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 w-full">
        <div className="card p-6 sm:p-10 bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-100 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
          <p className="text-6xl text-center" aria-hidden>
            🛡️
          </p>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">
              El portal donde no te estafan
            </h2>
            <p className="text-gray-600 mt-2 leading-relaxed text-sm sm:text-base">
              Bloqueamos automáticamente las ofertas que piden dinero o
              &ldquo;inversión inicial&rdquo;, verificamos el RUC de cada empresa
              y la comunidad puede denunciar cualquier vacante sospechosa.
              Nuestra regla es simple:{" "}
              <span className="font-semibold text-primary-dark">
                nunca pagues para conseguir un trabajo.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-4xl font-bold text-primary-dark text-center">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card px-5 py-4 group">
                <summary className="font-medium text-primary-dark cursor-pointer list-none flex items-center justify-between gap-3 min-h-8">
                  {f.q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 w-full text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-primary-dark">
          Tu próximo paso te está esperando
        </h2>
        <p className="text-gray-500 mt-2">
          Sumate gratis. En 2 minutos ya podés postularte.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/onboarding" className="btn-primary text-base px-8 py-3">
            Buscar empleo
          </Link>
          <Link
            href="/empresa/registro"
            className="btn-secondary text-base px-8 py-3"
          >
            Publicar una vacante
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-blue-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-4 gap-8 text-sm">
          <div className="sm:col-span-2">
            <Logo light />
            <p className="mt-3 text-blue-300 max-w-xs leading-relaxed">
              La plataforma de empleo 100% gratuita de Paraguay. Tu próximo
              paso.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Candidatos</p>
            <ul className="space-y-2">
              <li>
                <Link href="/empleos" className="hover:text-white">
                  Buscar empleo
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white">
                  Crear mi perfil
                </Link>
              </li>
              <li>
                <Link href="/postulaciones" className="hover:text-white">
                  Mis postulaciones
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Empresas</p>
            <ul className="space-y-2">
              <li>
                <Link href="/empresa/registro" className="hover:text-white">
                  Registrar empresa
                </Link>
              </li>
              <li>
                <Link href="/empresa" className="hover:text-white">
                  Panel de empresa
                </Link>
              </li>
              <li>
                <Link href="/empresa/vacantes/nueva" className="hover:text-white">
                  Publicar vacante
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-blue-300 flex flex-col sm:flex-row justify-between gap-2">
            <span>Worka © 2026 · Hecho en Paraguay 🇵🇾</span>
            <div className="flex gap-4">
              <Link href="/terminos" className="hover:text-white">
                Términos
              </Link>
              <Link href="/privacidad" className="hover:text-white">
                Privacidad
              </Link>
              <span>Nunca pagues para conseguir un trabajo.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
