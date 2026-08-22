import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Rutas que requieren sesión cuando Supabase está configurado.
const PROTECTED_PREFIXES = ["/perfil", "/postulaciones", "/admin"];

export async function proxy(request: NextRequest) {
  // Modo demo: sin Supabase, todo es navegable.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.next();

  const path = request.nextUrl.pathname;

  // Rescate del login con OAuth (Google).
  // Si la Redirect URL no coincide exactamente con la lista blanca de
  // Supabase, Supabase devuelve al usuario al "Site URL" (normalmente "/")
  // con el ?code= colgando. Ahí nadie lo intercambia y el ingreso se pierde
  // en silencio: el usuario aterriza en la home sin sesión. Reenviamos ese
  // código al callback, que es el único que sabe canjearlo por la sesión.
  if (path !== "/auth/callback") {
    const url = request.nextUrl.clone();
    if (url.searchParams.has("code")) {
      url.pathname = "/auth/callback";
      return NextResponse.redirect(url);
    }
    // Lo mismo con los errores del proveedor: que se vean en /ingresar en
    // lugar de perderse en una página cualquiera.
    if (url.searchParams.has("error_description") || url.searchParams.has("error")) {
      if (path !== "/ingresar") {
        url.pathname = "/auth/callback";
        return NextResponse.redirect(url);
      }
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresca la sesión (obligatorio para SSR con Supabase).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
