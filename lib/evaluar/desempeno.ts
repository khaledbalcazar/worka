import "server-only";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";
import type { Ciclo, CicloRow, Desempeno } from "./desempeno-tipos";

// Acceso a datos de evaluacion de desempeno. Los tipos y los calculos estan
// en desempeno-tipos.ts, que si puede viajar al navegador.
export * from "./desempeno-tipos";

export async function getMisCiclos(): Promise<CicloRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("evaluar_ciclos")
    .select("*, evaluar_desempeno(status)")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as (Ciclo & {
    evaluar_desempeno: { status: string }[];
  })[]).map((c) => ({
    ...c,
    total: c.evaluar_desempeno?.length ?? 0,
    enviadas:
      c.evaluar_desempeno?.filter((e) => e.status === "enviada").length ?? 0,
  }));
}

export type CicloDetalle = {
  ciclo: Ciclo;
  evaluaciones: Desempeno[];
};

export async function getCiclo(id: string): Promise<CicloDetalle | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: ciclo } = await supabase
    .from("evaluar_ciclos")
    .select("*")
    .eq("id", id)
    .eq("company_id", user.id)
    .maybeSingle();
  if (!ciclo) return null;

  const { data: evaluaciones } = await supabase
    .from("evaluar_desempeno")
    .select("*")
    .eq("ciclo_id", id)
    .order("empleado_nombre");

  return {
    ciclo: ciclo as Ciclo,
    evaluaciones: (evaluaciones ?? []) as Desempeno[],
  };
}

// Lo que le toca cargar a quien evalúa. Es la pantalla que abre un jefe de
// área, que no es dueño de la cuenta y no ve el resto del ciclo.
export async function getMisPendientes(): Promise<
  (Desempeno & { ciclo: { title: string; status: string } | null })[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  // Dos casos: las que ya estan enlazadas a la cuenta, y las que quedaron
  // esperando por email porque la persona se registro despues de que la
  // cargaran. Las dos son "me toca evaluar".
  const email = (user.email ?? "").toLowerCase();
  const filtro = email
    ? `evaluador_id.eq.${user.id},and(evaluador_id.is.null,evaluador_email.eq.${email})`
    : `evaluador_id.eq.${user.id}`;

  const { data } = await supabase
    .from("evaluar_desempeno")
    .select("*, ciclo:evaluar_ciclos(title, status)")
    .or(filtro)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as (Desempeno & {
    ciclo: { title: string; status: string } | null;
  })[];
}

// La propia, para el empleado. Solo las enviadas: antes de eso es el borrador
// de su jefe, y leerlo a medio escribir no le sirve a nadie.
export async function getMiDesempeno(): Promise<
  (Desempeno & { ciclo: { title: string } | null })[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("evaluar_desempeno")
    .select("*, ciclo:evaluar_ciclos(title)")
    .eq("empleado_id", user.id)
    .eq("status", "enviada")
    .order("sent_at", { ascending: false });

  return (data ?? []) as unknown as (Desempeno & {
    ciclo: { title: string } | null;
  })[];
}