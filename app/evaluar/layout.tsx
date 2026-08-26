import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

// Tipografías propias de Evaluar: Playfair para los títulos y DM Sans para el
// texto. Worka Empleos sigue con Inter — son productos hermanos, no iguales.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Worka Evaluar — Selección de personal sin fricción",
    template: "%s | Worka Evaluar",
  },
  description:
    "Software de reclutamiento y evaluación de candidatos. Enlazá tu vacante de Worka y la gente empieza los tests desde el propio aviso. 15 días de prueba gratis.",
};

// El layout solo aporta tipografías: la parte pública se viste de oscuro y el
// panel de trabajo se queda claro. Poner el encabezado acá obligaría a las dos
// a compartir el mismo marco, que es justo lo que no queremos.
export default function EvaluarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable} flex-1 flex flex-col`}>
      {children}
    </div>
  );
}
