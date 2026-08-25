"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createProcess } from "@/app/evaluar/actions";

// Alta de un proceso. El enlace con la vacante se ofrece acá mismo porque es
// el diferencial: dejarlo para "configuración avanzada" sería esconderlo.
export default function NewProcess({
  jobs,
}: {
  jobs: { id: string; title: string; linked: boolean }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const free = jobs.filter((j) => !j.linked);

  function crear() {
    setError(null);
    startTransition(async () => {
      const result = await createProcess({
        title,
        description,
        job_id: jobId || null,
      });
      if (result.ok && result.id) {
        setOpen(false);
        router.push(`/evaluar/app/procesos/${result.id}`);
      } else setError(result.error ?? "No pudimos crear el proceso.");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary press">
        <Plus size={16} /> Nuevo proceso
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto animate-rise">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-primary-dark">Nuevo proceso</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="w-9 h-9 grid place-items-center rounded-full text-slate-400 press"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mt-4">
          <div>
            <label className="label">Nombre del proceso</label>
            <input
              className="input"
              placeholder="Ej: Cajero/a — sucursal Centro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Qué evalúa (opcional)</label>
            <textarea
              className="input min-h-20"
              placeholder="Breve descripción para el candidato."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Enlazar con una vacante de Worka</label>
            {free.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                No tenés vacantes activas sin proceso. Podés crear el proceso
                igual y enlazarlo después.
              </p>
            ) : (
              <>
                <select
                  className="input"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                >
                  <option value="">Sin enlazar por ahora</option>
                  {free.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Quien vea ese aviso en Worka va a poder empezar la evaluación
                  desde ahí.
                </p>
              </>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={crear}
            disabled={pending || !title.trim()}
            className="btn-primary press w-full"
          >
            {pending ? "Creando…" : "Crear proceso"}
          </button>
        </div>
      </div>
    </div>
  );
}
