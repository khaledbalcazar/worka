import Link from "next/link";
import Logo from "@/components/Logo";

// Marco de las pantallas de acceso (ingresar, registro, recuperar,
// restablecer): fondo blanco, la marca arriba a la izquierda y una sola
// tarjeta centrada, sin nada que distraiga del formulario.
export default function AuthShell({
  children,
  below,
}: {
  children: React.ReactNode;
  below?: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-white text-ink">
      <header className="px-4 sm:px-8 lg:px-14 h-16 sm:h-20 flex items-center">
        <Logo />
      </header>
      <div className="flex-1 flex flex-col items-center px-4 pb-10 sm:pt-4">
        <div className="w-full max-w-[400px] sm:max-w-[464px] sm:rounded-lg sm:border sm:border-line sm:shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:px-10 sm:py-9">
          {children}
        </div>
        {below && <div className="w-full max-w-[400px] mt-6 text-center text-[15px] space-y-2">{below}</div>}
      </div>
      <footer className="px-4 py-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
        <span>Worka © {new Date().getFullYear()}</span>
        <Link href="/terminos" className="hover:text-primary hover:underline">Términos</Link>
        <Link href="/privacidad" className="hover:text-primary hover:underline">Privacidad</Link>
        <Link href="/empleos" className="hover:text-primary hover:underline">Buscar empleos</Link>
      </footer>
    </main>
  );
}
