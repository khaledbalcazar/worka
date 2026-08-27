"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { generateStageWithAi } from "@/app/evaluar/actions";

// Armar una prueba a medida del puesto, describiéndolo en criollo.
//
// Es lo que destraba el momento donde más gente abandona: armar el proceso
// desde cero. El catálogo cubre los puestos más buscados del país, pero quien
// contrata un tornero o un analista de laboratorio se quedaba sin nada y con
// una pantalla en blanco.
//
// Lo que sale es un borrador: se crea la etapa en el proceso y queda para
// revisar y editar como cualquier otra. Nunca se publica sola.
const EJEMPLOS = [
  "Cajero de supermercado: manejo de efectivo, vuelto y qué hacer ante faltantes de caja",
  "Chofer de reparto: normas de tránsito, carga y trato con el cliente en la puerta",
  "Auxiliar de depósito: control de stock, lectura de remitos y seguridad al levantar peso",
];

export default function AiStageGenerator({
  processId,
  canUse,
  planLabel,
  bare,
}: {
  processId: string;
  canUse: boolean;
  planLabel: string;
  /** Sin tarjeta ni titulo propio: ya vive dentro de otra. */
  bare?: boolean;
}) {
  const router = useRouter();
  const [pedido, setPedido] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canUse) {
    return (
      <div className={bare ? "" : "card p-5"}>
        {!bare && (
          <h3 className="font-semibold text-primary-dark text-sm flex items-center gap-2">
            <Bot size={16} /> Armar una prueba con el asistente
          </h3>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Le contás qué puesto es y te arma la prueba de conocimientos, lista
          para revisar. Viene con el plan Profesional; el tuyo es {planLabel}.
        </p>
        <Link
          href="/evaluar/precios"
          className="btn-secondary press text-sm mt-3 inline-flex"
        >
          Ver planes
        </Link>
      </div>
    );
  }

  function generar(texto: string) {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const r = await generateStageWithAi(processId, texto);
      if (!r.ok) {
        setError(r.error ?? "No pudimos armar la prueba.");
        return;
      }
      setPedido("");
      setAviso(
        `Listo: ${r.added} preguntas. Quedó como borrador — revisalas antes de publicar, el asistente se equivoca.`
      );
      router.refresh();
    });
  }

  return (
    <div className={bare ? "" : "card p-5"}>
      {!bare && (
        <h3 className="font-semibold text-primary-dark text-sm flex items-center gap-2">
          <Bot size={16} /> Armar una prueba con el asistente
        </h3>
      )}
      <p className="text-xs text-slate-500 mb-3">
        Contale qué puesto es y qué te importa que sepan. Te deja la prueba
        armada como borrador, para que la revises y la edites.
      </p>

      <textarea
        className="input min-h-20"
        placeholder="Ej: cajero de farmacia; quiero saber si maneja vuelto, si entiende recetas y cómo reacciona ante un cliente apurado"
        value={pedido}
        onChange={(e) => setPedido(e.target.value)}
        disabled={pending}
      />

      <div className="flex flex-wrap gap-1.5 mt-2">
        {EJEMPLOS.map((e) => (
          <button
            key={e}
            onClick={() => setPedido(e)}
            disabled={pending}
            className="chip press bg-slate-100 text-slate-600 text-left"
          >
            {e.split(":")[0]}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-3.5 py-2.5 mt-3">
          {error}
        </p>
      )}
      {aviso && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mt-3">
          {aviso}
        </p>
      )}

      <button
        onClick={() => generar(pedido)}
        disabled={pending || pedido.trim().length < 10}
        className="btn-primary press text-sm mt-3 disabled:opacity-40"
      >
        <Sparkles size={15} />
        {pending ? "Armando la prueba…" : "Armar la prueba"}
      </button>

      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
        Nunca pide edad, sexo, religión, estado civil, hijos ni salud: además de
        discriminatorio, no predice desempeño. Revisá siempre lo que sale — la
        responsabilidad de lo que se le toma al candidato sigue siendo tuya.
      </p>
    </div>
  );
}
