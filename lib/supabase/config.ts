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

// La base de Worka Evaluar, para los enlaces que van por correo.
//
// Estaba escrita a mano en seis archivos como
// SITE_URL.replace("://", "://evaluar."), y con SITE_URL apuntando a
// www.worka.click eso producía https://evaluar.www.worka.click — un dominio
// que no existe. Todos los correos de Evaluar salieron con ese enlace.
//
// El www se saca antes de anteponer el subdominio, que es lo que faltaba.
// Y en desarrollo no hay subdominios: ahí se usa la ruta /evaluar, que es a
// donde el proxy manda igual.
export function evaluarUrl(path = ""): string {
  // Sin path no se agrega barra: quien llama suele concatenar
  // `${base}/e/${token}`, y una barra de más produce //e, que no resuelve.
  const limpio = !path ? "" : path.startsWith("/") ? path : `/${path}`;
  const base = SITE_URL.replace(/\/$/, "");

  if (base.includes("localhost") || base.includes("127.0.0.1")) {
    return `${base}/evaluar${limpio}`;
  }

  return base.replace(/^(https?:\/\/)(www\.)?/, "$1evaluar.") + limpio;
}
