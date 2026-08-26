"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  Check,
  ClipboardCheck,
  Sparkles,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";
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
  puntos: { Icon: typeof User; t: string }[];
};

const COPY: Record<string, Copy> = {
  persona: {
    titulo: "Entrá a tu cuenta",
    tituloAlta: "Creá tu cuenta gratis",
    bajada: "Postulate con un clic y seguí cada proceso sin quedar a ciegas.",
    destino: "/empleos",
    altaHref: "/ingresar?modo=registro",
    altaTexto: "Registrate gratis",
    cruceHref: "/ingresar/empresa",
    cruceTexto: "Soy una empresa",
    puntos: [
      { Icon: Briefcase, t: "Miles de vacantes, sin comisiones ni costos" },
      { Icon: Sparkles, t: "Tu CV gratis y alertas cuando sale algo tuyo" },
      { Icon: Check, t: "Siempre sabés en qué etapa está tu postulación" },
    ],
  },
  empresa: {
    titulo: "Entrá a tu cuenta de empresa",
    tituloAlta: "Registrá tu empresa",
    bajada: "Publicá vacantes gratis y encontrá candidatos verificados.",
    destino: "/empresa",
    altaHref: "/empresa/registro",
    altaTexto: "Registrar mi empresa",
    cruceHref: "/ingresar",
    cruceTexto: "Busco trabajo",
    puntos: [
      { Icon: Building2, t: "Publicar vacantes es gratis, sin límite" },
      { Icon: User, t: "Candidatos con perfil y CV, no solo un correo" },
      { Icon: BarChart3, t: "Métricas reales de cada vacante" },
    ],
  },
  evaluar: {
    titulo: "Entrá a Worka Evaluar",
    tituloAlta: "Creá tu cuenta de empresa",
    bajada:
      "Tu cuenta de empresa de Worka es la misma que usás acá: no hace falta crear otra.",
    destino: "/evaluar/app",
    altaHref: "/empresa/registro",
    altaTexto: "Registrar mi empresa",
    cruceHref: "/evaluar",
    cruceTexto: "Ver qué es Worka Evaluar",
    puntos: [
      { Icon: ClipboardCheck, t: "Tests listos: personalidad, razonamiento y SJT" },
      { Icon: Sparkles, t: "La evaluación empieza en tu propia vacante" },
      { Icon: BarChart3, t: "Tablero para comparar finalistas y decidir" },
    ],
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

  return (
    <main className="flex-1 lg:grid lg:grid-cols-2 min-h-screen">
      {/* Columna de argumentos: en escritorio acompaña, en celular no se
          muestra para no empujar el formulario abajo del pliegue. */}
      <aside
        className={`hidden lg:flex flex-col justify-center px-12 ${
          product === "evaluar"
            ? "bg-primary-dark text-white"
            : audience === "empresa"
              ? "bg-primary-dark text-white"
              : "bg-surface"
        }`}
      >
        <Logo />
        <h2
          className={`text-3xl font-extrabold mt-6 leading-tight ${
            audience === "persona" && product !== "evaluar"
              ? "text-primary-dark"
              : ""
          }`}
        >
          {product === "evaluar"
            ? "Seleccioná mejor, sin que el candidato abandone."
            : audience === "empresa"
              ? "Encontrá a la persona indicada."
              : "Tu próximo paso empieza acá."}
        </h2>
        <ul className="mt-7 space-y-3">
          {copy.puntos.map(({ Icon, t }) => (
            <li key={t} className="flex items-start gap-3">
              <span
                className={`w-8 h-8 shrink-0 rounded-xl grid place-items-center ${
                  audience === "persona" && product !== "evaluar"
                    ? "bg-white text-primary"
                    : "bg-white/10"
                }`}
              >
                <Icon size={16} />
              </span>
              <span
                className={`text-sm ${
                  audience === "persona" && product !== "evaluar"
                    ? "text-gray-600"
                    : "text-white/80"
                }`}
              >
                {t}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Formulario */}
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center lg:hidden">
            <Logo />
          </div>

          <div className="text-center mt-3">
            <span
              className={`chip ${
                audience === "empresa" || product === "evaluar"
                  ? "bg-blue-50 text-primary"
                  : "bg-surface text-gray-600"
              }`}
            >
              {product === "evaluar" ? (
                <>
                  <ClipboardCheck size={12} /> Worka Evaluar
                </>
              ) : audience === "empresa" ? (
                <>
                  <Building2 size={12} /> Empresas
                </>
              ) : (
                <>
                  <User size={12} /> Personas
                </>
              )}
            </span>
            <h1 className="text-xl font-bold text-primary-dark mt-3">
              {esAlta ? copy.tituloAlta : copy.titulo}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{copy.bajada}</p>
          </div>

          {rawNext?.startsWith("/empleo") && (
            <p className="text-xs text-primary-dark bg-blue-50 rounded-xl px-3 py-2 text-center mt-4">
              📌 Guardamos la vacante: apenas termines, volvés directo a ella.
            </p>
          )}

          <div className="card p-6 mt-4 space-y-4">
            {signupSent ? (
              <div className="text-center py-4 animate-pop">
                <p className="text-4xl mb-2">📨</p>
                <p className="font-semibold text-primary-dark">
                  ¡Revisá tu email!
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Te enviamos un link de confirmación. Al hacer clic, entrás
                  directo a completar tu perfil.
                </p>
              </div>
            ) : (
              <>
                {demoMode && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    Modo demostración: Supabase no está configurado, así que el
                    ingreso te lleva directo a la app con datos de ejemplo.
                  </p>
                )}

                <button
                  className="btn-secondary press w-full"
                  onClick={handleGoogle}
                >
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
                  placeholder={
                    audience === "empresa" ? "rrhh@tuempresa.com.py" : "tu@email.com"
                  }
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

                {error && (
                  <p className="text-sm text-danger text-center">{error}</p>
                )}

                <button
                  className="btn-primary press w-full"
                  disabled={pending || (!demoMode && (!email || !password))}
                  onClick={handleEmail}
                >
                  {pending
                    ? "Un momento…"
                    : esAlta
                      ? "Crear mi cuenta"
                      : "Entrar"}
                </button>

                <p className="text-center text-sm">
                  <Link href="/recuperar" className="text-gray-500 underline">
                    Olvidé mi contraseña
                  </Link>
                </p>
              </>
            )}
          </div>

          {!signupSent && (
            <div className="text-center text-sm text-gray-500 mt-4 space-y-1.5">
              {permiteAlta ? (
                <p>
                  {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
                  <button
                    className="text-primary font-medium"
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setError(null);
                    }}
                  >
                    {mode === "login" ? "Registrate gratis" : "Entrá"}
                  </button>
                </p>
              ) : (
                <p>
                  ¿Tu empresa todavía no está en Worka?{" "}
                  <Link href={copy.altaHref} className="text-primary font-medium">
                    {copy.altaTexto}
                  </Link>
                </p>
              )}
              <p>
                <Link href={copy.cruceHref} className="text-gray-500 underline">
                  {copy.cruceTexto}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
