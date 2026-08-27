"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Send } from "lucide-react";
import type { Competencia } from "@/lib/evaluar/competencias";
import { NIVELES } from "@/lib/evaluar/competencias";
import {
  enviarDesempeno,
  guardarDesempeno,
} from "@/app/evaluar/desempeno-actions";

// Carga de una evaluación de desempeño.
//
// La diferencia con cualquier planilla de estrellas está en los anclajes: el
// evaluador no elige un número sino la descripción que más se parece a lo que
// vio. Eso recorta dos sesgos conocidos —la indulgencia y el efecto halo— y
// deja algo concreto sobre lo que conversar después, que es para lo que sirve
// todo esto.
//
// Los cinco textos están siempre a la vista, no escondidos en un tooltip.
// Un anclaje que hay que ir a buscar no se lee, y sin leerlo el evaluador
// vuelve a poner el número que tenía en la cabeza.
export default function DesempenoForm({
  id,
  competencias,
  inicial,
  soloLectura,
  evaluado,
}: {
  id: string;
  competencias: Competencia[];
  inicial: {
    puntajes: Record<string, number>;
    comentarios: Record<string, string>;
    fortalezas: string;
    a_mejorar: string;
    compromisos: string;
  };
  soloLectura?: boolean;
  evaluado: string;
}) {
  const router = useRouter();
  const [puntajes, setPuntajes] = useState(inicial.puntajes ?? {});
  const [comentarios, setComentarios] = useState(inicial.comentarios ?? {});
  const [fortalezas, setFortalezas] = useState(inicial.fortalezas ?? "");
  const [aMejorar, setAMejorar] = useState(inicial.a_mejorar ?? "");
  const [compromisos, setCompromisos] = useState(inicial.compromisos ?? "");
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const faltan = competencias.filter((c) => !puntajes[c.key]).length;

  // Se guarda al vuelo. Una evaluación de desempeño se completa en varias
  // sentadas, entre reuniones: perder lo cargado por cerrar la pestaña es la
  // forma más segura de que nadie la vuelva a abrir.
  function guardar(cambios: Partial<typeof inicial>) {
    setGuardado(false);
    void guardarDesempeno(id, cambios).then((r) => {
      if (r.ok) setGuardado(true);
    });
  }

  function calificar(key: string, valor: number) {
    const next = { ...puntajes, [key]: valor };
    setPuntajes(next);
    guardar({ puntajes: next });
  }

  function enviar() {
    setError(null);
    startTransition(async () => {
      const r = await enviarDesempeno(
        id,
        competencias.map((c) => c.key)
      );
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos enviarla.");
    });
  }

  return (
    <div className="space-y-4">
      {competencias.map((c) => {
        const valor = puntajes[c.key];
        return (
          <div key={c.key} className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-primary-dark">{c.label}</h3>
              {valor && (
                <span className="chip bg-emerald-50 text-emerald-700">
                  {NIVELES[valor - 1].label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{c.resumen}</p>

            {/* Los cinco anclajes, siempre visibles. */}
            <div className="space-y-1.5 mt-3">
              {c.anclajes.map((texto, i) => {
                const nivel = i + 1;
                const elegido = valor === nivel;
                return (
                  <button
                    key={nivel}
                    disabled={soloLectura}
                    onClick={() => calificar(c.key, nivel)}
                    className={`w-full text-left flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                      elegido
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    } ${soloLectura ? "cursor-default" : "press"}`}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded-full grid place-items-center text-[11px] font-bold mt-0.5 ${
                        elegido
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {nivel}
                    </span>
                    <span
                      className={`text-sm ${
                        elegido ? "text-primary-dark font-medium" : "text-slate-600"
                      }`}
                    >
                      {texto}
                    </span>
                  </button>
                );
              })}
            </div>

            <textarea
              className="input text-sm min-h-16 mt-2.5"
              placeholder="Un ejemplo concreto de algo que pasó (opcional, pero es lo que hace útil la devolución)"
              value={comentarios[c.key] ?? ""}
              disabled={soloLectura}
              onChange={(e) => {
                const next = { ...comentarios, [c.key]: e.target.value };
                setComentarios(next);
              }}
              onBlur={() => guardar({ comentarios })}
            />
          </div>
        );
      })}

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-primary-dark">
          Para la conversación
        </h3>
        <div>
          <label className="label">Qué hace bien</label>
          <textarea
            className="input min-h-20"
            placeholder={`Lo que ${evaluado.split(" ")[0]} aporta y conviene que siga haciendo`}
            value={fortalezas}
            disabled={soloLectura}
            onChange={(e) => setFortalezas(e.target.value)}
            onBlur={() => guardar({ fortalezas })}
          />
        </div>
        <div>
          <label className="label">Qué conviene que mejore</label>
          <textarea
            className="input min-h-20"
            placeholder="En conducta observable, no en adjetivos: «avisar antes cuando algo se atrasa»"
            value={aMejorar}
            disabled={soloLectura}
            onChange={(e) => setAMejorar(e.target.value)}
            onBlur={() => guardar({ a_mejorar: aMejorar })}
          />
        </div>
        <div>
          <label className="label">Compromisos para el próximo período</label>
          <textarea
            className="input min-h-20"
            placeholder="Lo que se acuerda entre los dos. Es lo que se va a revisar la próxima vez."
            value={compromisos}
            disabled={soloLectura}
            onChange={(e) => setCompromisos(e.target.value)}
            onBlur={() => guardar({ compromisos })}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!soloLectura && (
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {guardado && (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check size={13} /> Guardado
              </span>
            )}
            {faltan > 0 &&
              `Faltan ${faltan} ${faltan === 1 ? "competencia" : "competencias"} por calificar.`}
          </p>
          <button
            onClick={enviar}
            disabled={pending || faltan > 0}
            title={
              faltan > 0
                ? "Calificá todas las competencias antes de enviar"
                : "Al enviarla, la persona evaluada puede leerla"
            }
            className="btn-primary press disabled:opacity-40"
          >
            <Send size={15} />
            {pending ? "Enviando…" : "Enviar la evaluación"}
          </button>
        </div>
      )}

      {!soloLectura && (
        <p className="text-xs text-slate-400 leading-relaxed">
          Al enviarla, la persona evaluada la puede leer y dejar su comentario.
          Después de eso no se modifica: si algo quedó mal, se conversa y se
          registra en el próximo ciclo.
        </p>
      )}
    </div>
  );
}
