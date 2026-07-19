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
        allow: "/",
        disallow: [
          "/admin",
          "/perfil",
          "/postulaciones",
          "/mensajes",
          "/onboarding",
          "/test-perfil",
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
