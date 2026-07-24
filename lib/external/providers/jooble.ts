import "server-only";
import type { JobSource } from "@/lib/types";
import { INDUSTRIES } from "@/lib/mock-data";
import { countryByCode } from "@/lib/countries";
import { clean, excerpt, type ParsedJob } from "../importer";

// Conector de Jooble. Agregador de empleos con cobertura de Paraguay.
// Se consulta por POST con la API key en la URL.
// Docs: https://jooble.org/api/about

type JoobleJob = {
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
  id?: number | string;
};

function guessIndustry(title: string, fallback: string | null): string | null {
  const t = title.toLowerCase();
  const hit = INDUSTRIES.find((i) => t.includes(i.toLowerCase()));
  return hit ?? fallback;
}

function findEmail(text: string): string | null {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return m ? m[0] : null;
}

function cleanCity(
  location: string | undefined,
  fallback: string | null
): string | null {
  if (!location) return fallback;
  const city = location.split(",")[0].trim();
  if (!city || /paraguay/i.test(city)) return fallback;
  return city;
}

// Solo dejamos pasar avisos de Paraguay: Jooble a veces devuelve de países
// cercanos aunque pidamos location=Paraguay.
function isParaguay(location: string | undefined): boolean {
  if (!location) return true; // sin dato, confiamos en el filtro de la API
  const l = location.toLowerCase();
  const otros = [
    "argentina",
    "brasil",
    "brazil",
    "bolivia",
    "uruguay",
    "chile",
    "españa",
    "espana",
    "spain",
    "méxico",
    "mexico",
    "colombia",
    "perú",
    "peru",
  ];
  return !otros.some((c) => l.includes(c));
}

export async function fetchJooble(source: JobSource): Promise<ParsedJob[]> {
  const apiKey = process.env.JOOBLE_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable JOOBLE_KEY. Cargala en Vercel → Environment Variables."
    );
  }

  const res = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Jooble está detrás de un filtro que bloquea peticiones sin navegador.
      "User-Agent":
        "Mozilla/5.0 (compatible; WorkaBot/1.0; +https://worka.click)",
    },
    body: JSON.stringify({
      keywords: source.url.trim(),
      location: countryByCode(source.country).joobleLocation,
    }),
    cache: "no-store",
  });
  if (res.status === 403) {
    throw new Error(
      "Jooble devolvió 403 (bloqueó la IP del servidor). Suele pasar con IPs de datacenter; puede requerir que Jooble habilite tu dominio/IP. Escribiles respondiendo el correo de tu API key."
    );
  }
  if (!res.ok) {
    throw new Error(`Jooble respondió ${res.status}. Revisá la API key.`);
  }
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("json")) {
    throw new Error(
      "Jooble no devolvió JSON (probablemente bloqueó la petición). Verificá la API key y que tu plan esté activo."
    );
  }

  const data = (await res.json()) as { jobs?: JoobleJob[] };
  const results = data.jobs ?? [];
  const maxAge = source.max_age_hours ?? 24;
  const now = Date.now();
  const jobs: ParsedJob[] = [];

  for (const j of results) {
    if (!j.title) continue;
    if (!isParaguay(j.location)) continue;

    // Frescura: descarta lo que supere la ventana pedida.
    if (j.updated) {
      const ts = Date.parse(j.updated);
      if (!isNaN(ts)) {
        const ageHours = (now - ts) / (1000 * 60 * 60);
        if (ageHours > maxAge) continue;
      }
    }

    const snippet = clean(j.snippet);
    jobs.push({
      external_key: j.id ? String(j.id) : j.link || j.title,
      title: clean(j.title),
      company_name: clean(j.company) || j.source || source.name,
      company_logo_url: null,
      description: excerpt(snippet),
      city: cleanCity(j.location, source.default_city),
      industry: guessIndustry(j.title, source.default_industry),
      apply_email: findEmail(snippet),
      apply_url: j.link ?? null,
      source_url: j.link ?? null,
      salary_range: j.salary ? clean(j.salary) : null,
    });
  }

  return jobs;
}
