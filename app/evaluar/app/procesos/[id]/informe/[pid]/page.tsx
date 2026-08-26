import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardData, getMyEvaluarAccess } from "@/lib/evaluar";
import { getCandidateReport, MIN_MUESTRA } from "@/lib/evaluar/report";
import { planOf } from "@/lib/evaluar-plans";
import PrintButton from "@/components/evaluar/PrintButton";
import VideoPlayback from "@/components/evaluar/VideoPlayback";
import CvLink from "@/components/evaluar/CvLink";
import ProfileRadar from "@/components/evaluar/ProfileRadar";
import PercentileBar from "@/components/evaluar/PercentileBar";

export const metadata = {
  title: "Informe del candidato",
  robots: { index: false, follow: false },
};

// Informe de un candidato, pensado para imprimir o guardar como PDF desde el
// navegador. Sin librería de PDF a propósito: agregar una dependencia pesada
// para generar una hoja no se justifica, y así el informe se ve igual que en
// pantalla y se puede copiar y pegar.
export default async function InformePage({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const [board, access] = await Promise.all([
    getBoardData(id),
    getMyEvaluarAccess(),
  ]);
  if (!board) notFound();

  const c = board.candidates.find((x) => x.id === pid);
  if (!c) notFound();

  const plan = planOf(access);
  // El informe detallado es del plan Profesional para arriba. Se corta acá y
  // no escondiendo el enlace: la URL se adivina sola.
  if (!plan.reports) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-primary-dark">
          El informe por candidato viene con el plan Profesional
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Incluye el perfil comparado contra el resto de los evaluados y el
          control de calidad de la respuesta. Tu plan actual es {plan.label}.
        </p>
        <Link href="/evaluar/precios" className="btn-primary press inline-flex mt-5">
          Ver planes
        </Link>
        <p className="mt-4">
          <Link
            href={`/evaluar/app/procesos/${id}/tablero`}
            className="text-sm text-primary font-medium"
          >
            ← Volver al tablero
          </Link>
        </p>
      </div>
    );
  }

  const report = await getCandidateReport(pid);
  const dims = report?.dimensions ?? [];
  const alertas = (report?.quality ?? []).filter((q) => q.severity === "alerta");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 print:py-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <a
          href={`/evaluar/app/procesos/${id}/tablero`}
          className="text-sm text-primary font-medium"
        >
          ← Volver al tablero
        </a>
        <PrintButton />
      </div>

      <div className="card p-8 mt-4 print:border-0 print:shadow-none print:p-0">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Informe de evaluación
            </p>
            <h1 className="text-2xl font-bold text-primary-dark mt-0.5">
              {c.full_name || "Sin nombre"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{board.process.title}</p>
            {/* Para qué área se llamó. Sin esto, el informe impreso llega a
                un escritorio que no participó de la búsqueda y no distingue
                dos concursos del mismo puesto. */}
            {(board.process.org_unit || board.process.department) && (
              <p className="text-sm text-slate-500">
                {[board.process.org_unit, board.process.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {board.process.manager_name && (
              <p className="text-xs text-slate-400 mt-0.5">
                Responsable: {board.process.manager_name}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary-dark">Worka Evaluar</p>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("es-PY", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Datos y resultado general */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-5 text-sm">
          {[
            ["Estado", c.status.replace("_", " ")],
            [
              "Origen",
              c.source === "worka" ? "Desde Worka Empleos" : "Invitado",
            ],
            ["Email", c.email || "—"],
            ["Teléfono", c.phone || "—"],
            [
              "Etapa alcanzada",
              `${Math.min(c.stage_index + 1, board.stages.length || 1)} de ${board.stages.length}`,
            ],
            [
              "Completado",
              c.completed_at
                ? new Date(c.completed_at).toLocaleDateString("es-PY")
                : "En curso",
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{k}</span>
              <span className="text-slate-800 font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* CV adjunto. Antes se subía y no aparecía en ningún lado. */}
        {c.cv_url && (
          <div className="mt-4">
            <CvLink participantId={pid} />
          </div>
        )}

        {/* Pruebas con vara objetiva */}
        {c.percent !== null && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">
              Resultado en pruebas objetivas
            </h2>
            <p className="text-sm text-slate-500">
              Conocimientos, razonamiento y juicio situacional.
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-primary-dark">
                {c.percent}%
              </span>
              <span className="text-sm text-slate-500">
                {c.score} de {c.max_score} puntos
              </span>
            </div>
          </section>
        )}

        {/* Calidad de la respuesta.
            Va ANTES del perfil a propósito: si la persona contestó todo igual
            en cuarenta segundos, los rasgos de abajo no describen a nadie, y
            enterarse después de haberlos leído es enterarse tarde. */}
        {report && report.quality.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">
              Calidad de la respuesta
            </h2>
            <p className="text-sm text-slate-500">
              Señales de que el perfil de abajo puede no ser confiable.
            </p>
            <div className="space-y-2 mt-3">
              {report.quality.map((q) => (
                <div
                  key={q.kind}
                  className={`rounded-xl border px-3.5 py-2.5 ${
                    q.severity === "alerta"
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-primary-dark">
                    {q.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{q.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {report && report.answered > 0 && report.quality.length === 0 && (
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mt-6">
            <strong className="font-semibold">Respuesta consistente.</strong>{" "}
            {report.answered} preguntas
            {report.minutes ? ` en ${report.minutes} minutos` : ""}, sin señales
            de respuesta apurada, plana ni contradictoria.
          </p>
        )}

        {/* Perfil por rasgo */}
        {dims.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">Perfil por rasgo</h2>
            <p className="text-sm text-slate-500">
              Describe estilos de trabajo, no capacidad: no hay perfiles buenos
              ni malos. El percentil compara contra el resto de las personas
              evaluadas en Worka Evaluar.
            </p>
            {/* La forma entera de un vistazo, antes del detalle rasgo por
                rasgo. Con el perfil ideal encima, la pregunta que importa
                deja de ser "cuánto sacó" y pasa a ser "cuánto se parece a lo
                que buscamos", que es la que se está tratando de contestar. */}
            <ProfileRadar
              dimensions={dims}
              ideal={board.process.ideal_profile}
            />

            <div className="space-y-4 mt-5">
              {dims.map((d) => (
                <div
                  key={d.key}
                  className="sm:flex sm:items-start sm:gap-5 break-inside-avoid"
                >
                  <div className="sm:flex-1 min-w-0">
                    <div className="flex justify-between text-sm gap-3">
                      <span className="text-slate-700 font-medium">
                        {d.label}
                      </span>
                      <span className="text-slate-500 shrink-0">{d.pct}%</span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {d.pct >= 60 ? d.high : d.low}
                    </p>
                    {d.percentile === null && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Todavía no hay baremo para este rasgo: {d.sample} de las{" "}
                        {MIN_MUESTRA} respuestas que hacen falta para comparar.
                      </p>
                    )}
                  </div>

                  {/* La campana con la marca: "percentil 85" no le dice nada
                      a quien no trabaja con estadística, y quien decide una
                      contratación casi nunca lo hace. */}
                  <div className="shrink-0 mt-2 sm:mt-0">
                    <PercentileBar d={d} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cómo leer esto. Un informe que no se sabe leer se lee mal: lo más
            común es tomar el rasgo más alto como si fuera una nota. */}
        {dims.length > 0 && (
          <section className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 break-inside-avoid">
            <h2 className="font-bold text-primary-dark text-sm">
              Cómo leer este informe
            </h2>
            <ul className="text-xs text-slate-600 mt-2 space-y-1.5 leading-relaxed">
              <li>
                <strong className="font-semibold">El porcentaje</strong> es
                cuánto marcó la persona en ese rasgo. No es una nota: 30% en
                extraversión no es peor que 80%, es distinto.
              </li>
              <li>
                <strong className="font-semibold">El percentil</strong> compara
                contra el resto de los evaluados. P85 significa que quedó por
                encima del 85% de ellos.
              </li>
              <li>
                <strong className="font-semibold">
                  La línea verde punteada
                </strong>{" "}
                del gráfico es lo que pediste para el puesto. Mientras más se
                superponga con la violeta, más se parece este candidato a lo que
                buscás.
              </li>
              <li>
                Un rasgo alto o bajo no descarta a nadie por sí solo. Esto entra
                a la conversación junto a la entrevista y la experiencia, nunca
                en lugar de ellas.
              </li>
            </ul>
          </section>
        )}

        {/* Entrevista asincrónica */}
        {report && report.videos.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">
              Respuestas en video
            </h2>
            <p className="text-sm text-slate-500">
              Grabadas por el candidato en su momento, sin coordinar agenda.
            </p>
            <div className="space-y-2.5 mt-3">
              {report.videos.map((v) => (
                <VideoPlayback
                  key={v.questionId}
                  participantId={pid}
                  questionId={v.questionId}
                  text={v.text}
                />
              ))}
            </div>
          </section>
        )}

        {/* Notas del equipo */}
        {c.notes.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">Notas del equipo</h2>
            <ul className="mt-2 space-y-2">
              {c.notes.map((n) => (
                <li
                  key={n.id}
                  className="text-sm text-slate-700 border-l-2 border-slate-200 pl-3"
                >
                  {n.body}
                  <span className="block text-xs text-slate-400 mt-0.5">
                    {new Date(n.created_at).toLocaleDateString("es-PY")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {c.outcome_note && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">Resolución</h2>
            <p className="text-sm text-slate-700 mt-1">{c.outcome_note}</p>
          </section>
        )}

        <p className="text-xs text-slate-400 mt-8 border-t border-slate-200 pt-3">
          Los resultados de este informe son una entrada más del proceso de
          selección y no deben usarse como único criterio de decisión. Los
          rasgos de personalidad describen estilos de trabajo, no aptitud.
          {alertas.length > 0 && (
            <>
              {" "}
              <strong className="text-amber-700 font-semibold">
                En este caso, además, el control de calidad marcó
                {alertas.length === 1 ? " una alerta" : ` ${alertas.length} alertas`}
                : conviene repreguntar en la entrevista antes de sacar
                conclusiones del perfil.
              </strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
