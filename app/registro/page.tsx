import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterPage() {
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
        <Link
          href="/onboarding"
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
          <Link href="/ingresar" className="text-primary font-medium">
            Ingresá
          </Link>
        </p>
      </div>
    </main>
  );
}
