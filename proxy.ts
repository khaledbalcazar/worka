import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Rutas que requieren sesión cuando Supabase está configurado.
// /onboarding y /mensajes se sumaron porque quedaban navegables sin cuenta:
// se podía llenar el alta entera (incluida la subida del CV) para recién al
// final chocar con un "Iniciá sesión primero" y perder todo lo cargado.
const PROTECTED_PREFIXES = [
  "/perfil",
  "/postulaciones",
  "/mensajes",
  "/onboarding",
  "/admin",
];

// Worka Evaluar vive en evaluar.worka.click pero es la misma aplicación: el
// host se traduce a las rutas /evaluar. Así comparte sesión, base y
// componentes con Worka, que es justo lo que hace posible enlazar una vacante
// de Worka Empleos con un proceso de selección.
//
// Se dejan pasar sin tocar las rutas de infraestructura: los assets de Next,
// las APIs y el callback de auth tienen que resolver igual en los dos
// dominios, y reescribirlos rompería el ingreso.
const PASSTHROUGH = ["/_next", "/api", "/auth", "/manifest.webmanifest"];

function evaluarTarget(request: NextRequest): URL | null {
  const host = request.headers.get("host") ?? "";
  if (!host.startsWith("evaluar.")) return null;

  const path = request.nextUrl.pathname;
  if (path.startsWith("/evaluar")) return null;
  if (PASSTHROUGH.some((p) => path.startsWith(p))) return null;

  const url = request.nextUrl.clone();
  url.pathname = path === "/" ? "/evaluar" : `/evaluar${path}`;
  return url;
}

export async function proxy(request: NextRequest) {
  const evaluarUrl = evaluarTarget(request);

  // Modo demo: sin Supabase, todo es navegable.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return evaluarUrl ? NextResponse.rewrite(evaluarUrl) : NextResponse.next();
  }

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

  // La respuesta se construye como rewrite cuando entra por evaluar.: así el
  // refresco de sesión y el ruteo por dominio conviven en una sola respuesta.
  const build = () =>
    evaluarUrl
      ? NextResponse.rewrite(evaluarUrl, { request })
      : NextResponse.next({ request });

  let response = build();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = build();
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
    // Quien cae en /onboarding sin sesión casi nunca tiene cuenta todavía:
    // le abrimos directamente el formulario de registro, no el de ingreso.
    if (path.startsWith("/onboarding")) url.searchParams.set("modo", "registro");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
