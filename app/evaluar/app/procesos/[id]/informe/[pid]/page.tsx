import { notFound } from "next/navigation";
import { getBoardData } from "@/lib/evaluar";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import PrintButton from "@/components/evaluar/PrintButton";

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
  const board = await getBoardData(id);
  if (!board) notFound();

  const c = board.candidates.find((x) => x.id === pid);
  if (!c) notFound();

  const dims = Object.entries(c.profile);

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

        {/* Perfil por rasgo */}
        {dims.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-primary-dark">Perfil por rasgo</h2>
            <p className="text-sm text-slate-500">
              Describe estilos de trabajo, no capacidad: no hay perfiles buenos
              ni malos.
            </p>
            <div className="space-y-2.5 mt-3">
              {dims.map(([key, v]) => {
                const pct = v.max > 0 ? Math.round((v.raw / v.max) * 100) : 0;
                const dim = ALL_DIMENSIONS[key];
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {dim?.label ?? key}
                      </span>
                      <span className="text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {dim && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {pct >= 60 ? dim.high : dim.low}
                      </p>
                    )}
                  </div>
                );
              })}
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
        </p>
      </div>
    </div>
  );
}
