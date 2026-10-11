import { getSitemapUrls } from "@/lib/sitemap-data";
import { parsePart, partCount, renderUrlset, slicePart } from "@/lib/sitemap";

// Partes del sitemap cuando /sitemap.xml pasa a ser un índice (más de
// 45.000 URLs). Mismo cacheo que el índice.
export const revalidate = 3600;
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ part: string }> }) {
  const part = parsePart((await params).part);
  const { urls } = await getSitemapUrls();
  const parts = partCount(urls.length);
  // Con una sola parte /sitemap.xml ya es el sitemap completo: las partes
  // solo existen cuando ese archivo es un índice.
  if (part === null || parts === 1 || part >= parts) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(renderUrlset(slicePart(urls, part)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
