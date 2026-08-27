"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { COMPETENCIAS } from "@/lib/evaluar/competencias";
import { crearCiclo } from "@/app/evaluar/desempeno-actions";

// Armar un ciclo de evaluación.
//
// Vienen todas las competencias marcadas menos las de jefatura, que se suman
// solas a quien conduce gente. Es el arranque más probable, y desmarcar lo que
// sobra cuesta menos que elegir diez de cero frente a una lista en blanco.
export default function NuevoCiclo() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [title, setTitle] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [elegidas, setElegidas] = useState<string[]>(
    COMPETENCIAS.filter((c) => !c.soloJefatura).map((c) => c.key)
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function crear() {
    setError(null);
    startTransition(async () => {
      const r = await crearCiclo({
        title,
        description: descripcion,
        competencias: elegidas,
      });
      if (r.ok && r.id) {
        setAbierto(false);
        setTitle("");
        router.push(`/evaluar/app/desempeno/${r.id}`);
      } else setError(r.error ?? "No pudimos crear el ciclo.");
    });
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="btn-primary press">
        <Plus size={16} /> Nuevo ciclo
      </button>
    );
  }

  return (
    <div className="card p-5 w-full space-y-3 animate-rise">
      <div>
        <label className="label">Nombre del ciclo</label>
        <input
          className="input"
          placeholder="Primer semestre 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-1">
          Que diga el período: es lo que después permite comparar a la misma
          persona consigo misma.
        </p>
      </div>

      <div>
        <label className="label">Para qué se hace (opcional)</label>
        <input
          className="input"
          placeholder="Ej: revisión anual de todo el personal de sucursales"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Qué se evalúa</label>
        <div className="grid sm:grid-cols-2 gap-1.5 mt-1">
          {COMPETENCIAS.map((c) => {
            const marcada = elegidas.includes(c.key);
            return (
              <label
                key={c.key}
                className={`flex items-start gap-2 text-sm rounded-xl border px-3 py-2 cursor-pointer ${
                  marcada ? "border-primary bg-primary/5" : "border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                  checked={marcada}
                  onChange={() =>
                    setElegidas((prev) =>
                      marcada
                        ? prev.filter((k) => k !== c.key)
                        : [...prev, c.key]
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block text-slate-700">{c.label}</span>
                  <span className="block text-[11px] text-slate-400">
                    {c.soloJefatura ? "Solo para quien conduce gente" : c.resumen}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Menos es mejor. Con doce competencias el evaluador se cansa a la
          cuarta y el resto lo completa de memoria.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setAbierto(false)}
          className="btn-secondary press flex-1"
        >
          Cancelar
        </button>
        <button
          onClick={crear}
          disabled={pending || !title.trim() || elegidas.length === 0}
          className="btn-primary press flex-[2] disabled:opacity-40"
        >
          {pending ? "Creando…" : "Crear ciclo"}
        </button>
      </div>
    </div>
  );
}
