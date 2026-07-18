// La app funciona en dos modos:
// - "live": con Supabase configurado vía variables de entorno.
// - "demo": sin credenciales, usando los datos de ejemplo de lib/mock-data.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

// URL pública del sitio (Vercel). Se usa para los links de confirmación por
// email; sin esto, Supabase cae al Site URL del dashboard.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
