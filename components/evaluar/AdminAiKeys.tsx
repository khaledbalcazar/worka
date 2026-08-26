"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Power, Trash2, Zap } from "lucide-react";
import type { AiKeyRow } from "@/lib/evaluar";
import {
  addAiKey,
  deleteAiKey,
  setAiKeyActive,
  testAiKeys,
} from "@/app/evaluar/actions";

// Claves de IA del asistente de Worka Evaluar.
//
// Se cargan varias a propósito: las cuentas gratuitas de Groq tienen tope por
// minuto, y con una sola el asistente se cae justo cuando dos empresas lo usan
// a la vez. El servidor rota entre las activas usando siempre la más
// descansada, y la que devuelve error de cuota se marca sola y vuelve a la
// rueda diez minutos después.
//
// La clave se muestra enmascarada: acá hay que poder distinguir cuál es cuál,
// no volver a leerla entera.
export default function AdminAiKeys({ keys }: { keys: AiKeyRow[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(
    fn: () => Promise<{ ok: boolean; error?: string; detalle?: string }>,
    exito?: string
  ) {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.error ?? "Ocurrió un error.");
        return;
      }
      setAviso(r.detalle ?? exito ?? null);
      router.refresh();
    });
  }

  const activas = keys.filter((k) => k.active).length;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-primary-dark flex items-center gap-2">
            <Bot size={18} /> Asistente de IA
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {keys.length === 0
              ? "Sin claves cargadas: el asistente está apagado para todas las empresas."
              : `${activas} de ${keys.length} claves activas. Se usa siempre la que hace más rato que no se toca.`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {keys.length > 0 && (
            <button
              onClick={() => run(testAiKeys)}
              disabled={pending}
              className="btn-secondary press text-sm disabled:opacity-50"
              title="Hace una consulta real contra la API"
            >
              <Zap size={15} /> Probar
            </button>
          )}
          <button
            onClick={() => setAbierto((v) => !v)}
            className="btn-primary press text-sm"
          >
            <Plus size={15} /> Agregar
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      {aviso && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
          {aviso}
        </p>
      )}

      {abierto && (
        <div className="border border-slate-200 rounded-2xl p-4 space-y-3 animate-rise">
          <div>
            <label className="label">Nombre para reconocerla</label>
            <input
              className="input"
              placeholder="Ej: Groq cuenta 1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Clave de Groq</label>
            <input
              type="password"
              className="input font-mono"
              placeholder="gsk_…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Se saca de console.groq.com → API Keys. Queda guardada en la base
              y solo la lee el servidor: nunca viaja al navegador de nadie.
            </p>
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
                run(
                  () => addAiKey({ provider: "groq", label, apiKey }),
                  "Clave guardada."
                );
                setLabel("");
                setApiKey("");
                setAbierto(false);
              }}
              disabled={pending || apiKey.trim().length < 20}
              className="btn-primary press flex-[2] disabled:opacity-40"
            >
              Guardar clave
            </button>
          </div>
        </div>
      )}

      {keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                k.active ? "border-slate-200" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary-dark truncate">
                  {k.label || "Sin nombre"}{" "}
                  <span className="font-mono text-xs text-slate-400">
                    {k.masked}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {k.active ? "Activa" : "Apagada"}
                  {k.last_used_at &&
                    ` · usada ${new Date(k.last_used_at).toLocaleString("es-PY", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </p>
                {/* El motivo exacto del rechazo: sin esto, una clave vencida y
                    una que se paso de cuota se ven igual. */}
                {k.fail_reason && (
                  <p className="text-[11px] text-amber-700 mt-0.5 break-all">
                    Último rechazo: {k.fail_reason}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    run(() => setAiKeyActive(k.id, !k.active))
                  }
                  disabled={pending}
                  title={k.active ? "Apagar" : "Encender"}
                  className={`chip press ${
                    k.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Power size={13} />
                </button>
                <button
                  onClick={() => run(() => deleteAiKey(k.id))}
                  disabled={pending}
                  title="Borrar"
                  className="chip press bg-red-50 text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
