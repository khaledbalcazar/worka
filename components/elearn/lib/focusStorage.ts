// Persistencia local de las preferencias de foco (Pomodoro + lofi), separada
// del progreso académico para no mezclar conceptos en localStorage.
export interface FocusPrefs {
  preset: 'classic' | 'short' | 'ultraShort';
  streamId: string;
  volume: number;
}

const KEY = 'dgrec_focus_prefs_v1';

export const PRESETS: Record<FocusPrefs['preset'], { label: string; work: number; short: number; long: number; cyclesToLong: number }> = {
  classic: { label: 'Clásico (25 / 5)', work: 25, short: 5, long: 15, cyclesToLong: 4 },
  short: { label: 'Corto — recomendado TDAH (15 / 5)', work: 15, short: 5, long: 10, cyclesToLong: 3 },
  ultraShort: { label: 'Ultra corto (10 / 2)', work: 10, short: 2, long: 10, cyclesToLong: 4 }
};

export const LOFI_STREAMS: { id: string; label: string; youtubeId: string }[] = [
  { id: 'lofi-girl', label: 'lofi hip hop radio — beats to study to', youtubeId: 'jfKfPfyJRdk' },
  { id: 'lofi-sleep', label: 'lofi hip hop radio — beats to sleep/relax to', youtubeId: 'rUxyKA_-grg' },
  { id: 'chillhop', label: 'Chillhop Radio — jazzy & lofi hip hop beats', youtubeId: '5yx6BWlEVcY' }
];

const defaultPrefs: FocusPrefs = {
  preset: 'short',
  streamId: 'lofi-girl',
  volume: 40
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
