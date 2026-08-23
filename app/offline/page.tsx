import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

// Pantalla que sirve el service worker cuando no hay señal y la página pedida
// no está en caché. Sin ella, la app instalada muestra el error del navegador.
export default function OfflinePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <Logo />
      <p className="text-5xl mt-6">📡</p>
      <h1 className="text-xl font-bold text-primary-dark mt-4">
        Te quedaste sin conexión
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Revisá tus datos o el wifi. Las vacantes que ya viste siguen
        disponibles; el resto vuelve apenas tengas señal.
      </p>
      <Link href="/empleos" className="btn-primary mt-6">
        Reintentar
      </Link>
    </main>
  );
}
