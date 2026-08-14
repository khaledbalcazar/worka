import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Target,
  CheckCircle2,
  Circle,
  Settings2,
  ArrowRight,
  AlertTriangle,
  Flame
} from 'lucide-react';
import {
  ExamConfig,
  PlanDay,
  daysUntil,
  formatDayLabel,
  generatePlan,
  loadExamConfig,
  phaseLabel,
  saveExamConfig,
  todayIso
} from '../lib/examPlan';
import { UserProgress } from '../types';

interface TodayPanelProps {
  progress: UserProgress;
  setActiveTab: (tab: string) => void;
  onToggleTask: (taskId: string) => void;
}

// Cuenta regresiva al examen + "qué toca hoy". Con TDAH, la parte más cara
// del estudio es decidir por dónde empezar: acá el día ya viene resuelto.
export const TodayPanel: React.FC<TodayPanelProps> = ({ progress, setActiveTab, onToggleTask }) => {
  const [config, setConfig] = useState<ExamConfig>(() =>
    typeof window !== 'undefined' ? loadExamConfig() : { examDate: null, dailyMinutes: 120 }
  );
  const [editing, setEditing] = useState(false);

  const remaining = config.examDate ? daysUntil(config.examDate) : null;
  const hasErrors = progress.errorLog.length > 0;

  const plan: PlanDay[] = useMemo(
    () => (remaining !== null && remaining >= 0 ? generatePlan(remaining + 1, hasErrors) : []),
    [remaining, hasErrors]
  );
  const todayPlan = plan[0];

  function updateConfig(next: ExamConfig) {
    setConfig(next);
    saveExamConfig(next);
  }

  // Sin fecha configurada: pedirla es lo primero.
  if (!config.examDate || editing) {
    return (
      <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm">
          <CalendarClock className="w-4 h-4" />
          ¿Cuándo es tu examen?
        </div>
        <p className="text-xs text-[#a1a1aa]">
          Con la fecha, el aula arma un plan día por día ajustado al tiempo que te queda y te dice exactamente qué
          estudiar hoy.
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[11px] text-[#a1a1aa] block mb-1">Fecha del examen</label>
            <input
              type="date"
              min={todayIso()}
              defaultValue={config.examDate ?? ''}
              onChange={(e) => updateConfig({ ...config, examDate: e.target.value || null })}
              className="bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#a1a1aa] block mb-1">Minutos por día</label>
            <input
              type="number"
              min={30}
              max={600}
              step={15}
              value={config.dailyMinutes}
              onChange={(e) => updateConfig({ ...config, dailyMinutes: Number(e.target.value) })}
              className="w-24 bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          {config.examDate && (
            <button
              onClick={() => setEditing(false)}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-4 py-2 rounded-lg text-xs"
            >
              Listo
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPast = remaining !== null && remaining < 0;
  const urgent = remaining !== null && remaining <= 14;
  const plannedMinutes = todayPlan?.tasks.reduce((a, t) => a + t.minutes, 0) ?? 0;
  const doneCount = todayPlan?.tasks.filter((t) => progress.completedStudyTasks?.includes(taskId(todayPlan, t.label))).length ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* Cuenta regresiva */}
      <div
        className={`rounded-2xl p-5 flex flex-col justify-center items-center text-center border ${
          urgent ? 'bg-[#d4af37]/10 border-[#d4af37]/50' : 'bg-[#121216] border-[#27272a]'
        }`}
      >
        <span className="text-[10px] uppercase tracking-widest text-[#a1a1aa] flex items-center gap-1.5">
          {urgent ? <Flame className="w-3 h-3 text-[#d4af37]" /> : <CalendarClock className="w-3 h-3" />}
          Faltan
        </span>
        <p className={`text-5xl font-bold font-mono ${urgent ? 'text-[#d4af37]' : 'text-white'}`}>
          {isPast ? '—' : remaining}
        </p>
        <p className="text-xs text-[#a1a1aa]">{isPast ? 'La fecha ya pasó' : remaining === 1 ? 'día' : 'días'}</p>
        <p className="text-[11px] text-[#71717a] mt-1 capitalize">{formatDayLabel(config.examDate)}</p>
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-[10px] text-[#71717a] hover:text-[#d4af37] inline-flex items-center gap-1"
        >
          <Settings2 className="w-3 h-3" /> Cambiar fecha
        </button>
      </div>

      {/* Qué toca hoy */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#d4af37]" />
              Hoy toca: {todayPlan?.title ?? 'Repaso libre'}
            </h3>
            <p className="text-[11px] text-[#71717a] mt-0.5">
              {todayPlan ? phaseLabel(todayPlan.phase) : ''} · ~{plannedMinutes} min ·{' '}
              <span className="text-[#a1a1aa]">
                {doneCount}/{todayPlan?.tasks.length ?? 0} hechas
              </span>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('plan')}
            className="text-[11px] text-[#d4af37] hover:underline inline-flex items-center gap-1"
          >
            Ver plan completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {urgent && (
          <p className="text-[11px] text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg px-3 py-2 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Queda poco: el plan está comprimido y prioriza lo que más se pregunta (Ley 1266 primero). No intentes leer
            todo — enfocate en datos duros, tarjetas y simulacros.
          </p>
        )}

        <div className="space-y-1.5">
          {todayPlan?.tasks.map((task) => {
            const id = taskId(todayPlan, task.label);
            const done = progress.completedStudyTasks?.includes(id) ?? false;
            return (
              <div
                key={id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                  done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#0e0e11]'
                }`}
              >
                <button
                  onClick={() => onToggleTask(id)}
                  className="shrink-0"
                  aria-label={done ? 'Marcar como pendiente' : 'Marcar como hecha'}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#71717a] hover:text-[#d4af37]" />
                  )}
                </button>
                <span className={`flex-1 text-xs ${done ? 'text-[#71717a] line-through' : 'text-[#d4d4d8]'}`}>
                  {task.label}
                </span>
                {task.minutes > 0 && <span className="text-[10px] text-[#71717a] shrink-0">{task.minutes}m</span>}
                {task.tab && (
                  <button
                    onClick={() => setActiveTab(task.tab!)}
                    className="text-[10px] text-[#d4af37] hover:underline shrink-0"
                  >
                    Ir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Identificador estable de una tarea del plan (fecha + etiqueta).
export function taskId(day: PlanDay, label: string): string {
  return `${day.date}::${label}`;
}
