import Link from "next/link";
import { getSiteSettings } from "@/lib/data";

// Banner global configurable desde el admin. Aparece arriba de toda la web
// si banner_enabled está activo. Server component: lee la config directo.
export default async function GlobalBanner() {
  const settings = await getSiteSettings();
  if (!settings.banner_enabled || !settings.banner_text) return null;

  const content = (
    <p className="text-sm font-medium text-white text-center px-4 py-2">
      {settings.banner_text}
      {settings.banner_link && (
        <span className="underline ml-1">Ver más →</span>
      )}
    </p>
  );

  return (
    <div className="bg-primary-dark">
      {settings.banner_link ? (
        <Link href={settings.banner_link} className="block hover:bg-black/10">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
