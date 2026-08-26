import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

// Llamada a la IA con rotación de claves.
//
// Varias claves y no una porque las cuentas gratuitas de Groq tienen tope por
// minuto: con una sola, el asistente se cae justo cuando dos empresas lo usan
// a la vez, que es exactamente cuando no puede caerse. Se usa siempre la que
// hace más rato que no se toca, y la que devuelve un error de cuota se marca
// sola para que la próxima llamada no vuelva a chocar contra ella.
//
// La clave nunca sale del servidor. La tabla es de lectura exclusiva del
// admin y acá se lee con la service role.

export type AiKey = {
  id: string;
  provider: string;
  label: string;
  api_key: string;
  active: boolean;
  last_used_at: string | null;
  failed_at: string | null;
  fail_reason: string | null;
  created_at: string;
};

/** Modelo por defecto. Groq es OpenAI-compatible, así que el resto es igual. */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Una clave marcada como fallada vuelve a intentarse después de esto. */
const REINTENTO_MS = 10 * 60 * 1000;

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

// Las claves utilizables, de la más descansada a la más reciente.
async function claves(provider = "groq"): Promise<AiKey[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("evaluar_ai_keys")
    .select("*")
    .eq("provider", provider)
    .eq("active", true)
    .order("last_used_at", { ascending: true, nullsFirst: true });

  const ahora = Date.now();
  return ((data ?? []) as AiKey[]).filter((k) => {
    if (!k.failed_at) return true;
    // Una clave que falló hace un rato vuelve a la rueda: el tope de Groq es
    // por minuto, así que descartarla para siempre sería tirar una cuenta
    // buena por un pico de uso.
    return ahora - new Date(k.failed_at).getTime() > REINTENTO_MS;
  });
}

async function marcar(id: string, patch: Partial<AiKey>) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin.from("evaluar_ai_keys").update(patch).eq("id", id);
}

export function aiEnabled(): boolean {
  return !!getAdminClient();
}

export async function callAi(input: {
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
}): Promise<AiResult> {
  const lista = await claves();
  if (lista.length === 0) {
    return {
      ok: false,
      error:
        "El asistente no está disponible en este momento. Probá de nuevo en un rato.",
    };
  }

  let ultimoError = "No pudimos contactar al asistente.";

  for (const k of lista) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${k.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.4,
          max_tokens: input.maxTokens ?? 2048,
          ...(input.json ? { response_format: { type: "json_object" } } : {}),
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.user },
          ],
        }),
      });

      if (!res.ok) {
        const cuerpo = await res.text();
        // 429 es tope de uso y 401/403 es clave mala. Las dos se marcan, pero
        // la de cuota se reintenta sola más tarde y la inválida no.
        await marcar(k.id, {
          failed_at: new Date().toISOString(),
          fail_reason: `HTTP ${res.status}: ${cuerpo.slice(0, 200)}`,
          ...(res.status === 401 || res.status === 403
            ? { active: false }
            : {}),
        });
        ultimoError =
          res.status === 429
            ? "El asistente está saturado. Probá de nuevo en un minuto."
            : "El asistente rechazó la consulta.";
        continue;
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        ultimoError = "El asistente devolvió una respuesta vacía.";
        continue;
      }

      await marcar(k.id, {
        last_used_at: new Date().toISOString(),
        failed_at: null,
        fail_reason: null,
      });
      return { ok: true, text };
    } catch (e) {
      console.error("callAi:", e);
      ultimoError = "No pudimos contactar al asistente.";
    }
  }

  return { ok: false, error: ultimoError };
}
