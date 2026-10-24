"use client";

import { useState, useTransition } from "react";
import { CreditCard, RefreshCw, Settings2 } from "lucide-react";
import { openBillingPortal, startCardCheckout } from "@/app/billing-actions";
import { formatoUsd } from "@/lib/billing/catalogo";

// Botón "Pagar con tarjeta": pide al servidor un checkout de Lemon Squeezy
// para la compra elegida y lleva a la persona directo ahí, con el plan y la
// duración ya cargados. El plan lo activa el webhook cuando entra el pago.

export function PagarConTarjeta({
  product,
  plan,
  months,
  jobId,
  centavos,
  renueva = true,
  className = "btn-primary w-full",
  etiqueta,
}: {
  product: "enterprise" | "pro" | "evaluar" | "boost";
  plan: string;
  months?: number;
  jobId?: string;
  /** Precio de cada cobro, en centavos de dólar. */
  centavos: number;
  /** false en los pagos únicos (destacados). */
  renueva?: boolean;
  className?: string;
  etiqueta?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const cada = months === 12 ? "por año" : months === 3 ? "cada 3 meses" : "por mes";

  function pagar() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await startCardCheckout({ product, plan, months, jobId });
        if (r.ok && r.url) {
          window.location.assign(r.url);
          return;
        }
        setError(r.error ?? "No pudimos abrir el pago.");
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  return (
    <div>
      <button type="button" className={className} disabled={busy} onClick={pagar}>
        <CreditCard size={16} />
        {busy ? "Abriendo el pago…" : (etiqueta ?? `Pagar con tarjeta · ${formatoUsd(centavos)}`)}
      </button>
      <p className="text-xs text-muted mt-1.5 flex items-start gap-1.5">
        {renueva && <RefreshCw size={12} className="shrink-0 mt-0.5" aria-hidden />}
        <span>
          {renueva
            ? `Se cobra en dólares, ${formatoUsd(centavos)} ${cada}, y se renueva solo. Lo cancelás cuando quieras.`
            : `Pago único de ${formatoUsd(centavos)}, en dólares.`}{" "}
          Tarjeta internacional, PayPal, Apple Pay o Google Pay. Tu banco hace la conversión.
        </span>
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

export function GestionarSuscripcion({
  product,
  hasta,
  renueva,
  tarjeta,
}: {
  product: "enterprise" | "pro" | "evaluar";
  hasta: string | null;
  renueva: boolean;
  tarjeta: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const fecha = hasta
    ? new Date(hasta).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
    : null;

  function abrir() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await openBillingPortal(product);
        if (r.ok && r.url) {
          window.location.assign(r.url);
          return;
        }
        setError(r.error ?? "No pudimos abrir la gestión.");
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="font-semibold text-sm">Suscripción con tarjeta</p>
      <p className="text-sm text-muted mt-1">
        {fecha && (renueva ? `Se renueva el ${fecha}.` : `Cancelada: el plan sigue hasta el ${fecha}.`)}
        {tarjeta && ` ${tarjeta}.`}
      </p>
      <button type="button" className="btn-secondary w-full mt-3" disabled={busy} onClick={abrir}>
        <Settings2 size={16} /> {busy ? "Abriendo…" : "Gestionar suscripción"}
      </button>
      <p className="text-xs text-muted mt-1.5">Cambiar la tarjeta, ver las facturas o cancelar.</p>
      {error && (
        <p role="alert" className="text-sm text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
