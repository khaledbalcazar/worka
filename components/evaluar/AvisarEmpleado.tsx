"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail } from "lucide-react";
import { avisarAlEmpleado } from "@/app/evaluar/desempeno-actions";

// Avisarle a la persona que su evaluación está lista.
//
// Lo puede tocar el evaluador o quien administra el ciclo, que es como pasa de
// verdad: a veces avisa el jefe y a veces RRHH. Por eso el botón aparece en
// las dos pantallas y no en una sola.
//
// Se puede volver a enviar: la fecha del último aviso queda a la vista para
// que nadie mande cuatro veces sin darse cuenta, pero un recordatorio a los
// diez días es legítimo y no hay motivo para bloquearlo.
export default function AvisarEmpleado({
  id,
  email,
  notificadoAt,
  acuseAt,
}: {
  id: string;
  email: string;
  notificadoAt: string | null;
  acuseAt: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  // Ya la leyó y firmó: avisar de nuevo no tiene sentido.
  if (acuseAt) {
    return (
      <p className="text-[11px] text-emerald-700 flex items-center gap-1">
        <Check size={12} /> Ya la leyó y dejó constancia el{" "}
        {new Date(acuseAt).toLocaleDateString("es-PY")}
      </p>
    );
  }

  if (!email) {
    return (
      <p className="text-[11px] text-amber-700">
        Sin email cargado: no se le puede avisar. Agregalo al editar la persona.
      </p>
    );
  }

  function avisar() {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const r = await avisarAlEmpleado(id);
      if (r.ok) {
        setOk(true);
        router.refresh();
      } else setError(r.error ?? "No pudimos avisarle.");
    });
  }

  return (
    <div className="mt-1">
      <button
        onClick={avisar}
        disabled={pending}
        className="chip press bg-slate-100 text-slate-600 disabled:opacity-50"
        title={`Le llega un correo a ${email} con el enlace para leerla y firmarla`}
      >
        <Mail size={12} />
        {pending
          ? "Enviando…"
          : notificadoAt
            ? "Volver a avisarle"
            : "Avisarle por correo"}
      </button>

      {notificadoAt && !ok && (
        <span className="text-[11px] text-slate-400 ml-2">
          Avisado el {new Date(notificadoAt).toLocaleDateString("es-PY")}
        </span>
      )}
      {ok && (
        <span className="text-[11px] text-emerald-700 ml-2">
          Correo enviado a {email}
        </span>
      )}
      {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
    </div>
  );
}
