import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getProvider, type ProviderKind } from "@/components/elearn/lib/aiProviders";

// Llamada a un LLM agnóstica del proveedor. El usuario elige plataforma
// (Groq, OpenAI, Gemini, Anthropic, xAI…) desde el frontend y su credencial
// viaja por header; acá se traduce a la API concreta de cada una.

export interface AiRequest {
  system: string;
  user: string;
  maxTokens: number;
  json?: boolean; // pedir salida JSON cuando el proveedor lo soporta
}

export interface AiCredentials {
  providerId: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// Lee las credenciales del request. Prioridad: las del usuario (header) y,
// si no hay, las del servidor (variables de entorno).
export function credentialsFromRequest(req: Request): AiCredentials | null {
  const apiKey = req.headers.get("x-ai-api-key")?.trim();
  if (apiKey) {
    const providerId = req.headers.get("x-ai-provider")?.trim() || "groq";
    const provider = getProvider(providerId);
    return {
      providerId,
      apiKey,
      model: req.headers.get("x-ai-model")?.trim() || provider.defaultModel,
      baseUrl: req.headers.get("x-ai-base-url")?.trim() || undefined,
    };
  }

  // Fallback del servidor: se soportan varias plataformas por env var.
  const envFallbacks: { providerId: string; key?: string }[] = [
    { providerId: "groq", key: process.env.GROQ_API_KEY },
    { providerId: "openai", key: process.env.OPENAI_API_KEY },
    { providerId: "gemini", key: process.env.GEMINI_API_KEY },
    { providerId: "anthropic", key: process.env.ANTHROPIC_API_KEY },
  ];
  for (const f of envFallbacks) {
    if (f.key) {
      return {
        providerId: f.providerId,
        apiKey: f.key,
        model: getProvider(f.providerId).defaultModel,
      };
    }
  }
  return null;
}

export async function callAi(creds: AiCredentials, req: AiRequest): Promise<string> {
  const provider = getProvider(creds.providerId);
  const baseUrl = (creds.baseUrl || provider.baseUrl).replace(/\/$/, "");
  const model = creds.model || provider.defaultModel;
  const kind: ProviderKind = provider.kind;

  if (!baseUrl && kind === "openai")
    throw new Error("Falta la URL base del proveedor personalizado.");
  if (!model) throw new Error("Falta indicar el modelo a usar.");

  if (kind === "anthropic") return callAnthropic(creds.apiKey, baseUrl, model, req);
  if (kind === "gemini") return callGemini(creds.apiKey, baseUrl, model, req);
  return callOpenAiCompatible(creds.apiKey, baseUrl, model, req);
}

// ── Anthropic (formato propio: system aparte, content[] de bloques) ──
async function callAnthropic(
  apiKey: string,
  baseUrl: string,
  model: string,
  req: AiRequest
): Promise<string> {
  const client = new Anthropic({ apiKey, baseURL: baseUrl || undefined });
  const msg = await client.messages.create({
    model,
    max_tokens: req.maxTokens,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// ── OpenAI-compatible (OpenAI, Groq, xAI, DeepSeek, OpenRouter, Mistral…) ──
async function callOpenAiCompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  req: AiRequest
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      ...(req.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(await describeHttpError(res));
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("El proveedor devolvió una respuesta vacía.");
  return text.trim();
}

// ── Google Gemini (systemInstruction + contents) ──
async function callGemini(
  apiKey: string,
  baseUrl: string,
  model: string,
  req: AiRequest
): Promise<string> {
  const url = `${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: [{ role: "user", parts: [{ text: req.user }] }],
      generationConfig: {
        maxOutputTokens: req.maxTokens,
        ...(req.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(await describeHttpError(res));
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map((p: { text?: string }) => p.text ?? "").join("")
    : "";
  if (!text) throw new Error("El proveedor devolvió una respuesta vacía.");
  return text.trim();
}

// Mensaje de error legible, sin filtrar la credencial.
async function describeHttpError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = await res.text();
    const parsed = JSON.parse(body);
    detail = parsed?.error?.message || parsed?.message || body.slice(0, 300);
  } catch {
    detail = "";
  }
  if (res.status === 401 || res.status === 403)
    return "La API key fue rechazada por el proveedor. Revisá que sea correcta y esté activa.";
  if (res.status === 404)
    return `El modelo indicado no existe en este proveedor. ${detail}`.trim();
  if (res.status === 429)
    return "Alcanzaste el límite de uso del proveedor. Esperá un momento y reintentá.";
  return `Error del proveedor (${res.status}). ${detail}`.trim();
}
