"use client";

// Confeti al postularse. Postularse es el momento que importa de toda la app y
// merece una respuesta: hasta ahora la única señal era un cartel de texto.
//
// La librería se carga recién al usarla (import dinámico), así no pesa en la
// carga inicial del feed, que es lo que la persona espera de verdad. Y se
// respeta a quien pidió menos movimiento en su sistema.
export async function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const { default: confetti } = await import("canvas-confetti");
    // Dos ráfagas laterales: se ve bien tanto en celular como en escritorio,
    // y no tapa el mensaje de confirmación del centro.
    const base = {
      particleCount: 45,
      spread: 60,
      startVelocity: 32,
      ticks: 140,
      scalar: 0.9,
      colors: ["#2563eb", "#1e3a8a", "#10b981", "#f59e0b"],
    };
    confetti({ ...base, origin: { x: 0.15, y: 0.75 }, angle: 60 });
    confetti({ ...base, origin: { x: 0.85, y: 0.75 }, angle: 120 });
  } catch {
    // Si el paquete no carga, la postulación ya se envió igual: no pasa nada.
  }
}
