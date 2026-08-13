import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { retrieveRelevant } from "@/lib/elearn/manual";

export const runtime = "nodejs";
export const maxDuration = 60;

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

export async function POST(req: Request) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const clientKey = req.headers.get("x-anthropic-api-key")?.trim();
  const apiKey = clientKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Falta configurar una Anthropic API Key (propia o del servidor)." },
      { status: 400 }
    );

  const { topic, explanation } = await req.json();
  if (!explanation?.trim())
    return NextResponse.json({ error: "Explicación vacía." }, { status: 400 });

  const grounding = retrieveRelevant(`${topic ?? ""} ${explanation}`);
  const client = new Anthropic({ apiKey });
  try {
    const msg = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1500,
      output_config: { effort: "medium" },
      system:
        "Sos un evaluador docente experto para el Concurso del Registro del Estado Civil de Paraguay. Evaluás explicaciones con la Técnica Feynman: claridad, precisión jurídica (artículos, plazos, números) y errores. Devolvés únicamente un objeto JSON válido, sin texto adicional.",
      messages: [
        {
          role: "user",
          content: `Tema elegido: ${topic}
Explicación del estudiante: "${explanation}"

Pasajes del Manual para contrastar la exactitud:
${grounding || "(usar criterio general del temario)"}

Devolvé EXACTAMENTE este JSON (sin markdown, sin backticks):
{
  "score": <entero 1 a 10>,
  "clarity": "<evaluación de la claridad>",
  "correctLegalTerms": ["<término o artículo bien mencionado>"],
  "missingOrGaps": ["<concepto, plazo o número que faltó o es erróneo>"],
  "feedback": "<recomendación práctica para la prueba escrita y la entrevista oral>"
}`,
        },
      ],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    // Aísla el JSON por si viene con texto alrededor.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const json = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    return NextResponse.json(JSON.parse(json));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al evaluar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
