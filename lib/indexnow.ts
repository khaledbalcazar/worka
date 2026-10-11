import "server-only";
import { CANONICAL_URL } from "./supabase/config";

// IndexNow: protocolo abierto de Bing/Yandex/Seznam para avisar "esta URL
// cambió" y que la re-rastreen enseguida, sin esperar el crawl normal.
// No requiere cuenta: alcanza con alojar un archivo con la clave en la raíz
// del sitio (public/{INDEXNOW_KEY}.txt) y enviar las URLs a su API.
export const INDEXNOW_KEY = "ec79b07438ad9ac60255be6f298b6bfe";

// Envía una o varias URLs a IndexNow. Es "mejor esfuerzo": si falla (sin
// conexión, IndexNow caído), no debe romper la acción que la llamó.
export async function pingIndexNow(urls: string | string[]): Promise<void> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  if (urlList.length === 0) return;
  // Mismo host que el sitemap y los canonical: IndexNow descarta URLs de un
  // host distinto al declarado.
  const host = CANONICAL_URL.replace(/^https?:\/\//, "");
  // En local/demo (host = localhost) no tiene sentido avisarle a Bing.
  if (host.includes("localhost")) return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${CANONICAL_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch {
    // Best-effort: un fallo acá nunca debe tumbar la acción del usuario.
  }
}

export function jobUrl(jobId: string): string {
  return `${CANONICAL_URL}/empleo/${jobId}`;
}
