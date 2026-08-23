import Link from "next/link";
import Logo from "@/components/Logo";
import { getSiteSettings } from "@/lib/data";
import { isSettingOn } from "@/lib/settings";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

// Puerta de mantenimiento: si el admin activó maintenance_mode, muestra una
// pantalla de mantenimiento a todos salvo a los admin (que siguen trabajando).
export default async function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  if (!isSettingOn(settings.maintenance_mode)) return <>{children}</>;

  // Los admin pasan igual.
  const supabase = await getServerClient();
  if (supabase) {
    const user = await getCurrentUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.role === "admin") return <>{children}</>;
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Sin esto Google indexa "Estamos mejorando Worka" en lugar de las
          vacantes, y la penalización sobrevive al mantenimiento. */}
      <meta name="robots" content="noindex" />
      <Logo />
      <p className="text-5xl mt-6">🛠️</p>
      <h1 className="text-2xl font-bold text-primary-dark mt-4">
        Estamos mejorando Worka
      </h1>
      <p className="text-gray-500 mt-2 max-w-md">
        {settings.maintenance_text ||
          "Volvemos en un ratito con novedades. Gracias por la paciencia. 🙌"}
      </p>
      <Link href="/ingresar" className="text-sm text-primary underline mt-6">
        Ingresar
      </Link>
    </main>
  );
}
