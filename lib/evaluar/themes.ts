// Plantillas de diseño de la evaluación.
//
// Son tres estilos, no un editor de temas: dar veinte perillas a una empresa
// que solo quiere contratar a alguien termina en pantallas feas. Encima de la
// plantilla se aplica el color de la empresa, si tiene.
export type ThemeKey = "sobrio" | "moderno" | "calido";

export type Theme = {
  key: ThemeKey;
  name: string;
  hint: string;
  /** Color por defecto cuando la empresa no definió el suyo. */
  accent: string;
  /** Clases del fondo de la página y de las tarjetas. */
  page: string;
  card: string;
  heading: string;
  muted: string;
  /** Estilo de la cabecera con el logo. */
  header: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  sobrio: {
    key: "sobrio",
    name: "Sobrio",
    hint: "Formal y neutro. Va bien con bancos, estudios y empresas grandes.",
    accent: "#2563eb",
    page: "bg-slate-50",
    card: "bg-white border border-slate-200 rounded-2xl",
    heading: "text-slate-900",
    muted: "text-slate-500",
    header: "bg-white border-b border-slate-200",
  },
  moderno: {
    key: "moderno",
    name: "Moderno",
    hint: "Limpio y con contraste. Para tecnología, retail y startups.",
    accent: "#4f46e5",
    page: "bg-slate-100",
    card: "bg-white border border-slate-200/70 rounded-3xl shadow-sm",
    heading: "text-slate-900",
    muted: "text-slate-500",
    header: "bg-slate-900 text-white",
  },
  calido: {
    key: "calido",
    name: "Cálido",
    hint: "Cercano y amable. Para gastronomía, comercio y atención al público.",
    accent: "#ea580c",
    page: "bg-amber-50/60",
    card: "bg-white border border-amber-200/70 rounded-3xl",
    heading: "text-stone-900",
    muted: "text-stone-500",
    header: "bg-white border-b border-amber-200/70",
  },
};

export function getTheme(key: string | null | undefined): Theme {
  return THEMES[(key as ThemeKey) ?? "sobrio"] ?? THEMES.sobrio;
}

// Un color de marca sirve de fondo solo si el texto encima se lee. Se calcula
// la luminancia para decidir entre texto blanco o negro, en vez de asumir que
// todas las marcas son oscuras.
export function readableOn(hex: string): "#ffffff" | "#111827" {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.45 ? "#111827" : "#ffffff";
}
