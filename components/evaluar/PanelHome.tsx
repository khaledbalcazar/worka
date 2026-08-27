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
import { duplicateProcess, setProcessArchived } from "@/app/evaluar/actions";

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
  const activos = processes.filter((p) => p.status === "activo").length;
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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Suscripción.
          Solo ocupa el lugar de arriba cuando hay algo que hacer con ella:
          la prueba corriendo, el cupo lleno o el acceso vencido. Una cuenta
          paga y al día no necesita un cartel todos los días — antes empujaba
          hacia abajo lo único que la empresa entra a mirar, que es qué está
          esperando algo de ella. */}
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
          access.active
            ? access.inTrial
              ? "bg-blue-50 border-blue-200"
              : ""
            : "bg-amber-50 border-amber-200"
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
          {/* Cupo del plan. Se muestra siempre, no solo cuando se llena: que
              la empresa descubra el límite recién al querer publicar el
              cuarto proceso es la peor forma de enterarse. */}
          {plan.activeProcesses !== null && (
            <p className="text-xs text-slate-600 mt-1.5">
              Plan <strong className="font-semibold">{plan.label}</strong> ·{" "}
              <span className={activos >= plan.activeProcesses ? "text-amber-700 font-semibold" : ""}>
                {activos} de {plan.activeProcesses} procesos activos
              </span>
              {activos >= plan.activeProcesses && (
                <>
                  {" — "}
                  <Link href="/evaluar/precios" className="underline hover:text-primary">
                    ampliar plan
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
        {!access.active && (
          <a
            href="https://wa.me/595981000000?text=Quiero%20activar%20Worka%20Evaluar"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary press text-sm shrink-0"
          >
            Activar suscripción
          </a>
        )}
      </div>
      )}

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Encabezado: lo primero es qué está esperando algo de vos, no el
          nombre de la pantalla. */}
      {!nuevo && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="nk-mono m-0"
              style={{ color: "rgba(233,233,237,.4)" }}
            >
              {alerts.length > 0 ? "Necesita tu atención" : "Todo al día"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-medium mt-2 m-0 tracking-[-.02em]">
              {alerts.length === 0
                ? "Nada te está esperando"
                : alerts.length === 1
                  ? "Una cosa te está esperando"
                  : `${alerts.length} cosas te están esperando`}
            </h1>
          </div>
          {access.active && <NewProcess jobs={jobs} />}
        </div>
      )}

      {/* Cuenta nueva: primeros pasos en vez de una pantalla vacía. */}
      {nuevo ? (
        <FirstSteps jobs={jobs} active={access.active} />
      ) : (
        <>
          {/* Lo que necesita tu atención */}
          {alerts.length > 0 && (
            <section>
              <div className="grid gap-2 sm:grid-cols-2 stagger">
                {alerts.map((a, i) => {
                  const Icon =
                    a.kind === "revisar"
                      ? Users
                      : a.kind === "borrador"
                        ? FileEdit
                        : CalendarClock;
                  return (
                    <Link
                      key={`${a.kind}-${a.processId}-${i}`}
                      href={
                        a.kind === "revisar"
                          ? `/evaluar/app/procesos/${a.processId}/tablero`
                          : `/evaluar/app/procesos/${a.processId}`
                      }
                      className="card press p-4 flex items-start gap-3 relative overflow-hidden"
                      style={{
                        borderColor:
                          a.kind === "revisar" ? "#423a6a" : "var(--nk-line)",
                        background:
                          a.kind === "revisar"
                            ? "linear-gradient(150deg,#232532,#1b1d29)"
                            : "var(--nk-card)",
                      }}
                    >
                      <span
                        className="absolute left-0 top-0 bottom-0 w-0.5"
                        style={{
                          background:
                            a.kind === "revisar"
                              ? "var(--color-accent)"
                              : "#75798c",
                        }}
                        aria-hidden
                      />
                      <span
                        className="w-10 h-10 shrink-0 rounded-[10px] grid place-items-center"
                        style={{
                          border: `1px solid ${a.kind === "revisar" ? "rgba(145,132,217,.4)" : "rgba(233,233,237,.14)"}`,
                          color:
                            a.kind === "revisar"
                              ? "var(--color-accent)"
                              : "rgba(233,233,237,.7)",
                        }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-primary-dark">
                          {a.detail}
                        </span>
                        <span className="block text-xs text-slate-500 truncate">
                          {a.processTitle}
                        </span>
                      </span>
                      <ArrowRight size={16} className="text-slate-400 shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Números de la operación.
              Una sola placa con separadores de un píxel, no cuatro tarjetas
              sueltas: son cuatro lecturas del mismo embudo y leerlas juntas
              es el punto. */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden"
            style={{
              background: "var(--nk-line)",
              border: "1px solid var(--nk-line)",
            }}
          >
            {[
              { v: `${stats.activos}`, l: "procesos activos", ac: false },
              { v: `${stats.enCurso}`, l: "rindiendo ahora", ac: true },
              { v: `${stats.completados}`, l: "completaron", ac: false },
              {
                v: terminacion === null ? "—" : `${terminacion}%`,
                l: "terminan el proceso",
                ac: false,
              },
            ].map((s) => (
              <div key={s.l} className="p-5" style={{ background: "#1a1c26" }}>
                <p
                  className="text-3xl font-medium leading-none m-0 tracking-[-.02em]"
                  style={{ color: s.ac ? "var(--nk-300)" : "var(--color-text)" }}
                >
                  {s.v}
                </p>
                <p
                  className="nk-mono mt-2"
                  style={{ color: "rgba(233,233,237,.42)" }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          {/* Procesos */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="nk-mono m-0" style={{ color: "rgba(233,233,237,.4)" }}>
                Tus procesos
              </p>
              <span className="text-[12.5px]" style={{ color: "rgba(233,233,237,.45)" }}>
                {processes.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 stagger">
              {processes.map((p) => (
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

          {/* Actividad reciente */}
          {activity.length > 0 && (
            <section>
              <p className="nk-mono mb-3" style={{ color: "rgba(233,233,237,.4)" }}>
                Últimos movimientos
              </p>
              <ol className="card divide-y divide-slate-100">
                {activity.slice(0, 8).map((a, i) => (
                  <li key={i} className="px-4 py-2.5 flex items-baseline gap-3">
                    <span className="text-sm text-slate-700 min-w-0 flex-1">
                      {a.message}
                      <span className="block text-xs text-slate-400 truncate">
                        {a.processTitle}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(a.at).toLocaleDateString("es-PY", {
                        day: "numeric",
                        month: "short",
                      })}
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

function ProcessCard({
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
        <Link
          href={`/evaluar/app/procesos/${p.id}`}
          className="font-semibold text-primary-dark leading-snug min-w-0 hover:text-primary"
        >
          {p.title}
        </Link>
        <span
          className={`chip shrink-0 ${
            p.status === "activo"
              ? "bg-emerald-50 text-emerald-700"
              : p.status === "cerrado"
                ? "bg-slate-100 text-slate-500"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {p.status}
        </span>
      </div>

      {p.job ? (
        <p className="text-xs text-primary mt-2 flex items-center gap-1.5">
          <Link2 size={13} className="shrink-0" />
          <span className="truncate">{p.job.title}</span>
        </p>
      ) : (
        <p className="text-xs text-slate-400 mt-2">Sin vacante enlazada</p>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span>
          {p.stage_count} {p.stage_count === 1 ? "etapa" : "etapas"}
        </span>
        <span className="flex items-center gap-1">
          <Users size={13} /> {p.participant_count}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
        <Link
          href={`/evaluar/app/procesos/${p.id}`}
          className="btn-secondary press text-xs flex-1"
        >
          Abrir
        </Link>
        <button
          onClick={onDuplicate}
          disabled={pending}
          title="Duplicar con sus etapas y preguntas"
          aria-label="Duplicar proceso"
          className="w-9 h-9 grid place-items-center rounded-full text-slate-300 hover:text-primary press"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={onArchive}
          disabled={pending}
          title="Archivar (no se borra nada)"
          aria-label="Archivar proceso"
          className="w-9 h-9 grid place-items-center rounded-full text-slate-300 hover:text-primary press"
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
          <li key={t} className="bg-surface rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
                {i + 1}
              </span>
              <Icon size={17} className="text-slate-400" />
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

      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
        <CheckCircle2 size={13} /> Podés cambiarlo todo después: nada de esto
        queda fijo.
      </p>
    </div>
  );
}
