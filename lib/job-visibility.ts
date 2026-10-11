// Una vacante se ve en /empleos solo si está "Activo" Y no venció. Las dos
// cosas son independientes: al vencer, el estado sigue diciendo "Activo",
// así que mirar solo el estado (como hacían el admin y los contadores)
// mostraba como publicadas vacantes que nadie podía encontrar.

export function isJobExpired(expiresAt: string | null | undefined, now = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= now;
}

export function isJobListed(job: { status: string; expires_at: string | null | undefined }, now = Date.now()): boolean {
  return job.status === "Activo" && !isJobExpired(job.expires_at, now);
}

// Nueva fecha de vencimiento, contando desde hoy.
export function renewalDate(days: number, now = Date.now()): string {
  return new Date(now + days * 86400000).toISOString();
}

// Destaque pago vigente. featured_until vencido = ya no se destaca, aunque
// la columna featured siga en true (nadie la apaga al vencer).
export function isJobFeatured(job: { featured: boolean; featured_until?: string | null }, now = Date.now()): boolean {
  return job.featured && !isJobExpired(job.featured_until ?? null, now);
}
