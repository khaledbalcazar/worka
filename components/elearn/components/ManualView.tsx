import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Loader2 } from 'lucide-react';
import { Block, ManualBlocks, blocksToPlainText } from './ManualBlocks';

interface ManualPart {
  id: string;
  title: string;
  blocks: Block[];
}

// Lector del Manual de Estudio COMPLETO — extraído del .docx oficial, con
// estructura real (encabezados, listas, tablas, citas y diagramas).
export const ManualView: React.FC = () => {
  const [parts, setParts] = useState<ManualPart[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/e-learn/manual')
      .then((r) => r.json())
      .then((d) => {
        if (d.parts) {
          setParts(d.parts);
          setActiveId(d.parts[0]?.id ?? '');
        } else setError(d.error || 'No se pudo cargar el manual.');
      })
      .catch(() => setError('Error de conexión al cargar el manual.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter(
      (p) => p.title.toLowerCase().includes(q) || blocksToPlainText(p.blocks).toLowerCase().includes(q)
    );
  }, [parts, query]);

  const active = parts.find((p) => p.id === activeId) ?? filtered[0];

  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 text-[#a1a1aa] py-20">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando el manual completo…
      </div>
    );
  if (error) return <div className="card p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-[#d4af37] text-black p-2 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#d4af37]">Manual de Estudio Completo</h2>
          <p className="text-xs text-[#a1a1aa]">Texto íntegro del manual oficial · {parts.length} partes</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en todo el manual…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0e0e11] border border-[#27272a] text-[#e4e4e7] text-sm outline-none focus:border-[#d4af37]/50"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Índice */}
        <nav className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-2 h-fit lg:sticky lg:top-24 max-h-[70vh] overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                active?.id === p.id
                  ? 'bg-[#d4af37]/15 text-[#d4af37]'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1f] hover:text-[#e4e4e7]'
              }`}
            >
              {p.title}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-[#71717a] px-3 py-2">Sin resultados.</p>}
        </nav>

        {/* Contenido */}
        <article className="bg-[#121216] border border-[#27272a] rounded-xl p-6 max-h-[75vh] overflow-y-auto">
          {active && (
            <>
              <h3 className="font-serif text-xl font-bold text-[#d4af37] mb-4 pb-3 border-b border-[#27272a]">
                {active.title}
              </h3>
              <div className="text-[0.95rem]">
                <ManualBlocks blocks={active.blocks} />
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
};
