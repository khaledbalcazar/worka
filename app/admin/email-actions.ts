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
