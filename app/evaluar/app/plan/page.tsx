import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSiteSettings, isLive } from "@/lib/data";
import { getMyEvaluarAccess } from "@/lib/evaluar";
import { ofertaTarjeta } from "@/lib/billing/ofertas";
import EvaluarPlanCheckout from "@/components/evaluar/EvaluarPlanCheckout";
import VentasCta from "@/components/evaluar/VentasCta";

// Mi plan de Worka Evaluar: en qué estado está la cuenta y cómo pagar.
// Con el cobro con tarjeta configurado, se paga acá mismo y el plan se
// activa solo; sin él, se ofrece el contacto para pagar por transferencia.

export const metadata = { title: "Mi plan" };

const ESTADO: Record<string, string> = {
  prueba: "En prueba gratuita",
  activa: "Activa",
  vencida: "Vencida",
  cancelada: "Cancelada",
};

export default async function EvaluarPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; pago?: string }>;
}) {
  const { plan: planInicial, pago } = await searchParams;
  let userId: string | null = null;
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=%2Fevaluar%2Fapp%2Fplan");
    userId = user.id;
  }

  const [access, settings] = await Promise.all([getMyEvaluarAccess(), getSiteSettings()]);
  const oferta = userId ? await ofertaTarjeta("evaluar", userId, settings) : null;
  const cuenta = access.account;
  const nombrePlan = cuenta?.plan === "profesional" ? "Profesional" : cuenta?.plan === "corporativo" ? "Corporativo" : "Esencial";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <Link href="/evaluar/app" className="text-sm font-medium flex items-center gap-1 opacity-80">
        <ChevronLeft size={16} /> Volver al panel
      </Link>

      {pago === "ok" && (
        <p className="text-sm bg-emerald-50 text-emerald-800 rounded-xl px-3.5 py-2.5" role="status">
          Recibimos tu pago con tarjeta. El plan se activa en unos segundos: si todavía no lo ves, recargá la página.
        </p>
      )}

      <section className="rounded-2xl border border-[#292b31] bg-[#1a1c26] p-6">
        <h1 className="text-xl font-semibold text-[#e9e9ed]">Mi plan</h1>
        {cuenta ? (
          <p className="text-sm text-[rgba(233,233,237,.6)] mt-1">
            {access.inTrial
              ? `Prueba gratuita con todo habilitado: te quedan ${access.daysLeft} ${access.daysLeft === 1 ? "día" : "días"}.`
              : access.active
                ? `${nombrePlan} · activa, ${access.daysLeft} ${access.daysLeft === 1 ? "día" : "días"} restantes.`
                : `${ESTADO[cuenta.status] ?? cuenta.status}. Tus procesos siguen guardados: al activar un plan seguís donde estabas.`}
          </p>
        ) : (
          <p className="text-sm text-[rgba(233,233,237,.6)] mt-1">
            Todavía no activaste Worka Evaluar. Podés empezar con la prueba gratuita desde el panel o contratar directamente.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#292b31] bg-[#1a1c26] p-6 text-[#e9e9ed]">
        {oferta ? (
          <EvaluarPlanCheckout oferta={oferta} planInicial={planInicial} />
        ) : (
          <div>
            <p className="text-sm text-[rgba(233,233,237,.6)]">
              Por ahora el pago es por transferencia bancaria o link de pago. Escribinos y activamos tu plan en el día.
            </p>
            <VentasCta variante="cta" className="w-full mt-4" mensaje="Hola, quiero contratar Worka Evaluar.">
              Contratar por WhatsApp
            </VentasCta>
          </div>
        )}
        <p className="text-xs text-[rgba(233,233,237,.45)] mt-5">
          ¿Más de 20 procesos al año o necesidades especiales? El plan Corporativo es a medida.{" "}
          <Link href="/evaluar/precios" className="underline">Ver todos los planes</Link>
        </p>
      </section>
    </div>
  );
}
