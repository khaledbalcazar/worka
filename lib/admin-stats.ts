import "server-only";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { COUNTRIES } from "@/lib/countries";
import { monthlyPrice } from "@/lib/plans";
import { getSiteSettings } from "@/lib/data";

// Datos del backoffice: quién puede entrar, cuántas cosas esperan al admin
// (los numeritos de la navegación) y las estadísticas del inicio.
//
// Todo se lee con el cliente de servicio cuando está configurado: las
// estadísticas son conteos globales y no tienen que depender de que cada
// política de RLS deje ver al admin cada tabla.

/* eslint-disable @typescript-eslint/no-explicit-any */

const TZ = "America/Asuncion";
const DAY = 86_400_000;

// ── Acceso ─────────────────────────────────────────────────────────────

// Solo el rol admin entra. Sin Supabase (modo demo) se deja pasar para poder
// revisar el diseño. Antes cada página del backoffice repetía este bloque.
export async function requireAdmin(next = "/admin"): Promise<void> {
  const supabase = await getServerClient();
  if (!supabase) return;
  const user = await getCurrentUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if ((data as { role?: string } | null)?.role !== "admin") redirect("/");
}

async function db() {
  return getAdminClient() ?? (await getServerClient());
}

// ── Pendientes ─────────────────────────────────────────────────────────

export type AdminCounts = {
  moderation: number;
  reports: number;
  companies: number;
  identities: number;
  payments: number;
  boosts: number;
};

export const EMPTY_COUNTS: AdminCounts = { moderation: 0, reports: 0, companies: 0, identities: 0, payments: 0, boosts: 0 };

export async function getAdminCounts(): Promise<AdminCounts> {
  const supabase = await db();
  if (!supabase) return { moderation: 2, reports: 3, companies: 1, identities: 1, payments: 1, boosts: 0 };
  const count = async (table: string, filter: (q: any) => any): Promise<number> => {
    try {
      const { count: c } = await filter(supabase.from(table).select("id", { count: "exact", head: true }));
      return c ?? 0;
    } catch {
      return 0;
    }
  };
  const [moderation, reports, companies, identities, payments, boosts] = await Promise.all([
    count("jobs", (q) => q.eq("status", "Moderacion")),
    count("reports", (q) => q),
    count("companies", (q) => q.eq("is_verified", false)),
    count("candidates", (q) => q.eq("identity_status", "pending")),
    count("payment_requests", (q) => q.eq("status", "pendiente")),
    count("boost_requests", (q) => q.eq("status", "pendiente_pago")),
  ]);
  return { moderation, reports, companies, identities, payments, boosts };
}

// ── Estadísticas del inicio ────────────────────────────────────────────

export type Slice = { label: string; value: number };
export type DailyPoint = { day: string; label: string; candidates: number; companies: number; applications: number; jobs: number };

export type AdminDashboard = {
  generatedAt: string;
  demo: boolean;
  kpis: {
    candidates: number;
    candidatesNew30: number;
    companies: number;
    companiesVerified: number;
    companiesNew30: number;
    activeJobs: number;
    totalJobs: number;
    jobsNew30: number;
    applications: number;
    apps7: number;
    appsPrev7: number;
    contactedRate: number;
    externalActive: number;
    identityVerified: number;
  };
  money: {
    last30Gs: number;
    prev30Gs: number;
    byMonth: Slice[];
    mrrGs: number;
    enterprisePro: number;
    enterpriseEmpresa: number;
    enterprisePromo: number;
    workaPro: number;
    evaluarActive: number;
    evaluarTrial: number;
  };
  daily: DailyPoint[];
  funnel: Slice[];
  byIndustry: Slice[];
  byCity: Slice[];
  byModality: Slice[];
  byCountry: Slice[];
  topCompanies: { name: string; applications: number }[];
};

function dayKey(d: Date | string | number): string {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
}

function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

function lastDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => dayKey(Date.now() - (n - 1 - i) * DAY));
}

// Top N y el resto sumado en «Otros»: más de ocho categorías no se leen.
function topWithOther(map: Map<string, number>, n: number): Slice[] {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, n).map(([label, value]) => ({ label, value }));
  const rest = sorted.slice(n).reduce((s, [, v]) => s + v, 0);
  return rest > 0 ? [...top, { label: "Otros", value: rest }] : top;
}

function tally(rows: any[], pick: (r: any) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = (pick(r) ?? "").toString().trim();
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const supabase = await db();
  if (!supabase) return demoDashboard();

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const since30 = new Date(now - 30 * DAY).toISOString();
  const since60 = new Date(now - 60 * DAY).toISOString();
  const since7 = new Date(now - 7 * DAY).toISOString();
  const since14 = new Date(now - 14 * DAY).toISOString();
  const since6m = new Date(now - 183 * DAY).toISOString();

  const count = async (table: string, filter: (q: any) => any = (q) => q): Promise<number> => {
    try {
      const { count: c } = await filter(supabase.from(table).select("*", { count: "exact", head: true }));
      return c ?? 0;
    } catch {
      return 0;
    }
  };
  const rows = async (table: string, select: string, filter: (q: any) => any = (q) => q): Promise<any[]> => {
    try {
      const { data, error } = await filter(supabase.from(table).select(select));
      if (error) console.error(`[worka:admin] ${table}: ${error.message}`);
      return (data ?? []) as any[];
    } catch {
      return [];
    }
  };

  const [
    candidates,
    companies,
    companiesVerified,
    activeJobs,
    totalJobs,
    applications,
    apps7,
    appsPrev7,
    externalActive,
    identityVerified,
    funnelCounts,
    countryCounts,
    candRows,
    compRows,
    appRows,
    jobRows,
    activeRows,
    payRows,
    subRows,
    evaluarRows,
    settings,
  ] = await Promise.all([
    count("candidates"),
    count("companies"),
    count("companies", (q) => q.eq("is_verified", true)),
    count("jobs", (q) => q.eq("status", "Activo").gt("expires_at", nowIso)),
    count("jobs"),
    count("applications"),
    count("applications", (q) => q.gte("applied_at", since7)),
    count("applications", (q) => q.gte("applied_at", since14).lt("applied_at", since7)),
    count("external_jobs", (q) => q.eq("status", "activa")),
    count("candidates", (q) => q.eq("identity_status", "verified")),
    Promise.all(["Pendiente", "Revisado", "Contactado", "Rechazado"].map((s) => count("applications", (q) => q.eq("status", s)))),
    Promise.all(COUNTRIES.map((c) => count("candidates", (q) => q.eq("country", c.code)))),
    rows("candidates", "created_at", (q) => q.gte("created_at", since30).limit(20000)),
    rows("companies", "created_at", (q) => q.gte("created_at", since30).limit(5000)),
    rows("applications", "applied_at, job:jobs(company:companies(trade_name, company_name))", (q) => q.gte("applied_at", since30).limit(20000)),
    rows("jobs", "created_at", (q) => q.gte("created_at", since30).limit(5000)),
    // «*» y no columnas sueltas: si falta alguna migración, la consulta no se cae.
    rows("jobs", "*, company:companies(location_city)", (q) => q.eq("status", "Activo").gt("expires_at", nowIso).limit(5000)),
    rows("payment_requests", "*", (q) => q.eq("status", "aprobada").gte("created_at", since6m).limit(2000)),
    rows("subscriptions", "*", (q) => q.eq("status", "activa").gt("ends_at", nowIso).limit(5000)),
    rows("evaluar_accounts", "status, trial_ends_at, paid_until", (q) => q.limit(5000)),
    getSiteSettings().catch(() => ({}) as Record<string, string>),
  ]);

  // Serie diaria de los últimos 30 días (hora de Asunción).
  const days = lastDays(30);
  const byDay = (list: any[], field: string) => {
    const m = new Map<string, number>();
    for (const r of list) {
      const k = dayKey(r[field]);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const cand = byDay(candRows, "created_at");
  const comp = byDay(compRows, "created_at");
  const apps = byDay(appRows, "applied_at");
  const jobs = byDay(jobRows, "created_at");
  const daily: DailyPoint[] = days.map((d) => ({
    day: d,
    label: dayLabel(d),
    candidates: cand.get(d) ?? 0,
    companies: comp.get(d) ?? 0,
    applications: apps.get(d) ?? 0,
    jobs: jobs.get(d) ?? 0,
  }));

  // Ingresos confirmados (cobro manual) por mes.
  const monthKey = (d: string | number) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const paidAt = (p: any) => p.resolved_at ?? p.created_at;
  const revenue = new Map<string, number>();
  let last30Gs = 0;
  let prev30Gs = 0;
  for (const p of payRows) {
    const amount = Number(p.amount_gs) || 0;
    revenue.set(monthKey(paidAt(p)), (revenue.get(monthKey(paidAt(p))) ?? 0) + amount);
    const t = Date.parse(paidAt(p));
    if (t >= Date.parse(since30)) last30Gs += amount;
    else if (t >= Date.parse(since60)) prev30Gs += amount;
  }
  const monthName = (k: string) =>
    new Date(`${k}-15T12:00:00Z`).toLocaleDateString("es-PY", { month: "short", timeZone: TZ }).replace(".", "");

  // Planes vigentes. Los de una promoción no cuentan como ingreso recurrente.
  const paidSubs = subRows.filter((s) => !s.promo_code);
  const enterprisePro = paidSubs.filter((s) => s.product === "enterprise" && s.plan === "pro").length;
  const enterpriseEmpresa = paidSubs.filter((s) => s.product === "enterprise" && s.plan === "empresa").length;
  const enterprisePromo = subRows.filter((s) => s.promo_code).length;
  const workaPro = paidSubs.filter((s) => s.product === "pro").length;
  const mrrGs =
    enterprisePro * monthlyPrice("enterprise", "pro", settings) +
    enterpriseEmpresa * monthlyPrice("enterprise", "empresa", settings) +
    workaPro * monthlyPrice("pro", "pro", settings);
  const evaluarActive = evaluarRows.filter((a) => a.status === "activa" && a.paid_until && Date.parse(a.paid_until) > now).length;
  const evaluarTrial = evaluarRows.filter((a) => a.status === "prueba" && Date.parse(a.trial_ends_at) > now).length;

  const top = new Map<string, number>();
  for (const a of appRows) {
    const c = a.job?.company;
    const name = c?.trade_name || c?.company_name;
    if (name) top.set(name, (top.get(name) ?? 0) + 1);
  }

  const contacted = funnelCounts[2];
  return {
    generatedAt: nowIso,
    demo: false,
    kpis: {
      candidates,
      candidatesNew30: candRows.length,
      companies,
      companiesVerified,
      companiesNew30: compRows.length,
      activeJobs,
      totalJobs,
      jobsNew30: jobRows.length,
      applications,
      apps7,
      appsPrev7,
      contactedRate: applications > 0 ? Math.round((contacted / applications) * 100) : 0,
      externalActive,
      identityVerified,
    },
    money: {
      last30Gs,
      prev30Gs,
      byMonth: months.map((k) => ({ label: monthName(k), value: revenue.get(k) ?? 0 })),
      mrrGs,
      enterprisePro,
      enterpriseEmpresa,
      enterprisePromo,
      workaPro,
      evaluarActive,
      evaluarTrial,
    },
    daily,
    funnel: ["Pendiente", "Revisado", "Contactado", "Rechazado"].map((s, i) => ({ label: s, value: funnelCounts[i] })),
    byIndustry: topWithOther(tally(activeRows, (r) => r.industry), 7),
    byCity: topWithOther(tally(activeRows, (r) => r.city || r.company?.location_city), 9),
    byModality: ["Presencial", "Híbrido", "Remoto"].map((m) => ({ label: m, value: activeRows.filter((r) => r.modality === m).length })),
    byCountry: COUNTRIES.map((c, i) => ({ label: c.name, value: countryCounts[i] })).filter((c) => c.value > 0),
    topCompanies: [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, applications]) => ({ name, applications })),
  };
}

// Modo demo: números de ejemplo estables (sin azar, para que no cambien en
// cada recarga y la vista se pueda comparar).
function demoDashboard(): AdminDashboard {
  const wave = (i: number, base: number, amp: number) => Math.max(0, Math.round(base + amp * Math.sin(i / 3.2) + (i % 5) * (amp / 4)));
  const daily = lastDays(30).map((d, i) => ({
    day: d,
    label: dayLabel(d),
    candidates: wave(i, 14 + i * 0.4, 6),
    companies: wave(i, 2 + i * 0.05, 1.5),
    applications: wave(i, 38 + i * 1.1, 14),
    jobs: wave(i, 4 + i * 0.1, 2),
  }));
  const sum = (k: keyof DailyPoint) => daily.reduce((s, d) => s + (d[k] as number), 0);
  return {
    generatedAt: new Date().toISOString(),
    demo: true,
    kpis: {
      candidates: 4820,
      candidatesNew30: sum("candidates"),
      companies: 312,
      companiesVerified: 241,
      companiesNew30: sum("companies"),
      activeJobs: 486,
      totalJobs: 1904,
      jobsNew30: sum("jobs"),
      applications: 23150,
      apps7: 412,
      appsPrev7: 365,
      contactedRate: 38,
      externalActive: 1270,
      identityVerified: 1630,
    },
    money: {
      last30Gs: 6_850_000,
      prev30Gs: 5_400_000,
      byMonth: ["may", "jun", "jul", "ago", "sept", "oct"].map((label, i) => ({ label, value: [2.1, 2.9, 3.4, 4.6, 5.4, 6.85][i] * 1_000_000 })),
      mrrGs: 7_420_000,
      enterprisePro: 18,
      enterpriseEmpresa: 4,
      enterprisePromo: 27,
      workaPro: 61,
      evaluarActive: 9,
      evaluarTrial: 14,
    },
    daily,
    funnel: [
      { label: "Pendiente", value: 8120 },
      { label: "Revisado", value: 5940 },
      { label: "Contactado", value: 6210 },
      { label: "Rechazado", value: 2880 },
    ],
    byIndustry: [
      { label: "Ventas", value: 112 },
      { label: "Gastronomía", value: 74 },
      { label: "Logística", value: 61 },
      { label: "Atención al cliente", value: 55 },
      { label: "Administración", value: 47 },
      { label: "Tecnología", value: 33 },
      { label: "Salud", value: 28 },
      { label: "Otros", value: 76 },
    ],
    byCity: [
      { label: "Asunción", value: 168 },
      { label: "San Lorenzo", value: 52 },
      { label: "Ciudad del Este", value: 49 },
      { label: "Luque", value: 38 },
      { label: "Encarnación", value: 33 },
      { label: "Fernando de la Mora", value: 27 },
      { label: "Lambaré", value: 21 },
      { label: "Capiatá", value: 18 },
      { label: "Coronel Oviedo", value: 12 },
      { label: "Otros", value: 68 },
    ],
    byModality: [
      { label: "Presencial", value: 371 },
      { label: "Híbrido", value: 72 },
      { label: "Remoto", value: 43 },
    ],
    byCountry: [
      { label: "Paraguay", value: 4310 },
      { label: "Argentina", value: 262 },
      { label: "Bolivia", value: 131 },
      { label: "México", value: 64 },
      { label: "Colombia", value: 33 },
      { label: "Chile", value: 20 },
    ],
    topCompanies: [
      { name: "Super Guaraní", applications: 186 },
      { name: "TecnoPy", applications: 141 },
      { name: "Logística del Este", applications: 118 },
      { name: "Farmacia Central", applications: 96 },
      { name: "Café Mburucuyá", applications: 71 },
      { name: "Banco Andino", applications: 58 },
    ],
  };
}

// Cada bloque del backoffice trae sus datos por su cuenta y lo que falla
// devuelve su valor vacío (con rastro en el log): una consulta rota no puede
// dejar al admin sin poder entrar.
export async function seguro<T>(etiqueta: string, fn: () => Promise<T>, vacio: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`admin: fallo ${etiqueta}`, e);
    return vacio;
  }
}
