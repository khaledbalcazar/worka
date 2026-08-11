import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Loader2, Lightbulb, Quote } from 'lucide-react';

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'p'; text: string; style?: string }
  | { type: 'li'; text: string }
  | { type: 'callout'; tag: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'pre'; text: string }
  | { type: 'table'; rows: string[][] };

interface ManualPart {
  id: string;
  title: string;
  blocks: Block[];
}

// Agrupa bloques "li" consecutivos en una sola lista <ul>.
function groupBlocks(blocks: Block[]): (Block | { type: 'ul'; items: string[] })[] {
  const out: (Block | { type: 'ul'; items: string[] })[] = [];
  for (const b of blocks) {
    if (b.type === 'li') {
      const last = out[out.length - 1];
      if (last && last.type === 'ul') last.items.push(b.text);
      else out.push({ type: 'ul', items: [b.text] });
    } else {
      out.push(b);
    }
  }
  return out;
}

function partTextForSearch(p: ManualPart): string {
  return p.blocks
    .map((b) => {
      if (b.type === 'table') return b.rows.map((r) => r.join(' ')).join(' ');
      return 'text' in b ? b.text : '';
    })
    .join(' ');
}

function BlockRenderer({ block }: { block: ReturnType<typeof groupBlocks>[number] }) {
  switch (block.type) {
    case 'heading': {
      const level = block.level;
      const cls =
        level <= 1
          ? 'font-serif text-lg font-bold text-[#d4af37] mt-6 mb-2 first:mt-0'
          : level === 2
            ? 'font-serif text-base font-semibold text-[#e4c766] mt-5 mb-1.5'
            : 'font-serif text-sm font-semibold text-[#c9a862] mt-4 mb-1';
      return <p className={cls}>{block.text}</p>;
    }
    case 'p':
      return <p className="text-[#d4d4d8] leading-relaxed mb-3">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 space-y-1 mb-3 text-[#d4d4d8]">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className="flex gap-2.5 bg-[#d4af37]/10 border border-[#d4af37]/25 rounded-xl px-4 py-3 mb-3">
          <Lightbulb className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#d4af37] uppercase tracking-wide mb-1">
              {block.tag}
            </p>
            <p className="text-[#e4e4e7] leading-relaxed text-sm">{block.text}</p>
          </div>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="flex gap-2.5 border-l-2 border-[#3f3f46] pl-4 py-1 mb-3 italic">
          <Quote className="w-4 h-4 text-[#71717a] shrink-0 mt-1" />
          <p className="text-[#a1a1aa] leading-relaxed text-sm">{block.text}</p>
        </blockquote>
      );
    case 'pre':
      return (
        <pre className="bg-[#0a0a0c] border border-[#27272a] rounded-lg p-3 mb-3 text-xs text-[#a1a1aa] overflow-x-auto font-mono leading-relaxed whitespace-pre">
          {block.text}
        </pre>
      );
    case 'table': {
      const [head, ...body] = block.rows;
      return (
        <div className="overflow-x-auto mb-4 rounded-lg border border-[#27272a]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a1a1f]">
                {head.map((c, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-2 font-semibold text-[#d4af37] border-b border-[#27272a] whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-[#121216]' : 'bg-[#0e0e11]'}>
                  {row.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-[#d4d4d8] align-top border-b border-[#1a1a1f]">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      return null;
  }
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
      (p) => p.title.toLowerCase().includes(q) || partTextForSearch(p).toLowerCase().includes(q)
    );
  }, [parts, query]);

  const active = parts.find((p) => p.id === activeId) ?? filtered[0];
  const grouped = useMemo(() => (active ? groupBlocks(active.blocks) : []), [active]);

  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 text-[#a1a1aa] py-20">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando el manual completo…
      </div>
    );
  if (error)
    return <div className="card p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-[#d4af37] text-black p-2 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#d4af37]">
            Manual de Estudio Completo
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Texto íntegro del manual oficial · {parts.length} partes
          </p>
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
          {filtered.length === 0 && (
            <p className="text-xs text-[#71717a] px-3 py-2">Sin resultados.</p>
          )}
        </nav>

        {/* Contenido */}
        <article className="bg-[#121216] border border-[#27272a] rounded-xl p-6 max-h-[75vh] overflow-y-auto">
          {active && (
            <>
              <h3 className="font-serif text-xl font-bold text-[#d4af37] mb-4 pb-3 border-b border-[#27272a]">
                {active.title}
              </h3>
              <div className="text-[0.95rem]">
                {grouped.map((b, i) => (
                  <BlockRenderer key={i} block={b} />
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
};
