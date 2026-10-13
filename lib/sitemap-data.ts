import "server-only";
import { createClient } from "@supabase/supabase-js";
import { COUNTRIES } from "@/lib/countries";
import { CANONICAL_URL, SUPABASE_ANON_KEY, SUPABASE_URL, evaluarUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { RECURSOS } from "@/lib/evaluar/recursos";
import * as mock from "@/lib/mock-data";
import { normalizeUrls, type SitemapUrl } from "@/lib/sitemap";

// URLs públicas e indexables de worka.click para el sitemap.
//
// Antes el sitemap usaba el cliente de Supabase del servidor, que lee
// cookies(): eso volvía la ruta dinámica (se ignoraba el revalidate) y cada
// visita de Googlebot disparaba todas las consultas de nuevo. Si tardaban,
// Search Console anotaba "No se ha podido obtener". Acá se usa un cliente
// anónimo y sin cookies: la ruta se cachea y solo ve lo que la RLS deja ver
// a cualquier visitante, que es exactamente lo que debe ir al sitemap.

// Cada consulta tiene tiempo límite: una base lenta no puede colgar el
// sitemap entero.
const QUERY_TIMEOUT_MS = 8_000;
const PAGE = 1_000;

// Hubs públicos. Sin lastModified: no hay una fecha real de modificación y
// "ahora" sería inventarla. Quedan fuera las pantallas de acceso (ingresar,
// registro) y todo lo privado (paneles, mensajes, postulaciones, perfil).
const STATIC_PATHS = [
  "/",
  "/empleos",
  "/para-empresas",
  "/salarios",
  "/opiniones",
  "/freelancers",
  "/panorama",
  "/blog",
  "/academia",
  ...COUNTRIES.map((c) => `/${c.slug}`),
  "/worka-pro",
  "/enterprise-pro",
  ...COUNTRIES.flatMap((c) => [`/worka-pro/${c.slug}`, `/enterprise-pro/${c.slug}`]),
  "/terminos",
  "/privacidad",
];

function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(QUERY_TIMEOUT_MS) }),
    },
  });
}

type Client = ReturnType<typeof anonClient>;

// Trae todas las filas de a páginas de 1000 (límite de PostgREST).
async function paged<T>(
  run: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await run(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) return out;
  }
}

const sections: Record<string, (db: Client, base: string) => Promise<SitemapUrl[]>> = {
  // Vacantes de Worka activas y vigentes: las mismas que lista /empleos y que
  // /empleo/[id] muestra. La tabla no guarda fecha de edición; created_at es
  // la única fecha real que hay.
  async jobs(db, base) {
    const now = new Date().toISOString();
    const rows = await paged<{ id: string; created_at: string }>((from, to) =>
      db.from("jobs").select("id, created_at").eq("status", "Activo").gt("expires_at", now).order("created_at", { ascending: false }).range(from, to)
    );
    return rows.map((r) => ({ loc: `${base}/empleo/${r.id}`, lastmod: r.created_at }));
  },

  // Vacantes de otros portales: solo si el agregador está encendido, que es
  // la misma condición con la que la página las muestra.
  async externalJobs(db, base) {
    const { data, error } = await db.from("site_settings").select("value").eq("key", "external_jobs_enabled").maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.value !== "true") return [];
    const rows = await paged<{ id: string; imported_at: string }>((from, to) =>
      db.from("external_jobs").select("id, imported_at").eq("status", "activa").order("imported_at", { ascending: false }).range(from, to)
    );
    return rows.map((r) => ({ loc: `${base}/empleo/externo/${r.id}`, lastmod: r.imported_at }));
  },

  async companies(db, base) {
    const rows = await paged<{ id: string; updated_at: string | null }>((from, to) =>
      db.from("companies").select("id, updated_at").eq("is_verified", true).order("created_at").range(from, to)
    );
    return rows.map((r) => ({ loc: `${base}/empresas/${r.id}`, lastmod: r.updated_at }));
  },

  async blog(db, base) {
    const rows = await paged<{ slug: string; updated_at: string | null; published_at: string | null }>((from, to) =>
      db.from("blog_posts").select("slug, updated_at, published_at").eq("status", "publicado").order("published_at", { ascending: false }).range(from, to)
    );
    return rows.map((r) => ({ loc: `${base}/blog/${encodeURIComponent(r.slug)}`, lastmod: r.updated_at ?? r.published_at }));
  },

  async courses(db, base) {
    const rows = await paged<{ slug: string; updated_at: string | null }>((from, to) =>
      db.from("courses").select("slug, updated_at").eq("status", "publicado").order("sort").range(from, to)
    );
    return rows.map((r) => ({ loc: `${base}/academia/${encodeURIComponent(r.slug)}`, lastmod: r.updated_at }));
  },
};

export type SitemapResult = { urls: SitemapUrl[]; failed: string[] };

export async function getSitemapUrls(base = CANONICAL_URL): Promise<SitemapResult> {
  const staticUrls = STATIC_PATHS.map((p) => ({ loc: `${base}${p === "/" ? "" : p}` }));

  if (!isSupabaseConfigured()) {
    // Demo: mismos criterios sobre los datos de ejemplo.
    const now = Date.now();
    return {
      failed: [],
      urls: normalizeUrls(
        [
          ...staticUrls,
          ...mock.getActiveJobs().filter((j) => Date.parse(j.expires_at) > now).map((j) => ({ loc: `${base}/empleo/${j.id}`, lastmod: j.created_at })),
          ...mock.companies.filter((c) => c.is_verified).map((c) => ({ loc: `${base}/empresas/${c.id}` })),
          ...mock.blogPosts.filter((p) => p.status === "publicado").map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: p.updated_at ?? p.published_at })),
          ...mock.courses.filter((c) => c.status === "publicado").map((c) => ({ loc: `${base}/academia/${c.slug}`, lastmod: c.updated_at })),
        ],
        base
      ),
    };
  }

  const db = anonClient();
  const failed: string[] = [];
  // Cada sección por su cuenta: si una falla, las demás igual entran y el
  // fallo queda en los logs (solo el nombre y el mensaje, sin datos).
  const results = await Promise.all(
    Object.entries(sections).map(async ([name, load]) => {
      try {
        return await load(db, base);
      } catch (error) {
        failed.push(name);
        console.error(`[worka:sitemap] ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    })
  );
  return { urls: normalizeUrls([...staticUrls, ...results.flat()], base), failed };
}

// Sitemap de Worka Evaluar, que vive en su propio host (evaluar.worka.click)
// y por eso no puede ir dentro del sitemap de worka.click.
export function getEvaluarSitemapUrls(): SitemapUrl[] {
  const base = evaluarUrl();
  const urls: SitemapUrl[] = [
    { loc: base },
    { loc: evaluarUrl("/precios") },
    { loc: evaluarUrl("/recursos") },
    ...RECURSOS.map((r) => ({ loc: evaluarUrl(`/recursos/${r.slug}`), lastmod: r.fecha })),
  ];
  return normalizeUrls(urls, base.startsWith("http") ? base : CANONICAL_URL);
}
