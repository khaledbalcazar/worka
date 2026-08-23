import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { getActiveCountry } from "@/lib/country-context";
import { SITE_URL } from "@/lib/supabase/config";
import GlobalBanner from "@/components/GlobalBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Metadata dinámica por país: Paraguay usa los textos del /admin; los demás
// países usan su propio título/descripción (con override opcional seo_XX).
export async function generateMetadata(): Promise<Metadata> {
  const [settings, country] = await Promise.all([
    getSiteSettings(),
    getActiveCountry(),
  ]);

  // Override regional: la clave seo_ar / seo_mx… guarda "título | descripción".
  const [ovTitle, ovDesc] = (settings[`seo_${country.code}`] ?? "")
    .split("|")
    .map((s) => s.trim());

  const isPy = country.code === "py";
  const verb = country.code === "ar" || isPy ? "Encontrá" : "Encuentra";
  const title = isPy
    ? settings.site_title || "Worka — Tu próximo paso"
    : ovTitle ||
      `Worka — Empleos en ${country.name} ${country.flag} | Tu próximo paso`;
  const description = isPy
    ? settings.site_description ||
      "La plataforma de empleo 100% gratuita de Paraguay. Encontrá tu próximo trabajo o publicá tu vacante sin costo."
    : ovDesc ||
      `La plataforma de empleo 100% gratuita de ${country.name}. ${verb} tu próximo trabajo o publica tu vacante sin costo.`;

  return {
    // Base para todas las URLs relativas de metadata (og:image, etc.). Sin
    // esto, en producción los previews de redes apuntan a localhost.
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${settings.site_name || "Worka"}`,
    },
    description,
    // Siempre hay ícono de marca: sin un apple-touch-icon, al "Agregar a
    // inicio" en iPhone el atajo queda con una captura borrosa de la página.
    icons: {
      icon: settings.favicon_url || "/icon-192.png",
      apple: settings.favicon_url || "/icon-192.png",
    },
    appleWebApp: {
      capable: true,
      title: settings.site_name || "Worka",
      statusBarStyle: "default",
    },
  };
}

export const viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  // Necesario para que env(safe-area-inset-*) devuelva algo: sin esto, en los
  // iPhone con notch la barra inferior queda debajo de la barra de gestos.
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface">
        <GlobalBanner />
        {children}
      </body>
    </html>
  );
}
