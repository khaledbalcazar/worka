import Logo from "@/components/Logo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReferenceByToken } from "@/lib/data";
import ConfirmReference from "@/components/ConfirmReference";

// Link único que recibe la referencia laboral por WhatsApp.
// Sin registro: abre, confirma, listo.
export default async function ReferencePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reference = await getReferenceByToken(token);
  if (!reference) notFound();

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-6 text-center space-y-4">
        <Logo />
        {reference.status === "confirmada" ? (
          <div className="py-4 animate-pop">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-bold text-primary-dark">
              Referencia ya confirmada
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Gracias por ayudar a {reference.candidate_name} a conseguir su
              próximo trabajo.
            </p>
          </div>
        ) : (
          <>
            <p className="text-4xl">🤝</p>
            <h1 className="font-bold text-primary-dark text-lg">
              {reference.candidate_name} te puso como referencia laboral
            </h1>
            <div className="bg-surface rounded-xl px-4 py-3 text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Según {reference.candidate_name.split(" ")[0]}:
              </p>
              <p className="text-sm text-gray-700 mt-1">
                &ldquo;{reference.relationship}&rdquo;
              </p>
            </div>
            <p className="text-sm text-gray-500">
              ¿Confirmás que trabajaron juntos, {reference.referrer_name}? Tu
              confirmación aparece en su perfil de Worka y lo ayuda a conseguir
              empleo.
            </p>
            <ConfirmReference token={token} />
          </>
        )}
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Worka — la plataforma de empleo 100% gratuita de Paraguay.{" "}
          <Link href="/" className="text-primary">
            Conocela
          </Link>
        </p>
      </div>
    </main>
  );
}
