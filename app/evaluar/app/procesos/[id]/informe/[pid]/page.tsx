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
import IntegrityReport from "@/components/evaluar/IntegrityReport";
import { DIMENSIONES_INTEGRIDAD } from "@/lib/evaluar/integridad";
import { StatusChip } from "@/components/evaluar/ProcessEditor";
import { AiCandidateBrief } from "@/components/evaluar/AiAssist";

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
        <Link href="/evaluar/app/plan?plan=profesional" className="btn-primary press inline-flex mt-5">
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
  // Los factores de integridad se leen en su propia seccion, con bandas y no
  // con percentiles: mostrarlos tambien en el perfil general los volveria
  // rasgos comparables como cualquier otro, que es justo lo que no son.
  const clavesIntegridad = new Set<string>(
    DIMENSIONES_INTEGRIDAD.map((d) => d.key)
  );
  const dims = (report?.dimensions ?? []).filter(
    (d) => !clavesIntegridad.has(d.key)
  );
  const alertas = (report?.quality ?? []).filter((q) => q.severity === "alerta");

  const initials = (c.full_name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const etapa = Math.min(c.stage_index + 1, board.stages.length || 1);
  const terminado = !!c.completed_at;

  return (
    <div className="max-w-6xl mx-auto print:max-w-none">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/evaluar/app/procesos/${id}/tablero`} className="text-sm text-primary font-medium inline-flex items-center gap-1">
          ← Comparar y decidir
        </Link>
        <PrintButton />
      </div>

      {/* ── Cabecera: quién es y para qué se evaluó ── */}
      <header className="card p-6 mt-4 print:border-0 print:p-0">
        <div className="flex flex-wrap items-start gap-4">
          <span className="w-16 h-16 rounded-full bg-[#efedfb] text-[#5d5294] grid place-items-center text-xl font-bold shrink-0 print:hidden" aria-hidden>
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="ev-label">Informe de evaluación</p>
            <h1 className="text-[26px] font-semibold text-primary-dark leading-tight mt-0.5">{c.full_name || "Sin nombre"}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {board.process.title}
              {(board.process.org_unit || board.process.department) && (
                <> · {[board.process.org_unit, board.process.department].filter(Boolean).join(" · ")}</>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <StatusChip status={c.status} />
              <span className="chip bg-[#f3f1ee] text-slate-700">{c.source === "worka" ? "Postuló desde Worka Empleos" : "Invitado por la empresa"}</span>
              {c.city && <span className="chip bg-[#f3f1ee] text-slate-700">{c.city}</span>}
              {c.email && <span className="chip bg-[#f3f1ee] text-slate-700">{c.email}</span>}
              {c.phone && <span className="chip bg-[#f3f1ee] text-slate-700">{c.phone}</span>}
            </div>
          </div>
          <div className="text-right shrink-0 text-xs text-slate-500">
            <p className="font-semibold text-primary-dark text-sm">Worka Evaluar</p>
            {new Date().toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })}
            {board.process.manager_name && <p className="mt-1">Responsable: {board.process.manager_name}</p>}
          </div>
        </div>

        {/* Tres lecturas distintas, cada una con lo que mide. Antes se veían
            juntos un ajuste, un porcentaje y unos puntos sin explicar la
            relación, y se leían como el mismo número. */}
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-xl border border-[#c9d9ea] bg-[#f3f8fd] p-4">
            <p className="ev-label !text-[#004182]">Ajuste al puesto</p>
            <p className="text-[32px] font-semibold leading-none text-[#004182] mt-2 tabular-nums">{c.fit === null ? "—" : `${c.fit}%`}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {c.fit === null
                ? "Definí qué importa para el puesto en Ajustes › Qué importa en el puesto para calcularlo."
                : `Qué tanto se parece su perfil a lo que marcaste para el puesto (rindió ${c.fitCoverage.rendidos} de ${c.fitCoverage.pedidos} rasgos).`}
            </p>
          </div>
          <div className="rounded-xl border border-[#e0dfdc] bg-white p-4">
            <p className="ev-label">Pruebas objetivas</p>
            <p className="text-[32px] font-semibold leading-none text-primary-dark mt-2 tabular-nums">{c.percent === null ? "—" : `${c.percent}%`}</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {c.percent === null
                ? "Todavía sin preguntas que se corrijan solas."
                : `${c.score} de ${c.max_score} puntos en conocimientos, razonamiento y juicio situacional, sobre lo que rindió.`}
            </p>
          </div>
          <div className="rounded-xl border border-[#e0dfdc] bg-white p-4">
            <p className="ev-label">Avance</p>
            <p className="text-[32px] font-semibold leading-none text-primary-dark mt-2 tabular-nums">
              {etapa}
              <span className="text-lg text-slate-500"> de {board.stages.length}</span>
            </p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {terminado
                ? `Terminó el ${new Date(c.completed_at!).toLocaleDateString("es-PY")}${report?.minutes ? `, en ${report.minutes} minutos` : ""}.`
                : "Todavía está rindiendo."}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 mt-4 lg:grid-cols-[minmax(0,1fr)_320px] items-start print:block">
        {/* ── Evidencia ── */}
        <div className="space-y-4 min-w-0">
          {/* Calidad de la respuesta: antes que el perfil, porque si la persona
              contestó todo igual en cuarenta segundos los rasgos de abajo no
              describen a nadie. */}
          {report && report.quality.length > 0 && (
            <section className="card p-5 break-inside-avoid">
              <h2 className="font-semibold text-primary-dark">Calidad de la respuesta</h2>
              <p className="text-sm text-slate-500">Señales de que el perfil de abajo puede no ser confiable.</p>
              <div className="space-y-2 mt-3">
                {report.quality.map((q) => (
                  <div
                    key={q.kind}
                    className={`rounded-xl border px-3.5 py-2.5 ${q.severity === "alerta" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <p className="text-sm font-semibold text-primary-dark">{q.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{q.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {report && report.answered > 0 && report.quality.length === 0 && (
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <strong className="font-semibold">Respuesta consistente.</strong> Respondió {report.answered} de {report.total} preguntas
              {report.minutes ? ` en ${report.minutes} minutos` : ""}, sin señales de respuesta apurada, plana ni contradictoria.
            </p>
          )}

          {/* Integridad: factores que piden o no una repregunta, no rasgos. */}
          <IntegrityReport profile={c.profile} version={c.scoring_version ?? 1} />

          {dims.length > 0 && (
            <section className="card p-5 break-inside-avoid">
              <h2 className="font-semibold text-primary-dark">Perfil por rasgo</h2>
              <p className="text-sm text-slate-500">
                Describe estilos de trabajo, no capacidad: no hay perfiles buenos ni malos. El percentil compara contra el resto de las
                personas evaluadas en Worka Evaluar.
              </p>
              {/* La forma entera de un vistazo, con el perfil ideal encima. */}
              <ProfileRadar dimensions={dims} ideal={board.process.ideal_profile} />

              <div className="space-y-4 mt-5">
                {dims.map((d) => (
                  <div key={d.key} className="sm:flex sm:items-start sm:gap-5 break-inside-avoid">
                    <div className="sm:flex-1 min-w-0">
                      <div className="flex justify-between text-sm gap-3">
                        <span className="text-slate-700 font-medium">{d.label}</span>
                        <span className="text-slate-600 shrink-0 tabular-nums">{d.pct}%</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-[#ebe9e6] overflow-hidden mt-1">
                        <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${d.pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.alto ? d.high : d.low}</p>
                      {d.percentile === null && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Todavía no hay baremo para este rasgo: {d.sample} de las {MIN_MUESTRA} respuestas que hacen falta para comparar.
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 mt-2 sm:mt-0">
                      <PercentileBar d={d} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {report && report.videos.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold text-primary-dark">Respuestas en video</h2>
              <p className="text-sm text-slate-500">Grabadas por el candidato en su momento, sin coordinar agenda.</p>
              <div className="space-y-2.5 mt-3">
                {report.videos.map((v) => (
                  <VideoPlayback key={v.questionId} participantId={pid} questionId={v.questionId} text={v.text} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Contexto y decisión ── */}
        <aside className="space-y-4 min-w-0 print:mt-4">
          {c.status !== "invitado" && <AiCandidateBrief processId={id} participantId={pid} enabled={plan.ai} />}
          {c.cv_url && (
            <section className="card p-5">
              <h2 className="font-semibold text-primary-dark mb-2">CV</h2>
              <CvLink participantId={pid} />
            </section>
          )}

          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark">Notas del equipo</h2>
            {c.notes.length === 0 ? (
              <p className="text-sm text-slate-500 mt-1">Sin notas todavía. Se agregan desde Comparar y decidir.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {c.notes.map((n) => (
                  <li key={n.id} className="text-sm text-slate-700 border-l-2 border-[#c9d9ea] pl-3">
                    {n.body}
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString("es-PY")}
                      {n.rating ? ` · ${"★".repeat(n.rating)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {c.outcome_note && (
            <section className="card p-5">
              <h2 className="font-semibold text-primary-dark">Resolución</h2>
              <p className="text-sm text-slate-700 mt-1">{c.outcome_note}</p>
            </section>
          )}

          {/* Un informe que no se sabe leer se lee mal: lo más común es tomar
              el rasgo más alto como si fuera una nota. */}
          <section className="rounded-xl bg-[#f6f4f1] border border-[#e0dfdc] p-5 break-inside-avoid">
            <h2 className="font-semibold text-primary-dark text-sm">Cómo leer este informe</h2>
            <ul className="text-xs text-slate-700 mt-2 space-y-2 leading-relaxed">
              <li>
                <strong className="font-semibold">Ajuste al puesto</strong> compara el perfil con lo que pediste. Sale solo de los rasgos
                que rindió.
              </li>
              <li>
                <strong className="font-semibold">Pruebas objetivas</strong> es el % de puntos en preguntas con respuesta correcta. No mide
                personalidad.
              </li>
              <li>
                <strong className="font-semibold">El % de cada rasgo</strong> no es una nota: 30% en extraversión no es peor que 80%, es
                distinto. <strong className="font-semibold">El percentil</strong> compara contra el resto de los evaluados.
              </li>
              <li>
                En el gráfico, <strong className="font-semibold">la línea verde punteada</strong> es lo que pediste para el puesto.
              </li>
              <li>Nada de esto descarta a nadie por sí solo: entra a la conversación junto a la entrevista y la experiencia.</li>
            </ul>
          </section>
        </aside>
      </div>

      <p className="text-xs text-slate-500 mt-6 border-t border-[#e0dfdc] pt-3">
        Los resultados de este informe son una entrada más del proceso de selección y no deben usarse como único criterio de decisión. Los
        rasgos de personalidad describen estilos de trabajo, no aptitud.
        {alertas.length > 0 && (
          <>
            {" "}
            <strong className="text-amber-800 font-semibold">
              En este caso, además, el control de calidad marcó
              {alertas.length === 1 ? " una alerta" : ` ${alertas.length} alertas`}: conviene repreguntar en la entrevista antes de sacar
              conclusiones del perfil.
            </strong>
          </>
        )}
      </p>
    </div>
  );
}
