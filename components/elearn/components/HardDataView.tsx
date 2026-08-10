import React, { useState } from 'react';
import { HARD_DATA_ITEMS, COMPETENCIA_MAP } from '../data/hardData';
import { ShieldCheck, Search, Filter, Printer, Clock, AlertTriangle, UserCheck, Hash } from 'lucide-react';

export const HardDataView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plazos' | 'competencias'>('plazos');

  const filteredItems = HARD_DATA_ITEMS.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.periodOrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.law.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.article.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredCompetencias = COMPETENCIA_MAP.filter(
    (c) =>
      c.act.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            PARTE XII • HOJA DE DATOS DUROS
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Plazos, Números Repetidos, Competencias y Sanciones
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
            Revisión intensiva para memorizar antes del examen. Todos los plazos y números del temario reunidos en un solo lugar.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#3f3f46] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#d4af37]" />
          <span>Imprimir Hoja de Datos</span>
        </button>
      </div>

      {/* Sub-tabs: Plazos y Números vs Mapa de Competencias */}
      <div className="flex border-b border-[#27272a] gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('plazos')}
          className={`pb-3 px-2 transition-all cursor-pointer ${
            activeTab === 'plazos'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Plazos, Números y Sanciones ({HARD_DATA_ITEMS.length})
        </button>
        <button
          onClick={() => setActiveTab('competencias')}
          className={`pb-3 px-2 transition-all cursor-pointer ${
            activeTab === 'competencias'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Mapa de Competencias: "¿Quién Hace Qué?" ({COMPETENCIA_MAP.length})
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121216] p-4 rounded-xl border border-[#27272a]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Filtrar por plazo, tema o artículo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {activeTab === 'plazos' && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
            <Filter className="w-4 h-4 text-[#71717a] hidden sm:block" />
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterCategory('plazo')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                filterCategory === 'plazo'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Plazos
            </button>
            <button
              onClick={() => setFilterCategory('numero')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                filterCategory === 'numero'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Números
            </button>
            <button
              onClick={() => setFilterCategory('sancion')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                filterCategory === 'sancion'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Sanciones
            </button>
          </div>
        )}
      </div>

      {/* Content Display */}
      {activeTab === 'plazos' ? (
        <div className="bg-[#121216] border border-[#27272a] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0e0e11] text-[#a1a1aa] uppercase tracking-wider text-[11px] border-b border-[#27272a]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ley / Norma</th>
                  <th className="py-3 px-4 font-semibold text-[#d4af37]">Plazo / Cifra</th>
                  <th className="py-3 px-4 font-semibold">Materia / Asunto</th>
                  <th className="py-3 px-4 font-semibold text-right">Artículo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#18181b]/60 transition-colors">
                    <td className="py-3 px-4 text-[#a1a1aa] font-medium whitespace-nowrap">
                      {item.law}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#d4af37] whitespace-nowrap bg-[#d4af37]/5">
                      {item.periodOrNumber}
                    </td>
                    <td className="py-3 px-4 text-[#e4e4e7]">{item.matter}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium whitespace-nowrap">
                      {item.article}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#71717a]">
                      No se encontraron datos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#121216] border border-[#27272a] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0e0e11] text-[#a1a1aa] uppercase tracking-wider text-[11px] border-b border-[#27272a]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Acto o Trámite</th>
                  <th className="py-3 px-4 font-semibold text-[#d4af37]">Autoridad Competente</th>
                  <th className="py-3 px-4 font-semibold text-right">Fundamento Legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredCompetencias.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-[#18181b]/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#e4e4e7]">{comp.act}</td>
                    <td className="py-3.5 px-4 font-bold text-[#d4af37] bg-[#d4af37]/5 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <span>{comp.authority}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                      {comp.rule}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
