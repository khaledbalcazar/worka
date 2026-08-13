// Guarda la Anthropic API key SOLO en el navegador (localStorage), nunca en
// el servidor de Worka ni en ninguna base de datos. Se envía en cada
// request al backend del aula vía header, y el servidor la usa "al vuelo"
// para esa llamada puntual, sin persistirla.
const KEY = 'dgrec_anthropic_key_v1';

export function loadApiKey(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem(KEY, key.trim());
    else localStorage.removeItem(KEY);
  } catch {
    // localStorage no disponible: no es crítico.
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
