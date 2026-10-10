"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

// Pantalla de error del área de candidatos. Antes no había ninguna: un fallo
// en el servidor dejaba la página genérica de Next sin forma de reintentar.
// En producción Next no manda el mensaje original al navegador (puede tener
// datos internos); solo el digest, que se muestra para poder cruzarlo con
// los logs de Vercel.
export default function CandidateError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="card max-w-lg mx-auto text-center px-6 py-10">
      <h1 className="text-xl font-semibold">No pudimos cargar esta sección</h1>
      <p className="text-sm text-gray-600 mt-2">
        Puede ser un problema momentáneo. Probá de nuevo; si sigue pasando, escribinos y contanos qué estabas haciendo.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
        <button type="button" className="btn-primary" onClick={() => unstable_retry()}>
          <RefreshCw size={16} /> Reintentar
        </button>
        <Link href="/empleos" className="btn-secondary">
          Ir a buscar empleos
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-gray-400 mt-6">Código del error: {error.digest}</p>
      )}
    </div>
  );
}
