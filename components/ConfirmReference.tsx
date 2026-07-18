"use client";

import { useState, useTransition } from "react";
import { confirmReferenceByToken } from "@/app/actions";

export default function ConfirmReference({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done)
    return (
      <div className="py-3 animate-pop">
        <p className="text-3xl mb-1">🎉</p>
        <p className="font-semibold text-primary-dark">¡Confirmado, gracias!</p>
      </div>
    );

  return (
    <div className="space-y-2">
      <button
        className="btn-primary w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await confirmReferenceByToken(token);
            if (result.ok) setDone(true);
            else setError(result.error ?? "No pudimos confirmar.");
          })
        }
      >
        {pending ? "Confirmando…" : "Sí, confirmo que trabajamos juntos"}
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
