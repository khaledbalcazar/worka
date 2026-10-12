import Link from "next/link";
import { Check, Crown } from "lucide-react";
import PlanCheckout from "@/components/plans/PlanCheckout";
import { getCurrentCompany, getSiteSettings } from "@/lib/data";
import {
  ENTERPRISE_BRAND,
  ENTERPRISE_PLANS,
  daysLeft,
  enterprisePlan,
  formatGs,
  monthlyPrice,
  paymentLink,
} from "@/lib/plans";
import {
  countListedJobs,
  getCompanySubscription,
  getEnterprisePlanId,
  getPaymentRequestsFor,
  getPromotionUsage,
} from "@/lib/subscriptions";
import { formatDate } from "@/lib/format";

export const metadata = { title: ENTERPRISE_BRAND };

export default async function CompanyPlansPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const [{ plan: wanted }, company] = await Promise.all([searchParams, getCurrentCompany()]);
  if (!company) {
    return (
      <div className="max-w-md mx-auto card p-8 text-center mt-10">
        <p className="font-semibold">Primero registrá tu empresa</p>
        <Link href="/empresa/registro" className="btn-primary mt-4">Registrar mi empresa</Link>
      </div>
    );
  }

  const [planId, subscription, usage, listed, settings, requests] = await Promise.all([
    getEnterprisePlanId(company.id),
    getCompanySubscription(company.id),
    getPromotionUsage(company.id),
    countListedJobs(company.id),
    getSiteSettings(),
    getPaymentRequestsFor(company.id, "enterprise"),
  ]);
  const plan = enterprisePlan(planId);
  const limits = plan.limits;
  const pending = requests.find((r) => r.status === "pendiente") ?? null;
  const paid = ENTERPRISE_PLANS.filter((p) => p.id !== "gratis").map((p) => ({
    id: p.id,
    name: p.name,
    monthly: monthlyPrice("enterprise", p.id, settings),
  }));
  const left = daysLeft(subscription?.ends_at ?? null);

  const meters = [
    {
      label: "Vacantes publicadas",
      value: listed,
      max: limits.maxListedJobs,
    },
    { label: "Destaques incluidos este mes", value: usage.boosts, max: limits.boostsPerMonth },
    { label: "Alertas urgentes este mes", value: usage.urgentAlerts, max: limits.urgentAlertsPerMonth },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <header>
        <p className="plan-eyebrow"><Crown size={15} /> {ENTERPRISE_BRAND}</p>
        <h1 className="text-2xl font-semibold mt-1">Contratá más rápido con el plan justo</h1>
        <p className="text-sm text-muted mt-1">Publicás gratis hasta 3 vacantes. Cuando necesites más alcance, pasate a Pro o Empresa.</p>
      </header>

      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Tu plan</p>
            <p className="text-xl font-semibold">{plan.id === "gratis" ? "Gratis" : `${ENTERPRISE_BRAND} · ${plan.name}`}</p>
            {subscription && (
              <p className="text-sm text-muted mt-1">
                Activo hasta el {formatDate(subscription.ends_at)}
                {left <= 7 && <strong className="text-clay"> · vence en {left} {left === 1 ? "día" : "días"}</strong>}
              </p>
            )}
          </div>
          {plan.id !== "gratis" && <span className="plan-badge"><Crown size={13} /> {plan.name}</span>}
        </div>
        <div className="plan-meters">
          {meters.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-sm">
                <span>{m.label}</span>
                <span className="font-semibold">{m.value}{m.max === null ? "" : ` de ${m.max}`}</span>
              </div>
              <div className="plan-meter">
                <span style={{ width: m.max === null ? "12%" : m.max === 0 ? "0%" : `${Math.min(100, (m.value / m.max) * 100)}%` }} />
              </div>
              {m.max === null && <p className="text-xs text-muted mt-1">Sin límite</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="plan-grid" aria-label="Planes">
        {ENTERPRISE_PLANS.map((p) => {
          const price = p.id === "gratis" ? 0 : monthlyPrice("enterprise", p.id, settings);
          const current = p.id === plan.id;
          return (
            <article key={p.id} className={`plan-card${p.id === "pro" ? " is-featured" : ""}${current ? " is-current" : ""}`}>
              {p.id === "pro" && <span className="plan-ribbon">Más elegido</span>}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-muted">{p.tagline}</p>
              <p className="plan-price">{price === 0 ? "Gratis" : formatGs(price)}{price > 0 && <small> / mes</small>}</p>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}><Check size={15} /> {f}</li>
                ))}
              </ul>
              {current ? (
                <span className="btn-secondary w-full mt-auto pointer-events-none">Tu plan actual</span>
              ) : p.id === "gratis" ? null : (
                <a href={`?plan=${p.id}#contratar`} className={`${p.id === "pro" ? "btn-primary" : "btn-secondary"} w-full mt-auto`}>
                  {plan.id === "gratis" ? `Pasar a ${p.name}` : `Cambiar a ${p.name}`}
                </a>
              )}
            </article>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="card p-5">
          <h2 className="font-semibold text-lg">{subscription ? "Renovar o cambiar de plan" : "Contratar"}</h2>
          <p className="text-sm text-muted mb-4">
            Pagás con el link de pago y nos avisás. Confirmamos el pago y activamos el plan, normalmente en el día.
            Si renovás antes de que venza, los días se suman.
          </p>
          <PlanCheckout
            product="enterprise"
            plans={paid}
            initialPlan={wanted === "pro" || wanted === "empresa" ? wanted : plan.id === "gratis" ? "pro" : plan.id}
            paymentLink={paymentLink("enterprise", settings)}
            pending={pending}
          />
        </div>
        <aside className="card p-5">
          <h2 className="font-semibold">Tus pagos</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted mt-2">Todavía no registraste pagos.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span>{enterprisePlan(r.plan).name} · {r.months} {r.months === 1 ? "mes" : "meses"}</span>
                    <span className={`plan-status is-${r.status}`}>{r.status === "pendiente" ? "En revisión" : r.status === "aprobada" ? "Confirmado" : "Rechazado"}</span>
                  </div>
                  <p className="text-xs text-muted">{formatGs(r.amount_gs)} · {formatDate(r.created_at)}{r.admin_note ? ` · ${r.admin_note}` : ""}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}
