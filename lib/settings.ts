// Los ajustes del sitio se guardan como texto libre en site_settings, así que
// los interruptores llegan como string. Compararlos con `!valor` es una trampa:
// "false", "no" y "0" son strings NO vacíos y por lo tanto truthy. Escribir
// "false" en "Modo mantenimiento" apagaba el sitio entero para todo el mundo
// menos para el admin, que lo seguía viendo normal y no se enteraba.
const ON = new Set(["true", "1", "si", "sí", "on", "activo", "yes"]);

export function isSettingOn(value: string | undefined | null): boolean {
  if (!value) return false;
  return ON.has(value.trim().toLowerCase());
}
