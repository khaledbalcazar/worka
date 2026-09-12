"use client";

import { useState, useTransition } from "react";
import { enviarDigestDePrueba } from "@/app/admin/email-actions";

// Manda el correo real a una dirección, con las vacantes reales de hoy.
// La vista previa del iframe muestra el HTML, pero no dice cómo lo recorta
// Gmail, si Outlook rompe una tabla o si el logo llega bloqueado. Eso solo
// se ve abriéndolo en un buzón de verdad.
export default function EnviarPrueba() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ txt: string; mal?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="card p-5">
      <p className="font-semibold text-primary-dark text-sm">
        Probarlo en tu bandeja
      </p>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">
        Manda este mismo correo a una dirección. No toca a nadie más ni marca
        a nadie como avisado.
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
          className="btn-primary shrink-0"
          disabled={!email.trim() || pending}
          onClick={() =>
            startTransition(async () => {
              setMsg(null);
              const r = await enviarDigestDePrueba(email.trim());
              setMsg(
                r.ok
                  ? { txt: `📨 Enviado a ${email.trim()}.` }
                  : { txt: r.error ?? "No pudimos enviarlo.", mal: true }
              );
            })
          }
        >
          {pending ? "Enviando…" : "Enviarme la prueba"}
        </button>
      </div>
      {msg && (
        <p
          className={`text-sm mt-2 font-medium ${
            msg.mal ? "text-danger" : "text-emerald-600"
          }`}
        >
          {msg.txt}
        </p>
      )}
    </div>
  );
}
