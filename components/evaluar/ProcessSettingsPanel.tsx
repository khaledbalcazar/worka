"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Building2, Copy, FileText, MoreHorizontal, Palette, SlidersHorizontal, Target, Users } from "lucide-react";
import type { ProcessDetail } from "@/lib/evaluar";
import { duplicateProcess, setProcessArchived } from "@/app/evaluar/actions";

// Ajustes de un proceso, por secciones.
//
// Antes eran cinco tarjetas apiladas, cada una con su «Guardar»: no se sabía
// qué botón guardaba qué, y bajar hasta el final para cambiar el mensaje de
// cierre era pasar por el perfil ideal y el diseño. Ahora hay un índice y se
// ve una sección a la vez, con un solo guardado a la vista. Las demás quedan
// montadas (ocultas): lo escrito en una sección no se pierde al pasar a otra.

export type SettingsSection = {
  key: string;
  label: string;
  hint: string;
  Icon: typeof Palette;
  node: React.ReactNode;
};

export const SECTION_ICONS = { FileText, Building2, Target, Palette, Users, SlidersHorizontal };

export default function ProcessSettingsPanel({ sections, detail }: { sections: SettingsSection[]; detail: ProcessDetail }) {
  const router = useRouter();
  const all: SettingsSection[] = [
    ...sections,
    {
      key: "acciones",
      label: "Más acciones",
      hint: "Duplicar o archivar",
      Icon: MoreHorizontal,
      node: <MoreActions detail={detail} onDone={(id) => (id ? router.push(`/evaluar/app/procesos/${id}`) : router.refresh())} />,
    },
  ];
  const [active, setActive] = useState(all[0].key);

  return (
    <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)] items-start">
      {/* Índice: en celular, chips que se deslizan; en escritorio, lista fija. */}
      <nav className="ev-set-nav" aria-label="Secciones de los ajustes">
        {all.map(({ key, label, hint, Icon }) => (
          <button key={key} type="button" className="ev-set-nav-item" aria-current={active === key ? "page" : undefined} onClick={() => setActive(key)}>
            <Icon size={17} />
            <span className="min-w-0">
              <span className="block">{label}</span>
              <span className="ev-set-nav-hint">{hint}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="min-w-0">
        {all.map(({ key, node }) => (
          <div key={key} hidden={active !== key}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

function MoreActions({ detail, onDone }: { detail: ProcessDetail; onDone: (newId?: string) => void }) {
  const { process } = detail;
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-primary-dark">Más acciones</h2>
        <p className="text-sm text-slate-500 mt-1">Ninguna borra candidatos ni resultados.</p>
      </div>
      {error && <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      <div className="divide-y divide-[#ebe9e6]">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-dark">Duplicar el proceso</p>
            <p className="text-xs text-slate-500">Crea uno nuevo con las mismas etapas y preguntas, sin candidatos.</p>
          </div>
          <button
            className="btn-secondary press text-sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const r = await duplicateProcess(process.id);
                if (r.ok) onDone(r.id);
                else setError(r.error ?? "No pudimos duplicar.");
              })
            }
          >
            <Copy size={15} /> Duplicar
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-dark">{process.archived ? "Sacar del archivo" : "Archivar"}</p>
            <p className="text-xs text-slate-500">
              {process.archived ? "Vuelve a aparecer en el inicio y en Procesos." : "Lo saca del inicio. Lo encontrás en Procesos › Archivados."}
            </p>
          </div>
          <button
            className="btn-secondary press text-sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const r = await setProcessArchived(process.id, !process.archived);
                if (r.ok) onDone();
                else setError(r.error ?? "No pudimos guardar.");
              })
            }
          >
            {process.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />} {process.archived ? "Desarchivar" : "Archivar"}
          </button>
        </div>
      </div>
    </div>
  );
}
