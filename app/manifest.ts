import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/data";

// Manifest de la PWA: permite "instalar" Worka en el celular (ícono en la
// pantalla de inicio, sin pasar por Play Store). Usa el logo del sitio.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const name = settings.site_name || "Worka";
  const icon = settings.logo_url || settings.favicon_url;

  return {
    name: `${name} — Empleos en Paraguay`,
    short_name: name,
    description:
      settings.site_description ||
      "La plataforma de empleo 100% gratuita de Paraguay.",
    start_url: "/empleos",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    lang: "es",
    icons: icon
      ? [
          { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
        ]
      : [
          // Íconos de marca estáticos (logo W. de Worka).
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
  };
}
