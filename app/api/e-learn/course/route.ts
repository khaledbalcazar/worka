import { NextResponse } from "next/server";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getPartSections } from "@/lib/elearn/manual";

export const runtime = "nodejs";

async function ensureAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await getServerClient();
  const { data } = await supabase!
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "admin";
}

// Devuelve las secciones del Manual oficial que corresponden a un curso del
// Temario Oficial, para mostrar su desarrollo íntegro dentro de cada unidad.
export async function GET(req: Request) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const partId = new URL(req.url).searchParams.get("partId");
  if (!partId)
    return NextResponse.json({ error: "Falta el parámetro partId." }, { status: 400 });

  return NextResponse.json({ sections: getPartSections(partId) });
}
