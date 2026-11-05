"use client";

import { useState } from "react";
import type { OfertaTarjeta } from "@/lib/billing/ofertas";
import { formatoMonto } from "@/lib/billing/catalogo";
import { GestionarSuscripcion, PagarConTarjeta } from "@/components/plans/CardCheckout";

// Elegir plan y duración de Worka Evaluar y pagar con tarjeta. Corporativo
// sigue por ventas: no tiene precio de lista.

const PLANES = [
  { id: "esencial", nombre: "Esencial", detalle: "Hasta 3 procesos activos" },
  { id: "profesional", nombre: "Profesional", detalle: "Procesos sin límite, informes, equipo, IA y Excel" },
];
const DURACIONES = [
  { months: 1, label: "1 mes" },
  { months: 3, label: "3 meses" },
  { months: 12, label: "12 meses (pagás 10)" },
];

export default function EvaluarPlanCheckout({
  oferta,
  planInicial,
}: {
  oferta: OfertaTarjeta;
  planInicial?: string;
}) {
  const [plan, setPlan] = useState(
    PLANES.some((p) => p.id === planInicial) ? (planInicial as string) : "profesional"
  );
  const [months, setMonths] = useState(1);

  if (oferta.suscripcion) {
    return (
      <GestionarSuscripcion
        product="evaluar"
        hasta={oferta.suscripcion.hasta}
        renueva={oferta.suscripcion.renueva}
        tarjeta={oferta.suscripcion.tarjeta}
      />
    );
  }

  const clave = `${plan}:${months}`;
  const monto = oferta.monto[clave];

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold mb-2">Plan</legend>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PLANES.map((p) => (
            <label
              key={p.id}
              className={`rounded-xl border p-3.5 cursor-pointer ${plan === p.id ? "border-[var(--nk-300,#818cf8)]" : "border-[#e0dfdc]"}`}
            >
              <input
                type="radio"
                name="evaluar-plan"
                value={p.id}
                checked={plan === p.id}
                onChange={() => setPlan(p.id)}
                className="sr-only"
              />
              <span className="block font-semibold">{p.nombre}</span>
              <span className="block text-xs opacity-60 mt-0.5">{p.detalle}</span>
              {oferta.monto[`${p.id}:1`] && (
                <span className="block text-sm mt-1.5">{formatoMonto(oferta.monto[`${p.id}:1`])} / mes</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Cuánto tiempo pagás</legend>
        <div className="grid grid-cols-3 gap-2">
          {DURACIONES.map((d) => (
            <label
              key={d.months}
              className={`rounded-xl border p-2.5 text-center text-sm cursor-pointer ${months === d.months ? "border-[var(--nk-300,#818cf8)]" : "border-[#e0dfdc]"}`}
            >
              <input
                type="radio"
                name="evaluar-meses"
                value={d.months}
                checked={months === d.months}
                onChange={() => setMonths(d.months)}
                className="sr-only"
              />
              <span className="block font-medium">{d.label}</span>
              {oferta.monto[`${plan}:${d.months}`] && (
                <span className="block text-xs opacity-60">{formatoMonto(oferta.monto[`${plan}:${d.months}`])}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {monto ? (
        <PagarConTarjeta
          product="evaluar"
          plan={plan}
          months={months}
          monto={monto}
          className="nk-cta w-full"
        />
      ) : (
        <p className="text-sm opacity-70">
          Esta combinación todavía no tiene precio cargado. Escribinos y te avisamos apenas se pueda
          contratar.
        </p>
      )}
    </div>
  );
}
