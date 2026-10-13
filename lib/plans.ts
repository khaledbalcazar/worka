// Planes pagos de Worka. Sin dependencias de React ni de Supabase: lo usan
// el servidor, las pantallas y los tests.
//
// - Worka Enterprise Pro (empresas): planes Gratis, Pro y Empresa.
// - Worka Pro (personas): un solo plan.
//
// Los precios por defecto viven acá; el admin los cambia desde /admin
// (site_settings) sin tocar código. El cobro es manual: link de pago +
// aprobación del admin.

import { formatMoney, fromGuaranies, type Money } from "@/lib/currency";

export type Product = "enterprise" | "pro";
export type EnterprisePlanId = "gratis" | "pro" | "empresa";
export type ProPlanId = "pro";

export type EnterpriseLimits = {
  // null = sin límite
  maxListedJobs: number | null;
  jobValidityDays: number;
  boostsPerMonth: number;
  boostDays: number;
  urgentAlertsPerMonth: number;
  talentSearch: boolean;
  team: boolean;
  brandedPage: boolean;
  autoRenew: boolean;
  digestPriority: boolean;
};

export type EnterprisePlan = {
  id: EnterprisePlanId;
  name: string;
  tagline: string;
  defaultPriceGs: number;
  limits: EnterpriseLimits;
  features: string[];
};

export const ENTERPRISE_BRAND = "Worka Enterprise Pro";
export const PRO_BRAND = "Worka Pro";

export const ENTERPRISE_PLANS: EnterprisePlan[] = [
  {
    id: "gratis",
    name: "Gratis",
    tagline: "Para empezar a contratar",
    defaultPriceGs: 0,
    limits: {
      maxListedJobs: 3,
      jobValidityDays: 30,
      boostsPerMonth: 0,
      boostDays: 0,
      urgentAlertsPerMonth: 0,
      talentSearch: false,
      team: false,
      brandedPage: false,
      autoRenew: false,
      digestPriority: false,
    },
    features: [
      "Hasta 3 vacantes publicadas a la vez",
      "Vigencia de 30 días por vacante",
      "Tablero de candidatos y mensajes",
      "Preguntas de filtro",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para empresas que contratan todos los meses",
    defaultPriceGs: 250_000,
    limits: {
      maxListedJobs: null,
      jobValidityDays: 60,
      boostsPerMonth: 2,
      boostDays: 7,
      urgentAlertsPerMonth: 2,
      talentSearch: true,
      team: false,
      brandedPage: false,
      autoRenew: true,
      digestPriority: true,
    },
    features: [
      "Vacantes publicadas sin límite",
      "Vigencia de 60 días y renovación automática",
      "2 vacantes destacadas por mes (7 días cada una)",
      "2 alertas urgentes por mes a candidatos compatibles",
      "Búsqueda de talento",
      "Prioridad en el correo semanal a candidatos",
    ],
  },
  {
    id: "empresa",
    name: "Empresa",
    tagline: "Equipos de selección y marca empleadora",
    defaultPriceGs: 590_000,
    limits: {
      maxListedJobs: null,
      jobValidityDays: 60,
      boostsPerMonth: 5,
      boostDays: 7,
      urgentAlertsPerMonth: 5,
      talentSearch: true,
      team: true,
      brandedPage: true,
      autoRenew: true,
      digestPriority: true,
    },
    features: [
      "Todo lo del plan Pro",
      "5 vacantes destacadas y 5 alertas urgentes por mes",
      "Equipo de selección con varios usuarios",
      "Página de empresa con tu marca: color, cultura, beneficios y video",
    ],
  },
];

export const WORKA_PRO = {
  id: "pro" as ProPlanId,
  name: PRO_BRAND,
  tagline: "Más información y herramientas para conseguir trabajo antes",
  defaultPriceGs: 29_000,
  limits: {
    cvReviewsPerMonth: 5,
    interviewSessionsPerMonth: 10,
  },
  features: [
    "Quién vio tu perfil y tu CV",
    "Cuántos se postularon y cuándo la empresa vio tu postulación",
    "Alertas al instante cuando se publica una vacante para vos",
    "Plantillas de CV premium",
    "Estadísticas de tu búsqueda",
    "Revisión de tu CV con IA (5 por mes)",
    "Simulador de entrevistas con IA (10 por mes)",
    "Cursos premium con certificado verificable",
    "Perfil destacado en la búsqueda de talento",
  ],
};

// Lo que siempre es gratis para las personas (se muestra en /pro).
export const ALWAYS_FREE_FOR_PEOPLE = [
  "Postularte a todas las vacantes",
  "Tu CV en PDF con 3 plantillas",
  "Alertas diarias por correo",
  "Mensajes con las empresas",
  "Verificación de identidad",
];

export const BILLING_OPTIONS = [
  { months: 1, label: "1 mes", paidMonths: 1 },
  { months: 3, label: "3 meses", paidMonths: 3 },
  // Anual: 12 meses al precio de 10.
  { months: 12, label: "12 meses", paidMonths: 10 },
] as const;

export function enterprisePlan(id: string | null | undefined): EnterprisePlan {
  return ENTERPRISE_PLANS.find((p) => p.id === id) ?? ENTERPRISE_PLANS[0];
}

export function enterpriseLimits(id: string | null | undefined): EnterpriseLimits {
  return enterprisePlan(id).limits;
}

// Claves de site_settings con precio y link de pago de cada plan.
export function priceSettingKey(product: Product, plan: string): string {
  return product === "pro" ? "price_worka_pro" : `price_enterprise_${plan}`;
}

export function paymentLinkKey(product: Product): string {
  return product === "pro" ? "payment_link_pro" : "payment_link_enterprise";
}

function parseGs(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function monthlyPrice(product: Product, plan: string, settings: Record<string, string | undefined>): number {
  const fallback = product === "pro" ? WORKA_PRO.defaultPriceGs : enterprisePlan(plan).defaultPriceGs;
  return parseGs(settings[priceSettingKey(product, plan)]) ?? fallback;
}

export function isPaidPlan(product: Product, plan: string): boolean {
  return product === "pro" ? plan === "pro" : plan === "pro" || plan === "empresa";
}

export function totalPrice(product: Product, plan: string, months: number, settings: Record<string, string | undefined>): number {
  const option = BILLING_OPTIONS.find((o) => o.months === months);
  if (!option || !isPaidPlan(product, plan)) return 0;
  return monthlyPrice(product, plan, settings) * option.paidMonths;
}

// Link de pago del producto; si no hay uno propio, el general (payment_link).
export function paymentLink(product: Product, settings: Record<string, string | undefined>): string | null {
  const link = (settings[paymentLinkKey(product)] || settings.payment_link || "").trim();
  return /^https?:\/\//i.test(link) ? link : null;
}

export function formatGs(amount: number): string {
  return `Gs. ${amount.toLocaleString("es-PY")}`;
}

// Nueva fecha de fin al aprobar un pago: se suma desde hoy o desde el fin
// del plan vigente, lo que sea más tarde (renovar antes de tiempo no pierde días).
export function extendedEnd(currentEnd: string | null, months: number, now = new Date()): string {
  const base = currentEnd && Date.parse(currentEnd) > now.getTime() ? new Date(currentEnd) : new Date(now);
  const end = new Date(base);
  end.setUTCMonth(end.getUTCMonth() + months);
  return end.toISOString();
}

export function startOfMonth(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function daysLeft(endsAt: string | null, now = Date.now()): number {
  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(endsAt) - now) / 86400000));
}

// Claves de site_settings con precios y links de pago (las edita el admin
// en «Pagos y planes»): [clave, etiqueta, ejemplo].
export const PLAN_SETTING_KEYS = [
  ["price_enterprise_pro", `${ENTERPRISE_BRAND} · Pro (Gs. por mes)`, String(ENTERPRISE_PLANS[1].defaultPriceGs)],
  ["price_enterprise_empresa", `${ENTERPRISE_BRAND} · Empresa (Gs. por mes)`, String(ENTERPRISE_PLANS[2].defaultPriceGs)],
  ["price_worka_pro", `${PRO_BRAND} (Gs. por mes)`, String(WORKA_PRO.defaultPriceGs)],
  ["payment_link_enterprise", "Link de pago para empresas", "https://…"],
  ["payment_link_pro", `Link de pago para ${PRO_BRAND}`, "Vacío = usa el link de pago general"],
  // Cotizaciones para mostrar los precios en la moneda de cada país.
  ["fx_usd_pyg", "Cotización: guaraníes por 1 USD", "5700"],
  ["fx_usd_ars", "Cotización: pesos argentinos por 1 USD", "1516"],
  ["fx_usd_mxn", "Cotización: pesos mexicanos por 1 USD", "18.4"],
  ["fx_usd_cop", "Cotización: pesos colombianos por 1 USD", "3190"],
  ["fx_usd_clp", "Cotización: pesos chilenos por 1 USD", "978"],
  ["fx_usd_bob", "Cotización: bolivianos por 1 USD", "11.7"],
] as const;

// ── Precios en la moneda de cada país ──────────────────────────────────
// Se convierte el precio mensual en guaraníes y el total se arma con ese
// mensual redondeado, así 3 meses son exactamente 3 × el precio que se ve.

export function localMonthlyPrice(product: Product, plan: string, countryCode: string, settings: Record<string, string | undefined>): Money {
  return fromGuaranies(monthlyPrice(product, plan, settings), countryCode, settings);
}

export function localTotal(
  product: Product,
  plan: string,
  months: number,
  countryCode: string,
  settings: Record<string, string | undefined>
): { local: Money; gs: number } {
  const option = BILLING_OPTIONS.find((o) => o.months === months);
  if (!option || !isPaidPlan(product, plan)) return { local: { amount: 0, currency: "PYG" }, gs: 0 };
  const monthly = localMonthlyPrice(product, plan, countryCode, settings);
  return {
    local: { amount: monthly.amount * option.paidMonths, currency: monthly.currency },
    gs: totalPrice(product, plan, months, settings),
  };
}

export { formatMoney };

// Monto de un aviso de pago en su moneda (los anteriores a la 048 son en Gs).
export function requestMoney(r: { amount_gs: number; amount_local?: number | null; currency?: string | null }): Money {
  return r.currency && r.currency !== "PYG" && r.amount_local != null
    ? { amount: Number(r.amount_local), currency: r.currency }
    : { amount: r.amount_gs, currency: "PYG" };
}

export function planDisplayName(product: Product, plan: string): string {
  return product === "pro" ? PRO_BRAND : `${ENTERPRISE_BRAND} · ${enterprisePlan(plan).name}`;
}
