import "server-only";
import * as cheerio from "cheerio";
import type { JobSource } from "@/lib/types";
import { type ParsedJob, fetchText, parseFeed, clean, excerpt } from "./importer";

// Resultado de una detección: las vacantes y qué método terminó sirviendo,
// para poder mostrárselo al admin.
export type DiscoverResult = {
  jobs: ParsedJob[];
  method: string;
};

const MAX_DETAIL_PAGES = 25;

/* ────────── Capa 1: JSON-LD schema.org/JobPosting ────────── */

// Los sitios anidan el JobPosting de muchas formas: suelto, dentro de un
// array, o bajo @graph. Esto los aplana todos.
function collectNodes(value: unknown, out: Record<string, unknown>[]) {
  if (Array.isArray(value)) {
    for (const v of value) collectNodes(v, out);
    return;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    out.push(obj);
    if (obj["@graph"]) collectNodes(obj["@graph"], out);
  }
}

function isJobPosting(node: Record<string, unknown>): boolean {
  const type = node["@type"];
  if (typeof type === "string") return type === "JobPosting";
  if (Array.isArray(type)) return type.includes("JobPosting");
  return false;
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return textOf(value[0]);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return textOf(obj.name ?? obj["@value"] ?? obj.value ?? "");
  }
  return "";
}

// Saca la ciudad de jobLocation, que puede venir muy anidado.
function cityOf(node: Record<string, unknown>): string {
  const loc = node.jobLocation;
  const nodes: Record<string, unknown>[] = [];
  collectNodes(loc, nodes);
  for (const n of nodes) {
    const addr = n.address as Record<string, unknown> | undefined;
    if (addr) {
      const city = textOf(addr.addressLocality ?? addr.addressRegion);
      if (city) return city;
    }
    const direct = textOf(n.addressLocality);
    if (direct) return direct;
  }
  return "";
}

function jobFromJsonLd(
  node: Record<string, unknown>,
  pageUrl: string,
  source: JobSource
): ParsedJob | null {
  const title = clean(textOf(node.title));
  if (!title) return null;

  const org = node.hiringOrganization as Record<string, unknown> | undefined;
  const description = excerpt(textOf(node.description));
  const url = textOf(node.url) || pageUrl;

  // El correo puede venir en applicationContact o suelto en la descripción.
  const contact = node.applicationContact as Record<string, unknown> | undefined;
  const emailRaw = textOf(contact?.email);
  const emailMatch = `${emailRaw} ${description}`.match(
    /[\w.+-]+@[\w-]+\.[\w.]+/
  );

  const salary = node.baseSalary as Record<string, unknown> | undefined;
  const salaryValue = salary
    ? textOf((salary.value as Record<string, unknown>)?.value ?? salary.value)
    : "";

  return {
    // La URL primero: es lo único garantizado como único por aviso.
    // `identifier` suele venir como PropertyValue y puede repetirse entre
    // vacantes de una misma empresa, lo que las haría pisarse al deduplicar.
    external_key: url || textOf(node.identifier) || title,
    title,
    company_name: clean(textOf(org?.name)) || source.name,
    company_logo_url: textOf(org?.logo).trim() || null,
    description,
    city: clean(cityOf(node)) || source.default_city,
    industry: clean(textOf(node.industry)) || source.default_industry,
    apply_email: emailMatch ? emailMatch[0] : null,
    apply_url: url,
    source_url: url,
    salary_range: salaryValue ? clean(salaryValue) : null,
  };
}

export function extractJsonLd(
  html: string,
  pageUrl: string,
  source: JobSource
): ParsedJob[] {
  const $ = cheerio.load(html);
  const nodes: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      collectNodes(JSON.parse(raw), nodes);
    } catch {
      // JSON roto: lo ignoramos en vez de tumbar toda la importación.
    }
  });

  const jobs: ParsedJob[] = [];
  for (const node of nodes) {
    if (!isJobPosting(node)) continue;
    const job = jobFromJsonLd(node, pageUrl, source);
    if (job) jobs.push(job);
  }
  return jobs;
}

/* ────────── Capa 2: autodescubrimiento de feeds ────────── */

function findFeedUrl(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);
  const link = $(
    'link[type="application/rss+xml"], link[type="application/atom+xml"]'
  )
    .first()
    .attr("href");
  if (link) {
    try {
      return new URL(link, baseUrl).toString();
    } catch {
      return null;
    }
  }
  return null;
}

const COMMON_FEEDS = ["/feed", "/rss", "/feed.xml", "/rss.xml", "/jobs.xml"];

/* ────────── Capa 3: sitemap ────────── */

// Palabras que suelen aparecer en la URL de un aviso individual.
const JOB_URL_HINT = /(job|empleo|vacante|puesto|oferta|trabajo|career)/i;

async function urlsFromSitemap(origin: string): Promise<string[]> {
  try {
    const xml = await fetchText(`${origin}/sitemap.xml`);
    const $ = cheerio.load(xml, { xmlMode: true });

    // Si es un índice de sitemaps, entramos al primero que parezca de empleos.
    const sitemaps = $("sitemap > loc")
      .map((_, el) => $(el).text().trim())
      .get();
    if (sitemaps.length > 0) {
      const target =
        sitemaps.find((s) => JOB_URL_HINT.test(s)) ?? sitemaps[0];
      const inner = await fetchText(target);
      const $inner = cheerio.load(inner, { xmlMode: true });
      return $inner("url > loc")
        .map((_, el) => $inner(el).text().trim())
        .get()
        .filter((u) => JOB_URL_HINT.test(u));
    }

    return $("url > loc")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((u) => JOB_URL_HINT.test(u));
  } catch {
    return [];
  }
}

/* ────────── Capa 4: heurística de bloques repetidos ────────── */

// Último recurso: buscar enlaces que apunten a avisos y quedarnos con su
// texto. Da menos datos, pero sirve para no volver con las manos vacías.
function heuristicLinks(
  html: string,
  baseUrl: string,
  source: JobSource
): ParsedJob[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const jobs: ParsedJob[] = [];

  $("a[href]").each((_, el) => {
    if (jobs.length >= 40) return;
    const href = $(el).attr("href") ?? "";
    if (!JOB_URL_HINT.test(href)) return;

    const title = clean($(el).text());
    // Descarta enlaces de navegación ("Ver empleos", "Empleos") y ruido.
    if (title.length < 12 || title.length > 120) return;

    let abs: string;
    try {
      abs = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    if (seen.has(abs)) return;
    seen.add(abs);

    jobs.push({
      external_key: abs,
      title,
      company_name: source.name,
      company_logo_url: null,
      description: "",
      city: source.default_city,
      industry: source.default_industry,
      apply_email: null,
      apply_url: abs,
      source_url: abs,
      salary_range: null,
    });
  });

  return jobs;
}

/* ────────── Orquestador ────────── */

/**
 * Recibe una URL y prueba las estrategias en cascada hasta encontrar avisos.
 * Devuelve también qué método funcionó, para mostrarlo en el admin.
 */
export async function autoDiscover(source: JobSource): Promise<DiscoverResult> {
  const base = new URL(source.url);
  const html = await fetchText(source.url);

  // 1. JSON-LD en la propia página (listados que lo incrustan por aviso).
  const inline = extractJsonLd(html, source.url, source);
  if (inline.length > 0) {
    return { jobs: inline, method: `JSON-LD en la página (${inline.length})` };
  }

  // 2. Feed declarado en el <head> o en una ruta típica.
  const declared = findFeedUrl(html, source.url);
  const candidates = declared
    ? [declared]
    : COMMON_FEEDS.map((p) => `${base.origin}${p}`);
  for (const candidate of candidates) {
    try {
      const xml = await fetchText(candidate);
      if (!xml.trimStart().startsWith("<")) continue;
      const jobs = parseFeed(xml, source);
      if (jobs.length > 0) {
        return { jobs, method: `Feed detectado: ${candidate} (${jobs.length})` };
      }
    } catch {
      // Ese candidato no existe: seguimos con el próximo.
    }
  }

  // 3. Sitemap: juntamos URLs de avisos y leemos el JSON-LD de cada una.
  const sitemapUrls = await urlsFromSitemap(base.origin);
  if (sitemapUrls.length > 0) {
    const jobs: ParsedJob[] = [];
    for (const url of sitemapUrls.slice(0, MAX_DETAIL_PAGES)) {
      try {
        const page = await fetchText(url);
        jobs.push(...extractJsonLd(page, url, source));
      } catch {
        // Un aviso caído no debe frenar al resto.
      }
    }
    if (jobs.length > 0) {
      return {
        jobs,
        method: `Sitemap + JSON-LD (${jobs.length} de ${sitemapUrls.length} URLs)`,
      };
    }
  }

  // 4. Heurística sobre los enlaces de la página.
  const guessed = heuristicLinks(html, source.url, source);
  if (guessed.length > 0) {
    return {
      jobs: guessed,
      method: `Heurística de enlaces (${guessed.length}) — datos incompletos`,
    };
  }

  return { jobs: [], method: "Sin resultados" };
}
