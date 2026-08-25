import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { getMyEvaluarAccess, TRIAL_DAYS } from "@/lib/evaluar";

// Aviso de Worka Evaluar dentro del panel de empresa. Cambia de mensaje según
// el estado real de la cuenta: ofrecerle la prueba a quien ya la está usando
// es la forma más rápida de que el aviso se vuelva invisible.
export default async function EvaluarPromo() {
  const access = await getMyEvaluarAccess();

  const yaLoUsa = !!access.account;
  const href = yaLoUsa ? "/evaluar/app" : "/evaluar";

  return (
    <Link
      href={href}
      className="card press block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
    >
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 shrink-0 rounded-2xl bg-white text-primary grid place-items-center">
          <ClipboardCheck size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-primary-dark text-sm">
            Worka <span className="text-primary">Evaluar</span>
            {yaLoUsa && access.inTrial && (
              <span className="font-normal text-slate-500">
                {" "}
                · {access.daysLeft}{" "}
                {access.daysLeft === 1 ? "día" : "días"} de prueba
              </span>
            )}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {yaLoUsa
              ? "Entrá a tus procesos de selección y al tablero de decisión."
              : `Evaluá candidatos con tests enlazados a tus propias vacantes. ${TRIAL_DAYS} días gratis.`}
          </p>
        </div>
        <ArrowRight size={18} className="text-primary shrink-0 mt-2" />
      </div>
    </Link>
  );
}
