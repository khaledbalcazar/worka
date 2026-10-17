"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Flag, IdCard, ShieldAlert, Zap } from "lucide-react";
import type { AdminCounts, AdminDashboard as Data } from "@/lib/admin-stats";
import { Columns, Donut, HBars, Line, SERIES, Spark, compact, gs } from "@/components/admin/Charts";

// Inicio del backoffice: lo que espera al admin arriba de todo, después los
// números del negocio y los gráficos. Todo sale de getAdminDashboard().

function Delta({ now, prev, label }: { now: number; prev: number; label: string }) {
  if (prev === 0 && now === 0) return <span className="ad-kpi-sub">sin movimiento {label}</span>;
  if (prev === 0) return <span className="ad-delta is-up">nuevo {label}</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  return (
    <span className={`ad-delta ${pct >= 0 ? "is-up" : "is-down"}`}>
      {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}% <span className="font-normal text-[#767676]">{label}</span>
    </span>
  );
}

function Kpi({
  label,
  value,
  sub,
  spark,
  delta,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  spark?: number[];
  delta?: React.ReactNode;
}) {
  return (
    <div className="ad-kpi">
      <p className="ad-kpi-label">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="ad-kpi-value tabular-nums">{value}</p>
        {spark && <Spark values={spark} color="#9ec5f4" />}
      </div>
      {delta}
      {sub && <p className="ad-kpi-sub">{sub}</p>}
    </div>
  );
}

function Panel({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`ad-panel ${className}`}>
      <div className="mb-4">
        <h2>{title}</h2>
        {sub && <p className="ad-panel-sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard({ data, counts }: { data: Data; counts: AdminCounts }) {
  const { kpis, money, daily } = data;
  const labels = daily.map((d) => d.label);
  const n = (v: number) => v.toLocaleString("es-PY");

  const pending = [
    { n: counts.moderation, label: "vacantes en moderación", href: "/admin/moderacion", Icon: ShieldAlert },
    { n: counts.reports, label: "denuncias", href: "/admin/moderacion#denuncias", Icon: Flag },
    { n: counts.companies, label: "empresas por verificar", href: "/admin/verificaciones", Icon: BadgeCheck },
    { n: counts.identities, label: "identidades por revisar", href: "/admin/verificaciones#identidad", Icon: IdCard },
    { n: counts.payments, label: "pagos por confirmar", href: "/admin/pagos", Icon: CreditCard },
    { n: counts.boosts, label: "destaques por cobrar", href: "/admin/vacantes#potenciadas", Icon: Zap },
  ].filter((p) => p.n > 0);

  const plans = [
    { label: "Enterprise Pro · Pro", value: money.enterprisePro },
    { label: "Enterprise Pro · Empresa", value: money.enterpriseEmpresa },
    { label: "Enterprise (promoción)", value: money.enterprisePromo },
    { label: "Worka Pro (personas)", value: money.workaPro },
    { label: "Evaluar pago", value: money.evaluarActive },
    { label: "Evaluar en prueba", value: money.evaluarTrial },
  ];
  const plansTotal = plans.reduce((s, p) => s + p.value, 0);
  const funnelTotal = data.funnel.reduce((s, f) => s + f.value, 0);
  const activeTotal = data.byModality.reduce((s, m) => s + m.value, 0);

  return (
    <div className="space-y-5">
      <div className="ad-page-head">
        <div>
          <h1>Estadísticas</h1>
          <p>
            Todo Worka de un vistazo · actualizado el{" "}
            {new Date(data.generatedAt).toLocaleString("es-PY", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Asuncion" })}
          </p>
        </div>
        {data.demo && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fff4d6] text-[#8a5a00]">Datos de ejemplo (modo demo)</span>}
      </div>

      {/* ── Para revisar ── */}
      <section aria-label="Pendientes">
        {pending.length === 0 ? (
          <p className="ad-pending text-sm text-[#404040]">
            <CheckCircle2 size={20} className="text-[#057642]" /> Todo al día: no hay nada esperando revisión.
          </p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map(({ n: count, label, href, Icon }) => (
              <Link key={label} href={href} className="ad-pending">
                <span className="w-9 h-9 rounded-full bg-[#fdecec] text-[#cc1016] grid place-items-center shrink-0">
                  <Icon size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="tabular-nums">{count}</strong>
                  <span className="block text-[13px] text-[#666] truncate">{label}</span>
                </span>
                <ArrowRight size={16} className="text-[#0a66c2]" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Indicadores ── */}
      <div className="ad-kpis">
        <Kpi
          label="Candidatos"
          value={compact(kpis.candidates)}
          spark={daily.map((d) => d.candidates)}
          sub={`+${n(kpis.candidatesNew30)} en 30 días · ${n(kpis.identityVerified)} con identidad verificada`}
        />
        <Kpi
          label="Empresas"
          value={compact(kpis.companies)}
          spark={daily.map((d) => d.companies)}
          sub={`${kpis.companies ? Math.round((kpis.companiesVerified / kpis.companies) * 100) : 0}% verificadas · +${n(kpis.companiesNew30)} en 30 días`}
        />
        <Kpi
          label="Vacantes activas"
          value={compact(kpis.activeJobs)}
          spark={daily.map((d) => d.jobs)}
          sub={`de ${n(kpis.totalJobs)} publicadas · +${n(kpis.jobsNew30)} en 30 días`}
        />
        <Kpi
          label="Postulaciones (7 días)"
          value={compact(kpis.apps7)}
          spark={daily.map((d) => d.applications)}
          delta={<Delta now={kpis.apps7} prev={kpis.appsPrev7} label="vs. semana anterior" />}
          sub={`${n(kpis.applications)} en total`}
        />
        <Kpi label="Tasa de contacto" value={`${kpis.contactedRate}%`} sub="de las postulaciones llegaron a «Contactado»" />
        <Kpi
          label="Ingresos (30 días)"
          value={compact(money.last30Gs)}
          delta={<Delta now={money.last30Gs} prev={money.prev30Gs} label="vs. 30 días previos" />}
          sub="pagos confirmados, en guaraníes"
        />
        <Kpi label="Ingreso mensual recurrente" value={compact(money.mrrGs)} sub="estimado con los planes pagos vigentes (Gs.)" />
        <Kpi label="Vacantes externas activas" value={compact(kpis.externalActive)} sub="importadas de otras fuentes" />
      </div>

      {/* ── Actividad diaria ── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Postulaciones por día" sub="Últimos 30 días" className="xl:col-span-2">
          <Line labels={labels} values={daily.map((d) => d.applications)} name="Postulaciones" />
        </Panel>
        <Panel title="Estado de las postulaciones" sub={`${n(funnelTotal)} en total`}>
          <HBars items={data.funnel} total={funnelTotal} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Nuevos registros por día" sub="Últimos 30 días">
          <div className="ad-legend mb-3">
            <span><i style={{ background: SERIES[0] }} /> Candidatos</span>
            <span><i style={{ background: SERIES[1] }} /> Empresas</span>
          </div>
          <Columns
            labels={labels}
            series={[
              { name: "Candidatos", color: SERIES[0], values: daily.map((d) => d.candidates) },
              { name: "Empresas", color: SERIES[1], values: daily.map((d) => d.companies) },
            ]}
          />
        </Panel>
        <Panel title="Vacantes publicadas por día" sub="Últimos 30 días">
          <Columns labels={labels} series={[{ name: "Vacantes", color: SERIES[0], values: daily.map((d) => d.jobs) }]} />
        </Panel>
      </div>

      {/* ── Negocio ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ingresos confirmados por mes" sub="Últimos 6 meses · pagos aprobados en Gs.">
          <Columns
            labels={money.byMonth.map((m) => m.label)}
            series={[{ name: "Ingresos", color: SERIES[0], values: money.byMonth.map((m) => m.value) }]}
            format={compact}
            every={1}
          />
          <p className="text-xs text-[#767676] mt-2">Últimos 30 días: <b className="text-[#1d2226]">{gs(money.last30Gs)}</b></p>
        </Panel>
        <Panel title="Planes vigentes" sub="Suscripciones activas hoy">
          <Donut items={plans} center={{ value: n(plansTotal), label: "planes activos" }} />
        </Panel>
      </div>

      {/* ── Mercado ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Vacantes activas por rubro" sub="Los 7 rubros con más vacantes">
          <HBars items={data.byIndustry} total={activeTotal} />
        </Panel>
        <Panel title="Vacantes activas por ciudad" sub="Ciudad del puesto">
          <HBars items={data.byCity} total={activeTotal} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Modalidad de las vacantes activas">
          <Donut items={data.byModality} center={{ value: n(activeTotal), label: "activas" }} size={150} />
        </Panel>
        <Panel title="Candidatos por país">
          <HBars items={data.byCountry} total={kpis.candidates} />
        </Panel>
        <Panel title="Empresas con más postulaciones" sub="Últimos 30 días">
          <HBars items={data.topCompanies.map((c) => ({ label: c.name, value: c.applications }))} />
        </Panel>
      </div>
    </div>
  );
}
