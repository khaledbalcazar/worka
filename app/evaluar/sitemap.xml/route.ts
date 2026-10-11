import { getEvaluarSitemapUrls } from "@/lib/sitemap-data";
import { renderUrlset } from "@/lib/sitemap";

// Sitemap de Worka Evaluar. Se sirve como evaluar.worka.click/sitemap.xml
// (el proxy reescribe esa ruta acá): las URLs de otro host no pueden ir en
// el sitemap de worka.click, Search Console las rechaza.
export const revalidate = 86400;

export function GET() {
  return new Response(renderUrlset(getEvaluarSitemapUrls()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
