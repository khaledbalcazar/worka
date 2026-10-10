import Link from "next/link";
import AlertsManager from "@/components/AlertsManager";
import MyJobsShell from "@/components/MyJobsShell";
import { getMyAlerts, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveCountry } from "@/lib/country-context";

export const metadata = { title: "Alertas de empleo" };

export default async function AlertsPage({ searchParams }: {
  searchParams: Promise<{ q?: string; ciudad?: string; rubro?: string; modalidad?: string }>;
}) {
  const params = await searchParams;
  const next = new URLSearchParams();
  for (const key of ["q", "ciudad", "rubro", "modalidad"] as const) if (params[key]) next.set(key, params[key]);
  const returnTo = `/alertas${next.size ? `?${next}` : ""}`;
  const live = isLive();
  const user = live ? await getCurrentUser() : null;
  if (live && !user) {
    return (
      <MyJobsShell active="alertas">
        <section className="myjobs-card">
          <div className="myjobs-empty">
            <h1>Iniciá sesión para crear alertas</h1>
            <p>Te avisamos cuando aparezcan vacantes que coincidan con tu búsqueda.</p>
            <Link href={`/ingresar?next=${encodeURIComponent(returnTo)}`} className="btn-primary">Iniciar sesión</Link>
          </div>
        </section>
      </MyJobsShell>
    );
  }
  const [alerts, country] = await Promise.all([
    getMyAlerts(),
    getActiveCountry(),
  ]);
  return <MyJobsShell active="alertas"><AlertsManager alerts={alerts} country={country.code} cities={country.cities}
    initialSearch={{ keyword: params.q ?? "", city: params.ciudad ?? "", industry: params.rubro ?? "", modality: params.modalidad ?? "" }} /></MyJobsShell>;
}
