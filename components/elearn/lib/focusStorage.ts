// Persistencia local de las preferencias de foco (Pomodoro + sonido),
// separada del progreso académico para no mezclar conceptos en localStorage.

export type SoundSource = 'none' | 'lofi' | 'noise';
export type NoiseType = 'brown' | 'pink' | 'white';

export interface LofiStation {
  id: string;
  label: string;
  youtubeId: string;
  custom?: boolean;
}

export interface FocusPrefs {
  preset: 'classic' | 'short' | 'ultraShort';
  streamId: string;
  volume: number;
  soundSource: SoundSource;
  noiseType: NoiseType;
  customStations: LofiStation[];
}

const KEY = 'dgrec_focus_prefs_v1';

export const PRESETS: Record<
  FocusPrefs['preset'],
  { label: string; work: number; short: number; long: number; cyclesToLong: number }
> = {
  classic: { label: 'Clásico (25 / 5)', work: 25, short: 5, long: 15, cyclesToLong: 4 },
  short: { label: 'Corto — recomendado TDAH (15 / 5)', work: 15, short: 5, long: 10, cyclesToLong: 3 },
  ultraShort: { label: 'Ultra corto (10 / 2)', work: 10, short: 2, long: 10, cyclesToLong: 4 }
};

// Estaciones de YouTube. Son enlaces a canales de terceros: pueden dejar de
// permitir el embebido en cualquier momento, por eso existe el generador de
// ruido local (que nunca depende de la red) y se pueden agregar propias.
export const LOFI_STREAMS: LofiStation[] = [
  { id: 'lofi-girl', label: 'Lofi Girl — beats to relax/study to', youtubeId: 'jfKfPfyJRdk' },
  { id: 'lofi-sleep', label: 'Lofi Girl — beats to sleep/chill to', youtubeId: 'rUxyKA_-grg' },
  { id: 'chillhop', label: 'Chillhop Radio — jazzy & lofi', youtubeId: '5yx6BWlEVcY' },
  { id: 'synthwave', label: 'Synthwave Radio — beats to chill/game to', youtubeId: '4xDzrJKXOOY' },
  { id: 'ambient', label: 'Dark Ambient Radio — music to escape/dream to', youtubeId: 'S_MOd40zlYU' }
];

export const NOISE_LABELS: Record<NoiseType, { label: string; hint: string }> = {
  brown: { label: 'Ruido marrón', hint: 'Grave y envolvente. El favorito para concentrarse con TDAH.' },
  pink: { label: 'Ruido rosa', hint: 'Equilibrado, tipo lluvia constante.' },
  white: { label: 'Ruido blanco', hint: 'Agudo. Tapa muy bien ruidos externos.' }
};

const defaultPrefs: FocusPrefs = {
  preset: 'short',
  streamId: 'lofi-girl',
  volume: 40,
  soundSource: 'none',
  noiseType: 'brown',
  customStations: []
};

export function loadFocusPrefs(): FocusPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function saveFocusPrefs(prefs: FocusPrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // localStorage no disponible: no es crítico, se pierde la preferencia.
  }
}

// Acepta una URL de YouTube completa, un enlace corto o el ID pelado.
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/
  ];
  for (const re of patterns) {
    const m = re.exec(s);
    if (m) return m[1];
  }
  return null;
}
