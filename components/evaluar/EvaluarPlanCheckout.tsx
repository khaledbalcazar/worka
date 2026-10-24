"use client";

import { useState } from "react";
import type { OfertaTarjeta } from "@/lib/billing/ofertas";
import { formatoUsd } from "@/lib/billing/catalogo";
import { GestionarSuscripcion, PagarConTarjeta } from "@/components/plans/CardCheckout";

// Elegir plan y duración de Worka Evaluar y pagar con tarjeta. Corporativo
// sigue por ventas: no tiene precio de lista.

const PLANES = [
  { id: "esencial", nombre: "Esencial", detalle: "Hasta 3 procesos activos" },
  { id: "profesional", nombre: "Profesional", detalle: "Procesos sin límite, informes, equipo, IA y Excel" },
];
const DURACIONES = [
  { months: 1, label: "Mensual" },
  { months: 3, label: "Trimestral" },
  { months: 12, label: "Anual (pagás 10 meses)" },
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
  const disponible = oferta.disponible[clave];

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold mb-2">Plan</legend>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PLANES.map((p) => (
            <label
              key={p.id}
              className={`rounded-xl border p-3.5 cursor-pointer ${plan === p.id ? "border-[var(--nk-300,#818cf8)]" : "border-[#292b31]"}`}
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
              <span className="block text-sm mt-1.5">{formatoUsd(oferta.usd[`${p.id}:1`] ?? 0)} / mes</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Cada cuánto se cobra</legend>
        <div className="grid grid-cols-3 gap-2">
          {DURACIONES.map((d) => (
            <label
              key={d.months}
              className={`rounded-xl border p-2.5 text-center text-sm cursor-pointer ${months === d.months ? "border-[var(--nk-300,#818cf8)]" : "border-[#292b31]"}`}
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
              <span className="block text-xs opacity-60">{formatoUsd(oferta.usd[`${plan}:${d.months}`] ?? 0)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {disponible ? (
        <PagarConTarjeta
          product="evaluar"
          plan={plan}
          months={months}
          centavos={oferta.usd[clave]}
          className="nk-cta w-full"
        />
      ) : (
        <p className="text-sm opacity-70">
          Esta combinación todavía no se puede pagar con tarjeta. Escribinos y te pasamos los datos para
          pagar por transferencia.
        </p>
      )}
    </div>
  );
}
