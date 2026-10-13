// Precios en la moneda de cada país, calculados desde el precio en
// guaraníes (la moneda base de Worka). Sin dependencias para poder probarlo.
//
// Los tipos de cambio son unidades de cada moneda por 1 dólar. Los valores
// por defecto son de mediados de octubre de 2026 y el admin los actualiza
// desde «Pagos y planes» (site_settings fx_usd_xxx) sin tocar código.

import { COUNTRIES, countryByCode } from "@/lib/countries";

export const DEFAULT_FX_PER_USD: Record<string, number> = {
  PYG: 5700,
  ARS: 1516,
  MXN: 18.4,
  COP: 3190,
  CLP: 978,
  BOB: 11.7,
};

// Redondeo a un precio "lindo" en cada moneda.
const ROUND_STEP: Record<string, number> = {
  PYG: 1000,
  ARS: 100,
  MXN: 5,
  COP: 100,
  CLP: 100,
  BOB: 5,
};

const LOCALE: Record<string, string> = {
  PYG: "es-PY",
  ARS: "es-AR",
  MXN: "es-MX",
  COP: "es-CO",
  CLP: "es-CL",
  BOB: "es-BO",
};

export function fxSettingKey(currency: string): string {
  return `fx_usd_${currency.toLowerCase()}`;
}

export const FX_CURRENCIES = Object.keys(DEFAULT_FX_PER_USD);

export function fxPerUsd(currency: string, settings: Record<string, string | undefined> = {}): number {
  const raw = settings[fxSettingKey(currency)]?.trim();
  // Acepta "5700", "5.700", "18.4" y "18,4".
  const normalized = raw && /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw) ? raw.replace(/\./g, "").replace(",", ".") : raw?.replace(",", ".");
  const parsed = normalized ? Number(normalized) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return DEFAULT_FX_PER_USD[currency] ?? 1;
}

export type Money = { amount: number; currency: string };

// Guaraníes -> moneda del país, redondeado. Paraguay queda igual.
export function fromGuaranies(gs: number, countryCode: string, settings: Record<string, string | undefined> = {}): Money {
  const currency = countryByCode(countryCode).currencyCode;
  if (currency === "PYG" || gs <= 0) return { amount: Math.max(0, Math.round(gs)), currency: "PYG" };
  const local = (gs / fxPerUsd("PYG", settings)) * fxPerUsd(currency, settings);
  const step = ROUND_STEP[currency] ?? 1;
  return { amount: Math.max(step, Math.round(local / step) * step), currency };
}

export function formatMoney(money: Money): string {
  if (money.currency === "PYG") return `Gs. ${Math.round(money.amount).toLocaleString("es-PY")}`;
  const country = COUNTRIES.find((c) => c.currencyCode === money.currency);
  const symbol = money.currency === "BOB" ? "Bs" : "$";
  const n = money.amount.toLocaleString(LOCALE[money.currency] ?? "es", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  // "$" se repite en varios países: se aclara la moneda.
  return `${symbol} ${n}${symbol === "$" && country ? ` ${money.currency}` : ""}`;
}
