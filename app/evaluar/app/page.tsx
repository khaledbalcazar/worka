import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Link2, Plus, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getMyEvaluarAccess, getMyProcesses, TRIAL_DAYS } from "@/lib/evaluar";
import StartTrial from "@/components/evaluar/StartTrial";
import NewProcess from "@/components/evaluar/NewProcess";
import { getLinkableJobs } from "@/lib/evaluar";

export const metadata = { title: "Mi panel" };

export default async function EvaluarAppPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    // El panel no está en PROTECTED_PREFIXES del proxy porque ahí la ruta
    // llega como "/app" (el dominio se traduce después): se protege acá.
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp");
  }

  const access = await getMyEvaluarAccess();

  // Sin cuenta todavía: ofrecemos la prueba.
  if (!access.account) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <StartTrial />
      </div>
    );
  }

  const [processes, jobs] = await Promise.all([
    getMyProcesses(),
    getLinkableJobs(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Estado de la suscripción, siempre a la vista: que la prueba se venza
          sin aviso es la peor forma de perder a un cliente. */}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-primary-dark">
            Procesos de selección
          </h1>
          <p className="text-sm text-slate-500">
            Cada proceso son las etapas que atraviesa un candidato.
          </p>
        </div>
        {access.active && <NewProcess jobs={jobs} />}
      </div>

      {processes.length === 0 ? (
        <div className="card p-10 text-center animate-rise">
          <span className="w-14 h-14 rounded-2xl bg-blue-50 text-primary grid place-items-center mx-auto">
            <Plus size={24} />
          </span>
          <p className="font-semibold text-primary-dark mt-3">
            Todavía no creaste ningún proceso
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Armá las etapas del puesto, enlazalo con una vacante de Worka y la
            gente empieza a rendir desde el aviso.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 stagger">
          {processes.map((p) => (
            <Link
              key={p.id}
              href={`/evaluar/app/procesos/${p.id}`}
              className="card press p-5 block"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-primary-dark leading-snug min-w-0">
                  {p.title}
                </h2>
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
                  <span className="truncate">Enlazado a: {p.job.title}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  Sin vacante enlazada
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>
                  {p.stage_count} {p.stage_count === 1 ? "etapa" : "etapas"}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} /> {p.participant_count}
                </span>
                <span className="ml-auto text-primary font-medium flex items-center gap-1">
                  Abrir <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
