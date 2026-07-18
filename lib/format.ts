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

// Normaliza un teléfono paraguayo al formato internacional para wa.me.
// Acepta "0992 123 456", "+595 992 123456", "992123456"… → "595992123456".
export function toPyWhatsapp(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("595")) {
    // ya tiene código de país
  } else if (digits.startsWith("0")) {
    digits = "595" + digits.slice(1); // 0992… → 595992…
  } else {
    digits = "595" + digits; // 992… → 595992…
  }
  return digits;
}

// Muestra el teléfono en formato local legible: "0992 123 456".
export function formatPyPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("595") ? "0" + d.slice(3) : d.startsWith("0") ? d : "0" + d;
  const m = local.match(/^(\d{4})(\d{3})(\d{3})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : local;
}
