import { getBoardData, getMyEvaluarAccess } from "@/lib/evaluar";
import { planOf, upgradeMessage } from "@/lib/evaluar-plans";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import { csvCell } from "@/lib/evaluar/puntaje";

// Exportación del proceso a CSV. RRHH trabaja en planillas: pelear contra eso
// es perder, así que se les da el archivo que van a usar igual.
//
// getBoardData lee con la sesión y la RLS corta: exporta la empresa dueña y
// también quien fue sumado al equipo del proceso (ver hallazgo EV-15 en
// docs/auditoria-evaluar). Nadie ajeno exporta cambiando el id en la URL.
//
// La celda (comillas, punto y coma y fórmulas neutralizadas) sale de
// lib/evaluar/puntaje.ts, que tiene sus pruebas.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // La exportación a Excel es del plan Profesional para arriba (decisión
  // D-5, igual que el informe por candidato). Se corta acá y no solo
  // escondiendo el botón: la URL se arma sola.
  const plan = planOf(await getMyEvaluarAccess());
  if (!plan.reports) {
    return new Response(upgradeMessage("La exportación a Excel", plan), {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const board = await getBoardData(id);
  if (!board) {
    return new Response("No encontrado", { status: 404 });
  }

  // Las columnas de rasgos salen de lo que realmente midió este proceso.
  const dims = [
    ...new Set(board.candidates.flatMap((c) => Object.keys(c.profile))),
  ];

  // Email y teléfono son datos personales: los exporta solo la empresa
  // dueña del proceso. La gente del equipo los ve en pantalla para trabajar,
  // pero no se los lleva en un archivo (decisión D-5).
  const conContacto = board.esDueno;

  const header = [
    "Nombre",
    ...(conContacto ? ["Email", "Teléfono"] : []),
    "Origen",
    "Estado",
    "Puntaje",
    "Máximo",
    "Porcentaje",
    "Etapa",
    "Invitado",
    "Completado",
    // Con la 054 conviven dos escalas de rasgos: 1 (1-5) y 2 (0-4).
    "Escala de rasgos",
    ...dims.map((d) => ALL_DIMENSIONS[d]?.label ?? d),
    "Notas del equipo",
  ];

  const rows = board.candidates.map((c) => [
    c.full_name,
    ...(conContacto ? [c.email ?? "", c.phone ?? ""] : []),
    c.source === "worka" ? "Desde Worka" : "Invitado",
    c.status,
    c.score ?? "",
    c.max_score ?? "",
    c.percent !== null ? `${c.percent}%` : "",
    `${Math.min(c.stage_index + 1, board.stages.length || 1)} de ${board.stages.length}`,
    new Date(c.created_at).toLocaleDateString("es-PY"),
    c.completed_at ? new Date(c.completed_at).toLocaleDateString("es-PY") : "",
    (c.scoring_version ?? 1) >= 2 ? "0 a 4" : "1 a 5",
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
