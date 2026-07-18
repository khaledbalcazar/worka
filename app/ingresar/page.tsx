"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { getBrowserClient } from "@/lib/supabase/client";
import { signInWithEmail, signUpWithEmail } from "@/app/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/empleos";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupSent, setSignupSent] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "No pudimos completar el ingreso." : null
  );
  const [pending, startTransition] = useTransition();

  const supabase = getBrowserClient();
  const demoMode = supabase === null;

  async function handleGoogle() {
    if (!supabase) {
      router.push("/empleos");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  function handleEmail() {
    setError(null);
    startTransition(async () => {
      if (mode === "signup") {
        const result = await signUpWithEmail(email, password, {
          worka_role: "candidate",
        });
        if (result.demo) router.push("/onboarding");
        else if (!result.ok) setError(result.error ?? "Ocurrió un error.");
        else setSignupSent(true);
        return;
      }
      const result = await signInWithEmail(email, password, next);
      if (result.demo) router.push("/empleos");
      else if (!result.ok) setError(result.error ?? "Ocurrió un error.");
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <Logo />
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login" ? "Ingresá a tu cuenta" : "Creá tu cuenta gratis"}
          </p>
        </div>

        {signupSent && (
          <div className="text-center py-4 animate-pop">
            <p className="text-4xl mb-2">📨</p>
            <p className="font-semibold text-primary-dark">
              ¡Revisá tu email!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Te enviamos un link de confirmación. Al hacer clic, entrás directo
              a completar tu perfil.
            </p>
          </div>
        )}

        {!signupSent && (
        <>

        {demoMode && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            Modo demostración: Supabase no está configurado todavía, así que el
            ingreso te lleva directo a la app con datos de ejemplo.
          </p>
        )}

        <button className="btn-secondary w-full" onClick={handleGoogle}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.8 14a6.6 6.6 0 0 1 0-4.2V6.9H2.1a11 11 0 0 0 0 10l3.7-2.9z"
            />
            <path
              fill="#EA4335"
              d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 6.9L5.8 9.8c.9-2.7 3.3-4.4 6.2-4.4z"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex-1 h-px bg-gray-200" /> o con email{" "}
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <input
          className="input"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEmail()}
        />

        {error && <p className="text-sm text-danger text-center">{error}</p>}

        <button
          className="btn-primary w-full"
          disabled={pending || (!demoMode && (!email || !password))}
          onClick={handleEmail}
        >
          {pending
            ? "Un momento…"
            : mode === "login"
              ? "Ingresar"
              : "Crear mi cuenta"}
        </button>

        {mode === "login" ? (
          <p className="text-center text-sm text-gray-500">
            ¿No tenés cuenta?{" "}
            <button
              className="text-primary font-medium"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
            >
              Registrate gratis
            </button>
            {" · "}
            <Link href="/empresa/registro" className="text-primary font-medium">
              Soy empresa
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <button
              className="text-primary font-medium"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              Ingresá
            </button>
          </p>
        )}
        </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
