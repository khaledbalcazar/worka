"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import type { Ciclo, Desempeno } from "@/lib/evaluar/desempeno-tipos";
import { brechas, promedioDe } from "@/lib/evaluar/desempeno-tipos";

import {
  actualizarCiclo,
  agregarEvaluado,
  quitarEvaluado,
} from "@/app/evaluar/desempeno-actions";

type CicloDetalle = { ciclo: Ciclo; evaluaciones: Desempeno[] };

// Administración de un ciclo: quién se evalúa, quién evalúa, y los resultados.
export default function CicloEditor({ detalle }: { detalle: CicloDetalle }) {
  const router = useRouter();
  const { ciclo, evaluaciones } = detalle;
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [pending, startTransition] = useTransition();

  const [nombre, setNombre] = useState("");
  const [puesto, setPuesto] = useState("");
  const [area, setArea] = useState("");
  const [conduce, setConduce] = useState(false);
  const [evaluadorEmail, setEvaluadorEmail] = useState("");
  const [empleadoEmail, setEmpleadoEmail] = useState("");
  const [conAuto, setConAuto] = useState(true);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(r.error ?? "Ocurrió un error.");
    });
  }

  // Las evaluaciones se agrupan por persona: cada una puede tener la del jefe
  // y su autoevaluación, y compararlas es la lectura que más sirve.
  const personas = Array.from(
    evaluaciones.reduce((map, e) => {
      const lista = map.get(e.empleado_nombre) ?? [];
      lista.push(e);
      map.set(e.empleado_nombre, lista);
      return map;
    }, new Map<string, typeof evaluaciones>())
  );

  const enviadas = evaluaciones.filter((e) => e.status === "enviada").length;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-primary-dark">
              {ciclo.title}
            </h1>
            {ciclo.description && (
              <p className="text-sm text-slate-500 mt-0.5">
                {ciclo.description}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {evaluaciones.length === 0
                ? "Sin personas cargadas"
                : `${enviadas} de ${evaluaciones.length} evaluaciones enviadas`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`chip ${
                ciclo.status === "abierto"
                  ? "bg-emerald-50 text-emerald-700"
                  : ciclo.status === "cerrado"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {ciclo.status}
            </span>
            {ciclo.status === "borrador" && (
              <button
                onClick={() =>
                  run(() => actualizarCiclo(ciclo.id, { status: "abierto" }))
                }
                disabled={pending}
                className="btn-primary press text-sm disabled:opacity-40"
              >
                Abrir el ciclo
              </button>
            )}
            {ciclo.status === "abierto" && (
              <button
                onClick={() =>
                  run(() => actualizarCiclo(ciclo.id, { status: "cerrado" }))
                }
                disabled={pending}
                className="btn-secondary press text-sm"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {ciclo.status === "borrador" && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-3">
            Mientras esté en borrador, los jefes no ven nada. Cargá a la gente y
            después abrilo.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Alta de personas */}
      {ciclo.status !== "cerrado" &&
        (abierto ? (
          <div className="card p-5 space-y-3 animate-rise">
            <h2 className="font-semibold text-primary-dark text-sm">
              Agregar a alguien al ciclo
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre y apellido</label>
                <input
                  className="input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Puesto</label>
                <input
                  className="input"
                  placeholder="Ej: Cajera"
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Área</label>
                <input
                  className="input"
                  placeholder="Ej: Sucursal Centro"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email de quien la evalúa</label>
                <input
                  type="email"
                  className="input"
                  placeholder="jefe@empresa.com"
                  value={evaluadorEmail}
                  onChange={(e) => setEvaluadorEmail(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email de la persona (opcional)</label>
                <input
                  type="email"
                  className="input"
                  placeholder="empleado@empresa.com"
                  value={empleadoEmail}
                  onChange={(e) => setEmpleadoEmail(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Sin esto la persona no puede leer su evaluación ni
                  autoevaluarse. Se puede cargar después.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="text-sm text-slate-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={conduce}
                  onChange={(e) => setConduce(e.target.checked)}
                />
                Tiene gente a cargo
              </label>
              <label className="text-sm text-slate-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={conAuto}
                  onChange={(e) => setConAuto(e.target.checked)}
                />
                Que también se autoevalúe
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAbierto(false)}
                className="btn-secondary press flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  run(() =>
                    agregarEvaluado(ciclo.id, {
                      nombre,
                      puesto,
                      area,
                      conduce,
                      evaluadorEmail,
                      empleadoEmail,
                      conAuto,
                    })
                  );
                  setNombre("");
                  setPuesto("");
                  setEmpleadoEmail("");
                }}
                disabled={pending || !nombre.trim() || !evaluadorEmail.trim()}
                className="btn-primary press flex-[2] disabled:opacity-40"
              >
                Agregar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAbierto(true)}
            className="card press w-full p-4 flex items-center justify-center gap-2 text-sm font-medium text-primary border-dashed"
          >
            <Plus size={16} /> Agregar a alguien al ciclo
          </button>
        ))}

      {/* Las personas del ciclo */}
      {personas.map(([nombrePersona, lista]) => {
        const jefe = lista.find((e) => e.tipo === "jefe");
        const auto = lista.find((e) => e.tipo === "auto");
        const dif = jefe && auto ? brechas(jefe, auto, ciclo) : [];
        const promedioJefe = jefe ? promedioDe(jefe) : null;

        return (
          <div key={nombrePersona} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-primary-dark">
                  {nombrePersona}
                </p>
                <p className="text-xs text-slate-500">
                  {[jefe?.empleado_puesto, jefe?.empleado_area]
                    .filter(Boolean)
                    .join(" · ") || "Sin puesto cargado"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {promedioJefe !== null && (
                  <span className="chip bg-indigo-50 text-indigo-700">
                    {promedioJefe} / 5
                  </span>
                )}
                {ciclo.status !== "cerrado" && jefe && (
                  <button
                    onClick={() => run(() => quitarEvaluado(ciclo.id, jefe.id))}
                    disabled={pending}
                    title="Quitar del ciclo"
                    className="chip press bg-red-50 text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {lista.map((e) => (
                <span
                  key={e.id}
                  className={`chip ${
                    e.status === "enviada"
                      ? "bg-emerald-50 text-emerald-700"
                      : e.status === "en_curso"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {e.tipo === "auto" ? "Autoevaluación" : "Evaluación del jefe"}
                  {" · "}
                  {e.status === "enviada"
                    ? "enviada"
                    : e.status === "en_curso"
                      ? "a medio cargar"
                      : !e.evaluador_id
                        ? "esperando que se registre"
                        : "sin empezar"}
                </span>
              ))}
            </div>

            {lista.some((e) => !e.evaluador_id) && (
              <p className="text-[11px] text-amber-700 mt-2">
                Alguien de esta fila todavía no tiene cuenta en Worka. La
                evaluación le va a aparecer sola cuando entre con el correo que
                cargaste.
              </p>
            )}

            {/* Brechas entre cómo se ve y cómo la ven.
                Es la lectura más útil de una autoevaluación y casi ninguna
                plataforma la muestra: una brecha grande hacia arriba dice que
                la devolución no está llegando; una hacia abajo, que la persona
                se subestima y probablemente no pide lo que le corresponde. */}
            {dif.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs font-semibold text-primary-dark">
                  Dónde se ven distinto
                </p>
                <div className="space-y-1.5 mt-2">
                  {dif.slice(0, 4).map((b) => (
                    <div
                      key={b.key}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-700 truncate">{b.label}</span>
                      <span className="shrink-0 flex items-center gap-1.5">
                        <span className="text-slate-400">
                          jefe {b.jefe} · ella/él {b.auto}
                        </span>
                        {b.brecha !== 0 && (
                          <span
                            className={
                              b.brecha > 0 ? "text-amber-700" : "text-blue-700"
                            }
                          >
                            {b.brecha > 0 ? (
                              <TrendingUp size={13} />
                            ) : (
                              <TrendingDown size={13} />
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {dif[0] && Math.abs(dif[0].brecha) >= 2 && (
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Hay una diferencia de {Math.abs(dif[0].brecha)} puntos en{" "}
                    {dif[0].label.toLowerCase()}. Es el punto por donde conviene
                    empezar la conversación.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
