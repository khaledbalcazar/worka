"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Settings2, XCircle } from "lucide-react";
import { checkCardPayment, openBillingPortal, startCardCheckout } from "@/app/billing-actions";
import { formatoMonto, type Monto } from "@/lib/billing/catalogo";

// Botón "Pagar con tarjeta": pide al servidor un pago de dLocal Go para la
// compra elegida y lleva a la persona directo al checkout, con el monto ya
// cargado. El plan lo activa la confirmación del pago, no este botón.

export function PagarConTarjeta({
  product,
  plan,
  months,
  jobId,
  monto,
  className = "btn-primary w-full",
  etiqueta,
}: {
  product: "enterprise" | "pro" | "evaluar" | "boost";
  plan: string;
  months?: number;
  jobId?: string;
  monto: Monto;
  className?: string;
  etiqueta?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const cubre = months === 12 ? "12 meses" : months === 3 ? "3 meses" : months === 1 ? "1 mes" : null;

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
        {busy ? "Abriendo el pago…" : (etiqueta ?? `Pagar con tarjeta · ${formatoMonto(monto)}`)}
      </button>
      <p className="text-xs text-muted mt-1.5">
        {cubre
          ? `Pago único de ${formatoMonto(monto)} por ${cubre}. No se renueva solo: si pagás de nuevo antes de que venza, los días se suman.`
          : `Pago único de ${formatoMonto(monto)}.`}{" "}
        Tarjeta de crédito o débito, en el checkout seguro de dLocal Go.
        {monto.moneda === "USD" && " Tu banco hace la conversión."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Lo que ve la persona al volver del checkout (?pago=ok&ref=…). Le pregunta
 * al servidor cómo quedó el pago, que a su vez le pregunta a dLocal Go y
 * activa el plan si entró: así no depende de que el aviso llegue antes.
 */
export function ConfirmarPagoTarjeta({ pago, refPago }: { pago?: string; refPago?: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"revisando" | "pagado" | "pendiente" | "rechazado" | "error">(
    pago === "ok" && refPago ? "revisando" : "error"
  );

  useEffect(() => {
    if (pago !== "ok" || !refPago) return;
    let vivo = true;
    let intentos = 0;
    // Unos pocos reintentos espaciados: el banco a veces tarda unos segundos
    // en aprobar, y el aviso de dLocal Go puede ganarle a esta pantalla.
    async function revisar() {
      intentos++;
      try {
        const r = await checkCardPayment(refPago!);
        if (!vivo) return;
        if (r.ok && r.estado === "pagado") {
          setEstado("pagado");
          router.refresh();
          return;
        }
        if (r.ok && r.estado === "rechazado") return setEstado("rechazado");
        if (!r.ok) return setEstado("error");
        setEstado("pendiente");
      } catch {
        if (vivo) setEstado("pendiente");
      }
      if (vivo && intentos < 6) setTimeout(revisar, intentos * 3000);
    }
    revisar();
    return () => {
      vivo = false;
    };
  }, [pago, refPago, router]);

  if (pago === "cancelado")
    return (
      <p className="text-sm bg-amber-50 text-amber-800 rounded-xl px-3.5 py-2.5 mb-4" role="status">
        No se hizo ningún cobro. Cuando quieras, elegí el plan y probá de nuevo.
      </p>
    );
  if (pago !== "ok") return null;

  const textos = {
    revisando: { icono: Clock, clase: "bg-sky-50 text-sky-800", texto: "Estamos confirmando tu pago…" },
    pagado: { icono: CheckCircle2, clase: "bg-emerald-50 text-emerald-800", texto: "Recibimos tu pago y el plan ya está activo." },
    pendiente: {
      icono: Clock,
      clase: "bg-sky-50 text-sky-800",
      texto: "Tu pago está en proceso. Apenas se apruebe, el plan se activa solo y te avisamos en la campanita.",
    },
    rechazado: {
      icono: XCircle,
      clase: "bg-red-50 text-red-800",
      texto: "El pago no se aprobó y no se hizo ningún cobro. Podés probar con otra tarjeta.",
    },
    error: {
      icono: Clock,
      clase: "bg-sky-50 text-sky-800",
      texto: "Si pagaste, el plan se activa solo en unos minutos y te avisamos en la campanita.",
    },
  }[estado];
  const Icono = textos.icono;

  return (
    <p className={`text-sm rounded-xl px-3.5 py-2.5 mb-4 flex items-start gap-2 ${textos.clase}`} role="status">
      <Icono size={16} className="shrink-0 mt-0.5" aria-hidden />
      <span>{textos.texto}</span>
    </p>
  );
}

// Heredado de Lemon Squeezy: solo aparece para una suscripción contratada
// antes de pasar a dLocal Go que todavía se renueva.
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
