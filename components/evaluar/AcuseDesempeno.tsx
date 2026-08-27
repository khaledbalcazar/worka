"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { acusarDesempeno } from "@/app/evaluar/desempeno-actions";

// Acuse de recibo del empleado.
//
// Es constancia de que la leyó, NO de que esté de acuerdo, y la pantalla lo
// dice con todas las letras. Un acuse que se presenta como conformidad es una
// firma arrancada: la persona no tiene forma de negarse sin que parezca un
// conflicto, y después esa firma se usa como si hubiera aceptado.
//
// El comentario es la contrapartida: si no está de acuerdo, queda escrito de
// su puño y letra en el mismo lugar donde está la evaluación.
export default function AcuseDesempeno({
  id,
  acuseAt,
  comentario,
}: {
  id: string;
  acuseAt: string | null;
  comentario: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (acuseAt) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
          <Check size={15} /> Dejaste constancia de que la leíste
        </p>
        <p className="text-xs text-emerald-800 mt-0.5">
          {new Date(acuseAt).toLocaleDateString("es-PY", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {comentario && (
          <p className="text-sm text-slate-700 mt-2 border-l-2 border-emerald-300 pl-3">
            {comentario}
          </p>
        )}
      </div>
    );
  }

  function confirmar() {
    setError(null);
    startTransition(async () => {
      const r = await acusarDesempeno(id, texto);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos registrar tu acuse.");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-primary-dark">
        Dejá constancia de que la leíste
      </p>
      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
        Esto registra que la recibiste y la leíste.{" "}
        <strong className="font-semibold">No significa que estés de acuerdo.</strong>{" "}
        Si algo no te parece, escribilo abajo: queda guardado junto a la
        evaluación y lo ve quien la lea.
      </p>

      <textarea
        className="input text-sm min-h-20 mt-2.5"
        placeholder="Si querés dejar tu opinión sobre esta evaluación, escribila acá (opcional)"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <button
        onClick={confirmar}
        disabled={pending}
        className="btn-primary press text-sm mt-2.5 disabled:opacity-50"
      >
        {pending ? "Registrando…" : "Confirmar que la leí"}
      </button>
    </div>
  );
}
