import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getRoleHome } from "@/app/actions";

// Callback de OAuth (Google) y de los links de confirmación por email.
// Tras crear la sesión, deriva a cada rol a su casa. Si algo falla, el
// motivo real viaja en la URL para mostrarse en /ingresar (clave para
// diagnosticar problemas de configuración de OAuth).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
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
        const target = next && next !== "/empleos" ? next : await getRoleHome();
        return NextResponse.redirect(`${origin}${target}`);
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
