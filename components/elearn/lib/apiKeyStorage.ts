// Credenciales de IA del Tutor, guardadas SOLO en el navegador
// (localStorage). Nunca se almacenan en el servidor de Worka ni en base de
// datos: se envían por header en cada consulta y el backend las usa al vuelo.
import { getProvider } from './aiProviders';

export interface AiCredentials {
  providerId: string;
  apiKey: string;
  model: string;
  baseUrl?: string; // solo para el proveedor "custom"
}

const KEY = 'dgrec_ai_credentials_v1';
const LEGACY_ANTHROPIC_KEY = 'dgrec_anthropic_key_v1';

const empty: AiCredentials = { providerId: 'groq', apiKey: '', model: '' };

export function loadCredentials(): AiCredentials {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty, ...JSON.parse(raw) };

    // Migración desde la versión anterior (solo Anthropic).
    const legacy = localStorage.getItem(LEGACY_ANTHROPIC_KEY);
    if (legacy) {
      const migrated: AiCredentials = {
        providerId: 'anthropic',
        apiKey: legacy,
        model: getProvider('anthropic').defaultModel
      };
      localStorage.setItem(KEY, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_ANTHROPIC_KEY);
      return migrated;
    }
    return empty;
  } catch {
    return empty;
  }
}

export function saveCredentials(creds: AiCredentials): void {
  try {
    if (creds.apiKey.trim()) {
      localStorage.setItem(KEY, JSON.stringify({ ...creds, apiKey: creds.apiKey.trim() }));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // localStorage no disponible: no es crítico.
  }
}

export function clearCredentials(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_ANTHROPIC_KEY);
  } catch {
    // no-op
  }
}

// Headers que autentican la consulta al backend del aula con el proveedor
// elegido por el usuario. Si no hay key propia, se devuelve vacío y el
// servidor usa su configuración por defecto (si existe).
export function authHeaders(): Record<string, string> {
  const c = loadCredentials();
  if (!c.apiKey) return {};
  const headers: Record<string, string> = {
    'x-ai-provider': c.providerId,
    'x-ai-api-key': c.apiKey
  };
  if (c.model) headers['x-ai-model'] = c.model;
  if (c.baseUrl) headers['x-ai-base-url'] = c.baseUrl;
  return headers;
}
