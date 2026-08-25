"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { startTrial } from "@/app/evaluar/actions";
import { TRIAL_DAYS } from "@/lib/evaluar-config";

// Alta de la prueba gratuita. La cuenta se crea al tocar el botón, no al
// entrar: así la prueba empieza a correr cuando la persona decide usarla.
export default function StartTrial() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function activar() {
    setError(null);
    startTransition(async () => {
      const result = await startTrial();
      if (result.ok) router.refresh();
      else setError(result.error ?? "No pudimos activar tu prueba.");
    });
  }

  return (
    <div className="card p-7 text-center animate-rise">
      <span className="w-14 h-14 rounded-2xl bg-blue-50 text-primary grid place-items-center mx-auto">
        <Rocket size={24} />
      </span>
      <h1 className="text-xl font-bold text-primary-dark mt-3">
        Activá tus {TRIAL_DAYS} días gratis
      </h1>
      <p className="text-sm text-slate-600 mt-2">
        Sin tarjeta y sin compromiso. Armá un proceso real, enlazalo con una
        vacante de Worka y mirá cómo funciona con candidatos de verdad.
      </p>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-4">
          {error}{" "}
          {error.includes("empresas") && (
            <Link href="/empresa/registro" className="underline font-medium">
              Registrar mi empresa
            </Link>
          )}
        </p>
      )}

      <button
        onClick={activar}
        disabled={pending}
        className="btn-primary press w-full mt-5 text-base py-3"
      >
        {pending ? "Activando…" : `Empezar mis ${TRIAL_DAYS} días`}
      </button>
      <p className="text-xs text-slate-400 mt-3">
        Al terminar la prueba coordinamos el pago. No hay cobro automático.
      </p>
    </div>
  );
}
