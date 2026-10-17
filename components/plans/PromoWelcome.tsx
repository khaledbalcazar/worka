"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, Crown, Plus, X } from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import { ENTERPRISE_BRAND } from "@/lib/plans";
import { formatDate } from "@/lib/format";
import { startCompanyTour } from "@/components/CompanyTour";

// Bienvenida en el panel a la empresa que acaba de canjear la promoción de
// lanzamiento: confirma el plan, invita a publicar y ofrece la guía.
export default function PromoWelcome({
  company,
  code,
  endsAt,
  hasJobs,
}: {
  company: string;
  code: string | null;
  endsAt: string;
  hasJobs: boolean;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    celebrate();
  }, []);

  if (!open) return null;

  return (
    <section className="relative overflow-hidden rounded-xl text-white bg-[radial-gradient(120%_160%_at_100%_0%,#2f8ae0_0%,#0a66c2_45%,#004182_100%)] animate-fade-up">
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cerrar bienvenida"
        className="absolute top-2.5 right-2.5 w-9 h-9 grid place-items-center rounded-full hover:bg-white/15"
      >
        <X size={18} />
      </button>
      <div className="p-5 sm:p-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0 pr-8">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 rounded-full px-2.5 py-1">
            <Crown size={13} /> {ENTERPRISE_BRAND} · Pro + Worka Evaluar activos
          </p>
          <h2 className="mt-3 text-[22px] sm:text-[26px] leading-tight font-light tracking-[-0.015em]">
            ¡Bienvenidos a Worka, <strong className="font-semibold">{company}</strong>!
          </h2>
          <p className="mt-2 text-[14px] text-white/85 max-w-2xl">
            {code ? <>Canjeaste <strong className="font-mono tracking-[.08em] text-white">{code}</strong>: tenés </> : "Tenés "}
            vacantes sin límite, destacados, alertas urgentes, búsqueda de talento y{" "}
            <Link href="/evaluar/app" className="underline font-semibold text-white">Worka Evaluar · Profesional</Link> sin costo hasta el{" "}
            <strong className="text-white">{formatDate(endsAt)}</strong>. Te mandamos los detalles por correo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/empresa/vacantes/nueva"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#0a66c2] font-semibold text-sm px-5 min-h-11 rounded-full hover:bg-white/90"
          >
            <Plus size={16} strokeWidth={2.4} /> {hasJobs ? "Publicar otra vacante" : "Crear mi primera vacante"}
          </Link>
          <button
            type="button"
            onClick={startCompanyTour}
            className="inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-5 min-h-11 rounded-full border border-white/60 hover:bg-white/10"
          >
            <Compass size={16} /> Hacer el recorrido
          </button>
        </div>
      </div>
    </section>
  );
}
