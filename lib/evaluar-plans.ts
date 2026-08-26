// Qué habilita cada plan de Worka Evaluar.
//
// Vive aparte y sin imports de servidor porque lo necesitan las dos puntas:
// las acciones, para cortar de verdad, y el panel, para avisar antes de que
// el usuario choque contra el límite. Un límite que solo se aplica del lado
// del servidor se siente como una falla; uno que solo se dibuja en pantalla
// no es un límite.
//
// La página de precios se lee de acá abajo: si cambia una promesa, se cambia
// en este archivo y las dos puntas quedan iguales.

import type { AccessState } from "@/lib/evaluar-access";

export type PlanKey = "esencial" | "profesional" | "corporativo";

export type PlanLimits = {
  key: PlanKey;
  label: string;
  /** Procesos publicados a la vez. null = sin límite. */
  activeProcesses: number | null;
  /** Invitar pegando una lista de hasta 200. */
  bulkInvite: boolean;
  /** Sumar gente del equipo a un proceso. */
  team: boolean;
  /** Informe por candidato y exportación a Excel. */
  reports: boolean;
  /** Asistente de IA: armar pruebas a medida del puesto. */
  ai: boolean;
};

export const PLANS: Record<PlanKey, PlanLimits> = {
  esencial: {
    key: "esencial",
    label: "Esencial",
    activeProcesses: 3,
    bulkInvite: false,
    team: false,
    reports: false,
    ai: false,
  },
  profesional: {
    key: "profesional",
    label: "Profesional",
    activeProcesses: null,
    bulkInvite: true,
    team: true,
    reports: true,
    ai: true,
  },
  corporativo: {
    key: "corporativo",
    label: "Corporativo",
    activeProcesses: null,
    bulkInvite: true,
    team: true,
    reports: true,
    ai: true,
  },
};

// Durante la prueba se abre todo. Está prometido así en las preguntas
// frecuentes ("15 días de acceso completo, sin restricciones"), y además es lo
// que conviene: quien no probó el informe por candidato ni la invitación
// masiva no tiene motivo para pagar el plan que los incluye.
export const TRIAL_PLAN: PlanKey = "profesional";

export function planOf(access: AccessState): PlanLimits {
  if (!access.active) return PLANS.esencial;
  if (access.inTrial) return PLANS[TRIAL_PLAN];
  const key = access.account?.plan as PlanKey | undefined;
  return (key && PLANS[key]) || PLANS.esencial;
}

// El texto que ve la empresa cuando se topa con el límite. Dice qué plan lo
// resuelve: un "no podés" sin salida es una pared.
export function upgradeMessage(what: string, plan: PlanLimits): string {
  return `${what} está disponible desde el plan Profesional. Tu plan actual es ${plan.label}.`;
}
