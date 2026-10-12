// Agrupa las vacantes por vencer y vencidas en un aviso por empresa.
// Sin dependencias de servidor para poder probarlo.

export type ExpiryJob = { id: string; title: string; company_id: string; expires_at: string };

export type ExpiryNotice = {
  companyId: string;
  title: string;
  detail: string;
  soonIds: string[];
  expiredIds: string[];
};

function day(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PY", { day: "numeric", month: "long", timeZone: "America/Asuncion" });
}

export function groupExpiryNotices(soon: ExpiryJob[], expired: ExpiryJob[], now = Date.now()): ExpiryNotice[] {
  const byCompany = new Map<string, { soon: ExpiryJob[]; expired: ExpiryJob[] }>();
  for (const j of soon) {
    const g = byCompany.get(j.company_id) ?? { soon: [], expired: [] };
    g.soon.push(j);
    byCompany.set(j.company_id, g);
  }
  for (const j of expired) {
    const g = byCompany.get(j.company_id) ?? { soon: [], expired: [] };
    g.expired.push(j);
    byCompany.set(j.company_id, g);
  }

  return [...byCompany.entries()].map(([companyId, g]) => {
    const parts = [
      ...g.expired.map((j) => `${j.title} — venció el ${day(j.expires_at)}`),
      ...g.soon.map((j) => {
        const days = Math.max(1, Math.ceil((Date.parse(j.expires_at) - now) / 86400000));
        return `${j.title} — vence ${days === 1 ? "mañana" : `en ${days} días`} (${day(j.expires_at)})`;
      }),
    ];
    const total = g.soon.length + g.expired.length;
    const title =
      g.expired.length > 0
        ? total === 1
          ? `Tu vacante «${g.expired[0].title}» venció`
          : `${total} vacantes vencieron o están por vencer`
        : total === 1
          ? `Tu vacante «${g.soon[0].title}» vence pronto`
          : `${total} vacantes vencen pronto`;
    return {
      companyId,
      title,
      detail: parts.join(" · "),
      soonIds: g.soon.map((j) => j.id),
      expiredIds: g.expired.map((j) => j.id),
    };
  });
}
