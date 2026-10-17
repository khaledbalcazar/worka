import Link from "next/link";
import { Mail } from "lucide-react";
import AdminPanel from "@/components/AdminPanel";
import AdminPageHead from "@/components/admin/AdminPageHead";
import WhatsNewEditor from "@/components/admin/WhatsNewEditor";
import EmailTemplates from "@/components/admin/EmailTemplates";
import { requireAdmin, seguro } from "@/lib/admin-stats";
import { getEmailTemplateOverrides, getSiteSettings } from "@/lib/data";
import { WHATS_NEW_SETTING, parseWhatsNew } from "@/lib/whats-new";
import { cupoEmail, CUPO_DIA, CUPO_MES } from "@/lib/email";

export const metadata = { title: "Avisos y correos" };

export default async function AdminCommunicationPage() {
  await requireAdmin("/admin/comunicacion");
  const [settings, overrides, cupo] = await Promise.all([
    seguro("getSiteSettings", () => getSiteSettings(), {} as Record<string, string>),
    seguro("getEmailTemplateOverrides", () => getEmailTemplateOverrides(), []),
    seguro("cupoEmail", () => cupoEmail(), null),
  ]);
  return (
    <>
      <AdminPageHead
        title="Avisos y correos"
        description="Notificaciones masivas, el popup de novedades y la redacción de cada correo que manda Worka."
        actions={
          <Link href="/admin/correo" className="btn-secondary">
            <Mail size={16} /> Correo semanal de vacantes
          </Link>
        }
      />
      {cupo && (
        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          {[
            { label: "Correos enviados hoy", used: cupo.hoy, cap: CUPO_DIA },
            { label: "Correos enviados este mes", used: cupo.mes, cap: CUPO_MES },
          ].map((m) => {
            const pct = Math.min(100, Math.round((m.used / Math.max(m.cap, 1)) * 100));
            return (
              <div key={m.label} className="ad-kpi">
                <p className="ad-kpi-label">{m.label}</p>
                <p className="ad-kpi-value tabular-nums">
                  {m.used.toLocaleString("es-PY")} <span className="text-base font-normal text-[#767676]">de {m.cap.toLocaleString("es-PY")}</span>
                </p>
                <div className="h-2 rounded-full bg-[#dfeaf3] overflow-hidden" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? "#cc1016" : pct >= 70 ? "#c98500" : "#0a66c2" }} />
                </div>
                <p className="ad-kpi-sub">{pct >= 90 ? "⚠ Casi sin cupo del proveedor de correo" : `${pct}% del cupo`}</p>
              </div>
            );
          })}
        </div>
      )}
      <div className="space-y-8">
        <AdminPanel section="comunicacion" />
        <WhatsNewEditor initial={parseWhatsNew(settings[WHATS_NEW_SETTING])} />
        <EmailTemplates overrides={overrides} />
      </div>
    </>
  );
}
