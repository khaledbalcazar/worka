import React, { useMemo, useState } from 'react';
import { QUIZ_BANK } from '../data/quizBank';
import { UserProgress } from '../types';
import { AlertCircle, CheckCircle2, XCircle, PartyPopper, RotateCw, Target } from 'lucide-react';

interface ErrorReviewProps {
  progress: UserProgress;
  onResolveError: (questionId: string) => void;
}

// Repaso ACTIVO de los fallos del simulacro: en vez de releer la respuesta
// correcta (que es lo que menos rinde), se vuelve a responder la pregunta.
// Si la acertás, sale del cuaderno; si la fallás, se queda para otra vuelta.
export const ErrorReview: React.FC<ErrorReviewProps> = ({ progress, onResolveError }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [stats, setStats] = useState({ ok: 0, fail: 0 });

  // Cola congelada al abrir, para que al resolver una pregunta las demás no
  // se corran de lugar. Se vuelve a tomar al pedir otra vuelta.
  const [queueIds, setQueueIds] = useState<string[]>(() => progress.errorLog.map((e) => e.questionId));

  function anotherRound() {
    setQueueIds(progress.errorLog.map((e) => e.questionId));
    setIndex(0);
    setSelected(null);
    setStats({ ok: 0, fail: 0 });
  }

  const questions = useMemo(
    () => queueIds.map((id) => QUIZ_BANK.find((q) => q.id === id)).filter((q) => !!q),
    [queueIds]
  );

  const current = questions[index];
  const answered = selected !== null;
  const isCorrect = answered && current && selected === current.correctAnswerIndex;

  function answer(optionIndex: number) {
    if (answered || !current) return;
    setSelected(optionIndex);
    const correct = optionIndex === current.correctAnswerIndex;
    setStats((s) => ({ ok: s.ok + (correct ? 1 : 0), fail: s.fail + (correct ? 0 : 1) }));
    // Solo sale del cuaderno si esta vez la acertó.
    if (correct) onResolveError(current.id);
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  // Sin errores registrados todavía.
  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <Header count={0} />
        <div className="bg-[#121216] border border-[#27272a] p-8 rounded-xl text-center text-[#71717a] text-sm">
          Todavía no tenés errores registrados. Rendí pruebas por bloques y los fallos van a aparecer acá
          automáticamente para que los repases.
        </div>
      </div>
    );
  }

  // Cola terminada.
  if (index >= questions.length) {
    const pending = progress.errorLog.length;
    return (
      <div className="space-y-4">
        <Header count={pending} />
        <div className="bg-[#121216] border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
          <PartyPopper className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold text-white">Repaso de errores terminado</h3>
          <p className="text-sm text-[#a1a1aa]">
            Acertaste <strong className="text-emerald-400">{stats.ok}</strong> y fallaste{' '}
            <strong className="text-red-400">{stats.fail}</strong> de {questions.length}.
          </p>
          <p className="text-xs text-[#71717a]">
            {pending === 0
              ? 'Vaciaste el cuaderno de errores. Excelente señal para el examen.'
              : `Quedan ${pending} en el cuaderno: las que volviste a fallar siguen ahí para otra vuelta.`}
          </p>
          {pending > 0 && (
            <button
              onClick={anotherRound}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Otra vuelta
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header count={progress.errorLog.length} />

      <div className="flex items-center justify-between text-xs text-[#a1a1aa] px-1">
        <span>
          Pregunta <strong className="text-white">{index + 1}</strong> de{' '}
          <strong className="text-white">{questions.length}</strong>
        </span>
        <span className="font-mono text-emerald-400 text-[11px]">{current.legalReference}</span>
      </div>

      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 sm:p-6 space-y-4">
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{current.blockName}</span>
        <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">{current.question}</h4>

        <div className="space-y-2">
          {current.options.map((opt, oi) => {
            const correct = oi === current.correctAnswerIndex;
            const chosen = selected === oi;
            let cls = 'border-[#3f3f46] text-[#d4d4d8] hover:border-[#d4af37]/50';
            if (answered && correct) cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
            else if (answered && chosen && !correct) cls = 'border-red-500/60 bg-red-500/10 text-red-300';
            else if (answered) cls = 'border-[#27272a] text-[#71717a]';
            return (
              <button
                key={oi}
                onClick={() => answer(oi)}
                disabled={answered}
                className={`w-full text-left text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border transition-colors flex items-start gap-2 ${cls}`}
              >
                {answered && correct && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                {answered && chosen && !correct && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <>
            <div
              className={`rounded-lg p-3 text-xs leading-relaxed border ${
                isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/40 bg-red-500/10 text-red-200'
              }`}
            >
              <strong className="block mb-1">
                {isCorrect ? '✓ Correcta — sale del cuaderno' : '✗ Todavía no — se queda para otra vuelta'}
              </strong>
              {current.explanation}
            </div>
            <button
              onClick={next}
              className="w-full bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold py-2.5 rounded-xl text-xs"
            >
              {index + 1 < questions.length ? 'Siguiente pregunta' : 'Ver resultado'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Header: React.FC<{ count: number }> = ({ count }) => (
  <div className="bg-[#121216] border border-[#27272a] p-5 rounded-xl space-y-2">
    <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-rose-400" />
      Repaso de Errores
      {count > 0 && (
        <span className="text-[11px] font-sans font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
          {count} pendientes
        </span>
      )}
    </h3>
    <p className="text-xs text-[#a1a1aa] flex items-start gap-1.5">
      <Target className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
      Volvés a responder solo lo que fallaste. Si la acertás, la pregunta sale del cuaderno; si no, vuelve. Repasar
      esto 10 minutos por día rinde más que releer capítulos enteros.
    </p>
  </div>
);
