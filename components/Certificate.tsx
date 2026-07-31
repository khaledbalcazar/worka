"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

// Certificado imprimible. El botón se oculta al imprimir (@media print).
export default function Certificate({
  name,
  courseTitle,
  dateStr,
  courseSlug,
}: {
  name: string;
  courseTitle: string;
  dateStr: string;
  courseSlug: string;
}) {
  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .cert-page { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto mb-5 flex items-center justify-between no-print">
        <Link
          href={`/academia/${courseSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium"
        >
          <ArrowLeft size={16} /> Volver al curso
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Printer size={16} /> Imprimir / Descargar PDF
        </button>
      </div>

      {/* El certificado */}
      <div className="cert-page max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-2 bg-gradient-to-r from-primary via-primary-dark to-primary">
          <div className="border-2 border-amber-300/60 rounded-xl bg-white px-8 py-12 text-center relative overflow-hidden">
            {/* Sello */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10" />
            <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-primary/5" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-2xl font-extrabold text-primary-dark tracking-tight">
                  Work<span className="text-primary">a</span>
                </span>
              </div>
              <p className="text-[0.7rem] tracking-[0.3em] text-amber-600 uppercase font-semibold mt-2">
                Academia Worka
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark mt-6">
                Certificado de finalización
              </h1>
              <p className="text-gray-400 mt-6 text-sm">Otorgado a</p>
              <p
                className="text-3xl sm:text-4xl mt-1 text-primary-dark"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {name}
              </p>

              <div className="w-24 h-px bg-amber-300 mx-auto my-6" />

              <p className="text-gray-500 text-sm">
                por completar con éxito el curso
              </p>
              <p className="text-xl font-bold text-primary mt-1">
                {courseTitle}
              </p>

              {/* Sello circular */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Fecha</p>
                  <p className="text-sm font-semibold text-primary-dark">
                    {dateStr}
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-lg">
                  <div className="text-center leading-tight">
                    <div className="text-[0.55rem] font-bold tracking-wide">
                      WORKA
                    </div>
                    <div className="text-lg">★</div>
                    <div className="text-[0.5rem]">ACADEMIA</div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Emitido por</p>
                  <p className="text-sm font-semibold text-primary-dark">
                    Worka
                  </p>
                </div>
              </div>

              <p className="text-[0.65rem] text-gray-300 mt-8">
                Verificable en worka.click/academia · Certificado gratuito
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
