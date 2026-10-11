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

// Dominio canónico para buscadores: canonical, metadataBase, JSON-LD,
// robots.txt, sitemap e IndexNow. Es worka.click, sin www.
//
// Va separado de SITE_URL a propósito: SITE_URL también arma los enlaces de
// confirmación por email y el retorno del login, y esos tienen que coincidir
// con las Redirect URLs de Supabase. Cambiar el dominio de SEO no debe tocar
// el login. Si SITE_URL apunta a www, acá se le saca el www; para forzar otro
// valor existe NEXT_PUBLIC_CANONICAL_URL.
export const CANONICAL_URL = (
  process.env.NEXT_PUBLIC_CANONICAL_URL ??
  SITE_URL.replace(/^(https?:\/\/)www\./, "$1")
).replace(/\/$/, "");

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
