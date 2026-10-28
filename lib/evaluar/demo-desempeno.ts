import type { Ciclo, CicloRow, Desempeno } from "./desempeno-tipos";

// Datos de ejemplo de evaluación de desempeño para el modo demo (sin base).
// Sin esto la sección arrancaba vacía y no había forma de revisar el ciclo,
// los enlaces ni el panorama. Los puntajes son fijos para que la vista no
// cambie en cada recarga. Nada de esto se guarda.

const DIA = 86_400_000;
const hace = (d: number) => new Date(Date.now() - d * DIA).toISOString();

const COMPETENCIAS = ["calidad", "responsabilidad", "equipo", "comunicacion", "cliente", "problemas", "conduccion"];

const ciclo: Ciclo = {
  id: "demo-ciclo",
  company_id: "demo",
  title: "Segundo semestre 2026",
  description: "Evaluación semestral de todo el equipo de sucursales.",
  status: "abierto",
  competencias: COMPETENCIAS,
  opens_at: hace(12),
  closes_at: new Date(Date.now() + 9 * DIA).toISOString(),
  created_at: hace(20),
};

const cerrado: Ciclo = {
  ...ciclo,
  id: "demo-ciclo-anterior",
  title: "Primer semestre 2026",
  status: "cerrado",
  opens_at: hace(190),
  closes_at: hace(160),
  created_at: hace(200),
};

// [nombre, puesto, área, conduce, jefe, estado jefe, puntajes jefe, estado auto, puntajes auto, acuse]
type Fila = [string, string, string, boolean, string, Desempeno["status"], number[], Desempeno["status"] | null, number[], boolean];
const GENTE: Fila[] = [
  ["Lucía Martínez", "Cajera", "Sucursal Centro", false, "jefa.centro@ejemplo.com", "enviada", [4, 5, 4, 4, 5, 4], "enviada", [4, 4, 4, 3, 5, 4], true],
  ["Rodrigo Páez", "Repositor", "Sucursal Centro", false, "jefa.centro@ejemplo.com", "enviada", [3, 3, 4, 2, 3, 3], "enviada", [4, 4, 4, 4, 4, 4], false],
  ["Ana Giménez", "Supervisora", "Sucursal Centro", true, "gerencia@ejemplo.com", "enviada", [5, 4, 5, 4, 4, 5, 4], "enviada", [4, 4, 4, 4, 4, 4, 3], true],
  ["Marcos Benítez", "Cajero", "Sucursal Luque", false, "jefe.luque@ejemplo.com", "enviada", [3, 4, 3, 3, 4, 3], null, [], false],
  ["Sofía Ramírez", "Atención al cliente", "Sucursal Luque", false, "jefe.luque@ejemplo.com", "en_curso", [4, 4, 0, 0, 0, 0], "enviada", [5, 5, 5, 4, 5, 4], false],
  ["Pablo González", "Depósito", "Sucursal Luque", false, "jefe.luque@ejemplo.com", "pendiente", [], "pendiente", [], false],
  ["Carla Duarte", "Cajera", "Sucursal San Lorenzo", false, "jefe.sanlorenzo@ejemplo.com", "pendiente", [], "en_curso", [3, 4, 0, 0, 0, 0], false],
  ["Jorge Villalba", "Encargado", "Sucursal San Lorenzo", true, "gerencia@ejemplo.com", "enviada", [2, 3, 2, 2, 3, 2, 2], "enviada", [4, 4, 4, 4, 4, 4, 4], false],
];

function puntajes(valores: number[], conduce: boolean): Record<string, number> {
  const keys = COMPETENCIAS.filter((k) => conduce || k !== "conduccion");
  return Object.fromEntries(keys.map((k, i) => [k, valores[i] ?? 0]).filter(([, v]) => (v as number) > 0));
}

function filas(c: Ciclo, todoEnviado: boolean): Desempeno[] {
  return GENTE.flatMap(([nombre, puesto, area, conduce, jefe, estJefe, pJefe, estAuto, pAuto, acuse], i) => {
    const email = `${nombre.split(" ")[0].toLowerCase()}@ejemplo.com`;
    const base = {
      ciclo_id: c.id,
      empleado_id: null,
      empleado_nombre: nombre,
      empleado_email: email,
      empleado_puesto: puesto,
      empleado_area: area,
      conduce,
      comentarios: {},
      fortalezas: "",
      a_mejorar: "",
      compromisos: "",
      acuse_comentario: "",
      created_at: c.created_at,
    };
    const jefeStatus = todoEnviado ? "enviada" : estJefe;
    const out: Desempeno[] = [
      {
        ...base,
        id: `${c.id}-j${i + 1}`,
        notificado_at: jefeStatus === "enviada" && (acuse || i % 2 === 0) ? hace(4) : null,
        evaluador_id: i % 3 === 0 ? null : `u-${i}`,
        evaluador_email: jefe,
        tipo: "jefe",
        status: jefeStatus,
        puntajes: puntajes(todoEnviado && pJefe.length === 0 ? [3, 3, 3, 3, 3, 3, 3] : pJefe, conduce),
        acuse_at: acuse || todoEnviado ? hace(3) : null,
        sent_at: jefeStatus === "enviada" ? hace(5) : null,
      },
    ];
    if (estAuto)
      out.push({
        ...base,
        id: `${c.id}-a${i + 1}`,
        notificado_at: null,
        evaluador_id: null,
        evaluador_email: email,
        tipo: "auto",
        status: todoEnviado ? "enviada" : estAuto,
        puntajes: puntajes(pAuto, conduce),
        acuse_at: null,
        sent_at: estAuto === "enviada" ? hace(6) : null,
      });
    return out;
  });
}

export function demoCiclos(): CicloRow[] {
  return [ciclo, cerrado].map((c) => {
    const ev = filas(c, c.status === "cerrado");
    return { ...c, total: ev.length, enviadas: ev.filter((e) => e.status === "enviada").length };
  });
}

export function demoCiclo(id: string): { ciclo: Ciclo; evaluaciones: Desempeno[] } | null {
  const c = [ciclo, cerrado].find((x) => x.id === id);
  return c ? { ciclo: c, evaluaciones: filas(c, c.status === "cerrado") } : null;
}
