import React, { useState } from 'react';
import { STUDY_PLAN_DAYS, INTERVIEW_QUESTIONS } from '../data/studyPlanData';
import { UserProgress } from '../types';
import { Calendar, CheckCircle2, Circle, MessageSquare, Award, Clock, ArrowRight, UserCheck } from 'lucide-react';

interface StudyPlanViewProps {
  progress: UserProgress;
  onToggleStudyDayComplete: (dayNumber: number) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  progress,
  onToggleStudyDayComplete
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'interview'>('plan');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const filteredDays = STUDY_PLAN_DAYS.filter((d) => d.weekNumber === selectedWeek);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          PARTE XVI • PLAN DE 6 SEMANAS Y GUÍA DE ENTREVISTA
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Calendario Diario de Estudio y Ensayos para la Entrevista
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          Calibrado para dedicar entre 90 y 120 minutos diarios. La consistencia diaria aiciona la memoria mucho más que estudiar todo el domingo.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a] gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('plan')}
          className={`pb-3 px-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'plan'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendario de 6 Semanas (Días 1 a 42)</span>
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`pb-3 px-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'interview'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#d4af37]" />
          <span>Guía de Entrevista Oral (4 Preguntas Modelo)</span>
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-6">
          {/* Week Selector */}
          <div className="flex items-center gap-2 overflow-x-auto bg-[#121216] p-3 rounded-xl border border-[#27272a]">
            <span className="text-xs font-bold text-[#a1a1aa] px-2">Selecciona Semana:</span>
            {[1, 2, 3, 4, 5, 6].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedWeek === w
                    ? 'bg-[#d4af37] text-black shadow-md'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                Semana {w}
              </button>
            ))}
          </div>

          {/* Days Grid */}
          <div className="space-y-4">
            {filteredDays.map((day) => {
              const isDone = progress.completedStudyDays.includes(day.dayNumber);
              return (
                <div
                  key={day.dayNumber}
                  className={`bg-[#121216] border p-5 rounded-2xl transition-all space-y-3 ${
                    isDone ? 'border-emerald-500/40 bg-[#121216]/80' : 'border-[#27272a]'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleStudyDayComplete(day.dayNumber)}
                        className="text-[#a1a1aa] hover:text-[#d4af37] transition-colors cursor-pointer"
                        title={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#71717a]" />
                        )}
                      </button>

                      <div>
                        <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block">
                          Día {day.dayNumber} • Semana {day.weekNumber}
                        </span>
                        <h3 className={`text-base font-serif font-bold ${isDone ? 'line-through text-[#71717a]' : 'text-white'}`}>
                          {day.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400 bg-[#0e0e11] px-3 py-1 rounded-lg border border-[#27272a]">
                      Objetivo: {day.objective}
                    </span>
                  </div>

                  <div className="bg-[#0e0e11] p-3.5 rounded-xl border border-[#27272a] space-y-1.5">
                    <div className="text-[11px] font-bold text-[#71717a] uppercase tracking-widest">Tareas del día:</div>
                    <ul className="list-disc list-inside text-xs text-[#a1a1aa] space-y-1">
                      {day.tasks.map((task, idx) => (
                        <li key={idx} className="leading-relaxed">{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Interview Guide View */
        <div className="space-y-6">
          <div className="bg-[#121216] border border-[#27272a] p-5 rounded-xl space-y-2">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#d4af37]" />
              Las 4 Preguntas Infalibles de la Entrevista Oral
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Ensayar estas 4 respuestas en voz alta marcará una gran diferencia frente al tribunal. Cada respuesta está estructurada con fundamentos legales reales.
            </p>
          </div>

          <div className="space-y-6">
            {INTERVIEW_QUESTIONS.map((item) => (
              <div key={item.id} className="bg-[#121216] border border-[#27272a] p-6 rounded-2xl space-y-4 shadow-lg">
                <h4 className="text-base sm:text-lg font-serif font-bold text-[#d4af37]">
                  {item.question}
                </h4>

                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-200">
                  <strong>Lo que NO debes responder:</strong> "{item.badAnswer}"
                </div>

                <div className="bg-[#0e0e11] p-4 rounded-xl border border-[#27272a] space-y-2">
                  <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block">
                    Estructura Ganadora:
                  </span>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">{item.structure}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block">
                    Respuesta Modelo Armada:
                  </span>
                  <p className="text-xs sm:text-sm text-[#e4e4e7] leading-relaxed italic font-serif">
                    "{item.modelAnswer}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
