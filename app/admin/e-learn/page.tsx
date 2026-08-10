import { redirect } from "next/navigation";
import ELearnApp from "@/components/elearn/ELearnApp";
import { isLive } from "@/lib/data";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

// Módulo oculto: aula virtual personal para el concurso del Registro Civil.
// Solo accesible por el rol admin y excluido de los buscadores.
export const metadata = {
  title: "e-learn",
  robots: { index: false, follow: false },
};

export default async function ELearnPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=/admin/e-learn");
    const supabase = await getServerClient();
    const { data: profile } = await supabase!
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") redirect("/");
  }
  return <ELearnApp />;
}
