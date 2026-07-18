export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `hace ${Math.max(minutes, 1)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? "hace 1 día" : `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function whatsappShareUrl(jobTitle: string, jobId: string): string {
  const text = `Mirá esta vacante en Worka: ${jobTitle} — https://worka.com.py/empleo/${jobId}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
