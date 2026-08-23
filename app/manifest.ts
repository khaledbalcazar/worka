import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/data";

// Manifest de la PWA: permite "instalar" Worka en el celular (ícono en la
// pantalla de inicio, sin pasar por Play Store).
//
// Los íconos son SIEMPRE los estáticos de /public, de tamaño conocido y
// verificado. Antes se usaba settings.logo_url declarando 192 y 512 px sin
// que nadie garantizara esas medidas: si el logo subido desde el admin era de
// otro tamaño, Chrome descartaba el manifest y el celular dejaba de ofrecer
// la instalación, en silencio.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const name = settings.site_name || "Worka";

  return {
    id: "/empleos",
    name: `${name} — Empleos`,
    short_name: name,
    description:
      settings.site_description ||
      "La plataforma de empleo 100% gratuita de Paraguay.",
    start_url: "/empleos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    lang: "es",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // El logo va centrado y con fondo a sangre, así que entra en la zona
      // segura que Android recorta para los íconos adaptativos.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Accesos directos al mantener presionado el ícono, como una app nativa.
    shortcuts: [
      {
        name: "Buscar empleos",
        url: "/empleos",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mis postulaciones",
        url: "/postulaciones",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Mis alertas",
        url: "/alertas",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
