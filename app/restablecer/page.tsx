"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { updatePassword } from "@/app/actions";

const field =
  "w-full h-[52px] rounded-[4px] border border-[#8c8c8c] bg-white px-3.5 text-base text-ink outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0a66c2]";

// Nueva contraseña: se llega desde el link de recuperación por email
// (el callback de auth ya creó la sesión temporal).
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
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
    <AuthShell>
      {done ? (
        <div className="text-center py-6 animate-pop" role="status">
          <span className="confirmation-icon mx-auto"><Check size={26} /></span>
          <h1 className="text-2xl font-semibold mt-4">Contraseña actualizada</h1>
          <p className="text-[15px] text-muted mt-2">Ya podés iniciar sesión con tu contraseña nueva.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.01em]">Creá tu nueva contraseña</h1>
          <p className="text-[15px] text-muted mt-2">Usá al menos 8 caracteres.</p>
          <label className="block text-[15px] mt-6 mb-1.5" htmlFor="new-password">Nueva contraseña</label>
          <div className="relative">
            <input id="new-password" className={`${field} pr-24`} type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-10 px-3 rounded-full text-[15px] font-semibold text-primary hover:bg-primary/[0.08]" aria-pressed={show} onClick={() => setShow((v) => !v)}>
              {show ? "ocultar" : "mostrar"}
            </button>
          </div>
          <label className="block text-[15px] mt-4 mb-1.5" htmlFor="confirm-password">Repetila para confirmar</label>
          <input id="confirm-password" className={field} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
          <button className="btn-primary w-full !min-h-[52px] !text-base mt-6" disabled={!password || !confirm || pending}>
            {pending ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
