"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Copy,
  FileEdit,
  Link2,

  Sparkles,
  Users,
} from "lucide-react";
import type { AccessState, PanelData, ProcessRow } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import { TRIAL_DAYS } from "@/lib/evaluar-config";
import NewProcess from "./NewProcess";
import VentasCta from "./VentasCta";
import { duplicateProcess, setProcessArchived } from "@/app/evaluar/actions";
import { Columns, Donut, SERIES } from "@/components/admin/Charts";

// Panel de Worka Evaluar.
//
// El orden no es decorativo: arriba va lo que está esperando algo de la
// empresa. La pregunta al entrar nunca es "qué procesos tengo" sino "qué me
// falta hacer", y antes había que abrir proceso por proceso para descubrir
// que seis personas terminaron y nadie las miró.
export default function PanelHome({
  access,
  panel,
  jobs,
}: {
  access: AccessState;
  panel: PanelData;
  jobs: { id: string; title: string; linked: boolean }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { processes, alerts, activity, stats } = panel;
  const plan = planOf(access);
  const propios = processes.filter((p) => p.esDueno !== false);
  const compartidos = processes.filter((p) => p.esDueno === false);
  const activos = propios.filter((p) => p.status === "activo").length;
  // Nada que resolver: paga, al dia y con cupo de sobra.
  const cupoLleno =
    plan.activeProcesses !== null && activos >= plan.activeProcesses;
  const tranquilo = access.active && !access.inTrial && !cupoLleno;
  const nuevo = processes.length === 0;
  // Del mismo embudo que el resto: sin gente que haya empezado no hay tasa
  // que calcular, y un 0% ahi seria mentira.
  const base = stats.enCurso + stats.completados;
  const terminacion =
    base > 0 ? Math.round((stats.completados / base) * 100) : null;

  function run(fn: () => Promise<{ ok: boolean; error?: string; id?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(r.error ?? "Ocurrió un error.");
    });
  }

  return (
    <div className="space-y-5">
      {/* Encabezado: el nombre de la sección y la acción principal, como en
          el panel de empresa. */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-primary-dark tracking-[-.015em]">Inicio</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {nuevo
              ? "Armá tu primer proceso y evaluá candidatos con pruebas del puesto."
              : alerts.length === 0
                ? "Todo al día: nada está esperando una decisión tuya."
                : alerts.length === 1
                  ? "Una cosa está esperando algo de vos."
                  : `${alerts.length} cosas están esperando algo de vos.`}
          </p>
        </div>
        {!nuevo && access.active && <NewProcess jobs={jobs} triggerClassName="btn-primary press lg:!hidden" />}
      </div>

      {/* Suscripción.
          Solo ocupa lugar cuando hay algo que hacer con ella: la prueba
          corriendo, el cupo lleno o el acceso vencido. Una cuenta paga y al
          día no necesita un cartel todos los días. */}
      {tranquilo ? (
        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Suscripción activa · plan {plan.label}
          {plan.activeProcesses !== null && (
            <>
              {" · "}
              {activos} de {plan.activeProcesses} procesos activos
            </>
          )}
        </p>
      ) : (
        <div
          className={`card p-4 flex flex-wrap items-center justify-between gap-3 ${
            access.active ? (access.inTrial ? "!bg-[#f3f8fd] !border-[#c9d9ea]" : "") : "!bg-amber-50 !border-amber-200"
          }`}
        >
          <div className="min-w-0">
            <p className="font-semibold text-primary-dark text-sm">
              {access.active
                ? access.inTrial
                  ? `Prueba gratuita · ${access.daysLeft} ${access.daysLeft === 1 ? "día" : "días"} restantes`
                  : "Suscripción activa"
                : "Tu acceso venció"}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {access.active
                ? access.inTrial
                  ? `Tenés ${TRIAL_DAYS} días para probar Evaluar con un proceso real.`
                  : "Gracias por confiar en Worka Evaluar."
                : "Escribinos para reactivar tu cuenta y no perder ningún proceso."}
            </p>
            {/* Cupo del plan, siempre a la vista: enterarse del límite al
                querer publicar el cuarto proceso es la peor forma. */}
            {plan.activeProcesses !== null && (
              <p className="text-xs text-slate-600 mt-1.5">
                Plan <strong className="font-semibold">{plan.label}</strong> ·{" "}
                <span className={activos >= plan.activeProcesses ? "text-amber-700 font-semibold" : ""}>
                  {activos} de {plan.activeProcesses} procesos activos
                </span>
                {activos >= plan.activeProcesses && (
                  <>
                    {" — "}
                    <Link href="/evaluar/app/plan?plan=profesional" className="underline hover:text-primary">
                      ampliar plan
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
          {access.inTrial && (
            <Link href="/evaluar/app/plan" className="btn-secondary press text-sm shrink-0">
              Ver planes
            </Link>
          )}
          {!access.active && (
            <VentasCta variante="cta" className="shrink-0" mensaje="Hola, se me vencio el acceso a Worka Evaluar y quiero reactivarlo.">
              Reactivar mi cuenta
            </VentasCta>
          )}
        </div>
      )}

      {error && <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {nuevo ? (
        <FirstSteps jobs={jobs} active={access.active} />
      ) : (
        <>
          {/* Lo que espera algo de la empresa: siempre primero. */}
          {alerts.length > 0 && (
            <section aria-labelledby="ev-pendientes">
              <h2 id="ev-pendientes" className="ev-label mb-2">Para revisar</h2>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {alerts.map((a, i) => {
                  const Icon = a.kind === "revisar" ? Users : a.kind === "borrador" ? FileEdit : CalendarClock;
                  const tone =
                    a.kind === "revisar"
                      ? "bg-[#edf3f8] text-[#0a66c2]"
                      : a.kind === "plazo"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600";
                  return (
                    <Link
                      key={`${a.kind}-${a.processId}-${i}`}
                      href={a.kind === "revisar" ? `/evaluar/app/procesos/${a.processId}/tablero` : `/evaluar/app/procesos/${a.processId}`}
                      className="card press p-4 flex items-start gap-3 hover:!border-[#0a66c2]"
                    >
                      <span className={`w-10 h-10 shrink-0 rounded-full grid place-items-center ${tone}`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-primary-dark">{a.detail}</span>
                        <span className="block text-xs text-slate-500 truncate mt-0.5">{a.processTitle}</span>
                      </span>
                      <ArrowRight size={16} className="text-[#0a66c2] shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Números de la operación: cuatro lecturas del mismo embudo. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { v: `${stats.activos}`, l: "Procesos activos", sub: "publicados y abiertos" },
              { v: `${stats.enCurso}`, l: "Rindiendo ahora", sub: "empezaron y no terminaron" },
              { v: `${stats.completados}`, l: "Terminaron", sub: "con todas las etapas" },
              {
                v: terminacion === null ? "—" : `${terminacion}%`,
                l: "Terminan el proceso",
                sub: terminacion === null ? "todavía sin gente que haya empezado" : "de quienes empezaron",
              },
            ].map((s) => (
              <div key={s.l} className="card p-4 space-y-2">
                <p className="ev-label">{s.l}</p>
                <p className="text-[28px] font-semibold leading-none tracking-[-.02em] text-primary-dark tabular-nums">{s.v}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráficas: cómo viene la selección en todos los procesos. */}
          <div className="grid gap-4 xl:grid-cols-3">
            <section className="ev-panel xl:col-span-2">
              <h2>Evaluaciones terminadas por día</h2>
              <p className="ev-panel-sub mb-3">Últimos 30 días, en todos tus procesos</p>
              <Columns
                labels={panel.charts.daily.map((d) => d.label)}
                series={[{ name: "Terminaron", color: SERIES[0], values: panel.charts.daily.map((d) => d.completed) }]}
                height={210}
              />
            </section>
            <section className="ev-panel">
              <h2>Dónde está cada candidato</h2>
              <p className="ev-panel-sub mb-4">Estado actual en todos los procesos</p>
              <Donut
                items={panel.charts.byStatus.filter((s) => s.value > 0).map((s) => ({ label: s.label, value: s.value }))}
                center={{ value: String(panel.charts.byStatus.reduce((a, s) => a + s.value, 0)), label: "candidatos" }}
                size={150}
              />
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="ev-panel">
              <h2>Avance de cada proceso</h2>
              <p className="ev-panel-sub mb-3">De los invitados, cuántos empezaron, terminaron y tienen una decisión</p>
              <div className="ev-legend mb-3">
                {["Invitados", "Empezaron", "Terminaron", "Con decisión"].map((l, i) => (
                  <span key={l}>
                    <i style={{ background: FUNNEL_COLORS[i] }} /> {l}
                  </span>
                ))}
              </div>
              {panel.charts.perProcess.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Cuando invites candidatos, vas a ver el avance acá.</p>
              ) : (
                <ul className="space-y-4">
                  {panel.charts.perProcess.map((pr) => (
                    <li key={pr.id}>
                      <Link href={`/evaluar/app/procesos/${pr.id}`} className="text-sm font-semibold text-primary-dark hover:text-primary">
                        {pr.title}
                      </Link>
                      <div className="mt-1.5 space-y-1">
                        {[pr.invited, pr.started, pr.finished, pr.decided].map((v, i) => (
                          <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-3" title={`${["Invitados", "Empezaron", "Terminaron", "Con decisión"][i]}: ${v}`}>
                            <span className="h-2.5 rounded-[0_4px_4px_0] bg-[#f3f2f0] overflow-hidden">
                              <span className="block h-full rounded-[0_4px_4px_0]" style={{ width: `${pr.invited ? Math.max(2, (v / pr.invited) * 100) : 0}%`, background: FUNNEL_COLORS[i] }} />
                            </span>
                            <span className="text-xs tabular-nums text-slate-600 w-8 text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="ev-panel">
              <h2>Distribución de puntajes</h2>
              <p className="ev-panel-sub mb-3">
                Quienes terminaron, por tramo de puntaje (% de las preguntas que se corrigen solas). No es el ajuste al puesto.
              </p>
              <Columns
                labels={panel.charts.scoreBuckets.map((b) => b.label)}
                series={[{ name: "Candidatos", color: SERIES[0], values: panel.charts.scoreBuckets.map((b) => b.value) }]}
                height={190}
                every={1}
              />
            </section>
          </div>

          {/* Procesos: los más recientes; la lista completa vive en Procesos. */}
          <section aria-labelledby="ev-procesos">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 id="ev-procesos" className="ev-label">Procesos recientes</h2>
              <Link href="/evaluar/app/procesos" className="text-sm font-semibold text-primary hover:underline">
                Ver todos ({propios.length})
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {propios.slice(0, 4).map((p) => (
                <ProcessCard
                  key={p.id}
                  p={p}
                  pending={pending}
                  onDuplicate={() => run(() => duplicateProcess(p.id))}
                  onArchive={() => run(() => setProcessArchived(p.id, true))}
                />
              ))}
            </div>
          </section>

          {/* Procesos de otras empresas que me compartieron: solo puedo
              mirarlos y opinar, por eso van aparte. */}
          {compartidos.length > 0 && (
            <section aria-labelledby="ev-compartidos">
              <h2 id="ev-compartidos" className="ev-label mb-2">Te sumaron a estos procesos</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {compartidos.map((p) => (
                  <Link key={p.id} href={`/evaluar/app/procesos/${p.id}`} className="card press p-5 hover:!border-[#0a66c2]">
                    <p className="font-semibold text-primary-dark">{p.title}</p>
                    {(p.org_unit || p.department) && (
                      <p className="text-xs text-slate-500 mt-0.5">{[p.org_unit, p.department].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                      <StatusChip status={p.status} />
                      {p.participant_count} {p.participant_count === 1 ? "candidato" : "candidatos"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Actividad reciente */}
          {activity.length > 0 && (
            <section aria-labelledby="ev-actividad">
              <h2 id="ev-actividad" className="ev-label mb-2">Últimos movimientos</h2>
              <ol className="card divide-y divide-slate-100">
                {activity.slice(0, 8).map((a, i) => (
                  <li key={i} className="px-4 py-3 flex items-baseline gap-3">
                    <span className="text-sm text-slate-700 min-w-0 flex-1">
                      {a.message}
                      <span className="block text-xs text-slate-500 truncate">{a.processTitle}</span>
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(a.at).toLocaleDateString("es-PY", { day: "numeric", month: "short" })}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// Etapas del embudo: un solo tono que se oscurece (orden, no identidad).
const FUNNEL_COLORS = ["#b7d3f6", "#6da7ec", "#2a78d6", "#184f95"];

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  activo: { label: "Publicado", cls: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  borrador: { label: "Borrador", cls: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  cerrado: { label: "Cerrado", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

// Estado del proceso con el mismo molde que el de las vacantes del panel de
// empresa: punto de color y una palabra que se entiende sin conocer la base.
export function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.cerrado;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function ProcessCard({
  p,
  pending,
  onDuplicate,
  onArchive,
}: {
  p: ProcessRow;
  pending: boolean;
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/evaluar/app/procesos/${p.id}`} className="font-semibold text-primary-dark leading-snug min-w-0 hover:text-primary">
          {p.title}
        </Link>
        <StatusChip status={p.status} />
      </div>

      {p.job ? (
        <p className="text-xs text-primary mt-2 flex items-center gap-1.5">
          <Link2 size={13} className="shrink-0" />
          <span className="truncate">Vacante: {p.job.title}</span>
        </p>
      ) : (
        <p className="text-xs text-slate-500 mt-2">Sin vacante enlazada</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
        <span>
          {p.stage_count} {p.stage_count === 1 ? "etapa" : "etapas"}
        </span>
        <span className="flex items-center gap-1">
          <Users size={13} /> {p.participant_count} {p.participant_count === 1 ? "candidato" : "candidatos"}
        </span>
        {p.deadline_at && p.status === "activo" && (
          <span className="flex items-center gap-1">
            <CalendarClock size={13} /> cierra el{" "}
            {new Date(p.deadline_at).toLocaleDateString("es-PY", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
        <Link href={`/evaluar/app/procesos/${p.id}`} className="btn-secondary press text-sm flex-1 !min-h-9">
          Abrir
        </Link>
        {p.participant_count > 0 && (
          <Link href={`/evaluar/app/procesos/${p.id}/tablero`} className="btn-primary press text-sm flex-1 !min-h-9">
            Ver candidatos
          </Link>
        )}
        <button
          onClick={onDuplicate}
          disabled={pending}
          title="Duplicar con sus etapas y preguntas"
          aria-label="Duplicar proceso"
          className="w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 press"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={onArchive}
          disabled={pending}
          title="Archivar (no se borra nada)"
          aria-label="Archivar proceso"
          className="w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 press"
        >
          <Archive size={15} />
        </button>
      </div>
    </div>
  );
}

// Cuenta recién creada. Tres pasos concretos rinden mucho más que una
// pantalla vacía con un botón: el problema de quien recién entra no es la
// falta de un botón, es no saber por dónde empezar.
function FirstSteps({
  jobs,
  active,
}: {
  jobs: { id: string; title: string; linked: boolean }[];
  active: boolean;
}) {
  const pasos = [
    {
      Icon: Sparkles,
      t: "Armá tu primer proceso",
      d: "Elegí un puesto del catálogo (cajero, chofer, call center…) y te queda listo con sus preguntas y tests.",
    },
    {
      Icon: Link2,
      t: "Enlazalo con tu vacante",
      d: jobs.length
        ? "Tenés vacantes activas en Worka: al enlazarlas, quien vea el aviso empieza la evaluación desde ahí."
        : "Publicá una vacante en Worka y enlazala, así la gente rinde desde el propio aviso.",
    },
    {
      Icon: Users,
      t: "Invitá a los primeros",
      d: "Por email o WhatsApp. Entran con un enlace propio, sin crear ninguna cuenta.",
    },
  ];

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-xl font-bold text-primary-dark">
        Empecemos por tu primer proceso
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        Tres pasos y ya podés evaluar candidatos de verdad.
      </p>

      <ol className="grid gap-3 sm:grid-cols-3 mt-6 stagger">
        {pasos.map(({ Icon, t, d }, i) => (
          <li key={t} className="bg-[#f6f4f1] border border-[#e0dfdc] rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
                {i + 1}
              </span>
              <Icon size={17} className="text-slate-500" />
            </div>
            <p className="font-semibold text-primary-dark text-sm mt-2.5">{t}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {active ? (
          <NewProcess jobs={jobs} />
        ) : (
          <p className="text-sm text-amber-800 bg-amber-50 rounded-xl px-4 py-3">
            Activá tu suscripción para crear procesos.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
        <CheckCircle2 size={13} /> Podés cambiarlo todo después: nada de esto
        queda fijo.
      </p>
    </div>
  );
}
