import React, { useState } from 'react';
import { OFIMATICA_ITEMS } from '../data/ofimaticaData';
import { BookOpen, CheckSquare, Square, FileText, Table, Monitor, Mail, Search } from 'lucide-react';

export const OfimaticaView: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<string>('Word');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCheck = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const apps = [
    { id: 'Word', label: 'Microsoft Word', icon: FileText },
    { id: 'Excel', label: 'Microsoft Excel', icon: Table },
    { id: 'PowerPoint', label: 'PowerPoint', icon: Monitor },
    { id: 'Outlook', label: 'Outlook', icon: Mail }
  ];

  const filteredItems = OFIMATICA_ITEMS.filter((item) => {
    const matchesApp = item.app === selectedApp;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.routeOrShortcut && item.routeOrShortcut.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesApp && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          PARTE XIV • HABILIDADES OFIMÁTICAS
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Checklist de Comandos, Atajos y Fórmulas
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          La mejor forma de aprender ofimática es ejecutando cada comando directamente en la computadora. Revisa cada casilla a medida que practiques.
        </p>
      </div>

      {/* App Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {apps.map((app) => {
          const Icon = app.icon;
          const isSelected = selectedApp === app.id;
          return (
            <button
              key={app.id}
              onClick={() => setSelectedApp(app.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold shadow-md'
                  : 'bg-[#121216] border-[#27272a] text-[#e4e4e7] hover:bg-[#18181b]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-[#d4af37]'}`} />
              <span className="text-xs sm:text-sm font-semibold">{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Progress */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121216] p-4 rounded-xl border border-[#27272a]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a]" />
          <input
            type="text"
            placeholder={`Buscar en ${selectedApp}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="text-xs font-semibold text-[#e4e4e7]">
          Prácticas marcadas: <strong className="text-[#d4af37]">{checkedIds.length}</strong> / {OFIMATICA_ITEMS.length}
        </div>
      </div>

      {/* Items Checklist Grid */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`bg-[#121216] border p-4 rounded-xl transition-all cursor-pointer flex items-start gap-4 ${
                isChecked
                  ? 'border-emerald-500/50 bg-[#121216]/90'
                  : 'border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(item.id);
                }}
                className="mt-0.5 text-[#a1a1aa] hover:text-[#d4af37] cursor-pointer"
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-[#71717a]" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className={`text-sm font-bold ${isChecked ? 'line-through text-[#71717a]' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  {item.routeOrShortcut && (
                    <span className="font-mono text-xs bg-[#0e0e11] px-2.5 py-1 rounded text-[#d4af37] border border-[#27272a]">
                      {item.routeOrShortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
