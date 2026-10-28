"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { findUserIdByEmail, getMyEvaluarAccess } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import { cupoEmail, emailEnabled, emailLayout, enviarEmail } from "@/lib/email";
import { evaluarUrl } from "@/lib/supabase/config";

// Acciones de evaluación de desempeño.
//
// Van en su propio archivo y no en app/evaluar/actions.ts: aquel ya pasa las
// mil setecientas líneas y son dos productos distintos.

type Result = {
  ok: boolean;
  error?: string;
  id?: string;
  /** Algo salió bien pero hay que contarlo (cuántos correos salieron, etc.). */
  aviso?: string;
};

const DEMO: Result = {
  ok: false,
  error: "Modo demostración: conectá Supabase para guardar de verdad.",
};

async function requireEmpresa() {
  const supabase = await getServerClient();
  if (!supabase) return { supabase: null, user: null } as const;
  const user = await getCurrentUser();
  return { supabase, user } as const;
}

// El desempeño es del plan Profesional para arriba: es un producto aparte de
// la selección y una pyme que contrata un cajero al año no lo necesita.
async function requirePlan(): Promise<string | null> {
  const access = await getMyEvaluarAccess();
  if (!access.active) return "Tu acceso a Worka Evaluar no está vigente.";
  const plan = planOf(access);
  if (!plan.reports)
    return `La evaluación de desempeño viene desde el plan Profesional. Tu plan actual es ${plan.label}.`;
  return null;
}

export async function crearCiclo(input: {
  title: string;
  description?: string;
  competencias: string[];
}): Promise<Result> {
  const { supabase, user } = await requireEmpresa();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };
  const bloqueo = await requirePlan();
  if (bloqueo) return { ok: false, error: bloqueo };

  if (!input.title.trim())
    return {
      ok: false,
      error: "Poné un nombre al ciclo. Por ejemplo: Primer semestre 2026.",
    };
  if (input.competencias.length === 0)
    return { ok: false, error: "Elegí al menos una competencia a evaluar." };

  const { data, error } = await supabase
    .from("evaluar_ciclos")
    .insert({
      company_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      competencias: input.competencias,
    })
    .select("id")
    .single();

  if (error) {
    console.error("crearCiclo:", error);
    return { ok: false, error: "No pudimos crear el ciclo." };
  }
  revalidatePath("/evaluar/app/desempeno");
  return { ok: true, id: (data as { id: string }).id };
}

export async function actualizarCiclo(
  id: string,
  input: {
    title?: string;
    description?: string;
    competencias?: string[];
    status?: "borrador" | "abierto" | "cerrado";
    closes_at?: string | null;
  }
): Promise<Result> {
  const { supabase, user } = await requireEmpresa();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  // Abrir un ciclo sin gente cargada deja a los jefes mirando una lista vacía
  // y sin saber si es un error suyo.
  if (input.status === "abierto") {
    const { count } = await supabase
      .from("evaluar_desempeno")
      .select("id", { count: "exact", head: true })
      .eq("ciclo_id", id);
    if (!count)
      return {
        ok: false,
        error: "Cargá al menos una persona antes de abrir el ciclo.",
      };
  }

  const { error } = await supabase
    .from("evaluar_ciclos")
    .update({
      ...input,
      ...(input.status === "abierto"
        ? { opens_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", id)
    .eq("company_id", user.id);

  if (error) {
    console.error("actualizarCiclo:", error);
    return { ok: false, error: "No pudimos guardar los cambios." };
  }
  revalidatePath(`/evaluar/app/desempeno/${id}`);
  revalidatePath("/evaluar/app/desempeno");

  // Abrir el ciclo es el momento de avisarle a cada jefe. Antes no salía
  // ningún correo: el ciclo quedaba abierto y nadie se enteraba.
  if (input.status === "abierto") {
    const r = await invitar(supabase, user.id, id, {});
    return { ok: true, aviso: `Ciclo abierto. ${r.resumen}` };
  }
  return { ok: true };
}

export async function agregarEvaluado(
  cicloId: string,
  input: {
    nombre: string;
    puesto?: string;
    area?: string;
    conduce?: boolean;
    evaluadorEmail: string;
    /** Además de la del jefe, crear la autoevaluación. */
    conAuto?: boolean;
    empleadoEmail?: string;
  }
): Promise<Result> {
  const { supabase, user } = await requireEmpresa();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  if (!input.nombre.trim())
    return { ok: false, error: "Escribí el nombre de la persona." };

  const evalEmail = input.evaluadorEmail.trim().toLowerCase();
  if (!/.+@.+..+/.test(evalEmail))
    return { ok: false, error: "Escribí un email válido para quien evalúa." };

  // Si ya tiene cuenta se enlaza ahora; si no, la fila queda esperando y se
  // resuelve sola cuando entre con ese correo. Exigir la cuenta primero era
  // un callejón sin salida: RRHH no podía cargar hasta que el jefe se
  // registrara, y el jefe no tenía motivo para registrarse hasta que lo
  // cargaran.
  const evaluadorId = await findUserIdByEmail(evalEmail);

  // A quién se evalúa puede no tenerla: se guarda igual y ve su evaluación
  // cuando se registre con ese email.
  let empleadoId: string | null = null;
  if (input.empleadoEmail?.trim()) {
    empleadoId = await findUserIdByEmail(input.empleadoEmail);
  }

  const base = {
    ciclo_id: cicloId,
    empleado_id: empleadoId,
    empleado_email: input.empleadoEmail?.trim().toLowerCase() ?? "",
    empleado_nombre: input.nombre.trim(),
    empleado_puesto: input.puesto?.trim() ?? "",
    empleado_area: input.area?.trim() ?? "",
    conduce: !!input.conduce,
  };

  const filas: Record<string, unknown>[] = [
    {
      ...base,
      evaluador_id: (evaluadorId as string | null) ?? null,
      evaluador_email: evalEmail,
      tipo: "jefe",
    },
  ];

  // La autoevaluación solo tiene sentido si la persona tiene cuenta: es ella
  // quien la carga.
  if (input.conAuto && (empleadoId || input.empleadoEmail?.trim())) {
    filas.push({
      ...base,
      evaluador_id: empleadoId,
      evaluador_email: input.empleadoEmail!.trim().toLowerCase(),
      tipo: "auto",
    });
  }

  const { error } = await supabase.from("evaluar_desempeno").insert(filas);
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Esa persona ya está cargada en el ciclo." };
    console.error("agregarEvaluado:", error);
    return { ok: false, error: "No pudimos agregar a esa persona." };
  }

  revalidatePath(`/evaluar/app/desempeno/${cicloId}`);

  // Con el ciclo ya abierto, a quien se suma se le avisa en el momento.
  const { data: estado } = await supabase.from("evaluar_ciclos").select("status").eq("id", cicloId).maybeSingle();
  let invitacion = "";
  if ((estado as { status?: string } | null)?.status === "abierto") {
    const emails = [evalEmail, ...(filas.length > 1 ? [input.empleadoEmail!.trim().toLowerCase()] : [])];
    invitacion = ` ${(await invitar(supabase, user.id, cicloId, { soloEmails: emails })).resumen}`;
  }

  return {
    ok: true,
    // Que quede claro que la fila quedó esperando y por qué: si no, la
    // persona aparece cargada y nadie entiende por qué el jefe no la ve.
    aviso:
      (evaluadorId
        ? "Persona cargada."
        : `Cargada. ${evalEmail} todavía no tiene cuenta en Worka: cuando entre con ese correo, la evaluación le va a aparecer sola.`) + invitacion,
  };
}

// ── Invitaciones por correo ────────────────────────────────────

/** Enlace directo a una evaluación, para mandar por correo o a mano. */
function enlaceEvaluacion(id: string) {
  return evaluarUrl(`/app/desempeno/evaluar/${id}`);
}

const escapar = (t: string) =>
  t.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

type Supa = NonNullable<Awaited<ReturnType<typeof getServerClient>>>;

// Un correo por evaluador con todo lo que tiene que cargar: a un jefe con
// seis personas a cargo le llegan seis enlaces en un mensaje, no seis
// mensajes. Las autoevaluaciones le llegan a la propia persona.
async function invitar(
  supabase: Supa,
  companyId: string,
  cicloId: string,
  opciones: { soloEmails?: string[] }
): Promise<{ enviados: number; fallidos: { email: string; error: string }[]; resumen: string; nada?: boolean }> {
  const { data: ciclo } = await supabase
    .from("evaluar_ciclos")
    .select("title, closes_at, status")
    .eq("id", cicloId)
    .eq("company_id", companyId)
    .maybeSingle();
  const c = ciclo as { title: string; closes_at: string | null; status: string } | null;
  if (!c) return { enviados: 0, fallidos: [], resumen: "No encontramos el ciclo." };

  const { data } = await supabase
    .from("evaluar_desempeno")
    .select("id, tipo, status, empleado_nombre, evaluador_email")
    .eq("ciclo_id", cicloId)
    .neq("status", "enviada");
  const filas = (data ?? []) as { id: string; tipo: string; status: string; empleado_nombre: string; evaluador_email: string }[];

  const solo = opciones.soloEmails?.map((e) => e.toLowerCase());
  const porEmail = new Map<string, typeof filas>();
  for (const f of filas) {
    const email = (f.evaluador_email ?? "").trim().toLowerCase();
    if (!email || (solo && !solo.includes(email))) continue;
    porEmail.set(email, [...(porEmail.get(email) ?? []), f]);
  }
  if (porEmail.size === 0)
    return { enviados: 0, fallidos: [], resumen: "No quedan evaluaciones pendientes para avisar.", nada: true };

  if (!emailEnabled())
    return {
      enviados: 0,
      fallidos: [],
      resumen:
        "No salió ningún correo: el envío no está configurado en el servidor (falta RESEND_API_KEY). Usá «Copiar enlace» para pasarlos a mano.",
    };

  const cupo = await cupoEmail();
  if (cupo.quedanHoy < porEmail.size)
    return {
      enviados: 0,
      fallidos: [],
      resumen: `No alcanza el cupo de correos de hoy (quedan ${cupo.quedanHoy} y hacen falta ${porEmail.size}). Probá mañana o pasá los enlaces a mano.`,
    };

  const plazo = c.closes_at
    ? new Date(c.closes_at).toLocaleDateString("es-PY", { day: "numeric", month: "long" })
    : null;
  let enviados = 0;
  const fallidos: { email: string; error: string }[] = [];

  for (const [email, lista] of porEmail) {
    const propias = lista.filter((f) => f.tipo === "auto");
    const ajenas = lista.filter((f) => f.tipo !== "auto");
    const items = [
      ...propias.map((f) => ({ texto: "Tu autoevaluación", url: enlaceEvaluacion(f.id) })),
      ...ajenas.map((f) => ({ texto: f.empleado_nombre, url: enlaceEvaluacion(f.id) })),
    ];
    const r = await enviarEmail({
      to: email,
      subject:
        ajenas.length > 0
          ? `Te toca evaluar ${ajenas.length === 1 ? `a ${ajenas[0].empleado_nombre}` : `a ${ajenas.length} personas`} — ${c.title}`
          : `Tu autoevaluación de desempeño — ${c.title}`,
      html: emailLayout(
        `
        <p>Hola,</p>
        <p>Se abrió la evaluación de desempeño <strong>${escapar(c.title)}</strong>${plazo ? ` y cierra el <strong>${plazo}</strong>` : ""}.
        ${ajenas.length > 0 ? "Te toca evaluar a estas personas:" : "Te toca completar tu autoevaluación:"}</p>
        <ul style="padding-left:18px">
          ${items.map((i) => `<li style="margin:6px 0"><a href="${i.url}" style="color:#0a66c2;font-weight:600">${escapar(i.texto)}</a></li>`).join("")}
        </ul>
        <p style="color:#6b7280;font-size:13px">Cada competencia tiene descripciones de conducta: elegís la que mejor describe lo que viste,
        no un número. Lo que vas cargando se guarda solo.</p>
        <p style="color:#6b7280;font-size:13px">Entrá con <strong>${escapar(email)}</strong>. Si todavía no tenés cuenta en Worka,
        creala con ese mismo correo y las evaluaciones te van a aparecer.</p>
      `,
        "Recibís este correo porque tu empresa te incluyó en una evaluación de desempeño en Worka Evaluar."
      ),
      text: [`Se abrió la evaluación de desempeño ${c.title}.`, ...items.map((i) => `${i.texto}: ${i.url}`), `Entrá con ${email}.`].join("\n"),
    });
    if (r.ok) enviados++;
    else fallidos.push({ email, error: r.error ?? "No salió." });
  }

  const resumen =
    fallidos.length === 0
      ? `Enviamos ${enviados} ${enviados === 1 ? "invitación" : "invitaciones"} por correo.`
      : `Enviamos ${enviados} de ${porEmail.size}. No salieron: ${fallidos.map((f) => f.email).join(", ")}. Motivo: ${fallidos[0].error}`;
  return { enviados, fallidos, resumen };
}

// «Recordar a quienes faltan»: vuelve a mandar el enlace a todos los que
// tienen algo sin enviar. Solo el dueño del ciclo.
export async function enviarInvitaciones(cicloId: string): Promise<Result> {
  const { supabase, user } = await requireEmpresa();
  if (!supabase) return { ok: true, aviso: "Modo demostración: no se envían correos. Usá «Copiar enlace»." };
  if (!user) return { ok: false, error: "Iniciá sesión como empresa." };

  const { data: ciclo } = await supabase
    .from("evaluar_ciclos")
    .select("status")
    .eq("id", cicloId)
    .eq("company_id", user.id)
    .maybeSingle();
  if (!ciclo) return { ok: false, error: "No encontramos el ciclo." };
  if ((ciclo as { status: string }).status !== "abierto")
    return { ok: false, error: "Abrí el ciclo primero: en borrador los jefes todavía no pueden cargar nada." };

  const r = await invitar(supabase, user.id, cicloId, {});
  if (r.enviados === 0 && !r.nada) return { ok: false, error: r.resumen };
  return { ok: true, aviso: r.resumen };
}

export async function quitarEvaluado(
  cicloId: string,
  id: string
): Promise<Result> {
  const { supabase, user } = await requireEmpresa();
  if (!supabase) return DEMO;
  if (!user) return { ok: false, error: "Iniciá sesión." };

  const { error } = await supabase
    .from("evaluar_desempeno")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: "No pudimos quitarla." };
  revalidatePath(`/evaluar/app/desempeno/${cicloId}`);
  return { ok: true };
}

// Guarda lo que va cargando el evaluador. Se llama seguido, así que no
// revalida nada: la pantalla ya tiene el estado.
export async function guardarDesempeno(
  id: string,
  input: {
    puntajes?: Record<string, number>;
    comentarios?: Record<string, string>;
    fortalezas?: string;
    a_mejorar?: string;
    compromisos?: string;
  }
): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión." };

  // Sin filtrar por evaluador_id: cuando la persona entro por email todavia
  // lo tiene en nulo, y ese filtro hacia que el update tocara cero filas sin
  // devolver error. La pantalla decia "Guardado" y no se guardaba nada.
  // La politica de RLS ya cubre los dos casos, asi que alcanza con ella.
  const { data, error } = await supabase
    .from("evaluar_desempeno")
    .update({ ...input, status: "en_curso" })
    .eq("id", id)
    .neq("status", "enviada")
    .select("id");

  if (error) {
    console.error("guardarDesempeno:", error);
    return { ok: false, error: "No pudimos guardar." };
  }
  // Cero filas es lo que antes pasaba en silencio: o no te corresponde, o ya
  // fue enviada. En los dos casos hay que decirlo, no fingir que se guardo.
  if (!data || data.length === 0)
    return {
      ok: false,
      error:
        "No pudimos guardar: o esta evaluación ya fue enviada, o no sos vos quien tiene que cargarla.",
    };
  return { ok: true };
}

// Enviar es lo que la vuelve visible para la persona evaluada, y es de una
// sola vía: después de esto ya la leyó.
export async function enviarDesempeno(
  id: string,
  competenciasEsperadas: string[]
): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión." };

  const { data: fila } = await supabase
    .from("evaluar_desempeno")
    .select("puntajes, status")
    .eq("id", id)
    .maybeSingle();
  if (!fila) return { ok: false, error: "No encontramos esa evaluación." };
  if ((fila as { status: string }).status === "enviada")
    return { ok: false, error: "Esa evaluación ya fue enviada." };

  const puntajes = (fila as { puntajes: Record<string, number> }).puntajes ?? {};
  const faltan = competenciasEsperadas.filter((k) => !puntajes[k]);
  if (faltan.length > 0)
    return {
      ok: false,
      error: `Te faltan ${faltan.length} ${
        faltan.length === 1 ? "competencia" : "competencias"
      } por calificar.`,
    };

  const { data: tocadas, error } = await supabase
    .from("evaluar_desempeno")
    .update({ status: "enviada", sent_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: "No pudimos enviarla." };
  if (!tocadas || tocadas.length === 0)
    return { ok: false, error: "No sos vos quien tiene que enviar esta evaluación." };
  revalidatePath("/evaluar/app/desempeno");
  return { ok: true };
}

// El acuse del empleado. No es conformidad: es constancia de que la leyó, y
// el comentario es su derecho a dejar asentado lo que piense.
export async function acusarDesempeno(
  id: string,
  comentario: string
): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión." };

  const { error } = await supabase
    .from("evaluar_desempeno")
    .update({
      acuse_at: new Date().toISOString(),
      acuse_comentario: comentario.trim(),
    })
    .eq("id", id)
    .eq("empleado_id", user.id);

  if (error) {
    console.error("acusarDesempeno:", error);
    return { ok: false, error: "No pudimos registrar tu acuse." };
  }
  revalidatePath("/evaluar/app/desempeno/mias");
  return { ok: true };
}

// Avisarle a la persona que su evaluación está lista.
//
// Faltaba por completo: la evaluación se enviaba y quedaba esperando a que
// alguien entrara por su cuenta a buscarla, cosa que no pasa. Una devolución
// de desempeño se comunica, no se publica.
//
// Lo puede disparar el evaluador o quien administra el ciclo, que es como
// funciona de verdad: a veces avisa el jefe y a veces RRHH.
export async function avisarAlEmpleado(id: string): Promise<Result> {
  const supabase = await getServerClient();
  if (!supabase) return DEMO;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Iniciá sesión." };

  // Si la política deja leerla, quien pregunta es el evaluador, la empresa o
  // el propio empleado. Los dos primeros pueden avisar.
  const { data } = await supabase
    .from("evaluar_desempeno")
    .select(
      "id, status, empleado_nombre, empleado_email, empleado_id, evaluador_id, evaluador_email, notificado_at, ciclo:evaluar_ciclos(title, company_id)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return { ok: false, error: "No encontramos esa evaluación." };

  const fila = data as unknown as {
    status: string;
    empleado_nombre: string;
    empleado_email: string;
    evaluador_id: string | null;
    evaluador_email: string;
    notificado_at: string | null;
    ciclo: { title: string; company_id: string } | null;
  };

  if (fila.status !== "enviada")
    return {
      ok: false,
      error: "Primero enviá la evaluación. Recién ahí la persona puede leerla.",
    };

  const email = fila.empleado_email?.trim();
  if (!email)
    return {
      ok: false,
      error:
        "Esta persona no tiene email cargado. Agregalo desde el ciclo y volvé a intentar.",
    };

  const puedeAvisar =
    fila.evaluador_id === user.id ||
    fila.evaluador_email?.toLowerCase() ===
      (user.email ?? "").toLowerCase() ||
    fila.ciclo?.company_id === user.id;
  if (!puedeAvisar)
    return { ok: false, error: "No podés avisar sobre esta evaluación." };

  if (!emailEnabled())
    return {
      ok: false,
      error:
        "El envío de correos no está configurado. Pasale el enlace vos: evaluar.worka.click/app/desempeno/mias",
    };

  const base = evaluarUrl();
  const url = `${base}/app/desempeno/mias`;
  const nombre = fila.empleado_nombre?.split(" ")[0] ?? "";

  const enviado = await enviarEmail({
    to: email,
    subject: `Tu evaluación de desempeño está lista${fila.ciclo?.title ? ` — ${fila.ciclo.title}` : ""}`,
    html: emailLayout(`
      <p>Hola${nombre ? ` ${nombre}` : ""},</p>
      <p>Tu evaluación de desempeño${fila.ciclo?.title ? ` de <strong>${fila.ciclo.title}</strong>` : ""}
      ya está disponible para que la leas.</p>
      <p>Vas a ver cómo te calificaron en cada competencia, con la descripción
      exacta que eligió quien te evaluó, y lo que se propone para el próximo
      período.</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">
          Ver mi evaluación
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">Entrá con <strong>${email}</strong>.
      Si todavía no tenés cuenta en Worka, creala con ese mismo correo y la
      evaluación te va a aparecer.</p>
      <p style="color:#6b7280;font-size:13px">Al final vas a poder dejar
      constancia de que la leíste. Eso <strong>no significa que estés de
      acuerdo</strong>: si algo no te parece, hay un espacio para escribirlo y
      queda guardado junto a la evaluación.</p>
    `, "Recibís este correo porque tu empresa te evaluó en Worka Evaluar."),
  });

  if (!enviado.ok)
    return {
      ok: false,
      error: `No pudimos enviar el correo. ${enviado.error ?? ""} Pasale el enlace a mano: ${url}`,
    };

  await supabase
    .from("evaluar_desempeno")
    .update({ notificado_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/evaluar/app/desempeno");
  return { ok: true };
}
