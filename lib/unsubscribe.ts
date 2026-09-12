import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/* Enlaces de baja firmados.
 *
 * El correo de novedades sale a toda la base, así que quien lo recibe tiene
 * que poder darse de baja sin iniciar sesión: si para desuscribirse hay que
 * recordar la contraseña, la gente no se desuscribe, marca spam. Y una marca
 * de spam pesa muchísimo más que una baja — arrastra a los correos que sí
 * importan (la invitación a una entrevista, el aviso de una postulación).
 *
 * El token es el id del usuario más una firma HMAC. No hay tabla de tokens:
 * no hace falta guardar nada, no caduca, y nadie puede fabricar el link de
 * otro porque no tiene la clave.
 */

// Clave de firma. Se prefiere una propia para que rotar la service role key
// —algo que puede pasar por seguridad— no invalide de golpe los enlaces de
// baja que ya están dentro de correos enviados hace meses.
function clave(): string | null {
  return (
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    null
  );
}

function firmar(userId: string, secreto: string): string {
  return createHmac("sha256", secreto)
    .update(userId)
    .digest("base64url")
    .slice(0, 32);
}

export function bajaToken(userId: string): string | null {
  const secreto = clave();
  if (!secreto) return null;
  return `${userId}.${firmar(userId, secreto)}`;
}

export function verificarBaja(token: string): string | null {
  const secreto = clave();
  if (!secreto) return null;
  const corte = token.lastIndexOf(".");
  if (corte <= 0) return null;
  const userId = token.slice(0, corte);
  const firma = token.slice(corte + 1);

  const esperada = firmar(userId, secreto);
  // Comparación de tiempo constante: comparar con === filtra información
  // sobre cuántos caracteres acertó quien está probando firmas.
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? userId : null;
}
