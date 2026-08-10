import React, { useState } from 'react';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { UserProgress } from '../types';
import { Award, RotateCw, CheckCircle2, AlertCircle, HelpCircle, Shuffle } from 'lucide-react';

interface FlashcardsViewProps {
  progress: UserProgress;
  onMarkFlashcardMastered: (cardId: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  progress,
  onMarkFlashcardMastered
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const categories = ['all', ...Array.from(new Set(FLASHCARDS_DATA.map((c) => c.category)))];

  const filteredCards = FLASHCARDS_DATA.filter(
    (card) => selectedCategory === 'all' || card.category === selectedCategory
  );

  const currentCard = filteredCards[currentIndex] || filteredCards[0];
  const isMastered = currentCard ? progress.masteredFlashcards.includes(currentCard.id) : false;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * filteredCards.length));
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          SISTEMA LEITNER • RECUERDO ACTIVO
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Tarjetas de Memoria de Repetición Espaciada
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          Lee el frente, intenta recordar la respuesta en tu cabeza antes de voltear, y luego verifica. ¡Es la forma más rápida de fijar plazos y artículos!
        </p>
      </div>

      {/* Category filter & Shuffle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121216] p-3 rounded-xl border border-[#27272a]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
          <span className="text-[#a1a1aa] font-semibold px-2">Categoría:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize cursor-pointer ${
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
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#3f3f46] transition-all cursor-pointer shrink-0"
        >
          <Shuffle className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Mezclar Mazo</span>
        </button>
      </div>

      {/* Card Count Progress */}
      <div className="flex items-center justify-between text-xs text-[#a1a1aa] px-1">
        <span>
          Tarjeta <strong className="text-white">{currentIndex + 1}</strong> de <strong className="text-white">{filteredCards.length}</strong>
        </span>
        <span className="text-emerald-400 font-semibold">
          Dominadas: {progress.masteredFlashcards.length} / {FLASHCARDS_DATA.length}
        </span>
      </div>

      {/* The Interactive Flip Card */}
      {currentCard && (
        <div className="perspective-1000">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-2xl border transition-all duration-500 cursor-pointer shadow-xl flex flex-col justify-between text-center relative ${
              isFlipped
                ? 'bg-[#121216] border-[#d4af37]/60 shadow-[#d4af37]/5'
                : 'bg-[#121216] border-[#27272a] hover:border-[#3f3f46]'
            }`}
          >
            {/* Card Top Indicator */}
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
                {isMastered && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Dominada
                  </span>
                )}
              </div>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="py-6 space-y-4">
              <div className="text-xs uppercase tracking-widest font-semibold text-[#71717a] flex items-center justify-center gap-1.5">
                {isFlipped ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dorso (Respuesta Exacta)</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Frente (Pregunta - Haz clic para girar)</span>
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

            {/* Click to Flip Footer */}
            <div className="text-xs text-[#71717a] flex items-center justify-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Haz clic en la tarjeta para darla vuelta</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrev}
            className="flex-1 sm:flex-initial bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-semibold px-4 py-2.5 rounded-xl border border-[#3f3f46] text-xs transition-all cursor-pointer"
          >
            ← Anterior
          </button>
          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-semibold px-4 py-2.5 rounded-xl border border-[#3f3f46] text-xs transition-all cursor-pointer"
          >
            Siguiente →
          </button>
        </div>

        {currentCard && (
          <button
            onClick={() => {
              onMarkFlashcardMastered(currentCard.id);
              handleNext();
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isMastered
                ? 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMastered ? 'Ya está Dominada' : '¡Me la sé! Marcar Dominada'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
