import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getBoardData } from "@/lib/evaluar";
import { etiquetaMotivo } from "@/lib/evaluar/motivos";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import { DIMENSIONES_INTEGRIDAD } from "@/lib/evaluar/integridad";
import { diasDesde, fechaLarga } from "@/lib/evaluar-access";
import PrintButton from "@/components/evaluar/PrintButton";

export const metadata = {
  title: "Acta de cierre",
  robots: { index: false, follow: false },
};

// Acta de cierre del concurso.
//
// Es el documento que queda cuando la búsqueda termina: quién se presentó, en
// qué orden quedaron, a quién se eligió y por qué se cayó el resto. Antes eso
// vivía repartido entre el tablero y la cabeza de quien lo llevó, y a los tres
// meses —cuando alguien pregunta por qué se eligió a esta persona— ya no
// estaba en ningún lado.
//
// Se imprime desde el navegador, igual que el informe individual: agregar una
// librería de PDF para generar dos hojas no se justifica, y así el acta se ve
// igual en pantalla y se puede copiar y pegar.
export default async function CierrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await getBoardData(id);
  if (!board) notFound();

  const { process, stages, candidates } = board;

  // El orden de mérito sale de lo que la empresa dijo que importa: si cargó un
  // perfil ideal manda el ajuste, si no, el desempeño. Ordenar por otra cosa
  // sería inventar un criterio que nadie eligió.
  const porAjuste = candidates.some((c) => c.fit !== null);
  const rendidos = candidates
    .filter((c) => c.percent !== null || c.fit !== null)
    .sort((a, b) =>
      porAjuste
        ? (b.fit ?? -1) - (a.fit ?? -1)
        : (b.percent ?? -1) - (a.percent ?? -1)
    );

  const contratados = candidates.filter((c) => c.status === "contratado");
  const finalistas = candidates.filter((c) => c.status === "finalista");
  const descartados = candidates.filter((c) => c.status === "descartado");

  const empezaron = candidates.filter((c) => c.status !== "invitado").length;
  const terminaron = candidates.filter((c) =>
    ["completado", "finalista", "contratado"].includes(c.status)
  ).length;

  // Por qué se cayó la gente, del motivo más frecuente al menos.
  const motivos = Object.entries(
    descartados.reduce<Record<string, number>>((acc, c) => {
      if (!c.reject_reason) return acc;
      acc[c.reject_reason] = (acc[c.reject_reason] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const clavesIntegridad = new Set<string>(
    DIMENSIONES_INTEGRIDAD.map((d) => d.key)
  );

  // Las dos leen el reloj, así que viven en un módulo aparte: hacerlo en el
  // cuerpo del componente da un resultado que cambia solo entre renders.
  const duracionDias = diasDesde(process.created_at);
  const hoy = fechaLarga();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 print:py-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/evaluar/app/procesos/${id}/tablero`}
          className="text-sm text-primary font-medium flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Volver al tablero
        </Link>
        <PrintButton />
      </div>

      <div className="card p-8 mt-4 print:border-0 print:shadow-none print:p-0">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Acta de cierre del concurso
            </p>
            <h1 className="text-2xl font-bold text-primary-dark mt-0.5">
              {process.title}
            </h1>
            {(process.org_unit || process.department) && (
              <p className="text-sm text-slate-500">
                {[process.org_unit, process.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {process.manager_name && (
              <p className="text-xs text-slate-400 mt-0.5">
                Responsable: {process.manager_name}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary-dark">Worka Evaluar</p>
            <p className="text-xs text-slate-400">{hoy}</p>
          </div>
        </div>

        {/* Resultado. Va primero porque es lo que se busca al abrir el acta. */}
        <section className="mt-6">
          <h2 className="font-bold text-primary-dark">Resultado</h2>
          {contratados.length > 0 ? (
            <div className="mt-2 space-y-2">
              {contratados.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                >
                  <p className="font-semibold text-emerald-900">
                    {c.full_name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    Seleccionado/a
                    {c.percent !== null ? ` · ${c.percent}% de desempeño` : ""}
                    {c.fit !== null ? ` · ${c.fit}% de ajuste al puesto` : ""}
                  </p>
                  {c.outcome_note && (
                    <p className="text-sm text-emerald-800 mt-1.5">
                      {c.outcome_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 mt-1">
              El concurso se cierra sin contratación.{" "}
              {finalistas.length > 0
                ? `Quedaron ${finalistas.length} finalistas sin resolver.`
                : "No hubo finalistas."}
            </p>
          )}
        </section>

        {/* Cómo se movió el embudo. */}
        <section className="mt-6">
          <h2 className="font-bold text-primary-dark">Cómo fue la búsqueda</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 mt-3 text-sm">
            {[
              ["Se presentaron", `${candidates.length}`],
              ["Empezaron", `${empezaron}`],
              ["Terminaron", `${terminaron}`],
              [
                "Tasa de finalización",
                candidates.length
                  ? `${Math.round((terminaron / candidates.length) * 100)}%`
                  : "—",
              ],
              ["Etapas", `${stages.length}`],
              ["Duración", `${duracionDias} días`],
              ["Finalistas", `${finalistas.length}`],
              ["Descartados", `${descartados.length}`],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-3 border-b border-slate-100 py-1.5"
              >
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-800 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Orden de mérito. Es lo que hace del acta un documento defendible:
            deja asentado el criterio y la posición de cada uno. */}
        {rendidos.length > 0 && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="font-bold text-primary-dark">Orden de mérito</h2>
            <p className="text-sm text-slate-500">
              Ordenado por{" "}
              {porAjuste ? "ajuste al perfil del puesto" : "desempeño en las pruebas"}
              , que es el criterio que se definió al armar el concurso.
            </p>
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-1.5 font-medium text-slate-500 w-8">#</th>
                  <th className="py-1.5 font-medium text-slate-500">Candidato</th>
                  <th className="py-1.5 font-medium text-slate-500 text-right">
                    {porAjuste ? "Ajuste" : "Desempeño"}
                  </th>
                  <th className="py-1.5 font-medium text-slate-500 text-right">
                    Resultado
                  </th>
                </tr>
              </thead>
              <tbody>
                {rendidos.map((c, i) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-400">{i + 1}</td>
                    <td className="py-1.5 text-slate-800">
                      {c.full_name || "Sin nombre"}
                    </td>
                    <td className="py-1.5 text-right text-slate-700 font-medium">
                      {porAjuste
                        ? c.fit !== null
                          ? `${c.fit}%`
                          : "—"
                        : c.percent !== null
                          ? `${c.percent}%`
                          : "—"}
                    </td>
                    <td className="py-1.5 text-right text-slate-500">
                      {c.status === "contratado"
                        ? "Seleccionado"
                        : c.status === "finalista"
                          ? "Finalista"
                          : c.status === "descartado"
                            ? (etiquetaMotivo(c.reject_reason) ?? "Descartado")
                            : "Completó"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Por qué se cayó la gente. Es lo que sirve para la próxima. */}
        {motivos.length > 0 && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="font-bold text-primary-dark">Motivos de descarte</h2>
            <div className="space-y-2 mt-3">
              {motivos.map(([key, cuenta]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm gap-3">
                    <span className="text-slate-700">{etiquetaMotivo(key)}</span>
                    <span className="text-slate-500 shrink-0">
                      {cuenta} de {descartados.length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{ width: `${(cuenta / descartados.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Qué se le tomó a la gente. Sin esto el acta no se puede auditar:
            los puntajes de arriba no significan nada si no consta sobre qué
            se midió. */}
        <section className="mt-6 break-inside-avoid">
          <h2 className="font-bold text-primary-dark">Qué se evaluó</h2>
          <ol className="mt-2 space-y-1.5">
            {stages.map((s, i) => (
              <li key={s.id} className="text-sm text-slate-700">
                <span className="text-slate-400">{i + 1}.</span> {s.title}
                <span className="text-slate-500">
                  {" — "}
                  {s.questions.length}{" "}
                  {s.questions.length === 1 ? "pregunta" : "preguntas"} ·{" "}
                  {s.minutes} min
                  {s.timed ? " · cronometrada" : ""}
                  {s.questions.some((q) =>
                    clavesIntegridad.has(q.dimension ?? "")
                  )
                    ? " · integridad"
                    : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Perfil buscado, si se definió. */}
        {process.ideal_profile &&
          Object.keys(process.ideal_profile).length > 0 && (
            <section className="mt-6 break-inside-avoid">
              <h2 className="font-bold text-primary-dark">
                Perfil buscado para el puesto
              </h2>
              <p className="text-sm text-slate-500">
                Lo que se definió como importante antes de empezar, y contra lo
                que se calculó el ajuste.
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {Object.entries(process.ideal_profile)
                  .filter(([, peso]) => peso > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, peso]) => (
                    <span key={key} className="chip bg-slate-100 text-slate-600">
                      {ALL_DIMENSIONS[key]?.label ?? key}
                      {" · "}
                      {"●".repeat(peso)}
                    </span>
                  ))}
              </div>
            </section>
          )}

        <p className="text-xs text-slate-400 mt-8 border-t border-slate-200 pt-3 leading-relaxed">
          Los resultados de este concurso son una entrada más del proceso de
          selección y no fueron el único criterio de decisión. Los rasgos de
          personalidad describen estilos de trabajo, no aptitud, y ningún
          resultado por sí solo descalifica a una persona. Documento generado
          por Worka Evaluar el {hoy}.
        </p>
      </div>
    </div>
  );
}
