"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

// Pasar el enlace a mano: copiarlo o mandarlo por WhatsApp.
//
// El correo no siempre llega (spam, un jefe que no lo lee, una empresa sin
// el envío configurado) y en Paraguay el trabajo se coordina por WhatsApp.
// Con esto RRHH no depende del correo para que el ciclo avance.
export default function EnlaceManual({
  url,
  mensaje,
  compacto = false,
}: {
  url: string;
  /** Texto que acompaña al enlace en WhatsApp. */
  mensaje: string;
  compacto?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Sin permiso de portapapeles: se selecciona en un campo temporal.
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={copiar}
        className={`chip press ${copiado ? "bg-emerald-50 text-emerald-700" : "bg-[#eef5fc] text-[#0a66c2]"}`}
        title={url}
      >
        {copiado ? <Check size={12} /> : <Copy size={12} />}
        {copiado ? "Copiado" : compacto ? "Enlace" : "Copiar enlace"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${mensaje}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="chip press bg-emerald-50 text-emerald-700"
        title="Mandar por WhatsApp"
      >
        <MessageCircle size={12} /> {compacto ? "" : "WhatsApp"}
      </a>
    </span>
  );
}
