"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { requestPasswordReset } from "@/app/actions";

const field =
  "w-full h-[52px] rounded-[4px] border border-[#8c8c8c] bg-white px-3.5 text-base text-ink outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0a66c2]";

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
    <AuthShell
      below={
        <Link href="/ingresar" className="text-primary font-semibold hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-6 animate-pop" role="status">
          <span className="confirmation-icon mx-auto"><Mail size={26} /></span>
          <h1 className="text-2xl font-semibold mt-4">Revisá tu email</h1>
          <p className="text-[15px] text-muted mt-2">
            Si <strong className="text-ink">{email}</strong> tiene una cuenta en Worka, te llega un enlace para crear
            una contraseña nueva. Revisá también el correo no deseado.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email) submit(); }}>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.01em]">¿Olvidaste tu contraseña?</h1>
          <p className="text-[15px] text-muted mt-2">
            Escribí el email de tu cuenta, de persona o de empresa, y te enviamos un enlace para crear una nueva.
          </p>
          <label className="block text-[15px] mt-6 mb-1.5" htmlFor="recover-email">Email</label>
          <input
            id="recover-email"
            className={field}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
          <button className="btn-primary w-full !min-h-[52px] !text-base mt-6" disabled={!email || pending}>
            {pending ? "Enviando…" : "Enviarme el enlace"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
