import Link from "next/link";
import AlertsManager from "@/components/AlertsManager";
import { getMyAlerts, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveCountry } from "@/lib/country-context";

export const metadata = { title: "Alertas de empleo" };

export default async function AlertsPage() {
  const live = isLive();
  const user = live ? await getCurrentUser() : null;
  if (live && !user) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl mb-2">🔔</p>
        <p className="font-semibold text-primary-dark">
          Iniciá sesión para crear alertas
        </p>
        <Link href="/ingresar" className="btn-primary mt-4">
          Ingresar
        </Link>
      </div>
    );
  }
  const [alerts, country] = await Promise.all([
    getMyAlerts(),
    getActiveCountry(),
  ]);
  return <AlertsManager alerts={alerts} country={country.code} />;
}
