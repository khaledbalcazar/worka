import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getRoleHome } from "@/app/actions";

// Solo aceptamos rutas internas. Sin esto, un "next" como "//sitio-falso.com"
// se pega al origin y el navegador lo lee como URL protocolo-relativa: sería
// un redirect abierto, regalado para phishing con el dominio de Worka.
function safeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

// Callback de OAuth (Google) y de los links de confirmación por email.
// Tras crear la sesión, deriva a cada rol a su casa. Si algo falla, el
// motivo real viaja en la URL para mostrarse en /ingresar (clave para
// diagnosticar problemas de configuración de OAuth).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // El destino puede venir en la URL o en la cookie que dejó /ingresar. La
  // cookie existe porque el ida y vuelta con Google no conserva parámetros:
  // sin ella, quien llegaba desde Google a una vacante y creaba su cuenta
  // terminaba en el feed y perdía justo la vacante que quería.
  const cookieNext = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("worka_next="))
    ?.split("=")
    .slice(1)
    .join("=");
  const next =
    safeNext(searchParams.get("next")) ??
    safeNext(cookieNext ? decodeURIComponent(cookieNext) : null);

  // Errores que manda el propio proveedor (Google/Supabase) en la URL
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (providerError) {
    console.error("auth callback provider error:", providerError);
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(providerError)}`
    );
  }

  if (code) {
    const supabase = await getServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const home = await getRoleHome();
        // Cuenta recién creada: el alta va primero, pero se lleva el destino
        // para devolver a la persona a la vacante apenas termine.
        const target =
          home === "/onboarding"
            ? next
              ? `/onboarding?next=${encodeURIComponent(next)}`
              : "/onboarding"
            : (next ?? home);
        const response = NextResponse.redirect(`${origin}${target}`);
        response.cookies.delete("worka_next");
        return response;
      }
      console.error("auth callback exchange error:", error);
      return NextResponse.redirect(
        `${origin}/ingresar?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/ingresar?error=${encodeURIComponent("No llegó el código de autorización. Revisá las Redirect URLs en Supabase.")}`
  );
}
