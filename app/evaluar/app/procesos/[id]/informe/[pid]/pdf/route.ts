import { createElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getBoardData, getMyEvaluarAccess } from "@/lib/evaluar";
import { getCandidateReport, MIN_MUESTRA } from "@/lib/evaluar/report";
import { DIMENSIONES_INTEGRIDAD, leerIntegridad } from "@/lib/evaluar/integridad";
import { planOf } from "@/lib/evaluar-plans";
import { construirInforme } from "@/lib/evaluar/pdf/modelo";
import InformePdf from "@/lib/evaluar/pdf/InformePdf";

// Descarga del informe de un candidato como PDF propio.
//
// Antes el PDF era «Imprimir» del navegador: salía la página con su menú, el
// Copilot, la URL interna y la fecha del navegador en cada hoja. Acá se arma
// un documento aparte desde los datos, con la misma lectura de permisos que
// la pantalla (las políticas de la base cortan por empresa y proceso).
//
// Nada sale a servicios externos: las fuentes viven en el repositorio y los
// gráficos se dibujan en vector dentro del propio PDF.

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;

  const user = isLive() ? await getCurrentUser() : null;
  if (isLive() && !user) return new Response("Iniciá sesión para descargar el informe.", { status: 401 });

  // Lectura con la sesión de quien pide: si no es su proceso, vuelve vacío.
  const [board, access] = await Promise.all([getBoardData(id), getMyEvaluarAccess()]);
  const c = board?.candidates.find((x) => x.id === pid);
  if (!board || !c) return new Response("No encontramos este informe.", { status: 404 });

  if (!planOf(access).reports)
    return new Response("El informe por candidato viene con el plan Profesional.", { status: 403 });

  const report = await getCandidateReport(pid);
  const claves = new Set<string>(DIMENSIONES_INTEGRIDAD.map((d) => d.key));
  const integ = leerIntegridad(c.profile, c.scoring_version ?? 1);

  const modelo = construirInforme({
    ahora: new Date(),
    zonaHoraria: "America/Asuncion",
    esDueno: board.esDueno,
    proceso: {
      title: board.process.title,
      org_unit: board.process.org_unit,
      department: board.process.department,
      manager_name: board.process.manager_name,
      ideal_profile: board.process.ideal_profile,
      totalEtapas: board.stages.length,
    },
    candidato: {
      full_name: c.full_name,
      status: c.status,
      source: c.source,
      city: c.city ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      stage_index: c.stage_index,
      completed_at: c.completed_at ?? null,
      score: c.score,
      max_score: c.max_score,
      fit: c.fit,
      fitCoverage: c.fitCoverage,
      cv_url: c.cv_url ?? null,
      outcome_note: c.outcome_note ?? null,
      notes: c.notes,
    },
    informe: report
      ? {
          rasgos: report.dimensions
            .filter((d) => !claves.has(d.key))
            .map((d) => ({
              key: d.key,
              label: d.label,
              pct: d.pct,
              high: d.high,
              low: d.low,
              alto: d.alto,
              percentile: d.percentile,
              sample: d.sample,
            })),
          calidad: report.quality,
          respondidas: report.answered,
          entregadas: report.total,
          minutos: report.minutes,
          videos: report.videos.length,
        }
      : null,
    integridad: integ,
    muestraMinima: MIN_MUESTRA,
  });

  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(createElement(InformePdf, { m: modelo }) as unknown as ReactElement<DocumentProps>);
  } catch (e) {
    console.error("[evaluar:pdf] no se pudo generar", { participante: pid, error: e instanceof Error ? e.message : String(e) });
    return new Response("No pudimos generar el PDF. Probá de nuevo en un momento.", { status: 500 });
  }

  // Registro del evento con identificadores técnicos, sin contenido.
  console.info("[evaluar:pdf] exportado", { usuario: user?.id ?? "demo", proceso: id, participante: pid });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // Nombre neutro: sin el nombre ni datos de la persona.
      "Content-Disposition": `attachment; filename="informe-evaluacion-${pid.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
