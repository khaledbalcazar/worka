import { COMPETENCIAS_POR_KEY, competenciasPara } from "./competencias";

// Tipos y calculos de evaluacion de desempeno.
//
// Viven aparte del acceso a datos porque la pantalla del ciclo los necesita
// del lado del cliente, y ese otro modulo es server-only: importarlo desde un
// componente "use client" arrastra codigo de servidor al navegador y la
// compilacion falla.

export type Ciclo = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  status: "borrador" | "abierto" | "cerrado";
  competencias: string[];
  opens_at: string | null;
  closes_at: string | null;
  created_at: string;
};

export type Desempeno = {
  id: string;
  ciclo_id: string;
  empleado_id: string | null;
  empleado_nombre: string;
  empleado_puesto: string;
  empleado_area: string;
  conduce: boolean;
  evaluador_id: string;
  tipo: "jefe" | "auto" | "par";
  status: "pendiente" | "en_curso" | "enviada";
  puntajes: Record<string, number>;
  comentarios: Record<string, string>;
  fortalezas: string;
  a_mejorar: string;
  compromisos: string;
  acuse_at: string | null;
  acuse_comentario: string;
  sent_at: string | null;
  created_at: string;
};

export type CicloRow = Ciclo & {
  total: number;
  enviadas: number;
};

// ── Lectura de resultados ──────────────────────────────────────

/** Promedio de una evaluación sobre las competencias que se calificaron. */
export function promedioDe(d: Desempeno): number | null {
  const valores = Object.values(d.puntajes ?? {}).filter(
    (v) => typeof v === "number" && v >= 1 && v <= 5
  );
  if (valores.length === 0) return null;
  return (
    Math.round(
      (valores.reduce((s, v) => s + v, 0) / valores.length) * 10
    ) / 10
  );
}

/** Qué competencias corresponden a una evaluación, ya resueltas. */
export function competenciasDe(ciclo: Ciclo, d: Desempeno) {
  const elegidas = ciclo.competencias?.length
    ? ciclo.competencias
        .map((k) => COMPETENCIAS_POR_KEY[k])
        .filter(Boolean)
    : competenciasPara(d.conduce);
  // Las de jefatura solo si la persona conduce, aunque el ciclo las incluya.
  return elegidas.filter((c) => d.conduce || !c.soloJefatura);
}

export type BrechaAuto = {
  key: string;
  label: string;
  jefe: number;
  auto: number;
  brecha: number;
};

// Diferencia entre cómo se ve la persona y cómo la ve su jefe.
//
// Es la lectura más útil de una autoevaluación y casi nadie la muestra. Una
// brecha grande hacia arriba dice que la devolución no está llegando; una
// hacia abajo, que la persona se subestima y probablemente no pide lo que le
// corresponde.
export function brechas(
  jefe: Desempeno | undefined,
  auto: Desempeno | undefined,
  ciclo: Ciclo
): BrechaAuto[] {
  if (!jefe || !auto) return [];
  return competenciasDe(ciclo, jefe)
    .map((c) => {
      const j = jefe.puntajes?.[c.key];
      const a = auto.puntajes?.[c.key];
      if (typeof j !== "number" || typeof a !== "number") return null;
      return { key: c.key, label: c.label, jefe: j, auto: a, brecha: a - j };
    })
    .filter((x): x is BrechaAuto => x !== null)
    .sort((a, b) => Math.abs(b.brecha) - Math.abs(a.brecha));
}
