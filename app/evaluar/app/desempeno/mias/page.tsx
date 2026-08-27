import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getMiDesempeno, promedioDe } from "@/lib/evaluar/desempeno";
import { COMPETENCIAS_POR_KEY, NIVELES } from "@/lib/evaluar/competencias";
import AcuseDesempeno from "@/components/evaluar/AcuseDesempeno";

export const metadata = { title: "Mi evaluación", robots: { index: false } };

// Lo que ve la persona evaluada.
//
// Se muestra completa, con los mismos anclajes que usó quien la calificó. Una
// evaluación de la que solo se comunica el número deja a la persona sin saber
// qué tiene que hacer distinto, que es lo único para lo que sirve.
export default async function MiDesempenoPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp%2Fdesempeno%2Fmias");
  }

  const mias = await getMiDesempeno();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/evaluar/app/desempeno"
        className="text-sm text-primary font-medium flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Desempeño
      </Link>

      {mias.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-semibold text-primary-dark">
            Todavía no tenés ninguna evaluación
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando tu jefe termine y envíe la suya, la vas a poder leer acá.
          </p>
        </div>
      ) : (
        mias.map((m) => {
          const promedio = promedioDe(m);
          return (
            <div key={m.id} className="card p-6 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {m.ciclo?.title}
                </p>
                <h1 className="text-xl font-bold text-primary-dark mt-0.5">
                  Tu evaluación de desempeño
                </h1>
                {promedio !== null && (
                  <p className="text-sm text-slate-500 mt-1">
                    Promedio general: <strong>{promedio}</strong> de 5
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {Object.entries(m.puntajes ?? {}).map(([key, valor]) => {
                  const c = COMPETENCIAS_POR_KEY[key];
                  if (!c || typeof valor !== "number") return null;
                  return (
                    <div key={key} className="border-b border-slate-100 pb-3">
                      <div className="flex justify-between items-baseline gap-3">
                        <span className="font-medium text-slate-800">
                          {c.label}
                        </span>
                        <span className="chip bg-slate-100 text-slate-600 shrink-0">
                          {NIVELES[valor - 1]?.label}
                        </span>
                      </div>
                      {/* El anclaje exacto que eligió quien evaluó: es la
                          diferencia entre "te puse 3" y saber qué se vio. */}
                      <p className="text-sm text-slate-600 mt-1">
                        {c.anclajes[valor - 1]}
                      </p>
                      {m.comentarios?.[key] && (
                        <p className="text-sm text-slate-500 mt-1.5 border-l-2 border-slate-200 pl-3">
                          {m.comentarios[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {m.fortalezas && (
                <section>
                  <h2 className="font-semibold text-primary-dark text-sm">
                    Qué hacés bien
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{m.fortalezas}</p>
                </section>
              )}
              {m.a_mejorar && (
                <section>
                  <h2 className="font-semibold text-primary-dark text-sm">
                    Qué conviene mejorar
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{m.a_mejorar}</p>
                </section>
              )}
              {m.compromisos && (
                <section>
                  <h2 className="font-semibold text-primary-dark text-sm">
                    Compromisos para el próximo período
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{m.compromisos}</p>
                </section>
              )}

              <AcuseDesempeno
                id={m.id}
                acuseAt={m.acuse_at}
                comentario={m.acuse_comentario}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
