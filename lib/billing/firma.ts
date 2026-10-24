import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Firma de los webhooks de Lemon Squeezy.
//
// Cada entrega trae en la cabecera X-Signature el HMAC-SHA256 del cuerpo
// CRUDO con el secreto que se cargó al crear el webhook, en hexadecimal.
// Se compara con timingSafeEqual: una comparación común filtra, por el
// tiempo que tarda, cuántos caracteres acertó quien prueba firmas.
//
// El cuerpo tiene que ser exactamente el que llegó (request.text()): volver
// a serializar el JSON cambia espacios u orden y la firma ya no coincide.
export function firmaValida(
  cuerpo: string,
  firma: string | null | undefined,
  secreto: string | null | undefined
): boolean {
  if (!firma || !secreto) return false;
  const esperada = createHmac("sha256", secreto).update(cuerpo, "utf8").digest("hex");
  const a = Buffer.from(esperada, "utf8");
  const b = Buffer.from(firma.trim(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Clave de un evento: el mismo cuerpo reintentado da la misma clave. */
export function claveEvento(cuerpo: string): string {
  return createHash("sha256").update(cuerpo, "utf8").digest("hex");
}
