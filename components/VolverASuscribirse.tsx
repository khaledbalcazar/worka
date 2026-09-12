"use client";

import { useState, useTransition } from "react";
import { reactivarCorreos } from "@/app/actions";

// Botón de arrepentimiento de la página de baja. Existe porque mucha gente se
// da de baja por error desde el botón del cliente de correo, y sin esto la
// única forma de volver es iniciar sesión y buscar el ajuste en el perfil.
export default function VolverASuscribirse({ token }: { token: string }) {
  const [hecho, setHecho] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (hecho)
    return (
      <p className="text-sm font-semibold text-emerald-600 mt-6">
        ✅ Listo, volvés a recibir las vacantes nuevas.
      </p>
    );

  return (
    <div className="mt-6">
      <button
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await reactivarCorreos(token);
            if (r.ok) setHecho(true);
            else setError(r.error ?? "No pudimos reactivarlos.");
          })
        }
      >
        {pending ? "Reactivando…" : "Me equivoqué, quiero seguir recibiéndolos"}
      </button>
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  );
}
