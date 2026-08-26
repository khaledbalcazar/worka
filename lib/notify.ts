import "server-only";

import { getAdminClient } from "@/lib/supabase/admin";
import { emailEnabled, emailLayout, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";
import {
  getEmailTemplate,
  renderEmail,
  type RenderedEmail,
} from "@/lib/email-templates";

// Emisor único de avisos: campanita + correo, en una sola llamada.
//
// Antes cada acción insertaba la notificación a mano y nadie mandaba correo,
// así que el aviso solo existía para quien entraba a la app. Tenerlo en un
// solo lugar evita que el próximo evento se olvide del email otra vez.
//
// Nunca lanza: un aviso que falla no puede tumbar la postulación, el mensaje
// o el cambio de estado que lo originó, que ya quedaron guardados.

const BASE = SITE_URL.replace(/\/$/, "");

export type NotifyInput = {
  /** A quién. Es el id del perfil, que es también el de auth.users. */
  userId: string;
  icon: string;
  title: string;
  /** Texto de la campanita. Si no hay `emailBody`, también va al correo. */
  body: string;
  /** Adónde lleva el aviso dentro de la app. */
  href?: string;
  /** Cuerpo HTML propio para el correo, cuando conviene decir más. */
  emailBody?: string;
  /** Texto del botón del correo. Sin esto no se manda correo. */
  cta?: string;
  /** Plantilla editable a usar y sus variables. */
  template?: { key: string; vars: Record<string, string> };
};

export async function notify(input: NotifyInput): Promise<void> {
  const admin = getAdminClient();
  if (!admin) return;

  try {
    await admin.from("notifications").insert({
      user_id: input.userId,
      icon: input.icon,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    });
  } catch (e) {
    console.error("notify (campanita):", e);
  }

  // Sin CTA no hay correo: es la forma de decir "esto vive solo en la app".
  if (!input.cta || !emailEnabled()) return;

  try {
    if (!(await wantsEmail(input.userId))) return;

    const { data: auth } = await admin.auth.admin.getUserById(input.userId);
    const to = auth?.user?.email;
    if (!to) return;

    const url = `${BASE}${input.href ?? "/"}`;
    const render = await buildEmail(input, url);
    if (!render) return;

    const ok = await sendEmail({
      to,
      subject: render.subject,
      html: emailLayout(
        render.body +
          `<p style="color:#6b7280;font-size:12px">Podés desactivar estos avisos desde tu perfil en Worka.</p>`
      ),
    });

    if (ok) {
      await admin
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("user_id", input.userId)
        .eq("title", input.title)
        .is("emailed_at", null);
    }
  } catch (e) {
    console.error("notify (correo):", e);
  }
}

// ¿Esta persona quiere correos? La preferencia vive en su tabla según el rol.
// Ante la duda se manda: perder un aviso importante es peor que uno de más,
// y siempre se puede apagar.
async function wantsEmail(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  if (!admin) return false;

  const [{ data: cand }, { data: comp }] = await Promise.all([
    admin
      .from("candidates")
      .select("email_notifications")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("companies")
      .select("email_notifications")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const c = cand as { email_notifications?: boolean } | null;
  const e = comp as { email_notifications?: boolean } | null;
  if (c) return c.email_notifications !== false;
  if (e) return e.email_notifications !== false;
  return true;
}

// Varios destinatarios con el mismo aviso (por ejemplo, una vacante nueva que
// coincide con los rubros de mucha gente). Se manda de a uno y en serie: una
// ráfaga simultánea de cientos de correos es la forma más rápida de que el
// proveedor corte el envío.
export async function notifyMany(
  userIds: string[],
  build: (userId: string) => NotifyInput
): Promise<void> {
  for (const id of userIds.slice(0, 300)) {
    await notify(build(id));
  }
}

// Arma el correo: usa la plantilla si el evento declara una, y si no cae en
// "aviso general". Devuelve null cuando el admin apagó esa plantilla.
async function buildEmail(
  input: NotifyInput,
  url: string
): Promise<RenderedEmail | null> {
  const admin = getAdminClient();
  const key = input.template?.key ?? "aviso_general";
  const template = getEmailTemplate(key) ?? getEmailTemplate("aviso_general");
  if (!template) return null;

  const { data } = admin
    ? await admin
        .from("email_templates")
        .select("subject, body, enabled")
        .eq("key", template.key)
        .maybeSingle()
    : { data: null };

  const override = data as
    | { subject: string; body: string; enabled: boolean }
    | null;
  // Apagada desde el admin: no se manda ese correo. La campanita ya se
  // insertó, así que el aviso no se pierde del todo.
  if (override && override.enabled === false) return null;

  const vars: Record<string, string> = {
    // Siempre disponibles, aunque la plantilla no las declare.
    enlace: url,
    cta: input.cta ?? "Abrir Worka",
    titulo: input.title,
    cuerpo: input.emailBody ?? input.body,
    ...(input.template?.vars ?? {}),
  };

  return renderEmail(template, override, vars);
}
