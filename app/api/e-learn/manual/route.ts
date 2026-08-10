import { NextResponse } from "next/server";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getManualParts } from "@/lib/elearn/manual";

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

export async function GET() {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  return NextResponse.json({ parts: getManualParts() });
}
