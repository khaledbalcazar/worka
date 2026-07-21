import "server-only";
import * as cheerio from "cheerio";
import type { JobSource } from "@/lib/types";

// Vacante ya normalizada, lista para guardar en external_jobs.
export type ParsedJob = {
  external_key: string | null;
  title: string;
  company_name: string;
  description: string;
  city: string | null;
  industry: string | null;
  apply_email: string | null;
  apply_url: string | null;
  source_url: string | null;
  salary_range: string | null;
};

const UA =
  "WorkaBot/1.0 (+https://worka.click; agregador de empleos de Paraguay)";
const TIMEOUT_MS = 15000;
const MAX_ITEMS = 60;

export async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "*/*" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`La fuente respondió ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Chequeo de robots.txt: si el sitio nos prohíbe la ruta, no la tocamos.
 * Es una lectura simple de Disallow para User-agent: * y para WorkaBot.
 * No reemplaza tener permiso del sitio, pero evita el caso obvio.
 */
export async function robotsAllows(url: string): Promise<boolean> {
  try {
    const target = new URL(url);
    const robotsUrl = `${target.origin}/robots.txt`;
    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": UA },
      cache: "no-store",
    });
    if (!res.ok) return true; // sin robots.txt, no hay prohibición
    const txt = await res.text();

    // Junta las reglas de los grupos que nos aplican (* y workabot).
    const lines = txt.split("\n").map((l) => l.trim());
    let applies = false;
    const disallows: string[] = [];
    for (const line of lines) {
      if (!line || line.startsWith("#")) continue;
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.toLowerCase().trim();
      const value = rest.join(":").trim();
      if (key === "user-agent") {
        const agent = value.toLowerCase();
        applies = agent === "*" || agent.includes("workabot");
      } else if (key === "disallow" && applies && value) {
        disallows.push(value);
      }
    }
    const path = target.pathname + target.search;
    return !disallows.some((rule) => path.startsWith(rule));
  } catch {
    return true;
  }
}

// ── Utilidades de texto ──

export function clean(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Guardamos un resumen, no el aviso completo: la fuente conserva su
// contenido y siempre enlazamos de vuelta al original.
export function excerpt(text: string, max = 600): string {
  const t = clean(text);
  return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`;
}

function findEmail(text: string): string | null {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return m ? m[0] : null;
}

function absolute(href: string | undefined, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

// ── Feeds XML (RSS 2.0, Atom y feeds de empleo genéricos) ──

export function parseFeed(xml: string, source: JobSource): ParsedJob[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  // Cada estándar usa un nombre distinto para el ítem.
  let items = $("item");
  if (items.length === 0) items = $("entry");
  if (items.length === 0) items = $("job");

  const jobs: ParsedJob[] = [];
  items.slice(0, MAX_ITEMS).each((_, el) => {
    const node = $(el);
    const pick = (...tags: string[]) => {
      for (const t of tags) {
        const v = node.find(t).first().text().trim();
        if (v) return v;
      }
      return "";
    };

    const title = pick("title", "jobtitle", "position");
    if (!title) return;

    // En Atom el link viene como atributo href.
    const link =
      pick("link", "url", "applyurl") ||
      node.find("link").first().attr("href") ||
      "";
    const rawDesc = pick("description", "summary", "content", "jobdescription");

    jobs.push({
      external_key:
        pick("guid", "id", "referencenumber") || link || title,
      title,
      company_name:
        pick("company", "employer", "hiringorganization") || source.name,
      description: excerpt(rawDesc),
      city: pick("city", "location", "joblocation") || source.default_city,
      industry: pick("category", "industry") || source.default_industry,
      apply_email: findEmail(`${rawDesc} ${pick("email", "applyemail")}`),
      apply_url: absolute(link, source.url),
      source_url: absolute(link, source.url),
      salary_range: pick("salary", "basesalary") || null,
    });
  });
  return jobs;
}

// ── Extracción de HTML por selectores CSS ──

export function parseHtml(html: string, source: JobSource): ParsedJob[] {
  if (!source.sel_item || !source.sel_title) {
    throw new Error(
      "Para una fuente HTML hay que definir al menos el selector del bloque y el del título."
    );
  }
  const $ = cheerio.load(html);
  const jobs: ParsedJob[] = [];

  $(source.sel_item)
    .slice(0, MAX_ITEMS)
    .each((_, el) => {
      const node = $(el);
      const text = (sel: string | null) =>
        sel ? node.find(sel).first().text().trim() : "";

      const title = text(source.sel_title);
      if (!title) return;

      // El link puede estar en el selector indicado o en el propio bloque.
      const linkEl = source.sel_link
        ? node.find(source.sel_link).first()
        : node.is("a")
          ? node
          : node.find("a").first();
      const link = absolute(linkEl.attr("href"), source.url);
      const rawDesc = text(source.sel_description);

      jobs.push({
        external_key: link || title,
        title,
        company_name: text(source.sel_company) || source.name,
        description: excerpt(rawDesc),
        city: text(source.sel_city) || source.default_city,
        industry: source.default_industry,
        apply_email: findEmail(node.text()),
        apply_url: link,
        source_url: link,
        salary_range: null,
      });
    });

  return jobs;
}

/**
 * Trae y normaliza las vacantes de una fuente.
 * Para fuentes HTML exige que robots.txt no lo prohíba.
 */
export async function fetchSource(
  source: JobSource
): Promise<{ jobs: ParsedJob[]; method: string }> {
  // Leer HTML de un sitio ajeno requiere que robots.txt no lo prohíba.
  // Las fuentes serpapi consultan una API licenciada, no scrapean.
  if (source.kind === "html" || source.kind === "auto") {
    const allowed = await robotsAllows(source.url);
    if (!allowed) {
      throw new Error(
        "El robots.txt de ese sitio no permite leer esa ruta. No se importó nada."
      );
    }
  }

  let jobs: ParsedJob[];
  let method: string;

  if (source.kind === "serpapi") {
    const { fetchSerpApi } = await import("./providers/serpapi");
    jobs = await fetchSerpApi(source);
    method = "Google Jobs (SerpApi)";
  } else if (source.kind === "auto") {
    // Detección en cascada: JSON-LD → feed → sitemap → heurística.
    const { autoDiscover } = await import("./discover");
    const result = await autoDiscover(source);
    jobs = result.jobs;
    method = result.method;
  } else if (source.kind === "feed") {
    jobs = parseFeed(await fetchText(source.url), source);
    method = "Feed XML/RSS";
  } else {
    jobs = parseHtml(await fetchText(source.url), source);
    method = "Selectores CSS";
  }

  // Descarta títulos vacíos o repetidos dentro de la misma corrida.
  const seen = new Set<string>();
  const unique = jobs.filter((j) => {
    const key = j.external_key ?? j.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { jobs: unique, method };
}
