import React from 'react';
import { BookOpen, ShieldCheck, Award, CheckCircle2, Sparkles, ArrowRight, Clock, Target, Calendar, AlertCircle } from 'lucide-react';
import { UserProgress } from '../types';
import { TodayPanel } from './TodayPanel';

interface DashboardViewProps {
  progress: UserProgress;
  setActiveTab: (tab: string) => void;
  totalLessonsCount: number;
  onToggleStudyTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  setActiveTab,
  totalLessonsCount,
  onToggleStudyTask
}) => {
  const completedLessons = progress.completedLessons.length;
  const progressPercent = Math.round((completedLessons / totalLessonsCount) * 100);
  const masteredFlashcards = progress.masteredFlashcards.length;
  const totalErrors = progress.errorLog.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Cuenta regresiva al examen y plan del día */}
      <TodayPanel progress={progress} setActiveTab={setActiveTab} onToggleTask={onToggleStudyTask} />

      {/* Hero Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Método Explicado desde Cero • Nivel A y B
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Preparación Integral para el Concurso Público del Registro del Estado Civil
          </h1>

          <p className="text-[#a1a1aa] text-sm sm:text-base leading-relaxed">
            Plataforma diseñada para aprender en pocos días todo el temario oficial del Concurso <strong className="text-[#e4e4e7]">MJRC-CPIEP-08-2026</strong> (Dirección de Documentación Central, DGREC). Inicia desde la Constitución Nacional hasta la Ofimática y el idioma Guaraní.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('lessons')}
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-5 py-2.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Empezar Temario Oficial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] font-medium px-5 py-2.5 rounded-xl border border-[#3f3f46] transition-all text-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Rendir Simulacro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Methodology Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4" />
          Metodología de Estudio en 3 Niveles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0e0e11] p-4 rounded-lg border border-[#27272a]">
            <span className="font-bold text-[#d4af37] block mb-1">Nivel 1: En Palabras Simples</span>
            <p className="text-[#a1a1aa]">La idea explicada como se la contarías a un amigo, sin jerga confusa.</p>
          </div>
          <div className="bg-[#0e0e11] p-4 rounded-lg border border-[#27272a]">
            <span className="font-bold text-emerald-400 block mb-1">Nivel 2: Texto Legal y Números</span>
            <p className="text-[#a1a1aa]">Qué dice la norma, artículos exactos, plazos y números clave a memorizar.</p>
          </div>
          <div className="bg-[#0e0e11] p-4 rounded-lg border border-[#27272a]">
            <span className="font-bold text-cyan-400 block mb-1">Nivel 3: Ejemplo del Mostrador</span>
            <p className="text-[#a1a1aa]">Una situación real de atención al público donde esa norma se aplica.</p>
          </div>
        </div>
      </div>

      {/* Student Progress Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#a1a1aa] text-xs">
            <span>Lecciones Leídas</span>
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-bold text-white">{completedLessons} / {totalLessonsCount}</div>
          <div className="text-xs text-[#d4af37] font-medium">{progressPercent}% completado</div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#a1a1aa] text-xs">
            <span>Fichas Dominadas</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{masteredFlashcards}</div>
          <div className="text-xs text-[#71717a]">Repetición espaciada</div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#a1a1aa] text-xs">
            <span>Libreta de Errores</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalErrors}</div>
          <div className="text-xs text-[#71717a]">Preguntas a reforzar</div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#a1a1aa] text-xs">
            <span>Plan de Estudio</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{progress.completedStudyDays.length} / 42</div>
          <div className="text-xs text-[#71717a]">Días completados</div>
        </div>
      </div>

      {/* Feature Grid / Quick Access Modules */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d4af37]" />
          Módulos de Aprendizaje Rápido
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            onClick={() => setActiveTab('lessons')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-[#d4af37]/10 text-[#d4af37] rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-[#d4af37] transition-colors">
                1. Temario Oficial Explicado
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Desde la Constitución Nacional de 1992, Ley 7445/2025, Ley 1266/87, Decretos y Código Civil.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#d4af37] flex items-center gap-1 pt-1">
              Ver lecciones <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('harddata')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-emerald-300 transition-colors">
                2. Hoja de Datos Duros
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Tabla de plazos (24h, 48h, 7d, 12-36h, 30/60d), números repetidos, matriz de quién hace qué y sanciones.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-1">
              Consultar plazos <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('flashcards')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-cyan-300 transition-colors">
                3. Tarjetas de Memoria (Leitner)
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Sistema de fichas de recuerdo activo. Practica preguntas de ida y vuelta para no olvidar los datos.
              </p>
            </div>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 pt-1">
              Repasar tarjetas <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('quiz')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-indigo-300 transition-colors">
                4. Banco de Preguntas y Simulacros
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Más de 200 preguntas divididas en Bloques A a J con explicaciones de respuestas e historial de errores.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1 pt-1">
              Iniciar prueba <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('guarani')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-purple-300 transition-colors">
                5. Laboratorio de Guaraní
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Aprende la regla po-teĩ de números, días, meses, pronombres Ñande vs Ore y las frases de ventanilla.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 pt-1">
              Practicar Guaraní <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('feynman')}
            className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/60 p-5 rounded-xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center group-hover:bg-rose-500 group-hover:text-black transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#e4e4e7] group-hover:text-rose-300 transition-colors">
                6. Tutor IA & Evaluador Feynman
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Explica un tema con tus palabras y obtén evaluación con IA en tiempo real o consulta dudas jurídicas.
              </p>
            </div>
            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1 pt-1">
              Probar Tutor IA <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
