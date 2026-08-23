"use client";

// Historial local de vacantes vistas. Vive en el teléfono, no en la base: es
// una comodidad de navegación, no un dato de la persona, y así funciona igual
// sin sesión (mucha gente mira varias vacantes antes de crear su cuenta).
export type RecentJob = {
  id: string;
  title: string;
  company: string;
  external?: boolean;
  at: number;
};

const KEY = "worka_recent_jobs";
const MAX = 8;

export function readRecentJobs(): RecentJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as RecentJob[]) : [];
  } catch {
    // Si alguien dejó basura en la clave, se ignora en vez de romper la pantalla.
    return [];
  }
}

export function rememberJob(job: Omit<RecentJob, "at">) {
  if (typeof window === "undefined") return;
  try {
    const list = readRecentJobs().filter((j) => j.id !== job.id);
    list.unshift({ ...job, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Modo privado o almacenamiento lleno: no vale romper nada por esto.
  }
}
