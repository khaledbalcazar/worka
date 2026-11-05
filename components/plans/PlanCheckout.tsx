"use client";

import { useState } from "react";
import { Clock, Info } from "lucide-react";
import { BILLING_OPTIONS, formatMoney, type Product } from "@/lib/plans";
import { formatoMonto } from "@/lib/billing/catalogo";
import type { OfertaTarjeta } from "@/lib/billing/ofertas";
import { GestionarSuscripcion, PagarConTarjeta } from "./CardCheckout";

// monthly: precio mensual en la moneda del país; monthlyGs: el mismo en guaraníes.
export type CheckoutPlan = { id: string; name: string; monthly: number; monthlyGs: number };
export type PendingPayment = { plan: string; months: number; amount: number; currency: string; created_at: string } | null;

// Contratar o renovar un plan: la persona elige plan y duración y paga con
// tarjeta en dLocal Go; el plan se activa solo cuando entra el pago.
//
// El cobro manual (link de pago + "ya pagué") ya no se ofrece. `pending` es
// un aviso de ese cobro hecho antes del cambio, que el admin todavía confirma.
export default function PlanCheckout({
  product,
  plans,
  initialPlan,
  pending,
  canPay = true,
  cannotPayReason,
  currency = "PYG",
  tarjeta = null,
}: {
  product: Product;
  plans: CheckoutPlan[];
  currency?: string;
  initialPlan?: string;
  pending: PendingPayment;
  canPay?: boolean;
  cannotPayReason?: string;
  /** Pago con tarjeta (dLocal Go). Null si no está configurado. */
  tarjeta?: OfertaTarjeta | null;
}) {
  const [plan, setPlan] = useState(initialPlan && plans.some((p) => p.id === initialPlan) ? initialPlan : plans[0]?.id);
  const [months, setMonths] = useState<number>(1);

  const selected = plans.find((p) => p.id === plan) ?? plans[0];
  const option = BILLING_OPTIONS.find((o) => o.months === months) ?? BILLING_OPTIONS[0];
  const total = (selected?.monthly ?? 0) * option.paidMonths;
  const money = (amount: number) => formatMoney({ amount, currency });
  const monto = selected ? tarjeta?.monto[`${selected.id}:${months}`] : undefined;

  return (
    <div className="plan-checkout" id="contratar">
      {/* Un aviso viejo de pago manual no traba el pago con tarjeta: si quedó
          colgado, la persona igual puede pagar. */}
      {pending && (
        <div className="flex items-start gap-3 mb-4">
          <span className="plan-checkout-icon"><Clock size={18} /></span>
          <div>
            <p className="font-semibold">Estamos confirmando un pago anterior</p>
            <p className="text-sm text-muted mt-1">
              {plans.find((p) => p.id === pending.plan)?.name ?? "Plan"} · {pending.months} {pending.months === 1 ? "mes" : "meses"} · {formatMoney({ amount: pending.amount, currency: pending.currency })}.
              Te avisamos por correo y en la campanita apenas lo activemos.
            </p>
          </div>
        </div>
      )}
      {plans.length > 1 && (
        <fieldset>
          <legend className="label">Plan</legend>
          <div className="plan-options">
            {plans.map((p) => (
              <label key={p.id} className={`plan-option${plan === p.id ? " is-active" : ""}`}>
                <input type="radio" name={`plan-${product}`} value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-muted">{money(p.monthly)} / mes</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-4">
        <legend className="label">Duración</legend>
        <div className="plan-options is-3">
          {BILLING_OPTIONS.map((o) => (
            <label key={o.months} className={`plan-option${months === o.months ? " is-active" : ""}`}>
              <input type="radio" name={`months-${product}`} value={o.months} checked={months === o.months} onChange={() => setMonths(o.months)} />
              <span className="font-semibold">{o.label}</span>
              <span className="text-xs text-muted">{o.paidMonths < o.months ? `Pagás ${o.paidMonths}` : money((selected?.monthly ?? 0) * o.paidMonths)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="plan-total">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
      {monto && currency !== monto.moneda && (
        <p className="text-xs text-muted -mt-2 mb-4">
          Se cobra el equivalente: {formatoMonto(monto)}. Tu banco o tarjeta hace la conversión.
        </p>
      )}

      {!canPay ? (
        <p className="plan-note"><Info size={15} /> {cannotPayReason}</p>
      ) : tarjeta?.suscripcion ? (
        <GestionarSuscripcion
          product={product}
          hasta={tarjeta.suscripcion.hasta}
          renueva={tarjeta.suscripcion.renueva}
          tarjeta={tarjeta.suscripcion.tarjeta}
        />
      ) : selected && monto ? (
        <PagarConTarjeta product={product} plan={selected.id} months={months} monto={monto} />
      ) : (
        <p className="plan-note"><Info size={15} /> El pago en línea todavía no está disponible. Escribinos por WhatsApp o email y te avisamos apenas se habilite.</p>
      )}
    </div>
  );
}
