// Promoción de lanzamiento de Worka Enterprise Pro para empresas nuevas.
// Sin dependencias de servidor: la usan el popup, la página de la oferta, el
// registro y el canje.
//
// Reglas:
// - Solo empresas que se registran con el código (cuentas nuevas).
// - Se reclama hasta el 15/11/2026 inclusive, hora de Asunción.
// - Activa Enterprise Pro · Pro y Worka Evaluar · Profesional por 3 meses
//   desde el día del alta.

export const LAUNCH_PROMO = {
  code: "WORKA3PRO",
  plan: "pro" as const,
  months: 3,
  // También incluye Worka Evaluar en el plan Profesional por los mismos 3 meses.
  evaluarPlan: "profesional" as const,
  // Último instante para registrarse con el código (Paraguay, UTC-3).
  deadline: "2026-11-15T23:59:59-03:00",
  deadlineLabel: "15/11/2026",
};

export function normalizePromoCode(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isPromoOpen(now = Date.now()): boolean {
  return now <= Date.parse(LAUNCH_PROMO.deadline);
}

// ¿El código es el de la promo y todavía se puede usar en esa fecha?
export function isValidPromoCode(value: string | null | undefined, at = Date.now()): boolean {
  return normalizePromoCode(value) === LAUNCH_PROMO.code && isPromoOpen(at);
}

export function promoDaysLeft(now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(LAUNCH_PROMO.deadline) - now) / 86400000));
}
