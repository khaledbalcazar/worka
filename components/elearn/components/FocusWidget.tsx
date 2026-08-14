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
  ChevronDown,
  Volume2,
  Waves,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  FocusPrefs,
  LofiStation,
  LOFI_STREAMS,
  NOISE_LABELS,
  NoiseType,
  PRESETS,
  SoundSource,
  loadFocusPrefs,
  parseYoutubeId,
  saveFocusPrefs
} from '../lib/focusStorage';
import { NoisePlayer } from '../lib/noiseGenerator';

type Tab = 'pomodoro' | 'lofi' | 'tecnicas';
type Phase = 'work' | 'short' | 'long';

const PHASE_LABEL: Record<Phase, string> = {
  work: 'Enfoque',
  short: 'Descanso corto',
  long: 'Descanso largo'
};

// Mantiene el nodo montado pero fuera de la pantalla: así el audio sigue
// sonando en segundo plano al cambiar de pestaña o cerrar el panel.
const OFFSCREEN = 'fixed top-0 -left-[9999px] w-[340px] pointer-events-none';

const DEFAULT_PREFS: FocusPrefs = {
  preset: 'short',
  streamId: 'lofi-girl',
  volume: 40,
  soundSource: 'none',
  noiseType: 'brown',
  customStations: []
};

export const FocusWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('pomodoro');
  const [prefs, setPrefs] = useState<FocusPrefs>(() =>
    typeof window !== 'undefined' ? loadFocusPrefs() : DEFAULT_PREFS
  );

  // ── Pomodoro ──
  const preset = PRESETS[prefs.preset];
  const [phase, setPhase] = useState<Phase>('work');
  const [cycle, setCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(preset.work * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ruido ambiental (Web Audio, sin red) ──
  const noiseRef = useRef<NoisePlayer | null>(null);

  useEffect(() => {
    saveFocusPrefs(prefs);
  }, [prefs]);

  // Sincroniza el generador de ruido con las preferencias. Se crea al vuelo
  // la primera vez que hace falta (siempre desde un gesto del usuario).
  useEffect(() => {
    if (prefs.soundSource !== 'noise') {
      noiseRef.current?.stop();
      return;
    }
    if (!noiseRef.current) noiseRef.current = new NoisePlayer();
    noiseRef.current.play(prefs.noiseType, prefs.volume);
  }, [prefs.soundSource, prefs.noiseType, prefs.volume]);

  // Libera el AudioContext al desmontar.
  useEffect(
    () => () => {
      noiseRef.current?.dispose();
      noiseRef.current = null;
    },
    []
  );

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
      const p = PRESETS[next];
      setSecondsLeft((phase === 'work' ? p.work : phase === 'short' ? p.short : p.long) * 60);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const totalForPhase = (phase === 'work' ? preset.work : phase === 'short' ? preset.short : preset.long) * 60;
  const progressPct = totalForPhase > 0 ? Math.round(((totalForPhase - secondsLeft) / totalForPhase) * 100) : 0;

  const allStations: LofiStation[] = [...LOFI_STREAMS, ...prefs.customStations];
  const activeStation = allStations.find((s) => s.id === prefs.streamId) ?? allStations[0];
  const soundOn = prefs.soundSource !== 'none';

  return (
    <>
      {/* Panel: SIEMPRE montado. Cuando está cerrado se va fuera de pantalla,
          así el reproductor sigue sonando en segundo plano. */}
      <div
        className={
          open
            ? 'fixed bottom-5 right-5 z-40 w-[320px] sm:w-[360px] bg-[#121216] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden'
            : `${OFFSCREEN} bg-[#121216] rounded-2xl overflow-hidden`
        }
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0e0e11] border-b border-[#27272a]">
          <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm">
            <Brain className="w-4 h-4" />
            Foco &amp; Estudio
          </div>
          <button onClick={() => setOpen(false)} className="text-[#71717a] hover:text-white" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#27272a]">
          {([
            ['pomodoro', 'Pomodoro', Timer],
            ['lofi', 'Sonido', Music2],
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
              {id === 'lofi' && soundOn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Paneles sin audio: se pueden montar y desmontar libremente. */}
          {tab === 'pomodoro' && (
            <PomodoroPane
              phase={phase}
              cycle={cycle}
              mm={mm}
              ss={ss}
              progressPct={progressPct}
              running={running}
              presetId={prefs.preset}
              onToggle={() => setRunning((r) => !r)}
              onReset={resetTimer}
              onChangePreset={changePreset}
            />
          )}
          {tab === 'tecnicas' && <TdahTechniques />}

          {/* Panel de sonido: SIEMPRE montado (contiene el reproductor). */}
          <div className={tab === 'lofi' ? '' : OFFSCREEN} aria-hidden={tab !== 'lofi'}>
            <SoundPane
              prefs={prefs}
              setPrefs={setPrefs}
              allStations={allStations}
              activeStation={activeStation}
            />
          </div>
        </div>
      </div>

      {/* Botón flotante cuando el panel está cerrado */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-[#d4af37] hover:bg-[#b8962d] text-black rounded-full w-14 h-14 shadow-xl flex items-center justify-center transition-transform hover:scale-105"
          aria-label="Abrir herramientas de foco"
        >
          {running ? (
            <span className="text-xs font-bold font-mono">
              {mm}:{ss}
            </span>
          ) : (
            <Brain className="w-6 h-6" />
          )}
          {soundOn && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0c0c0e]" />
          )}
        </button>
      )}
    </>
  );
};

// ── Pomodoro ──
const PomodoroPane: React.FC<{
  phase: Phase;
  cycle: number;
  mm: string;
  ss: string;
  progressPct: number;
  running: boolean;
  presetId: FocusPrefs['preset'];
  onToggle: () => void;
  onReset: () => void;
  onChangePreset: (p: FocusPrefs['preset']) => void;
}> = ({ phase, cycle, mm, ss, progressPct, running, presetId, onToggle, onReset, onChangePreset }) => (
  <div className="space-y-4">
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-[#a1a1aa] flex items-center justify-center gap-1.5">
        {phase === 'work' ? <Timer className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
        {PHASE_LABEL[phase]} · Ciclo {cycle}
      </p>
      <p className="text-5xl font-mono font-bold text-white mt-2">
        {mm}:{ss}
      </p>
      <div className="h-1.5 bg-[#27272a] rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all ${phase === 'work' ? 'bg-[#d4af37]' : 'bg-emerald-500'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>

    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-5 py-2.5 rounded-xl text-sm"
      >
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {running ? 'Pausar' : 'Iniciar'}
      </button>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] border border-[#3f3f46] px-3.5 py-2.5 rounded-xl text-sm"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>

    <div>
      <label className="text-xs text-[#a1a1aa] font-medium block mb-1.5">Ritmo de sesión</label>
      <div className="relative">
        <select
          value={presetId}
          onChange={(e) => onChangePreset(e.target.value as FocusPrefs['preset'])}
          className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] appearance-none pr-8"
        >
          {Object.entries(PRESETS).map(([id, p]) => (
            <option key={id} value={id}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <p className="text-[11px] text-[#71717a] mt-1.5 leading-snug">
        Con TDAH, sesiones cortas (15/5 o 10/2) suelen sostener mejor la atención que el Pomodoro clásico de 25 minutos.
      </p>
    </div>
  </div>
);

// ── Sonido: ruido local o estación de YouTube ──
const SoundPane: React.FC<{
  prefs: FocusPrefs;
  setPrefs: React.Dispatch<React.SetStateAction<FocusPrefs>>;
  allStations: LofiStation[];
  activeStation: LofiStation | undefined;
}> = ({ prefs, setPrefs, allStations, activeStation }) => {
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  function setSource(source: SoundSource) {
    setPrefs((p) => ({ ...p, soundSource: source }));
  }

  function addStation() {
    const ytId = parseYoutubeId(newUrl);
    if (!ytId) {
      setAddError('No pude leer el ID. Pegá el enlace del video o su ID de 11 caracteres.');
      return;
    }
    const station: LofiStation = {
      id: `custom-${ytId}`,
      label: newLabel.trim() || 'Mi estación',
      youtubeId: ytId,
      custom: true
    };
    setPrefs((p) => ({
      ...p,
      customStations: [...p.customStations.filter((s) => s.id !== station.id), station],
      streamId: station.id,
      soundSource: 'lofi'
    }));
    setNewUrl('');
    setNewLabel('');
    setAddError(null);
    setAdding(false);
  }

  function removeStation(id: string) {
    setPrefs((p) => ({
      ...p,
      customStations: p.customStations.filter((s) => s.id !== id),
      streamId: p.streamId === id ? LOFI_STREAMS[0].id : p.streamId
    }));
  }

  return (
    <div className="space-y-3">
      {/* Selector de fuente */}
      <div className="grid grid-cols-3 gap-1.5">
        {([
          ['none', 'Silencio', X],
          ['noise', 'Ruido', Waves],
          ['lofi', 'Lofi', Music2]
        ] as [SoundSource, string, React.ComponentType<{ className?: string }>][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setSource(id)}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-semibold transition-colors ${
              prefs.soundSource === id
                ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                : 'border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Volumen (aplica al generador de ruido) */}
      {prefs.soundSource === 'noise' && (
        <>
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#a1a1aa] font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Volumen · {prefs.volume}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={prefs.volume}
              onChange={(e) => setPrefs((p) => ({ ...p, volume: Number(e.target.value) }))}
              className="w-full accent-[#d4af37]"
            />
          </div>
          <div className="space-y-1.5">
            {(Object.keys(NOISE_LABELS) as NoiseType[]).map((t) => (
              <button
                key={t}
                onClick={() => setPrefs((p) => ({ ...p, noiseType: t }))}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                  prefs.noiseType === t
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#e4e4e7]'
                    : 'border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                }`}
              >
                <span className="font-semibold block">{NOISE_LABELS[t].label}</span>
                <span className="text-[10px] text-[#71717a]">{NOISE_LABELS[t].hint}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#71717a] leading-snug">
            Se genera en tu navegador: no usa internet y no se puede caer.
          </p>
        </>
      )}

      {/* Estación de YouTube */}
      {prefs.soundSource === 'lofi' && activeStation && (
        <>
          <div className="relative w-full rounded-xl overflow-hidden border border-[#27272a]" style={{ paddingTop: '56.25%' }}>
            <iframe
              key={activeStation.youtubeId}
              src={`https://www.youtube.com/embed/${activeStation.youtubeId}?rel=0&playsinline=1`}
              title={activeStation.label}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="relative">
            <select
              value={prefs.streamId}
              onChange={(e) => setPrefs((p) => ({ ...p, streamId: e.target.value }))}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] appearance-none pr-8"
            >
              {allStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.custom ? '★ ' : ''}
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${activeStation.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#d4af37] hover:underline inline-flex items-center gap-1"
            >
              Abrir en YouTube <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <div className="flex items-center gap-2">
              {activeStation.custom && (
                <button
                  onClick={() => removeStation(activeStation.id)}
                  className="text-[#71717a] hover:text-red-400"
                  title="Quitar esta estación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setAdding((v) => !v)}
                className="text-[11px] text-[#a1a1aa] hover:text-[#d4af37] inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar estación
              </button>
            </div>
          </div>

          {adding && (
            <div className="space-y-2 bg-[#0e0e11] border border-[#27272a] rounded-lg p-3">
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Pegá el enlace de YouTube o el ID"
                className="w-full bg-[#121216] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
              />
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Nombre (opcional)"
                className="w-full bg-[#121216] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
              />
              {addError && <p className="text-[11px] text-red-400">{addError}</p>}
              <button
                onClick={addStation}
                className="w-full bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold py-2 rounded-lg text-xs"
              >
                Agregar
              </button>
            </div>
          )}

          <p className="text-[11px] text-[#71717a] leading-snug flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            Si una estación muestra un error, es que ese canal bloqueó el embebido: elegí otra, agregá la tuya, o usá el
            generador de <strong className="text-[#a1a1aa]">Ruido</strong>, que nunca falla.
          </p>
        </>
      )}

      {prefs.soundSource === 'none' && (
        <p className="text-[11px] text-[#71717a] leading-snug">
          Elegí <strong className="text-[#a1a1aa]">Ruido</strong> para un sonido generado en tu navegador (no usa
          internet) o <strong className="text-[#a1a1aa]">Lofi</strong> para una estación de YouTube. El sonido sigue
          reproduciéndose aunque cambies de pestaña o cierres este panel.
        </p>
      )}
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
    text: 'No releas: cerrá el manual y escribí de memoria lo que recordás de una lección. Después corregí en rojo. Ya lo tenés integrado en los Ejercicios de cada unidad y en las Flashcards.'
  },
  {
    title: 'Repetición espaciada (Leitner)',
    text: 'Las flashcards que fallás vuelven pronto; las que acertás vuelven cada vez más tarde. Es la forma más eficiente de fijar plazos y números. Está activo en la sección Tarjetas.'
  },
  {
    title: 'Body doubling',
    text: 'Estudiar "acompañado" (aunque sea en silencio, con alguien más presente o en videollamada) ayuda a sostener el foco en TDAH.'
  },
  {
    title: 'Fragmentar en micro-tareas',
    text: 'En vez de "estudiar la Ley 1266", proponete "leer 1 unidad + hacer sus 2 ejercicios". Las tareas grandes sin límite claro son las que más cuesta arrancar con TDAH.'
  },
  {
    title: 'Movimiento en los descansos',
    text: 'En cada pausa del Pomodoro, levantate y moveté (estirar, caminar, tomar agua) en vez de mirar el celular. El celular en la pausa suele "robarse" mucho más tiempo del planeado.'
  },
  {
    title: 'Ruido de fondo constante',
    text: 'El ruido marrón tapa los sonidos cambiantes del ambiente (que son los que más distraen) sin darte información nueva que procesar. Probalo al 30-50% de volumen.'
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
