// Armado del XML de los sitemaps (protocolo https://www.sitemaps.org/protocol.html).
// Sin dependencias de Next ni de Supabase, para poder probarlo aparte.

export type SitemapUrl = {
  loc: string;
  // Fecha real de modificación. Si no hay una, se omite: inventar "ahora"
  // le dice a Google que todo cambió en cada visita y le quita valor.
  lastmod?: string | Date | null;
};

// Google admite hasta 50.000 URLs y 50 MB por archivo. Se corta antes para
// tener margen sin tener que medir bytes.
export const MAX_URLS_PER_SITEMAP = 45_000;

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>';
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// W3C Datetime en UTC. Fechas inválidas o futuras se descartan.
export function toLastmod(value: SitemapUrl["lastmod"], now = new Date()): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() > now.getTime() + 60_000) return null;
  return date.toISOString();
}

function entry(tag: "url" | "sitemap", url: SitemapUrl, now: Date): string {
  const lastmod = toLastmod(url.lastmod, now);
  return `<${tag}><loc>${escapeXml(url.loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</${tag}>`;
}

export function renderUrlset(urls: SitemapUrl[], now = new Date()): string {
  return `${XML_HEAD}\n<urlset ${NS}>\n${urls.map((u) => entry("url", u, now)).join("\n")}\n</urlset>\n`;
}

export function renderSitemapIndex(sitemaps: SitemapUrl[], now = new Date()): string {
  return `${XML_HEAD}\n<sitemapindex ${NS}>\n${sitemaps.map((s) => entry("sitemap", s, now)).join("\n")}\n</sitemapindex>\n`;
}

// Quita duplicados (la primera aparición gana) y URLs que no son http(s)
// absolutas o que no pertenecen al host del sitemap.
export function normalizeUrls(urls: SitemapUrl[], base: string): SitemapUrl[] {
  const host = new URL(base).host;
  const seen = new Set<string>();
  const out: SitemapUrl[] = [];
  for (const u of urls) {
    let parsed: URL;
    try {
      parsed = new URL(u.loc);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(parsed.protocol) || parsed.host !== host) continue;
    if (seen.has(parsed.href)) continue;
    seen.add(parsed.href);
    out.push({ ...u, loc: parsed.href });
  }
  return out;
}

export function partCount(total: number): number {
  return Math.max(1, Math.ceil(total / MAX_URLS_PER_SITEMAP));
}

export function slicePart(urls: SitemapUrl[], part: number): SitemapUrl[] {
  return urls.slice(part * MAX_URLS_PER_SITEMAP, (part + 1) * MAX_URLS_PER_SITEMAP);
}

// La fecha de una parte es la más reciente de sus URLs (o ninguna).
export function newestLastmod(urls: SitemapUrl[], now = new Date()): string | null {
  let newest: string | null = null;
  for (const u of urls) {
    const d = toLastmod(u.lastmod, now);
    if (d && (!newest || d > newest)) newest = d;
  }
  return newest;
}

// "/sitemap/3.xml" -> 3. Cualquier otra cosa -> null.
export function parsePart(param: string): number | null {
  const match = /^(\d{1,4})\.xml$/.exec(param);
  return match ? Number(match[1]) : null;
}
