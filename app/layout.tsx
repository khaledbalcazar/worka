import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Metadata dinámica: el título, descripción y favicon se editan desde /admin.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.site_title || "Worka — Tu próximo paso",
      template: `%s | ${settings.site_name || "Worka"}`,
    },
    description:
      settings.site_description ||
      "La plataforma de empleo 100% gratuita de Paraguay. Encontrá tu próximo trabajo o publicá tu vacante sin costo.",
    ...(settings.favicon_url
      ? { icons: { icon: settings.favicon_url } }
      : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface">{children}</body>
    </html>
  );
}
