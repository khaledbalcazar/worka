// Constantes y helpers de Worka Freelancers, seguros para cliente y servidor.

export const FREELANCER_CATEGORIES = [
  "Diseño",
  "Desarrollo y Programación",
  "Marketing Digital",
  "Redacción y Traducción",
  "Video y Animación",
  "Fotografía",
  "Música y Audio",
  "Negocios y Consultoría",
  "Datos y Análisis",
  "Soporte y Administración",
  "Legales y Contabilidad",
  "General",
] as const;

export type FreelancerCategory = (typeof FREELANCER_CATEGORIES)[number];

export const AVAILABILITY_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  disponible: { label: "Disponible", color: "#10B981" },
  ocupado: { label: "Ocupado", color: "#F59E0B" },
  no_disponible: { label: "No disponible", color: "#9CA3AF" },
};

// Formatea un precio con el símbolo de la moneda del freelancer.
// Guaraníes y pesos chilenos/colombianos no usan decimales.
export function formatPrice(
  amount: number | null | undefined,
  currency: string
): string {
  if (amount == null) return "A convenir";
  const symbols: Record<string, string> = {
    PYG: "Gs",
    ARS: "$",
    MXN: "$",
    COP: "$",
    CLP: "$",
    BOB: "Bs",
    USD: "US$",
  };
  const sym = symbols[currency] ?? "";
  return `${sym} ${amount.toLocaleString("es")}`.trim();
}

export const CURRENCY_OPTIONS = [
  { code: "PYG", label: "Guaraníes (Gs)" },
  { code: "USD", label: "Dólares (US$)" },
  { code: "ARS", label: "Pesos argentinos ($)" },
  { code: "MXN", label: "Pesos mexicanos ($)" },
  { code: "COP", label: "Pesos colombianos ($)" },
  { code: "CLP", label: "Pesos chilenos ($)" },
  { code: "BOB", label: "Bolivianos (Bs)" },
];
