import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import { getSiteSettings } from "@/lib/data";
import { TRIAL_DAYS } from "@/lib/evaluar-config";
import VentasCta from "@/components/evaluar/VentasCta";
import { evaluarMetadata, jsonLdMigas } from "@/lib/evaluar/seo";

export const metadata = evaluarMetadata({
  title: "Precios y planes | Worka Evaluar",
  description:
    "Cuánto cuesta Worka Evaluar en Paraguay: planes Esencial, Profesional y Corporativo, en guaraníes. 15 días gratis, sin tarjeta y sin cobro automático.",
  path: "/precios",
});

function gs(value: string): string | null {
  const n = Number(value);
  if (!value || !Number.isFinite(n) || n <= 0) return null;
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

function Check() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--color-accent)] shrink-0 mt-1"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Los montos salen de site_settings para que se editen desde /admin sin tocar
// código: el precio de un producto nuevo se corrige varias veces antes de
// quedar firme, y cada corrección no puede depender de un despliegue.
export default async function PreciosPage() {
  const settings = await getSiteSettings();

  const planes = [
    {
      nombre: "Esencial",
      precio: gs(settings.evaluar_precio_esencial ?? ""),
      para: "Para el comercio o la pyme que contrata cada tanto.",
      incluye: [
        "Hasta 3 procesos activos",
        "Los cuatro tests listos para usar",
        "Enlace con tus vacantes de Worka",
        "Tablero de decisión",
        "Devolución automática al candidato",
      ],
    },
    {
      nombre: "Profesional",
      destacado: true,
      precio: gs(settings.evaluar_precio_profesional ?? ""),
      para: "Para empresas con búsquedas abiertas todo el año.",
      incluye: [
        "Procesos activos sin límite",
        "Todo lo del plan Esencial",
        "Invitación masiva por email",
        "Informe por candidato y exportación a Excel",
        "Varios usuarios de tu equipo",
      ],
    },
    {
      nombre: "Corporativo",
      precio: gs(settings.evaluar_precio_corporativo ?? ""),
      para: "Para consultoras de RRHH y empresas con varias sucursales.",
      incluye: [
        "Todo lo del plan Profesional",
        "Tests a medida de tus puestos",
        "Acompañamiento en la puesta en marcha",
        "Facturación y soporte dedicados",
      ],
    },
  ];

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdMigas([
              { nombre: "Worka Evaluar", path: "/" },
              { nombre: "Precios", path: "/precios" },
            ])
          ),
        }}
      />
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <header className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--nk-300)] border border-[rgba(145,132,217,.35)] rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {TRIAL_DAYS} días gratis · sin tarjeta
          </span>
          <h1 className="font-medium text-4xl md:text-5xl text-[#e9e9ed] mt-5 leading-tight">
            Precios claros, <em className="italic text-[var(--color-accent)]">sin sorpresas</em>
          </h1>
          <p className="text-[rgba(233,233,237,.58)] mt-4 leading-relaxed">
            Empezás probando con un proceso real. Si te sirve, activás el plan;
            si no, no pagás nada.{" "}
            <strong className="text-[#e9e9ed] font-medium">
              No hay cobro automático
            </strong>
            : la renovación la confirmás vos cada vez.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3 mt-14 items-start">
          {planes.map((p) => (
            <div
              key={p.nombre}
              className={`rounded-2xl p-7 border ${
                p.destacado
                  ? "border-[#5d5294] bg-[linear-gradient(165deg,#262a60,#1c1f42)]"
                  : "border-[#292b31] bg-[#1a1c26]"
              }`}
            >
              {p.destacado && (
                <span className="nk-mono inline-block rounded-full px-2.5 py-1 mb-3" style={{ border: "1px solid rgba(210,206,253,.4)", color: "var(--nk-300)" }}>
                  El más elegido
                </span>
              )}
              <h2 className="font-medium text-xl text-[#e9e9ed]">
                {p.nombre}
              </h2>
              <p className="text-sm text-[rgba(233,233,237,.58)] mt-1.5 leading-relaxed">
                {p.para}
              </p>

              <p className="mt-6 pb-6 border-b border-[#292b31]">
                {p.precio ? (
                  <>
                    <span className="font-medium text-3xl text-[#e9e9ed]">
                      {p.precio}
                    </span>
                    <span className="text-sm text-[rgba(233,233,237,.58)]"> / mes</span>
                  </>
                ) : (
                  <span className="font-medium text-2xl text-[#e9e9ed]">
                    A convenir
                  </span>
                )}
              </p>

              <ul className="mt-6 space-y-2.5">
                {p.incluye.map((f) => (
                  <li key={f} className="text-sm text-[rgba(233,233,237,.58)] flex items-start gap-2.5">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              {p.nombre === "Corporativo" ? (
                <VentasCta
                  variante="cta"
                  className="w-full mt-7"
                  mensaje="Hola, me interesa el plan Corporativo de Worka Evaluar."
                >
                  Hablar con ventas
                </VentasCta>
              ) : (
              <Link
                href="/evaluar/app"
                className={`block text-center w-full mt-7 px-5 py-3 rounded-xl font-semibold transition-colors ${
                  p.destacado
                    ? "nk-cta w-full"
                    : "nk-ghost w-full"
                }`}
              >
                Empezar gratis
              </Link>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#292b31] bg-[#1a1c26] p-7 mt-10 max-w-2xl mx-auto">
          <h2 className="font-medium text-lg text-[#e9e9ed]">
            Cómo se paga
          </h2>
          <p className="text-sm text-[rgba(233,233,237,.58)] mt-2 leading-relaxed">
            Por transferencia bancaria o link de pago. Nos avisás, activamos tu
            plan y seguís donde estabas: no se pierde ningún proceso ni ninguna
            evaluación en curso.
          </p>
          <VentasCta
            className="mt-5"
            mensaje="Hola, quiero activar mi plan de Worka Evaluar."
          >
            Coordinar el pago
          </VentasCta>
        </div>
      </div>
    </MarketingShell>
  );
}
