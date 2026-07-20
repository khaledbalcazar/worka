import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";
import GlobalBanner from "@/components/GlobalBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Metadata dinámica: el título, descripción y favicon se editan desde /admin.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    // Base para todas las URLs relativas de metadata (og:image, etc.). Sin
    // esto, en producción los previews de redes apuntan a localhost.
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.site_title || "Worka — Tu próximo paso",
      template: `%s | ${settings.site_name || "Worka"}`,
    },
    description:
      settings.site_description ||
      "La plataforma de empleo 100% gratuita de Paraguay. Encontrá tu próximo trabajo o publicá tu vacante sin costo.",
    ...(settings.favicon_url
      ? {
          icons: {
            icon: settings.favicon_url,
            apple: settings.favicon_url,
          },
        }
      : {}),
    appleWebApp: {
      capable: true,
      title: settings.site_name || "Worka",
      statusBarStyle: "default",
    },
  };
}

export const viewport = {
  themeColor: "#1e3a8a",
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
