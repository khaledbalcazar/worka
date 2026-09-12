import Link from "next/link";
import Logo from "@/components/Logo";
import { getAdminClient } from "@/lib/supabase/admin";
import { verificarBaja } from "@/lib/unsubscribe";
import VolverASuscribirse from "@/components/VolverASuscribirse";

export const metadata = {
  title: "Baja de correos",
  robots: { index: false, follow: false },
};

/* Página de baja.
 *
 * La baja se aplica al abrir, no al tocar un botón. Suena agresivo, pero al
 * revés es peor: quien llegó hasta acá ya decidió, y una pantalla que le pide
 * confirmar una vez más es exactamente lo que hace que cierre la pestaña y
 * marque spam en su lugar. Para el arrepentimiento está el botón de volver a
 * suscribirse, que es un clic igual de corto.
 */
export default async function BajaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const userId = verificarBaja(token);
  const admin = getAdminClient();

  if (userId && admin) {
    await Promise.all([
      admin
        .from("candidates")
        .update({ email_notifications: false, alerts_enabled: false })
        .eq("id", userId),
      admin
        .from("companies")
        .update({ email_notifications: false })
        .eq("id", userId),
    ]);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <Logo />
      {userId ? (
        <>
          <p className="text-5xl mt-8">📭</p>
          <h1 className="text-2xl font-bold text-primary-dark mt-4">
            Listo, no te escribimos más
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
            Diste de baja los correos de vacantes nuevas. Tu cuenta sigue
            igual: podés entrar a Worka y postularte cuando quieras.
          </p>
          <VolverASuscribirse token={token} />
          <Link href="/empleos" className="btn-secondary mt-3">
            Ver vacantes
          </Link>
        </>
      ) : (
        <>
          <p className="text-5xl mt-8">🔗</p>
          <h1 className="text-2xl font-bold text-primary-dark mt-4">
            Este enlace no es válido
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
            Puede estar cortado por el cliente de correo. Entrá a tu perfil y
            apagá las alertas desde ahí.
          </p>
          <Link href="/perfil" className="btn-primary mt-6">
            Ir a mi perfil
          </Link>
        </>
      )}
    </main>
  );
}
