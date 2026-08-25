import "server-only";

// Envío de emails transaccionales vía Resend (REST, sin dependencias extra).
// Si no hay RESEND_API_KEY, no rompe: devuelve false y el resto sigue igual
// (las alertas in-app se entregan de todos modos).

// El dominio tiene que estar verificado en Resend o el envío se rechaza.
const FROM = process.env.EMAIL_FROM ?? "Worka <operaciones@worka.click>";

export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      // Sin esto, un remitente no verificado o una key invalida fallan en
      // silencio y no hay forma de saber por que no llego el correo.
      const detalle = await res.text().catch(() => "");
      console.error("Resend rechazo el envio:", res.status, detalle);
    }
    return res.ok;
  } catch (e) {
    console.error("Resend no respondio:", e);
    return false;
  }
}

// Envoltura HTML mínima y sobria para los emails de Worka.
export function emailLayout(inner: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    <div style="background:#1e3a8a;padding:16px 20px;border-radius:12px 12px 0 0">
      <span style="color:#fff;font-weight:700;font-size:18px">Worka</span>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;padding:20px">
      ${inner}
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
      Recibís este correo porque creaste una alerta de empleo en Worka.
    </p>
  </div>`;
}
