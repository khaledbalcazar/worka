import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";
import { defaultSiteSettings } from "@/lib/mock-data";

// Configuración del sitio leída sin cookies: la usan páginas cacheadas (las
// portadas de cada país) que no pueden volverse dinámicas por leer la sesión.
export async function getPublicSiteSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return { ...defaultSiteSettings };
  try {
    const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }) },
    });
    const { data } = await db.from("site_settings").select("key, value");
    const out: Record<string, string> = { ...defaultSiteSettings };
    for (const row of (data ?? []) as { key: string; value: string }[]) out[row.key] = row.value;
    return out;
  } catch {
    return { ...defaultSiteSettings };
  }
}
