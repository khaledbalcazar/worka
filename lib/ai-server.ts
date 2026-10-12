import "server-only";
import { callAi, type AiCredentials } from "@/lib/elearn/aiProvider";
import { getProvider } from "@/components/elearn/lib/aiProviders";

// IA de Worka Pro (revisión de CV y simulador de entrevistas). Usa la clave
// del servidor; a diferencia de Academia, la persona no trae la suya.
// Prioriza Anthropic; WORKA_AI_MODEL permite cambiar el modelo sin tocar código.

export function serverAiCredentials(): AiCredentials | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      providerId: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.WORKA_AI_MODEL || "claude-opus-5-5",
    };
  }
  const others: { providerId: string; key?: string }[] = [
    { providerId: "openai", key: process.env.OPENAI_API_KEY },
    { providerId: "gemini", key: process.env.GEMINI_API_KEY },
    { providerId: "groq", key: process.env.GROQ_API_KEY },
  ];
  for (const o of others) {
    if (o.key) {
      return {
        providerId: o.providerId,
        apiKey: o.key,
        model: process.env.WORKA_AI_MODEL || getProvider(o.providerId).defaultModel,
      };
    }
  }
  return null;
}

// Pide JSON y lo extrae aunque venga envuelto en texto o en ```json.
export async function askJson<T>(system: string, user: string, maxTokens = 4000): Promise<T> {
  const creds = serverAiCredentials();
  if (!creds) throw new Error("NO_AI");
  const text = await callAi(creds, { system, user, maxTokens, json: true });
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("La IA no devolvió un resultado válido.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
