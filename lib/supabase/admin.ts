import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Cliente administrativo con la Service Role Key (solo servidor, NUNCA en el
// navegador). Habilita gestión total de usuarios desde el backoffice:
// listar emails, eliminar cuentas de auth, etc.
// Para activarlo: Vercel → Environment Variables → SUPABASE_SERVICE_ROLE_KEY
// (Supabase → Settings → API → service_role). Sin la clave, el admin funciona
// igual pero con acciones limitadas a los datos de la app.
export function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
