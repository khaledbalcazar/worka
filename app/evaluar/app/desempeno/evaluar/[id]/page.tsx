import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser, getServerClient } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { competenciasDe, type Ciclo, type Desempeno } from "@/lib/evaluar/desempeno";
import DesempenoForm from "@/components/evaluar/DesempenoForm";

export const metadata = { title: "Evaluar", robots: { index: false } };

// La pantalla del evaluador. No pasa por getCiclo porque quien entra acá suele
// ser un jefe de área, que no es dueño de la cuenta: la política de RLS le
// deja ver su propia fila y el ciclo al que pertenece, nada más.
export default async function EvaluarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isLive()) {
    const user = await getCurrentUser();
    if (!user)
      redirect(`/ingresar?next=%2Fevaluar%2Fapp%2Fdesempeno%2Fevaluar%2F${id}`);
  }

  const supabase = await getServerClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("evaluar_desempeno")
    .select("*, ciclo:evaluar_ciclos(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const fila = data as unknown as Desempeno & { ciclo: Ciclo | null };
  if (!fila.ciclo) notFound();

  const competencias = competenciasDe(fila.ciclo, fila);
  const enviada = fila.status === "enviada";
  const cerrado = fila.ciclo.status === "cerrado";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/evaluar/app/desempeno"
        className="text-sm text-primary font-medium flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Desempeño
      </Link>

      <div className="card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {fila.ciclo.title}
        </p>
        <h1 className="text-xl font-bold text-primary-dark mt-0.5">
          {fila.tipo === "auto" ? "Tu autoevaluación" : fila.empleado_nombre}
        </h1>
        {(fila.empleado_puesto || fila.empleado_area) && (
          <p className="text-sm text-slate-500">
            {[fila.empleado_puesto, fila.empleado_area]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {fila.tipo === "auto" && !enviada && (
          <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 mt-3 leading-relaxed">
            Contestá con honestidad, no con modestia ni de más. Lo que se compara
            después no es tu nota contra la de tu jefe para ver quién tiene
            razón, sino en qué se ven distinto: ahí es donde aparece lo que hay
            que conversar.
          </p>
        )}

        {enviada && (
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mt-3">
            Ya enviaste esta evaluación
            {fila.sent_at
              ? ` el ${new Date(fila.sent_at).toLocaleDateString("es-PY")}`
              : ""}
            . {fila.tipo === "auto" ? "" : "La persona ya puede leerla."}
          </p>
        )}

        {cerrado && !enviada && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mt-3">
            El ciclo está cerrado: ya no se puede cargar.
          </p>
        )}
      </div>

      <DesempenoForm
        id={fila.id}
        competencias={competencias}
        soloLectura={enviada || cerrado}
        evaluado={fila.tipo === "auto" ? "vos" : fila.empleado_nombre}
        inicial={{
          puntajes: fila.puntajes ?? {},
          comentarios: fila.comentarios ?? {},
          fortalezas: fila.fortalezas ?? "",
          a_mejorar: fila.a_mejorar ?? "",
          compromisos: fila.compromisos ?? "",
        }}
      />
    </div>
  );
}
