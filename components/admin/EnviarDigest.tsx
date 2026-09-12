"use client";

import { useState, useTransition } from "react";
import {
  enviarDigestATodos,
  enviarDigestDePrueba,
} from "@/app/admin/email-actions";

/* Los dos botones del correo de vacantes: la prueba a una dirección y el
   envío real a la cola.
 *
 * El de "enviar a todos" pide confirmación escrita en pantalla antes de
 * disparar. Un correo a toda la base no se puede retirar: si sale con un
 * error, el error llega a cada bandeja y ahí se queda. Dos clics en vez de
 * uno son barato al lado de eso. */
export default function EnviarDigest({
  cupo,
}: {
  cupo: { hoy: number; mes: number; quedanHoy: number; quedanMes: number } | null;
}) {
  const [email, setEmail] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [msg, setMsg] = useState<{ txt: string; mal?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function aviso(txt: string, mal = false) {
    setMsg({ txt, mal });
  }

  return (
    <div className="space-y-4">
      {cupo && (
        <div className="card p-5">
          <p className="font-semibold text-primary-dark text-sm">
            Cupo de Resend
          </p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Lo comparten todos los correos de Worka: invitaciones a
            entrevistas, avisos de postulación, Evaluar y este resumen.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary-dark">
                {cupo.quedanHoy}
              </p>
              <p className="text-xs text-gray-500">
                quedan hoy · van {cupo.hoy}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-dark">
                {cupo.quedanMes}
              </p>
              <p className="text-xs text-gray-500">
                quedan este mes · van {cupo.mes}
              </p>
            </div>
          </div>
          {cupo.quedanHoy <= 30 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              Quedan pocos envíos hoy. Los últimos 30 están reservados para
              las invitaciones y los avisos, que no pueden esperar: el resumen
              se frena antes de tocarlos y sigue mañana.
            </p>
          )}
        </div>
      )}

      <div className="card p-5">
        <p className="font-semibold text-primary-dark text-sm">
          Probarlo en tu bandeja
        </p>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">
          Manda este mismo correo a una dirección. No toca a nadie más ni
          marca a nadie como avisado.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            className="input flex-1"
            placeholder="vos@worka.click"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn-secondary shrink-0"
            disabled={!email.trim() || pending}
            onClick={() =>
              startTransition(async () => {
                setMsg(null);
                const r = await enviarDigestDePrueba(email.trim());
                aviso(
                  r.ok
                    ? `📨 Enviado a ${email.trim()}.`
                    : r.error ?? "No pudimos enviarlo.",
                  !r.ok
                );
              })
            }
          >
            {pending ? "Enviando…" : "Enviarme la prueba"}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-semibold text-primary-dark text-sm">
          Enviar ahora a todos
        </p>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">
          Manda la tanda que le toca hoy sin esperar a las 10 de mañana.{" "}
          <strong>No le escribe de nuevo</strong> a quien ya lo recibió esta
          semana, así que podés tocarlo dos veces sin duplicar nada.
        </p>

        {!confirmando ? (
          <button
            className="btn-primary"
            disabled={pending}
            onClick={() => {
              setMsg(null);
              setConfirmando(true);
            }}
          >
            📨 Enviar a todos
          </button>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Esto sale a la bandeja de gente real y no se puede deshacer.
            </p>
            <p className="text-xs text-amber-800 mt-1">
              ¿Miraste la vista previa de acá abajo y te mandaste la prueba?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="btn-secondary"
                disabled={pending}
                onClick={() => setConfirmando(false)}
              >
                Todavía no
              </button>
              <button
                className="btn-primary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setMsg(null);
                    const r = await enviarDigestATodos();
                    setConfirmando(false);
                    aviso(
                      r.ok
                        ? r.detalle ?? "Enviado."
                        : r.error ?? "No se pudo enviar.",
                      !r.ok
                    );
                  })
                }
              >
                {pending ? "Enviando…" : "Sí, enviar ahora"}
              </button>
            </div>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`card px-5 py-3 text-sm font-medium ${
            msg.mal
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {msg.txt}
        </div>
      )}
    </div>
  );
}
