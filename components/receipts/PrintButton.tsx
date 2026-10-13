"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Imprimir / Descargar PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      <Printer size={16} /> {label}
    </button>
  );
}
