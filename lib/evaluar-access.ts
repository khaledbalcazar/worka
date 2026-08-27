// Estado de la suscripción, resuelto contra el reloj.
//
// Vive aparte de lib/evaluar.ts porque el backoffice lo necesita desde un
// componente cliente, y ese módulo importa el cliente de servidor de Supabase
// (next/headers): traerlo al navegador rompe la compilación.

export type EvaluarStatus = "prueba" | "activa" | "vencida" | "cancelada";

export type EvaluarAccount = {
  company_id: string;
  status: EvaluarStatus;
  plan: string;
  price_gs: number;
  trial_ends_at: string;
  paid_until: string | null;
  created_at: string;
};

export type AccessState = {
  account: EvaluarAccount | null;
  active: boolean;
  inTrial: boolean;
  daysLeft: number;
};

// Una cuenta guardada como "prueba" con la fecha vencida no habilita nada.
// Preguntarlo pantalla por pantalla es la forma de que se cuele un acceso
// gratis para siempre, así que se resuelve en un solo lugar.
export function resolveAccess(account: EvaluarAccount | null): AccessState {
  if (!account) {
    return { account: null, active: false, inTrial: false, daysLeft: 0 };
  }

  const now = Date.now();
  const trialEnd = new Date(account.trial_ends_at).getTime();
  const paidEnd = account.paid_until
    ? new Date(account.paid_until).getTime()
    : 0;

  const inTrial = account.status === "prueba" && trialEnd > now;
  const paid = account.status === "activa" && paidEnd > now;
  const daysLeft = Math.max(
    0,
    Math.ceil(((inTrial ? trialEnd : paidEnd) - now) / 86_400_000)
  );

  return { account, active: inTrial || paid, inTrial, daysLeft };
}

// ¿Venció el plazo de la evaluación? Se resuelve del lado del servidor: la
// hora del navegador la pone el usuario y podría adelantarla para seguir
// respondiendo después del cierre.
export function isPastDeadline(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

// Días transcurridos desde una fecha.
//
// Vive acá y no en la pantalla por el mismo motivo que isPastDeadline: leer
// el reloj dentro del cuerpo de un componente da un resultado que cambia solo
// entre renders, y React lo marca como impureza. En un archivo aparte es una
// función común y corriente.
export function diasDesde(fecha: string): number {
  const inicio = new Date(fecha).getTime();
  if (!Number.isFinite(inicio)) return 0;
  return Math.max(1, Math.round((Date.now() - inicio) / 86_400_000));
}

/** La fecha de hoy ya escrita, para encabezados de documentos. */
export function fechaLarga(): string {
  return new Date().toLocaleDateString("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
