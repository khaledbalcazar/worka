"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { updatePassword } from "@/app/actions";

// Nueva contraseña: se llega desde el link de recuperación por email
// (el callback de auth ya creó la sesión temporal).
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const result = await updatePassword(password);
      if (result.ok) {
        setDone(true);
        setTimeout(() => router.push("/ingresar"), 2000);
      } else setError(result.error ?? "No pudimos cambiar la contraseña.");
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-6 space-y-4 text-center">
        <Logo />
        {done ? (
          <div className="py-4 animate-pop">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-semibold text-primary-dark">
              ¡Contraseña actualizada!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Ya podés ingresar con tu contraseña nueva.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-bold text-primary-dark text-lg">
                Creá tu nueva contraseña
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Mínimo 8 caracteres.
              </p>
            </div>
            <input
              className="input"
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Repetila para confirmar"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              className="btn-primary w-full"
              disabled={!password || !confirm || pending}
              onClick={submit}
            >
              {pending ? "Guardando…" : "Guardar contraseña"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
