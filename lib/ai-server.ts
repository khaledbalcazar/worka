import "server-only";
import { callAi, type AiCredentials } from "@/lib/elearn/aiProvider";
import { getProvider } from "@/components/elearn/lib/aiProviders";
import { getAdminClient } from "@/lib/supabase/admin";

// IA de Worka Pro (revisión de CV y simulador de entrevistas).
//
// Las claves se cargan desde el backoffice (Ajustes del sitio → IA de Worka
// Pro), igual que las de Worka Evaluar, y viven en la misma tabla con el
// proveedor marcado «workapro:<proveedor>» para no mezclarse. Antes la única
// forma era una variable de entorno en Vercel y un redeploy; ahora se agrega,
// se apaga o se cambia de modelo desde el navegador.
//
// Se prueban de la más descansada a la más usada: la que falla por cuota se
// marca y vuelve a la rueda en diez minutos, y la que es rechazada (401/403)
// se apaga sola. Las variables de entorno quedan como último respaldo.

export const PRO_KEY_PREFIX = "workapro:";
const RETRY_MS = 10 * 60 * 1000;

type KeyRow = {
  id: string;
  provider: string;
  api_key: string;
  model: string | null;
  failed_at: string | null;
};

type Candidate = AiCredentials & { keyId?: string };

async function storedKeys(): Promise<Candidate[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from("evaluar_ai_keys")
    .select("id, provider, api_key, model, failed_at")
    .like("provider", `${PRO_KEY_PREFIX}%`)
    .eq("active", true)
    .order("last_used_at", { ascending: true, nullsFirst: true });
  if (error) {
    console.error(`[worka:ai] no pudimos leer las claves: ${error.message}`);
    return [];
  }
  const now = Date.now();
  return ((data ?? []) as KeyRow[])
    .filter((k) => !k.failed_at || now - Date.parse(k.failed_at) > RETRY_MS)
    .map((k) => {
      const providerId = k.provider.slice(PRO_KEY_PREFIX.length) || "anthropic";
      return { keyId: k.id, providerId, apiKey: k.api_key, model: k.model || getProvider(providerId).defaultModel };
    });
}

function envKeys(): Candidate[] {
  const out: Candidate[] = [];
  if (process.env.ANTHROPIC_API_KEY)
    out.push({ providerId: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: process.env.WORKA_AI_MODEL || "claude-opus-5-5" });
  for (const [providerId, key] of [
    ["openai", process.env.OPENAI_API_KEY],
    ["gemini", process.env.GEMINI_API_KEY],
    ["groq", process.env.GROQ_API_KEY],
  ] as const) {
    if (key) out.push({ providerId, apiKey: key, model: process.env.WORKA_AI_MODEL || getProvider(providerId).defaultModel });
  }
  return out;
}

async function mark(id: string | undefined, patch: Record<string, unknown>) {
  const admin = getAdminClient();
  if (!admin || !id) return;
  await admin.from("evaluar_ai_keys").update(patch).eq("id", id);
}

// ¿Hay alguna clave con la que intentar? (para avisar en el panel)
export async function proAiConfigured(): Promise<boolean> {
  return (await storedKeys()).length > 0 || envKeys().length > 0;
}

// Texto libre, probando las claves en orden hasta que una responda.
export async function askText(system: string, user: string, maxTokens = 4000, json = false): Promise<string> {
  const candidates = [...(await storedKeys()), ...envKeys()];
  if (candidates.length === 0) throw new Error("NO_AI");
  let lastError: unknown = null;
  for (const c of candidates) {
    try {
      const text = await callAi(c, { system, user, maxTokens, json });
      await mark(c.keyId, { last_used_at: new Date().toISOString(), failed_at: null, fail_reason: null });
      return text;
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const status = (e as { status?: number })?.status;
      const rejected = status === 401 || status === 403 || /invalid.*key|authentication|unauthorized/i.test(msg);
      await mark(c.keyId, {
        failed_at: new Date().toISOString(),
        fail_reason: `${status ? `HTTP ${status}: ` : ""}${msg}`.slice(0, 240),
        ...(rejected ? { active: false } : {}),
      });
      console.error(`[worka:ai] ${c.providerId} falló: ${msg}`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("La IA no respondió.");
}

// Pide JSON y lo extrae aunque venga envuelto en texto o en ```json.
export async function askJson<T>(system: string, user: string, maxTokens = 4000): Promise<T> {
  const text = await askText(system, user, maxTokens, true);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("La IA no devolvió un resultado válido.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
