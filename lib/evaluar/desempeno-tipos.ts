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
  empleado_email: string;
  /** Cuando se le aviso por correo que ya puede leerla. */
  notificado_at: string | null;
  empleado_puesto: string;
  empleado_area: string;
  conduce: boolean;
  evaluador_id: string | null;
  /** A quien se le asigno, aunque todavia no tenga cuenta. */
  evaluador_email: string;
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

// ── Panorama del ciclo ─────────────────────────────────────────

export type Panorama = {
  personas: number;
  jefe: { total: number; enviadas: number; enCurso: number; pendientes: number };
  auto: { total: number; enviadas: number };
  avisadas: number;
  acuses: number;
  /** Promedio general de las evaluaciones del jefe ya enviadas. */
  promedio: number | null;
  porCompetencia: { key: string; label: string; promedio: number; n: number }[];
  /** Cuántas personas quedan en cada nivel (promedio redondeado). */
  distribucion: { nivel: number; label: string; personas: number }[];
  porArea: { area: string; promedio: number | null; personas: number; enviadas: number }[];
  brechas: { persona: string; competencia: string; jefe: number; auto: number; brecha: number }[];
  faltan: { id: string; persona: string; tipo: Desempeno["tipo"]; status: Desempeno["status"]; evaluador: string }[];
};

const NIVEL_LABEL = ["", "Muy por debajo", "Por debajo", "En lo esperado", "Por encima", "Sobresaliente"];
const redondeo = (n: number) => Math.round(n * 10) / 10;

// Lo que RRHH quiere ver de un vistazo: cuánto falta, cómo salió el equipo,
// en qué competencias está más flojo y dónde la gente se ve distinta de cómo
// la ven. Solo cuenta evaluaciones enviadas: un borrador a medio cargar no
// es un resultado.
export function panorama(ciclo: Ciclo, evaluaciones: Desempeno[]): Panorama {
  const jefes = evaluaciones.filter((e) => e.tipo === "jefe");
  const autos = evaluaciones.filter((e) => e.tipo === "auto");
  const jefesEnviadas = jefes.filter((e) => e.status === "enviada");

  const promedios = jefesEnviadas.map(promedioDe).filter((x): x is number => x !== null);

  const acumulado = new Map<string, { label: string; suma: number; n: number }>();
  for (const e of jefesEnviadas) {
    for (const c of competenciasDe(ciclo, e)) {
      const v = e.puntajes?.[c.key];
      if (typeof v !== "number" || v < 1) continue;
      const a = acumulado.get(c.key) ?? { label: c.label, suma: 0, n: 0 };
      a.suma += v;
      a.n += 1;
      acumulado.set(c.key, a);
    }
  }

  const areas = new Map<string, Desempeno[]>();
  for (const e of jefes) {
    const area = e.empleado_area?.trim() || "Sin área";
    areas.set(area, [...(areas.get(area) ?? []), e]);
  }

  const brechasTodas: Panorama["brechas"] = [];
  for (const j of jefesEnviadas) {
    const a = autos.find((x) => x.empleado_nombre === j.empleado_nombre && x.status === "enviada");
    for (const b of brechas(j, a, ciclo)) {
      if (b.brecha !== 0) brechasTodas.push({ persona: j.empleado_nombre, competencia: b.label, jefe: b.jefe, auto: b.auto, brecha: b.brecha });
    }
  }

  return {
    personas: new Set(evaluaciones.map((e) => e.empleado_nombre)).size,
    jefe: {
      total: jefes.length,
      enviadas: jefesEnviadas.length,
      enCurso: jefes.filter((e) => e.status === "en_curso").length,
      pendientes: jefes.filter((e) => e.status === "pendiente").length,
    },
    auto: { total: autos.length, enviadas: autos.filter((e) => e.status === "enviada").length },
    avisadas: jefesEnviadas.filter((e) => e.notificado_at).length,
    acuses: jefesEnviadas.filter((e) => e.acuse_at).length,
    promedio: promedios.length ? redondeo(promedios.reduce((s, x) => s + x, 0) / promedios.length) : null,
    porCompetencia: [...acumulado.entries()]
      .map(([key, a]) => ({ key, label: a.label, promedio: redondeo(a.suma / a.n), n: a.n }))
      .sort((x, y) => y.promedio - x.promedio),
    distribucion: [1, 2, 3, 4, 5].map((nivel) => ({
      nivel,
      label: NIVEL_LABEL[nivel],
      personas: promedios.filter((p) => Math.min(5, Math.max(1, Math.round(p))) === nivel).length,
    })),
    porArea: [...areas.entries()]
      .map(([area, lista]) => {
        const ps = lista.filter((e) => e.status === "enviada").map(promedioDe).filter((x): x is number => x !== null);
        return {
          area,
          personas: lista.length,
          enviadas: lista.filter((e) => e.status === "enviada").length,
          promedio: ps.length ? redondeo(ps.reduce((s, x) => s + x, 0) / ps.length) : null,
        };
      })
      .sort((x, y) => (y.promedio ?? -1) - (x.promedio ?? -1)),
    brechas: brechasTodas.sort((x, y) => Math.abs(y.brecha) - Math.abs(x.brecha)).slice(0, 6),
    faltan: evaluaciones
      .filter((e) => e.status !== "enviada")
      .map((e) => ({ id: e.id, persona: e.empleado_nombre, tipo: e.tipo, status: e.status, evaluador: e.evaluador_email }))
      .sort((x, y) => (x.status === "pendiente" ? 0 : 1) - (y.status === "pendiente" ? 0 : 1) || x.persona.localeCompare(y.persona)),
  };
}
