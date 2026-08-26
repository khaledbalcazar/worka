import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import { getSiteSettings } from "@/lib/data";
import { TRIAL_DAYS } from "@/lib/evaluar-config";

export const metadata = {
  title: "Precios",
  description:
    "Planes de Worka Evaluar. Empezá con 15 días gratis, sin tarjeta y sin cobro automático.",
};

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
      className="text-copper shrink-0 mt-1"
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
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <header className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-copper border border-copper/30 bg-copper/10 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-copper" />
            {TRIAL_DAYS} días gratis · sin tarjeta
          </span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-cream mt-5 leading-tight">
            Precios claros, <em className="italic text-copper">sin sorpresas</em>
          </h1>
          <p className="text-mist mt-4 leading-relaxed">
            Empezás probando con un proceso real. Si te sirve, activás el plan;
            si no, no pagás nada.{" "}
            <strong className="text-cream font-medium">
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
                  ? "border-copper/50 bg-panel"
                  : "border-edge bg-panel/50"
              }`}
            >
              {p.destacado && (
                <span className="inline-block text-[11px] font-semibold text-navy bg-copper rounded-full px-3 py-1 mb-3">
                  El más elegido
                </span>
              )}
              <h2 className="font-heading font-bold text-xl text-cream">
                {p.nombre}
              </h2>
              <p className="text-sm text-mist mt-1.5 leading-relaxed">
                {p.para}
              </p>

              <p className="mt-6 pb-6 border-b border-edge">
                {p.precio ? (
                  <>
                    <span className="font-heading font-black text-3xl text-cream">
                      {p.precio}
                    </span>
                    <span className="text-sm text-mist"> / mes</span>
                  </>
                ) : (
                  <span className="font-heading font-black text-2xl text-cream">
                    A convenir
                  </span>
                )}
              </p>

              <ul className="mt-6 space-y-2.5">
                {p.incluye.map((f) => (
                  <li key={f} className="text-sm text-mist flex items-start gap-2.5">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/evaluar/app"
                className={`block text-center w-full mt-7 px-5 py-3 rounded-xl font-semibold transition-colors ${
                  p.destacado
                    ? "bg-copper text-navy hover:bg-copper-lite"
                    : "border border-edge text-mist hover:text-cream hover:border-cream/20"
                }`}
              >
                Empezar gratis
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-edge bg-panel/50 p-7 mt-10 max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-lg text-cream">
            Cómo se paga
          </h2>
          <p className="text-sm text-mist mt-2 leading-relaxed">
            Por transferencia bancaria o link de pago. Nos avisás, activamos tu
            plan y seguís donde estabas: no se pierde ningún proceso ni ninguna
            evaluación en curso.
          </p>
          <a
            href="https://wa.me/595981000000?text=Quiero%20activar%20Worka%20Evaluar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-5 px-5 py-3 border border-edge text-mist hover:text-cream hover:border-cream/20 rounded-xl transition-colors text-sm"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </MarketingShell>
  );
}
