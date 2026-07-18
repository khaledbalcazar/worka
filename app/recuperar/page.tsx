"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { requestPasswordReset } from "@/app/actions";

// Olvidé mi contraseña: sirve para cuentas de personas y de empresas.
export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result.ok) setSent(true);
      else setError(result.error ?? "No pudimos enviar el correo.");
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-6 space-y-4 text-center">
        <Logo />
        {sent ? (
          <div className="py-4 animate-pop">
            <p className="text-4xl mb-2">📨</p>
            <p className="font-semibold text-primary-dark">¡Correo enviado!</p>
            <p className="text-sm text-gray-500 mt-1">
              Si {email} tiene una cuenta en Worka, te llega un link para crear
              una contraseña nueva. Revisá también el correo no deseado.
            </p>
            <Link href="/ingresar" className="btn-primary w-full mt-4">
              Volver a ingresar
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-bold text-primary-dark text-lg">
                Recuperar mi cuenta
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sirve para cuentas de personas y de empresas. Te enviamos un
                link para crear una contraseña nueva.
              </p>
            </div>
            <input
              className="input"
              type="email"
              placeholder="El email de tu cuenta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && submit()}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              className="btn-primary w-full"
              disabled={!email || pending}
              onClick={submit}
            >
              {pending ? "Enviando…" : "Enviarme el link"}
            </button>
            <Link href="/ingresar" className="text-sm text-gray-500 underline">
              Volver
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
