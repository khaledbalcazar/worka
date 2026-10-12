import "server-only";
import type { getServerClient } from "@/lib/supabase/server";

type Client = NonNullable<Awaited<ReturnType<typeof getServerClient>>>;

// Empresa efectiva del usuario: su propia empresa, o aquella de la que es
// miembro activo del equipo de reclutamiento (invitado por el dueño).
// Vive fuera de app/actions.ts a propósito: todo lo exportado desde un
// archivo "use server" queda publicado como endpoint.
export async function getEffectiveCompanyId(supabase: Client, userId: string): Promise<string | null> {
  return (await getCompanyAccess(supabase, userId))?.companyId ?? null;
}

// Empresa y rol: "dueño" para la cuenta de la empresa, o el rol del miembro.
export async function getCompanyAccess(
  supabase: Client,
  userId: string
): Promise<{ companyId: string; role: "dueño" | "administrador" | "reclutador" | "observador" } | null> {
  const { data: own } = await supabase.from("companies").select("id").eq("id", userId).maybeSingle();
  if (own) return { companyId: own.id, role: "dueño" };
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("member_id", userId)
    .eq("status", "activa")
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  const role = (membership as { role?: string }).role;
  return {
    companyId: membership.company_id,
    role: role === "administrador" || role === "observador" ? role : "reclutador",
  };
}
