import React from 'react';
import { BookOpen, Award, CheckCircle2, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progressPercent,
  completedLessonsCount,
  totalLessonsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: BookOpen },
    { id: 'manual', label: 'Manual Completo', icon: BookOpen },
    { id: 'lessons', label: 'Temario Oficial', icon: GraduationCap },
    { id: 'harddata', label: 'Datos Duros (Plazos)', icon: ShieldCheck },
    { id: 'flashcards', label: 'Tarjetas (Fichas)', icon: Award },
    { id: 'quiz', label: 'Simulacro / Quiz', icon: CheckCircle2 },
    { id: 'guarani', label: 'Guaraní', icon: Sparkles },
    { id: 'ofimatica', label: 'Ofimática', icon: BookOpen },
    { id: 'feynman', label: 'Tutor IA / Feynman', icon: Sparkles },
    { id: 'plan', label: 'Plan 6 Semanas', icon: BookOpen },
  ];

  return (
    <header className="bg-[#121216] border-b border-[#27272a] text-[#e4e4e7] sticky top-0 z-50 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4af37] text-black p-2.5 rounded-xl font-bold flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg md:text-xl font-bold tracking-wide text-[#d4af37]">
                Aula Virtual DGREC
              </h1>
              <span className="bg-[#0e0e11] text-[#d4af37] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#d4af37]/30">
                Concurso MJRC-CPIEP-08-2026
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Manual de Estudio Explicado desde Cero • Ministerio de Justicia - Paraguay
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4 bg-[#0e0e11] px-4 py-2 rounded-xl border border-[#27272a]">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-[#a1a1aa]">Progreso del Temario</div>
            <div className="text-sm font-bold text-[#d4af37]">
              {completedLessonsCount} / {totalLessonsCount} Lecciones ({progressPercent}%)
            </div>
          </div>
          <div className="w-28 sm:w-32 bg-[#27272a] h-2.5 rounded-full overflow-hidden border border-[#3f3f46]">
            <div
              className="bg-gradient-to-r from-[#d4af37] to-[#b8962d] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="bg-[#0e0e11] border-t border-[#27272a] px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-1.5 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#d4af37]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
