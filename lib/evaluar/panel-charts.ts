// Gráficas del inicio de Worka Evaluar, calculadas a partir de los
// candidatos de todos los procesos. Sin dependencias: lo usan el modo real
// y el demo, y se puede probar con node --test.

export type PanelPerson = {
  process_id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  max_score: number | null;
};

export type PanelCharts = {
  // Últimos 30 días (hora de Asunción): altas y evaluaciones terminadas.
  daily: { day: string; label: string; invited: number; completed: number }[];
  byStatus: { key: string; label: string; value: number }[];
  perProcess: { id: string; title: string; invited: number; started: number; finished: number; decided: number }[];
  // Puntaje de quienes terminaron, en tramos de 20 puntos.
  scoreBuckets: { label: string; value: number }[];
};

const TZ = "America/Asuncion";
const DAY = 86_400_000;

const dayKey = (d: string | number) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });

export const STATUS_LABELS: Record<string, string> = {
  invitado: "Invitados",
  en_curso: "Rindiendo",
  completado: "Para revisar",
  finalista: "Finalistas",
  contratado: "Contratados",
  descartado: "Descartados",
};

const FINISHED = new Set(["completado", "finalista", "contratado", "descartado"]);

export function buildPanelCharts(
  people: PanelPerson[],
  processes: { id: string; title: string; status: string }[],
  now = Date.now()
): PanelCharts {
  const days = Array.from({ length: 30 }, (_, i) => dayKey(now - (29 - i) * DAY));
  const invited = new Map<string, number>();
  const completed = new Map<string, number>();
  for (const p of people) {
    const c = dayKey(p.created_at);
    invited.set(c, (invited.get(c) ?? 0) + 1);
    if (p.completed_at) {
      const k = dayKey(p.completed_at);
      completed.set(k, (completed.get(k) ?? 0) + 1);
    }
  }

  const buckets = [0, 0, 0, 0, 0];
  for (const p of people) {
    if (!FINISHED.has(p.status) || p.score === null || !p.max_score) continue;
    const pct = Math.max(0, Math.min(100, (p.score / p.max_score) * 100));
    buckets[Math.min(4, Math.floor(pct / 20))]++;
  }

  return {
    daily: days.map((d) => ({
      day: d,
      label: `${d.slice(8, 10)}/${d.slice(5, 7)}`,
      invited: invited.get(d) ?? 0,
      completed: completed.get(d) ?? 0,
    })),
    byStatus: Object.entries(STATUS_LABELS).map(([key, label]) => ({
      key,
      label,
      value: people.filter((p) => p.status === key).length,
    })),
    perProcess: processes
      .filter((pr) => pr.status !== "borrador")
      .map((pr) => {
        const mine = people.filter((p) => p.process_id === pr.id);
        return {
          id: pr.id,
          title: pr.title,
          invited: mine.length,
          started: mine.filter((p) => p.started_at || FINISHED.has(p.status) || p.status === "en_curso").length,
          finished: mine.filter((p) => FINISHED.has(p.status)).length,
          decided: mine.filter((p) => ["finalista", "contratado", "descartado"].includes(p.status)).length,
        };
      })
      .filter((x) => x.invited > 0),
    scoreBuckets: ["0–20", "20–40", "40–60", "60–80", "80–100"].map((label, i) => ({ label, value: buckets[i] })),
  };
}
