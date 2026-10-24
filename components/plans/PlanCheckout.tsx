"use client";

import { useState, useTransition } from "react";
import { Check, Clock, ExternalLink, Info } from "lucide-react";
import { requestPlanPayment } from "@/app/plans-actions";
import { BILLING_OPTIONS, formatGs, formatMoney, type Product } from "@/lib/plans";
import type { OfertaTarjeta } from "@/lib/billing/ofertas";
import { GestionarSuscripcion, PagarConTarjeta } from "./CardCheckout";

// monthly: precio mensual en la moneda del país; monthlyGs: el mismo en guaraníes.
export type CheckoutPlan = { id: string; name: string; monthly: number; monthlyGs: number };
export type PendingPayment = { plan: string; months: number; amount: number; currency: string; created_at: string } | null;

// Pago manual: la persona elige plan y duración, paga con el link de pago
// y después avisa "ya pagué". El admin confirma y el plan se activa.
export default function PlanCheckout({
  product,
  plans,
  initialPlan,
  paymentLink,
  pending,
  canPay = true,
  cannotPayReason,
  currency = "PYG",
  billing,
  tarjeta = null,
}: {
  product: Product;
  plans: CheckoutPlan[];
  currency?: string;
  // Datos para el recibo, precargados del perfil.
  billing: { name: string; doc: string; docLabel: string };
  initialPlan?: string;
  paymentLink: string | null;
  pending: PendingPayment;
  canPay?: boolean;
  cannotPayReason?: string;
  /** Pago con tarjeta (Lemon Squeezy). Null si no está configurado. */
  tarjeta?: OfertaTarjeta | null;
}) {
  const [plan, setPlan] = useState(initialPlan && plans.some((p) => p.id === initialPlan) ? initialPlan : plans[0]?.id);
  const [months, setMonths] = useState<number>(1);
  const [paid, setPaid] = useState(false);
  const [reference, setReference] = useState("");
  const [billingName, setBillingName] = useState(billing.name);
  const [billingDoc, setBillingDoc] = useState(billing.doc);
  const [sent, setSent] = useState<PendingPayment>(pending);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const selected = plans.find((p) => p.id === plan) ?? plans[0];
  const option = BILLING_OPTIONS.find((o) => o.months === months) ?? BILLING_OPTIONS[0];
  const total = (selected?.monthly ?? 0) * option.paidMonths;
  const totalGs = (selected?.monthlyGs ?? 0) * option.paidMonths;
  const money = (amount: number) => formatMoney({ amount, currency });

  if (sent) {
    return (
      <div className="plan-checkout">
        <div className="flex items-start gap-3">
          <span className="plan-checkout-icon"><Clock size={18} /></span>
          <div>
            <p className="font-semibold">Estamos confirmando tu pago</p>
            <p className="text-sm text-muted mt-1">
              {plans.find((p) => p.id === sent.plan)?.name ?? "Plan"} · {sent.months} {sent.months === 1 ? "mes" : "meses"} · {formatMoney({ amount: sent.amount, currency: sent.currency })}.
              Te avisamos por correo y en la campanita apenas lo activemos (normalmente en el día).
            </p>
          </div>
        </div>
      </div>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await requestPlanPayment({ product, plan: selected.id, months, reference, billingName, billingDoc });
        if (!result.ok) {
          setError(result.error ?? "No pudimos registrar el pago.");
          return;
        }
        setSent({ plan: selected.id, months, amount: total, currency, created_at: new Date().toISOString() });
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  return (
    <div className="plan-checkout" id="contratar">
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
      {currency !== "PYG" && (
        <p className="text-xs text-muted -mt-2 mb-4">
          El link de pago cobra el equivalente en guaraníes: {formatGs(totalGs)}. Tu banco o tarjeta hace la conversión.
        </p>
      )}

      {/* Tarjeta primero: se activa sola en segundos. El cobro manual queda
          abajo para quien no tiene tarjeta internacional. */}
      {canPay && tarjeta?.suscripcion ? (
        <div className="mb-4">
          <GestionarSuscripcion
            product={product}
            hasta={tarjeta.suscripcion.hasta}
            renueva={tarjeta.suscripcion.renueva}
            tarjeta={tarjeta.suscripcion.tarjeta}
          />
        </div>
      ) : canPay && selected && tarjeta?.disponible[`${selected.id}:${months}`] ? (
        <div className="mb-4">
          <PagarConTarjeta
            product={product}
            plan={selected.id}
            months={months}
            centavos={tarjeta.usd[`${selected.id}:${months}`]}
          />
          <p className="text-xs text-muted text-center mt-4">
            ¿Sin tarjeta internacional? Pagá con el link de pago y avisanos:
          </p>
        </div>
      ) : null}

      {!canPay ? (
        <p className="plan-note"><Info size={15} /> {cannotPayReason}</p>
      ) : !paymentLink ? (
        <p className="plan-note"><Info size={15} /> El pago en línea todavía no está disponible. Escribinos por WhatsApp o email y te pasamos los datos.</p>
      ) : (
        <ol className="plan-steps">
          <li>
            <span className="plan-step-num">1</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Pagá {currency === "PYG" ? money(total) : formatGs(totalGs)}</p>
              <p className="text-xs text-muted">Se abre el link de pago en otra pestaña. Guardá el comprobante.</p>
              <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-2" onClick={() => setPaid(true)}>
                <ExternalLink size={16} /> Ir a pagar
              </a>
            </div>
          </li>
          <li>
            <span className="plan-step-num">2</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Avisanos que pagaste</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                <label className="block">
                  <span className="text-xs text-muted">Nombre o razón social para el recibo</span>
                  <input className="input mt-1" value={billingName} maxLength={120} onChange={(e) => setBillingName(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">{billing.docLabel} o cédula (opcional)</span>
                  <input className="input mt-1" value={billingDoc} maxLength={30} onChange={(e) => setBillingDoc(e.target.value)} />
                </label>
              </div>
              <label className="block mt-2">
                <span className="text-xs text-muted">Número de operación o comprobante (opcional)</span>
                <input className="input mt-1" value={reference} maxLength={120} onChange={(e) => setReference(e.target.value)} placeholder="Ej: 004512339" />
              </label>
              <button type="button" className={`${paid ? "btn-primary" : "btn-secondary"} w-full mt-2`} disabled={busy} onClick={submit}>
                <Check size={16} /> {busy ? "Enviando…" : "Ya pagué"}
              </button>
            </div>
          </li>
        </ol>
      )}
      {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
    </div>
  );
}
