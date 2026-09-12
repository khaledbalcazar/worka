/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { emailEnabled, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";
import { isSettingOn } from "@/lib/settings";
import { bajaToken } from "@/lib/unsubscribe";
import { digestHtml, digestTexto, type DigestJob } from "@/lib/email-digest";

/* Correo de novedades: las vacantes nuevas de empresas verificadas.
 *
 * Sale a toda la base de candidatos, no solo a quien armó una alerta con
 * palabras clave (eso ya lo hace /api/cron/alertas). La diferencia importa:
 * la gran mayoría nunca configura una alerta, entra una vez, no encuentra
 * nada ese día y no vuelve. Este correo es lo que los trae de vuelta cuando
 * sí hay algo.
 *
 * Tres decisiones que definen el resto del archivo:
 *
 * 1. Corre TODOS LOS DÍAS pero cada persona recibe uno cada siete. El cron
 *    toma una tanda de los que les toca y se va. Con un cron semanal, todo
 *    el padrón tendría que entrar en una sola ejecución de cinco minutos; a
 *    los dos mil usuarios eso ya no cierra, y no hay forma de que la tanda
 *    que quedó afuera se recupere.
 *
 * 2. Si no hay vacantes nuevas para esa persona, no se manda nada. Un correo
 *    que dice "no hay nada nuevo" enseña a ignorar los que sí traen algo.
 *
 * 3. Solo empresas con RUC verificado. Es lo que hace que el correo valga:
 *    quien lo abre sabe que del otro lado hay una empresa real.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cuántos días pasan entre un correo y el siguiente para la misma persona.
const CADA_DIAS = 7;
// Antigüedad máxima de una vacante para contarla como novedad.
const VENTANA_DIAS = 10;
// Tanda por ejecución. El límite real no es el tiempo sino el proveedor:
// Resend corta a dos envíos por segundo, así que van espaciados.
const POR_TANDA = 250;
const ESPERA_MS = 550;

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = getAdminClient();
  if (!admin)
    return NextResponse.json({
      ok: false,
      motivo: "Falta SUPABASE_SERVICE_ROLE_KEY",
    });
  if (!emailEnabled())
    return NextResponse.json({ ok: false, motivo: "Falta RESEND_API_KEY" });

  // Ajustes del sitio: interruptor propio y, sobre todo, mantenimiento.
  const { data: ajustes } = await admin
    .from("site_settings")
    .select("key, value");
  const conf = Object.fromEntries(
    ((ajustes ?? []) as { key: string; value: string }[]).map((r) => [
      r.key,
      r.value,
    ])
  );

  // Mandar gente a un sitio que muestra "Estamos mejorando Worka" quema el
  // correo y la confianza de una sola vez. Mientras el mantenimiento esté
  // encendido, este cron no envía nada.
  if (isSettingOn(conf.maintenance_mode))
    return NextResponse.json({
      ok: false,
      motivo:
        "Modo mantenimiento encendido: el correo no sale para no mandar gente a la pantalla de mantenimiento.",
    });

  if (conf.digest_enabled !== undefined && !isSettingOn(conf.digest_enabled))
    return NextResponse.json({
      ok: false,
      motivo: "Apagado desde el admin (digest_enabled).",
    });

  const ahora = Date.now();
  const desdeJobs = new Date(ahora - VENTANA_DIAS * 86400000).toISOString();
  const cortePersona = new Date(ahora - CADA_DIAS * 86400000).toISOString();
  const base = SITE_URL.replace(/\/$/, "");

  /* ── Las vacantes ────────────────────────────────────────────────────
     Una sola consulta para todo el padrón. El filtro por persona se hace
     después en memoria: traer las vacantes de cada candidato por separado
     serían cientos de consultas para leer siempre las mismas filas. */
  const { data: jobsRaw } = await admin
    .from("jobs")
    .select(
      "id,title,industry,modality,salary_range,urgent,requires_experience,created_at,expires_at,company:companies!inner(id,trade_name,company_name,logo_url,location_city,country,is_verified)"
    )
    .eq("status", "Activo")
    // El filtro usa el alias del join ("company"), no el nombre de la tabla:
    // con "companies.is_verified" PostgREST no reconoce el recurso y la
    // consulta entera vuelve vacía, que acá se leería como "no hay vacantes".
    .eq("company.is_verified", true)
    .gte("created_at", desdeJobs)
    .order("created_at", { ascending: false })
    .limit(300);

  const jobs = ((jobsRaw ?? []) as any[])
    // La vacante puede seguir "Activo" y estar vencida: mandar a alguien a
    // una vacante vencida es peor que no mandarle nada.
    .filter((j) => !j.expires_at || j.expires_at > new Date(ahora).toISOString())
    .map((j) => {
      const c = j.company ?? {};
      return {
        id: j.id as string,
        title: j.title as string,
        industry: norm(j.industry),
        modality: (j.modality ?? null) as string | null,
        salary: (j.salary_range ?? null) as string | null,
        urgent: !!j.urgent,
        requiereExperiencia: !!j.requires_experience,
        ciudad: (c.location_city ?? "") as string,
        ciudadNorm: norm(c.location_city),
        country: norm(c.country) || "py",
        company: (c.trade_name || c.company_name || "Empresa") as string,
        logo: (c.logo_url ?? null) as string | null,
      };
    });

  if (jobs.length === 0)
    return NextResponse.json({
      ok: true,
      motivo: "No hay vacantes nuevas de empresas verificadas.",
      enviados: 0,
    });

  /* ── A quiénes les toca ──────────────────────────────────────────── */
  const { data: gente } = await admin
    .from("candidates")
    .select(
      "id, full_name, location_city, country, preferences_industry, preferences_modality, first_job_mode, open_to_other_cities, digest_sent_at"
    )
    .eq("alerts_enabled", true)
    .neq("email_notifications", false)
    .or(`digest_sent_at.is.null,digest_sent_at.lt.${cortePersona}`)
    .order("digest_sent_at", { ascending: true, nullsFirst: true })
    .limit(POR_TANDA);

  const candidatos = (gente ?? []) as any[];
  let enviados = 0;
  let sinNovedades = 0;
  let fallidos = 0;

  for (const p of candidatos) {
    const pais = norm(p.country) || "py";
    const ciudad = norm(p.location_city);
    const rubros = ((p.preferences_industry ?? []) as string[]).map(norm);
    const modalidad = norm(p.preferences_modality);

    const delPais = jobs.filter((j) => j.country === pais);

    /* Quien marcó que no se muda ni viaja no debería recibir vacantes de
       otra ciudad: son las que más rápido enseñan a ignorar el correo. Se
       filtra, pero solo si queda algo — si en su ciudad no hay nada, ve las
       del país antes que no ver nada. */
    const cerca =
      !p.open_to_other_cities && ciudad
        ? delPais.filter((j) => j.ciudadNorm === ciudad)
        : [];
    const universo = cerca.length > 0 ? cerca : delPais;

    /* Puntaje. Es deliberadamente simple y explicable: cada punto se puede
       nombrar en una frase, que es justo lo que después se muestra como
       motivo. Un puntaje que no se puede explicar no se puede mostrar, y
       un "87% de coincidencia" sin explicación se nota inventado. */
    const conPuntaje = universo
      .map((j) => {
        let puntos = 0;
        let motivo: string | null = null;
        if (ciudad && j.ciudadNorm === ciudad) {
          puntos += 3;
          motivo = "En tu ciudad";
        }
        if (rubros.length > 0 && rubros.includes(j.industry)) {
          puntos += 3;
          motivo = "De un rubro que te interesa";
        }
        if (modalidad && norm(j.modality) === modalidad) puntos += 1;
        // Modo primer empleo: lo que le sirve es lo que no pide experiencia.
        if (p.first_job_mode && !j.requiereExperiencia) {
          puntos += 3;
          motivo = "No piden experiencia";
        }
        if (j.urgent) puntos += 1;
        return { j, puntos, motivo };
      })
      // Sin ciudad propia y sin rubros elegidos, todo queda en cero y la
      // lista igual sirve: son las vacantes verificadas más nuevas del país.
      .sort((a, b) => b.puntos - a.puntos);

    if (conPuntaje.length === 0) {
      sinNovedades++;
      continue;
    }

    const elegidas = conPuntaje.slice(0, 8);
    const token = bajaToken(p.id);
    if (!token) {
      fallidos++;
      continue;
    }

    const { data: auth } = await admin.auth.admin.getUserById(p.id);
    const to = auth?.user?.email;
    if (!to) {
      fallidos++;
      continue;
    }

    const lista: DigestJob[] = elegidas.map(({ j, motivo }) => ({
      title: j.title,
      company: j.company,
      companyLogo: j.logo,
      city: j.ciudad,
      modality: j.modality,
      salary: j.salary,
      href: `${base}/empleo/${j.id}`,
      verified: true,
      urgent: j.urgent,
      motivo: null as string | null,
    }));
    // El motivo se muestra solo en la destacada: repetido en cada fila deja
    // de leerse y convierte la lista en una columna de etiquetas.
    lista[0].motivo = elegidas[0].motivo;

    const bajaUrl = `${base}/api/baja?t=${encodeURIComponent(token)}`;
    const nombre = (p.full_name ?? "").split(/\s+/)[0] || "¿qué tal?";

    const total = conPuntaje.length;
    const html = digestHtml({
      nombre,
      jobs: lista,
      totalNuevas: total,
      verTodasUrl: `${base}/empleos`,
      preferenciasUrl: `${base}/alertas`,
      bajaUrl,
      ciudad: p.location_city || null,
    });
    const text = digestTexto({
      nombre,
      jobs: lista,
      totalNuevas: total,
      verTodasUrl: `${base}/empleos`,
      bajaUrl,
    });

    const ok = await sendEmail({
      to,
      subject:
        total === 1
          ? `1 vacante nueva de una empresa verificada${p.location_city ? ` en ${p.location_city}` : ""}`
          : `${total} vacantes nuevas${p.location_city ? ` en ${p.location_city}` : ""} · empresas verificadas`,
      html,
      text,
      headers: {
        // Las dos cabeceras que piden Gmail y Yahoo para correo en volumen.
        // La de un clic tiene que apuntar a algo que acepte POST sin sesión.
        "List-Unsubscribe": `<${bajaUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        // Marca el correo como masivo: evita que dispare autorespuestas de
        // "estoy de vacaciones" y que cuente como correo personal.
        Precedence: "bulk",
      },
    });

    if (ok) enviados++;
    else fallidos++;

    // Se marca aunque el envío falle. Reintentar mañana a quien rebotó
    // convierte un error permanente (buzón inexistente) en un reintento
    // diario, que es exactamente lo que arruina la reputación del dominio.
    await admin
      .from("candidates")
      .update({ digest_sent_at: new Date().toISOString() })
      .eq("id", p.id);

    await new Promise((r) => setTimeout(r, ESPERA_MS));
  }

  return NextResponse.json({
    ok: true,
    vacantes: jobs.length,
    tanda: candidatos.length,
    enviados,
    sinNovedades,
    fallidos,
  });
}
