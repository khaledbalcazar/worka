import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Logo from "@/components/Logo";
import WorkaConsent from "@/components/evaluar/WorkaConsent";
import { getWorkaConnectInfo } from "@/app/evaluar/actions";
import { evaluarUrl } from "@/lib/supabase/config";

// Pantalla de consentimiento de «Continuar con Worka Empleos».
//
// Vive en worka.click y no en evaluar.worka.click porque la sesión del
// candidato está en Worka. Es el paso de «autorizar» de un OAuth: quién pide
// los datos, cuáles, y un botón para permitir o volver sin compartir nada.
export const metadata = {
  title: "Continuar con Worka Empleos",
  robots: { index: false, follow: false },
};

export default async function ConectarEvaluarPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  if (!t || !/^[\w-]{6,80}$/.test(t)) notFound();

  const info = await getWorkaConnectInfo(t);
  if (!info) notFound();

  // Sin sesión se pasa por el ingreso de Worka y se vuelve acá.
  if (!info.demo && !info.user && !info.notCandidate) {
    redirect(`/ingresar?next=${encodeURIComponent(`/conectar/evaluar?t=${t}`)}`);
  }

  const volver = evaluarUrl(`/e/${t}`);

  return (
    <main className="min-h-screen bg-[#f3efea] flex flex-col items-center px-4 py-10 sm:py-16">
      <Logo />
      <div className="w-full max-w-md mt-6">
        <WorkaConsent token={t} info={info} returnUrl={volver} evaluarBase={evaluarUrl("/e/")} />
      </div>
      <p className="text-xs text-[#666] mt-6 text-center max-w-sm">
        Worka Evaluar es parte de Worka. Al permitir, aceptás que la empresa vea estos datos según los{" "}
        <Link href="/terminos" className="underline">Términos</Link> y la{" "}
        <Link href="/privacidad" className="underline">Política de privacidad</Link>.
      </p>
    </main>
  );
}
