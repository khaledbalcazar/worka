import React, { useMemo, useState } from 'react';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { Flashcard, UserProgress } from '../types';
import {
  Award,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Shuffle,
  XCircle,
  CalendarClock,
  Layers,
  PartyPopper
} from 'lucide-react';
import { BOX_INTERVALS, MAX_BOX, boxCounts, dueCards, getState } from '../lib/srs';

interface FlashcardsViewProps {
  progress: UserProgress;
  onMarkFlashcardMastered: (cardId: string) => void;
  onReviewFlashcard: (cardId: string, remembered: boolean) => void;
}

type Mode = 'repaso' | 'explorar';

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  progress,
  onReviewFlashcard
}) => {
  const [mode, setMode] = useState<Mode>('repaso');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFlipped, setIsFlipped] = useState(false);

  // ── Modo repaso: cola congelada al iniciar la sesión ──
  // Se calcula una vez para que la tarjeta recién repasada no salte de lugar
  // al recalcularse los vencimientos.
  const [queue, setQueue] = useState<Flashcard[]>(() => dueCards(FLASHCARDS_DATA, progress.flashcardSrs));
  const [queueIndex, setQueueIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ ok: 0, fail: 0 });

  // ── Modo explorar ──
  const [browseIndex, setBrowseIndex] = useState(0);

  const categories = ['all', ...Array.from(new Set(FLASHCARDS_DATA.map((c) => c.category)))];
  const browseCards = useMemo(
    () => FLASHCARDS_DATA.filter((c) => selectedCategory === 'all' || c.category === selectedCategory),
    [selectedCategory]
  );

  const counts = boxCounts(FLASHCARDS_DATA, progress.flashcardSrs);
  const dueNow = dueCards(FLASHCARDS_DATA, progress.flashcardSrs).length;

  const currentCard = mode === 'repaso' ? queue[queueIndex] : browseCards[browseIndex];
  const cardState = currentCard ? getState(progress.flashcardSrs, currentCard.id) : null;

  function answer(remembered: boolean) {
    if (!currentCard) return;
    onReviewFlashcard(currentCard.id, remembered);
    setSessionStats((s) => ({
      ok: s.ok + (remembered ? 1 : 0),
      fail: s.fail + (remembered ? 0 : 1)
    }));
    setIsFlipped(false);
    setQueueIndex((i) => i + 1);
  }

  function restartSession() {
    setQueue(dueCards(FLASHCARDS_DATA, progress.flashcardSrs));
    setQueueIndex(0);
    setSessionStats({ ok: 0, fail: 0 });
    setIsFlipped(false);
  }

  const sessionDone = mode === 'repaso' && queueIndex >= queue.length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          SISTEMA LEITNER • REPETICIÓN ESPACIADA
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">Tarjetas de Memoria</h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          Leé el frente, intentá recordar la respuesta antes de girar, y decí con honestidad si la sabías. Las que
          fallás vuelven hoy; las que acertás tardan cada vez más en reaparecer.
        </p>
      </div>

      {/* Cajas de Leitner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#d4af37]" /> Cajas de Leitner
          </span>
          <span className="text-xs text-[#a1a1aa]">
            <strong className="text-[#d4af37]">{dueNow}</strong> para repasar hoy ·{' '}
            <strong className="text-emerald-400">{counts[MAX_BOX]}</strong> dominadas
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((box) => (
            <div key={box} className="text-center">
              <div className="h-1.5 rounded-full overflow-hidden bg-[#27272a]">
                <div
                  className={`h-full ${box === MAX_BOX ? 'bg-emerald-500' : 'bg-[#d4af37]'}`}
                  style={{
                    width: `${FLASHCARDS_DATA.length ? (counts[box] / FLASHCARDS_DATA.length) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-[#71717a] mt-1">
                Caja {box}
                <span className="block text-[#a1a1aa] font-semibold">{counts[box]}</span>
                <span className="block text-[9px]">
                  {BOX_INTERVALS[box] === 0 ? 'hoy' : `${BOX_INTERVALS[box]}d`}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        {(
          [
            ['repaso', `Repaso de hoy${dueNow ? ` (${dueNow})` : ''}`, CalendarClock],
            ['explorar', 'Explorar mazo', Layers]
          ] as [Mode, string, React.ComponentType<{ className?: string }>][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setMode(id);
              setIsFlipped(false);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              mode === id
                ? 'bg-[#d4af37] text-black border-[#d4af37]'
                : 'bg-[#18181b] text-[#a1a1aa] border-[#3f3f46] hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Filtro de categoría, solo al explorar */}
      {mode === 'explorar' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-[#27272a]">
          <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
            <span className="text-[#a1a1aa] font-semibold px-2">Categoría:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setBrowseIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setBrowseIndex(Math.floor(Math.random() * browseCards.length));
              setIsFlipped(false);
            }}
            className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#3f3f46] transition-all cursor-pointer shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Mezclar</span>
          </button>
        </div>
      )}

      {/* Sesión terminada */}
      {sessionDone ? (
        <div className="bg-[#121216] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
          <PartyPopper className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold text-white">
            {queue.length === 0 ? 'No hay tarjetas para hoy' : '¡Repaso de hoy terminado!'}
          </h3>
          {queue.length > 0 && (
            <p className="text-sm text-[#a1a1aa]">
              Acertaste <strong className="text-emerald-400">{sessionStats.ok}</strong> y fallaste{' '}
              <strong className="text-red-400">{sessionStats.fail}</strong> de {queue.length}.
            </p>
          )}
          <p className="text-xs text-[#71717a]">
            {dueNow > 0
              ? `Quedan ${dueNow} tarjetas vencidas: podés seguir repasando.`
              : 'Volvé mañana: las tarjetas van reapareciendo según su caja.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={restartSession}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-5 py-2.5 rounded-xl text-xs"
            >
              {dueNow > 0 ? 'Seguir repasando' : 'Recargar cola'}
            </button>
            <button
              onClick={() => {
                setMode('explorar');
                setIsFlipped(false);
              }}
              className="bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#3f3f46] px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              Explorar mazo
            </button>
          </div>
        </div>
      ) : (
        currentCard && (
          <>
            {/* Contador */}
            <div className="flex items-center justify-between text-xs text-[#a1a1aa] px-1">
              {mode === 'repaso' ? (
                <span>
                  Tarjeta <strong className="text-white">{queueIndex + 1}</strong> de{' '}
                  <strong className="text-white">{queue.length}</strong> del repaso de hoy
                </span>
              ) : (
                <span>
                  Tarjeta <strong className="text-white">{browseIndex + 1}</strong> de{' '}
                  <strong className="text-white">{browseCards.length}</strong>
                </span>
              )}
              {cardState && (
                <span className="text-[#71717a]">
                  Caja <strong className="text-[#d4af37]">{cardState.box}</strong> de {MAX_BOX}
                </span>
              )}
            </div>

            {/* Tarjeta */}
            <div
              onClick={() => setIsFlipped((f) => !f)}
              className={`min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between text-center ${
                isFlipped ? 'bg-[#121216] border-[#d4af37]/60' : 'bg-[#121216] border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              <div className="flex items-center justify-between text-xs w-full">
                <span className="bg-[#0e0e11] text-[#d4af37] font-bold px-2.5 py-1 rounded border border-[#27272a]">
                  {currentCard.category}
                </span>
                <div className="flex items-center gap-2">
                  {currentCard.articleRef && (
                    <span className="font-mono text-emerald-400 text-[11px] bg-[#0e0e11] px-2 py-0.5 rounded border border-[#27272a]">
                      {currentCard.articleRef}
                    </span>
                  )}
                  {cardState?.box === MAX_BOX && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Dominada
                    </span>
                  )}
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="text-xs uppercase tracking-widest font-semibold text-[#71717a] flex items-center justify-center gap-1.5">
                  {isFlipped ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Respuesta</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-[#d4af37]" />
                      <span>Pregunta — tocá para girar</span>
                    </>
                  )}
                </div>
                <p
                  className={`font-serif leading-relaxed ${
                    isFlipped
                      ? 'text-lg sm:text-2xl text-[#d4af37] font-semibold'
                      : 'text-base sm:text-xl text-white font-medium'
                  }`}
                >
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              <div className="text-xs text-[#71717a] flex items-center justify-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tocá la tarjeta para darla vuelta</span>
              </div>
            </div>

            {/* Controles */}
            {mode === 'repaso' ? (
              isFlipped ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => answer(false)}
                    className="inline-flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 font-bold px-5 py-3 rounded-xl text-sm transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    No la sabía
                  </button>
                  <button
                    onClick={() => answer(true)}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    La sabía
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#3f3f46] font-semibold py-3 rounded-xl text-sm"
                >
                  Mostrar respuesta
                </button>
              )
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setBrowseIndex((i) => (i - 1 + browseCards.length) % browseCards.length);
                  }}
                  className="flex-1 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-semibold px-4 py-2.5 rounded-xl border border-[#3f3f46] text-xs"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setBrowseIndex((i) => (i + 1) % browseCards.length);
                  }}
                  className="flex-1 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-semibold px-4 py-2.5 rounded-xl border border-[#3f3f46] text-xs"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};
