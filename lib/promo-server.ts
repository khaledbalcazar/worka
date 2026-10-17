import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import { extendedEnd } from "@/lib/plans";
import { LAUNCH_PROMO, isValidPromoCode, normalizePromoCode } from "@/lib/promo";

// Canje de la promoción de lanzamiento: activa Enterprise Pro · Pro y Worka
// Evaluar · Profesional. El código viaja en el metadata del alta
// (worka_promo) y se canjea la primera vez que la empresa tiene sesión: en
// el callback del email de confirmación, en el alta directa o, como red,
// al abrir el panel. Es idempotente: worka_promo_redeemed en el metadata
// corta antes de tocar la base, y el índice único de la migración 049
// frena un doble canje simultáneo.

type PromoUser = {
  id: string;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

export type PromoRedemption = { redeemed: boolean; endsAt?: string; code?: string };

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Asuncion" });
}

type Admin = NonNullable<ReturnType<typeof getAdminClient>>;

// Worka Evaluar · Profesional por los mismos 3 meses. Si la empresa ya tenía
// tiempo pago, no se le acorta: queda la fecha más lejana.
async function activateEvaluar(admin: Admin, companyId: string, endsAt: string): Promise<void> {
  const { data: current } = await admin.from("evaluar_accounts").select("paid_until").eq("company_id", companyId).maybeSingle();
  const prev = (current as { paid_until?: string | null } | null)?.paid_until;
  const paidUntil = prev && Date.parse(prev) > Date.parse(endsAt) ? prev : endsAt;
  const { error } = await admin
    .from("evaluar_accounts")
    .upsert({ company_id: companyId, status: "activa", plan: LAUNCH_PROMO.evaluarPlan, paid_until: paidUntil }, { onConflict: "company_id" });
  // Que falle Evaluar no deshace Enterprise Pro, que ya quedó activo.
  if (error) console.error(`[worka:promo] evaluar activation failed: ${error.message}`);
}

export async function redeemSignupPromo(user: PromoUser | null | undefined): Promise<PromoRedemption> {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  if (!user || !meta.worka_promo || meta.worka_promo_redeemed) return { redeemed: false };

  const code = normalizePromoCode(String(meta.worka_promo));
  // La fecha que cuenta es la del alta: quien se registró el 15/11 y confirma
  // el email el 16 no pierde la promo.
  const signedUpAt = user.created_at ? Date.parse(user.created_at) : Date.now();
  const admin = getAdminClient();
  if (!admin) return { redeemed: false };

  const markDone = (extra: Record<string, unknown> = {}) =>
    admin.auth.admin.updateUserById(user.id, { user_metadata: { ...meta, worka_promo_redeemed: true, ...extra } });

  if (!isValidPromoCode(code, signedUpAt)) {
    await markDone({ worka_promo_status: "invalido" });
    return { redeemed: false };
  }

  // Solo cuentas de empresa, y solo empresas sin planes previos (es para nuevas).
  const [{ data: company }, { data: previous }] = await Promise.all([
    admin.from("companies").select("id, trade_name, company_name").eq("id", user.id).maybeSingle(),
    admin.from("subscriptions").select("id").eq("user_id", user.id).eq("product", "enterprise").limit(1),
  ]);
  if (!company) return { redeemed: false }; // todavía no existe: se reintenta en la próxima visita
  if (previous && previous.length > 0) {
    await markDone({ worka_promo_status: "ya_tenia_plan" });
    return { redeemed: false };
  }

  const startsAt = new Date().toISOString();
  const endsAt = extendedEnd(null, LAUNCH_PROMO.months);
  const row = { user_id: user.id, product: "enterprise", plan: LAUNCH_PROMO.plan, starts_at: startsAt, ends_at: endsAt, payment_request_id: null };
  let { error } = await admin.from("subscriptions").insert({ ...row, promo_code: code });
  // Doble canje simultáneo: el otro ya lo activó.
  if (error?.code === "23505") return { redeemed: false };
  // Sin la migración 049 no existe la columna: se activa igual, sin el código.
  if (error && /promo_code|column/i.test(error.message)) ({ error } = await admin.from("subscriptions").insert(row));
  if (error) {
    console.error(`[worka:promo] subscription insert failed: ${error.message}`);
    return { redeemed: false };
  }
  await activateEvaluar(admin, user.id, endsAt);
  await markDone({ worka_promo_status: "canjeado" });

  const empresa = company.trade_name || company.company_name || "tu empresa";
  await notify({
    userId: user.id,
    icon: "🎁",
    title: "Bienvenidos a Worka: Enterprise Pro y Evaluar activos",
    body: `Canjeaste ${code}: tenés Worka Enterprise Pro · Pro y Worka Evaluar · Profesional sin costo hasta el ${formatDay(endsAt)}. Publicá tu primera vacante hoy.`,
    href: "/empresa/vacantes/nueva",
    cta: "Crear mi primera vacante",
    template: { key: "empresa_bienvenida_promo", vars: { empresa, codigo: code, vence: formatDay(endsAt) } },
  });

  return { redeemed: true, endsAt, code };
}
