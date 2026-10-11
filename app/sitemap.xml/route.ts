import { getSitemapUrls } from "@/lib/sitemap-data";
import { CANONICAL_URL } from "@/lib/supabase/config";
import { newestLastmod, partCount, renderSitemapIndex, renderUrlset, slicePart } from "@/lib/sitemap";

// https://worka.click/sitemap.xml — la URL que se envía a Search Console.
//
// Hasta 45.000 URLs devuelve el sitemap directamente. Si hay más, devuelve un
// índice que apunta a /sitemap/0.xml, /sitemap/1.xml, …; así la URL enviada
// no cambia nunca aunque el sitio crezca.
//
// Se cachea y se regenera cada hora (ISR). No usa cookies ni headers: si los
// usara, la ruta pasaría a ejecutarse en cada visita de Googlebot.
export const revalidate = 3600;
// La regeneración recorre varias tablas; un minuto deja margen de sobra.
export const maxDuration = 60;

export async function GET() {
  const { urls } = await getSitemapUrls();
  const parts = partCount(urls.length);
  const body =
    parts === 1
      ? renderUrlset(urls)
      : renderSitemapIndex(
          Array.from({ length: parts }, (_, i) => ({
            loc: `${CANONICAL_URL}/sitemap/${i}.xml`,
            lastmod: newestLastmod(slicePart(urls, i)),
          }))
        );
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
