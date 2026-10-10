import Link from "next/link";
import { Building2, ChevronRight, UserRound } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

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

  const option =
    "group flex items-center gap-4 rounded-lg border border-[#8c8c8c] p-4 hover:bg-[#f3f2f0] hover:shadow-[inset_0_0_0_1px_#404040]";
  return (
    <AuthShell
      below={
        <p>
          ¿Ya tenés cuenta?{" "}
          <Link href={loginHref} className="text-primary font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      }
    >
      <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.01em]">Unite a Worka</h1>
      <p className="text-[15px] text-muted mt-2">Es gratis. ¿Qué estás buscando?</p>
      <div className="space-y-3 mt-6">
        {/* Antes esto iba directo a /onboarding: se completaban los 4 pasos
            (CV incluido) sin cuenta, para chocar al final con "Iniciá sesión
            primero" y perder todo. Ahora la cuenta se crea antes del alta. */}
        <Link href={`/ingresar?modo=registro&next=${encodeURIComponent(candidateNext)}`} className={option}>
          <span className="w-12 h-12 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
            <UserRound size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[17px]">Busco trabajo</span>
            <span className="block text-sm text-muted">Creá tu perfil en 2 minutos y postulate con 1 clic.</span>
          </span>
          <ChevronRight size={20} className="text-muted shrink-0" />
        </Link>
        <Link href="/empresa/registro" className={option}>
          <span className="w-12 h-12 rounded-full bg-[#e9f4ec] text-success-ink grid place-items-center shrink-0">
            <Building2 size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[17px]">Busco talento</span>
            <span className="block text-sm text-muted">Publicá vacantes gratis y encontrá candidatos verificados.</span>
          </span>
          <ChevronRight size={20} className="text-muted shrink-0" />
        </Link>
      </div>
    </AuthShell>
  );
}
