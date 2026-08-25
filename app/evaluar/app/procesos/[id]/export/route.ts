import { getBoardData } from "@/lib/evaluar";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";

// Exportación del proceso a CSV. RRHH trabaja en planillas: pelear contra eso
// es perder, así que se les da el archivo que van a usar igual.
//
// getBoardData ya filtra por empresa dueña, así que nadie puede exportar un
// proceso ajeno cambiando el id en la URL.
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Excel en español separa por punto y coma; se escapan comillas duplicando.
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const board = await getBoardData(id);
  if (!board) {
    return new Response("No encontrado", { status: 404 });
  }

  // Las columnas de rasgos salen de lo que realmente midió este proceso.
  const dims = [
    ...new Set(board.candidates.flatMap((c) => Object.keys(c.profile))),
  ];

  const header = [
    "Nombre",
    "Email",
    "Teléfono",
    "Origen",
    "Estado",
    "Puntaje",
    "Máximo",
    "Porcentaje",
    "Etapa",
    "Invitado",
    "Completado",
    ...dims.map((d) => ALL_DIMENSIONS[d]?.label ?? d),
    "Notas del equipo",
  ];

  const rows = board.candidates.map((c) => [
    c.full_name,
    c.email ?? "",
    c.phone ?? "",
    c.source === "worka" ? "Desde Worka" : "Invitado",
    c.status,
    c.score ?? "",
    c.max_score ?? "",
    c.percent !== null ? `${c.percent}%` : "",
    `${Math.min(c.stage_index + 1, board.stages.length || 1)} de ${board.stages.length}`,
    new Date(c.created_at).toLocaleDateString("es-PY"),
    c.completed_at ? new Date(c.completed_at).toLocaleDateString("es-PY") : "",
    ...dims.map((d) => {
      const v = c.profile[d];
      return v && v.max > 0 ? `${Math.round((v.raw / v.max) * 100)}%` : "";
    }),
    c.notes.map((n) => n.body).join(" | "),
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map(csvCell).join(";"))
    .join("\r\n");

  const slug = board.process.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

  return new Response(
    // BOM al principio: sin esto Excel abre los acentos como símbolos raros.
    "﻿" + csv,
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="worka-evaluar-${slug || "proceso"}.csv"`,
        "Cache-Control": "no-store",
      },
    }
  );
}
