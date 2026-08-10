import React, { useState } from 'react';
import { GUARANI_WORDS, GUARANI_GRAMMAR_NOTES } from '../data/guaraniData';
import { Sparkles, MessageSquare, Volume2, Search, ArrowRightLeft, BookOpen, CheckCircle2 } from 'lucide-react';

export const GuaraniLabView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [translationInput, setTranslationInput] = useState<string>('');
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Todo el Vocabulario' },
    { id: 'saludo', label: 'Saludos y Despedidas' },
    { id: 'presentacion', label: 'Presentación Personal' },
    { id: 'numero', label: 'Números (Regla Po-Teĩ)' },
    { id: 'dia', label: 'Días de la Semana' },
    { id: 'mes', label: 'Meses del Año' },
    { id: 'trabajo', label: 'Trabajo / Documentación' },
    { id: 'frase_ventanilla', label: 'Frases de Ventanilla' }
  ];

  const filteredWords = GUARANI_WORDS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.guarani.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spanish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const practiceItems = GUARANI_WORDS.filter((w) => w.category === 'frase_ventanilla' || w.category === 'saludo');
  const currentPractice = practiceItems[practiceIndex] || practiceItems[0];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          PARTE XIII • PRUEBA ESCRITA DE GUARANÍ
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Laboratorio de Idioma Guaraní e Idioma Oficial
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          El Art. 140 de la Constitución establece al Guaraní como idioma oficial. Practica el vocabulario, las reglas de conteo, la gramática y las frases para atender al público en la ventanilla.
        </p>
      </div>

      {/* Grammar Highlights (Ñande vs Ore & Regla Po-Teĩ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUARANI_GRAMMAR_NOTES.map((note, idx) => (
          <div key={idx} className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-[#d4af37] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              {note.title}
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">{note.explanation}</p>
            <div className="text-[11px] font-mono text-[#e4e4e7] bg-[#0e0e11] p-2 rounded border border-[#27272a]">
              {note.example}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Translation Trainer */}
      <div className="bg-[#121216] border border-[#27272a] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs font-bold text-[#d4af37] uppercase tracking-widest border-b border-[#27272a] pb-2">
          <span className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4" /> Entrenador de Traducción Rápida
          </span>
          <span className="text-[#a1a1aa]">Frase {practiceIndex + 1} de {practiceItems.length}</span>
        </div>

        {currentPractice && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-1">
              <span className="text-xs text-[#a1a1aa]">Traduce al Guaraní la siguiente frase:</span>
              <div className="text-lg sm:text-xl font-serif font-bold text-white">
                "{currentPractice.spanish}"
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                placeholder="Escribe tu traducción en Guaraní..."
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#e4e4e7] placeholder-[#71717a] text-center focus:outline-none focus:border-[#d4af37]"
              />

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Ver Respuesta Correcta
                </button>
                <button
                  onClick={() => {
                    setPracticeIndex((prev) => (prev + 1) % practiceItems.length);
                    setShowAnswer(false);
                    setTranslationInput('');
                  }}
                  className="bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-semibold px-4 py-2 rounded-xl text-xs border border-[#3f3f46] transition-all cursor-pointer"
                >
                  Siguiente Frase →
                </button>
              </div>

              {showAnswer && (
                <div className="bg-[#0e0e11] border border-[#d4af37]/40 p-4 rounded-xl text-center space-y-1">
                  <div className="text-xs text-[#a1a1aa]">En Guaraní se dice:</div>
                  <div className="text-lg font-bold text-[#d4af37] font-serif">
                    "{currentPractice.guarani}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary Categories & Search Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121216] p-4 rounded-xl border border-[#27272a]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Buscar en Guaraní o Español..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item, idx) => (
            <div key={idx} className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-1.5 hover:border-[#d4af37]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-serif font-bold text-[#d4af37]">
                  {item.guarani}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#71717a] bg-[#0e0e11] px-2 py-0.5 rounded border border-[#27272a]">
                  {item.category}
                </span>
              </div>
              <div className="text-xs text-[#e4e4e7] font-medium">{item.spanish}</div>
              {item.note && (
                <div className="text-[11px] text-[#a1a1aa] italic pt-1 border-t border-[#27272a]">
                  {item.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
