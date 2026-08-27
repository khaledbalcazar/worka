"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getMyEvaluarAccess } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";

// Acciones de evaluación de desempeño.
//
// Van en su propio archivo y no en app/evaluar/actions.ts: aquel ya pasa las
// mil setecientas líneas y son dos productos distintos.

type Result = { ok: boolean; error?: string; id?: string };

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

  // Quien evalúa tiene que tener cuenta: va a entrar a cargar.
  const { data: evaluadorId } = await supabase.rpc("fn_user_id_by_email", {
    p_email: input.evaluadorEmail.trim().toLowerCase(),
  });
  if (!evaluadorId)
    return {
      ok: false,
      error:
        "No encontramos una cuenta de Worka con ese email. Tiene que ser el " +
        "mismo con el que se registró, y quien evalúa necesita cuenta porque " +
        "va a entrar a cargar la evaluación.",
    };

  // A quién se evalúa puede no tenerla: se guarda igual y ve su evaluación
  // cuando se registre con ese email.
  let empleadoId: string | null = null;
  if (input.empleadoEmail?.trim()) {
    const { data } = await supabase.rpc("fn_user_id_by_email", {
      p_email: input.empleadoEmail.trim().toLowerCase(),
    });
    empleadoId = (data as string | null) ?? null;
  }

  const base = {
    ciclo_id: cicloId,
    empleado_id: empleadoId,
    empleado_nombre: input.nombre.trim(),
    empleado_puesto: input.puesto?.trim() ?? "",
    empleado_area: input.area?.trim() ?? "",
    conduce: !!input.conduce,
  };

  const filas: Record<string, unknown>[] = [
    { ...base, evaluador_id: evaluadorId as string, tipo: "jefe" },
  ];

  // La autoevaluación solo tiene sentido si la persona tiene cuenta: es ella
  // quien la carga.
  if (input.conAuto && empleadoId) {
    filas.push({ ...base, evaluador_id: empleadoId, tipo: "auto" });
  }

  const { error } = await supabase.from("evaluar_desempeno").insert(filas);
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Esa persona ya está cargada en el ciclo." };
    console.error("agregarEvaluado:", error);
    return { ok: false, error: "No pudimos agregar a esa persona." };
  }

  revalidatePath(`/evaluar/app/desempeno/${cicloId}`);
  return { ok: true };
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

  const { error } = await supabase
    .from("evaluar_desempeno")
    .update({ ...input, status: "en_curso" })
    .eq("id", id)
    .eq("evaluador_id", user.id)
    .neq("status", "enviada");

  if (error) {
    console.error("guardarDesempeno:", error);
    return { ok: false, error: "No pudimos guardar." };
  }
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
    .eq("evaluador_id", user.id)
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

  const { error } = await supabase
    .from("evaluar_desempeno")
    .update({ status: "enviada", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("evaluador_id", user.id);

  if (error) return { ok: false, error: "No pudimos enviarla." };
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
