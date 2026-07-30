import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/supabase/config";

// robots.txt: los buscadores pueden indexar todo lo público, pero no las
// zonas privadas (paneles, perfil, mensajes). Apunta al sitemap dinámico.
export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        // El registro de empresa es público; el resto del panel no.
        allow: ["/", "/empresa/registro"],
        disallow: [
          "/admin",
          "/perfil",
          "/postulaciones",
          "/guardados",
          "/mensajes",
          "/onboarding",
          "/test-perfil",
          "/cv",
          "/juegos",
          "/empresa", // panel privado (excepto /empresa/registro, permitido arriba)
          "/restablecer",
          "/recuperar",
          "/auth/",
          "/ref/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
