"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { getBrowserClient } from "@/lib/supabase/client";
import { signInWithEmail, signUpWithEmail } from "@/app/actions";

// Pantalla de ingreso, con una variante por público.
//
// Antes había una sola: la misma promesa para alguien que busca trabajo y para
// una empresa que viene a contratar, cuando lo que necesitan escuchar es
// distinto. Acá cada una tiene su copy, su destino por defecto y su columna de
// argumentos, pero comparten toda la lógica de autenticación.

export type Audience = "persona" | "empresa";
export type Product = "worka" | "evaluar";

function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

// Deja el destino en una cookie corta: el ida y vuelta con Google (y el link
// de confirmación por email) no conserva los parámetros de la URL, así que el
// callback la lee para devolver a la persona a donde estaba.
function rememberNext(next: string | null) {
  if (!next) return;
  document.cookie = `worka_next=${encodeURIComponent(next)}; path=/; max-age=7200; SameSite=Lax`;
}

type Copy = {
  titulo: string;
  tituloAlta: string;
  bajada: string;
  destino: string;
  altaHref: string;
  altaTexto: string;
  cruceHref: string;
  cruceTexto: string;
};

const COPY: Record<string, Copy> = {
  persona: {
    titulo: "Iniciar sesión",
    tituloAlta: "Unite a Worka",
    bajada: "Postulate con un clic y seguí cada proceso sin quedar a ciegas.",
    destino: "/empleos",
    altaHref: "/ingresar?modo=registro",
    altaTexto: "Registrate gratis",
    cruceHref: "/ingresar/empresa",
    cruceTexto: "¿Buscás talento? Ingresá como empresa",
  },
  empresa: {
    titulo: "Iniciar sesión como empresa",
    tituloAlta: "Registrá tu empresa",
    bajada: "Publicá vacantes gratis y encontrá candidatos verificados.",
    destino: "/empresa",
    altaHref: "/empresa/registro",
    altaTexto: "Registrar mi empresa",
    cruceHref: "/ingresar",
    cruceTexto: "¿Buscás trabajo? Ingresá como persona",
  },
  evaluar: {
    titulo: "Iniciar sesión en Evaluar",
    tituloAlta: "Creá tu cuenta de empresa",
    bajada:
      "Tu cuenta de empresa de Worka es la misma que usás acá: no hace falta crear otra.",
    destino: "/evaluar/app",
    altaHref: "/empresa/registro",
    altaTexto: "Registrar mi empresa",
    cruceHref: "/evaluar",
    cruceTexto: "Ver qué es Worka Evaluar",
  },
};

export default function LoginScreen({
  audience,
  product = "worka",
}: {
  audience: Audience;
  product?: Product;
}) {
  return (
    <Suspense>
      <Screen audience={audience} product={product} />
    </Suspense>
  );
}

function Screen({
  audience,
  product,
}: {
  audience: Audience;
  product: Product;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const copy = COPY[product === "evaluar" ? "evaluar" : audience];

  const rawNext = safeNext(searchParams.get("next"));
  const next = rawNext ?? copy.destino;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("modo") === "registro" ? "signup" : "login"
  );
  const [signupSent, setSignupSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error")
      ? `No pudimos completar el ingreso: ${searchParams.get("error")}`
      : null
  );
  const [pending, startTransition] = useTransition();

  const supabase = getBrowserClient();
  const demoMode = supabase === null;

  // Las empresas se registran con el formulario de alta de empresa (necesita
  // razón social y RUC), así que acá el modo alta solo existe para personas.
  const permiteAlta = audience === "persona";

  async function handleGoogle() {
    if (!supabase) {
      router.push(next);
      return;
    }
    // La URL de retorno va SIN query string: Supabase compara este valor
    // contra su lista de Redirect URLs y cualquier parámetro extra puede
    // hacer que no coincida. El destino viaja en cookie.
    rememberNext(rawNext ?? copy.destino);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(`No pudimos abrir el ingreso con Google: ${oauthError.message}`);
    }
  }

  function handleEmail() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      if (mode === "signup") {
        rememberNext(rawNext ?? copy.destino);
        const result = await signUpWithEmail(email, password, {
          worka_role: "candidate",
        });
        if (result.demo) router.push("/onboarding");
        else if (!result.ok) setError(result.error ?? "Ocurrió un error.");
        else setSignupSent(true);
        return;
      }
      const result = await signInWithEmail(email, password, next);
      if (result.demo) router.push(next);
      else if (!result.ok) setError(result.error ?? "Ocurrió un error.");
    });
  }

  const esAlta = mode === "signup" && permiteAlta;

  const field =
    "w-full h-[52px] rounded-[4px] border border-[#8c8c8c] bg-white px-3.5 text-base text-ink outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0a66c2]";

  return (
    <AuthShell
      below={
        !signupSent && (
          <>
            {!permiteAlta && (
              <p>
                ¿Tu empresa todavía no está en Worka?{" "}
                <Link href={copy.altaHref} className="text-primary font-semibold hover:underline">
                  {copy.altaTexto}
                </Link>
              </p>
            )}
            <p className="text-muted">
              <Link href={copy.cruceHref} className="hover:underline">
                {copy.cruceTexto}
              </Link>
            </p>
          </>
        )
      }
    >
      {signupSent ? (
        <div className="text-center py-6 animate-pop" role="status">
          <span className="confirmation-icon mx-auto"><Mail size={26} /></span>
          <h1 className="text-2xl font-semibold mt-4">Revisá tu email</h1>
          <p className="text-[15px] text-muted mt-2">
            Te enviamos un enlace de confirmación a <strong className="text-ink">{email}</strong>. Al abrirlo,
            entrás directo a completar tu perfil.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleEmail(); }} aria-busy={pending}>
          {product === "evaluar" && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/[0.08] rounded-full px-2.5 py-1 mb-3">
              <ClipboardCheck size={13} /> Worka Evaluar
            </p>
          )}
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.01em]">
            {esAlta ? copy.tituloAlta : copy.titulo}
          </h1>
          {permiteAlta ? (
            <p className="text-[15px] mt-2">
              {mode === "login" ? "¿Nuevo en Worka? " : "¿Ya tenés cuenta? "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                }}
              >
                {mode === "login" ? "Unite ahora" : "Iniciá sesión"}
              </button>
            </p>
          ) : (
            <p className="text-[15px] text-muted mt-2">{copy.bajada}</p>
          )}

          {rawNext?.startsWith("/empleo") && (
            <p className="text-[13px] bg-[#edf3f8] rounded-md px-3 py-2 mt-4">
              Guardamos la vacante: apenas termines, volvés directo a ella.
            </p>
          )}
          {demoMode && (
            <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-3 py-2 mt-4">
              Modo demostración: Supabase no está configurado, así que el ingreso te lleva directo a la app con datos de ejemplo.
            </p>
          )}

          <button
            type="button"
            className="mt-6 w-full min-h-12 rounded-full border border-[#8c8c8c] bg-white flex items-center justify-center gap-2.5 text-base font-semibold text-[#404040] hover:bg-[#f3f2f0] hover:shadow-[inset_0_0_0_1px_#404040] disabled:opacity-50"
            disabled={pending}
            onClick={handleGoogle}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.3z" />
              <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.8 14a6.6 6.6 0 0 1 0-4.2V6.9H2.1a11 11 0 0 0 0 10l3.7-2.9z" />
              <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 6.9L5.8 9.8c.9-2.7 3.3-4.4 6.2-4.4z" />
            </svg>
            Continuar con Google
          </button>
          <p className="text-xs text-muted mt-4 leading-relaxed">
            Al continuar, aceptás los{" "}
            <Link href="/terminos" className="text-primary font-semibold hover:underline">Términos</Link> y la{" "}
            <Link href="/privacidad" className="text-primary font-semibold hover:underline">Política de privacidad</Link> de Worka.
          </p>

          <div className="flex items-center gap-3 text-sm text-muted my-5">
            <span className="flex-1 h-px bg-line" /> o <span className="flex-1 h-px bg-line" />
          </div>

          <label className="block text-[15px] mb-1.5" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            autoComplete="email"
            required={!demoMode}
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block text-[15px] mt-4 mb-1.5" htmlFor="login-password">Contraseña</label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              autoComplete={esAlta ? "new-password" : "current-password"}
              required={!demoMode}
              minLength={esAlta && !demoMode ? 6 : undefined}
              aria-describedby={esAlta ? "password-help" : undefined}
              className={`${field} pr-24`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-10 px-3 rounded-full text-[15px] font-semibold text-primary hover:bg-primary/[0.08]"
              aria-pressed={showPassword}
              aria-controls="login-password"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "ocultar" : "mostrar"}
            </button>
          </div>
          {esAlta && <p id="password-help" className="text-xs text-muted mt-1.5">Usá al menos 6 caracteres.</p>}

          {!esAlta && (
            <Link href="/recuperar" className="inline-block mt-4 text-[15px] font-semibold text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger mt-4">{error}</p>
          )}

          <button className="btn-primary press w-full !min-h-[52px] !text-base mt-6" type="submit" disabled={pending}>
            {pending ? "Un momento…" : esAlta ? "Aceptar y unirme" : "Iniciar sesión"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
