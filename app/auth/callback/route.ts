import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { getRoleHome } from "@/app/actions";

// Callback de OAuth (Google) y de los links de confirmación por email.
// Tras crear la sesión, deriva a cada rol a su casa.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await getServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const target = next && next !== "/empleos" ? next : await getRoleHome();
        return NextResponse.redirect(`${origin}${target}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/ingresar?error=auth`);
}
