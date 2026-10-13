"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, CreditCard, Gift, X } from "lucide-react";
import { adminCancelSubscription, adminGrantPlan, adminResolvePayment } from "@/app/plans-actions";
import { saveSiteSettings } from "@/app/actions";
import {
  ENTERPRISE_BRAND,
  PLAN_SETTING_KEYS,
  PRO_BRAND,
  enterprisePlan,
  formatGs,
  formatMoney,
  requestMoney,
  type Product,
} from "@/lib/plans";
import type { PaymentRequestRow, SubscriptionRow } from "@/lib/subscriptions";

export type PlanUser = { id: string; email: string | null; role: string; name: string };

function planName(product: Product, plan: string) {
  return product === "pro" ? PRO_BRAND : `${ENTERPRISE_BRAND} · ${enterprisePlan(plan).name}`;
}

export default function PlansAdmin({
  payments,
  subscriptions,
  users,
  settings,
  receipts = {},
}: {
  receipts?: Record<string, string>;
  payments: PaymentRequestRow[];
  subscriptions: SubscriptionRow[];
  users: PlanUser[];
  settings: Record<string, string>;
}) {
  const [pay, setPay] = useState(payments);
  const [subs, setSubs] = useState(subscriptions);
  const [prices, setPrices] = useState(() => Object.fromEntries(PLAN_SETTING_KEYS.map(([k]) => [k, settings[k] ?? ""])));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [grant, setGrant] = useState({ query: "", userId: "", product: "enterprise" as Product, plan: "pro", months: 1 });

  const names = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const who = (id: string) => {
    const u = names.get(id);
    return u ? `${u.name || "Sin nombre"}${u.email ? ` · ${u.email}` : ""}` : id.slice(0, 8);
  };
  const matches = grant.query.trim().length >= 2
    ? users.filter((u) => `${u.name} ${u.email ?? ""}`.toLowerCase().includes(grant.query.trim().toLowerCase())).slice(0, 6)
    : [];

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) {
    setMessage(null);
    startTransition(async () => {
      try {
        const r = await fn();
        if (!r.ok) setMessage(r.error ?? "No se pudo.");
        else {
          setMessage(okText);
          after?.();
        }
      } catch {
        setMessage("No pudimos conectar.");
      }
    });
  }

  function resolve(id: string, approve: boolean) {
    const note = approve ? "" : window.prompt("Motivo del rechazo (lo ve el cliente):", "No encontramos el pago") ?? "";
    if (!approve && !note) return;
    run(() => adminResolvePayment(id, approve, note), approve ? "Pago confirmado: el plan está activo." : "Pago rechazado.", () =>
      setPay((list) => list.map((p) => (p.id === id ? { ...p, status: approve ? "aprobada" : "rechazada" } : p)))
    );
  }

  const pendingPays = pay.filter((p) => p.status === "pendiente");
  const history = pay.filter((p) => p.status !== "pendiente").slice(0, 15);

  return (
    <section className="card p-5 space-y-6" id="pagos">
      <div>
        <h2 className="font-bold text-primary-dark flex items-center gap-2"><CreditCard size={18} /> Pagos y planes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cobro manual: el cliente paga con el link y avisa. Confirmá el pago acá y el plan se activa al instante.
        </p>
      </div>

      <div>
        <h3 className="font-semibold">Pagos por confirmar {pendingPays.length > 0 && <span className="chip bg-amber-50 text-amber-700 ml-1">{pendingPays.length}</span>}</h3>
        {pendingPays.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No hay pagos pendientes.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {pendingPays.map((p) => (
              <li key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{planName(p.product, p.plan)} · {p.months} {p.months === 1 ? "mes" : "meses"} · {formatMoney(requestMoney(p))}{requestMoney(p).currency !== "PYG" ? ` (${formatGs(p.amount_gs)})` : ""}</p>
                  <p className="text-xs text-gray-500">{p.billing_name ? `${p.billing_name}${p.billing_doc ? ` (${p.billing_doc})` : ""} · ` : ""}{who(p.user_id)} · {new Date(p.created_at).toLocaleString("es-PY")}{p.reference ? ` · Ref: ${p.reference}` : " · sin referencia"}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary !min-h-9" disabled={pending} onClick={() => resolve(p.id, true)}><Check size={15} /> Confirmar pago</button>
                  <button className="btn-secondary !min-h-9" disabled={pending} onClick={() => resolve(p.id, false)}><X size={15} /> Rechazar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Planes activos ({subs.length})</h3>
        {subs.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Todavía no hay planes activos.</p>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase"><th className="py-2">Cliente</th><th>Plan</th><th>Vence</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subs.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 pr-3">{who(s.user_id)}</td>
                    <td className="pr-3">{planName(s.product, s.plan)}</td>
                    <td className="pr-3">{new Date(s.ends_at).toLocaleDateString("es-PY")}</td>
                    <td className="text-right">
                      <button
                        className="text-gray-400 hover:text-danger font-medium"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("¿Cancelar este plan ahora? El cliente vuelve al plan gratis.")) return;
                          run(() => adminCancelSubscription(s.id), "Plan cancelado.", () => setSubs((l) => l.filter((x) => x.id !== s.id)));
                        }}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold flex items-center gap-2"><Gift size={16} /> Dar un plan a mano</h3>
        <p className="text-xs text-gray-500">Para cortesías, períodos de gracia o pagos por transferencia.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2 items-end">
          <label className="relative lg:col-span-2">
            <span className="label">Cliente (nombre o email)</span>
            <input
              className="input"
              value={grant.query}
              onChange={(e) => setGrant((g) => ({ ...g, query: e.target.value, userId: "" }))}
              placeholder="Buscar…"
            />
            {matches.length > 0 && !grant.userId && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow">
                {matches.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setGrant((g) => ({ ...g, userId: u.id, query: `${u.name}${u.email ? ` · ${u.email}` : ""}`, product: u.role === "company" ? "enterprise" : "pro", plan: "pro" }))}
                    >
                      {u.name || "Sin nombre"} <span className="text-gray-400">{u.email} · {u.role === "company" ? "empresa" : u.role === "candidate" ? "candidato" : u.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label>
            <span className="label">Plan</span>
            <select
              className="input"
              value={`${grant.product}:${grant.plan}`}
              onChange={(e) => {
                const [product, plan] = e.target.value.split(":");
                setGrant((g) => ({ ...g, product: product as Product, plan }));
              }}
            >
              <option value="enterprise:pro">{ENTERPRISE_BRAND} · Pro</option>
              <option value="enterprise:empresa">{ENTERPRISE_BRAND} · Empresa</option>
              <option value="pro:pro">{PRO_BRAND}</option>
            </select>
          </label>
          <label>
            <span className="label">Meses</span>
            <input className="input" type="number" min={1} max={24} value={grant.months} onChange={(e) => setGrant((g) => ({ ...g, months: Number(e.target.value) || 1 }))} />
          </label>
        </div>
        <button
          className="btn-secondary mt-3"
          disabled={pending || !grant.userId}
          onClick={() => run(() => adminGrantPlan({ userId: grant.userId, product: grant.product, plan: grant.plan, months: grant.months }), "Plan activado.")}
        >
          <Gift size={15} /> Activar plan
        </button>
      </div>

      <div>
        <h3 className="font-semibold">Precios, links de pago y cotizaciones</h3>
        <div className="grid lg:grid-cols-2 gap-3 mt-2">
          {PLAN_SETTING_KEYS.map(([key, label, placeholder]) => (
            <label key={key}>
              <span className="label">{label}</span>
              <input
                className="input"
                value={prices[key] ?? ""}
                placeholder={placeholder}
                onChange={(e) => setPrices((p) => ({ ...p, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Precio vacío = el de lista. Link vacío = se usa el «Link de pago» general. Los precios de cada país salen del precio en guaraníes y estas cotizaciones (vacío = la cotización de octubre de 2026).</p>
        <button className="btn-primary mt-3" disabled={pending} onClick={() => run(() => saveSiteSettings(prices), "Precios y links guardados.")}>
          Guardar precios y links
        </button>
      </div>

      {history.length > 0 && (
        <details>
          <summary className="text-sm font-medium cursor-pointer">Últimos pagos resueltos</summary>
          <ul className="mt-2 text-sm divide-y divide-gray-100">
            {history.map((p) => (
              <li key={p.id} className="py-2 flex justify-between gap-3">
                <span>{who(p.user_id)} · {planName(p.product, p.plan)} · {formatMoney(requestMoney(p))}</span>
                <span className="flex gap-3 shrink-0">
                  {receipts[p.id] && <a href={`/recibo/${receipts[p.id]}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">Recibo</a>}
                  <span className={p.status === "aprobada" ? "text-green-700" : "text-red-600"}>{p.status === "aprobada" ? "Confirmado" : "Rechazado"}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
    </section>
  );
}
