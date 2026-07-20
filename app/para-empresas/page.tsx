import type { Metadata } from "next";
import ParaEmpresasLanding from "@/components/ParaEmpresasLanding";

export const metadata: Metadata = {
  title: "Para empresas — Publicá vacantes gratis",
  description:
    "Encontrá talento local verificado en Paraguay sin pagar un guaraní. Publicá vacantes ilimitadas, gestioná candidatos con un tablero Kanban y contactá por WhatsApp.",
  alternates: { canonical: "/para-empresas" },
};

export default function ParaEmpresasPage() {
  return <ParaEmpresasLanding />;
}
