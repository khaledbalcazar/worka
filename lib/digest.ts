/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { cupoEmail, emailEnabled, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/supabase/config";
import { isSettingOn } from "@/lib/settings";
import { bajaToken } from "@/lib/unsubscribe";
import {
  digestAsunto,
  digestHtml,
  digestTexto,
  type DigestJob,
} from "@/lib/email-digest";

/* Envío del correo de vacantes nuevas.
 *
 * Vive acá y no adentro del cron porque lo usan dos: el cron de las 10 y el
 * botón "Enviar ahora" del backoffice. Con la lógica duplicada, cualquier
 * arreglo (un filtro nuevo, un cambio en el puntaje) se aplicaba en uno y se
 * olvidaba en el otro, y la diferencia solo se notaba en la bandeja de la
 * gente.
 */

// Cada persona recibe uno cada siete días.
const CADA_DIAS = 7;
// Antigüedad máxima de una vacante para contarla como novedad.
const VENTANA_DIAS = 10;
// Espaciado entre envíos: Resend corta a dos por segundo.
const ESPERA_MS = 550;

/* Cuánto del cupo diario se reserva para lo transaccional.
 *
 * El plan gratuito da 100 correos por día para TODO Worka. Si el resumen se
 * los lleva a las 10:05, a las 11:00 la invitación a una entrevista se
 * rechaza en silencio. Ese correo no se puede perder; este sí puede esperar
 * a mañana. */
const RESERVA = Number(process.env.EMAIL_RESERVA ?? 30);

export interface ResultadoDigest {
  ok: boolean;
  motivo?: string;
  vacantes: number;
  enviados: number;
  sinNovedades: number;
  fallidos: number;
  /** Personas a las que les tocaba y quedaron para la próxima corrida. */
  pendientes: number;
  quedanHoy: number;
  quedanMes: number;
}

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export async function enviarDigest(
  opts: { limite?: number } = {}
): Promise<ResultadoDigest> {
  const vacio = {
    vacantes: 0,
    enviados: 0,
    sinNovedades: 0,
    fallidos: 0,
    pendientes: 0,
    quedanHoy: 0,
    quedanMes: 0,
  };

  const admin = getAdminClient();
  if (!admin)
    return { ...vacio, ok: false, motivo: "Falta SUPABASE_SERVICE_ROLE_KEY." };
  if (!emailEnabled())
    return { ...vacio, ok: false, motivo: "Falta RESEND_API_KEY." };

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
  // correo y la confianza de una sola vez.
  if (isSettingOn(conf.maintenance_mode))
    return {
      ...vacio,
      ok: false,
      motivo:
        "Modo mantenimiento encendido: no se manda nada para no llevar gente a la pantalla de mantenimiento.",
    };
  if (conf.digest_enabled !== undefined && !isSettingOn(conf.digest_enabled))
    return {
      ...vacio,
      ok: false,
      motivo: "Apagado desde el admin (digest_enabled).",
    };

  /* ── Cuánto se puede mandar ──────────────────────────────────────── */
  const cupo = await cupoEmail();
  const permitido = Math.max(
    Math.min(cupo.quedanHoy - RESERVA, cupo.quedanMes, opts.limite ?? Infinity),
    0
  );
  if (permitido === 0)
    return {
      ...vacio,
      ok: false,
      quedanHoy: cupo.quedanHoy,
      quedanMes: cupo.quedanMes,
      motivo:
        cupo.quedanMes === 0
          ? "Se agotó el cupo del mes en Resend. Sigue el mes que viene."
          : `Cupo del día agotado (quedan ${cupo.quedanHoy}, reservados ${RESERVA} para invitaciones y avisos). Sigue mañana.`,
    };

  const ahora = Date.now();
  const nowIso = new Date(ahora).toISOString();
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
    .filter((j) => !j.expires_at || j.expires_at > nowIso)
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
    return {
      ...vacio,
      ok: true,
      quedanHoy: cupo.quedanHoy,
      quedanMes: cupo.quedanMes,
      motivo: "No hay vacantes nuevas de empresas verificadas.",
    };

  /* ── A quiénes les toca ────────────────────────────────────────────
     Se piden uno más que los permitidos para poder informar si quedó gente
     esperando, sin hacer una segunda consulta de conteo. */
  const { data: gente } = await admin
    .from("candidates")
    .select(
      "id, full_name, location_city, country, preferences_industry, preferences_modality, first_job_mode, open_to_other_cities"
    )
    .eq("alerts_enabled", true)
    .neq("email_notifications", false)
    .or(`digest_sent_at.is.null,digest_sent_at.lt.${cortePersona}`)
    .order("digest_sent_at", { ascending: true, nullsFirst: true })
    .limit(permitido + 1);

  const cola = (gente ?? []) as any[];
  const tanda = cola.slice(0, permitido);

  let enviados = 0;
  let sinNovedades = 0;
  let fallidos = 0;

  for (const p of tanda) {
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
       motivo. Un puntaje que no se puede explicar no se puede mostrar, y un
       "87% de coincidencia" sin explicación se nota inventado. */
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

    const lista: DigestJob[] = elegidas.map(({ j }) => ({
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

    const ok = await sendEmail({
      to,
      subject: digestAsunto({
        primerPuesto: lista[0].title,
        ciudad: p.location_city || null,
        total,
      }),
      html: digestHtml({
        nombre,
        jobs: lista,
        totalNuevas: total,
        verTodasUrl: `${base}/empleos`,
        preferenciasUrl: `${base}/alertas`,
        bajaUrl,
        ciudad: p.location_city || null,
      }),
      text: digestTexto({
        nombre,
        jobs: lista,
        totalNuevas: total,
        verTodasUrl: `${base}/empleos`,
        bajaUrl,
      }),
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
    // diario, que es lo que arruina la reputación del dominio.
    await admin
      .from("candidates")
      .update({ digest_sent_at: new Date().toISOString() })
      .eq("id", p.id);

    await new Promise((r) => setTimeout(r, ESPERA_MS));
  }

  const despues = await cupoEmail();
  return {
    ok: true,
    vacantes: jobs.length,
    enviados,
    sinNovedades,
    fallidos,
    // El +1 que se pidió de más: si vino, es que hay al menos uno esperando.
    pendientes: Math.max(cola.length - tanda.length, 0),
    quedanHoy: despues.quedanHoy,
    quedanMes: despues.quedanMes,
  };
}
