import type { MetadataRoute } from "next";
import {
  getActiveJobs,
  getAllCompanies,
  getAllExternalJobsForSitemap,
  getPublishedPosts,
  getPublishedCourses,
} from "@/lib/data";
import { COUNTRIES } from "@/lib/countries";
import { SITE_URL, evaluarUrl } from "@/lib/supabase/config";

// Sitemap DINÁMICO: incluye automáticamente cada vacante activa y cada
// empresa verificada, además de las páginas públicas. Es lo que Google Search
// Console y Google for Jobs leen para indexar la app. Se regenera cada hora.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  // Worka Evaluar es un producto aparte y vive en su propio subdominio. Las
  // URLs van con evaluar.worka.click, que es lo que declara el canonical de
  // cada pagina: listarlas como /evaluar contradiria esa senal y dejaria a
  // Google eligiendo cual de las dos indexar.
  //
  // Para que entren hay que verificar evaluar.worka.click en Search Console
  // ademas del dominio principal. Sin eso Google ignora las URLs de otro host
  // dentro de este sitemap.
  const evaluarRoutes: MetadataRoute.Sitemap = [
    {
      url: evaluarUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: evaluarUrl("/precios"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/empleos", priority: 0.9 },
    { path: "/para-empresas", priority: 0.8 },
    { path: "/blog", priority: 0.8 },
    { path: "/academia", priority: 0.7 },
    // Landings por país
    ...COUNTRIES.map((c) => ({ path: `/${c.slug}`, priority: 0.8 })),
    { path: "/registro", priority: 0.7 },
    { path: "/empresa/registro", priority: 0.7 },
    { path: "/salarios", priority: 0.6 },
    { path: "/terminos", priority: 0.3 },
    { path: "/privacidad", priority: 0.3 },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: r.priority,
  }));

  try {
    // Cada vacante activa: clave para Google for Jobs (usan el JSON-LD del
    // detalle + este sitemap para descubrir e indexar las vacantes).
    const jobs = await getActiveJobs();
    for (const job of jobs) {
      entries.push({
        url: `${base}/empleo/${job.id}`,
        lastModified: new Date(job.created_at),
        changeFrequency: "daily",
        priority: 0.9,
      });
    }

    // Vacantes externas activas: también llevan JSON-LD de JobPosting, así
    // que Google for Jobs las puede indexar y traen tráfico a la plataforma.
    //
    // Se piden TODAS, no las del feed: aquella consulta corta en 200 y dejaba
    // fuera del sitemap a las vacantes regionales, que por eso nunca se
    // indexaban.
    const external = await getAllExternalJobsForSitemap();
    for (const job of external) {
      entries.push({
        url: `${base}/empleo/externo/${job.id}`,
        lastModified: new Date(job.imported_at),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }

    // Páginas públicas de empresas verificadas.
    const companies = await getAllCompanies();
    for (const c of companies.filter((x) => x.is_verified)) {
      entries.push({
        url: `${base}/empresas/${c.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // Si Supabase no responde, al menos devolvemos las rutas estáticas.
  }

  return [...evaluarRoutes, ...entries];
}
