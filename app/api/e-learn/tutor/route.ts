import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { retrieveRelevant } from "@/lib/elearn/manual";

export const runtime = "nodejs";
export const maxDuration = 60;

// Solo el admin puede usar el aula (módulo oculto, personal).
async function ensureAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // modo demo local
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

const SYSTEM = `Sos el Tutor Virtual Docente del "Manual de Estudio Explicado desde Cero" para el Concurso Público del Registro del Estado Civil de Paraguay (DGREC / Ministerio de Justicia, Concurso MJRC-CPIEP-08-2026).
Tu objetivo es explicar los temas con total claridad jurídica y didáctica en español (y frases en guaraní cuando aplique).
Respondé SIEMPRE apoyándote en el texto del manual que se te da como contexto; si el manual no cubre algo, decilo y respondé con criterio jurídico general.
Estructurá tus respuestas así cuando sea oportuno:
1. En palabras simples.
2. La norma y los números/plazos clave a memorizar (citá el artículo).
3. Ejemplo práctico del mostrador de atención al público.

Normativa del temario: Constitución Nacional 1992; Ley 7445/2025 (Función Pública); Ley 5282/2014 (Acceso a la Información); Ley 1266/1987 (Registro del Estado Civil); Decretos 19.102/2002 y 3080/2015; Código Civil (Ley 1183/1985); Ley 1/1992; Ley 6618/2020; Resolución Ministerial 983/2017; Guaraní básico; Ofimática.`;

export async function POST(req: Request) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  // La key propia del usuario (guardada en su navegador) tiene prioridad
  // sobre la del servidor. Nunca se persiste: se usa solo para esta llamada.
  const clientKey = req.headers.get("x-anthropic-api-key")?.trim();
  const apiKey = clientKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Falta configurar una Anthropic API Key (propia o del servidor)." },
      { status: 400 }
    );

  const { prompt, context } = await req.json();
  if (!prompt?.trim())
    return NextResponse.json({ error: "Consulta vacía." }, { status: 400 });

  const grounding = retrieveRelevant(`${context ?? ""} ${prompt}`);
  const client = new Anthropic({ apiKey });
  try {
    const msg = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2000,
      output_config: { effort: "medium" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Tema actual: ${context || "General"}

Pasajes relevantes del Manual de Estudio:
${grounding || "(sin coincidencias directas; respondé con criterio general del temario)"}

Consulta del estudiante: ${prompt}`,
        },
      ],
    });
    const answer = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error con la IA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
