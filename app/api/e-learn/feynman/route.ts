import { NextResponse } from "next/server";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { retrieveRelevant } from "@/lib/elearn/manual";
import { callAi, credentialsFromRequest } from "@/lib/elearn/aiProvider";

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

  const creds = credentialsFromRequest(req);
  if (!creds)
    return NextResponse.json(
      { error: "Configurá tu proveedor de IA y su API Key desde el panel del Tutor." },
      { status: 400 }
    );

  const { topic, explanation } = await req.json();
  if (!explanation?.trim())
    return NextResponse.json({ error: "Explicación vacía." }, { status: 400 });

  const grounding = retrieveRelevant(`${topic ?? ""} ${explanation}`);
  try {
    const text = await callAi(creds, {
      system:
        "Sos un evaluador docente experto para el Concurso del Registro del Estado Civil de Paraguay. Evaluás explicaciones con la Técnica Feynman: claridad, precisión jurídica (artículos, plazos, números) y errores. Devolvés únicamente un objeto JSON válido, sin texto adicional.",
      maxTokens: 1500,
      json: true,
      user: `Tema elegido: ${topic}
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
    });
    // Aísla el JSON por si viene con texto o backticks alrededor.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const json = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    return NextResponse.json(JSON.parse(json));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al evaluar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
