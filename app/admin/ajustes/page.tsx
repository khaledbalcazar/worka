import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import AdminAiKeys from "@/components/evaluar/AdminAiKeys";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getSiteSettings } from "@/lib/data";
import { getAiKeys } from "@/lib/evaluar";
import { PLAN_SETTING_KEYS } from "@/lib/plans";
import { WHATS_NEW_SETTING } from "@/lib/whats-new";

export const metadata = { title: "Ajustes del sitio" };

// Precios y links de pago se editan en «Pagos y planes», y el popup de
// novedades en «Avisos y correos»: si viajaran acá, «Guardar configuración»
// los pisaría con una copia vieja.
const OWN_EDITORS = new Set<string>([WHATS_NEW_SETTING, ...PLAN_SETTING_KEYS.map(([key]) => key)]);

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/ajustes");
  const [settings, keys, proKeys] = await Promise.all([
    seguro("getSiteSettings", () => getSiteSettings(), {} as Record<string, string>),
    seguro("getAiKeys", () => getAiKeys("evaluar"), []),
    seguro("getAiKeys pro", () => getAiKeys("pro"), []),
  ]);
  return (
    <>
      <AdminPageHead title="Ajustes del sitio" description="Textos, marca, listas, SEO por país, modo mantenimiento y las claves de IA de Worka Pro y Worka Evaluar." />
      <div className="space-y-8">
        <AdminPanel
          section="ajustes"
          settings={Object.fromEntries(Object.entries(settings).filter(([key]) => !OWN_EDITORS.has(key)))}
        />
        <AdminAiKeys keys={proKeys} scope="pro" />
        <AdminAiKeys keys={keys} />
      </div>
    </>
  );
}
