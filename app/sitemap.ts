import type { MetadataRoute } from "next";
import { getActiveJobs, getAllCompanies } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";

// Sitemap DINÁMICO: incluye automáticamente cada vacante activa y cada
// empresa verificada, además de las páginas públicas. Es lo que Google Search
// Console y Google for Jobs leen para indexar la app. Se regenera cada hora.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/empleos", priority: 0.9 },
    { path: "/para-empresas", priority: 0.8 },
    { path: "/registro", priority: 0.7 },
    { path: "/ingresar", priority: 0.6 },
    { path: "/empresa/registro", priority: 0.7 },
    { path: "/salarios", priority: 0.6 },
    { path: "/cv", priority: 0.6 },
    { path: "/juegos", priority: 0.5 },
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

  return entries;
}
