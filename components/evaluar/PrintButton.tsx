"use client";

import { Printer } from "lucide-react";

// El navegador ya sabe generar PDF desde el diálogo de impresión ("Guardar
// como PDF"), así que no hace falta sumar una librería para eso.
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary press text-sm">
      <Printer size={15} /> Imprimir o guardar PDF
    </button>
  );
}
