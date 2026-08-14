import React, { useState } from 'react';
import { QUIZ_BANK } from '../data/quizBank';
import { QuizQuestion, UserProgress } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, RotateCw, Trophy, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { ErrorReview } from './ErrorReview';

interface QuizSimulatorViewProps {
  progress: UserProgress;
  onSaveQuizScore: (blockId: string, score: number) => void;
  onAddErrorToLog: (questionId: string, userNote: string) => void;
  onResolveError: (questionId: string) => void;
}

export const QuizSimulatorView: React.FC<QuizSimulatorViewProps> = ({
  progress,
  onSaveQuizScore,
  onAddErrorToLog,
  onResolveError
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('A');
  const [activeMode, setActiveTabMode] = useState<'block' | 'errorLog'>('block');
  const [currentQuestionIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const blockQuestions = QUIZ_BANK.filter((q) => q.block === selectedBlock);
  const currentQuestion = blockQuestions[currentQuestionIndex] || blockQuestions[0];

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedOption }));

    // If incorrect, automatically track or offer to log into Cuaderno de Errores
    if (selectedOption !== currentQuestion.correctAnswerIndex) {
      onAddErrorToLog(currentQuestion.id, `Opción elegida: ${currentQuestion.options[selectedOption]}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < blockQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished!
      setQuizFinished(true);
      let correctCount = 0;
      blockQuestions.forEach((q) => {
        if (userAnswers[q.id] === q.correctAnswerIndex || (q.id === currentQuestion.id && selectedOption === q.correctAnswerIndex)) {
          correctCount++;
        }
      });
      onSaveQuizScore(selectedBlock, correctCount);

      if (correctCount / blockQuestions.length >= 0.7) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
  };

  const blocks = [
    { id: 'A', name: 'Bloque A - Constitución Nacional' },
    { id: 'B', name: 'Bloque B - Ley 7445 (Función Pública)' },
    { id: 'C', name: 'Bloque C - Ley 5282 (Acceso a Info)' },
    { id: 'D', name: 'Bloque D - Ley 1266 (Registro Civil)' },
    { id: 'E', name: 'Bloque E - Defunciones y Remedios' },
    { id: 'F', name: 'Bloque F - Decretos Orgánicos' },
    { id: 'G', name: 'Bloque G - Código Civil' },
    { id: 'H', name: 'Bloque H - Ley 1/1992 (Reforma)' },
    { id: 'I', name: 'Bloque I - Ley 6618 / Res. 983' },
    { id: 'J', name: 'Bloque J - Preguntas Cruzadas y Trampas' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          PARTE XV • BANCO DE PREGUNTAS DE AUTOEVALUACIÓN
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Simulacro y Evaluación por Bloques
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          Responde cada pregunta antes de mirar la explicación. Cada error se guarda en tu <strong className="text-[#e4e4e7]">Cuaderno de Errores</strong> para que puedas repasar únicamente tus puntos débiles.
        </p>
      </div>

      {/* Mode Selector (Bloque vs Cuaderno de Errores) */}
      <div className="flex border-b border-[#27272a] gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTabMode('block')}
          className={`pb-3 px-2 transition-all cursor-pointer ${
            activeMode === 'block'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Prueba por Bloques Temáticos
        </button>
        <button
          onClick={() => setActiveTabMode('errorLog')}
          className={`pb-3 px-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeMode === 'errorLog'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Repaso de Errores ({progress.errorLog.length})</span>
        </button>
      </div>

      {activeMode === 'block' ? (
        <div className="space-y-6">
          {/* Block Selector Selector Dropdown */}
          <div className="bg-[#121216] p-4 rounded-xl border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold text-[#e4e4e7]">Selecciona el Bloque a Rendir:</div>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                handleRestartQuiz();
              }}
              className="bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-[#d4af37] focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {!quizFinished ? (
            currentQuestion && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Progress Header */}
                <div className="flex items-center justify-between text-xs text-[#a1a1aa] border-b border-[#27272a] pb-3">
                  <span className="font-bold text-[#d4af37] uppercase tracking-widest">
                    {currentQuestion.blockName}
                  </span>
                  <span>
                    Pregunta <strong className="text-white">{currentQuestionIndex + 1}</strong> de <strong className="text-white">{blockQuestions.length}</strong>
                  </span>
                </div>

                {/* Question Statement */}
                <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.correctAnswerIndex;

                    let btnStyle = 'bg-[#0e0e11] border-[#27272a] text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold';
                      } else {
                        btnStyle = 'bg-[#0e0e11]/40 border-[#27272a] text-[#71717a]';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] font-bold';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-[#18181b] flex items-center justify-center shrink-0 text-xs font-bold text-[#e4e4e7]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-snug">{option}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Next Button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#27272a]">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        selectedOption !== null
                          ? 'bg-[#d4af37] hover:bg-[#b8962d] text-black shadow-md'
                          : 'bg-[#18181b] text-[#71717a] cursor-not-allowed'
                      }`}
                    >
                      Confirmar Respuesta
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 ml-auto shadow-md cursor-pointer"
                    >
                      <span>
                        {currentQuestionIndex + 1 < blockQuestions.length ? 'Siguiente Pregunta' : 'Finalizar Bloque'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Explanation Box when Answered */}
                {isAnswerSubmitted && (
                  <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#d4af37] flex items-center gap-1.5 uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" /> Explicación Jurídica
                      </span>
                      <span className="font-mono text-emerald-400 text-[11px]">
                        {currentQuestion.legalReference}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#e4e4e7] leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Quiz Completed View */
            <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-8 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 bg-[#d4af37]/20 text-[#d4af37] rounded-full flex items-center justify-center mx-auto border border-[#d4af37]/40">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">
                  ¡Bloque Completado!
                </h3>
                <p className="text-sm text-[#a1a1aa]">
                  Has finalizado todas las preguntas del {blocks.find((b) => b.id === selectedBlock)?.name}.
                </p>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] p-4 rounded-xl max-w-sm mx-auto space-y-1">
                <div className="text-xs text-[#a1a1aa]">Resultado Registrado</div>
                <div className="text-3xl font-bold text-[#d4af37]">
                  {progress.quizScores[selectedBlock] || 0} / {blockQuestions.length} Correctas
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Volver a Rendir este Bloque</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Repaso activo de errores */
        <ErrorReview progress={progress} onResolveError={onResolveError} />
      )}
    </div>
  );
};
