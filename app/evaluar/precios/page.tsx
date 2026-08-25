import Link from "next/link";
import { Check } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="chip bg-emerald-50 text-emerald-700 font-semibold">
          {TRIAL_DAYS} días gratis · sin tarjeta
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark mt-3">
          Precios claros, sin sorpresas
        </h1>
        <p className="text-slate-600 mt-3">
          Empezás probando con un proceso real. Si te sirve, activás el plan; si
          no, no pagás nada. <strong>No hay cobro automático</strong>: la
          renovación la confirmás vos cada vez.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-10 stagger items-start">
        {planes.map((p) => (
          <div
            key={p.nombre}
            className={`card p-6 ${
              p.destacado ? "border-primary ring-1 ring-primary/20" : ""
            }`}
          >
            {p.destacado && (
              <span className="chip bg-primary text-white mb-2">
                El más elegido
              </span>
            )}
            <h2 className="text-lg font-bold text-primary-dark">{p.nombre}</h2>
            <p className="text-sm text-slate-500 mt-1">{p.para}</p>

            <p className="mt-4">
              {p.precio ? (
                <>
                  <span className="text-2xl font-extrabold text-primary-dark">
                    {p.precio}
                  </span>
                  <span className="text-sm text-slate-400"> / mes</span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary-dark">
                  A convenir
                </span>
              )}
            </p>

            <ul className="mt-4 space-y-2">
              {p.incluye.map((f) => (
                <li
                  key={f}
                  className="text-sm text-slate-700 flex items-start gap-2"
                >
                  <Check size={15} className="text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/evaluar/app"
              className={`${p.destacado ? "btn-primary" : "btn-secondary"} press w-full mt-6`}
            >
              Empezar gratis
            </Link>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-8 max-w-2xl mx-auto">
        <h2 className="font-semibold text-primary-dark">Cómo se paga</h2>
        <p className="text-sm text-slate-600 mt-2">
          Por transferencia bancaria o link de pago. Nos avisás, activamos tu
          plan y seguís donde estabas: no se pierde ningún proceso ni ninguna
          evaluación en curso.
        </p>
        <a
          href="https://wa.me/595981000000?text=Quiero%20activar%20Worka%20Evaluar"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary press mt-4"
        >
          Hablar por WhatsApp
        </a>
      </div>
    </div>
  );
}
