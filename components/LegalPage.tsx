import Link from "next/link";
import Logo from "@/components/Logo";

// Página legal genérica (términos / privacidad). El contenido lo edita el
// admin desde el CMS; si está vacío, muestra un texto base por defecto.
export default function LegalPage({
  title,
  content,
  fallback,
}: {
  title: string;
  content: string;
  fallback: string;
}) {
  const text = content.trim() || fallback;
  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-primary font-medium">
            Volver al inicio
          </Link>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-primary-dark">
          {title}
        </h1>
        <div className="card p-6 mt-4">
          {/* Respeta saltos de línea del texto cargado en el admin. */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {text}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Worka — la plataforma de empleo 100% gratuita de Paraguay.
        </p>
      </div>
    </main>
  );
}
