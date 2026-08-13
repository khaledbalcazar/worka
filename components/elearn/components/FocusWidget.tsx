import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Timer,
  Music2,
  Brain,
  Play,
  Pause,
  RotateCcw,
  X,
  Coffee,
  ChevronDown
} from 'lucide-react';
import { FocusPrefs, LOFI_STREAMS, PRESETS, loadFocusPrefs, saveFocusPrefs } from '../lib/focusStorage';

type Tab = 'pomodoro' | 'lofi' | 'tecnicas';
type Phase = 'work' | 'short' | 'long';

const PHASE_LABEL: Record<Phase, string> = {
  work: 'Enfoque',
  short: 'Descanso corto',
  long: 'Descanso largo'
};

// Widget flotante persistente: Pomodoro + reproductor lofi + técnicas de
// estudio para TDAH. Vive fuera del flujo de pestañas para estar siempre
// disponible, sin interrumpir el estudio de una lección.
export const FocusWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('pomodoro');
  const [prefs, setPrefs] = useState<FocusPrefs>(() =>
    typeof window !== 'undefined' ? loadFocusPrefs() : ({ preset: 'short', streamId: 'lofi-girl', volume: 40 } as FocusPrefs)
  );

  // ── Pomodoro ──
  const preset = PRESETS[prefs.preset];
  const [phase, setPhase] = useState<Phase>('work');
  const [cycle, setCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(preset.work * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    saveFocusPrefs(prefs);
  }, [prefs]);

  const advancePhase = useCallback(() => {
    if (phase === 'work') {
      const goLong = cycle % preset.cyclesToLong === 0;
      const next: Phase = goLong ? 'long' : 'short';
      setPhase(next);
      setSecondsLeft((next === 'long' ? preset.long : preset.short) * 60);
    } else {
      setPhase('work');
      setCycle((c) => c + 1);
      setSecondsLeft(preset.work * 60);
    }
  }, [phase, cycle, preset]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            advancePhase();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, advancePhase]);

  function resetTimer() {
    setRunning(false);
    setPhase('work');
    setCycle(1);
    setSecondsLeft(preset.work * 60);
  }

  function changePreset(next: FocusPrefs['preset']) {
    setPrefs((p) => ({ ...p, preset: next }));
    if (!running) {
      const dur = phase === 'work' ? PRESETS[next].work : phase === 'short' ? PRESETS[next].short : PRESETS[next].long;
      setSecondsLeft(dur * 60);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const totalForPhase = (phase === 'work' ? preset.work : phase === 'short' ? preset.short : preset.long) * 60;
  const progressPct = totalForPhase > 0 ? Math.round(((totalForPhase - secondsLeft) / totalForPhase) * 100) : 0;

  const activeStream = LOFI_STREAMS.find((s) => s.id === prefs.streamId) ?? LOFI_STREAMS[0];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-[#d4af37] hover:bg-[#b8962d] text-black rounded-full w-14 h-14 shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Abrir herramientas de foco"
      >
        {running ? (
          <span className="text-xs font-bold font-mono">{mm}:{ss}</span>
        ) : (
          <Brain className="w-6 h-6" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[320px] sm:w-[360px] bg-[#121216] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0e0e11] border-b border-[#27272a]">
        <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm">
          <Brain className="w-4 h-4" />
          Foco &amp; Estudio
        </div>
        <button onClick={() => setOpen(false)} className="text-[#71717a] hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a]">
        {([
          ['pomodoro', 'Pomodoro', Timer],
          ['lofi', 'Lofi', Music2],
          ['tecnicas', 'Técnicas', Brain]
        ] as [Tab, string, React.ComponentType<{ className?: string }>][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              tab === id ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-[#0e0e11]' : 'text-[#71717a] hover:text-[#d4d4d8]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'pomodoro' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-[#a1a1aa] flex items-center justify-center gap-1.5">
                {phase === 'work' ? <Timer className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                {PHASE_LABEL[phase]} · Ciclo {cycle}
              </p>
              <p className="text-5xl font-mono font-bold text-white mt-2">{mm}:{ss}</p>
              <div className="h-1.5 bg-[#27272a] rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${phase === 'work' ? 'bg-[#d4af37]' : 'bg-emerald-500'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-5 py-2.5 rounded-xl text-sm"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={resetTimer}
                className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] border border-[#3f3f46] px-3.5 py-2.5 rounded-xl text-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-[#a1a1aa] font-medium block mb-1.5">Ritmo de sesión</label>
              <div className="relative">
                <select
                  value={prefs.preset}
                  onChange={(e) => changePreset(e.target.value as FocusPrefs['preset'])}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] appearance-none pr-8"
                >
                  {Object.entries(PRESETS).map(([id, p]) => (
                    <option key={id} value={id}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#71717a] mt-1.5 leading-snug">
                Con TDAH, sesiones cortas (15/5 o 10/2) suelen sostener mejor la atención que el Pomodoro clásico de 25 minutos.
              </p>
            </div>
          </div>
        )}

        {tab === 'lofi' && (
          <div className="space-y-3">
            <div className="relative w-full rounded-xl overflow-hidden border border-[#27272a]" style={{ paddingTop: '56.25%' }}>
              <iframe
                key={activeStream.youtubeId}
                src={`https://www.youtube.com/embed/${activeStream.youtubeId}?autoplay=0&rel=0`}
                title={activeStream.label}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div>
              <label className="text-xs text-[#a1a1aa] font-medium block mb-1.5">Estación</label>
              <div className="relative">
                <select
                  value={prefs.streamId}
                  onChange={(e) => setPrefs((p) => ({ ...p, streamId: e.target.value }))}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] appearance-none pr-8"
                >
                  {LOFI_STREAMS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <p className="text-[11px] text-[#71717a] leading-snug">
              ¿Preferís tu propia playlist? Abrila en{' '}
              <a href="https://music.apple.com/search?term=lofi%20study" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline">Apple Music</a>{' '}
              o{' '}
              <a href="https://open.spotify.com/search/lofi%20study" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline">Spotify</a>{' '}
              en otra pestaña mientras estudiás acá.
            </p>
          </div>
        )}

        {tab === 'tecnicas' && <TdahTechniques />}
      </div>
    </div>
  );
};

const TECHNIQUES = [
  {
    title: 'Pomodoro (adaptado)',
    text: 'Bloques cortos de enfoque con descansos frecuentes. Con TDAH, empezá con el ritmo "Corto" (15/5) o "Ultra corto" (10/2) — es más fácil sostener 15 minutos de atención que 25.'
  },
  {
    title: 'Recuerdo activo (Active Recall)',
    text: 'No releas: cerrá el manual y escribí de memoria lo que recordás de una lección. Después corregí en rojo. Es la técnica más efectiva y ya la tenés integrada en los Ejercicios de cada lección y en las Flashcards.'
  },
  {
    title: 'Body doubling',
    text: 'Estudiar "acompañado" (aunque sea en silencio, con alguien más presente o en videollamada) ayuda a sostener el foco en TDAH. Si podés, estudiá con otro postulante al mismo tiempo, cada uno con su propio material.'
  },
  {
    title: 'Fragmentar en micro-tareas',
    text: 'En vez de "estudiar la Ley 1266", proponete "leer 1 lección + hacer sus 2 ejercicios". Las tareas grandes sin límite claro son las que más cuesta arrancar con TDAH.'
  },
  {
    title: 'Movimiento en los descansos',
    text: 'En cada pausa del Pomodoro, levantate y moveté (estirar, caminar, tomar agua) en vez de mirar el celular. El celular en la pausa suele "robarse" mucho más tiempo del planeado.'
  },
  {
    title: 'Cuerpo del texto + color',
    text: 'Los recuadros destacados (💡) del Manual Completo y los "Trucos de Memorización" de cada lección están pensados para que el ojo encuentre rápido lo importante sin releer todo el párrafo.'
  }
];

const TdahTechniques: React.FC = () => (
  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
    <p className="text-xs text-[#a1a1aa] leading-relaxed">
      Métodos pensados para sostener la atención y avanzar sin frustrarte. No hace falta usarlos todos: probá uno por vez.
    </p>
    {TECHNIQUES.map((t) => (
      <div key={t.title} className="bg-[#0e0e11] border border-[#27272a] rounded-lg p-3">
        <p className="text-xs font-bold text-[#d4af37] mb-1">{t.title}</p>
        <p className="text-xs text-[#d4d4d8] leading-relaxed">{t.text}</p>
      </div>
    ))}
  </div>
);
