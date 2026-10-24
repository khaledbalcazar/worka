"use client";

import Link from "next/link";
import { BarChart3, LayoutDashboard, ListChecks, Settings2, Users } from "lucide-react";

// Pestañas de un proceso, las mismas en la página del proceso y en la de
// comparar y decidir. Antes el tablero de decisión era otra pantalla con otra
// cabecera, al que se llegaba por un botón suelto, y además había un segundo
// «tablero» dentro de Candidatos: dos lugares con el mismo nombre para cosas
// distintas. Ahora es una sola navegación: Resumen, Candidatos, Comparar y
// decidir, Etapas y Ajustes.

export type ProcessTabKey = "resumen" | "candidatos" | "decidir" | "etapas" | "ajustes";

export default function ProcessNav({
  processId,
  current,
  counts,
  esDueno,
  onSelect,
}: {
  processId: string;
  current: ProcessTabKey;
  counts: { candidatos: number; etapas: number };
  esDueno: boolean;
  // Dentro de la página del proceso las pestañas cambian sin navegar.
  onSelect?: (key: Exclude<ProcessTabKey, "decidir">) => void;
}) {
  const base = `/evaluar/app/procesos/${processId}`;
  const tabs: { key: ProcessTabKey; label: string; Icon: typeof Users; href: string }[] = [
    { key: "resumen", label: "Resumen", Icon: LayoutDashboard, href: `${base}?tab=resumen` },
    { key: "candidatos", label: `Candidatos (${counts.candidatos})`, Icon: Users, href: `${base}?tab=candidatos` },
    { key: "decidir", label: "Comparar y decidir", Icon: BarChart3, href: `${base}/tablero` },
    { key: "etapas", label: `Etapas (${counts.etapas})`, Icon: ListChecks, href: `${base}?tab=etapas` },
    ...(esDueno ? [{ key: "ajustes" as const, label: "Ajustes", Icon: Settings2, href: `${base}?tab=ajustes` }] : []),
  ];

  return (
    <nav className="ev-tabs" aria-label="Secciones del proceso">
      {tabs.map(({ key, label, Icon, href }) => {
        const active = key === current;
        const content = (
          <>
            <Icon size={16} />
            <span>{label}</span>
          </>
        );
        // «Comparar y decidir» siempre es otra página; el resto, si hay
        // onSelect, cambia la pestaña en el lugar.
        if (onSelect && key !== "decidir")
          return (
            <button
              key={key}
              type="button"
              className="ev-tab"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(key as Exclude<ProcessTabKey, "decidir">)}
            >
              {content}
            </button>
          );
        return (
          <Link key={key} href={href} className="ev-tab" aria-current={active ? "page" : undefined}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
