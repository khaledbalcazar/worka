import "server-only";
import type { JobSource } from "@/lib/types";
import { INDUSTRIES } from "@/lib/mock-data";
import type { ParsedJob } from "../importer";

// Conector de Google Jobs vía SerpApi. Trae avisos reales (incluye los que
// LinkedIn publica en Google for Jobs) filtrados a Paraguay y recientes.
// Es la vía legal y estable: SerpApi está licenciada para redistribuir
// estos resultados, así no scrapeamos LinkedIn a mano.
//
// Docs: https://serpapi.com/google-jobs-api

type SerpJob = {
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  job_id?: string;
  via?: string;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
  };
  apply_options?: { title?: string; link?: string }[];
  share_link?: string;
  related_links?: { link?: string; text?: string }[];
};

// "hace 22 horas", "1 day ago", "30 minutes ago" → horas aproximadas.
// SerpApi devuelve posted_at en el idioma pedido (hl=es), por eso cubrimos
// las dos formas.
function ageInHours(postedAt: string | undefined): number | null {
  if (!postedAt) return null;
  const s = postedAt.toLowerCase();
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
  if (/(minut|minute)/.test(s)) return isNaN(num) ? 0 : num / 60;
  if (/(hora|hour)/.test(s)) return isNaN(num) ? 1 : num;
  if (/(día|dia|day)/.test(s)) return isNaN(num) ? 24 : num * 24;
  if (/(semana|week)/.test(s)) return isNaN(num) ? 168 : num * 168;
  if (/(mes|month)/.test(s)) return isNaN(num) ? 720 : num * 720;
  return null;
}

// Adivina el rubro de Worka a partir del título; si no, usa el de la fuente.
function guessIndustry(title: string, fallback: string | null): string | null {
  const t = title.toLowerCase();
  const hit = INDUSTRIES.find((i) => t.includes(i.toLowerCase()));
  return hit ?? fallback;
}

function findEmail(text: string): string | null {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return m ? m[0] : null;
}

// Limpia la ciudad: SerpApi da "Asunción, Paraguay" o "Paraguay".
function cleanCity(location: string | undefined, fallback: string | null): string | null {
  if (!location) return fallback;
  const city = location.split(",")[0].trim();
  if (!city || /paraguay/i.test(city)) return fallback;
  return city;
}

export async function fetchSerpApi(source: JobSource): Promise<ParsedJob[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable SERPAPI_KEY. Cargala en Vercel → Environment Variables."
    );
  }

  const query = source.url.trim() || "empleos";
  const params = new URLSearchParams({
    engine: "google_jobs",
    q: query,
    hl: "es",
    gl: "py",
    google_domain: "google.com.py",
    location: "Paraguay",
    api_key: apiKey,
  });
  // Filtro de fecha de Google Jobs: hoy = últimas 24 horas aprox.
  const maxAge = source.max_age_hours ?? 24;
  if (maxAge <= 24) params.set("chips", "date_posted:today");
  else if (maxAge <= 72) params.set("chips", "date_posted:3days");
  else if (maxAge <= 168) params.set("chips", "date_posted:week");

  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`SerpApi respondió ${res.status}. Revisá la API key o el plan.`);
  }
  const data = (await res.json()) as {
    jobs_results?: SerpJob[];
    error?: string;
  };
  if (data.error) throw new Error(`SerpApi: ${data.error}`);

  const results = data.jobs_results ?? [];
  const jobs: ParsedJob[] = [];

  for (const j of results) {
    if (!j.title) continue;

    // Frescura: descartamos lo que supere la ventana pedida.
    const age = ageInHours(j.detected_extensions?.posted_at);
    if (age !== null && age > maxAge) continue;

    const apply =
      j.apply_options?.find((o) => o.link)?.link ??
      j.share_link ??
      j.related_links?.[0]?.link ??
      null;
    const description = (j.description ?? "").slice(0, 600).trim();

    jobs.push({
      // job_id de SerpApi es estable por aviso: sirve para deduplicar.
      external_key: j.job_id || apply || `${j.title}-${j.company_name}`,
      title: j.title.trim(),
      company_name: j.company_name?.trim() || source.name,
      description,
      city: cleanCity(j.location, source.default_city),
      industry: guessIndustry(j.title, source.default_industry),
      apply_email: findEmail(description),
      apply_url: apply,
      source_url: apply,
      salary_range: j.detected_extensions?.salary ?? null,
    });
  }

  return jobs;
}
