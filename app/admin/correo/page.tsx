import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { digestHtml, type DigestJob } from "@/lib/email-digest";
import { SITE_URL } from "@/lib/supabase/config";
import { getAdminClient } from "@/lib/supabase/admin";
import EnviarPrueba from "@/components/admin/EnviarPrueba";

export const metadata = {
  title: "Correo de vacantes",
  robots: { index: false, follow: false },
};

/* Vista previa del correo de novedades.
 *
 * Existe porque el correo sale a toda la base y no hay forma de retirarlo:
 * verlo antes con las vacantes reales de esta semana es la única red. Se
 * arma con los mismos datos que usa el cron —no con un ejemplo escrito a
 * mano— así que si una empresa no cargó logo o un título es larguísimo, se
 * ve acá y no en la bandeja de dos mil personas.
 */
export default async function AdminCorreoPage() {
  const supabase = await getServerClient();
  if (supabase) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=/admin/correo");
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((data as { role?: string } | null)?.role !== "admin") redirect("/");
  }

  const base = SITE_URL.replace(/\/$/, "");
  const admin = getAdminClient();
  let jobs: DigestJob[] = [];

  if (admin) {
    const { data } = await admin
      .from("jobs")
      .select(
        "id,title,modality,salary_range,urgent,company:companies!inner(trade_name,company_name,logo_url,location_city,is_verified)"
      )
      .eq("status", "Activo")
      // El filtro usa el alias del join ("company"), no el nombre de la tabla:
    // con "companies.is_verified" PostgREST no reconoce el recurso y la
    // consulta entera vuelve vacía, que acá se leería como "no hay vacantes".
    .eq("company.is_verified", true)
      .order("created_at", { ascending: false })
      .limit(8);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    jobs = ((data ?? []) as any[]).map((j, i) => {
      const c = j.company ?? {};
      return {
        title: j.title,
        company: c.trade_name || c.company_name || "Empresa",
        companyLogo: c.logo_url ?? null,
        city: c.location_city ?? "",
        modality: j.modality ?? null,
        salary: j.salary_range ?? null,
        href: `${base}/empleo/${j.id}`,
        verified: true,
        urgent: !!j.urgent,
        motivo: i === 0 ? "En tu ciudad" : null,
      };
    });
  }

  // Sin Supabase (modo demo) se arma con los datos de ejemplo, igual que el
  // resto del sitio: una vista previa en blanco no sirve para revisar nada.
  if (!admin) {
    const mock = await import("@/lib/mock-data");
    jobs = mock
      .getJobsWithCompany()
      .slice(0, 6)
      .map((j, i) => ({
        title: j.title,
        company: j.company.trade_name,
        companyLogo: j.company.logo_url,
        city: j.company.location_city,
        modality: j.modality,
        salary: j.salary_range,
        href: `${base}/empleo/${j.id}`,
        verified: j.company.is_verified,
        urgent: j.urgent,
        motivo: i === 0 ? "En tu ciudad" : null,
      }));
  }

  const hay = jobs.length > 0;
  const html = digestHtml({
    nombre: "Ana",
    jobs,
    totalNuevas: Math.max(jobs.length, 1),
    verTodasUrl: `${base}/empleos`,
    preferenciasUrl: `${base}/alertas`,
    bajaUrl: `${base}/api/baja?t=ejemplo`,
    ciudad: jobs[0]?.city || "Asunción",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
      <div>
        <Link href="/admin" className="text-sm text-primary font-medium">
          ← Volver al backoffice
        </Link>
        <h1 className="text-2xl font-bold text-primary-dark mt-1">
          Correo de vacantes nuevas
        </h1>
        <p className="text-sm text-gray-500">
          Sale una vez por semana a cada candidato con alertas activas. Corre
          todos los días a las 10:00 y manda una tanda por vez.
        </p>
      </div>

      {!hay && (
        <div className="card p-5 bg-amber-50 border-amber-200">
          <p className="font-semibold text-amber-800">
            No hay vacantes activas de empresas verificadas
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Con esto, el cron no manda nada: prefiere el silencio a un correo
            vacío. Verificá alguna empresa desde el backoffice y volvé.
          </p>
        </div>
      )}

      <EnviarPrueba />

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-primary-dark text-sm">
            Vista previa
          </p>
          <p className="text-xs text-gray-400">
            Con las {jobs.length} vacantes verificadas más nuevas
          </p>
        </div>
        {/* En un iframe con sandbox: el HTML del correo trae sus propios
            estilos y, suelto en la página, pisaría los del backoffice. */}
        <iframe
          title="Vista previa del correo"
          sandbox=""
          srcDoc={html}
          className="w-full h-[1100px] bg-slate-100"
        />
      </div>
    </div>
  );
}
