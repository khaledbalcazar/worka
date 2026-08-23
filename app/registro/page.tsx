import Link from "next/link";
import Logo from "@/components/Logo";

// Varias pantallas mandan acá con ?next= (por ejemplo una vacante externa,
// donde la persona llega desde Google y todavía no tiene cuenta). Antes ese
// destino se descartaba en silencio y, después de registrarse, terminaba en el
// feed sin la vacante que venía a buscar.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Solo rutas internas: un destino externo convertiría esto en un redirect
  // abierto con el dominio de Worka de fachada.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
      ? next
      : null;
  // Quien busca trabajo pasa por el alta de perfil antes de su destino.
  const candidateNext = safeNext
    ? `/onboarding?next=${encodeURIComponent(safeNext)}`
    : "/onboarding";
  const loginHref = `/ingresar${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <Logo />
          <h1 className="text-lg font-bold text-primary-dark mt-2">
            Crear cuenta gratis
          </h1>
          <p className="text-sm text-gray-500">¿Qué estás buscando?</p>
        </div>
        {/* Antes esto iba directo a /onboarding: se completaban los 4 pasos
            (CV incluido) sin cuenta, para chocar al final con "Iniciá sesión
            primero" y perder todo. Ahora la cuenta se crea antes del alta. */}
        <Link
          href={`/ingresar?modo=registro&next=${encodeURIComponent(candidateNext)}`}
          className="card block p-5 hover:border-primary border-2 border-transparent"
        >
          <p className="text-2xl mb-1">👤</p>
          <p className="font-semibold text-primary-dark">Busco trabajo</p>
          <p className="text-sm text-gray-500">
            Creá tu perfil en 2 minutos y postulate con 1 clic.
          </p>
        </Link>
        <Link
          href="/empresa/registro"
          className="card block p-5 hover:border-primary border-2 border-transparent"
        >
          <p className="text-2xl mb-1">🏢</p>
          <p className="font-semibold text-primary-dark">Busco talento</p>
          <p className="text-sm text-gray-500">
            Publicá vacantes gratis y encontrá candidatos verificados.
          </p>
        </Link>
        <p className="text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{" "}
          <Link href={loginHref} className="text-primary font-medium">
            Ingresá
          </Link>
        </p>
      </div>
    </main>
  );
}
