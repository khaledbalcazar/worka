"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, Mail } from "lucide-react";
import type { EvaluarAccountRow } from "@/lib/evaluar";
import { resolveAccess } from "@/lib/evaluar-access";
import { sendTestEmail, setEvaluarSubscription } from "@/app/evaluar/actions";

// Suscripciones de Worka Evaluar en el backoffice.
//
// El cobro es por transferencia o link y la activación es manual: acá es donde
// se cierra ese circuito. Sin esta pantalla habría que editar la tabla a mano
// en Supabase cada vez que una empresa paga.
export default function AdminSubscriptions({
  accounts,
}: {
  accounts: EvaluarAccountRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  function run(
    companyId: string,
    action: Parameters<typeof setEvaluarSubscription>[1]
  ) {
    setError(null);
    startTransition(async () => {
      const r = await setEvaluarSubscription(companyId, action);
      if (r.ok) {
        setDone(companyId);
        setTimeout(() => setDone(null), 2500);
      } else setError(r.error ?? "No pudimos actualizar.");
    });
  }

  return (
    <section className="card p-5">
      <h2 className="font-bold text-primary-dark flex items-center gap-2">
        <ClipboardCheck size={18} /> Worka Evaluar — suscripciones
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Cuando una empresa paga, activá acá los meses. Renovar antes del
        vencimiento suma los días que le quedaban, no los pierde.
      </p>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-3">
          {error}
        </p>
      )}

      <TestEmail />

      {accounts.length === 0 ? (
        <p className="text-sm text-gray-400 mt-4">
          Todavía no hay ninguna empresa usando Evaluar.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 mt-3">
          {accounts.map((a) => {
            const estado = resolveAccess(a);
            return (
              <div
                key={a.company_id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary-dark truncate">
                    {a.company?.trade_name ??
                      a.company?.company_name ??
                      a.company_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {estado.active
                      ? estado.inTrial
                        ? `En prueba · ${estado.daysLeft} días`
                        : `Paga · vence en ${estado.daysLeft} días`
                      : `Sin acceso (${a.status})`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {done === a.company_id && (
                    <span className="chip bg-emerald-50 text-emerald-700">
                      Listo
                    </span>
                  )}
                  {(["activar_1", "activar_3", "activar_12"] as const).map(
                    (accion, i) => (
                      <button
                        key={accion}
                        disabled={pending}
                        onClick={() => run(a.company_id, accion)}
                        className="btn-secondary text-xs px-3 disabled:opacity-40"
                      >
                        +{[1, 3, 12][i]}{" "}
                        {[1, 3, 12][i] === 1 ? "mes" : "meses"}
                      </button>
                    )
                  )}
                  <button
                    disabled={pending}
                    onClick={() => run(a.company_id, "vencer")}
                    className="btn-danger-outline text-xs px-3 disabled:opacity-40"
                  >
                    Cortar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Prueba de envío de correo. Vive acá porque es una tarea de operaciones:
// cuando un email no llega hay que poder separar en un minuto si el problema
// es la clave, el remitente o el destinatario.
function TestEmail() {
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function probar() {
    setMsg(null);
    startTransition(async () => {
      const r = await sendTestEmail(to);
      setMsg({
        ok: r.ok,
        text: r.ok
          ? "Enviado. Si no aparece en unos minutos, revisá spam y los Logs de Resend."
          : (r.error ?? "No pudimos enviar."),
      });
    });
  }

  return (
    <div className="bg-surface rounded-2xl p-4 mt-4">
      <p className="text-sm font-medium text-primary-dark flex items-center gap-2">
        <Mail size={15} /> Probar el envío de correos
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          className="input flex-1"
          type="email"
          placeholder="tu@email.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          onClick={probar}
          disabled={pending || !to.trim()}
          className="btn-secondary press disabled:opacity-40"
        >
          {pending ? "Enviando…" : "Enviar prueba"}
        </button>
      </div>
      {msg && (
        <p
          className={`text-xs mt-2 ${msg.ok ? "text-success" : "text-danger"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
