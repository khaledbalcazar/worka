"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { emailEnabled, emailLayout, sendEmail } from "@/lib/email";
import {
  getEmailTemplate,
  renderEmail,
  sampleVars,
} from "@/lib/email-templates";

type Result = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((data as { role?: string } | null)?.role !== "admin") return null;
  return { supabase, user } as const;
}

// Guarda la edición de una plantilla. Se guarda SOLO lo editado: el original
// vive en el código, así que restaurar es borrar la fila.
export async function saveEmailTemplate(
  key: string,
  input: { subject: string; body: string; enabled: boolean }
): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Solo un admin puede editar los correos." };
  if (!getEmailTemplate(key))
    return { ok: false, error: "Esa plantilla no existe." };
  if (!input.subject.trim())
    return { ok: false, error: "El asunto no puede quedar vacío." };
  if (!input.body.trim())
    return { ok: false, error: "El cuerpo no puede quedar vacío." };

  const { error } = await ctx.supabase.from("email_templates").upsert(
    {
      key,
      subject: input.subject.trim(),
      body: input.body.trim(),
      enabled: input.enabled,
      updated_at: new Date().toISOString(),
      updated_by: ctx.user.id,
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error("saveEmailTemplate:", error);
    return { ok: false, error: "No pudimos guardar la plantilla." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function resetEmailTemplate(key: string): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Solo un admin puede editar los correos." };

  const { error } = await ctx.supabase
    .from("email_templates")
    .delete()
    .eq("key", key);
  if (error) return { ok: false, error: "No pudimos restaurar el original." };
  revalidatePath("/admin");
  return { ok: true };
}

// Manda la plantilla a una dirección con datos de ejemplo, tal como saldría.
// Probar en el cliente de correo real es la única forma de ver de verdad cómo
// se ve: la vista previa del navegador miente sobre Gmail y Outlook.
export async function sendTemplatePreview(
  key: string,
  to: string,
  draft: { subject: string; body: string }
): Promise<Result> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Solo un admin puede probar los correos." };
  if (!emailEnabled())
    return { ok: false, error: "Falta RESEND_API_KEY en Vercel." };
  if (!to.includes("@")) return { ok: false, error: "Escribí un email válido." };

  const template = getEmailTemplate(key);
  if (!template) return { ok: false, error: "Esa plantilla no existe." };

  const render = renderEmail(template, draft, sampleVars(template));
  const ok = await sendEmail({
    to: to.trim(),
    subject: `[Prueba] ${render.subject}`,
    html: emailLayout(render.body),
  });

  return ok
    ? { ok: true }
    : {
        ok: false,
        error:
          "Resend rechazó el envío. Revisá que el dominio de EMAIL_FROM esté verificado.",
      };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Envía el correo de vacantes nuevas a una dirección, para verlo en un buzón
// real antes de que salga a toda la base. Usa las vacantes verificadas de
// verdad: una prueba con datos inventados no avisa de lo que suele romperse
// (un título larguísimo, una empresa sin logo, un salario vacío).
export async function enviarDigestDePrueba(to: string): Promise<Result> {
  const sesion = await requireAdmin();
  if (!sesion) return { ok: false, error: "Solo el admin puede hacer esto." };
  if (!to.includes("@")) return { ok: false, error: "Escribí un email válido." };
  if (!emailEnabled())
    return { ok: false, error: "Falta RESEND_API_KEY en el entorno." };

  const { getAdminClient } = await import("@/lib/supabase/admin");
  const { digestHtml, digestTexto } = await import("@/lib/email-digest");
  const { SITE_URL } = await import("@/lib/supabase/config");
  const { bajaToken } = await import("@/lib/unsubscribe");

  const admin = getAdminClient();
  if (!admin)
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY." };

  const base = SITE_URL.replace(/\/$/, "");
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

  const jobs = ((data ?? []) as any[]).map((j, i) => {
    const c = j.company ?? {};
    return {
      title: j.title as string,
      company: (c.trade_name || c.company_name || "Empresa") as string,
      companyLogo: (c.logo_url ?? null) as string | null,
      city: (c.location_city ?? "") as string,
      modality: (j.modality ?? null) as string | null,
      salary: (j.salary_range ?? null) as string | null,
      href: `${base}/empleo/${j.id}`,
      verified: true,
      urgent: !!j.urgent,
      motivo: i === 0 ? "En tu ciudad" : null,
    };
  });

  if (jobs.length === 0)
    return {
      ok: false,
      error:
        "No hay vacantes activas de empresas verificadas: no hay nada que mandar.",
    };

  // El enlace de baja de la prueba se firma con el id del propio admin, así
  // que es un enlace real y se puede comprobar que funciona. Darse de baja
  // desde acá apaga los correos del admin, no los de otra persona.
  const token = bajaToken(sesion.user.id) ?? "prueba";
  const bajaUrl = `${base}/api/baja?t=${encodeURIComponent(token)}`;
  const comun = {
    nombre: "Ana",
    jobs,
    totalNuevas: jobs.length,
    verTodasUrl: `${base}/empleos`,
    bajaUrl,
  };

  const ok = await sendEmail({
    to,
    subject: `[PRUEBA] ${jobs.length} vacantes nuevas · empresas verificadas`,
    html: digestHtml({
      ...comun,
      preferenciasUrl: `${base}/alertas`,
      ciudad: jobs[0]?.city || null,
    }),
    text: digestTexto(comun),
    headers: {
      "List-Unsubscribe": `<${bajaUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  return ok
    ? { ok: true }
    : {
        ok: false,
        error:
          "Resend rechazó el envío. Revisá que el dominio de EMAIL_FROM esté verificado.",
      };
}
