// Popup de novedades ("¡Nos renovamos!") que ve cada persona una sola vez al
// entrar a /empleos. El contenido vive en site_settings.whats_new como JSON y
// se edita desde /admin. Sin dependencias de React ni de Supabase para poder
// probarlo aparte.

export const WHATS_NEW_SETTING = "whats_new";

// Íconos permitidos (nombres de lucide-react). Una lista cerrada: el admin
// elige de acá y nada que venga de la base se usa como nombre arbitrario.
export const WHATS_NEW_ICONS = [
  "search",
  "sparkles",
  "map",
  "list-checks",
  "file-text",
  "shield-check",
  "graduation-cap",
  "user-round",
  "bell",
  "message-circle",
  "zap",
  "briefcase",
] as const;

export type WhatsNewIcon = (typeof WHATS_NEW_ICONS)[number];

export type WhatsNewItem = {
  icon: WhatsNewIcon;
  title: string;
  text: string;
  // Enlace interno opcional ("/cv"). Vacío = la tarjeta no lleva botón.
  href: string;
  cta: string;
};

export type WhatsNewConfig = {
  enabled: boolean;
  // Cambiarla vuelve a mostrar el popup a todos (cada navegador recuerda qué
  // versión ya vio).
  version: string;
  badge: string;
  edition: string;
  title: string;
  subtitle: string;
  highlight: string;
  items: WhatsNewItem[];
  footer: string;
  primaryLabel: string;
};

export const MAX_ITEMS = 8;

const LIMITS = {
  badge: 40,
  edition: 40,
  title: 120,
  subtitle: 280,
  highlight: 140,
  footer: 160,
  primaryLabel: 40,
  itemTitle: 60,
  itemText: 220,
  cta: 30,
  href: 200,
  version: 40,
};

export const DEFAULT_WHATS_NEW: WhatsNewConfig = {
  enabled: true,
  version: "2026-10",
  badge: "Actualización 2026",
  edition: "Edición de octubre",
  title: "¡Nos renovamos! Conocé lo nuevo que tenemos para vos en Worka",
  subtitle:
    "Rediseñamos la plataforma para que encuentres trabajo más rápido y con más confianza.",
  highlight: "Tu cuenta, tus postulaciones y tu CV siguen igual que siempre.",
  items: [
    {
      icon: "search",
      title: "Búsqueda renovada",
      text: "Filtrá por ciudad, rubro y modalidad, y mirá el detalle de cada vacante sin perder la lista.",
      href: "/empleos",
      cta: "Buscar empleos",
    },
    {
      icon: "sparkles",
      title: "Compatibilidad con cada vacante",
      text: "Te mostramos qué tanto encaja tu perfil con cada aviso y qué te falta para destacar.",
      href: "/perfil",
      cta: "Completar mi perfil",
    },
    {
      icon: "map",
      title: "Vacantes en el mapa",
      text: "Encontrá trabajo cerca de tu casa y mirá cuánto te queda de camino.",
      href: "/empleos?vista=mapa",
      cta: "Ver el mapa",
    },
    {
      icon: "list-checks",
      title: "Seguimiento de postulaciones",
      text: "Mirá en qué etapa está cada postulación, incluidas las que enviaste a otros portales.",
      href: "/postulaciones",
      cta: "Mis postulaciones",
    },
    {
      icon: "file-text",
      title: "CV en PDF gratis",
      text: "Armá tu currículum con un formato claro y descargalo listo para enviar.",
      href: "/cv",
      cta: "Crear mi CV",
    },
    {
      icon: "shield-check",
      title: "Empresas verificadas",
      text: "El Sello de Confianza te muestra qué empresas verificamos. Nadie serio te cobra por postularte.",
      href: "",
      cta: "",
    },
  ],
  footer: "Worka es y seguirá siendo gratis para candidatos.",
  primaryLabel: "Explorar vacantes",
};

function str(value: unknown, max: number, fallback = ""): string {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

// Solo rutas internas: "/algo". Bloquea "//otro-sitio", "javascript:" y
// cualquier URL absoluta.
export function safeHref(value: unknown): string {
  const href = str(value, LIMITS.href);
  return /^\/(?!\/)[^\s\\]*$/.test(href) ? href : "";
}

function toItem(raw: unknown): WhatsNewItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = str(r.title, LIMITS.itemTitle);
  if (!title) return null;
  const icon = WHATS_NEW_ICONS.includes(r.icon as WhatsNewIcon) ? (r.icon as WhatsNewIcon) : "sparkles";
  const href = safeHref(r.href);
  return {
    icon,
    title,
    text: str(r.text, LIMITS.itemText),
    href,
    cta: href ? str(r.cta, LIMITS.cta) || "Ver más" : "",
  };
}

// Limpia lo que llega del admin o de la base. Lo que no sirve se descarta en
// vez de romper el popup.
export function sanitizeWhatsNew(raw: unknown): WhatsNewConfig {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const items = Array.isArray(r.items)
    ? r.items.map(toItem).filter((i): i is WhatsNewItem => i !== null).slice(0, MAX_ITEMS)
    : [];
  return {
    enabled: r.enabled === true,
    version: str(r.version, LIMITS.version) || DEFAULT_WHATS_NEW.version,
    badge: str(r.badge, LIMITS.badge),
    edition: str(r.edition, LIMITS.edition),
    title: str(r.title, LIMITS.title) || DEFAULT_WHATS_NEW.title,
    subtitle: str(r.subtitle, LIMITS.subtitle),
    highlight: str(r.highlight, LIMITS.highlight),
    items,
    footer: str(r.footer, LIMITS.footer),
    primaryLabel: str(r.primaryLabel, LIMITS.primaryLabel) || DEFAULT_WHATS_NEW.primaryLabel,
  };
}

// Valor guardado en site_settings -> configuración. Sin fila: el contenido
// por defecto, encendido (así sale apenas se publica). Fila ilegible: apagado,
// para no mostrar algo roto.
export function parseWhatsNew(stored: string | null | undefined): WhatsNewConfig {
  if (stored === undefined || stored === null || stored.trim() === "") return DEFAULT_WHATS_NEW;
  try {
    return sanitizeWhatsNew(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_WHATS_NEW, enabled: false };
  }
}

// Lo que se muestra: nada si está apagado o no tiene novedades.
export function activeWhatsNew(stored: string | null | undefined): WhatsNewConfig | null {
  const config = parseWhatsNew(stored);
  return config.enabled && config.items.length > 0 ? config : null;
}

export function seenKey(version: string): string {
  return `worka:novedades:${version}`;
}

// Versión nueva para "Mostrar otra vez a todos".
export function nextVersion(now = new Date()): string {
  return now.toISOString().slice(0, 19).replace(/[-:T]/g, "");
}
