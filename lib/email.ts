import "server-only";

// Envío de emails transaccionales vía Resend (REST, sin dependencias extra).
// Si no hay RESEND_API_KEY, no rompe: devuelve false y el resto sigue igual
// (las alertas in-app se entregan de todos modos).

// El dominio tiene que estar verificado en Resend o el envío se rechaza.
const FROM = process.env.EMAIL_FROM ?? "Worka <operaciones@worka.click>";

export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/* ── Cupo del proveedor ───────────────────────────────────────────────────
   El plan gratuito de Resend da 100 correos por día y 3.000 por mes, y ese
   cupo lo comparte todo lo que manda Worka. Contar acá adentro —y no en cada
   sitio que envía— es lo único que garantiza que no se escape ninguno: hay
   trece lugares que llaman a sendEmail y el próximo que se agregue queda
   contado sin que nadie se acuerde.

   Los límites viven en variables de entorno para poder subirlos el día que
   cambie el plan sin tocar código ni esperar un despliegue. */
export const CUPO_DIA = Number(process.env.EMAIL_CAP_DIA ?? 100);
export const CUPO_MES = Number(process.env.EMAIL_CAP_MES ?? 3000);

async function contarEnvio(): Promise<void> {
  try {
    const { getAdminClient } = await import("./supabase/admin");
    const admin = getAdminClient();
    if (!admin) return;
    await admin.rpc("fn_contar_email");
  } catch (e) {
    // Que falle el contador no puede impedir un correo: es un dato para
    // decidir cuándo frenar, no parte del envío.
    console.error("No pudimos contar el envio:", e);
  }
}

export interface CupoEmail {
  hoy: number;
  mes: number;
  quedanHoy: number;
  quedanMes: number;
}

export async function cupoEmail(): Promise<CupoEmail> {
  const vacio = { hoy: 0, mes: 0, quedanHoy: CUPO_DIA, quedanMes: CUPO_MES };
  try {
    const { getAdminClient } = await import("./supabase/admin");
    const admin = getAdminClient();
    if (!admin) return vacio;
    const { data } = await admin.rpc("fn_cupo_email");
    const fila = (Array.isArray(data) ? data[0] : data) as
      | { hoy: number; mes: number }
      | null
      | undefined;
    if (!fila) return vacio;
    return {
      hoy: fila.hoy ?? 0,
      mes: fila.mes ?? 0,
      quedanHoy: Math.max(CUPO_DIA - (fila.hoy ?? 0), 0),
      quedanMes: Math.max(CUPO_MES - (fila.mes ?? 0), 0),
    };
  } catch {
    // Sin la migración 041 la función no existe. Se asume cupo entero: es
    // preferible mandar de más a que el correo deje de salir en silencio.
    return vacio;
  }
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  /* Versión en texto plano. Un correo que solo trae HTML puntúa peor en los
     filtros de spam, y algunos clientes (relojes, lectores de pantalla en
     modo texto) muestran el HTML crudo sin ella. */
  text?: string;
  /* Cabeceras extra. Las usa el correo de novedades para List-Unsubscribe:
     desde 2024 Gmail y Yahoo se lo exigen a quien manda en volumen, y sin
     eso el correo entero cae en spam. */
  headers?: Record<string, string>;
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
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.headers ? { headers: opts.headers } : {}),
      }),
    });
    if (!res.ok) {
      // Sin esto, un remitente no verificado o una key invalida fallan en
      // silencio y no hay forma de saber por que no llego el correo.
      const detalle = await res.text().catch(() => "");
      console.error("Resend rechazo el envio:", res.status, detalle);
      return false;
    }
    await contarEnvio();
    return true;
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
